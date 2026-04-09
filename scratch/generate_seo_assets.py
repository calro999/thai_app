import os
import datetime
import xml.etree.ElementTree as ET

WORKSPACE_DIR = '/Users/calro/Desktop/jlpt_thai_app'
BASE_URL = 'https://jlpt.yui-yuto.com/'

def escape_xml(text):
    if not text: return ""
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')

def get_html_files():
    files = []
    for f in os.listdir(WORKSPACE_DIR):
        if f.endswith('.html') and f not in ['google403c7037defb5219.html']:
            path = os.path.join(WORKSPACE_DIR, f)
            mtime = os.path.getmtime(path)
            date = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            files.append({'name': f, 'date': date})
    return files

def generate_sitemap(files):
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for f in files:
        url_name = f['name'].replace('.html', '')
        if url_name == 'index':
            loc = BASE_URL
        else:
            loc = f"{BASE_URL}{url_name}"
        
        sitemap_content += '  <url>\n'
        sitemap_content += f'    <loc>{escape_xml(loc)}</loc>\n'
        sitemap_content += f'    <lastmod>{f["date"]}</lastmod>\n'
        sitemap_content += '    <changefreq>weekly</changefreq>\n'
        sitemap_content += '    <priority>0.8</priority>\n'
        sitemap_content += '  </url>\n'
    
    sitemap_content += '</urlset>'
    
    with open(os.path.join(WORKSPACE_DIR, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    print(" Generated: sitemap.xml")

def generate_rss(files):
    rss_content = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rss_content += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_content += '<channel>\n'
    rss_content += f'  <title>{escape_xml("JLPT with Gyaru - สุดยอดคู่มือเรียนภาษาญี่ปุ่น")}</title>\n'
    rss_content += f'  <link>{escape_xml(BASE_URL)}</link>\n'
    rss_content += f'  <description>{escape_xml("คอร์สเรียนภาษาญี่ปุ่น JLPT N1-N5 พร้อมมินิเกมและสำนวนระดับสูงสำหรับคนไทย")}</description>\n'
    rss_content += '  <language>th</language>\n'
    
    # 最近更新された順に並べ替え（RSS用）
    files.sort(key=lambda x: x['date'], reverse=True)
    
    for f in files[:20]: # 最新20記事
        url_name = f['name'].replace('.html', '')
        loc = f"{BASE_URL}{url_name}"
        
        rss_content += '  <item>\n'
        rss_content += f'    <title>{escape_xml(f["name"].replace(".html", "").replace("-", " ").capitalize())}</title>\n'
        rss_content += f'    <link>{escape_xml(loc)}</link>\n'
        rss_content += f'    <guid>{escape_xml(loc)}</guid>\n'
        rss_content += f'    <pubDate>{f["date"]}T00:00:00+09:00</pubDate>\n'
        rss_content += '  </item>\n'
        
    rss_content += '</channel>\n</rss>'
    
    with open(os.path.join(WORKSPACE_DIR, 'rss.xml'), 'w', encoding='utf-8') as f:
        f.write(rss_content)
    print(" Generated: rss.xml")

def update_robots_txt():
    content = f"""User-agent: *
Allow: /
Disallow: /scratch/
Disallow: /images/backup/

Sitemap: {BASE_URL}sitemap.xml
Sitemap: {BASE_URL}rss.xml
"""
    with open(os.path.join(WORKSPACE_DIR, 'robots.txt'), 'w', encoding='utf-8') as f:
        f.write(content)
    print(" Updated: robots.txt")

if __name__ == "__main__":
    files = get_html_files()
    generate_sitemap(files)
    generate_rss(files)
    update_robots_txt()
