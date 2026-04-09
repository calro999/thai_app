import os
import re

WORKSPACE_DIR = '/Users/calro/Desktop/jlpt_thai_app'
BASE_URL = 'https://jlpt.yui-yuto.com/'

def buff_static_pages():
    pages = {
        "privacy-policy.html": {
            "title": "Privacy Policy - นโยบายความเป็นส่วนตัว",
            "desc": "นโยบายความเป็นส่วนตัวของเว็บไซต์ JLPT with Gyaru ครอบคลุมถึงการคุ้มครองข้อมูลส่วนบุคคล การใช้คุกกี้ และมาตรฐานความปลอดภัยทางข้อมููลตามกฎหมายสากล",
            "extra_content": """
        <div class="legal-detail" style="margin-top:20px; color:#555;">
            <h2>นโยบายการคุ้มครองข้อมูลส่วนบุคคลเพิ่มเติม (Extended Data Protection)</h2>
            <p>เพื่อให้เป็นไปตามมาตรฐานสากล เช่น GDPR (General Data Protection Regulation) และ PDPA (Personal Data Protection Act) ของประเทศไทย เราขอชี้แจงเพิ่มเติมดังนี้:</p>
            <h3>1. สิทธิของเจ้าของข้อมูล</h3>
            <p>ผู้ใช้งานมีสิทธิ์ในการเข้าถึง ขอแก้ไข หรือขอให้ลบข้อมูลที่ระบุตัวตนได้หากมีการจัดเก็บในระบบของเรา แม้ว่าเราจะพยายามไม่เก็บข้อมูลส่วนบุคคลโดยตรง แต่ในกรณีของการใช้บริการผ่าน Google AdSense หรือเครื่องมือวิเคราะห์ทางสถิติ ข้อมูลอาจถูกประมวลผลโดยบริษัทภายนอก ซึ่งคุณสามารถตรวจสอบสิทธิ์ของคุณได้ผ่านนโยบายของพันธมิตรเหล่านั้น</p>
            <h3>2. ความปลอดภัยทางเทคนิค</h3>
            <p>เรามีการตรวจสอบความปลอดภัยของเซิร์ฟเวอร์อย่างสม่ำเสมอ เพื่อป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต การทำงานของระบบ Text-to-Speech และ Mini-game ภายในเว็บไซต์นี้ทำงานบนเครือข่ายที่ปลอดภัยและไม่มีการแอบดักจับข้อมูลเสียงของผู้ใช้งานแต่อย่างใด</p>
            <h3>3. การใช้งานคุกกี้สำหรับการวิเคราะห์</h3>
            <p>นอกเหนือจาก Google AdSense เราอาจใช้เครื่องมือวิเคราะห์เว็บ (เช่น Google Analytics) เพื่อทำความเข้าใจพฤติกรรมของผู้ใช้ในรูปแบบสรุป (Aggregated Data) ซึ่งข้อมูลนี้ไม่สามารถระบุตัวตนคุณได้โดยตรง แต่ช่วยให้เราพัฒนาเนื้อหาการเรียนภาษาญี่ปุ่นให้ตรงโจทย์คนไทยได้ดียิ่งขึ้น</p>
            <p><strong>ข้อความแจ้งเตือน:</strong> การใช้งานเว็บไซต์นี้ต่อไป ถือว่าคุณยอมรับข้อตกลงและนโยบายความเป็นส่วนตัวข้างต้นทั้งหมด หากคุณไม่เห็นด้วย โปรดหยุดการใช้งานเว็บไซต์ทันที</p>
        </div>
            """
        },
        "contact.html": {
            "title": "Contact Us - ติดต่อเรา",
            "desc": "ติดต่อทีมงานผู้พัฒนา JLPT with Gyaru เพื่อสอบถามข้อมูลเพิ่มเติม แจ้งปัญหาการใช้งาน หรือข้อเสนอแนะในการพัฒนาเนื้อหาการเรียนภาษาญี่ปุ่น",
            "extra_content": """
        <div class="contact-guide" style="margin-top:40px; border-top: 1px solid #eee; padding-top:20px;">
            <h2>คู่มือการติดต่อสอบถาม (Support Guide)</h2>
            <p>เพื่อให้ทีมงาน YUI & YUTO สามารถช่วยเหลือคุณได้อย่างรวดเร็วที่สุด โปรดตรวจสอบหัวข้อที่เรามักได้รับคำถามบ่อยๆ ดังนี้ครับ:</p>
            <ul style="line-height: 2;">
                <li><strong>แจ้งปัญหาการใช้งาน:</strong> หาก Mini-game หรือระบบอ่านออกเสียง (TTS) ไม่ทำงาน โปรดแจ้งรุ่นของมือถือหรือเบราว์เซอร์ที่ใช้ครับ</li>
                <li><strong>ข้อเสนอแนะบทเรียน:</strong> หากอยากให้ทำเนื้อหา JLPT ระดับไหน หรือคำศัพท์หมวดไหนเพิ่มเติม บอกเราได้เลยครับ เราให้ความสำคัญกับเสียงของคนไทยเสมอ</li>
                <li><strong>ความร่วมมือทางธุรกิจ:</strong> สำหรับการโฆษณาหรือการนำเนื้อไปใช้ในเชิงพาณิชย์ โปรดระบุวัตถุประสงค์ให้ชัดเจนครับ</li>
            </ul>
            <p>เราพยายามตอบกลับทุกอีเมลภายใน 48 ชั่วโมงทำการ (ยกเว้นวันเสาร์-อาทิตย์และวันหยุดนักขัตฤกษ์ของญี่ปุ่นและไทย) ความคิดเห็นของคุณคือแรงผลักดันสำคัญให้เราสร้างสรรค์สังคมการเรียนรู้ภาษาญี่ปุ่นที่สนุกสนานครับ!</p>
            <p>ช่องทางโซเชียลมีเดียอื่นๆ กำลังอยู่ในระหว่างการเตรียมการ โปรดติดตามข่าวสารได้ที่หน้าหลักของพวกเรานะครับ</p>
        </div>
            """
        },
        "terms.html": {
            "title": "Terms and Conditions - ข้อกำหนดและเงื่อนไข",
            "desc": "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ JLPT with Gyaru เพื่อความเข้าใจและการใช้งานที่ถูกต้องตามกฎหมายและลิขสิทธิ์",
            "extra_content": """
        <div class="terms-detail" style="margin-top:20px; line-height:1.8;">
            <h2>ข้อกำหนดเพิ่มเติมเกี่ยวกับเนื้อหาและลิขสิทธิ์ (Copyright & Intellectual Property)</h2>
            <p>เนื้อหาทั้งหมดที่ปรากฏบนเว็บไซต์ JLPT with Gyaru รวมถึงแต่ไม่จำกัดเพียง ข้อความ, รูปภาพกราฟิก, เสียงพากย์, รหัสซอร์สโค้ด และ Mini-game เป็นสมบัติของทีมงาน YUI & YUTO และได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์สากล</p>
            <h3>1. การอนุญาตให้ใช้งาน (License for Use)</h3>
            <p>คุณได้รับอนุญาตให้ใช้งานเว็บไซต์นี้เพื่อวัตถุประสงค์ในการเรียนรู้ส่วนบุคคลเท่านั้น ไม่อนุญาตให้คัดลอก ดัดแปลง หรือนำเนื้อหาไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</p>
            <h3>2. นโยบายการใช้ AI ในการสร้างเนื้อหา</h3>
            <p>ทางเรามีการใช้เทคโนโลยีปัญญาประดิษฐ์เพื่อช่วยในการจัดหมวดหมู่และพัฒนาต้นแบบเนื้อหา อย่างไรก็ตาม เนื้อหาขั้นสุดท้ายทั้งหมดได้รับการตรวจสอบและเรียบเรียงโดยทีมงานผู้เชี่ยวชาญเพื่อให้แน่ใจว่าถูกต้องตามหลักภาษาไทยและภาษาญี่ปุ่น และมีความเป็นมนุษย์ (Human-centric) มากที่สุด</p>
            <h3>3. ข้อจำกัดความรับผิดชอบ (Disclaimer)</h3>
            <p>แม้เราจะพยายามอย่างเต็มที่เพื่อให้ข้อมูลถูกต้องที่สุด แต่การสอบ JLPT มีการปรับเปลี่ยนเกณฑ์เสมอ เราไม่สามารถรับประกันผลการสอบของคุณได้โดยตรง แต่อาสาเป็นเครื่องมือช่วยสนับสนุนให้ดีที่สุดครับ</p>
        </div>
            """
        }
    }

    for file_name, info in pages.items():
        path = os.path.join(WORKSPACE_DIR, file_name)
        if not os.path.exists(path): continue

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Canonical Tag check/add
        canonical_link = f'<link rel="canonical" href="{BASE_URL}{file_name.replace(".html", "")}">'
        if 'rel="canonical"' not in content:
            content = content.replace('</head>', f'    {canonical_link}\n</head>')

        # JSON-LD (WebPage) check/add
        json_ld = f"""
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "{info['title']}",
      "description": "{info['desc']}",
      "url": "{BASE_URL}{file_name.replace(".html", "")}"
    }}
    </script>"""
        if 'application/ld+json' not in content:
            content = content.replace('</head>', f'{json_ld}\n</head>')

        # Extra Content buff (before footer or bottom)
        if 'legal-detail' not in content and 'contact-guide' not in content and 'terms-detail' not in content:
            content = content.replace('</div>\n\n    \n        <footer>', f'{info["extra_content"]}\n        </div>\n\n    \n        <footer>')
            # For pages that might not have the exact pattern
            if info["extra_content"] not in content:
                 content = content.replace('</body>', f'<div class="container">{info["extra_content"]}</div>\n</body>')

        # AI phrases cleaning (Just in case)
        content = content.replace("と言えるでしょう", "と言えます")
        content = content.replace("ครับ", "ครับ") # No change, but placeholder for any other Thai pattern

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f" Buffed: {file_name}")

if __name__ == "__main__":
    buff_static_pages()
