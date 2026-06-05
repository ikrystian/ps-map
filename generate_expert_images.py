#!/usr/bin/env python3
import os
import sys
import time
import sqlite3
import argparse
import tempfile
import requests
import re
import unicodedata
from PIL import Image
from io import BytesIO

# Default configuration
DEFAULT_BASE_URL = "https://ps-dev.com.pl"
NANOBANANA_API_URL = "https://api.nanobananaapi.ai/api/v1/nanobanana"

def slugify(text):
    """Converts a string to a safe directory name (slug)."""
    # Normalize unicode characters to convert letters with diacritics to ascii
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    # Keep only alphanumeric characters, spaces, hyphens, and underscores
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    # Replace spaces and multiple hyphens/underscores with a single hyphen
    text = re.sub(r'[-\s]+', '-', text)
    return text


def load_env(path=".env"):
    """Loads environment variables from a .env file."""
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

def resize_and_crop(image_bytes, target_width, target_height):
    """Resizes and crops an image to the exact target dimensions while maintaining aspect ratio."""
    img = Image.open(BytesIO(image_bytes))
    
    # Handle image mode conversion (e.g. RGBA to RGB for JPEG compatibility)
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Convert to RGBA first to handle transparency properly
        rgba = img.convert('RGBA')
        background = Image.new('RGB', rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.split()[3]) # 3 is the alpha channel
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    img_width, img_height = img.size
    img_ratio = img_width / img_height
    target_ratio = target_width / target_height

    if img_ratio > target_ratio:
        # Image is wider than target: resize based on height
        new_height = target_height
        new_width = int(new_height * img_ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop horizontally (center crop)
        left = (new_width - target_width) // 2
        top = 0
        right = left + target_width
        bottom = target_height
        img = img.crop((left, top, right, bottom))
    else:
        # Image is taller than target: resize based on width
        new_width = target_width
        new_height = int(new_width / img_ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop vertically (center crop)
        left = 0
        top = (new_height - target_height) // 2
        right = target_width
        bottom = top + target_height
        img = img.crop((left, top, right, bottom))
        
    return img

def submit_generation_task(api_key, prompt, aspect_ratio):
    """Submits a generation task to the Nanobanana API and returns the taskId."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt,
        "aspectRatio": aspect_ratio,
        "resolution": "1K",
        "googleSearch": False,
        "outputFormat": "jpg",
        "imageUrls": []
    }
    
    url = f"{NANOBANANA_API_URL}/generate-2"
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    
    result = response.json()
    if result.get("code") == 200 and "data" in result:
        return result["data"]["taskId"]
    else:
        err_msg = result.get("msg") or result.get("message") or str(result)
        raise Exception(f"Failed to submit task (code {result.get('code')}): {err_msg}")

def poll_task_status(api_key, task_id, timeout=120, interval=4):
    """Polls the task status until it succeeds or fails."""
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    url = f"{NANOBANANA_API_URL}/record-info"
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        response = requests.get(url, params={"taskId": task_id}, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        if result.get("code") == 200 and "data" in result:
            data = result["data"]
            success_flag = data.get("successFlag")
            
            if success_flag == 1: # SUCCESS
                # Get the result image URL
                resp_data = data.get("response", {})
                img_url = resp_data.get("resultImageUrl") or resp_data.get("originImageUrl")
                if img_url:
                    return img_url
                raise Exception("Task succeeded but no image URL was found in the response.")
            elif success_flag in (2, 3): # CREATE_TASK_FAILED or GENERATE_FAILED
                error_msg = data.get("errorMessage") or "Unknown generation error"
                raise Exception(f"Image generation failed on Nanobanana server: {error_msg}")
            
            # Print polling tick
            print(".", end="", flush=True)
        else:
            raise Exception(f"Invalid record-info response: {result.get('msg', 'Unknown error')}")
            
        time.sleep(interval)
        
    raise Exception(f"Task polling timed out after {timeout} seconds.")

def generate_image(api_key, prompt, aspect_ratio, target_w, target_h):
    """Wrapper that generates, polls, downloads, and resizes/crops the image."""
    print(f"  Submitting prompt to Nanobanana ({aspect_ratio}): {prompt[:60]}...")
    task_id = submit_generation_task(api_key, prompt, aspect_ratio)
    print(f"  Task ID: {task_id}. Polling status", end="", flush=True)
    
    img_url = poll_task_status(api_key, task_id)
    print(" Done!")
    print(f"  Downloading image from: {img_url}")
    
    img_response = requests.get(img_url)
    img_response.raise_for_status()
    
    print(f"  Processing image to exactly {target_w}x{target_h}px...")
    processed_img = resize_and_crop(img_response.content, target_w, target_h)
    return processed_img

def update_expert_profile(base_url, law_firm_id, logo_img, cover_img):
    """Sends the processed images via POST to the Next.js app endpoint."""
    url = f"{base_url}/api/law-firms/update-images?id={law_firm_id}"
    
    # Save images to memory buffers as JPEG
    logo_io = BytesIO()
    logo_img.save(logo_io, format="JPEG", quality=90)
    logo_io.seek(0)
    
    cover_io = BytesIO()
    cover_img.save(cover_io, format="JPEG", quality=90)
    cover_io.seek(0)
    
    files = {
        "logo": ("logo.jpg", logo_io, "image/jpeg"),
        "zdjecieGlowne": ("cover.jpg", cover_io, "image/jpeg")
    }
    data = {
        "id": law_firm_id
    }
    headers = {
        "X-Law-Firm-Id": law_firm_id
    }
    
    print(f"  Uploading images to local endpoint: {url}...")
    response = requests.post(url, data=data, files=files, headers=headers)
    
    if response.status_code != 200:
        try:
            err_json = response.json()
            err_msg = err_json.get("error") or response.text
        except Exception:
            err_msg = response.text
        raise Exception(f"Upload endpoint returned status {response.status_code}: {err_msg}")
        
    res = response.json()
    if res.get("success"):
        print("  Update successful!")
        print(f"    Logo URL: {res.get('logo')}")
        print(f"    Cover URL: {res.get('zdjecieGlowne')}")
        return True
    else:
        raise Exception(f"Upload failed: {res.get('error', 'Unknown error')}")

def main():
    parser = argparse.ArgumentParser(description="Generate expert profile logos and cover photos. Cover photo without texts!")
    parser.add_argument("--api-key", help="Nanobanana API Key (can also set NANOBANANA_API_KEY env var)")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base URL of the Next.js app (default: http://localhost:3000)")
    parser.add_argument("--limit", type=int, help="Limit number of expert profiles to process")
    parser.add_argument("--force", action="store_true", help="Force update even if the profile already has non-picsum images")
    parser.add_argument("--db-path", default="prisma/dev.db", help="Path to dev.db SQLite database")
    args = parser.parse_args()

    # Load environment variables
    load_env()

    # Determine API key
    api_key = args.api_key or os.getenv("NANOBANANA_API_KEY")
    if not api_key:
        print("Error: Nanobanana API key is missing.", file=sys.stderr)
        print("Please set the NANOBANANA_API_KEY environment variable or pass --api-key <key>.", file=sys.stderr)
        sys.exit(1)

    # Connect to SQLite database
    db_path = args.db_path
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}", file=sys.stderr)
        sys.exit(1)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Query all active law firms
    query = "SELECT id, nazwa, opis, miasto, logo, zdjecieGlowne FROM LawFirm WHERE aktywna = 1"
    if args.limit:
        query += f" LIMIT {args.limit}"
        
    cursor.execute(query)
    law_firms = cursor.fetchall()
    
    total = len(law_firms)
    print(f"Found {total} expert profiles in database.")
    
    success_count = 0
    failed_count = 0
    
    for idx, (lf_id, name, desc, city, logo_url, cover_url) in enumerate(law_firms, 1):
        print("\n" + "="*60)
        print(f"[{idx}/{total}] Processing expert: {name} (ID: {lf_id})")
        print("="*60)
        
        # Check if they already have non-placeholder images
        has_custom_logo = logo_url and "github" not in logo_url and "jsdelivr" not in logo_url and "picsum" not in logo_url
        has_custom_cover = cover_url and "picsum" not in cover_url
        
        if has_custom_logo and has_custom_cover and not args.force:
            print("  Expert already has custom images. Skipping. Use --force to override.")
            continue
            
        desc = desc or "Kancelaria Prawna i Pomoc Prawna"
        city = city or "Polska"
        
        # Prepare prompts
        logo_prompt = (
            f"A clean vector logo for a law firm named '{name}', "
            f"legal themes, scale of justice, professional corporate branding, "
            f"minimalist icon on a solid white background, 1:1 format."
        )
        
        cover_prompt = (
            f"A wide banner cover photo for a law firm named '{name}' in {city}, "
            f"description: '{desc[:100]}', professional lawyer office interior background, "
            f"elegant corporate banner, warm modern office lighting, legal theme, 21:9 format."
        )
        
        try:
            # 1. Generate Logo
            print("--- Generating Logo (400x400 px) ---")
            logo_img = generate_image(api_key, logo_prompt, "1:1", 400, 400)
            
            # 2. Generate Cover Photo
            print("--- Generating Cover Photo (1920x600 px) ---")
            cover_img = generate_image(api_key, cover_prompt, "21:9", 1920, 600)
            
            # 3. Save images locally in public/generate/[nazwakancelarii]
            folder_name = slugify(name)
            target_dir = os.path.join("public", "generate", folder_name)
            os.makedirs(target_dir, exist_ok=True)
            
            logo_path = os.path.join(target_dir, "logo.jpg")
            cover_path = os.path.join(target_dir, "cover.jpg")
            
            print(f"  Saving logo locally to: {logo_path}")
            logo_img.save(logo_path, format="JPEG", quality=90)
            
            print(f"  Saving cover photo locally to: {cover_path}")
            cover_img.save(cover_path, format="JPEG", quality=90)
            
            # 4. Update SQLite database to point to the local paths
            logo_db_path = f"/generate/{folder_name}/logo.jpg"
            cover_db_path = f"/generate/{folder_name}/cover.jpg"
            cursor.execute(
                "UPDATE LawFirm SET logo = ?, zdjecieGlowne = ? WHERE id = ?",
                (logo_db_path, cover_db_path, lf_id)
            )
            conn.commit()
            print(f"  Updated SQLite database with static paths: logo={logo_db_path}, cover={cover_db_path}")
            
            # 5. Upload to Next.js app if base-url is remote (optional sync)
            if args.base_url and "localhost" not in args.base_url and "127.0.0.1" not in args.base_url:
                print("--- Updating Profile via Remote API ---")
                update_expert_profile(args.base_url, lf_id, logo_img, cover_img)
            else:
                print("  Skipping API upload because we updated the database directly.")
                
            success_count += 1
            
        except Exception as e:
            print(f"  Error processing expert {name}: {e}", file=sys.stderr)
            failed_count += 1
            print("  Skipping to next expert...")
            
        # Cooldown sleep between experts
        time.sleep(2)

    print("\n" + "="*60)
    print("Execution completed.")
    print(f"Successfully updated: {success_count}/{total}")
    print(f"Failed/Skipped: {failed_count}/{total}")
    print("="*60)

    conn.close()

if __name__ == "__main__":
    main()
