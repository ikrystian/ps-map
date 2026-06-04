import csv
from collections import defaultdict

csv_path = "/home/krystian/Projects/ps-map/cities.csv"

voivodeships = set()
cities = set()
postal_codes = set()
pairs = set()

total_rows = 0

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    print("Header:", header)
    for row in reader:
        if not row:
            continue
        total_rows += 1
        woj, miasto, kod = row
        v = woj.strip().lower()
        m = miasto.strip().lower()
        k = kod.strip()
        voivodeships.add(v)
        cities.add((m, v))
        postal_codes.add(k)
        pairs.add((m, v, k))

duplicate_count = total_rows - len(pairs)
print("Total rows in CSV:", total_rows)
print("Unique Voivodeships:", len(voivodeships))
print("Unique Cities (name, voivodeship):", len(cities))
print("Unique Postal Codes:", len(postal_codes))
print("Unique City-Voivodeship-Code triples:", len(pairs))
print("Duplicate rows count:", duplicate_count)

