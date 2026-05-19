from PIL import Image

def crop_recommended_lawyers():
    img_path = "/home/krystian/Projects/ps-map/public/home_page_page-1.png"
    out_path = "/home/krystian/Projects/ps-map/public/recommended-lawyers-section.png"
    
    img = Image.open(img_path)
    width, height = img.size
    
    # We crop from y=5800 to y=9400 to capture the whole section perfectly.
    y_start = 5800
    y_end = 9400
    
    box = (0, y_start, width, y_end)
    section_img = img.crop(box)
    section_img.save(out_path)
    print(f"Saved recommended-lawyers-section.png from y:{y_start} to y:{y_end}")

if __name__ == "__main__":
    crop_recommended_lawyers()
