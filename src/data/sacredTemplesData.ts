export interface TempleItem {
  id: number;
  name: string;
  province: string;
  region: 'กลาง' | 'เหนือ' | 'อีสาน' | 'ใต้' | 'ตะวันออก' | 'ตะวันตก';
  theme: string;
  wish: string;
  blessing: string;
  tileId?: number;
}

export interface GameEvent {
  type: 'bonus' | 'obstacle' | 'special';
  icon: string;
  name: string;
  desc: string;
  move?: number;
  merit?: number;
  skip?: number;
  item?: 'yantra' | 'bell' | 'lotus';
  clearSkip?: boolean;
}

export const RAW_TEMPLES_LIST: [string, string, 'กลาง' | 'เหนือ' | 'อีสาน' | 'ใต้' | 'ตะวันออก' | 'ตะวันตก'][] = [
  ["วัดพระแก้ว", "กรุงเทพมหานคร", "กลาง"],
  ["วัดอรุณราชวราราม", "กรุงเทพมหานคร", "กลาง"],
  ["วัดโพธิ์", "กรุงเทพมหานคร", "กลาง"],
  ["วัดสุทัศนเทพวราราม", "กรุงเทพมหานคร", "กลาง"],
  ["วัดเบญจมบพิตร", "กรุงเทพมหานคร", "กลาง"],
  ["วัดสระเกศ", "กรุงเทพมหานคร", "กลาง"],
  ["วัดบวรนิเวศวิหาร", "กรุงเทพมหานคร", "กลาง"],
  ["วัดราชบพิธสถิตมหาสีมาราม", "กรุงเทพมหานคร", "กลาง"],
  ["วัดไตรมิตรวิทยาราม", "กรุงเทพมหานคร", "กลาง"],
  ["วัดระฆังโฆสิตาราม", "กรุงเทพมหานคร", "กลาง"],
  ["วัดพระปฐมเจดีย์", "นครปฐม", "กลาง"],
  ["วัดไร่ขิง", "นครปฐม", "กลาง"],
  ["วัดกลางบางแก้ว", "นครปฐม", "กลาง"],
  ["วัดพระศรีรัตนมหาธาตุ", "พิษณุโลก", "กลาง"],
  ["วัดจันทร์ตะวันตก", "พิษณุโลก", "กลาง"],
  ["วัดมหาธาตุ", "สุโขทัย", "กลาง"],
  ["วัดศรีชุม", "สุโขทัย", "กลาง"],
  ["วัดช้างล้อม", "สุโขทัย", "กลาง"],
  ["วัดไชยวัฒนาราม", "พระนครศรีอยุธยา", "กลาง"],
  ["วัดมหาธาตุ อยุธยา", "พระนครศรีอยุธยา", "กลาง"],
  ["วัดใหญ่ชัยมงคล", "พระนครศรีอยุธยา", "กลาง"],
  ["วัดพนัญเชิงวรวิหาร", "พระนครศรีอยุธยา", "กลาง"],
  ["วัดหน้าพระเมรุ", "พระนครศรีอยุธยา", "กลาง"],
  ["วัดท่าหลวง", "พิจิตร", "กลาง"],
  ["วัดพระนอนจักรสีห์", "สิงห์บุรี", "กลาง"],
  ["วัดขุนอินทประมูล", "อ่างทอง", "กลาง"],
  ["วัดม่วง", "อ่างทอง", "กลาง"],
  ["วัดพระพุทธบาทราชวรมหาวิหาร", "สระบุรี", "กลาง"],
  ["วัดถ้ำเสือ", "กาญจนบุรี", "ตะวันตก"],
  ["วัดเทวสังฆาราม", "กาญจนบุรี", "ตะวันตก"],
  ["วัดมหาธาตุวรวิหาร", "เพชรบุรี", "ตะวันตก"],
  ["วัดใหญ่สุวรรณาราม", "เพชรบุรี", "ตะวันตก"],
  ["วัดเขาตะเครา", "เพชรบุรี", "ตะวันตก"],
  ["วัดเขาสุกิม", "จันทบุรี", "ตะวันออก"],
  ["วัดโสธรวราราม", "ฉะเชิงเทรา", "ตะวันออก"],
  ["วัดหลวงพ่อโต", "ฉะเชิงเทรา", "ตะวันออก"],
  ["วัดญาณสังวราราม", "ชลบุรี", "ตะวันออก"],
  ["วัดใหญ่อินทาราม", "ชลบุรี", "ตะวันออก"],
  ["วัดป่าประดู่", "ระยอง", "ตะวันออก"],
  ["วัดบ้านแลง", "ระยอง", "ตะวันออก"],
  ["วัดพระธาตุดอยสุเทพ", "เชียงใหม่", "เหนือ"],
  ["วัดพระสิงห์วรมหาวิหาร", "เชียงใหม่", "เหนือ"],
  ["วัดเจดีย์หลวง", "เชียงใหม่", "เหนือ"],
  ["วัดเชียงมั่น", "เชียงใหม่", "เหนือ"],
  ["วัดอุโมงค์", "เชียงใหม่", "เหนือ"],
  ["วัดสวนดอก", "เชียงใหม่", "เหนือ"],
  ["วัดพระธาตุดอยคำ", "เชียงใหม่", "เหนือ"],
  ["วัดพระธาตุลำปางหลวง", "ลำปาง", "เหนือ"],
  ["วัดพระธาตุหริภุญชัย", "ลำพูน", "เหนือ"],
  ["วัดจามเทวี", "ลำพูน", "เหนือ"],
  ["วัดภูมินทร์", "น่าน", "เหนือ"],
  ["วัดพระธาตุแช่แห้ง", "น่าน", "เหนือ"],
  ["วัดพระธาตุช่อแฮ", "แพร่", "เหนือ"],
  ["วัดพระธาตุดอยตุง", "เชียงราย", "เหนือ"],
  ["วัดร่องขุ่น", "เชียงราย", "เหนือ"],
  ["วัดร่องเสือเต้น", "เชียงราย", "เหนือ"],
  ["วัดพระแก้วเชียงราย", "เชียงราย", "เหนือ"],
  ["วัดพระเจ้าตนหลวง", "พะเยา", "เหนือ"],
  ["วัดศรีโคมคำ", "พะเยา", "เหนือ"],
  ["วัดพระธาตุผาซ่อนแก้ว", "เพชรบูรณ์", "เหนือ"],
  ["วัดป่าภูก้อน", "อุดรธานี", "อีสาน"],
  ["วัดโพธิสมภรณ์", "อุดรธานี", "อีสาน"],
  ["วัดพระธาตุพนม", "นครพนม", "อีสาน"],
  ["วัดพระธาตุเชิงชุม", "สกลนคร", "อีสาน"],
  ["วัดป่าสุทธาวาส", "สกลนคร", "อีสาน"],
  ["วัดหนองแวง", "ขอนแก่น", "อีสาน"],
  ["วัดทุ่งเศรษฐี", "ขอนแก่น", "อีสาน"],
  ["วัดพระธาตุนาดูน", "มหาสารคาม", "อีสาน"],
  ["วัดบูรพาราม", "สุรินทร์", "อีสาน"],
  ["วัดกลางสุรินทร์", "สุรินทร์", "อีสาน"],
  ["วัดเขาศาลาอตุลฐานะจาโร", "สุรินทร์", "อีสาน"],
  ["วัดป่าแสงอรุณ", "ขอนแก่น", "อีสาน"],
  ["วัดพระธาตุหนองบัว", "อุบลราชธานี", "อีสาน"],
  ["วัดทุ่งศรีเมือง", "อุบลราชธานี", "อีสาน"],
  ["วัดมหาวนาราม", "อุบลราชธานี", "อีสาน"],
  ["วัดสิรินธรวรารามภูพร้าว", "อุบลราชธานี", "อีสาน"],
  ["วัดป่าสาลวัน", "นครราชสีมา", "อีสาน"],
  ["วัดศาลาลอย", "นครราชสีมา", "อีสาน"],
  ["วัดบ้านไร่", "นครราชสีมา", "อีสาน"],
  ["วัดพระนารายณ์มหาราช", "นครราชสีมา", "อีสาน"],
  ["วัดถ้ำกลองเพล", "หนองบัวลำภู", "อีสาน"],
  ["วัดเนรมิตวิปัสสนา", "เลย", "อีสาน"],
  ["วัดศรีคุณเมือง", "เลย", "อีสาน"],
  ["วัดพระธาตุขามแก่น", "ขอนแก่น", "อีสาน"],
  ["วัดพระธาตุยาคู", "กาฬสินธุ์", "อีสาน"],
  ["วัดกลาง", "บุรีรัมย์", "อีสาน"],
  ["วัดป่าเลไลยก์", "ร้อยเอ็ด", "อีสาน"],
  ["วัดบูรพาภิราม", "ร้อยเอ็ด", "อีสาน"],
  ["วัดพระธาตุเรืองรอง", "ศรีสะเกษ", "อีสาน"],
  ["วัดไพรพัฒนา", "ศรีสะเกษ", "อีสาน"],
  ["วัดฉลอง", "ภูเก็ต", "ใต้"],
  ["วัดพระทอง", "ภูเก็ต", "ใต้"],
  ["วัดพระมหาธาตุวรมหาวิหาร", "นครศรีธรรมราช", "ใต้"],
  ["วัดเจดีย์ (ไอ้ไข่)", "นครศรีธรรมราช", "ใต้"],
  ["วัดเขาบางทราย", "ชลบุรี", "ตะวันออก"],
  ["วัดแหลมสุวรรณาราม", "สมุทรสาคร", "กลาง"],
  ["วัดทางสาย", "ประจวบคีรีขันธ์", "ตะวันตก"],
  ["วัดห้วยมงคล", "ประจวบคีรีขันธ์", "ตะวันตก"],
  ["วัดพระบรมธาตุไชยา", "สุราษฎร์ธานี", "ใต้"],
  ["วัดสวนโมกขพลาราม", "สุราษฎร์ธานี", "ใต้"],
];

const THEMES = ["เมตตา", "ความสำเร็จ", "ความสงบ", "ปัญญา", "ความมั่นคง"];

export const ALL_TEMPLES: TempleItem[] = RAW_TEMPLES_LIST.map((x, i) => ({
  id: i + 1,
  name: x[0],
  province: x[1],
  region: x[2],
  theme: THEMES[i % THEMES.length],
  wish: "ขอให้มีสติ ปัญญา และกำลังใจในการดำเนินชีวิต",
  blessing: "ขอให้พบสิ่งที่ดีงาม และมีกำลังใจผ่านทุกอุปสรรค",
}));

export const GAME_EVENTS: Record<number, GameEvent> = {
  3: { type: "bonus", icon: "🌸", name: "ดอกบัวมงคล", desc: "ได้รับกำลังใจ เดินหน้าอีก 2 ช่อง พร้อม 10 แต้ม", move: 2, merit: 10 },
  6: { type: "obstacle", icon: "🌧️", name: "ฝนตกหนัก", desc: "พักรอฝน 1 รอบ", skip: 1 },
  9: { type: "bonus", icon: "✨", name: "แสงบุญนำทาง", desc: "เดินหน้าอีก 1 ช่อง และรับ 10 แต้ม", move: 1, merit: 10 },
  11: { type: "special", icon: "🧙", name: "ผู้เฒ่าใจบุญ", desc: "ได้รับยันต์คุ้มภัย 1 ชิ้น", item: "yantra" },
  13: { type: "obstacle", icon: "⛰️", name: "ทางลาดชัน", desc: "ต้องถอยหลัง 1 ช่อง", move: -1 },
  15: { type: "bonus", icon: "🌺", name: "ดอกไม้สวรรค์", desc: "รับ 15 แต้มกำลังใจ", merit: 15 },
  18: { type: "special", icon: "🔔", name: "ระฆังมงคล", desc: "ได้รับสิทธิ์ทอยเพิ่ม 1 ครั้ง", item: "bell" },
  19: { type: "obstacle", icon: "🌉", name: "สะพานชำรุด", desc: "ต้องถอยหลัง 2 ช่อง", move: -2 },
  22: { type: "bonus", icon: "🤝", name: "น้ำใจจากผู้เดินทาง", desc: "รับ 10 แต้ม", merit: 10 },
  25: { type: "obstacle", icon: "🧭", name: "หลงทาง", desc: "ต้องถอยหลัง 3 ช่อง", move: -3 },
  27: { type: "special", icon: "🏡", name: "ศาลาพักใจ", desc: "รับ 10 แต้มและล้างสถานะหยุดพัก", merit: 10, clearSkip: true },
  29: { type: "bonus", icon: "🪷", name: "พรแห่งเมตตา", desc: "รับ 15 แต้ม", merit: 15 },
  31: { type: "obstacle", icon: "🌪️", name: "ลมพายุ", desc: "ต้องถอยหลัง 2 ช่อง", move: -2 },
  34: { type: "special", icon: "🧿", name: "เครื่องรางคุ้มภัย", desc: "ได้รับยันต์คุ้มภัย 1 ชิ้น", item: "yantra" },
};

export const WISH_TOPICS = [
  "การงาน",
  "การเงิน",
  "ความรัก",
  "สุขภาพ",
  "ครอบครัว",
  "ความสงบและความเป็นสิริมงคล",
];

export const TEMPLE_TILE_IDS = [4, 8, 12, 16, 20, 24, 28, 32, 35];

import type { SupportedLang } from './translations';

export const REGION_LABELS: Record<TempleItem['region'], Record<SupportedLang, string>> = {
  'กลาง': { th: 'ภาคกลาง', en: 'Central Region', zh: '中部地区' },
  'เหนือ': { th: 'ภาคเหนือ', en: 'Northern Region', zh: '北部地区' },
  'อีสาน': { th: 'ภาคอีสาน', en: 'Northeastern Region', zh: '东北部地区' },
  'ใต้': { th: 'ภาคใต้', en: 'Southern Region', zh: '南部地区' },
  'ตะวันออก': { th: 'ภาคตะวันออก', en: 'Eastern Region', zh: '东部地区' },
  'ตะวันตก': { th: 'ภาคตะวันตก', en: 'Western Region', zh: '西部地区' },
};

export const THEME_LABELS: Record<string, Record<SupportedLang, string>> = {
  'เมตตา': { th: 'เมตตา', en: 'Compassion', zh: '慈悲护佑' },
  'ความสำเร็จ': { th: 'ความสำเร็จ', en: 'Success', zh: '事业顺遂' },
  'ความสงบ': { th: 'ความสงบ', en: 'Serenity', zh: '身心安宁' },
  'ปัญญา': { th: 'ปัญญา', en: 'Wisdom', zh: '慧光启迪' },
  'ความมั่นคง': { th: 'ความมั่นคง', en: 'Stability', zh: '根基稳固' },
};

export const PROVINCE_LABELS: Record<string, { en: string; zh: string }> = {
  'กรุงเทพมหานคร': { en: 'Bangkok', zh: '曼谷' },
  'นครปฐม': { en: 'Nakhon Pathom', zh: '佛统府' },
  'พิษณุโลก': { en: 'Phitsanulok', zh: '彭世洛府' },
  'สุโขทัย': { en: 'Sukhothai', zh: '素可泰府' },
  'พระนครศรีอยุธยา': { en: 'Ayutthaya', zh: '大城府' },
  'พิจิตร': { en: 'Phichit', zh: '披集府' },
  'สิงห์บุรี': { en: 'Sing Buri', zh: '信武里府' },
  'อ่างทอง': { en: 'Ang Thong', zh: '红统府' },
  'สระบุรี': { en: 'Saraburi', zh: '北标府' },
  'กาญจนบุรี': { en: 'Kanchanaburi', zh: '北碧府' },
  'เพชรบุรี': { en: 'Phetchaburi', zh: '碧武里府' },
  'จันทบุรี': { en: 'Chanthaburi', zh: '尖竹汶府' },
  'ฉะเชิงเทรา': { en: 'Chachoengsao', zh: '北柳府' },
  'ชลบุรี': { en: 'Chonburi', zh: '春武里府' },
  'ระยอง': { en: 'Rayong', zh: '罗勇府' },
  'เชียงใหม่': { en: 'Chiang Mai', zh: '清迈府' },
  'ลำปาง': { en: 'Lampang', zh: '南邦府' },
  'ลำพูน': { en: 'Lamphun', zh: '南奔府' },
  'น่าน': { en: 'Nan', zh: '难府' },
  'แพร่': { en: 'Phrae', zh: '帕府' },
  'เชียงราย': { en: 'Chiang Rai', zh: '清莱府' },
  'พะเยา': { en: 'Phayao', zh: '帕尧府' },
  'เพชรบูรณ์': { en: 'Phetchabun', zh: '碧差汶府' },
  'อุดรธานี': { en: 'Udon Thani', zh: '乌隆他尼府' },
  'นครพนม': { en: 'Nakhon Phanom', zh: '那空拍侬府' },
  'สกลนคร': { en: 'Sakon Nakhon', zh: '色军府' },
  'ขอนแก่น': { en: 'Khon Kaen', zh: '孔敬府' },
  'มหาสารคาม': { en: 'Maha Sarakham', zh: '玛哈沙拉堪府' },
  'สุรินทร์': { en: 'Surin', zh: '素林府' },
  'อุบลราชธานี': { en: 'Ubon Ratchathani', zh: '乌汶府' },
  'นครราชสีมา': { en: 'Nakhon Ratchasima', zh: '呵叻府' },
  'หนองบัวลำภู': { en: 'Nong Bua Lamphu', zh: '农磨兰普府' },
  'เลย': { en: 'Loei', zh: '黎府' },
  'กาฬสินธุ์': { en: 'Kalasin', zh: '加拉信府' },
  'บุรีรัมย์': { en: 'Buri Ram', zh: '武里南府' },
  'ร้อยเอ็ด': { en: 'Roi Et', zh: '黎逸府' },
  'ศรีสะเกษ': { en: 'Si Sa Ket', zh: '四色菊府' },
  'ภูเก็ต': { en: 'Phuket', zh: '普吉府' },
  'นครศรีธรรมราช': { en: 'Nakhon Si Thammarat', zh: '洛坤府' },
  'สมุทรสาคร': { en: 'Samut Sakhon', zh: '龙仔厝府' },
  'ประจวบคีรีขันธ์': { en: 'Prachuap Khiri Khan', zh: '巴蜀府' },
  'สุราษฎร์ธานี': { en: 'Surat Thani', zh: '素叻他尼府' },
};

export const WISH_TOPICS_LOCALIZED: Record<SupportedLang, readonly string[]> = {
  th: WISH_TOPICS,
  en: [
    'Career & Work',
    'Wealth & Finance',
    'Love & Harmony',
    'Health & Vitality',
    'Family Peace',
    'Serenity & Auspiciousness',
  ],
  zh: [
    '事业与学业',
    '财运与丰足',
    '姻缘与人缘',
    '健康与平安',
    '家宅安康',
    '内心宁静与吉祥如意',
  ],
};

const TEMPLE_DEFAULT_TEXT: Record<SupportedLang, { wish: string; blessing: string }> = {
  th: {
    wish: 'ขอให้มีสติ ปัญญา และกำลังใจในการดำเนินชีวิต',
    blessing: 'ขอให้พบสิ่งที่ดีงาม และมีกำลังใจผ่านทุกอุปสรรค',
  },
  en: {
    wish: 'May mindfulness, clarity, and inner strength guide every step of your path.',
    blessing: 'May virtuous opportunities greet you and grant courage through all trials.',
  },
  zh: {
    wish: '愿正念、智慧与坚定信心常伴您的生命旅途。',
    blessing: '愿您所遇皆为善缘，拥有从容化解一切阻滞的力量。',
  },
};

const GAME_EVENTS_LOCALIZED: Record<
  number,
  { en: { name: string; desc: string }; zh: { name: string; desc: string } }
> = {
  3: {
    en: { name: 'Auspicious Lotus', desc: 'Inspired along the path: advance 2 tiles and gain +10 merit.' },
    zh: { name: '吉祥圣莲', desc: '倍受鼓舞，向前行进 2 格并获 10 点功德。' },
  },
  6: {
    en: { name: 'Heavy Monsoon Rain', desc: 'Take shelter from the rain: rest for 1 turn.' },
    zh: { name: '骤雨阻途', desc: '暂避风雨，休整 1 回合。' },
  },
  9: {
    en: { name: 'Guiding Merit Light', desc: 'Advance 1 tile and receive +10 merit.' },
    zh: { name: '福光照路', desc: '向前行进 1 格并获 10 点功德。' },
  },
  11: {
    en: { name: 'Compassionate Elder', desc: 'Received 1 Shield Yantra relic.' },
    zh: { name: '慈悲长者', desc: '获赠 1 枚护身圣符。' },
  },
  13: {
    en: { name: 'Steep Mountain Trail', desc: 'Careful footing required: move back 1 tile.' },
    zh: { name: '山路陡峭', desc: '路途崎岖，须退后 1 格。' },
  },
  15: {
    en: { name: 'Celestial Blossoms', desc: 'Awarded +15 encouragement merit.' },
    zh: { name: '天界瑞花', desc: '获得 15 点心愿功德。' },
  },
  18: {
    en: { name: 'Sacred Temple Bell', desc: 'Received 1 Sacred Bell relic for a bonus roll.' },
    zh: { name: '吉祥铜钟', desc: '获赠 1 枚吉祥铜钟（可额外掷骰 1 次）。' },
  },
  19: {
    en: { name: 'Weathered Bridge', desc: 'Detour needed: move back 2 tiles.' },
    zh: { name: '木桥失修', desc: '绕道而行，须退后 2 格。' },
  },
  22: {
    en: { name: 'Kind Fellow Pilgrim', desc: 'Shared warmth along the journey: +10 merit.' },
    zh: { name: '同行善信', desc: '沿途结善缘，获得 10 点功德。' },
  },
  25: {
    en: { name: 'Misty Crossroads', desc: 'Lost your bearings momentarily: move back 3 tiles.' },
    zh: { name: '迷途寻路', desc: '暂失方向，退后 3 格重整脚步。' },
  },
  27: {
    en: { name: 'Serene Sanctuary Pavilion', desc: 'Gain +10 merit and clear all resting skip turns.' },
    zh: { name: '静心凉亭', desc: '获得 10 点功德并立刻解除所有休整等待。' },
  },
  29: {
    en: { name: 'Blessing of Metta', desc: 'Radiant kindness brings +15 merit.' },
    zh: { name: '慈悲甘露', desc: '获得 15 点慈悲功德。' },
  },
  31: {
    en: { name: 'Sudden Gale Wind', desc: 'Strong headwind pushes you back 2 tiles.' },
    zh: { name: '疾风骤起', desc: '逆风受阻，退后 2 格。' },
  },
  34: {
    en: { name: 'Protective Talisman Shrine', desc: 'Received 1 Shield Yantra relic.' },
    zh: { name: '护法灵符', desc: '获赠 1 枚护身圣符。' },
  },
};

export function getLocalizedRegion(region: TempleItem['region'], lang: SupportedLang): string {
  return REGION_LABELS[region]?.[lang] || region;
}

export function getLocalizedProvince(province: string, lang: SupportedLang): string {
  if (lang === 'th') return `จ.${province}`;
  const loc = PROVINCE_LABELS[province];
  return loc ? loc[lang] : province;
}

export function getLocalizedWishTopics(lang: SupportedLang): readonly string[] {
  return WISH_TOPICS_LOCALIZED[lang] || WISH_TOPICS;
}

export function getLocalizedGameEvent(
  tileId: number,
  lang: SupportedLang
): GameEvent | undefined {
  const base = GAME_EVENTS[tileId];
  if (!base) return undefined;
  if (lang === 'th') return base;
  const loc = GAME_EVENTS_LOCALIZED[tileId]?.[lang];
  if (!loc) return base;
  return {
    ...base,
    name: loc.name,
    desc: loc.desc,
  };
}

export function getLocalizedTemple(
  temple: TempleItem,
  lang: SupportedLang
): {
  name: string;
  province: string;
  region: string;
  theme: string;
  wish: string;
  blessing: string;
} {
  if (lang === 'th') {
    return {
      name: temple.name,
      province: `จ.${temple.province}`,
      region: `ภาค${temple.region}`,
      theme: temple.theme,
      wish: temple.wish,
      blessing: temple.blessing,
    };
  }
  const texts = TEMPLE_DEFAULT_TEXT[lang];
  return {
    name: temple.name,
    province: PROVINCE_LABELS[temple.province]?.[lang] || temple.province,
    region: REGION_LABELS[temple.region]?.[lang] || temple.region,
    theme: THEME_LABELS[temple.theme]?.[lang] || temple.theme,
    wish: texts.wish,
    blessing: texts.blessing,
  };
}

