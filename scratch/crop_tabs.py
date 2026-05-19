from PIL import Image

def crop_tabs():
    img_path = "/home/krystian/Projects/ps-map/public/home_page_page-1.png"
    out_path = "/home/krystian/Projects/ps-map/public/slices/recommended-tabs.png"
    
    img = Image.open(img_path)
    # The image is 3556x15271.
    # The tabs are at yMin around 4280 in PDF points.
    # Let's map it: 4280 * 1.38888 = 5944 pixels.
    # Let's crop from x=800 to x=2800, y=5850 to y=6150.
    
    box = (800, 5850, 2800, 6150)
    cropped = img.crop(box)
    cropped.save(out_path)
    print("Saved recommended-tabs.png")

if __name__ == "__main__":
    crop_tabs()
