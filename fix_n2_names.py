import os
import shutil

# 1. Rename files in listening/jlpt_n2
n2_dir = "/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n2"
for filename in os.listdir(n2_dir):
    if filename.startswith("n2_listening_"):
        new_name = filename.replace("n2_listening_", "n2_")
        old_path = os.path.join(n2_dir, filename)
        new_path = os.path.join(n2_dir, new_name)
        os.rename(old_path, new_path)
        print(f"Renamed {filename} -> {new_name}")

# 2. Create n2.json
n2_json_path = "/Users/calro/Desktop/タイ語学習アプリ/n2.json"
with open(n2_json_path, "w", encoding="utf-8") as f:
    f.write("[]")
print("Created n2.json")
