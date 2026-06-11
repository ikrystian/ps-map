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
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Fetch voivodeships
    cursor.execute("SELECT id, nazwa FROM Voivodeship")
    voivodeships = cursor.fetchall()
    voivodeship_map = {name.lower().strip(): v_id for v_id, name in voivodeships}
    print(f"Loaded {len(voivodeship_map)} voivodeships from database.")

    # 2. Fetch existing cities
    cursor.execute("SELECT id, nazwa, voivodeshipId FROM City")
    cities = cursor.fetchall()
    # Key: (city_name_lower, voivodeship_id)
    city_map = {(name.lower().strip(), v_id): c_id for c_id, name, v_id in cities}
    print(f"Loaded {len(city_map)} existing cities from database.")

    # 3. Fetch existing postal codes
    cursor.execute("SELECT code, cityId FROM PostalCode")
    postal_codes = cursor.fetchall()
    existing_postal_codes = {(code.strip(), city_id) for code, city_id in postal_codes}
    print(f"Loaded {len(existing_postal_codes)} existing postal codes from database.")

    # Read CSV and process data
    print("Reading CSV and parsing data...")
    new_cities_to_insert = []
    new_postal_codes_to_insert = []

    # To avoid duplicates in the same run
    temp_city_map = city_map.copy()
    temp_postal_codes = existing_postal_codes.copy()

    cities_added_count = 0
    postal_codes_added_count = 0

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print("Error: CSV is empty", file=sys.stderr)
            sys.exit(1)

        # Expected format: Województwo, Miejscowość, Kod pocztowy
        for line_num, row in enumerate(reader, start=2):
            if not row or len(row) < 3:
                continue
            
            woj_name = row[0].strip()
            city_name = row[1].strip()
            postal_code = row[2].strip()

            woj_lower = woj_name.lower()
            city_lower = city_name.lower()

            v_id = voivodeship_map.get(woj_lower)
            if not v_id:
                # Try handling differences in suffix or naming if any, e.g., 'województwo mazowieckie'
                cleaned_woj = woj_lower.replace("województwo", "").strip()
                v_id = voivodeship_map.get(cleaned_woj)
                if not v_id:
                    print(f"Warning (Line {line_num}): Voivodeship '{woj_name}' not found in database. Skipping.")
                    continue

            # Check if city exists
            city_key = (city_lower, v_id)
            c_id = temp_city_map.get(city_key)

            if not c_id:
                # Generate new UUID for City
                c_id = str(uuid.uuid4())
                new_cities_to_insert.append((c_id, city_name, v_id))
                temp_city_map[city_key] = c_id
                cities_added_count += 1

            # Check if postal code exists for this city
            pc_key = (postal_code, c_id)
            if pc_key not in temp_postal_codes:
                pc_id = str(uuid.uuid4())
                new_postal_codes_to_insert.append((pc_id, postal_code, c_id))
                temp_postal_codes.add(pc_key)
                postal_codes_added_count += 1

    print(f"Identified {cities_added_count} new cities and {postal_codes_added_count} new postal codes to insert.")

    # 4. Insert data in transaction
    try:
        if new_cities_to_insert:
            print("Inserting new cities...")
            cursor.executemany(
                "INSERT INTO City (id, nazwa, voivodeshipId) VALUES (?, ?, ?)",
                new_cities_to_insert
            )
        
        if new_postal_codes_to_insert:
            print("Inserting new postal codes...")
            cursor.executemany(
                "INSERT INTO PostalCode (id, code, cityId) VALUES (?, ?, ?)",
                new_postal_codes_to_insert
            )

        conn.commit()
        print("Import completed successfully!")
        print(f"Inserted cities: {cities_added_count}")
        print(f"Inserted postal codes: {postal_codes_added_count}")
    except Exception as e:
        conn.rollback()
        print(f"Error during import transaction: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
