// Multilingual localization dictionary for Lucky Shrine (TH, EN, ZH)

export type SupportedLang = 'th' | 'en' | 'zh';

export interface Translations {
  appName: string;
  appSubtitle: string;
  home: string;
  backHome: string;
  soundOn: string;
  soundOff: string;
  installApp: string;
  journal: string;
  journalTitle: string;
  journalEmpty: string;
  journalEmptyDesc: string;
  journalAll: string;
  journalSticks: string;
  journalTarot: string;
  journalNumbers: string;
  journalSaved: string;
  journalDelete: string;
  journalClearAll: string;
  journalClearConfirm: string;
  journalClearConfirmPrompt: string;
  journalCancel: string;
  journalConfirmClearBtn: string;
  journalSaveBtn: string;
  journalSavedBtn: string;
  journalViewCard: string;
  saveAndShareBtn: string;
  journalNotes: string;
  journalAddNotes: string;
  savedToJournal: string;
  
  // Card generation
  cardTitle: string;
  cardSubtitle: string;
  cardSavePng: string;
  cardShare: string;
  cardCopy: string;
  cardCopied: string;
  cardGenerating: string;
  cardClose: string;
  cardAuspiciousSeal: string;
  cardZodiacLabel: string;
  cardElementLabel: string;
  cardAuraLabel: string;
  cardShareSuccess: string;
  
  // PWA
  pwaInstallTitle: string;
  pwaInstallDesc: string;
  pwaIosStep1: string;
  pwaIosStep2: string;
  pwaOfflineMsg: string;
  pwaClose: string;

  // Topics / Navigation
  topicStick: string;
  topicTarot: string;
  topicNumber: string;
  topicRitual: string;
  topicLove: string;
  topicScan: string;
  topicMeditation: string;
  topicFestival: string;
  topicAuspicious: string;
  
  // Siamese Sticks
  stickTitle: string;
  stickLead: string;
  stickShakeBtn: string;
  stickHoldBtn: string;
  stickShakePower: string;
  stickFallenNotice: string;
  stickPuaPoiPrompt: string;
  stickTossPuaPoi: string;
  stickAffirmationSuccess: string;
  stickAffirmationFail: string;
  stickAffirmationLaugh: string;
  stickDrawAgain: string;
  stickReadMode: string;
  stickListenMode: string;
  stickAspectFinance: string;
  stickAspectLove: string;
  stickAspectHealth: string;
  stickAspectCareer: string;
  stickViewCardBtn: string;

  // Tarot
  tarotTitle: string;
  tarotLead: string;
  tarotDaily: string;
  tarot3Cards: string;
  tarot5Cards: string;
  tarotShuffleBtn: string;
  tarotFlipAll: string;
  tarotUpright: string;
  tarotReversed: string;
  tarotViewCardBtn: string;

  // Lucky Numbers
  luckyNumberTitle: string;
  luckyNumberLead: string;
  lucky2Digits: string;
  lucky3Digits: string;
  luckyBurnLevelNotice: string;
  luckyRevealComplete: string;
  luckyTalismanBurnHint: string;
  luckyViewCardBtn: string;

  // Rituals
  ritualTitle: string;
  ritualCandle: string;
  ritualLantern: string;
  ritualRemedy: string;
  ritualOffering: string;
  ritualRemedyClash: string;
  ritualRemedyHarm: string;
  ritualRemedyBreak: string;
  ritualRemedyDirect: string;
  ritualRemedySafe: string;
  ritualRemedyViewCard: string;

  // Gate / Selection
  gateChooseSystem: string;
  gateChooseSystemSub: string;
  gateEnterShrine: string;
  gateSelectSymbol: string;
}

export const TRANSLATIONS: Record<SupportedLang, Translations> = {
  th: {
    appName: 'ศาลเจ้าแห่งโชคลาภ',
    appSubtitle: 'โหราศาสตร์สากลและสะเดาะเคราะห์',
    home: 'หน้าหลัก',
    backHome: 'กลับหน้าหลัก',
    soundOn: 'เปิดเสียงดนตรี',
    soundOff: 'ปิดเสียงดนตรี',
    installApp: 'ติดตั้งแอป',
    journal: 'สมุดดวง',
    journalTitle: 'สมุดดวงชะตามงคล',
    journalEmpty: 'ยังไม่มีประวัติดวงชะตา',
    journalEmptyDesc: 'เมื่อท่านเสี่ยงเซียมซี เปิดไพ่ยิปซี หรือเบิกเลขมงคล สามารถกดปุ่ม "บันทึก&แชร์" เพื่อบันทึกคำทำนายเก็บไว้ที่นี่',
    journalAll: 'ทั้งหมด',
    journalSticks: 'เซียมซี',
    journalTarot: 'ไพ่ยิปซี',
    journalNumbers: 'เลขมงคล',
    journalSaved: 'บันทึกแล้ว',
    journalDelete: 'ลบ',
    journalClearAll: 'ล้างประวัติทั้งหมด',
    journalClearConfirm: 'ท่านต้องการล้างประวัติดวงชะตาทั้งหมดหรือไม่?',
    journalClearConfirmPrompt: 'ต้องการล้างประวัติดวงชะตาทั้งหมดจริงหรือไม่? ข้อมูลจะถูกลบถาวร',
    journalCancel: 'ยกเลิก',
    journalConfirmClearBtn: 'ล้างทั้งหมดจริง',
    journalSaveBtn: '📖 บันทึกลงสมุดดวง',
    journalSavedBtn: '✓ บันทึกในสมุดดวงแล้ว',
    journalViewCard: '🎴 การ์ดมงคล',
    saveAndShareBtn: '🎴 บันทึก&แชร์',
    journalNotes: 'บันทึกส่วนตัว / คำอธิษฐาน',
    journalAddNotes: 'เขียนบันทึกหรือคำขอพร...',
    savedToJournal: '📖 บันทึกลงในสมุดดวงชะตาเรียบร้อยแล้ว',
    
    cardTitle: 'ศาลเจ้าแห่งโชคลาภ',
    cardSubtitle: 'LUCKY SHRINE · แผ่นป้ายลิขิตฟ้าชะตามงคล',
    cardSavePng: '💾 บันทึกรูปภาพ PNG',
    cardShare: '📤 แชร์ดวงชะตา',
    cardCopy: '📋 คัดลอกภาพ',
    cardCopied: 'คัดลอกรูปลงคลิปบอร์ดแล้ว',
    cardGenerating: 'กำลังเนรมิตการ์ดมงคล...',
    cardClose: 'ปิด',
    cardAuspiciousSeal: 'มั่งมี ศรีสุข · 吉祥如意',
    cardZodiacLabel: 'ระบบจักรราศี',
    cardElementLabel: 'ธาตุประจำตัว',
    cardAuraLabel: 'ออร่ามงคล',
    cardShareSuccess: 'แชร์การ์ดมงคลเรียบร้อย',

    pwaInstallTitle: 'ติดตั้งศาลเจ้าแห่งโชคลาภบนหน้าจอมือถือ',
    pwaInstallDesc: 'เปิดใช้งานได้สะดวกรวดเร็ว ประมวลผลลื่นไหล 100% แม้ไม่มีอินเทอร์เน็ต',
    pwaIosStep1: '1. แตะที่ปุ่ม Share (แชร์) ด้านล่างของ Safari',
    pwaIosStep2: '2. เลื่อนลงแล้วเลือก "Add to Home Screen" (เพิ่มไปยังหน้าจอโฮม)',
    pwaOfflineMsg: 'โหมดออฟไลน์ — ประมวลผลในเครื่อง 100% ปลอดภัย ไร้กังวล',
    pwaClose: 'ปิด',

    topicStick: 'เสี่ยงเซียมซี',
    topicTarot: 'ไพ่ยิปซี',
    topicNumber: 'เลขมงคล',
    topicRitual: 'สะเดาะเคราะห์',
    topicLove: 'ดวงความรัก',
    topicScan: 'สแกนดวง',
    topicMeditation: 'สมาธิ',
    topicFestival: 'ไหว้พระขอพร',
    topicAuspicious: 'ฤกษ์มงคล',

    stickTitle: 'เซียมซีโบราณ',
    stickLead: 'ตั้งจิตอธิษฐาน เขย่ากระบอกเซียมซี แล้วโยนไม้ปัวปวยเพื่อยืนยันคำทำนาย',
    stickShakeBtn: 'เขย่ากระบอกเซียมซี',
    stickHoldBtn: 'กดค้างเพื่อเขย่า',
    stickShakePower: 'พลังแรงสั่นสะเทือน',
    stickFallenNotice: 'ไม้เซียมซีหล่นออกมาแล้ว!',
    stickPuaPoiPrompt: 'โปรดโยนไม้ปัวปวย (ปัวปวย) เพื่อขอยืนยันคำทำนายจากสิ่งศักดิ์สิทธิ์',
    stickTossPuaPoi: 'โยนไม้ปัวปวย',
    stickAffirmationSuccess: 'เซ้งปวย (หงาย 1 คว่ำ 1) — สิ่งศักดิ์สิทธิ์ยืนยันคำทำนายนี้!',
    stickAffirmationFail: '่อิมปวย (คว่ำทั้งคู่) — สิ่งศักดิ์สิทธิ์ให้ตั้งจิตใหม่แล้วเขย่าอีกครั้ง',
    stickAffirmationLaugh: 'เปี้ยปวย (หงายทั้งคู่) — สิ่งศักดิ์สิทธิ์ยิ้มแย้ม ให้เสี่ยงทายใหม่',
    stickDrawAgain: 'เสี่ยงทายอีกครั้ง',
    stickReadMode: 'อ่านคำทำนาย',
    stickListenMode: 'อ่าน',
    stickAspectFinance: 'การเงิน & โชคลาภ',
    stickAspectLove: 'ความรัก & ครอบครัว',
    stickAspectHealth: 'สุขภาพ & ร่างกาย',
    stickAspectCareer: 'การงาน & ธุรกิจ',
    stickViewCardBtn: '🎴 บันทึก&แชร์',

    tarotTitle: 'ไพ่ยิปซีสากล',
    tarotLead: 'เลือกรูปแบบการเปิดไพ่ ตั้งคำถามในใจ แล้วแตะไพ่แต่ละใบเพื่อพลิกดู',
    tarotDaily: 'ไพ่ประจำวัน (1 ใบ)',
    tarot3Cards: 'อดีต · ปัจจุบัน · อนาคต (3 ใบ)',
    tarot5Cards: 'ภาพรวมชะตา (5 ใบ)',
    tarotShuffleBtn: 'สับไพ่และจั่ว',
    tarotFlipAll: 'พลิกทั้งหมด',
    tarotUpright: 'ไพ่หัวตั้ง',
    tarotReversed: 'ไพ่กลับหัว',
    tarotViewCardBtn: '🎴 บันทึก&แชร์',

    luckyNumberTitle: 'เลขมงคลประจำตัว',
    luckyNumberLead: 'คำนวณจากดวงชะตาและธาตุ ชนะมินิเกมเพื่อเผายันต์ปลดล็อกตัวเลข',
    lucky2Digits: 'เลขท้าย 2 ตัว',
    lucky3Digits: 'เลขท้าย 3 ตัว',
    luckyBurnLevelNotice: 'ระดับการเผายันต์',
    luckyRevealComplete: 'ยันต์มอดไหม้สมบูรณ์ ปรากฏเลขมงคลเต็ม 100%!',
    luckyTalismanBurnHint: 'เล่นมินิเกมชนะ 3 ครั้งเพื่อเผายันต์ให้สิ้นสุด',
    luckyViewCardBtn: '🎴 บันทึก&แชร์',

    ritualTitle: 'พิธีกรรมสะเดาะเคราะห์',
    ritualCandle: 'จุดเทียนต่อดวง',
    ritualLantern: 'ลอยโคมสะเดาะเคราะห์',
    ritualRemedy: 'แก้ปีชง 2569 (มะเมีย)',
    ritualOffering: 'ถวายสักการะดิจิทัล',
    ritualRemedyClash: 'ชงตรง 100%',
    ritualRemedyHarm: 'ไห่ (ให้ร้าย)',
    ritualRemedyBreak: 'พัง (แตกหัก)',
    ritualRemedyDirect: 'ตรงปีเกิด',
    ritualRemedySafe: 'ดวงราบรื่น สมพงษ์',
    ritualRemedyViewCard: '🎴 บันทึกยันต์แก้ปีชง',

    gateChooseSystem: 'เลือกศาสตร์พยากรณ์และอารยธรรม',
    gateChooseSystemSub: '10 อารยธรรมโบราณทั่วโลก แตะเพื่อเปิดวงล้อดวงดาว',
    gateEnterShrine: 'เข้าสู่ศาลเจ้า',
    gateSelectSymbol: 'แตะเลือกสัญลักษณ์ประจำตัวของท่าน',
  },

  en: {
    appName: 'Lucky Shrine',
    appSubtitle: 'Siamese Sticks · Tarot · Rituals & Global Astrology',
    home: 'Home',
    backHome: 'Back to Gate',
    soundOn: 'Enable Audio',
    soundOff: 'Mute Audio',
    installApp: 'Install App',
    journal: 'Fortune Journal',
    journalTitle: 'Sacred Fortune Journal',
    journalEmpty: 'No Fortune Records Yet',
    journalEmptyDesc: 'After drawing Siamese sticks, Tarot cards, or lucky numbers, tap "Save & Share" to chronicle your readings here.',
    journalAll: 'All',
    journalSticks: 'Sticks',
    journalTarot: 'Tarot',
    journalNumbers: 'Numbers',
    journalSaved: 'Saved',
    journalDelete: 'Delete',
    journalClearAll: 'Clear All History',
    journalClearConfirm: 'Are you sure you want to clear your entire fortune history?',
    journalClearConfirmPrompt: 'Are you sure you want to delete all fortune history? This cannot be undone.',
    journalCancel: 'Cancel',
    journalConfirmClearBtn: 'Yes, Clear All',
    journalSaveBtn: '📖 Save to Journal',
    journalSavedBtn: '✓ Saved to Journal',
    journalViewCard: '🎴 Lucky Card',
    saveAndShareBtn: '🎴 Save & Share',
    journalNotes: 'Personal Reflection / Wish',
    journalAddNotes: 'Write a reflection or blessing wish...',
    savedToJournal: '📖 Recorded in your Fortune Journal',

    cardTitle: 'Lucky Shrine',
    cardSubtitle: 'LUCKY SHRINE · Celestial Auspicious Decree',
    cardSavePng: '💾 Save Image PNG',
    cardShare: '📤 Share Card',
    cardCopy: '📋 Copy Image',
    cardCopied: 'Image copied to clipboard',
    cardGenerating: 'Generating sacred card...',
    cardClose: 'Close',
    cardAuspiciousSeal: 'Fortune & Harmony · 吉祥如意',
    cardZodiacLabel: 'Astrological System',
    cardElementLabel: 'Elemental Affinity',
    cardAuraLabel: 'Auspicious Aura',
    cardShareSuccess: 'Fortune card shared successfully',

    pwaInstallTitle: 'Install Lucky Shrine on Home Screen',
    pwaInstallDesc: 'Instant launch, native full-screen experience, 100% offline-ready.',
    pwaIosStep1: '1. Tap the Share button in Safari toolbar below',
    pwaIosStep2: '2. Scroll down and tap "Add to Home Screen"',
    pwaOfflineMsg: 'Offline Mode — 100% local processing, private & secure',
    pwaClose: 'Close',

    topicStick: 'Siamese Sticks',
    topicTarot: 'Tarot Cards',
    topicNumber: 'Lucky Numbers',
    topicRitual: 'Rituals & Remedies',
    topicLove: 'Love Fortune',
    topicScan: 'Aura Scan',
    topicMeditation: 'Meditation',
    topicFestival: 'Sacred Prayers',
    topicAuspicious: 'Auspicious Calendar',

    stickTitle: 'Siamese Sticks (Kau Chim)',
    stickLead: 'Hold your intention, shake the sacred cylinder, and toss Pua Poi blocks for verification.',
    stickShakeBtn: 'Shake Cylinder',
    stickHoldBtn: 'Press & Hold to Shake',
    stickShakePower: 'Vibration Energy',
    stickFallenNotice: 'A fortune stick has dropped!',
    stickPuaPoiPrompt: 'Please toss Pua Poi moon blocks to verify the prophecy with the deities.',
    stickTossPuaPoi: 'Toss Pua Poi Blocks',
    stickAffirmationSuccess: 'Sheng Pua (One Up, One Down) — Confirmed by the deities!',
    stickAffirmationFail: 'Yin Pua (Both Down) — Deities request you recenter and shake again.',
    stickAffirmationLaugh: 'Xiao Pua (Both Up) — Deities smile, please draw another stick.',
    stickDrawAgain: 'Shake Again',
    stickReadMode: 'Read Oracle',
    stickListenMode: 'Listen to Voice',
    stickAspectFinance: 'Wealth & Luck',
    stickAspectLove: 'Love & Family',
    stickAspectHealth: 'Health & Vitality',
    stickAspectCareer: 'Career & Ambition',
    stickViewCardBtn: '🎴 Save & Share',

    tarotTitle: 'Arcana Tarot',
    tarotLead: 'Choose your card spread, focus on your question, and tap each card to reveal.',
    tarotDaily: 'Daily Card (1 Card)',
    tarot3Cards: 'Past · Present · Future (3 Cards)',
    tarot5Cards: 'Destiny Overview (5 Cards)',
    tarotShuffleBtn: 'Shuffle & Draw',
    tarotFlipAll: 'Flip All Cards',
    tarotUpright: 'Upright',
    tarotReversed: 'Reversed',
    tarotViewCardBtn: '🎴 Save & Share',

    luckyNumberTitle: 'Personal Lucky Numbers',
    luckyNumberLead: 'Calculated via celestial algorithms. Win mini-games to burn talisman and unveil numbers.',
    lucky2Digits: '2-Digit Lucky Number',
    lucky3Digits: '3-Digit Lucky Number',
    luckyBurnLevelNotice: 'Talisman Burn Progress',
    luckyRevealComplete: 'Talisman fully burned! Lucky numbers 100% revealed.',
    luckyTalismanBurnHint: 'Win 3 mini-game rounds to completely burn the talisman.',
    luckyViewCardBtn: '🎴 Save & Share',

    ritualTitle: 'Sacred Remedies & Rituals',
    ritualCandle: 'Light Long-Life Candle',
    ritualLantern: 'Sky Lantern Release',
    ritualRemedy: '2026 Year of the Horse Clash Remedy',
    ritualOffering: 'Digital Altar Offering',
    ritualRemedyClash: 'Direct Clash (100%)',
    ritualRemedyHarm: 'Harm (Subtle Friction)',
    ritualRemedyBreak: 'Break (Disruption)',
    ritualRemedyDirect: 'Birth Year Return',
    ritualRemedySafe: 'Auspicious & Harmonious',
    ritualRemedyViewCard: '🎴 Export Remedy Talisman',

    gateChooseSystem: 'Choose Astrological Civilization',
    gateChooseSystemSub: '10 ancient civilizations across history. Tap to expand celestial wheel.',
    gateEnterShrine: 'Enter the Shrine',
    gateSelectSymbol: 'Tap to select your guardian symbol',
  },

  zh: {
    appName: '福运神殿',
    appSubtitle: '求签 · 塔罗 · 转运消灾 · 十大古文明占星',
    home: '神殿大门',
    backHome: '返回大门',
    soundOn: '开启圣乐',
    soundOff: '静音圣乐',
    installApp: '安装应用',
    journal: '命理手账',
    journalTitle: '福运祈福手账',
    journalEmpty: '暂无占卜记录',
    journalEmptyDesc: '当您完成求签、抽取塔罗或解开吉祥数字时，可点击“保存与分享”将灵验神签收录于此。',
    journalAll: '全部',
    journalSticks: '灵签',
    journalTarot: '塔罗',
    journalNumbers: '吉数',
    journalSaved: '已收藏',
    journalDelete: '删除',
    journalClearAll: '清空全部历史',
    journalClearConfirm: '确定要清空所有占卜祈福记录吗？',
    journalClearConfirmPrompt: '确定要清空所有占卜记录吗？此操作无法撤销。',
    journalCancel: '取消',
    journalConfirmClearBtn: '确认清空',
    journalSaveBtn: '📖 存入命运笔记',
    journalSavedBtn: '✓ 已存入命运笔记',
    journalViewCard: '🎴 福运签卡',
    saveAndShareBtn: '🎴 保存与分享',
    journalNotes: '个人心得 / 祈愿',
    journalAddNotes: '写下您的感悟或祈愿...',
    savedToJournal: '📖 已为您记录于福运手账',

    cardTitle: '福运神殿',
    cardSubtitle: 'LUCKY SHRINE · 天机赐福灵签',
    cardSavePng: '💾 保存高清图片 PNG',
    cardShare: '📤 分享灵签',
    cardCopy: '📋 复制图片',
    cardCopied: '图片已复制到剪贴板',
    cardGenerating: '正在绘制灵运金卡...',
    cardClose: '关闭',
    cardAuspiciousSeal: '富贵吉祥 · 万事如意',
    cardZodiacLabel: '星象所属',
    cardElementLabel: '命格五行',
    cardAuraLabel: '本命灵气',
    cardShareSuccess: '灵签卡分享成功',

    pwaInstallTitle: '将福运神殿添加到主屏幕',
    pwaInstallDesc: '秒速启动，原生全屏体验，无网状态亦可离线占卜。',
    pwaIosStep1: '1. 点击 Safari 底部工具栏的「分享」按钮',
    pwaIosStep2: '2. 向下滑动并选择「添加到主屏幕」',
    pwaOfflineMsg: '离线模式 — 本地端 100% 独立运算，安全私密',
    pwaClose: '关闭',

    topicStick: '神灵抽签',
    topicTarot: '塔罗灵占',
    topicNumber: '吉祥数字',
    topicRitual: '转运祈福',
    topicLove: '姻缘红线',
    topicScan: '灵气相术',
    topicMeditation: '静心禅修',
    topicFestival: '道场祈愿',
    topicAuspicious: '吉日吉时历',

    stickTitle: '正宗灵签 (求签掷茭)',
    stickLead: '诚心默念心中所求，摇晃签筒，并掷杯向神明求取圣茭以验证签诗。',
    stickShakeBtn: '摇动签筒',
    stickHoldBtn: '长按摇动签筒',
    stickShakePower: '灵气感应',
    stickFallenNotice: '灵签落地！',
    stickPuaPoiPrompt: '请掷出圣杯（茭杯）以恭求神明指点确认。',
    stickTossPuaPoi: '掷茭求圣杯',
    stickAffirmationSuccess: '圣杯 (一正一反) — 神明首肯，赐下此签！',
    stickAffirmationFail: '阴杯 (两面皆反) — 神明未准，请沉心再摇。',
    stickAffirmationLaugh: '笑杯 (两面皆正) — 神明微笑，请重新求签。',
    stickDrawAgain: '重新求签',
    stickReadMode: '研读签诗',
    stickListenMode: '诵读法音',
    stickAspectFinance: '求财·财运',
    stickAspectLove: '姻缘·情感',
    stickAspectHealth: '安康·身心',
    stickAspectCareer: '功名·事业',
    stickViewCardBtn: '🎴 保存与分享',

    tarotTitle: '神秘大阿卡那塔罗',
    tarotLead: '选择牌阵，在心中沉思问题，轻触牌背依次翻开。',
    tarotDaily: '每日指引 (1 张)',
    tarot3Cards: '过去·现在·未来 (3 张)',
    tarot5Cards: '全局运势 (5 张)',
    tarotShuffleBtn: '洗牌抽签',
    tarotFlipAll: '全部翻开',
    tarotUpright: '正位',
    tarotReversed: '逆位',
    tarotViewCardBtn: '🎴 保存与分享',

    luckyNumberTitle: '个人吉祥生旺数',
    luckyNumberLead: '结合星象天干与本命计算。赢得法器小试炼以焚化灵符显现吉数。',
    lucky2Digits: '二位数吉星',
    lucky3Digits: '三位数天运',
    luckyBurnLevelNotice: '灵符净化度',
    luckyRevealComplete: '灵符已完全净化，吉数圆满显现！',
    luckyTalismanBurnHint: '连胜 3 局法器小试炼即可完全揭示',
    luckyViewCardBtn: '🎴 保存与分享',

    ritualTitle: '消灾化煞·祈福法事',
    ritualCandle: '点燃长明灯',
    ritualLantern: '放飞祈愿天灯',
    ritualRemedy: '2026 丙午马年化太岁',
    ritualOffering: '殿前电子敬献',
    ritualRemedyClash: '正冲太岁 (100%)',
    ritualRemedyHarm: '相害太岁',
    ritualRemedyBreak: '相破太岁',
    ritualRemedyDirect: '值太岁 (本命年)',
    ritualRemedySafe: '运势顺遂·岁德相合',
    ritualRemedyViewCard: '🎴 保存太岁符卡',

    gateChooseSystem: '选择古文明占星法门',
    gateChooseSystemSub: '横跨全球十大古文明星象秘法，轻触展开星辰轮盘。',
    gateEnterShrine: '步入神殿',
    gateSelectSymbol: '点击选择您的守护灵符',
  },
};
