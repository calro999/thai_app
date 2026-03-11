import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import os
import random
import string
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

def get_urls_from_sitemap(sitemap_path):
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = []
    for url in root.findall('ns:url', namespace):
        loc = url.find('ns:loc', namespace)
        if loc is not None and loc.text:
            urls.append(loc.text.strip())
    # Failsafe in case namespace is different
    if not urls:
        for url in root.findall('.//loc'):
            urls.append(url.text.strip() if url.text else '')
    return [u for u in urls if u]

def main():
    sitemap_path = "/Users/calro/Desktop/jlpt_thai_app/sitemap.xml"
    urls = get_urls_from_sitemap(sitemap_path)
    print(f"Found {len(urls)} URLs in sitemap")
    
    if not urls:
        print("No URLs found, exiting.")
        return

    domain = "jlpt-with-gyaru.vercel.app"

    # Search for an existing key file
    existing_key = None
    for f in os.listdir("/Users/calro/Desktop/jlpt_thai_app/"):
        if f.endswith('.txt') and len(f) >= 12 and f[:-4].isalnum():
            with open(os.path.join("/Users/calro/Desktop/jlpt_thai_app/", f), "r") as kf:
                content = kf.read().strip()
                if content == f[:-4]:
                    existing_key = content
                    break
    
    if existing_key:
        key = existing_key
        print(f"Found existing key: {key}")
    else:
        key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=32))
        key_file_path = f"/Users/calro/Desktop/jlpt_thai_app/{key}.txt"
        with open(key_file_path, "w") as f:
            f.write(key)
        print(f"IndexNow Key generated and saved to: {key}.txt")

    key_location = f"https://{domain}/{key}.txt"

    payload = {
        "host": domain,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls
    }

    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Content-Type': 'application/json; charset=utf-8'
    }

    endpoints = [
        "https://api.indexnow.org/indexnow",
        "https://www.bing.com/indexnow"
    ]

    for endpoint in endpoints:
        print(f"Submitting to {endpoint}...")
        req = urllib.request.Request(endpoint, data=data, headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req) as response:
                print(f"Success! Status: {response.status}")
        except urllib.error.URLError as e:
            if hasattr(e, 'code'):
                print(f"Error {e.code}: {e.read().decode('utf-8')}")
            else:
                print(f"Error: {e.reason}")

if __name__ == "__main__":
    main()
