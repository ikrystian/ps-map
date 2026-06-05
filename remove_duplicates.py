import csv
import os

def remove_duplicates(file_path):
    temp_file_path = file_path + '.tmp'
    seen = set()
    duplicates_count = 0
    total_count = 0
    
    print(f"Reading {file_path}...")
    
    # We read with utf-8 encoding
    with open(file_path, 'r', encoding='utf-8') as infile, \
         open(temp_file_path, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        # Read and write header first
        header = next(reader, None)
        if header is not None:
            writer.writerow(header)
            
        for row in reader:
            total_count += 1
            row_tuple = tuple(row)
            if row_tuple not in seen:
                seen.add(row_tuple)
                writer.writerow(row)
            else:
                duplicates_count += 1
                
    # Replace original file with the cleaned temporary file
    os.replace(temp_file_path, file_path)
    
    print(f"Done! Processed {total_count} rows.")
    print(f"Removed {duplicates_count} duplicate rows.")
    print(f"Saved {len(seen)} unique rows to {file_path}.")

if __name__ == '__main__':
    csv_file = 'cities.csv'
    if os.path.exists(csv_file):
        remove_duplicates(csv_file)
    else:
        print(f"Error: {csv_file} not found in the current directory.")
