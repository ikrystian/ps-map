import re
import os

def clean_csv_specific(file_path):
    temp_file = file_path + ".tmp"
    
    # Regex: opcjonalna spacja + '(' + cokolwiek (non-greedy) + ','
    # Zamieniamy na sam przecinek
    pattern = re.compile(r'\s*\(.*?,')
    
    with open(file_path, mode='r', encoding='utf-8') as infile:
        with open(temp_file, mode='w', encoding='utf-8', newline='') as outfile:
            for line in infile:
                # Wykonujemy zamianę w całej linii
                cleaned_line = pattern.sub(',', line)
                outfile.write(cleaned_line)
    
    # Zastępujemy oryginalny plik
    os.replace(temp_file, file_path)
    print(f"Plik {file_path} został wyczyszczony wg wzorca (...,")

if __name__ == "__main__":
    target_file = "cities.csv"
    if os.path.exists(target_file):
        clean_csv_specific(target_file)
    else:
        print(f"Plik {target_file} nie istnieje.")
