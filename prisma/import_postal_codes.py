import csv
import sqlite3
import os
import uuid
import sys

def main():
    db_path = os.path.join(os.path.dirname(__file__), "dev.db")
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prisma/cities.csv")

    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Connecting to database: {db_path}")
    # Longer busy timeout: the dev server keeps a concurrent WAL connection open.
    conn = sqlite3.connect(db_path, timeout=30)
    cursor = conn.cursor()

    # 1. Fetch voivodeships
    cursor.execute("SELECT id, nazwa FROM Voivodeship")
    voivodeships = cursor.fetchall()
    voivodeship_map = {name.lower().strip(): v_id for v_id, name in voivodeships}
    print(f"Loaded {len(voivodeship_map)} voivodeships from database.")

    # 2. Fetch existing counties (powiaty)
    cursor.execute("SELECT id, nazwa, voivodeshipId FROM County")
    counties = cursor.fetchall()
    # Key: (county_name_lower, voivodeship_id)
    county_map = {(name.lower().strip(), v_id): co_id for co_id, name, v_id in counties}
    print(f"Loaded {len(county_map)} existing counties from database.")

    # 3. Fetch existing cities
    cursor.execute("SELECT id, nazwa, voivodeshipId, countyId FROM City")
    cities = cursor.fetchall()
    # Cities already linked to a county. Key: (city_name_lower, county_id)
    city_by_county = {}
    # Cities without a county yet (candidates to adopt into a powiat). Key: (city_name_lower, voivodeship_id)
    city_no_county = {}
    for c_id, name, v_id, county_id in cities:
        key_name = name.lower().strip()
        if county_id:
            city_by_county[(key_name, county_id)] = c_id
        else:
            city_no_county[(key_name, v_id)] = c_id
    print(f"Loaded {len(cities)} existing cities "
          f"({len(city_by_county)} with a powiat, {len(city_no_county)} without).")

    # 4. Fetch existing postal codes
    cursor.execute("SELECT code, cityId FROM PostalCode")
    postal_codes = cursor.fetchall()
    existing_postal_codes = {(code.strip(), city_id) for code, city_id in postal_codes}
    print(f"Loaded {len(existing_postal_codes)} existing postal codes from database.")

    # Read CSV and process data
    print("Reading CSV and parsing data...")
    new_counties_to_insert = []
    new_cities_to_insert = []
    cities_to_update = []  # (county_id, city_id) — adopt existing no-county cities into a powiat
    new_postal_codes_to_insert = []

    # Working copies to deduplicate within this run
    temp_county_map = county_map.copy()
    temp_city_by_county = city_by_county.copy()
    temp_city_no_county = city_no_county.copy()
    temp_postal_codes = existing_postal_codes.copy()

    counties_added_count = 0
    cities_added_count = 0
    cities_adopted_count = 0
    postal_codes_added_count = 0

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print("Error: CSV is empty", file=sys.stderr)
            sys.exit(1)

        # Expected format: Województwo, Powiat, Miejscowość, Kod
        for line_num, row in enumerate(reader, start=2):
            if not row or len(row) < 4:
                continue

            woj_name = row[0].strip()
            county_name = row[1].strip()
            city_name = row[2].strip()
            postal_code = row[3].strip()

            if not woj_name or not city_name:
                continue

            woj_lower = woj_name.lower()
            county_lower = county_name.lower()
            city_lower = city_name.lower()

            v_id = voivodeship_map.get(woj_lower)
            if not v_id:
                # Handle naming differences, e.g. 'województwo mazowieckie'
                cleaned_woj = woj_lower.replace("województwo", "").strip()
                v_id = voivodeship_map.get(cleaned_woj)
                if not v_id:
                    print(f"Warning (Line {line_num}): Voivodeship '{woj_name}' not found in database. Skipping.")
                    continue

            # Resolve or create county (powiat). Empty powiat -> city stays without a county.
            co_id = None
            if county_name:
                county_key = (county_lower, v_id)
                co_id = temp_county_map.get(county_key)
                if not co_id:
                    co_id = str(uuid.uuid4())
                    new_counties_to_insert.append((co_id, county_name, v_id))
                    temp_county_map[county_key] = co_id
                    counties_added_count += 1

            # Resolve or create city, scoped to its powiat when available
            c_id = None
            if co_id:
                c_id = temp_city_by_county.get((city_lower, co_id))

            if not c_id:
                # Adopt an existing city that has no powiat yet (created via admin/seed)
                no_county_key = (city_lower, v_id)
                adopt_id = temp_city_no_county.get(no_county_key)
                if adopt_id and co_id:
                    c_id = adopt_id
                    cities_to_update.append((co_id, c_id))
                    temp_city_by_county[(city_lower, co_id)] = c_id
                    del temp_city_no_county[no_county_key]
                    cities_adopted_count += 1
                else:
                    # Create a brand new city under this powiat (countyId may be None)
                    c_id = str(uuid.uuid4())
                    new_cities_to_insert.append((c_id, city_name, v_id, co_id))
                    if co_id:
                        temp_city_by_county[(city_lower, co_id)] = c_id
                    else:
                        temp_city_no_county[(city_lower, v_id)] = c_id
                    cities_added_count += 1

            # Resolve or create postal code for this city
            if postal_code:
                pc_key = (postal_code, c_id)
                if pc_key not in temp_postal_codes:
                    pc_id = str(uuid.uuid4())
                    new_postal_codes_to_insert.append((pc_id, postal_code, c_id))
                    temp_postal_codes.add(pc_key)
                    postal_codes_added_count += 1

    print(f"Identified {counties_added_count} new counties, "
          f"{cities_added_count} new cities, {cities_adopted_count} adopted cities, "
          f"and {postal_codes_added_count} new postal codes to insert.")

    # 5. Insert data in dependency order within a single transaction
    try:
        if new_counties_to_insert:
            print("Inserting new counties (powiaty)...")
            cursor.executemany(
                "INSERT INTO County (id, nazwa, voivodeshipId) VALUES (?, ?, ?)",
                new_counties_to_insert
            )

        if new_cities_to_insert:
            print("Inserting new cities...")
            cursor.executemany(
                "INSERT INTO City (id, nazwa, voivodeshipId, countyId) VALUES (?, ?, ?, ?)",
                new_cities_to_insert
            )

        if cities_to_update:
            print("Linking existing cities to their powiat...")
            cursor.executemany(
                "UPDATE City SET countyId = ? WHERE id = ?",
                cities_to_update
            )

        if new_postal_codes_to_insert:
            print("Inserting new postal codes...")
            cursor.executemany(
                "INSERT INTO PostalCode (id, code, cityId) VALUES (?, ?, ?)",
                new_postal_codes_to_insert
            )

        conn.commit()
        print("Import completed successfully!")
        print(f"Inserted counties: {counties_added_count}")
        print(f"Inserted cities: {cities_added_count}")
        print(f"Adopted cities (linked to powiat): {cities_adopted_count}")
        print(f"Inserted postal codes: {postal_codes_added_count}")
    except Exception as e:
        conn.rollback()
        print(f"Error during import transaction: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
