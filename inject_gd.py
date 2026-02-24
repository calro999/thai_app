import os
import re

APP_JS_FILE = 'app.js'
INDEX_HTML_FILE = 'index.html'

def process_app_js():
    with open(APP_JS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Prefix localStorage keys
    content = re.sub(r"localStorage\.getItem\(['\"]([^'\"]+)['\"]\)", r"localStorage.getItem('jlpt_gal_\1')", content)
    content = re.sub(r"localStorage\.setItem\(['\"]([^'\"]+)['\"]", r"localStorage.setItem('jlpt_gal_\1'", content)
    content = re.sub(r"localStorage\.getItem\(`([^`]+)`\)", r"localStorage.getItem(`jlpt_gal_\1`)", content)
    content = re.sub(r"localStorage\.setItem\(`([^`]+)`", r"localStorage.setItem(`jlpt_gal_\1`", content)

    # Disable Stripe window.open and alerts
    content = re.sub(r'window\.open\(APP_CONFIG\.[a-zA-Z]+Link,\s*\'_blank\'\);', r'/* GD Unleashed */', content)
    content = re.sub(r'window\.open\(outfit\.link,\s*\'_blank\'\);', r'/* GD Unleashed */', content)
    content = content.replace('alert("หลังจากชำระเงินเรียบร้อย กรุณาใช้ลิงก์ย้อนกลับที่มีพารามิเตอร์ success ค่ะ");', '')

    # Inject GD logic into purchaseItemDirect
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

    # Inject GD logic into watchAdForPoints
    gd_watch = """function watchAdForPoints() {
    if (typeof gdsdk !== 'undefined' && gdsdk.showAd) {
        state.adPointsRequested = true;
        gdsdk.showAd('rewarded').catch(e => alert('Ad not ready'));
    } else {
        showRewardAd(() => {
            state.adPoints += 5;
            localStorage.setItem('jlpt_gal_ad_points', state.adPoints);
            document.getElementById('current-points').innerText = state.adPoints;
            openUnlockModal(state.unlockPendingItem.id, state.unlockPendingItem.type);
        });
    }
}"""
    content = re.sub(r'function watchAdForPoints\(\)\s*\{[\s\S]*?(?=\nfunction)', gd_watch + '\n', content)

    with open(APP_JS_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

def process_index_html():
    with open(INDEX_HTML_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    gd_sdk = """
    <!-- GD SDK SDK Integration -->
    <script>
        window["GD_OPTIONS"] = {
            "gameId": "b8d80c10b719463ca0cceb709dc8296a", // MOCK ID, MUST REPLACE WITH REAL ID IN GD PORTAL
            "onEvent": function(event) {
                switch (event.name) {
                    case "SDK_GAME_START":
                        if (window._bgmStarted && document.getElementById('bgm-audio')) {
                            document.getElementById('bgm-audio').play().catch(()=>{});
                        }
                        break;
                    case "SDK_GAME_PAUSE":
                        if (document.getElementById('bgm-audio')) {
                            document.getElementById('bgm-audio').pause();
                        }
                        window.speechSynthesis.cancel();
                        break;
                    case "SDK_GDPR_TRACKING":
                    case "SDK_GDPR_TARGETING":
                        break;
                    case "SDK_REWARDED_WATCH_COMPLETE":
                        if (window.state) {
                            if (window.state.adPointsRequested) {
                                window.state.adPointsRequested = false;
                                window.state.adPoints += 5;
                                localStorage.setItem('jlpt_gal_ad_points', window.state.adPoints);
                                document.getElementById('current-points').innerText = window.state.adPoints;
                                if (window.openUnlockModal && window.state.unlockPendingItem) {
                                    window.openUnlockModal(window.state.unlockPendingItem.id, window.state.unlockPendingItem.type);
                                }
                            } else if (window.state.unlockPendingItem) {
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

    if "GD_OPTIONS" not in content:
        content = content.replace('</head>', gd_sdk + '\n</head>')

    content = content.replace('ซื้อโดยตรง (100 THB)', 'ดูวิดีโอเพื่อปลดล็อก (Watch Video)')
    content = content.replace('ไปยังหน้าชำระเงิน (Stripe)', 'ดูวิดีโอเพื่อปลดล็อก (Watch Video)')

    with open(INDEX_HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    process_app_js()
    process_index_html()
    print("Injection and localStorage namespacing complete.")
