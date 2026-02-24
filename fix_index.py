import re

INDEX_HTML_FILE = 'index.html'
BUILD_INDEX_HTML_FILE = 'gd_build/index.html'

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace Stripe text
    content = content.replace('หน้าชำระเงินของ Stripe', 'ดูวิดีโอโฆษณา')
    content = content.replace('หลังจากชำระเงินสำเร็จคุณจะสามารถเข้าเรียนได้ทันที', 'หลังจากดูจบคุณจะสามารถเข้าเรียนได้ทันที')

    target = '''<button class="mode-btn cancel" style="grid-column: span 2;" onclick="closeModeSelect()">ยกเลิก
                        (Cancel)</button>'''
    lp_btn = '''<button class="mode-btn highlight" style="grid-column: span 2; background: #FFF3E0; border-color: #FF9800; color: #E65100;" onclick="window.location.href='lp.html'">ℹ️ เกี่ยวกับแอปนี้ (About App)</button>
                    ''' + target

    if 'lp.html' not in content:
        content = content.replace(target, lp_btn)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

update_file(INDEX_HTML_FILE)
update_file(BUILD_INDEX_HTML_FILE)
print('Updated index.html safely')
