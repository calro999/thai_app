import re

FILES = ['index.html', 'gd_build/index.html']
JS_FILES = ['app.js', 'gd_build/js/app.js']

GD_SDK_SNIPPET = """    <!-- GD SDK SDK Integration -->
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
                                localStorage.setItem('jlpt_with_gyaru_ad_points', window.state.adPoints);
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
    </script>"""

def update_html(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ensure GamePix is there
    if 'gamepix.sdk.js' not in content:
        content = content.replace('</head>', '    <!-- GamePix SDK -->\n    <script src="https://integration.gamepix.com/sdk/v3/gamepix.sdk.js"></script>\n</head>')

    # Ensure GD is there
    if 'gamedistribution-jssdk' not in content:
        content = content.replace('</head>', GD_SDK_SNIPPET + '\n</head>')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

def update_js(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    purchase_replacement = """function purchaseItemDirect() {
    watchAdForPoints();
}"""

    watch_replacement = """function watchAdForPoints() {
    state.adPointsRequested = true;
    
    // Try GamePix first
    if (typeof GamePix !== 'undefined') {
        GamePix.rewardAd().then(res => {
            if (res.success) {
                triggerRewardSuccess();
            } else {
                tryGD();
            }
        }).catch(e => {
            tryGD();
        });
    } else {
        tryGD();
    }
}

function tryGD() {
    if (typeof gdsdk !== 'undefined' && gdsdk.showAd) {
        gdsdk.showAd('rewarded')
            .then(response => {
                // GD onEvent handles success natively if SDK_REWARDED_WATCH_COMPLETE is emitted
            })
            .catch(error => {
                showRewardAd(() => triggerRewardSuccess());
            });
    } else {
        showRewardAd(() => triggerRewardSuccess());
    }
}

function triggerRewardSuccess() {
    // Check if onEvent exists on GD_OPTIONS and call it to reuse original unlock logic
    if (window.GD_OPTIONS && window.GD_OPTIONS.onEvent) {
        window.GD_OPTIONS.onEvent({name: "SDK_REWARDED_WATCH_COMPLETE"});
    } else {
        state.adPoints += 5;
        localStorage.setItem('jlpt_with_gyaru_ad_points', state.adPoints);
        const cp = document.getElementById('current-points');
        if (cp) cp.innerText = state.adPoints;
        
        if (window.openUnlockModal && window.state.unlockPendingItem) {
            window.openUnlockModal(window.state.unlockPendingItem.id, window.state.unlockPendingItem.type);
        } else if (state.unlockPendingItem) {
            const id = state.unlockPendingItem.id;
            const type = state.unlockPendingItem.type;
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
}"""

    content = re.sub(r'function purchaseItemDirect\(\)\s*\{[\s\S]*?(?=\nfunction watchAdForPoints)', purchase_replacement + '\n\n', content)
    
    content = re.sub(r'function watchAdForPoints\(\)\s*\{[\s\S]*?(?=\nfunction showRewardAd)', watch_replacement + '\n\n', content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

for hd in FILES:
    update_html(hd)
for jd in JS_FILES:
    update_js(jd)
    print(jd, "updated")
