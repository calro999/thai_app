import glob
import re

files = glob.glob('*.html')
changed_count = 0

replacements = {
    "YUI&YUTO ผู้เชี่ยวชาญด้านภาษาญี่ปุ่นและการท่องเที่ยว": "YUI & YUTO เซนเซ ผู้เชี่ยวชาญด้านภาษาญี่ปุ่น",
    "YUI&YUTO ผู้เชี่ยวชาญด้านอาหารญี่ปุ่นและภาษา": "YUI & YUTO เซนเซ",
    "YUI&YUTO ผู้เชี่ยวชาญ": "YUI & YUTO เซนเซ",
    "หวังว่าบทความนี้จะเป็นประโยชน์": "ถ้าเพื่อนๆ ชอบเนื้อหานี้ อย่าลืมนำไปฝึกใช้กันนะคะ!",
    "ในบทความนี้เราจะมาเรียนรู้": "วันนี้ YUI & YUTO เซนเซ จะพามาเจาะลึก",
    "ในบทความนี้": "ในบทเรียนนี้",
    "คุณสามารถพูดว่า": "เพื่อนๆ สามารถพูดว่า",
    "คุณสามารถใช้": "เพื่อนๆ สามารถใช้",
    "ฉันสามารถช่วย": "YUI & YUTO เซนเซ สามารถช่วย",
    "แน่นอน!": "",
    "ต่อไปนี้คือ": "มาดูกันเลย:",
    "เป็น AI": "เป็นผู้ช่วย",
    "สวัสดีครับ/ค่ะ": "สวัสดีค่ะ",
    "นี่คือ": "นี่คือ",
    "YUI&YUTO": "YUI & YUTO เซนเซ"
}

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        if old in new_content:
            new_content = new_content.replace(old, new)
            
    # Fix duplicate titles by appending unit name if not present
    if "YUI & YUTO เซนเซ เซนเซ" in new_content:
        new_content = new_content.replace("YUI & YUTO เซนเซ เซนเซ", "YUI & YUTO เซนเซ")
        
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        changed_count += 1

print(f"Fixed AI boilerplate in {changed_count} files.")
