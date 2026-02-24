/**
 * JLPT Visual Novel Engine - Oshikatsu & Reward Ad Update
 */

const APP_CONFIG = {
    mode: 'DIRECT',
    oshikatsuUnlockPoints: 15,
    specialTravelUnlockPoints: 15,
    specialFoodUnlockPoints: 15,
    specialMedicalUnlockPoints: 15,
    outfitUnlockPoints: 15,
    oshikatsuLink: 'https://buy.stripe.com/test_28E6oG1MA15m2tveZI9sk05',
    specialTravelLink: 'https://buy.stripe.com/test_6oUbJ04YM7tK1prbNw9sk06',
    specialFoodLink: 'https://buy.stripe.com/test_00weVc2QEeWc4BD8Bk9sk07',
    specialMedicalLink: 'https://buy.stripe.com/test_14A28q76U7tKecdaJs9sk08'
};

const config = {
    imgDir: './assets/images/',
    reactionTime: 3000,
    questionsPerStory: 10,
    outfits: [
        { id: 'default', name: 'Default', price: 'Free', thumbnail: './assets/images/normal.png', link: '#' },
        { id: 'yukata', name: 'Yukata', price: '15 points (3 ads)', thumbnail: 'images/yukata/yukata_nikkori.png', link: 'https://buy.stripe.com/test_eVq8wO3UI6pGd899Fo9sk01' },
        { id: 'gos', name: 'Gos', price: '15 points (3 ads)', thumbnail: 'images/gos/gos_0000_normal.png', link: 'https://buy.stripe.com/test_7sYaEWdviaFW7NP3h09sk02' },
        { id: 'maid', name: 'Maid', price: '15 points (3 ads)', thumbnail: 'images/maid/maid_0000_normal.png', link: 'https://buy.stripe.com/test_fZu3cu4YMeWc0lncRA9sk03' },
        { id: 'miko', name: 'Miko', price: '15 points (3 ads)', thumbnail: 'images/miko/miko_0000_normal.png', link: 'https://buy.stripe.com/test_9B6aEWezmbK09VX3h09sk04' }
    ]
};

const state = {
    isAnimating: false,
    selectedLevel: null,
    selectedStoryNum: 1,
    masterData: [],
    storyData: [],
    storyStep: 0,
    currentQuestion: null,
    correctCount: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    lastIncorrectState: 'odoroki',
    isReviewMode: false,
    gameMode: 'quiz', // 'learning' or 'quiz'
    characterState: 'normal',
    characterAnimationId: null,
    ttsRate: parseFloat(localStorage.getItem('jlpt_with_gyaru_ttsRate')) || 0.8,
    ttsVolume: parseFloat(localStorage.getItem('jlpt_with_gyaru_ttsVolume')) || 1.0,

    // Lock/Unlock System
    adPoints: parseInt(localStorage.getItem('jlpt_with_gyaru_ad_points') || '0'),
    unlockedCourses: JSON.parse(localStorage.getItem('jlpt_with_gyaru_unlocked_courses') || '["hiragana", "katakana", "n5", "n4", "n3"]'),

    // Outfit States
    selectedCharacter: localStorage.getItem('jlpt_with_gyaru_selectedCharacter') || 'default',
    unlockedOutfits: JSON.parse(localStorage.getItem('jlpt_with_gyaru_unlocked_outfits') || '["default"]'),
    previewIndex: 0,
    unlockPendingItem: null, // To track which item is being unlocked in modal
    currentTargetAudio: null // For replaying audio in listening mode
};

const characterAssets = {
    gos: { normal: 'gos_0000_normal.png', nikkori: 'gos_0001_nikkori.png', good: 'gos_0002_good.png', naku: 'gos_0003_naku.png', hart: 'gos_0004_hart.png', neko: 'gos_0005_neko.png', tere: 'gos_0006_tere.png', odoroki: 'gos_0007_odoroki.png', zannen: 'gos_0007_odoroki.png' },
    maid: { normal: 'maid_0000_normal.png', nikkori: 'maid_0001_nikkori.png', good: 'maid_0002_good.png', zannen: 'maid_0003_zannen.png', naku: 'maid_0004_naku.png', hart: 'maid_0008_hart.png', odoroki: 'maid_0009_odoroki.png', tere: 'maid_0006_tere.png', neko: 'maid_0007_neko.png' },
    miko: { normal: 'miko_0000_normal.png', nikkori: 'miko_0001_nikkori.png', good: 'miko_0002_good.png', hart: 'miko_0003_hart.png', odoroki: 'miko_0004_odoroki.png', zannen: 'miko_0005_zannen.png', naku: 'miko_0006_naku.png', tere: 'miko_0007_tere.png', neko: 'miko_0008_neko.png' },
    yukata: { normal: 'yukata_nikkori.png', nikkori: 'yukata_nikkori.png', good: 'yukata_good.png', hart: 'yukata_hart.png', odoroki: 'yukata_odoroki.png', zannen: 'yukata_zannen.png', naku: 'yukata_naku.png', tere: 'yukata_tere.png', neko: 'yukata_neko.png' }
};

/** Initialize */
window.onload = () => {
    // Wake up speech synthesis
    if (window.speechSynthesis) window.speechSynthesis.getVoices();

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('item_id');
    const status = params.get('status');

    if (itemId && status === 'success') {
        if (itemId === 'oshikatsu') {
            unlockCourse('oshikatsu', true);
        } else if (itemId === 'special_travel') {
            unlockCourse('special_travel', true);
        } else if (itemId === 'special_food') {
            unlockCourse('special_food', true);
        } else if (itemId === 'special_medical') {
            unlockCourse('special_medical', true);
        } else {
            const outfit = config.outfits.find(o => o.id === itemId);
            if (outfit && !state.unlockedOutfits.includes(itemId)) {
                state.unlockedOutfits.push(itemId);
                localStorage.setItem('jlpt_with_gyaru_unlocked_outfits', JSON.stringify(state.unlockedOutfits));
                state.selectedCharacter = itemId;
                localStorage.setItem('jlpt_with_gyaru_selectedCharacter', itemId);
                alert(`ปลดล็อกชุด ${outfit.name} เรียบร้อยแล้วค่ะ!`);
            }
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (document.getElementById('settings-btn')) document.getElementById('settings-btn').onclick = openSettings;
    const ttsRange = document.getElementById('tts-rate-range');
    if (ttsRange) {
        ttsRange.value = state.ttsRate;
        ttsRange.oninput = (e) => {
            state.ttsRate = parseFloat(e.target.value);
            document.getElementById('tts-rate-value').innerText = state.ttsRate.toFixed(1);
            localStorage.setItem('jlpt_with_gyaru_ttsRate', state.ttsRate);
        };
    }
    const ttsVolRange = document.getElementById('tts-volume-range');
    if (ttsVolRange) {
        ttsVolRange.value = state.ttsVolume;
        ttsVolRange.oninput = (e) => {
            state.ttsVolume = parseFloat(e.target.value);
            document.getElementById('tts-volume-value').innerText = state.ttsVolume.toFixed(1);
            localStorage.setItem('jlpt_with_gyaru_ttsVolume', state.ttsVolume);
        };
    }

    // BGM初期化
    _bgmInit();

    startCharacterAnimation();
    setCharacterState('normal');
};

/** BGM Control */
const _BGM_DEFAULT_VOL = 0.04; // デフォルト音量（スライダー4/100相当）
let _bgmStarted = false;

function _bgmInit() {
    const bgm = document.getElementById('bgm-audio');
    if (!bgm) return;

    // localStorageから音量復元
    const saved = parseFloat(localStorage.getItem('jlpt_with_gyaru_bgmVolume'));
    const vol = isNaN(saved) ? _BGM_DEFAULT_VOL : saved;
    bgm.volume = vol;

    // スライダーと表示を同期
    const slider = document.getElementById('bgm-volume-range');
    const label = document.getElementById('bgm-volume-value');
    if (slider) {
        slider.value = Math.round(vol * 100);
        if (label) label.innerText = slider.value;
    }

    // ブラウザの自動再生制限対策: 最初のユーザー操作で一度だけ再生開始（once:trueで登録解除）
    const startBgm = () => {
        if (_bgmStarted) return;
        bgm.play().then(() => { _bgmStarted = true; }).catch(() => { });
    };
    document.addEventListener('click', startBgm, { once: true });
    document.addEventListener('touchstart', startBgm, { once: true });
}

function setBgmVolume(rawVal) {
    const vol = parseFloat(rawVal) / 100;
    const bgm = document.getElementById('bgm-audio');
    if (bgm) bgm.volume = vol;
    const label = document.getElementById('bgm-volume-value');
    if (label) label.innerText = rawVal;
    localStorage.setItem('jlpt_with_gyaru_bgmVolume', vol);
    // 音量0以外のときは必ず再生する
    if (vol > 0 && bgm && bgm.paused) {
        bgm.play().catch(() => { });
        _bgmStarted = true;
    }
}

/** Course & Level Selection */
function isCourseUnlocked(id) {
    return state.unlockedCourses.includes(id);
}

function selectCourse(id) {
    if (isCourseUnlocked(id)) {
        openSubModeSelect(id);
    } else {
        openUnlockModal(id, 'course');
    }
}

function openUnlockModal(id, type) {
    state.unlockPendingItem = { id, type };
    document.getElementById('unlock-modal').style.display = 'flex';
    document.getElementById('current-points').innerText = state.adPoints;

    let required = APP_CONFIG.outfitUnlockPoints;
    if (id === 'oshikatsu') required = APP_CONFIG.oshikatsuUnlockPoints;
    if (id === 'special_travel') required = APP_CONFIG.specialTravelUnlockPoints;
    if (id === 'special_food') required = APP_CONFIG.specialFoodUnlockPoints;
    if (id === 'special_medical') required = APP_CONFIG.specialMedicalUnlockPoints;
    document.getElementById('required-points').innerText = required;

    const useBtn = document.getElementById('use-points-btn');
    if (state.adPoints >= required) {
        useBtn.disabled = false;
        useBtn.innerText = `ใช้ ${required} แต้มเพื่อปลดล็อก (Unlock Now)`;
        useBtn.classList.add('highlight');
    } else {
        useBtn.disabled = true;
        useBtn.innerText = `แต้มไม่พอ (Need ${required} pts)`;
        useBtn.classList.remove('highlight');
    }
}

function closeUnlockModal() {
    document.getElementById('unlock-modal').style.display = 'none';
}

function unlockWithPoints() {
    const { id, type } = state.unlockPendingItem;
    let required = APP_CONFIG.outfitUnlockPoints;
    if (id === 'oshikatsu') required = APP_CONFIG.oshikatsuUnlockPoints;
    if (id === 'special_travel') required = APP_CONFIG.specialTravelUnlockPoints;
    if (id === 'special_food') required = APP_CONFIG.specialFoodUnlockPoints;
    if (id === 'special_medical') required = APP_CONFIG.specialMedicalUnlockPoints;

    if (state.adPoints >= required) {
        state.adPoints -= required;
        localStorage.setItem('jlpt_with_gyaru_ad_points', state.adPoints);

        if (type === 'course') {
            unlockCourse(id, true);
        } else if (type === 'outfit') {
            unlockOutfit(id, true);
        }
        closeUnlockModal();
    }
}

function purchaseItemDirect() {
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
}

function watchAdForPoints() {
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
}

function showRewardAd(callback) {
    alert("กำลังโหลดโฆษณา... (GameDistribution/Azerion Mock)");
    setTimeout(() => {
        alert("ดูโฆษณาจบแล้ว! ได้รับ 5 แต้มสะสม");
        callback();
    }, 2000);
}

function unlockCourse(id, showAlert) {
    if (!state.unlockedCourses.includes(id)) {
        state.unlockedCourses.push(id);
        localStorage.setItem('jlpt_with_gyaru_unlocked_courses', JSON.stringify(state.unlockedCourses));
    }
    if (showAlert) alert(`ปลดล็อกคอร์ส ${id} เรียบร้อยแล้วค่ะ!`);
    openModeSelect();
}

function unlockOutfit(id, showAlert) {
    if (!state.unlockedOutfits.includes(id)) {
        state.unlockedOutfits.push(id);
        localStorage.setItem('jlpt_with_gyaru_unlocked_outfits', JSON.stringify(state.unlockedOutfits));
    }
    if (showAlert) alert(`ปลดล็อกชุดเรียบร้อยแล้วค่ะ!`);
    updateShopUI();
}

const courseConfig = {
    hiragana: { name: 'Hiragana', price: 'Free', points: 0 },
    katakana: { name: 'Katakana', price: 'Free', points: 0 },
    n5: { name: 'JLPT N5', price: 'Free', points: 0 },
    listening_n5: { name: 'JLPT N5 Listening', price: 'Free', points: 0 },
    listening_n4: { name: 'JLPT N4 Listening', price: 'Free', points: 0 },
    listening_n3: { name: 'JLPT N3 Listening', price: 'Free', points: 0 },
    listening_n1: { name: 'JLPT N1 Listening', price: 'Free', points: 0 },
    listening_n2: { name: 'JLPT N2 Listening', price: 'Free', points: 0 },
    n4: { name: 'JLPT N4', price: 'Free', points: 0 },
    n3: { name: 'JLPT N3', price: 'Free', points: 0 },
    oshikatsu: { name: 'กิจกรรมของโอตาคุ', price: '15 points (3 ads)', points: 15 },
    special_travel: { name: 'เที่ยวญี่ปุ่นซับไววัล: 50 คำศัพท์ต้องรู้', price: '15 points (3 ads)', points: 15 },
    special_food: { name: 'ภาษาญี่ปุ่นสำหรับร้านอาหารและกูร์เมต์', price: '15 points (3 ads)', points: 15 },
    special_medical: { name: 'แจ้งอาการป่วยและซื้อยาอย่างมั่นใจ', price: '15 points (3 ads)', points: 15 },
    listening: { name: 'การฟัง (Listening)', price: 'Free', points: 0 },
    baby_step: { name: 'เบบี้สเต็ป (Baby Step)', price: 'Free', points: 0 },
    daily_life: { name: 'ชีวิตประจำวัน (Daily Life)', price: 'Free', points: 0 },
    communication: { name: 'การสื่อสาร (Communication)', price: 'Free', points: 0 },
    number: { name: 'ตัวเลขและเวลา (Numbers & Time)', price: 'Free', points: 0 },
    business: { name: 'ทำงานกันเถอะ (Business)', price: 'Free', points: 0 },
    disaster: { name: 'ภัยพิบัติและการเอาตัวรอด', price: 'Free', points: 0 }
};

const oshikatsuUnitInfo = {
    1: { title: "ชมความงามของเมน (พื้นฐาน)" },
    2: { title: "บอกความรู้สึกจากใจ (อารมณ์)" },
    3: { title: "คำชมระดับเทพ (ขั้นสูง)" },
    4: { title: "ศัพท์ฮิตใน SNS และอนิเมะ" },
    5: { title: "ประโยคใช้จริงในคอนเสิร์ต" }
};

const specialTravelUnitInfo = {
    1: { title: "การเดินทาง: ไม่หลงในญี่ปุ่น" },
    2: { title: "การช้อปปิ้ง: จัดการที่เลจได้สบาย" },
    3: { title: "มารยาทและกฎ: อยู่ญี่ปุ่นแบบโปร" },
    4: { title: "เหตุฉุกเฉินและ SOS: เอาตัวรอดได้จริง" },
    5: { title: "การสื่อสารที่ราบรื่น: ภาษาญี่ปุ่นมัดใจคน" }
};

const specialFoodUnitInfo = {
    1: { title: "รสชาติพื้นฐาน (味の基本)" },
    2: { title: "การแสดงรสชาติและความชอบ (味の表現と好み)" },
    3: { title: "วิธีการปรุงและเนื้อสัตว์ (調理法และ肉)" },
    4: { title: "เครื่องดื่มและบุฟเฟต์ (お酒・お水・食べ放題)" },
    5: { title: "การสั่งอาหารและปริมาณ (注文และ量)" },
    6: { title: "บรรยากาศร้านและอุปกรณ์ (店内และ道具)" }
};

const specialMedicalUnitInfo = {
    1: { title: "ส่วนต่างๆ ของร่างกายและความเจ็บปวด (ส่วนไหนเจ็บ?)" },
    2: { title: "อาการหวัดและระบบทางเดินหายใจ" },
    3: { title: "ปัญหาระบบทางเดินอาหาร" },
    4: { title: "บาดแผลและการบาดเจ็บ (แผล/แมลงกัด)" },
    5: { title: "เรื่องสำคัญที่ต้องแจ้ง (โรคประจำตัว/การแพ้)" },
    6: { title: "ประเภทยาและวิธีกินยา" }
};

const babyStepUnitInfo = {
    1: { title: "การทักทายพื้นฐาน" },
    2: { title: "ครอบครัวและบุคคล" },
    3: { title: "สัตว์โลกน่ารัก" },
    4: { title: "อาหารและเครื่องดื่ม" },
    5: { title: "ร่างกายของเรา" },
    6: { title: "สิ่งของรอบตัว" },
    7: { title: "สถานที่" },
    8: { title: "ธรรมชาติและสภาพอากาศ" },
    9: { title: "ตัวเลขและเวลา" },
    10: { title: "คำกริยาง่ายๆ" }
};

const dailyLifeUnitInfo = {
    1: { title: "คำกริยาพื้นฐาน" },
    2: { title: "การกระทำ" },
    3: { title: "ความรู้สึก" },
    4: { title: "ทิศทาง" },
    5: { title: "ซื้อของ" },
    6: { title: "เวลา" },
    7: { title: "ที่ทำงาน" },
    8: { title: "สภาพอากาศ" },
    9: { title: "ความช่วยเหลือ" },
    10: { title: "กิจกรรม" }
};

const communicationUnitInfo = {
    1: { title: "ตอบรับและปฏิเสธ" },
    2: { title: "การตอบรับ" },
    3: { title: "เรียกและตอบ" },
    4: { title: "ขอบคุณและขอโทษแบบสั้น" },
    5: { title: "ชอบและไม่ชอบ" },
    6: { title: "มีและไม่มี" },
    7: { title: "ทำได้และทำไม่ได้" },
    8: { title: "ตอบรับการชวน" },
    9: { title: "ถูกและผิด" },
    10: { title: "ความรู้สึกสั้นๆ" }
};

const numberUnitInfo = {
    1: { title: "Small Numbers (1-10)" },
    2: { title: "หลักตัวเลข (10〜100万)" },
    3: { title: "วันในสัปดาห์ (曜日)" },
    4: { title: "เดือน 1-12 (月)" },
    5: { title: "เวลาและระยะเวลา (時間)" }
};

const businessUnitInfo = {
    1: { title: "ทักทายและพื้นฐาน" },
    2: { title: "การตอบรับและยืนยัน" },
    3: { title: "โทรศัพท์และผู้มาติดต่อ" },
    4: { title: "การประชุมและนัดหมาย" },
    5: { title: "ปรึกษาและรายงาน" }
};

const disasterUnitInfo = {
    1: { title: "พื้นฐานภัยธรรมชาติ" },
    2: { title: "การเตรียมตัว" },
    3: { title: "การกระทำเมื่อเกิดเหตุ" },
    4: { title: "ข้อมูลและการแจ้งเตือน" },
    5: { title: "การช่วยเหลือและการสื่อสาร" }
};
const listeningN5UnitInfo = {
    1: { title: `図書館 (หอสมุด) vs 教室 (ห้องเรียน)` },
    2: { title: `～がいい (อยากได้...) vs ～だけでいい (เอาแค่...ก็พอ)` },
    3: { title: `車 (รถยนต์) vs 電車 (รถไฟ)` },
    4: { title: `もらいました (ได้รับ) vs あげました (ให้)` },
    5: { title: `～こと (การ...) vs 昔 (เมื่อก่อน) vs 今 (ตอนนี้)` },
    6: { title: `～てしまいました (เกิดเรื่องไม่คาดคิด) vs 先に (ไปก่อน/เริ่มก่อน)` },
    7: { title: `頭が痛い (ปวดหัว) vs 熱がある (มีไข้)` },
    8: { title: `忘れて (ลืม) vs 戻りました (กลับไป...)` },
    9: { title: `～ています (กำลัง...อยู่)` },
    10: { title: `まず (ก่อนอื่น) vs ～てから (หลังจาก...แล้วค่อย)` },
    11: { title: `～たことがあります (เคย...) vs まだ～ていません (ยังไม่เคย...)` },
    12: { title: `～つもりです (ตั้งใจว่าจะ...)` },
    13: { title: `～はずです (ควรจะ.../น่าจะ...แน่ๆ)` },
    14: { title: `～てみよう (ลอง...กันเถอะ)` },
    15: { title: `～そうです (ได้ยินมาว่า...)` },
    16: { title: `～てくれました (ทำให้ [ฉัน])` },
    17: { title: `～習わせています (ให้เรียน/ให้ฝึกฝน)` },
    18: { title: `～かもしれません (อาจจะ...ก็ได้)` },
    19: { title: `～てしまいました (ทำ...เสร็จเรียบร้อยแล้ว)` },
    20: { title: `～そうです (ดูเหมือนว่า... [จากรูปลักษณ์])` },
    21: { title: `～ようになりました (สามารถ...ได้แล้ว/กลายเป็นว่า...)` },
    22: { title: `～ようです (ดูเหมือนว่า... [สรุปจากหลักฐานที่เห็น/ได้ยิน])` },
    23: { title: `～ていらっしゃいます (กำลัง...อยู่ [ยกย่อง])` },
    24: { title: `～はずです (ควรจะ... / น่าจะ... [มั่นใจ])` },
    25: { title: `～たら (ถ้า... / เมื่อ...)` },
    26: { title: `～させられました (ถูกบังคับให้ทำ...)` },
    27: { title: `お越しになる (มา [ยกย่องมาก])` },
    28: { title: `～ようとした時 (ตอนที่กำลังจะ... [พยายามจะทำแล้วเกิดเหตุแทรก])` },
    29: { title: `～た結果 (ผลจากการ... / หลังจากที่...)` },
    30: { title: `～たばかり (เพิ่งจะ... [ความรู้สึกของผู้พูด])` }
};

const listeningN3UnitInfo = {
    1: { title: `政治（せいじ） vs 政府（せいふ）` },
    2: { title: `議題（ぎだい） vs 解決（かいけつ）` },
    3: { title: `権力（けんりょく） vs 義務（ぎむ）` },
    4: { title: `復習（ふくしゅう） vs 暗記（あんき）` },
    5: { title: `認める（みとめる） vs 感謝（かんしゃ）` },
    6: { title: `成長（せいちょう） vs 完了（かんりょう）` },
    7: { title: `短気（たんき） vs 謙虚（けんきょ）` },
    8: { title: `常に（つねに） vs はっきり` },
    9: { title: `一期一会（いちごいちえ） vs 有言実行（ゆうげันじっこう）` },
    10: { title: `兆し（きざし） vs 不思議（ふしぎ）` },
    11: { title: `判決（はんけつ） vs 決断（けつだん）` },
    12: { title: `景気（けいき） vs 宣伝（せんでん）` },
    13: { title: `範囲（はんい） vs 規模（きぼ）` },
    14: { title: `権利（けんり） vs 逆らう（さからう）` },
    15: { title: `能率（のうりつ） vs 深刻（しんこく）` },
    16: { title: `普及（ふきゅう） vs 提供（ていきょう）` },
    17: { title: `援助（えんじょ） vs 支持（しじ）` },
    18: { title: `背景（はいけい） vs 事情（じじょう）` },
    19: { title: `考慮（こうりょ） vs 反映（はんえい）` },
    20: { title: `結論（けつろん） vs 最終（さいしゅう）` },
    21: { title: `活性化（かっせいか） vs 〜に反して（〜にはんして）` },
    22: { title: `矛盾（むじゅん） vs 衝突（しょうとつ）` },
    23: { title: `推測（すいそく） vs 確信（かくしん）` },
    24: { title: `維持（いじ） vs 管理（かんり）` },
    25: { title: `展開（てんかい） vs 一致（いっち）` },
    26: { title: `蓄積（ちくせき） vs 還元（かんげん）` },
    27: { title: `配分（はいぶん） vs 均衡（きんこう）` },
    28: { title: `促進（そくしん） vs 停滞（ていたい）` },
    29: { title: `分析（ぶんせき） vs 考察（こうさつ）` },
    30: { title: `合意（ごうい） vs 誇り（ほこり）` },
};



const listeningN1UnitInfo = {
    1: { title: "経営会議" },
    2: { title: "テレビの討論番組" },
    3: { title: "大学の講義" },
    4: { title: "豊かさのパラドックス" },
    5: { title: "美術館の講演会" },
    6: { title: "言語学者の講演" },
    7: { title: "侘び寂び" },
    8: { title: "忖度" },
    9: { title: "行間を読む" },
    10: { title: "幸福と苦悩" },
    11: { title: "現代のマインドフルネス" },
    12: { title: "終身雇用制の功罪" },
    13: { title: "お返し" },
    14: { title: "本音と建前" },
    15: { title: "根回し" },
    16: { title: "現代のポピュリズム" },
    17: { title: "阿吽の呼吸" },
    18: { title: "忖度（そんたく）" },
    19: { title: "言語と自己の境界" },
    20: { title: "道具主義的な知" },
    21: { title: "物語の公共性" },
    22: { title: "プラスチック代替素材の落とし穴" },
    23: { title: "現代の孤独" },
    24: { title: "功利主義の限界" },
    25: { title: "幸福のパラドックス" },
    26: { title: "贈り物と沈黙" },
    27: { title: "文明の脆弱性" },
    28: { title: "互助組織の変容" },
    29: { title: "監視社会の変容" },
    30: { title: "実存の不条理" },
};

const listeningN2UnitInfo = {
    1: { title: "差し替える" },
    2: { title: "振り分ける" },
    3: { title: "平易" },
    4: { title: "中断" },
    5: { title: "トーン" },
    6: { title: "膨らむ" },
    7: { title: "効率" },
    8: { title: "概ね" },
    9: { title: "足踏み" },
    10: { title: "挽回" },
    11: { title: "詰め込み" },
    12: { title: "〜割" },
    13: { title: "後回し" },
    14: { title: "滞る" },
    15: { title: "先行研究" },
    16: { title: "引けを取らない" },
    17: { title: "経費で落とす" },
    18: { title: "情報の確認と配慮" },
    19: { title: "意見調整と高度な語彙" },
    20: { title: "トラブル把握と解決" },
    21: { title: "意思決定とビジネス敬語" },
    22: { title: "事情説明と慎重な配慮" },
    23: { title: "提案比較とメリット整理" },
    24: { title: "議論の着地点と高度な言い回し" },
    25: { title: "比喩表現と因果関係" },
    26: { title: "妥協点の提示と皮肉の理解" },
    27: { title: "柔軟な対応と感情の機微" },
    28: { title: "不祥事対応と条件比較" },
    29: { title: "婉曲表現と複雑な議論" },
    30: { title: "専門的視点と最上級語彙" }
};


const listeningN4UnitInfo = {
    1: { title: `相手（あいて）/ 挨拶（あいさつ） vs 意見（いけん）` },
    2: { title: `経験（けいけん） vs 制服（せいふく）` },
    3: { title: `体（からだ）/ 調子（ちょうし） vs 朝（あさ）/ ～ないで` },
    4: { title: `選手（せんしゅ） vs 合格（ごうかく）` },
    5: { title: `表情（ひょうじょう） vs 代わり（かわり）` },
    6: { title: `成功（せいこう） vs 期間（きかん）` },
    7: { title: `情報（じょうほう） vs 報告（ほうこく）` },
    8: { title: `組織（そしき） vs 現在（げんざい）` },
    9: { title: `変化（へんか） vs 確実（かくじつ）` },
    10: { title: `感謝（かんしゃ） vs 基礎（きそ）` },
    11: { title: `丁寧（ていねい） vs 複雑（ふくざつ）` },
    12: { title: `柔らかい（やわらかい） vs 珍しい（めずらしい）` },
    13: { title: `静か（しずか） vs 賑やか（にぎやか）` },
    14: { title: `一生懸命（いっしょうけんめい） vs 無理（むり）` },
    15: { title: `賛成（さんせい）/反対（はんたい） vs 合格（ごうかく）` },
    16: { title: `驚く（おどろく） vs 笑う（わらう）` },
    17: { title: `育てる（そだてる） vs 壊す（こわす）` },
    18: { title: `始める（はじめる） vs 終わる（おわる）` },
    19: { title: `通う（かよう） vs 移る（うつる）` },
    20: { title: `間に合う（まにあう） vs 遅れる（おくれる）` },
    21: { title: `開く（あく） vs 開ける（あける）` },
    22: { title: `割れる（われる） vs 折れる（おれる）` },
    23: { title: `慣れる（なれる） vs 驚く（おどろく）` },
    24: { title: `沸く（わく） vs 沸かす（わかす）` },
    25: { title: `並ぶ（ならぶ） vs 並べる（ならべる）` },
    26: { title: `続く（つづく） vs 続ける（つづける）` },
    27: { title: `並べる（ならべる） vs 飾る（かざる）` },
    28: { title: `汚れる（よごれる） vs 汚す（よごす）` },
    29: { title: `焼ける（やける） vs 焦げる（こげる）` },
    30: { title: `合格（ごうかく） vs 着く（つく）` }
};


/** Course & Level Selection */
function isCourseUnlocked(id) {
    return state.unlockedCourses.includes(id);
}

function selectCourse(id) {
    if (id === 'listening') {
        openListeningSelect();
        return;
    }
    if (isCourseUnlocked(id)) {
        openSubModeSelect(id);
    } else {
        if (id === 'oshikatsu') {
            openOshikatsuSalesBox();
        } else if (id === 'special_travel') {
            openSpecialTravelSalesBox();
        } else if (id === 'special_food') {
            openSpecialFoodSalesBox();
        } else if (id === 'special_medical') {
            openSpecialMedicalSalesBox();
        } else {
            // Unlock modal handles both purchase and points
            openUnlockModal(id, 'course');
        }
    }
}

function openOshikatsuSalesBox() {
    document.getElementById('oshikatsu-sales-box').style.display = 'flex';
}

function closeOshikatsuSalesBox() {
    document.getElementById('oshikatsu-sales-box').style.display = 'none';
}

function openSpecialTravelSalesBox() {
    document.getElementById('special-travel-sales-box').style.display = 'flex';
}

function closeSpecialTravelSalesBox() {
    document.getElementById('special-travel-sales-box').style.display = 'none';
}

function openSpecialFoodSalesBox() {
    document.getElementById('special-food-sales-box').style.display = 'flex';
}

function closeSpecialFoodSalesBox() {
    document.getElementById('special-food-sales-box').style.display = 'none';
}

function openSpecialMedicalSalesBox() {
    document.getElementById('special-medical-sales-box').style.display = 'flex';
}

function closeSpecialMedicalSalesBox() {
    document.getElementById('special-medical-sales-box').style.display = 'none';
}

function openListeningSelect() {
    document.getElementById('mode-selection').style.display = 'none';
    const selection = document.getElementById('listening-selection');
    selection.style.display = 'flex';
    const grid = document.getElementById('listening-grid');
    grid.innerHTML = "";

    const listeningCourses = ['baby_step', 'daily_life', 'communication'];
    listeningCourses.forEach(id => {
        const info = courseConfig[id];
        const btn = document.createElement('button');
        btn.className = 'mode-btn highlight';
        btn.innerHTML = `🎧 ${info.name}`;
        btn.onclick = () => {
            state.gameMode = 'listening';
            selection.style.display = 'none';
            openStorySelect(id);
        };
        grid.appendChild(btn);
    });

    // numberコース（学習/クイズのサブモード付き）
    const numInfo = courseConfig['number'];
    const numBtn = document.createElement('button');
    numBtn.className = 'mode-btn highlight';
    numBtn.style.background = '#E8F5E9';
    numBtn.style.borderColor = '#66BB6A';
    numBtn.style.color = '#2E7D32';
    numBtn.innerHTML = `🔢 ${numInfo.name}`;
    numBtn.onclick = () => {
        selection.style.display = 'none';
        openNumberSubMode();
    };
    grid.appendChild(numBtn);

    // businessコース（ทำงานกันเถอะ）
    const bizInfo = courseConfig['business'];
    const bizBtn = document.createElement('button');
    bizBtn.className = 'mode-btn highlight';
    bizBtn.style.background = '#E3F2FD';
    bizBtn.style.borderColor = '#42A5F5';
    bizBtn.style.color = '#1565C0';
    bizBtn.innerHTML = `💼 ${bizInfo.name}`;
    bizBtn.onclick = () => {
        selection.style.display = 'none';
        openBusinessSubMode();
    };
    grid.appendChild(bizBtn);

    // disasterコース（ภัยพิบัติ）
    const dsInfo = courseConfig['disaster'];
    const dsBtn = document.createElement('button');
    dsBtn.className = 'mode-btn highlight';
    dsBtn.style.background = '#FFF3E0';
    dsBtn.style.borderColor = '#FF9800';
    dsBtn.style.color = '#E65100';
    dsBtn.innerHTML = `⚠️ ${dsInfo.name}`;
    dsBtn.onclick = () => {
        selection.style.display = 'none';
        openDisasterSubMode();
    };
    grid.appendChild(dsBtn);

    // JLPT N5 (Listening)
    const n5Info = courseConfig['listening_n5'];
    const n4Info = courseConfig['listening_n4'];
    const n5Btn = document.createElement('button');
    n5Btn.className = 'mode-btn highlight';
    n5Btn.style.background = '#F3E5F5';
    n5Btn.style.borderColor = '#AB47BC';
    n5Btn.style.color = '#6A1B9A';
    n5Btn.innerHTML = `🎓 ${n5Info.name}`;
    n5Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN5SubMode();
    };
    grid.appendChild(n5Btn);

    const n4Btn = document.createElement('button');
    n4Btn.className = 'mode-btn highlight';
    n4Btn.style.background = '#E8EAF6'; // Light Indigo
    n4Btn.style.borderColor = '#5C6BC0'; // Indigo
    n4Btn.style.color = '#283593';
    n4Btn.innerHTML = `🎓 ${n4Info.name}`;
    n4Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN4SubMode();
    };
    grid.appendChild(n4Btn);

    


    const n2Info = courseConfig['listening_n2'];
    const n2PointsStr = n2Info.price === 'Free' ? 'Free' : `${n2Info.price} pts`;
    const n2LockStatus = isCourseUnlocked('listening_n2') ? '' : '<span class="lock-icon">🔒</span>';
    const n3Info = courseConfig['listening_n3'];
    const n3Btn = document.createElement('button');
    n3Btn.className = 'mode-btn highlight';
    n3Btn.style.background = '#E0F2F1'; // Light Teal
    n3Btn.style.borderColor = '#26A69A'; // Teal
    n3Btn.style.color = '#00695C';
    n3Btn.innerHTML = `🎓 ${n3Info.name}`;
    n3Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN3SubMode();
    };
    grid.appendChild(n3Btn);

    const n2Btn = document.createElement('button');
    n2Btn.className = 'mode-btn highlight';
    n2Btn.style.background = '#F3E5F5'; // Light Purple
    n2Btn.style.borderColor = '#AB47BC'; // Purple
    n2Btn.style.color = '#4A148C';
    n2Btn.innerHTML = `🎓 ${n2Info.name}`;
    n2Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN2SubMode();
    };
    grid.appendChild(n2Btn);
    const n1Info = courseConfig['listening_n1'];
    const n1Btn = document.createElement('button');
    n1Btn.className = 'mode-btn highlight';
    n1Btn.style.background = '#FFEBEE'; // Light Red
    n1Btn.style.borderColor = '#E53935'; // Red
    n1Btn.style.color = '#B71C1C';
    n1Btn.innerHTML = `🎓 ${n1Info.name}`;
    n1Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN1SubMode();
    };
    grid.appendChild(n1Btn);




    const backBtn = document.createElement('button');
    backBtn.className = 'mode-btn cancel';
    backBtn.innerText = 'ย้อนกลับ (Back)';
    backBtn.onclick = () => {
        selection.style.display = 'none';
        document.getElementById('mode-selection').style.display = 'flex';
    };
    grid.appendChild(backBtn);
}

function openNumberSubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startNumberMode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startNumberMode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startNumberMode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('number');
}

function openBusinessSubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startBusinessMode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startBusinessMode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startBusinessMode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('business');
}

function openDisasterSubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startDisasterMode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startDisasterMode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startDisasterMode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('disaster');
}

function openListeningN5SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN5Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN5Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN5Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n5');
}




function openListeningN1SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN1Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN1Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN1Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n1');
}

function openListeningN2SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN2Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN2Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN2Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n2');
}

function openListeningN3SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN3Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN3Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN3Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n3');
}

function openListeningN4SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN4Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN4Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN4Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n4');
}


function openModeSelect() {
    stopAllSpeech();
    stopCharacterAnimation();
    document.getElementById('mode-selection').style.display = 'flex';
    document.getElementById('lobby-ui').style.visibility = 'hidden';

    // Update all course buttons dynamically
    const grid = document.querySelector('#mode-selection .mode-grid');
    grid.innerHTML = ""; // Clear existing hardcoded buttons

    const courses = ['hiragana', 'katakana', 'n5', 'n4', 'n3', 'oshikatsu', 'special_travel', 'special_food', 'special_medical', 'listening'];
    courses.forEach(id => {
        const info = courseConfig[id];
        const unlocked = isCourseUnlocked(id);
        const btn = document.createElement('button');
        btn.className = 'mode-btn';
        if (unlocked) btn.classList.add('highlight');

        let label = info.name;
        if (!unlocked) {
            // Force key and price display for locked courses
            label = `🔑 ${info.name}<br><small>(${info.price})</small>`;
        }

        btn.innerHTML = label;
        if (id === 'listening') {
            btn.style.gridColumn = "span 2";
            btn.style.borderColor = "#4FC3F7";
            btn.style.color = "#0277BD";
            btn.style.background = "#E1F5FE";
            btn.innerHTML = "🎧 การฟัง (Listening)";
        }
        if (id === 'oshikatsu') {
            btn.style.gridColumn = "span 2";
            btn.style.borderColor = "#FF80AB";
            btn.style.color = "#D81B60";
            btn.style.background = unlocked ? "#FCE4EC" : "white";
            if (!unlocked) {
                btn.innerHTML = `🔑 กิจกรรมของโอตาคุ<br><small>(15 pts)</small>`;
            } else {
                btn.innerHTML = "กิจกรรมของโอตาคุ (Oshikatsu)";
            }
        }
        if (id === 'special_travel') {
            btn.style.gridColumn = "span 2";
            btn.style.borderColor = "#FF80AB";
            btn.style.color = "#D81B60";
            btn.style.background = unlocked ? "#FCE4EC" : "white";
            if (!unlocked) {
                btn.innerHTML = `🔑 เที่ยวญี่ปุ่นซับไววัล: 50 คำศัพท์ต้องรู้<br><small>(15 pts)</small>`;
            } else {
                btn.innerHTML = "เที่ยวญี่ปุ่นซับไววัล (Travel Survival)";
            }
        }
        if (id === 'special_food') {
            btn.style.gridColumn = "span 2";
            btn.style.borderColor = "#FF80AB";
            btn.style.color = "#D81B60";
            btn.style.background = unlocked ? "#FCE4EC" : "white";
            if (!unlocked) {
                btn.innerHTML = `🔑 ร้านอาหารและกูร์เมต์<br><small>(15 pts)</small>`;
            } else {
                btn.innerHTML = "ร้านอาหารและกูร์เมต์ (Food & Gourmet)";
            }
        }
        if (id === 'special_medical') {
            btn.style.gridColumn = "span 2";
            btn.style.borderColor = "#FF80AB";
            btn.style.color = "#D81B60";
            btn.style.background = unlocked ? "#FCE4EC" : "white";
            if (!unlocked) {
                btn.innerHTML = `🔑 แจ้งอาการป่วยและซื้อยา<br><small>(15 pts)</small>`;
            } else {
                btn.innerHTML = "แจ้งอาการป่วย (Medical & Pharmacy)";
            }
        }
        btn.onclick = () => selectCourse(id);
        grid.appendChild(btn);
    });

    // Add Shop Button at the bottom
    const shopBtn = document.createElement('button');
    shopBtn.className = 'mode-btn highlight';
    shopBtn.style.gridColumn = "span 2";
    shopBtn.style.marginTop = "10px";
    shopBtn.style.background = "#FFF9C4";
    shopBtn.innerHTML = "🛍️ ไปที่ร้าค้า (Outfit Shop)";
    shopBtn.onclick = () => { closeModeSelect(); openShop(); };
    grid.appendChild(shopBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'mode-btn cancel';
    cancelBtn.style.gridColumn = "span 2";
    cancelBtn.innerText = "ยกเลิก (Cancel)";
    cancelBtn.onclick = closeModeSelect;
    grid.appendChild(cancelBtn);
}

function closeModeSelect() {
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('lobby-ui').style.visibility = 'visible';
}

function openSubModeSelect(level) {
    state.selectedLevel = level;
    document.getElementById('mode-selection').style.display = 'none';

    if (['n5', 'n4', 'n3', 'n2'].includes(level)) {
        state.gameMode = 'story';
        openStorySelect(level);
        return;
    }

    document.getElementById('sub-selection').style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = "";

    if (level === 'oshikatsu' || level === 'special_travel' || level === 'special_food' || level === 'special_medical') {
        grid.innerHTML = `
            <button class="mode-btn highlight" onclick="setGameMode('learning')" style="background: #E0F7FA;">📖 เรียน (Learning)</button>
            <button class="mode-btn highlight" onclick="setGameMode('quiz')" style="background: #FFF9C4;">⚔️ ควิซ (Quiz)</button>
        `;
    } else if (level === 'hiragana' || level === 'katakana') {
        grid.innerHTML = `
            <button class="mode-btn highlight" onclick="window.location.href='piano.html?mode=' + state.selectedLevel" style="grid-column: span 2; background: #FFF5F8; border-color: #F8BBD0; color: #D81B60;">🎹 เปียโน (Piano)</button>
            <button class="mode-btn highlight" onclick="setGameMode('learning')" style="background: #E0F7FA;">📖 เรียน (Learning)</button>
            <button class="mode-btn highlight" onclick="setGameMode('quiz')" style="background: #FFF9C4;">⚔️ ควิซ (Quiz)</button>
        `;
    }

    grid.innerHTML += `
        <button class="mode-btn cancel" style="grid-column: span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openModeSelect();">ย้อนกลับ (Back)</button>
    `;
}

function setGameMode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect(state.selectedLevel);
}

async function openStorySelect(level) {
    document.getElementById('story-selection').style.display = 'flex';
    const titleText = courseConfig[level] ? courseConfig[level].name : level.toUpperCase();
    document.getElementById('story-level-title').innerText = titleText;
    const container = document.getElementById('story-list-container');
    container.innerHTML = "";

    let count = 10;
    if (level === 'oshikatsu' || level === 'special_travel') count = 5;
    if (level === 'special_food') count = 6;
    if (level === 'special_medical') count = 6;
    if (level === 'baby_step' || level === 'daily_life' || level === 'communication') count = 10;
    if (level === 'number') count = 5;
    if (level === 'business') count = 5;
    if (level === 'disaster') count = 5;
    if (['n5', 'n4', 'n3', 'n2'].includes(level)) count = 20;
    if (level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2' || level === 'listening_n1') count = 30;

    let previewData = [];
    try {
        if (['n5', 'n4', 'n3', 'n2'].includes(level)) {
            const mRes = await fetch(`./data/${level}.json`);
            previewData = await mRes.json();
        } else if (['hiragana', 'katakana'].includes(level)) {
            const mRes = await fetch(`./data/${level}_alphabet.json`);
            previewData = await mRes.json();
        }
    } catch (e) { }

    for (let i = 1; i <= count; i++) {
        const score = localStorage.getItem(`jlpt_with_gyaru_score_${level}_${state.gameMode}_u${i}`);
        const btn = document.createElement('button');
        btn.className = 'story-btn';

        let maxScore = 5;
        if (level === 'oshikatsu' || level === 'special_travel' || level === 'special_food' || level === 'special_medical' || level === 'baby_step' || level === 'daily_life' || level === 'communication' || level === 'number' || level === 'business') maxScore = 10;
        if (level === 'disaster') maxScore = (state.gameMode === 'quiz') ? 5 : 10;
        if (level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2' || level === 'listening_n1') maxScore = 10;

        if (score >= maxScore) btn.classList.add('perfect');

        let unitTitle = String(i);
        if (level === 'oshikatsu') {
            unitTitle = oshikatsuUnitInfo[i] ? oshikatsuUnitInfo[i].title : String(i);
        } else if (level === 'special_travel') {
            unitTitle = specialTravelUnitInfo[i] ? specialTravelUnitInfo[i].title : String(i);
        } else if (level === 'special_food') {
            unitTitle = specialFoodUnitInfo[i] ? specialFoodUnitInfo[i].title : String(i);
        } else if (level === 'special_medical') {
            unitTitle = specialMedicalUnitInfo[i] ? specialMedicalUnitInfo[i].title : String(i);
        } else if (level === 'baby_step') {
            unitTitle = babyStepUnitInfo[i] ? babyStepUnitInfo[i].title : String(i);
        } else if (level === 'daily_life') {
            unitTitle = dailyLifeUnitInfo[i] ? dailyLifeUnitInfo[i].title : String(i);
        } else if (level === 'communication') {
            unitTitle = communicationUnitInfo[i] ? communicationUnitInfo[i].title : String(i);
        } else if (level === 'number') {
            unitTitle = numberUnitInfo[i] ? numberUnitInfo[i].title : String(i);
        } else if (level === 'business') {
            unitTitle = businessUnitInfo[i] ? businessUnitInfo[i].title : String(i);
        } else if (level === 'disaster') {
            unitTitle = disasterUnitInfo[i] ? disasterUnitInfo[i].title : String(i);
        } else if (level === 'listening_n5') {
            unitTitle = listeningN5UnitInfo[i] ? listeningN5UnitInfo[i].title : String(i);
        } else if (level === 'listening_n4') {
            unitTitle = listeningN4UnitInfo[i] ? listeningN4UnitInfo[i].title : `Level ${i}`;
        } else if (level === 'listening_n3') {
            unitTitle = listeningN3UnitInfo[i] ? listeningN3UnitInfo[i].title : `Level ${i}`;
        } else if (level === 'listening_n1') {
            unitTitle = listeningN1UnitInfo[i] ? listeningN1UnitInfo[i].title : `Level ${i}`;
        } else if (level === 'listening_n2') {
            unitTitle = listeningN2UnitInfo[i] ? listeningN2UnitInfo[i].title : `Level ${i}`;
        } else if (previewData.length > 0) {
            if (['n5', 'n4', 'n3', 'n2'].includes(level)) {
                const offset = (i - 1) * 5;
                const items = previewData.slice(offset, offset + 3);
                if (items.length > 0) {
                    const words = items.map(it => it.thai || it.kanji || it.hiragana).join(', ');
                    unitTitle = `[${words}...]`;
                }
            } else if (['hiragana', 'katakana'].includes(level)) {
                const rowNamesTh = { 1: "วรรค อะ (a)", 2: "วรรค คะ (k)", 3: "วรรค ซะ (s)", 4: "วรรค ทะ (t)", 5: "วรรค นะ (n)", 6: "วรรค ฮะ (h)", 7: "วรรค มะ (m)", 8: "วรรค ยะ (y)", 9: "วรรค ระ (r)", 10: "วรรค วะ (w), อึ้น (n)" };
                unitTitle = rowNamesTh[i] || String(i);
            }
        }

        if (level === 'oshikatsu' || level === 'special_travel' || level === 'special_food' || level === 'special_medical' || level === 'baby_step' || level === 'daily_life' || level === 'communication' || level === 'number' || level === 'business' || level === 'disaster' || level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2' || level === 'listening_n1' || previewData.length > 0) {
            btn.style.gridColumn = "span 5";
            btn.style.width = "100%";
            btn.style.aspectRatio = "auto";
            btn.style.padding = "15px";
            btn.style.marginBottom = "5px";
            btn.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="unit-title" style="font-size:0.95rem; font-weight:bold; text-align:left;">${unitTitle}</span>
                    <span class="score" style="background:white; padding:4px 10px; border-radius:12px; font-weight:bold; color:#D81B60; min-width:35px;">
                        ${score !== null ? score + '/' + maxScore : '-'}
                    </span>
                </div>
            `;
        } else {
            btn.innerHTML = `<span class="num">${i}</span><span class="score">${score !== null ? score + '/' + maxScore : '-'}</span>`;
        }

        btn.onclick = () => { closeStorySelect(); startUnit(level, i); };
        container.appendChild(btn);
    }
}

function closeStorySelect() { document.getElementById('story-selection').style.display = 'none'; }

/** Game Core */
async function startUnit(level, unitNum) {
    state.selectedStoryNum = unitNum;
    state.storyStep = 0; state.correctCount = 0;

    let path = "";
    const padNum = String(unitNum).padStart(2, '0');

    if (level === 'oshikatsu') {
        path = `special_oshikatsu/${level}_${state.gameMode}_u${unitNum}.json`;
    } else if (level === 'special_travel') {
        path = `special_travel/${level}_${state.gameMode}_u${unitNum}.json`;
    } else if (level === 'special_food') {
        path = `special_food/${level}_${state.gameMode}_u${unitNum}.json`;
    } else if (level === 'special_medical') {
        path = `special_medical/${level}_${state.gameMode}_u${unitNum}.json`;
    } else if (level === 'baby_step') {
        path = `listening/baby_step/${level}_listening_l${unitNum}.json`;
    } else if (level === 'daily_life') {
        path = `listening/daily_life/${level}_listening_l${unitNum}.json`;
    } else if (level === 'communication') {
        path = `listening/communication/${level}_listening_l${unitNum}.json`;
    } else if (level === 'number') {
        const modeStr = (state.gameMode === 'quiz') ? 'quiz' : 'study';
        path = `listening/number/numbers_time_l${unitNum}_${modeStr}.json`;
    } else if (level === 'business') {
        const modeStr = (state.gameMode === 'quiz') ? 'quiz' : 'study';
        path = `listening/business/business_l${unitNum}_${modeStr}.json`;
    } else if (level === 'disaster') {
        const modeStr = (state.gameMode === 'quiz') ? 'quiz' : 'study';
        path = `listening/disaster/disaster_l${unitNum}_${modeStr}.json`;
    } else if (level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2' || level === 'listening_n1') {
        const modeStr = (state.gameMode === 'quiz') ? 'quiz' : 'study';
        const levelPrefix = level === 'listening_n1' ? 'n1' : (level === 'listening_n2' ? 'n2' : (level === 'listening_n3' ? 'n3' : (level === 'listening_n4' ? 'n4' : 'n5')));
        path = `listening/jlpt_${levelPrefix}/${levelPrefix}_${modeStr}_level${unitNum}.json`;
    } else if (level === 'hiragana' || level === 'katakana') {
        path = `${level}_level${unitNum}.json`;
    } else {
        path = `story_${level}_${padNum}.json`;
    }

    try {
        if (['n5', 'n4', 'n3', 'n2', 'n1', 'listening_n5', 'listening_n4', 'listening_n3', 'listening_n2', 'listening_n1'].includes(level)) {
            const fetchLevel = level.replace('listening_', '');
            const mRes = await fetch(`./data/${fetchLevel}.json`);
            state.masterData = await mRes.json();
            state.selectedLevel = level;
        } else {
            state.selectedLevel = level;
        }

        const res = await fetch('./data/' + path);
        if (!res.ok) throw new Error("File not found");
        const payload = await res.json();
        if (level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2' || level === 'listening_n1') {
            state.storyData = payload.data || payload.questions || [];
        } else {
            state.storyData = payload;
        }

        showProgressBar(state.storyData.length);
        document.getElementById('lobby-ui').style.visibility = 'visible';
        document.getElementById('main-action').style.display = 'none';
        document.getElementById('answer-grid').style.display = 'grid';
        loadScene();
    } catch (e) {
        console.error("fetch failed in startUnit:", e);
        alert("ขออภัย ไม่พบไฟล์ข้อมูลของบทเรียนนี้ค่ะ - " + (e.message || String(e)));
        openModeSelect();
    }
}

function loadScene() {
    const step = state.storyData[state.storyStep];

    // Normalize N5 fields
    if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1') {
        if (state.gameMode === 'learning') {
            step.correct_answer = step.correct_answer || 'เข้าใจแล้ว (Next)';
            step.options = [step.correct_answer];
        } else {
            step.correct_answer = step.correct_answer || step.answer;
        }
    }
    const diag = document.getElementById('dialogue-text');
    const grid = document.getElementById('answer-grid');
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = '1fr 1fr'; // default

    // Update Progress UI
    updateProgressBar(state.storyStep, state.storyData.length);

    if (['n5', 'n4', 'n3'].includes(state.selectedLevel)) {
        diag.innerHTML = `<b>${step.speaker_th}</b><br>${step.question_th}`;
        speakThai(step.speaker_th);

        const targetWord = state.masterData.find(w => w.id === step.target_id);

        // Generate options (1 correct, 3 random incorrect)
        let options = [targetWord];
        let others = state.masterData.filter(w => w.id !== targetWord.id);
        others = shuffleArray(others);
        options.push(...others.slice(0, 3));
        options = shuffleArray(options);

        options.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'mode-btn highlight';
            const mainText = opt.kanji || opt.character || opt.thai;
            const subText = opt.hiragana || opt.romaji || '';
            b.innerHTML = `<span style="font-size:1.2rem; font-weight:bold;">${mainText}</span><br><small style="color:#666;">${subText}</small>`;
            b.onclick = () => checkNormalAnswer(opt, targetWord);
            grid.appendChild(b);
        });
    } else {
        const titleStr = `${state.selectedStoryNum}`;
        let actualGameMode = state.gameMode;
        if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1') actualGameMode = 'listening'; // Trick to set isListening locally
        const isListening = (actualGameMode === 'listening' || state.gameMode === 'listening');
        const qText = isListening ? "🔊 ฟังอีกครั้ง (Replay)" : (step.display_text || '');

        if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1') {
            let n5Content = "";
            if (state.gameMode === 'learning') {
                n5Content = `<span style="color:#00796B;"><b>${step.focus_thai_key || ''}</b></span><br><br><span style="font-size:0.95rem;">${step.thai_explanation || ''}</span>`;
            } else {
                n5Content = `<span style="font-size:1.1rem;">🎧 กรุณาฟังบทสนทนาและเลือกคำตอบที่ถูกต้อง</span>`;
            }
            const displayLevel = state.selectedLevel.replace('listening_', '').toUpperCase();
            diag.innerHTML = `<b style="font-size:1.1rem; color:#888;">บทที่ ${titleStr} - JLPT ${displayLevel} ${state.gameMode.toUpperCase()}</b><br><br><div id="n5-speaker-indicator" style="font-size: 1.5rem; text-align: center; height: 35px; margin-bottom: 5px;"></div>${n5Content}<br><br><button class="mode-btn highlight" style="font-size:1.3rem; padding:12px 24px; width:auto; border-radius:15px; box-shadow:0 4px 0 #4DD0E1; cursor:pointer;" onclick="replayAudio()">🔊 ฟังอีกครั้ง (Replay)</button>`;
        } else {
            diag.innerHTML = `<b style="font-size:1.1rem; color:#888;">บทที่ ${titleStr} - ${state.gameMode.toUpperCase()}</b><br>${step.dialogue || ''}<br><br>
                              <button class="mode-btn highlight" style="font-size:1.3rem; padding:12px 24px; width:auto; border-radius:15px; box-shadow:0 4px 0 #4DD0E1; cursor:pointer;" onclick="replayAudio()">
                                ${qText}
                              </button>`;
        }

        // Sequential TTS
        const audioTarget = step.correct_answer || step.display_text;
        const isJpDialogueCourse = ['business', 'disaster', 'number'].includes(state.selectedLevel);
        if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1') {
            const steps = step.audio_steps || step.dialogue || [];
            speakListeningN5Sequence(steps);
            state.currentTargetAudio = steps; // Store array for replay
        } else if (!isListening) {
            if (isJpDialogueCourse) {
                // dialogue・correct_answerが両方日本語のコース
                speakJapanese(step.dialogue || audioTarget);
            } else {
                speakSequence(step.dialogue || null, audioTarget || null);
            }
        } else {
            speakJapanese(audioTarget);
        }

        // Store target for replay
        if (state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4' && state.selectedLevel !== 'listening_n3' && state.selectedLevel !== 'listening_n2' && state.selectedLevel !== 'listening_n1') {
            state.currentTargetAudio = audioTarget;
        }

        const choices = state.gameMode === 'learning' ? [step.correct_answer] : shuffleArray([...step.options]);
        if (choices.length === 1) {
            grid.style.gridTemplateColumns = '1fr';
        }

        choices.forEach(c => {
            const b = document.createElement('button');
            b.className = 'mode-btn highlight';
            b.innerText = c;
            b.onclick = () => checkAnswer(c, step);
            grid.appendChild(b);
        });
    }
}

function checkNormalAnswer(selectedOpt, targetWord) {
    if (state.isAnimating) return;
    stopAllSpeech(); // Stop reading the problem
    state.isAnimating = true;
    const isCorrect = (selectedOpt.id === targetWord.id);

    if (isCorrect) {
        state.correctCount++;
        showCharacterReaction('hart', 1500);
        speakThai("เก่งมากค่ะ!");
    } else {
        showCharacterReaction('naku', 1500);
        speakThai("พยายามใหม่นะคะ");
    }

    const diag = document.getElementById('dialogue-text');
    const mainWord = targetWord.kanji || targetWord.character || targetWord.hiragana;
    const subWord = targetWord.hiragana || targetWord.romaji || '';
    diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${mainWord} ${subWord ? `(${subWord})` : ''} = ${targetWord.thai}`;

    // Play Japanese pronunciation for the correct answer
    speakJapanese(mainWord);

    const startTime = Date.now();
    let hasSpeechFinished = false;
    let finishTime = 0;

    function checkAndAdvance() {
        const elapsed = Date.now() - startTime;
        const isSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;

        if (!hasSpeechFinished) {
            // Wait until speech has started and finished, or at least 1500ms has passed to be safe
            if (!isSpeaking && elapsed > 1500) {
                hasSpeechFinished = true;
                finishTime = Date.now();
            }
            setTimeout(checkAndAdvance, 300);
        } else {
            // Wait 2000ms after speech has finished
            if (Date.now() - finishTime < 2000) {
                setTimeout(checkAndAdvance, 300);
            } else {
                state.isAnimating = false;
                state.storyStep++;
                if (state.storyStep < state.storyData.length) loadScene();
                else finishUnit();
            }
        }
    }
    setTimeout(checkAndAdvance, 500);
}

function checkAnswer(choice, step) {
    if (state.isAnimating) return;
    stopAllSpeech();
    state.isAnimating = true;
    const isCorrect = (choice === step.correct_answer);

    if (isCorrect) {
        state.correctCount++;
        showCharacterReaction('hart', 1500);
        speakThai("เก่งมากค่ะ!");
    } else {
        showCharacterReaction('naku', 1500);
        speakThai("พยายามใหม่นะคะ");
    }

    // Normalize N5 fields
    if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1') {
        if (state.gameMode === 'learning') {
            step.correct_answer = step.correct_answer || 'เข้าใจแล้ว (Next)';
            step.options = [step.correct_answer];
        } else {
            step.correct_answer = step.correct_answer || step.answer;
        }
    }
    const diag = document.getElementById('dialogue-text');
    let fullWord = step.correct_answer;
    if (step.display_text && step.display_text.includes('○')) {
        fullWord = step.display_text.replace('○', step.correct_answer).replace(/\s+/g, '');
    }

    if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1') {
        if (state.gameMode === 'learning') {
            diag.innerHTML = `<b>${isCorrect ? 'เก่งมาก!' : 'เสียดาย...'}</b>`;
        } else {
            diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${step.answer || step.correct_answer}`;
            speakJapanese(fullWord);
        }
    } else if (step.explanation) {
        diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>${step.explanation}`;
        speakJapanese(fullWord);
    } else {
        diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${fullWord}`;
        speakJapanese(fullWord);
    }

    const startTime = Date.now();
    let hasSpeechFinished = false;
    let finishTime = 0;

    function checkAndAdvance() {
        const elapsed = Date.now() - startTime;
        const isSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;

        if (!hasSpeechFinished) {
            // Wait until speech has started and finished, or at least 1500ms has passed to be safe
            if (!isSpeaking && elapsed > 1500) {
                hasSpeechFinished = true;
                finishTime = Date.now();
            }
            setTimeout(checkAndAdvance, 300);
        } else {
            // Wait 2000ms after speech has finished
            if (Date.now() - finishTime < 2000) {
                setTimeout(checkAndAdvance, 300);
            } else {
                state.isAnimating = false;
                state.storyStep++;
                if (state.storyStep < state.storyData.length) loadScene();
                else finishUnit();
            }
        }
    }
    setTimeout(checkAndAdvance, 500);
}

function finishUnit() {
    localStorage.setItem(`jlpt_with_gyaru_score_${state.selectedLevel}_${state.gameMode}_u${state.selectedStoryNum}`, state.correctCount);
    document.getElementById('answer-grid').style.display = 'none';
    hideProgressBar();
    showResultModal(state.correctCount, state.storyData.length);
}

function showResultModal(c, t) {
    const modal = document.getElementById('result-modal');
    document.getElementById('result-score').innerText = `${c} / ${t}`;

    const ratio = t > 0 ? (c / t) : 0;
    let animState = 'normal';
    let msg = "";
    if (ratio === 1) { animState = 'hart'; msg = "สมบูรณ์แบบ! (Perfect!)"; }
    else if (ratio >= 0.8) { animState = 'good'; msg = "เยี่ยมมาก! (Great!)"; }
    else if (ratio >= 0.5) { animState = 'normal'; msg = "ทำได้ดี! (Good!)"; }
    else if (ratio > 0) { animState = 'zannen'; msg = "สู้ๆ นะ! (Keep trying!)"; }
    else { animState = 'naku'; msg = "ไม่เป็นไร เอาใหม่นะ! (Don't give up!)"; }

    document.getElementById('result-message').innerText = msg;

    const img = document.getElementById('result-img');
    const base = (state.selectedCharacter === 'default') ? './assets/images/' : `images/${state.selectedCharacter}/`;
    let file = 'normal.png';
    if (state.selectedCharacter === 'default') {
        if (animState === 'nikkori') file = 'smile.png';
        if (animState === 'good' || animState === 'hart') file = 'good.png';
        if (animState === 'naku' || animState === 'odoroki' || animState === 'zannen') file = 'no.png';
    } else {
        const assets = characterAssets[state.selectedCharacter];
        file = assets[animState] || assets['normal'];
    }
    img.src = base + file;

    modal.style.display = 'flex';
    document.getElementById('result-close').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('main-action').style.display = 'block';
        openModeSelect();
    };
}

/** Shop & Outfits */
function openShop() {
    updateShopUI();
    document.getElementById('shop-modal').style.display = 'flex';
}
function closeShop() { document.getElementById('shop-modal').style.display = 'none'; }

function updateShopUI() {
    const list = document.getElementById('shop-list');
    list.innerHTML = "";
    config.outfits.forEach(o => {
        if (o.id === 'default') return;
        const owned = state.unlockedOutfits.includes(o.id);
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <img src="${o.thumbnail}">
            <div class="shop-item-info">
                <div class="shop-item-name">${o.name}</div>
                <div style="font-size:0.8rem; color:#666;">${o.price}</div>
            </div>
            <button class="shop-item-btn ${owned ? 'owned' : ''}" onclick="handleShopClick('${o.id}')">
                ${owned ? '着替える' : 'ปลดล็อก'}
            </button>
        `;
        list.appendChild(div);
    });
}

function handleShopClick(id) {
    if (state.unlockedOutfits.includes(id)) {
        changeCharacter(id);
        closeShop();
    } else {
        openUnlockModal(id, 'outfit');
    }
}

function changeCharacter(id) {
    state.selectedCharacter = id;
    localStorage.setItem('jlpt_with_gyaru_selectedCharacter', id);
    setCharacterState('normal');
    alert("เปลี่ยนชุดเรียบร้อยแล้วค่ะ");
}

/** Character & Anim */
function setCharacterState(s) {
    const img = document.getElementById('heroine-img');
    const base = (state.selectedCharacter === 'default') ? './assets/images/' : `images/${state.selectedCharacter}/`;

    // Map states to files
    let file = 'normal.png';
    if (state.selectedCharacter === 'default') {
        if (s === 'nikkori') file = 'smile.png';
        if (s === 'good' || s === 'hart') file = 'good.png';
        if (s === 'naku' || s === 'odoroki') file = 'no.png';
    } else {
        const assets = characterAssets[state.selectedCharacter];
        file = assets[s] || assets['normal'];
    }
    img.src = base + file;
}

function showCharacterReaction(t, d) {
    setCharacterState(t);
    setTimeout(() => setCharacterState('normal'), d);
}

function startCharacterAnimation() {
    clearInterval(state.characterAnimationId);
    let toggle = false;
    state.characterAnimationId = setInterval(() => {
        toggle = !toggle;
        setCharacterState(toggle ? 'nikkori' : 'normal');
    }, 1500);
}

function stopCharacterAnimation() { clearInterval(state.characterAnimationId); }

/** Utility */
function shuffleArray(a) { return a.sort(() => Math.random() - 0.5); }

// ---- TTS (バックアップ完全準拠版) ----
// GC防止: utteranceをグローバル変数で保持
const _uList = [];

function speakThai(t) {
    if (!t) return;
    stopAllSpeech();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'th-TH';
    u.volume = parseFloat(state.ttsVolume) || 1.0;
    _uList.push(u);
    window.speechSynthesis.speak(u);
}

function speakJapanese(t) {
    if (!t) return;
    // バックアップと同じ: cancel()を呼ばずに直接speak()
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'ja-JP';
    u.rate = parseFloat(state.ttsRate) || 0.8;
    u.volume = parseFloat(state.ttsVolume) || 1.0;
    _uList.push(u);
    window.speechSynthesis.speak(u);
}

function speakSequence(thaiText, japaneseText) {
    stopAllSpeech();
    if (thaiText) {
        const u1 = new SpeechSynthesisUtterance(thaiText);
        u1.lang = 'th-TH';
        u1.volume = parseFloat(state.ttsVolume) || 1.0;
        _uList.push(u1);
        const u2 = japaneseText ? new SpeechSynthesisUtterance(japaneseText) : null;
        if (u2) { u2.lang = 'ja-JP'; u2.rate = parseFloat(state.ttsRate) || 0.8; u2.volume = parseFloat(state.ttsVolume) || 1.0; _uList.push(u2); }
        // Thai後にJapaneseをonendでチェーン（cancel後のロックを回避）
        if (u2) u1.onend = () => window.speechSynthesis.speak(u2);
        window.speechSynthesis.speak(u1);
    } else if (japaneseText) {
        speakJapanese(japaneseText);
    }
}

function stopAllSpeech() {
    window.speechSynthesis.cancel();
    _uList.length = 0;
    if (typeof n5CurrentPlaybackId !== 'undefined') n5CurrentPlaybackId++;
}

function showProgressBar(t) {
    const c = document.getElementById('progress-container');
    c.style.display = 'flex';
    c.dataset.total = t;
    updateProgressBar(0, t);
}
function updateProgressBar(c, t) {
    const pText = document.getElementById('progress-text');
    const pFill = document.getElementById('progress-fill');
    const pIcon = document.getElementById('progress-icon');
    if (pText) pText.innerText = `${c}/${t}`;
    const pct = t > 0 ? (c / t) * 100 : 0;
    if (pFill) pFill.style.width = `${pct}%`;
    if (pIcon) pIcon.style.left = `${pct}%`;
}
function hideProgressBar() { document.getElementById('progress-container').style.display = 'none'; }
function openMainMenu() { document.getElementById('main-menu').style.display = 'flex'; }
function closeMainMenu() { document.getElementById('main-menu').style.display = 'none'; }
function openSettings() {
    state.previewIndex = config.outfits.findIndex(o => o.id === state.selectedCharacter);
    updateSettingsPreview();
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function updateSettingsPreview() {
    const outfit = config.outfits[state.previewIndex];
    const img = document.getElementById('settings-preview-img');
    const nameText = document.getElementById('preview-outfit-name');
    const applyBtn = document.getElementById('apply-outfit-btn');

    img.src = outfit.thumbnail;
    nameText.innerText = outfit.name;

    const isUnlocked = state.unlockedOutfits.includes(outfit.id);
    if (isUnlocked) {
        applyBtn.innerText = "เปลี่ยนชุด (Apply)";
        applyBtn.classList.add('highlight');
        applyBtn.disabled = false;
    } else {
        applyBtn.innerText = "ยังไม่ได้ปลดล็อก (Locked)";
        applyBtn.classList.remove('highlight');
        applyBtn.disabled = true;
    }
}

function previewPrev() {
    state.previewIndex = (state.previewIndex - 1 + config.outfits.length) % config.outfits.length;
    updateSettingsPreview();
}

function previewNext() {
    state.previewIndex = (state.previewIndex + 1) % config.outfits.length;
    updateSettingsPreview();
}

function applyPreviewedOutfit() {
    const outfit = config.outfits[state.previewIndex];
    if (state.unlockedOutfits.includes(outfit.id)) {
        changeCharacter(outfit.id);
    }
}
function getJapaneseVoice(gender) {
    const voices = window.speechSynthesis.getVoices();
    const jaVoices = voices.filter(v => v.lang.startsWith('ja'));
    if (jaVoices.length === 0) return null;

    if (gender === 'man') {
        const maleVoice = jaVoices.find(v =>
            v.name.includes('Otoya') ||
            v.name.includes('Ichiro') ||
            v.name.includes('Keita') ||
            v.name.toLowerCase().includes('male')
        );
        return { voice: maleVoice || jaVoices[0], isNativeMale: !!maleVoice };
    } else {
        const femaleVoice = jaVoices.find(v =>
            v.name.includes('Kyoko') ||
            v.name.includes('Ayumi') ||
            v.name.includes('Haruka') ||
            v.name.includes('Nanami') ||
            v.name.toLowerCase().includes('female')
        );
        return { voice: femaleVoice || jaVoices[0] };
    }
}

let n5CurrentPlaybackId = 0;
function speakListeningN5Sequence(steps) {
    if (!steps || steps.length === 0) return;

    // Clear callbacks on existing utterances to prevent them firing during cancel()
    _uList.forEach(u => {
        u.onend = null;
        u.onerror = null;
    });
    stopAllSpeech();

    n5CurrentPlaybackId++;
    const myPlaybackId = n5CurrentPlaybackId;
    let currentIdx = 0;

    function playNext() {
        if (myPlaybackId !== n5CurrentPlaybackId) return; // Sequence aborted
        if (currentIdx >= steps.length) {
            const indicator = document.getElementById('n5-speaker-indicator');
            if (indicator) indicator.innerHTML = '';
            return;
        }
        const step = steps[currentIdx];
        const text = step.text;
        const role = step.role;

        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';

        const rate = parseFloat(state.ttsRate) || 0.8;
        u.rate = rate;
        u.volume = parseFloat(state.ttsVolume) || 1.0;

        if (role === 'man') {
            const mv = getJapaneseVoice('man');
            if (mv) {
                u.voice = mv.voice;
                u.pitch = mv.isNativeMale ? 1.0 : 0.6;
            }
        } else if (role === 'women') { // Fixed typo "women" instead of "woman" from JSON roles
            const fv = getJapaneseVoice('woman');
            if (fv) {
                u.voice = fv.voice;
                u.pitch = 1.0;
            }
        } else {
            const nv = getJapaneseVoice('woman');
            if (nv) {
                u.voice = nv.voice;
                u.pitch = 1.0;
            }
        }

        const indicator = document.getElementById('n5-speaker-indicator');
        if (indicator) {
            if (role === 'man') indicator.innerHTML = '👨🏻 (Man)';
            else if (role === 'women' || role === 'woman') indicator.innerHTML = '👩🏻 (Woman)';
            else indicator.innerHTML = '🗣️ (Narrator)';
        }

        u.onend = () => {
            if (myPlaybackId !== n5CurrentPlaybackId) return;
            if (indicator) indicator.innerHTML = '';
            currentIdx++;
            // Small gap between speakers for natural flow and to avoid engine choke
            setTimeout(playNext, 300);
        };
        u.onerror = (e) => {
            if (myPlaybackId !== n5CurrentPlaybackId) return;
            if (indicator) indicator.innerHTML = '';
            currentIdx++;
            setTimeout(playNext, 300);
        };

        _uList.push(u);
        window.speechSynthesis.speak(u);
    }

    // Slight delay before starting sequence to ensure previous cancels are flushed
    setTimeout(playNext, 100);
}

function replayAudio() {
    if (state.currentTargetAudio) {
        if (Array.isArray(state.currentTargetAudio)) {
            speakListeningN5Sequence(state.currentTargetAudio);
        } else {
            speakJapanese(state.currentTargetAudio);
        }
    }
}
