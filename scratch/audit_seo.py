import os
import re
from html.parser import HTMLParser

WORKSPACE_DIR = '/Users/calro/Desktop/jlpt_thai_app'

class SEOParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.results = {
            'canonical': None,
            'json_ld': False,
            'title': "",
            'description': "",
            'h1': [],
            'text_content': "",
            'in_script': False,
            'in_style': False,
            'in_title': False,
            'in_h1': False
        }

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'link' and attrs_dict.get('rel') == 'canonical':
            self.results['canonical'] = attrs_dict.get('href')
        elif tag == 'script' and attrs_dict.get('type') == 'application/ld+json':
            self.results['json_ld'] = True
            self.results['in_script'] = True
        elif tag == 'script':
            self.results['in_script'] = True
        elif tag == 'style':
            self.results['in_style'] = True
        elif tag == 'title':
            self.results['in_title'] = True
        elif tag == 'h1':
            self.results['in_h1'] = True
        elif tag == 'meta' and attrs_dict.get('name') == 'description':
            self.results['description'] = attrs_dict.get('content', '')

    def handle_endtag(self, tag):
        if tag == 'script':
            self.results['in_script'] = False
        elif tag == 'style':
            self.results['in_style'] = False
        elif tag == 'title':
            self.results['in_title'] = False
        elif tag == 'h1':
            self.results['in_h1'] = False

    def handle_data(self, data):
        if self.results['in_title']:
            self.results['title'] += data
        elif self.results['in_h1']:
            self.results['h1'].append(data)
        elif not self.results['in_script'] and not self.results['in_style']:
            # タグ外のテキストを蓄積
            self.results['text_content'] += data

def has_thai(text):
    if not text: return False
    return any('\u0e00' <= char <= '\u0e7f' for char in text)

def audit_html():
    results = []
    html_files = [f for f in os.listdir(WORKSPACE_DIR) if f.endswith('.html')]
    
    for file_name in html_files:
        path = os.path.join(WORKSPACE_DIR, file_name)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        parser = SEOParser()
        parser.feed(content)
        res = parser.results
        
        char_count = len(res['text_content'].strip())
        ai_phrases = ["と言えるでしょう", "をご紹介します", "いかがでしょうか", "まとめとして", "ぜひ活用してください"]
        found_ai_phrases = [p for p in ai_phrases if p in content]
        
        results.append({
            'file': file_name,
            'canonical': res['canonical'],
            'json_ld': res['json_ld'],
            'thai_title': has_thai(res['title']),
            'thai_desc': has_thai(res['description']),
            'h1': res['h1'],
            'char_count': char_count,
            'ai_phrases': found_ai_phrases
        })
    return results

if __name__ == "__main__":
    audit_results = audit_html()
    print("--- Audit Results ---")
    for res in audit_results:
        issues = []
        if not res['canonical']: issues.append("Missing Canonical")
        if not res['json_ld']: issues.append("Missing JSON-LD")
        if not res['thai_desc']: issues.append("Meta Desc NOT Thai")
        if not res['h1']: issues.append("Missing H1")
        if res['char_count'] < 4500: issues.append(f"Low Content ({res['char_count']} chars)")
        if res['ai_phrases']: issues.append(f"AI Phrases: {res['ai_phrases']}")
        
        if issues:
            print(f"File: {res['file']} -> {', '.join(issues)}")
        else:
            print(f"File: {res['file']} -> OK")
