import re

FILES = ['index.html', 'gd_build/index.html', 'app.js', 'gd_build/js/app.js']

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update localStorage keys
    content = content.replace('jlpt_gal_', 'jlpt_with_gyaru_')

    # 2. Update index.html specifically
    if filename.endswith('index.html'):
        # remove GD script
        gd_pattern = re.compile(r'<!--\s*GD SDK SDK Integration\s*-->[\s\S]*?</script>', re.IGNORECASE)
        if gd_pattern.search(content):
            gamepix_script = '''<!-- GamePix SDK -->
    <script src="https://integration.gamepix.com/sdk/v3/gamepix.sdk.js"></script>'''
            content = gd_pattern.sub(gamepix_script, content)
            
    # 3. Update app.js specifically
    if filename.endswith('app.js'):
        # Update purchaseItemDirect
        new_purchase = """function purchaseItemDirect() {
    if (typeof GamePix !== 'undefined') {
        GamePix.rewardAd().then(res => {
            if (res.success) {
                // Not used for points directly, but we can do it here or route through watchAdForPoints
                // However, purchaseItemDirect was originally just opening the checkout
                // Now we will just call watchAdForPoints so there's one code path
                watchAdForPoints();
            }
        });
    } else {
        alert('GamePix SDK ไม่พร้อมใช้งาน');
    }
}"""
        content = re.sub(r'function purchaseItemDirect\(\)\s*\{[\s\S]*?(?=\nfunction)', new_purchase + '\n', content)

        # Update watchAdForPoints
        new_watch = """function watchAdForPoints() {
    if (typeof GamePix !== 'undefined') {
        GamePix.rewardAd().then(res => {
            if (res.success) {
                state.adPoints += 5;
                localStorage.setItem('jlpt_with_gyaru_ad_points', state.adPoints);
                document.getElementById('current-points').innerText = state.adPoints;
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
            } else {
                alert('ดูวิดีโอไม่สำเร็จ หรือโฆษณาไม่พร้อมใช้งาน');
            }
        }).catch(e => alert('Ad not ready'));
    } else {
        showRewardAd(() => {
            state.adPoints += 5;
            localStorage.setItem('jlpt_with_gyaru_ad_points', state.adPoints);
            document.getElementById('current-points').innerText = state.adPoints;
            openUnlockModal(state.unlockPendingItem.id, state.unlockPendingItem.type);
        });
    }
}"""
        content = re.sub(r'function watchAdForPoints\(\)\s*\{[\s\S]*?(?=\nfunction)', new_watch + '\n', content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

for file in FILES:
    print(f"Updating {file}")
    update_file(file)

print('Updated successfully to GamePix')
