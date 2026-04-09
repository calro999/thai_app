import os
import re

WORKSPACE_DIR = '/Users/calro/Desktop/jlpt_thai_app'

# 1. AI表現の置換
REPLACEMENTS = {
    "と言えるでしょう": "と言えます",
    "をご紹介します": "を解説します",
    "いかがでしょうか": "ぜひ参考にしてください",
    "まとめとして": "結論として",
    "ぜひ活用してください": "活用することが合格への近道です"
}

# 2. タイトルの最適化マップ (カニバリズム対策)
TITLE_OPTIMIZATION = {
    "jlpt-n3-kanji-reading-practice-part2.html": "คอร์สเรียน N3 Part 2: เจาะลึกคันจิและการอ่านออกเสียงที่พบบ่อย",
    "jlpt-n3-practical-japanese-phrases-part4.html": "คอร์สเรียน N3 Part 4: ประโยคภาษาญี่ปุ่นใช้จริงในชีวิตประจำวัน",
    "jlpt-n3-sentence-structure-drill-part3.html": "คอร์สเรียน N3 Part 3: ฝึกโครงสร้างประโยคและการเรียงลำดับคำ",
    "jlpt-n3-vocab-grammar-analysis-part1.html": "คอร์สเรียน N3 Part 1: วิเคราะห์คำศัพท์และไวยากรณ์พื้นฐาน N3",
    "jlpt-n4-common-phrases-analysis-part3.html": "คอร์สเรียน N4 Part 3: สำนวนที่พบบ่อยและเทคนิคการทำข้อสอบ",
    "jlpt-n4-essential-japanese-expressions-part4.html": "คอร์สเรียน N4 Part 4: รวมประโยคจำเป็นสำหรับการสอบ JLPT N4",
    "jlpt-n4-grammar-vocabulary-breakdown-part1.html": "คอร์สเรียน N4 Part 1: เจาะลึกไวยากรณ์และคำศัพท์ระดัับพื้นฐาน",
    "jlpt-n4-kanji-reading-listening-part2.html": "คอร์สเรียน N4 Part 2: ฝึกการอ่านคันจิและการฟังสำหรับ N4",
    "jlpt-n5-basic-grammar-vocabulary-part1.html": "คอร์สเรียน N5 Part 1: ปูพื้นฐานไวยากรณ์และคำศัพท์ N5 อย่างละเอียด",
    "jlpt-n5-common-phrases-analysis-part3.html": "คอร์สเรียน N5 Part 3: วิเคราะห์สำนวนพื้นฐานที่ต้องรู้ก่อนสอบ",
    "jlpt-n5-essential-japanese-expressions-part4.html": "คอร์สเรียน N5 Part 4: รวมประโยคภาษาญี่ปุ่นที่ใช้บ่อยในชีวิตจริง",
    "jlpt-n5-kanji-reading-listening-part2.html": "คอร์สเรียน N5 Part 2: การอ่านคันจิเบื้องต้นและการฝึกฟัง N5",
    "jlpt-n1-advanced-japanese-idioms-part2.html": "คอร์สเรียน N1 Part 2: สำนวนภาษาญี่ปุ่นระดับสูงและการใช้จริง",
    "jlpt-n1-complex-grammar-patterns-part3.html": "คอร์สเรียน N1 Part 3: โครงสร้างไวยากรณ์ซับซ้อนระดับ Expert",
    "jlpt-n1-exam-mastery-strategies-part6.html": "คอร์スเรียน N1 Part 6: กลยุทธ์พิชิตข้อสอบ N1 ขั้นสุดยอด",
    "jlpt-n1-high-level-listening-drills-part4.html": "คอร์สเรียน N1 Part 4: ฝึกทักษะการฟังระดับสูงเทียบเท่า Native",
    "jlpt-n1-native-level-expressions-part5.html": "คอร์สเรียน N1 Part 5: รวมสำนวนระดับเจ้าของภาษาที่ออกสอบบ่อย",
    "jlpt-n1-reading-vocabulary-analysis-part1.html": "คอร์สเรียน N1 Part 1: วิเคราะห์คำศัพท์ระดับสูงและการอ่านเชิงลึก"
}

def apply_optimizations():
    html_files = [f for f in os.listdir(WORKSPACE_DIR) if f.endswith('.html')]
    
    for file_name in html_files:
        path = os.path.join(WORKSPACE_DIR, file_name)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated_content = content
        
        # AI表現の置換
        for old, new in REPLACEMENTS.items():
            updated_content = updated_content.replace(old, new)
            
        # タイトルの置換 (Title and H1)
        if file_name in TITLE_OPTIMIZATION:
            new_title = TITLE_OPTIMIZATION[file_name]
            # <title>タグの置換
            updated_content = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', updated_content)
            # <h1>タグの置換
            updated_content = re.sub(r'<h1>.*?</h1>', f'<h1>{new_title}</h1>', updated_content)
        
        # インラインCSSの色の不整合チェック (背景白に文字白などがないか)
        # 簡易的に background: #fff と color: #fff が近くにないかチェック（実際には難しいので目視優先だが）
        
        if updated_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f" Optimized: {file_name}")

if __name__ == "__main__":
    apply_optimizations()
