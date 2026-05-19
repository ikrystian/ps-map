import os
from PIL import Image

def slice_image():
    img_path = "/home/krystian/Projects/ps-map/public/home_page_page-1.png"
    out_dir = "/home/krystian/Projects/ps-map/public/slices"
    os.makedirs(out_dir, exist_ok=True)
    
    img = Image.open(img_path)
    width, height = img.size
    slice_height = 1000
    
    num_slices = (height + slice_height - 1) // slice_height
    for i in range(num_slices):
        y_start = i * slice_height
        y_end = min((i + 1) * slice_height, height)
        
        box = (0, y_start, width, y_end)
        slice_img = img.crop(box)
        slice_img.save(os.path.join(out_dir, f"slice_{i+1:02d}.png"))
        print(f"Saved slice_{i+1:02d}.png (y: {y_start} to {y_end})")

if __name__ == "__main__":
    slice_image()
