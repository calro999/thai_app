import os
import re
from PIL import Image

# 設定
IMAGE_DIR = 'images'
TARGET_EXTS = ('.png', '.jpg', '.jpeg')
WORKSPACE_DIR = '/Users/calro/Desktop/jlpt_thai_app'

def convert_to_webp():
    print("Converting images to WebP...")
    converted_map = {}
    for root, dirs, files in os.walk(os.path.join(WORKSPACE_DIR, IMAGE_DIR)):
        for file in files:
            if file.lower().endswith(TARGET_EXTS):
                original_path = os.path.join(root, file)
                name, ext = os.path.splitext(file)
                webp_name = f"{name}.webp"
                webp_path = os.path.join(root, webp_name)
                
                # 変換済みのマップを作成
                rel_path = os.path.relpath(original_path, WORKSPACE_DIR)
                rel_webp = os.path.relpath(webp_path, WORKSPACE_DIR)
                converted_map[rel_path] = rel_webp

                if not os.path.exists(webp_path):
                    try:
                        with Image.open(original_path) as img:
                            img.save(webp_path, 'WEBP', quality=85)
                            print(f" Converted: {file} -> {webp_name}")
                    except Exception as e:
                        print(f" Error converting {file}: {e}")
                else:
                    print(f" Skipped (already exists): {webp_name}")
    return converted_map

def update_html_files(converted_map):
    print("Updating HTML files...")
    html_files = [f for f in os.listdir(WORKSPACE_DIR) if f.endswith('.html')]
    
    # 画像ファイル名のマッピングを整理（短い名前でも置換できるよう）
    # 例: images/logo.png -> images/logo.webp
    
    for html_file in html_files:
        path = os.path.join(WORKSPACE_DIR, html_file)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        updated_content = content
        # 1. 画像パスの置換
        for original, webp in converted_map.items():
            # パスそのものを置換
            updated_content = updated_content.replace(original, webp)
            # ファイル名のみの置換（パスが相対的な場合を考慮）
            orig_name = os.path.basename(original)
            webp_name = os.path.basename(webp)
            updated_content = updated_content.replace(orig_name, webp_name)

        # 2. imgタグに loading="lazy" を追加（未設定の場合）
        def add_lazy_loading(match):
            tag = match.group(0)
            if 'loading=' not in tag:
                # 閉じタグの直前に loading="lazy" を追加
                return tag.replace('>', ' loading="lazy">')
            return tag

        updated_content = re.sub(r'<img[^>]*>', add_lazy_loading, updated_content)

        if updated_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f" Updated: {html_file}")

if __name__ == "__main__":
    cmap = convert_to_webp()
    update_html_files(cmap)
    print("Image optimization complete.")
