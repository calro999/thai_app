import os
import glob
from bs4 import BeautifulSoup

html_files = glob.glob('*.html')
issues = []
titles = {}
descriptions = {}

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
        
        title = soup.title.string if soup.title else None
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        desc = desc_tag['content'] if desc_tag else None
        
        if not title:
            issues.append(f"{file}: Missing title")
        else:
            if title in titles:
                issues.append(f"{file}: Duplicate title with {titles[title]}")
            titles[title] = file
            
        if not desc:
            issues.append(f"{file}: Missing description")
        else:
            if desc in descriptions:
                issues.append(f"{file}: Duplicate description with {descriptions[desc]}")
            descriptions[desc] = file

print(f"Total files scanned: {len(html_files)}")
print(f"Total issues found: {len(issues)}")
for issue in issues[:20]:
    print(issue)
if len(issues) > 20:
    print("...")

