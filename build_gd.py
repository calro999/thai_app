import os
import shutil
import re
import zipfile

SRC_DIR = '.'
BUILD_DIR = 'gd_build'

def clean_name(name):
    # Only alphanumeric and underscores
    # Replace hyphen with underscore in filename
    return name.replace('-', '_')

def build():
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    
    os.makedirs(BUILD_DIR)
    os.makedirs(os.path.join(BUILD_DIR, 'assets'))
    os.makedirs(os.path.join(BUILD_DIR, 'js'))
    os.makedirs(os.path.join(BUILD_DIR, 'data'))

    ignore_dirs = ['.git', '.gemini', 'gd_build', 'node_modules']
    ignore_files = ['build_gd.py', '.DS_Store', 'gd_package.zip', 'README.md']
    
    # We will build a mapping of old paths to new paths
    renamed_files = {} # old_filename -> new_filename
    
    def copy_and_map(src_path, dest_rel_dir):
        # copy file to BUILD_DIR/dest_rel_dir preserving subdirectories inside dest_rel_dir?
        # No, let's keep the internal tree.
        # e.g., src: images/maid/maid-01.png
        # dest base: assets/images/maid/
        rel_src = os.path.relpath(src_path, SRC_DIR)
        
        # apply cleaning to all parts
        parts = rel_src.split('/')
        new_parts = [clean_name(p) for p in parts]
        
        for old_p, new_p in zip(parts, new_parts):
            if old_p != new_p:
                renamed_files[old_p] = new_p

        new_rel_path = os.path.join(dest_rel_dir, *new_parts)
        full_dest = os.path.join(BUILD_DIR, new_rel_path)
        
        os.makedirs(os.path.dirname(full_dest), exist_ok=True)
        shutil.copy2(src_path, full_dest)
        
    for root, dirs, files in os.walk(SRC_DIR):
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]
        for f in files:
            if f in ignore_files or f.startswith('.'):
                continue
            if f.endswith('.py'):
                continue
                
            old_path = os.path.join(root, f)
            ext = os.path.splitext(f)[1].lower()
            
            # Decide destination base
            if ext == '.json':
                copy_and_map(old_path, 'data')
            elif ext == '.js':
                if f == 'sw.js':
                    copy_and_map(old_path, '.')
                else:
                    copy_and_map(old_path, 'js')
            elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.mp3', '.m4a', '.wav']:
                copy_and_map(old_path, 'assets')
            elif ext in ['.html', '.css', '.txt']:
                if f in ['index.html', 'style.css']:
                    copy_and_map(old_path, '.')
                else:
                    copy_and_map(old_path, '.')

    # Modify contents
    text_exts = ['.html', '.css', '.js', '.json']
    
    for root, _, files in os.walk(BUILD_DIR):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in text_exts:
                filepath = os.path.join(root, f)
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Replace renamed files (e.g. yukata-nikkori.png -> yukata_nikkori.png)
                for old_name, new_name in renamed_files.items():
                    content = content.replace(old_name, new_name)
                    
                # Fix specific paths in app.js and index.html
                if f == 'app.js':
                    # Fix asset paths
                    content = content.replace("'images/'", "'./assets/images/'")
                    content = content.replace("'images/normal.png'", "'./assets/images/normal.png'")
                    
                    # Fix fetch JSON paths
                    content = content.replace("fetch(`${level}.json`)", "fetch(`./data/${level}.json`)")
                    content = content.replace("fetch(`${fetchLevel}.json`)", "fetch(`./data/${fetchLevel}.json`)")
                    content = content.replace("fetch(`${level}_alphabet.json`)", "fetch(`./data/${level}_alphabet.json`)")
                    content = content.replace("fetch(path)", "fetch('./data/' + path)")

                    # Strip Stripe
                    # Remove all references to window.open for Stripe
                    content = re.sub(r'window\.open\(APP_CONFIG\.[a-zA-Z]+Link,\s*\'_blank\'\);', r'/* GD Unleashed */', content)
                    content = re.sub(r'window\.open\(outfit\.link,\s*\'_blank\'\);', r'/* GD Unleashed */', content)
                    content = content.replace('alert("หลังจากชำระเงินเรียบร้อย กรุณาใช้ลิงก์ย้อนกลับที่มีพารามิเตอร์ success ค่ะ");', '')
                    
                    # Instead of purchaseItemDirect doing Stripe, we want it to show a GD reward AD
                    gd_purchase = """function purchaseItemDirect() {
    if (typeof gdsdk !== 'undefined' && gdsdk.showAd) {
        gdsdk.showAd('rewarded')
            .then(response => {
                // Reward logic handled in SDK_REWARDED_WATCH_COMPLETE event listener
            })
            .catch(error => {
                alert('โฆษณาไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่ภายหลัง');
            });
    } else {
        alert('GD SDK ไม่พร้อมใช้งาน');
    }
}"""
                    content = re.sub(r'function purchaseItemDirect\(\)\s*\{[\s\S]*?(?=\nfunction)', gd_purchase + '\n', content)
                    
                    # Also replace watchAdForPoints to use GD SDK
                    gd_watch = """function watchAdForPoints() {
    if (typeof gdsdk !== 'undefined' && gdsdk.showAd) {
        state.adPointsRequested = true;
        gdsdk.showAd('rewarded').catch(e => alert('Ad not ready'));
    } else {
        showRewardAd(() => {
            state.adPoints += 5;
            localStorage.setItem('ad_points', state.adPoints);
            document.getElementById('current-points').innerText = state.adPoints;
            openUnlockModal(state.unlockPendingItem.id, state.unlockPendingItem.type);
        });
    }
}"""
                    content = re.sub(r'function watchAdForPoints\(\)\s*\{[\s\S]*?(?=\nfunction)', gd_watch + '\n', content)

                elif f == 'index.html':
                    content = content.replace('src="app.js', 'src="./js/app.js')
                    content = content.replace('href="style.css"', 'href="./style.css"')
                    content = content.replace('src="images/', 'src="./assets/images/')
                    content = content.replace('href="images/', 'href="./assets/images/')
                    content = content.replace('src="Sakura_Dreams.mp3"', 'src="./assets/Sakura_Dreams.mp3"')
                    
                    # Convert purchase buttons
                    content = content.replace('ซื้อโดยตรง (100 THB)', 'ดูวิดีโอเพื่อปลดล็อก (Watch Video)')
                    content = content.replace('ไปยังหน้าชำระเงิน (Stripe)', 'ดูวิดีโอเพื่อปลดล็อก (Watch Video)')
                    
                    # Inject GD SDK Header
                    gd_sdk = """
    <!-- GD SDK SDK Integration -->
    <script>
        window["GD_OPTIONS"] = {
            "gameId": "b8d80c10b719463ca0cceb709dc8296a", // MOCK ID, MUST REPLACE WITH REAL ID IN GD PORTAL
            "onEvent": function(event) {
                switch (event.name) {
                    case "SDK_GAME_START":
                        // Resume game audio
                        if (window._bgmStarted && document.getElementById('bgm-audio')) {
                            document.getElementById('bgm-audio').play().catch(()=>{});
                        }
                        break;
                    case "SDK_GAME_PAUSE":
                        // Pause game audio
                        if (document.getElementById('bgm-audio')) {
                            document.getElementById('bgm-audio').pause();
                        }
                        window.speechSynthesis.cancel();
                        break;
                    case "SDK_GDPR_TRACKING":
                    case "SDK_GDPR_TARGETING":
                        break;
                    case "SDK_REWARDED_WATCH_COMPLETE":
                        // Give reward
                        if (window.state) {
                            if (window.state.adPointsRequested) {
                                window.state.adPointsRequested = false;
                                window.state.adPoints += 5;
                                localStorage.setItem('ad_points', window.state.adPoints);
                                document.getElementById('current-points').innerText = window.state.adPoints;
                                if (window.openUnlockModal && window.state.unlockPendingItem) {
                                    window.openUnlockModal(window.state.unlockPendingItem.id, window.state.unlockPendingItem.type);
                                }
                            } else if (window.state.unlockPendingItem) {
                                // Full unlock
                                const id = window.state.unlockPendingItem.id;
                                const type = window.state.unlockPendingItem.type;
                                if (type === 'course') {
                                    if (window.unlockCourse) window.unlockCourse(id, true);
                                } else if (type === 'outfit') {
                                    if (window.unlockOutfit) window.unlockOutfit(id, true);
                                }
                                if (window.closeUnlockModal) window.closeUnlockModal();
                                if (window.closeOshikatsuSalesBox) window.closeOshikatsuSalesBox();
                                if (window.closeSpecialTravelSalesBox) window.closeSpecialTravelSalesBox();
                                if (window.closeSpecialFoodSalesBox) window.closeSpecialFoodSalesBox();
                                if (window.closeSpecialMedicalSalesBox) window.closeSpecialMedicalSalesBox();
                            }
                        }
                        break;
                }
            },
        };
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://html5.api.gamedistribution.com/main.min.js';
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'gamedistribution-jssdk'));
    </script>
"""
                    content = content.replace('</head>', gd_sdk + '\n</head>')

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)

    # Finally, Zip
    zip_path = os.path.join(SRC_DIR, 'gd_package.zip')
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(BUILD_DIR):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                zipf.write(full_path, rel_path)

    print("Build complete! Saved to gd_package.zip")

if __name__ == '__main__':
    build()
