import type { SupportedLang } from './locales/types';

// Thai Astrological Calendar & Auspicious Timing Engine (โหราศาสตร์ไทย & ปฏิทินฤกษ์มงคล)
// Complete calculations for Kala Yoga, Maha Thaksa, 9 Thai Ruk (นพดลฤกษ์ทั้ง ๙), 27 Nakshatras, Continuous Lunar Dithi, and Auspicious Categories

export const THAI_MONTHS: readonly string[] = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
] as const;

export type ThaiRukType =
  | 'daliddo'      // 1. ทลิทโทฤกษ์ (ฤกษ์ขอความเมตตา ชูชก ทวงหนี้ เจรจาประนีประนอม)
  | 'mahatthano'   // 2. มหัทธโนฤกษ์ (ฤกษ์เศรษฐี ค้าขาย ร่ำรวย ทรัพย์สิน ออกรถ เปิดร้าน)
  | 'joro'         // 3. โจโรฤกษ์ (ฤกษ์นักสู้ ชิงไหวชิงพริบ แข่งขัน ชนะคดี บุกเบิก)
  | 'bhumipalo'    // 4. ภูมิปาโลฤกษ์ (ฤกษ์ผู้รักษาแผ่นดิน มั่นคง ถาวร ที่ดิน บ้าน ปลูกเรือน)
  | 'thesatri'     // 5. เทศาตรีฤกษ์ (ฤกษ์พ่อค้า ท่องเที่ยว กิจการต่างแดน ขนส่ง บันเทิง)
  | 'thewi'        // 6. เทวีฤกษ์ (ฤกษ์นางพญา เสน่ห์ เมตตา มงคลสมรส ความงาม สู่ขอ)
  | 'phetchakat'   // 7. เพชฌฆาตฤกษ์ (ฤกษ์เด็ดขาด จัดการอุปสรรค ผ่าตัด สะเดาะเคราะห์ บวช)
  | 'raja'         // 8. ราชาฤกษ์ (ฤกษ์ผู้เป็นใหญ่ บารมี ชื่อเสียง อำนาจ ส่งมอบงาน)
  | 'samano';      // 9. สมโณฤกษ์ (ฤกษ์สงบสุข ร่มเย็น กุศลธรรม ทำบุญ บวช ไหว้พระ)

export type AuspiciousWorkCategory =
  | 'wedding'           // 1. ฤกษ์แต่งงาน / จดทะเบียนสมรส
  | 'house'             // 2. ฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่
  | 'merit'             // 3. ฤกษ์ทำบุญประจำปี / ทำบุญบริษัท / ทำบุญบ้าน
  | 'vehicle_business'  // 4. ฤกษ์ออกรถใหม่ / เปิดกิจการร้านค้า
  | 'others';           // 5. ฤกษ์มงคลอื่นๆ (เจรจาค้าขาย, ทำศัลยกรรมเสริมสง่าราศี, เซ็นสัญญา)

export type BirthDayId =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday_day'
  | 'wednesday_night'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type KalaYogaType = 'thongchai' | 'athipadi' | 'ubatha' | 'lokawinas' | 'normal';

export interface ThaksaRelation {
  relation: 'kalakini' | 'sri' | 'dej' | 'montri' | 'mula' | 'utsaha' | 'ayu' | 'boriwan';
  nameTh: string;
  isKalakini: boolean;
  isFavorable: boolean;
  scoreBonus: number;
  badgeText: string;
  badgeStyle: 'bad' | 'gold' | 'ok' | 'neutral';
  advice: string;
}

export interface AuspiciousDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  month: number;
  yearBE: number;
  yearCE: number;
  dayOfWeek: number; // 0: Sun, 1: Mon, ... 6: Sat
  dayNameTh: string;
  lunarDateTh: string; // e.g. "แรม ๗ ค่ำ เดือน ๑๑"
  lunarPhaseThShort: string; // e.g. "แรม ๗ ค่ำ", "ขึ้น ๑๕ ค่ำ 🌕"
  lunarPhase: 'waxing' | 'waning';
  lunarDay: number; // 1 to 15
  lunarMonth: number; // 1 to 12
  thaiRuk: ThaiRukType;
  thaiRukNameTh: string;
  thaiRukMeaning: string;
  thaiRukHighlight: string;
  nakshatraNameTh: string; // ชื่อกลุ่มดาวนักษัตร
  nakshatraNumber: number; // 1 to 27
  dithiName: string;
  isMasterAuspicious: boolean;
  rating: number; // 1 to 5
  suitableCategories: AuspiciousWorkCategory[];
  bestHours: {
    primaryTime: string;
    secondaryTime?: string;
    ubakongYama: string;
    minuteAuspicious: string;
  };
  kalaYoga: KalaYogaType;
  kalaYogaLabel: string;
  auspiciousDirection: string;
  luckyColors: string[];
  unluckyColors: string[];
  ceremonyTips: {
    wedding?: string;
    house?: string;
    merit?: string;
    vehicle_business?: string;
    others?: string;
  };
  prohibitions: string[];
  buddhistHolyDay: boolean;
}

export interface BirthDayOption {
  id: BirthDayId;
  labelTh: string;
  icon: string;
  rulerPlanet: string;
  kalakiniDayOfWeek: number; // 0 Sun ... 6 Sat, or 8 for wed night
  kalakiniDayNameTh: string;
  sriDayNameTh: string;
}

export const BIRTH_DAYS: BirthDayOption[] = [
  { id: 'sunday', labelTh: 'วันอาทิตย์', icon: '☀️', rulerPlanet: 'พระอาทิตย์ (๑)', kalakiniDayOfWeek: 5, kalakiniDayNameTh: 'วันศุกร์', sriDayNameTh: 'วันพุธ (กลางวัน)' },
  { id: 'monday', labelTh: 'วันจันทร์', icon: '🌙', rulerPlanet: 'พระจันทร์ (๒)', kalakiniDayOfWeek: 0, kalakiniDayNameTh: 'วันอาทิตย์', sriDayNameTh: 'วันเสาร์' },
  { id: 'tuesday', labelTh: 'วันอังคาร', icon: '⚔️', rulerPlanet: 'พระอังคาร (๓)', kalakiniDayOfWeek: 1, kalakiniDayNameTh: 'วันจันทร์', sriDayNameTh: 'วันพฤหัสบดี' },
  { id: 'wednesday_day', labelTh: 'วันพุธ (กลางวัน 06:00 - 17:59)', icon: '🍃', rulerPlanet: 'พระพุธ (๔)', kalakiniDayOfWeek: 2, kalakiniDayNameTh: 'วันอังคาร', sriDayNameTh: 'วันพุธกลางคืน/ราหู' },
  { id: 'wednesday_night', labelTh: 'วันพุธ (กลางคืน 18:00 - 05:59 / ราหู)', icon: '🌑', rulerPlanet: 'พระราหู (๘)', kalakiniDayOfWeek: 4, kalakiniDayNameTh: 'วันพฤหัสบดี', sriDayNameTh: 'วันจันทร์' },
  { id: 'thursday', labelTh: 'วันพฤหัสบดี', icon: '📜', rulerPlanet: 'พระพฤหัสบดี (๕)', kalakiniDayOfWeek: 6, kalakiniDayNameTh: 'วันเสาร์', sriDayNameTh: 'วันอาทิตย์' },
  { id: 'friday', labelTh: 'วันศุกร์', icon: '💎', rulerPlanet: 'พระศุกร์ (๖)', kalakiniDayOfWeek: 3, kalakiniDayNameTh: 'วันพุธ (กลางคืน/ราหู)', sriDayNameTh: 'วันอังคาร' },
  { id: 'saturday', labelTh: 'วันเสาร์', icon: '🛡️', rulerPlanet: 'พระเสาร์ (๗)', kalakiniDayOfWeek: 3, kalakiniDayNameTh: 'วันพุธ (กลางวัน)', sriDayNameTh: 'วันศุกร์' },
];

export const WORK_CATEGORIES_INFO: Record<
  AuspiciousWorkCategory,
  { id: AuspiciousWorkCategory; titleTh: string; icon: string; shortDesc: string; preferredRuk: ThaiRukType[]; taboosTh: string }
> = {
  wedding: {
    id: 'wedding',
    titleTh: 'ฤกษ์แต่งงาน / จดทะเบียนสมรส',
    icon: '💍',
    shortDesc: 'ส่งเสริมความรักยืนยง คู่ชีวิตเกื้อหนุน เมตตามหานิยม ครอบครัวผาสุก',
    preferredRuk: ['thewi', 'mahatthano', 'bhumipalo', 'raja'],
    taboosTh: 'หลีกเลี่ยงวันอุบาทว์, วันโลกาวินาศ, วันอังคาร, วันเสาร์ และวันกาลกิณีของทั้งคู่',
  },
  house: {
    id: 'house',
    titleTh: 'ฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่',
    icon: '🏡',
    shortDesc: 'ตั้งหลักปักฐานมั่นคง ร่มเย็นเป็นสุข ปลอดภัย ไร้โรคภัย ทรัพย์พูนทวี',
    preferredRuk: ['bhumipalo', 'thewi', 'mahatthano', 'raja', 'samano'],
    taboosTh: 'หลีกเลี่ยงวันอุบาทว์, วันโลกาวินาศ, วันอังคาร, วันเสาร์ และวันกาลกิณีของเจ้าบ้าน',
  },
  merit: {
    id: 'merit',
    titleTh: 'ฤกษ์ทำบุญประจำปี / ทำบุญบริษัท / ทำบุญบ้าน',
    icon: '🙏',
    shortDesc: 'เสริมสิริมงคล ปัดเป่าอุปสรรค เจริญด้วยเทวคุณ เกื้อหนุนกิจการรุ่งเรือง',
    preferredRuk: ['samano', 'bhumipalo', 'raja', 'mahatthano'],
    taboosTh: 'หลีกเลี่ยงวันอุบาทว์และวันโลกาวินาศ',
  },
  vehicle_business: {
    id: 'vehicle_business',
    titleTh: 'ฤกษ์ออกรถใหม่ / ขึ้นบ้านใหม่ / เปิดกิจการร้านค้า',
    icon: '🚗',
    shortDesc: 'ยานพาหนะแคล้วคลาด ปลอดภัย ค้าขายกำไรพุ่ง กิจการเติบโตก้าวหน้า',
    preferredRuk: ['mahatthano', 'raja', 'bhumipalo', 'thesatri'],
    taboosTh: 'หลีกเลี่ยงวันกาลกิณีของเจ้าของรถ/เจ้าของกิจการโดยเด็ดขาด และห้ามวันโลกาวินาศ/วันอุบาทว์',
  },
  others: {
    id: 'others',
    titleTh: 'ฤกษ์มงคลอื่นๆ (ถ้ามี เช่น เจรจาค้าขาย, ทำศัลยกรรม)',
    icon: '✨',
    shortDesc: 'เจรจาสำเร็จราบรื่น ทำศัลยกรรมใบหน้าสง่างาม เสริมดวงเสี่ยงโชค ปิดดีลธุรกิจ',
    preferredRuk: ['mahatthano', 'thewi', 'raja', 'thesatri', 'daliddo', 'joro', 'phetchakat'],
    taboosTh: 'ศัลยกรรมห้ามวันเสาร์และวันอังคาร, เจรจาค้าขายให้ใช้ยามอุบากองปลอดโปร่งหรือมีลาภ',
  },
};

// 9 Authentic Thai Astrological Ruks (นพดลฤกษ์ทั้ง ๙)
const THAI_RUK_DESCRIPTIONS: Record<
  ThaiRukType,
  { nameTh: string; alias: string; meaningTh: string; highlightTh: string; bestFor: string; icon: string }
> = {
  daliddo: {
    nameTh: 'ทลิทโทฤกษ์',
    alias: 'ฤกษ์ชูชก / ขอความเมตตา',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งการขอความเห็นใจ ขอความช่วยเหลือ ผู้คนเอ็นดูเมตตา เจรจาประนีประนอม',
    highlightTh: 'เด่นด้านการประนีประนอม ขอความอนุเคราะห์ ได้รับสิ่งของโดยง่าย เจรจาไกล่เกลี่ย',
    bestFor: 'สมัครงาน, สัมภาษณ์งาน, ทวงหนี้, ขอสินเชื่อธนาคาร, ขอความช่วยเหลือจากผู้ใหญ่, ขอผ่อนผันหนี้',
    icon: '🤲',
  },
  mahatthano: {
    nameTh: 'มหัทธโนฤกษ์',
    alias: 'ฤกษ์เศรษฐี',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความมั่งคั่ง อุดมด้วยทรัพย์สิน เงินทองไหลมาเทมา ค้าขายเจริญรุ่งเรือง',
    highlightTh: 'เด่นด้านโชคลาภ ทรัพย์สิน ความมั่งคั่ง ร่ำรวย เงินทองไม่ขาดมือ',
    bestFor: 'เปิดร้านค้า, ออกรถใหม่, ขึ้นบ้านใหม่, แต่งงาน, เซ็นสัญญาธุรกิจ, ซื้อทองคำ, ลงทุนพอร์ตหุ้น',
    icon: '💰',
  },
  joro: {
    nameTh: 'โจโรฤกษ์',
    alias: 'ฤกษ์นักสู้ / ฤกษ์ชิงชัย',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความรวดเร็ว ว่องไว ชิงไหวชิงพริบ แข่งขัน ชนะคดีความ ปราบอุปสรรค บุกเบิก',
    highlightTh: 'เด่นด้านการแข่งขัน ชิงไหวชิงพริบ ตัดหน้าคู่แข่ง ชนะการประมูล ต่อสู้คดีความ',
    bestFor: 'แข่งขันกีฬา, ยื่นซองประมูลงาน, สอบชิงทุน, ฟ้องร้องสู้คดีความ, เปิดตัวแคมเปญการตลาดบุกตลาดใหม่',
    icon: '⚔️',
  },
  bhumipalo: {
    nameTh: 'ภูมิปาโลฤกษ์',
    alias: 'ฤกษ์ผู้รักษาแผ่นดิน',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความมั่นคง มั่งคั่งยืนนาน รากฐานปักแน่น ประดุจแผ่นดินทอง ร่มเย็นถาวร',
    highlightTh: 'เด่นด้านความมั่นคง ถาวร ความร่มเย็นเป็นสุข ปักหลักฐานมั่นคง ไร้อุปสรรค',
    bestFor: 'ขึ้นบ้านใหม่, ย้ายเข้าที่พัก, ซื้อที่ดิน, ปลูกสร้างอาคาร, ลงเสาเอก, ทำบุญบ้าน, ซื้ออสังหาริมทรัพย์',
    icon: '🏛️',
  },
  thesatri: {
    nameTh: 'เทศาตรีฤกษ์',
    alias: 'ฤกษ์พ่อค้า / นักท่องเที่ยว',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งการเดินทาง สัญจร ผู้คนเข้าออกหนาแน่น คึกคักมีชีวิตชีวา ค้าขายคล่องตัว',
    highlightTh: 'เด่นด้านการค้าขายต่างถิ่น คมนาคม กิจการท่องเที่ยว ร้านอาหาร และงานบันเทิง',
    bestFor: 'เปิดร้านอาหาร, โรงแรม, ธุรกิจนำเที่ยว, กิจการขนส่ง, ไลฟ์สดขายของ, เปิดผับบาร์ คาเฟ่',
    icon: '🚢',
  },
  thewi: {
    nameTh: 'เทวีฤกษ์',
    alias: 'ฤกษ์นางพญา',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งเสน่ห์ เมตตามหานิยม ความรัก ความอ่อนหวาน สง่างามดั่งนางพญา ผาสุก',
    highlightTh: 'เด่นด้านเสน่ห์ เมตตามหานิยม ความรัก ความสุขในครอบครัว และความงามสง่า',
    bestFor: 'พิธีแต่งงาน, จดทะเบียนสมรส, ทำศัลยกรรมเสริมสง่าราศี, เปิดร้านสปา/ความงาม, สู่ขอหมั้นหมาย',
    icon: '👑',
  },
  phetchakat: {
    nameTh: 'เพชฌฆาตฤกษ์',
    alias: 'ฤกษ์เด็ดขาด / ฟันฝ่าอุปสรรค',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความเด็ดขาด ตัดสิ่งชั่วร้าย สยบอุปสรรค ผ่าตัด สะเดาะเคราะห์ บวชพระ',
    highlightTh: 'เด่นด้านความเด็ดขาด ฟันฝ่าอุปสรรค ผ่าตัดรักษาโรค สะเดาะเคราะห์ ปราบสิ่งอัปมงคล',
    bestFor: 'ผ่าตัดศัลยกรรมรักษาโรค, ตัดผมแก้เคล็ด, สะเดาะเคราะห์, พิธีปลุกเสกวัตถุมงคล, บวชพระตัดกิเลส',
    icon: '🗡️',
  },
  raja: {
    nameTh: 'ราชาฤกษ์',
    alias: 'ฤกษ์ผู้เป็นใหญ่',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งอำนาจ วาสนา เกียรติยศ บารมี ชัยชนะเหนืออริศัตรู ความเป็นผู้นำ',
    highlightTh: 'เด่นด้านอำนาจบารมี เกียรติยศชื่อเสียง ความสำเร็จในระดับสูง ผู้ใหญ่อุปถัมภ์',
    bestFor: 'เปิดสำนักงานใหญ่, รับตำแหน่งใหม่, ออกรถระดับพรีเมียม, เข้าพบผู้ใหญ่, เจรจาเรื่องสำคัญ, ลงนามสัญญาใหญ่',
    icon: '⚡',
  },
  samano: {
    nameTh: 'สมโณฤกษ์',
    alias: 'ฤกษ์แห่งความสงบสุข',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความสงบสุข ร่มเย็น กุศลธรรม เทพยดาปกปักรักษา ความผาสุกทางจิตใจ',
    highlightTh: 'เด่นด้านความร่มเย็น จิตใจสงบ กุศลบารมี ปลอดภัยจากภยันตราย ปราศจากเวรภัย',
    bestFor: 'ทำบุญประจำปี, ทำบุญขึ้นบ้านใหม่, ทำบุญเปิดบริษัท, บวชเรียน, ปฏิบัติธรรม, หล่อพระพุทธรูป, ไหว้พระ ๙ วัด',
    icon: '🪷',
  },
};

// 27 Thai Nakshatras (กลุ่มดาวนักษัตร ๒๗ กลุ่ม)
interface ThaiNakshatra {
  number: number; // 1-27
  nameTh: string;
  transliteration: string;
  thaiRuk: ThaiRukType;
  meaningTh: string;
}

const THAI_NAKSHATRAS: ThaiNakshatra[] = [
  { number: 1, nameTh: 'อัศวินี', transliteration: 'Ashwini', thaiRuk: 'daliddo', meaningTh: 'ดาวม้า / ปฐมนักษัตร คล่องแคล่ว รวดเร็ว' },
  { number: 2, nameTh: 'ภรณี', transliteration: 'Bharani', thaiRuk: 'mahatthano', meaningTh: 'ดาวแม่ไก่ / อุดมสมบูรณ์ มั่งคั่ง ทรัพย์สิน' },
  { number: 3, nameTh: 'กฤติกา', transliteration: 'Krittika', thaiRuk: 'joro', meaningTh: 'ดาวลูกไก่ / รวดเร็ว เด็ดขาด แข่งขัน ชิงไหวชิงพริบ' },
  { number: 4, nameTh: 'โรหิณี', transliteration: 'Rohini', thaiRuk: 'bhumipalo', meaningTh: 'ดาวพราหมณ์ / มั่นคง ปลูกเรือน แผ่นดินทอง' },
  { number: 5, nameTh: 'มฤคศิระ', transliteration: 'Mrigashira', thaiRuk: 'thesatri', meaningTh: 'ดาวหัวเนื้อ / ท่องเที่ยว ค้าขาย คมนาคม' },
  { number: 6, nameTh: 'อารทรา', transliteration: 'Ardra', thaiRuk: 'thewi', meaningTh: 'ดาวฉัตร / นางพญา เสน่ห์ เมตตา มงคลสมรส' },
  { number: 7, nameTh: 'ปุนัพสุ', transliteration: 'Punarvasu', thaiRuk: 'phetchakat', meaningTh: 'ดาวสำเภา / เด็ดขาด ผ่าตัด ปราบอุปสรรค' },
  { number: 8, nameTh: 'ปุษยะ', transliteration: 'Pushya', thaiRuk: 'raja', meaningTh: 'ดาวสมอสำเภา / ยิ่งใหญ่ เกียรติยศ ผู้นำ บารมี' },
  { number: 9, nameTh: 'อาศเลษา', transliteration: 'Ashlesha', thaiRuk: 'samano', meaningTh: 'ดาวนาก / สงบ ร่มเย็น กุศลธรรม ทำบุญ' },
  { number: 10, nameTh: 'มาฆะ', transliteration: 'Magha', thaiRuk: 'daliddo', meaningTh: 'ดาวโคมูตร / ชูชก ขอความเมตตา ประนีประนอม' },
  { number: 11, nameTh: 'บุรพผลคุนี', transliteration: 'Purva Phalguni', thaiRuk: 'mahatthano', meaningTh: 'ดาวเพดานหน้า / เศรษฐี ร่ำรวย โชคลาภ' },
  { number: 12, nameTh: 'อุตรผลคุนี', transliteration: 'Uttara Phalguni', thaiRuk: 'joro', meaningTh: 'ดาวเพดานหลัง / ชิงชัย ปราบศัตรู ชนะการแข่งขัน' },
  { number: 13, nameTh: 'หัสตะ', transliteration: 'Hasta', thaiRuk: 'bhumipalo', meaningTh: 'ดาวช้าง / มั่นคง หนักแน่น ที่ดิน บ้านเรือน' },
  { number: 14, nameTh: 'จิตระ', transliteration: 'Chitra', thaiRuk: 'thesatri', meaningTh: 'ดาวตาจระเข้ / งานค้าขาย บันเทิง เจรจาต่างแดน' },
  { number: 15, nameTh: 'สวาตี', transliteration: 'Swati', thaiRuk: 'thewi', meaningTh: 'ดาวช้างพัง / เสน่ห์ ความงาม อบอุ่น มีชื่อเสียง' },
  { number: 16, nameTh: 'วิศาขา', transliteration: 'Vishakha', thaiRuk: 'phetchakat', meaningTh: 'ดาวคันฉัตร / เด็ดเดี่ยว สยบสิ่งไม่ดี บวช สะเดาะเคราะห์' },
  { number: 17, nameTh: 'อนุราธะ', transliteration: 'Anuradha', thaiRuk: 'raja', meaningTh: 'ดาวประจำเมือง / ราชา บารมี อำนาจ ผู้ใหญ่อุปถัมภ์' },
  { number: 18, nameTh: 'เชษฐา', transliteration: 'Jyeshtha', thaiRuk: 'samano', meaningTh: 'ดาวช้างใหญ่ / กุศลบารมี ปฏิบัติธรรม คุ้มครองร่มเย็น' },
  { number: 19, nameTh: 'มูละ', transliteration: 'Mula', thaiRuk: 'daliddo', meaningTh: 'ดาวช้างพลาย / ประนีประนอม ติดต่อขอความช่วยเหลือ' },
  { number: 20, nameTh: 'บุรพาษาฒ', transliteration: 'Purva Ashadha', thaiRuk: 'mahatthano', meaningTh: 'ดาวแรดตัวผู้ / ทรัพย์สินงอกเงย ค้าขายกำไรดี' },
  { number: 21, nameTh: 'อุตราษาฒ', transliteration: 'Uttara Ashadha', thaiRuk: 'joro', meaningTh: 'ดาวแรดตัวเมีย / ว่องไว ฉับไว สู้คดี ประมูลชนะ' },
  { number: 22, nameTh: 'ศรวณะ', transliteration: 'Shravana', thaiRuk: 'bhumipalo', meaningTh: 'ดาวพิณ / ร่มเย็น มั่นคง ถาวร ตั้งถิ่นฐาน' },
  { number: 23, nameTh: 'ธนิษฐา', transliteration: 'Dhanishta', thaiRuk: 'thesatri', meaningTh: 'ดาวกา / การค้าสัญจร ดนตรี ศิลปะ ธุรกิจเดินทาง' },
  { number: 24, nameTh: 'ศตภิษัช', transliteration: 'Shatabhisha', thaiRuk: 'thewi', meaningTh: 'ดาวมังกร / ความรัก สเน่ห์ รักษาความงาม ผาสุก' },
  { number: 25, nameTh: 'บุรพภัทรบท', transliteration: 'Purva Bhadrapada', thaiRuk: 'phetchakat', meaningTh: 'ดาวเพดานบน / ตัดขาด ฟันฝ่าอุปสรรค ผ่าตัด' },
  { number: 26, nameTh: 'อุตรภัทรบท', transliteration: 'Uttara Bhadrapada', thaiRuk: 'raja', meaningTh: 'ดาวเพดานล่าง / ราชา วาสนา ผู้บริหาร ตำแหน่งสูง' },
  { number: 27, nameTh: 'เรวดี', transliteration: 'Revati', thaiRuk: 'samano', meaningTh: 'ดาวปลาตะเพียน / ร่มเย็น บวชเรียน เจริญสติ สันติสุข' },
];

// Julian Day Number Calculation
function getJulianDay(yearCE: number, month: number, day: number): number {
  let y = yearCE;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

// Thai Digits Formatter
function toThaiDigits(n: number): string {
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return n.toString().split('').map((ch) => thaiDigits[parseInt(ch, 10)] ?? ch).join('');
}

// Authentic Discrete Thai Lunar Date Calculation (ปฏิทินจันทรคติไทย)
// Anchor: Nov 10, 2026 is ขึ้น ๑ ค่ำ เดือน ๑๒.
// Month 11 is an odd month (เดือนคี่/เดือนขาด): 29 days (Waxing 1-15, Waning 1-14). Ends on Nov 9 (แรม ๑๔ ค่ำ เดือน ๑๑).
// Month 12 is an even month (เดือนคู่/เดือนเต็ม): 30 days (Waxing 1-15, Waning 1-15).
// Nov 24, 2026 is ขึ้น ๑๕ ค่ำ เดือน ๑๒ (วันลอยกระทง / วันเพ็ญ 🌕).
interface ThaiLunarResult {
  lunarDay: number;
  isWaning: boolean;
  lunarMonth: number;
  lunarDateTh: string;
  lunarPhaseThShort: string;
  isHolyDay: boolean;
  moonIcon: string;
}

function calculateThaiLunarDate(yearCE: number, month: number, day: number): ThaiLunarResult {
  // Anchor: 2026-11-10 is Month 12, Waxing (ขึ้น), Day 1
  const targetDate = new Date(Date.UTC(yearCE, month - 1, day));
  const anchorDate = new Date(Date.UTC(2026, 10, 10)); // Nov 10, 2026
  const diffDays = Math.round((targetDate.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));

  let curMonth = 12;
  let isWaning = false;
  let curDay = 1;

  if (diffDays >= 0) {
    for (let i = 0; i < diffDays; i++) {
      const maxWaning = curMonth % 2 === 0 ? 15 : 14;
      if (!isWaning) {
        if (curDay < 15) {
          curDay++;
        } else {
          isWaning = true;
          curDay = 1;
        }
      } else {
        if (curDay < maxWaning) {
          curDay++;
        } else {
          isWaning = false;
          curDay = 1;
          curMonth = (curMonth % 12) + 1;
        }
      }
    }
  } else {
    for (let i = 0; i < Math.abs(diffDays); i++) {
      if (!isWaning) {
        if (curDay > 1) {
          curDay--;
        } else {
          curMonth = curMonth === 1 ? 12 : curMonth - 1;
          const prevMaxWaning = curMonth % 2 === 0 ? 15 : 14;
          isWaning = true;
          curDay = prevMaxWaning;
        }
      } else {
        if (curDay > 1) {
          curDay--;
        } else {
          isWaning = false;
          curDay = 15;
        }
      }
    }
  }

  const lunarDay = curDay;
  const lunarMonth = curMonth;
  const maxWaningForMonth = lunarMonth % 2 === 0 ? 15 : 14;

  // Strict Thai Buddhist holy days (วันพระ):
  // Waxing: 8th and 15th
  // Waning: 8th and last day of month (14th in odd months, 15th in even months)
  const isHolyDay = !isWaning
    ? (lunarDay === 8 || lunarDay === 15)
    : (lunarDay === 8 || lunarDay === maxWaningForMonth);

  let moonIcon = '🌒';
  if (!isWaning) {
    if (lunarDay <= 3) moonIcon = '🌒';
    else if (lunarDay <= 7) moonIcon = '🌓';
    else if (lunarDay === 8) moonIcon = '🌓';
    else if (lunarDay <= 14) moonIcon = '🌔';
    else moonIcon = '🌕';
  } else {
    if (lunarDay <= 7) moonIcon = '🌖';
    else if (lunarDay === 8) moonIcon = '🌗';
    else if (lunarDay <= 13) moonIcon = '🌘';
    else moonIcon = '🌑';
  }

  const phaseWord = isWaning ? 'แรม' : 'ขึ้น';
  const thaiDayStr = `${phaseWord} ${toThaiDigits(lunarDay)} ค่ำ`;
  const thaiMonthStr = `เดือน ${toThaiDigits(lunarMonth)}`;

  let holyNote = '';
  if (isHolyDay) {
    if (lunarDay === 15 && !isWaning) {
      holyNote = ' (วันพระใหญ่ / วันเพ็ญพระจันทร์เต็มดวง)';
    } else if (isWaning && lunarDay === maxWaningForMonth) {
      holyNote = ' (วันพระใหญ่ / สิ้นเดือนทางจันทรคติ)';
    } else {
      holyNote = ' (วันพระ)';
    }
  }

  // Clear formatted strings with unambiguous Arabic numerals alongside Thai numerals
  const lunarDateTh = `${thaiDayStr} (${phaseWord} ${lunarDay} ค่ำ) ${thaiMonthStr}${holyNote}`;
  const lunarPhaseThShort = `${phaseWord} ${lunarDay} ค่ำ ${moonIcon}`;

  return {
    lunarDay,
    isWaning,
    lunarMonth,
    lunarDateTh,
    lunarPhaseThShort,
    isHolyDay,
    moonIcon,
  };
}

// Authentic Thai Ruk & Nakshatra Calculation (ดาวเสวยนักษัตร & นพดลฤกษ์)
// Moon advances ~1 nakshatra per day through 27 nakshatras, cycling through 9 ruks.
function calculateThaiRuk(yearCE: number, month: number, day: number): {
  nakshatraNumber: number;
  nakshatraNameTh: string;
  thaiRuk: ThaiRukType;
} {
  const jd = getJulianDay(yearCE, month, day);
  const jdNov1 = getJulianDay(2026, 11, 1);
  const diffDays = Math.round(jd - jdNov1);

  // On Nov 1, 2026, Moon is in Nakshatra 9 (Ashlesha / อาศเลษา, Samano Ruk)
  const nakshatraNumber = (((diffDays + 8) % 27) + 27) % 27 + 1;
  const nakshatra = THAI_NAKSHATRAS[nakshatraNumber - 1];

  return {
    nakshatraNumber,
    nakshatraNameTh: nakshatra.nameTh,
    thaiRuk: nakshatra.thaiRuk,
  };
}

// Helper to normalize Common Era (C.E.) or Buddhist Era (B.E.) years
export function normalizeToBE(year: number): number {
  if (!Number.isInteger(year)) return new Date().getFullYear() + 543;
  if (year >= 1800 && year < 2400) {
    return year + 543;
  }
  return year;
}

// Kala Yoga calculation for Buddhist Era years (กาลโยคประจำปี)
// In B.E. 2569 (C.E. 2026, Chula Sakarat 1388):
// Thongchai = Wednesday (3), Athipadi = Tuesday (2), Ubatha = Thursday (4), Lokawinas = Saturday (6)
export function getKalaYogaForYear(inputYear: number): {
  thongchai: number;
  athipadi: number;
  ubatha: number;
  lokawinas: number;
  thongchaiNameTh: string;
  athipadiNameTh: string;
  ubathaNameTh: string;
  lokawinasNameTh: string;
  warningText: string;
} {
  const yearBE = normalizeToBE(inputYear);
  const dayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

  if (yearBE === 2569) {
    return {
      thongchai: 3, // Wednesday
      athipadi: 2,  // Tuesday
      ubatha: 4,    // Thursday
      lokawinas: 6, // Saturday
      thongchaiNameTh: 'วันพุธ',
      athipadiNameTh: 'วันอังคาร',
      ubathaNameTh: 'วันพฤหัสบดี',
      lokawinasNameTh: 'วันเสาร์',
      warningText: 'ประกาศกาลโยคประจำปี พ.ศ. 2569: วันพฤหัสบดี เป็น "วันอุบาทว์" และ วันเสาร์ เป็น "วันโลกาวินาศ" ควรงดเว้นการประกอบพิธีมงคลสำคัญในสองวันนี้',
    };
  }

  // General astrological offset formula based on Chula Sakarat (CS = yearBE - 1181)
  const cs = yearBE - 1181;
  const thongchai = (cs * 3 + 2) % 7;
  const athipadi = (thongchai + 6) % 7;
  const ubatha = (thongchai + 1) % 7;
  const lokawinas = (thongchai + 3) % 7;

  return {
    thongchai,
    athipadi,
    ubatha,
    lokawinas,
    thongchaiNameTh: dayNames[thongchai],
    athipadiNameTh: dayNames[athipadi],
    ubathaNameTh: dayNames[ubatha],
    lokawinasNameTh: dayNames[lokawinas],
    warningText: `ประกาศกาลโยคประจำปี พ.ศ. ${yearBE}: ${dayNames[ubatha]} เป็น "วันอุบาทว์" และ ${dayNames[lokawinas]} เป็น "วันโลกาวินาศ" ควรงดเว้นการประกอบพิธีมงคลสำคัญ`,
  };
}

// Maha Thaksa Relationship Calculation (คำนวณทักษาปกรณ์เปรียบเทียบวันเกิดกับวันในปฏิทิน)
function buildKalakiniRelation(labelTh: string): ThaksaRelation {
  return {
    relation: 'kalakini',
    nameTh: 'กาลกิณี',
    isKalakini: true,
    isFavorable: false,
    scoreBonus: -100,
    badgeText: '⚠️ วันกาลกิณี (ควรหลีกเลี่ยง)',
    badgeStyle: 'bad',
    advice: `เป็นวันกาลกิณีของคนเกิด${labelTh} ตามหลักมหาทักษาโบราณ ควรหลีกเลี่ยงการจัดพิธีมงคล ออกรถ แต่งงาน หรือขึ้นบ้านใหม่`,
  };
}

export function getThaksaRelation(birthDayId: BirthDayId, dayOfWeek: number): ThaksaRelation {
  const birthOption = BIRTH_DAYS.find((b) => b.id === birthDayId);

  // 1. Direct authoritative check for Kalakini day
  if (birthOption && birthOption.kalakiniDayOfWeek === dayOfWeek) {
    return buildKalakiniRelation(birthOption.labelTh);
  }

  // 2. Standard Thaksa sequence: บริวาร, อายุ, เดช, ศรี, มูละ, อุตสาหะ, มนตรี, กาลกิณี
  const birthMap: Record<BirthDayId, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday_day: 3,
    saturday: 4,
    thursday: 5,
    wednesday_night: 6,
    friday: 7,
  };

  const dayToThaksaIndex: Record<number, number> = {
    0: 0, // Sunday
    1: 1, // Monday
    2: 2, // Tuesday
    3: 3, // Wednesday (Day)
    4: 5, // Thursday
    5: 7, // Friday
    6: 4, // Saturday
  };

  const birthIdx = birthMap[birthDayId];
  const targetIdx = dayToThaksaIndex[dayOfWeek] ?? 0;
  const diff = (targetIdx - birthIdx + 8) % 8;

  switch (diff) {
    case 0:
      return {
        relation: 'boriwan',
        nameTh: 'บริวาร',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 10,
        badgeText: 'บริวาร (มีผู้สนับสนุน)',
        badgeStyle: 'ok',
        advice: 'เป็นวันบริวาร ได้รับความร่วมมือจากคนรอบข้าง บริวารซื่อสัตย์',
      };
    case 1:
      return {
        relation: 'ayu',
        nameTh: 'อายุ',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 10,
        badgeText: 'อายุ (สุขภาพแข็งแรง)',
        badgeStyle: 'ok',
        advice: 'เป็นวันอายุ ส่งเสริมสุขภาพ ร่างกายสดชื่น ไร้โรคภัยเบียดเบียน',
      };
    case 2:
      return {
        relation: 'dej',
        nameTh: 'เดช',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 25,
        badgeText: 'เดช (บารมี อำนาจ ชัยชนะ)',
        badgeStyle: 'gold',
        advice: 'เป็นวันเดช มหามงคล เสริมอำนาจบารมี ชัยชนะเหนืออุปสรรค เจรจาเฉียบคม',
      };
    case 3:
      return {
        relation: 'sri',
        nameTh: 'ศรี',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 30,
        badgeText: '⭐ วันศรีมงคล (โชคลาภ ทรัพย์สิน)',
        badgeStyle: 'gold',
        advice: 'เป็นวันศรีมงคลสูงสุดของเจ้าชะตา เสริมทรัพย์สินเงินทอง สิริมงคล โชคลาภพูนทวี เหมาะแก่การมงคลทุกชนิด',
      };
    case 4:
      return {
        relation: 'mula',
        nameTh: 'มูละ',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 15,
        badgeText: 'มูละ (รากฐานมั่นคง)',
        badgeStyle: 'ok',
        advice: 'เป็นวันมูละ เสริมสร้างมรดก ความมั่นคง ทรัพย์สินที่ดินยั่งยืน',
      };
    case 5:
      return {
        relation: 'utsaha',
        nameTh: 'อุตสาหะ',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 10,
        badgeText: 'อุตสาหะ (ขยันสำเร็จ)',
        badgeStyle: 'neutral',
        advice: 'เป็นวันอุตสาหะ ต้องลงแรงแข่งขันจึงจะสำเร็จงดงามตามหวัง',
      };
    case 6:
      return {
        relation: 'montri',
        nameTh: 'มนตรี',
        isKalakini: false,
        isFavorable: true,
        scoreBonus: 25,
        badgeText: 'มนตรี (ผู้ใหญ่อุปถัมภ์)',
        badgeStyle: 'gold',
        advice: 'เป็นวันมนตรี ผู้หลักผู้ใหญ่เมตตา อุปถัมภ์ค้ำชู อำนวยความสะดวกในทุกเรื่อง',
      };
    case 7:
    default:
      return buildKalakiniRelation(birthOption?.labelTh ?? '');
  }
}

// Dynamic & Authentic Month Generator with Continuous Lunar Progression and 9 Non-repeating Thai Ruks
export function generateMonthAuspiciousDays(inputYear: number, month: number): AuspiciousDay[] {
  const yearBE = normalizeToBE(inputYear);
  if (!Number.isInteger(yearBE) || yearBE < 2400 || yearBE > 9999) return [];
  if (!Number.isInteger(month) || month < 1 || month > 12) return [];

  const yearCE = yearBE - 543;
  const daysInMonth = new Date(yearCE, month, 0).getDate();
  const kalaYogaInfo = getKalaYogaForYear(yearBE);
  const result: AuspiciousDay[] = [];

  const dayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

  for (let d = 1; d <= daysInMonth; d++) {
    const jsDate = new Date(yearCE, month - 1, d);
    const dayOfWeek = jsDate.getDay();
    const dateStr = `${yearCE}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // 1. Kala Yoga calculation strictly tied to day of week for that year
    let kalaYoga: KalaYogaType = 'normal';
    let kalaYogaLabel = 'วันปกติ';
    if (dayOfWeek === kalaYogaInfo.thongchai) {
      kalaYoga = 'thongchai';
      kalaYogaLabel = `⭐ วันธงชัยประจำปี ${yearBE}`;
    } else if (dayOfWeek === kalaYogaInfo.athipadi) {
      kalaYoga = 'athipadi';
      kalaYogaLabel = `วันอธิบดีประจำปี ${yearBE}`;
    } else if (dayOfWeek === kalaYogaInfo.ubatha) {
      kalaYoga = 'ubatha';
      kalaYogaLabel = `⚠️ วันอุบาทว์ประจำปี ${yearBE}`;
    } else if (dayOfWeek === kalaYogaInfo.lokawinas) {
      kalaYoga = 'lokawinas';
      kalaYogaLabel = `⛔ วันโลกาวินาศประจำปี ${yearBE}`;
    }

    // 2. Continuous Lunar calculation (ข้างขึ้น - ข้างแรม เรียงลำดับถูกต้องตามธรรมชาติ)
    const lunarInfo = calculateThaiLunarDate(yearCE, month, d);

    // Special holiday notes for November 2026
    let fullLunarDateTh = lunarInfo.lunarDateTh;
    if (yearBE === 2569 && month === 11) {
      if (d === 24) {
        fullLunarDateTh = 'ขึ้น ๑๕ ค่ำ (ขึ้น 15 ค่ำ) เดือน ๑๒ (วันเพ็ญ / วันลอยกระทง / วันพระใหญ่)';
      } else if (d === 9) {
        fullLunarDateTh = 'แรม ๑๔ ค่ำ (แรม 14 ค่ำ) เดือน ๑๑ (วันพระใหญ่ / สิ้นเดือนทางจันทรคติ)';
      } else if (d === 10) {
        fullLunarDateTh = 'ขึ้น ๑ ค่ำ (ขึ้น 1 ค่ำ) เดือน ๑๒ (เริ่มเดือนสิบสอง)';
      }
    }

    // 3. Continuous 9 Ruks (นพดลฤกษ์) cycling across 27 Nakshatras day-by-day
    const rukInfo = calculateThaiRuk(yearCE, month, d);
    const thaiRuk = rukInfo.thaiRuk;
    const rukMeta = THAI_RUK_DESCRIPTIONS[thaiRuk];

    // 4. Auspicious ratings and suitable categories
    const suitableCategories: AuspiciousWorkCategory[] = [];
    let isMaster = false;
    let rating = 3;

    if (kalaYoga === 'ubatha' || kalaYoga === 'lokawinas') {
      rating = 1;
      // Taboos: Ubatha and Lokawinas strictly prohibit weddings, housewarming, new business
    } else {
      if (thaiRuk === 'mahatthano') {
        suitableCategories.push('vehicle_business', 'wedding', 'house', 'others');
        rating = kalaYoga === 'thongchai' ? 5 : 4;
        isMaster = true;
      } else if (thaiRuk === 'bhumipalo') {
        suitableCategories.push('house', 'merit', 'wedding', 'others');
        rating = 4;
        isMaster = true;
      } else if (thaiRuk === 'thewi') {
        suitableCategories.push('wedding', 'house', 'others');
        rating = 4;
        isMaster = true;
      } else if (thaiRuk === 'raja') {
        suitableCategories.push('vehicle_business', 'merit', 'others', 'house');
        rating = 4;
        isMaster = true;
      } else if (thaiRuk === 'samano') {
        suitableCategories.push('merit', 'house');
        rating = 4;
      } else if (thaiRuk === 'thesatri') {
        suitableCategories.push('vehicle_business', 'others');
        rating = 3;
      } else if (thaiRuk === 'daliddo') {
        suitableCategories.push('others');
        rating = 3;
      } else if (thaiRuk === 'joro') {
        suitableCategories.push('others');
        rating = 3;
      } else if (thaiRuk === 'phetchakat') {
        suitableCategories.push('others');
        rating = 3;
      }

      if (kalaYoga === 'thongchai') {
        rating = 5;
        isMaster = true;
        suitableCategories.push('merit', 'others');
        if (thaiRuk === 'raja' || thaiRuk === 'thewi' || thaiRuk === 'mahatthano' || thaiRuk === 'bhumipalo') {
          suitableCategories.push('wedding', 'house', 'vehicle_business');
        }
      } else if (kalaYoga === 'athipadi') {
        if (rating < 4) rating = 4;
        isMaster = true;
        suitableCategories.push('others');
      }

      // Full Moon of Month 12 (Loy Krathong)
      if (yearBE === 2569 && month === 11 && d === 24) {
        rating = 5;
        isMaster = true;
        suitableCategories.push('merit', 'others');
      }
    }

    // 5. Ubakong Yama hours & minutes
    const ubakongText =
      kalaYoga === 'thongchai'
        ? 'ขาวสี่สองตัวมีลาภ (เงินทองไหลมาเทมา ปิดดีลใหญ่)'
        : kalaYoga === 'ubatha' || kalaYoga === 'lokawinas'
        ? 'สองศูนย์ถอยอย่ายาตร (งดเว้นพิธีมงคลสำคัญ)'
        : kalaYoga === 'athipadi'
        ? 'ยามราชาโชค (สองศูนย์ปลอดโปร่ง เดินหน้าชนะอุปสรรค)'
        : 'ยามปลอดโปร่ง (สิริมงคล แคล้วคลาด ปลอดภัยทุกทิศ)';

    // 6. Dithi Name
    let dithiName = 'ดิถีสิทธิโชค (สำเร็จราบรื่น)';
    if (kalaYoga === 'thongchai') {
      dithiName = 'ดิถีชัยโชค & มหาสิทธิโชค (ชัยชนะสมบูรณ์แบบ)';
    } else if (kalaYoga === 'athipadi') {
      dithiName = 'ดิถีราชาโชค (เกียรติยศสูงสุด)';
    } else if (kalaYoga === 'ubatha' || kalaYoga === 'lokawinas') {
      dithiName = 'ดิถีสูญเสีย / วันพึงระวัง';
    } else if (lunarInfo.isHolyDay) {
      dithiName = lunarInfo.lunarDay === 15 ? 'ดิถีอำมฤตโชค & วันเพ็ญจันทรา' : 'ดิถีอำมฤตโชค (ไร้อุปสรรค)';
    } else if (isMaster) {
      dithiName = 'ดิถีอำมฤตโชค (ความสำเร็จสูงสุด)';
    }

    // 7. Ceremony Tips
    const ceremonyTips: AuspiciousDay['ceremonyTips'] = {};
    if (kalaYoga !== 'ubatha' && kalaYoga !== 'lokawinas') {
      if (suitableCategories.includes('wedding')) {
        ceremonyTips.wedding = `พิธีรดน้ำสังข์และจดทะเบียนสมรสใน ${rukMeta.nameTh} ส่งเสริมให้คู่สมรสครองรักยืนยาว รุ่งเรืองมั่นคง`;
      }
      if (suitableCategories.includes('house')) {
        ceremonyTips.house = `ขึ้นบ้านใหม่ นำพระพุทธรูป ข้าวสารเต็มถัง น้ำดื่มสะอาด และเงิน ๙๙๙ บาท เข้าบ้านเป็นปฐมฤกษ์`;
      }
      if (suitableCategories.includes('merit')) {
        ceremonyTips.merit = `ทำบุญตักบาตรเช้า ถวายสังฆทาน ปล่อยปลา ๙ ตัว และสวดมนต์บทชินบัญชรเสริมสิริมงคลครอบครัว`;
      }
      if (suitableCategories.includes('vehicle_business')) {
        ceremonyTips.vehicle_business = `ออกรถใหม่ป้ายแดงหรือตัดริบบิ้นเปิดร้านค้า ขับออกจากโชว์รูมหรือเปิดประตูร้านรับทรัพย์ก้อนโต`;
      }
      if (suitableCategories.includes('others')) {
        ceremonyTips.others = `เหมาะแก่การเจรจาธุรกิจ ปิดดีล เซ็นสัญญา หรือทำศัลยกรรมเสริมสง่าราศี`;
      }
      if (yearBE === 2569 && month === 11 && d === 24) {
        ceremonyTips.merit = 'ทำบุญตักบาตรเช้า และร่วมพิธีลอยกระทงขอขมาพระแม่คงคาในยามค่ำ สะเดาะเคราะห์ต่อชะตาชีวิต';
        ceremonyTips.others = 'อาบแสงจันทร์เพ็ญเดือนสิบสอง เสริมเสน่ห์เมตตามหานิยม สวดคาถามหาลาภรับสิริมงคล';
      }
    }

    // 8. Lucky Colors by Day of Week
    const dailyLuckyColors: Record<number, { lucky: string[]; unlucky: string[] }> = {
      0: { lucky: ['สีเขียวมรกต', 'สีชมพู', 'สีทอง'], unlucky: ['สีน้ำเงินเข้ม'] },
      1: { lucky: ['สีม่วงเม็ดมะปราง', 'สีเขียวสด', 'สีทอง'], unlucky: ['สีแดงเพลิง'] },
      2: { lucky: ['สีส้มทอง', 'สีดำขลับ', 'สีม่วง'], unlucky: ['สีขาวนวล'] },
      3: { lucky: ['สีเขียวเหนี่ยวทรัพย์', 'สีเหลืองบุษราคัม', 'สีขาว'], unlucky: ['สีชมพูสด'] },
      4: { lucky: ['สีส้มอิฐ', 'สีฟ้า', 'สีแดง'], unlucky: ['สีดำสนิท'] },
      5: { lucky: ['สีฟ้าพาสเทล', 'สีชมพูอ่อน', 'สีขาว'], unlucky: ['สีเทาเข้ม'] },
      6: { lucky: ['สีม่วงเข้ม', 'สีฟ้า', 'สีทอง'], unlucky: ['สีเขียวสด'] },
    };

    const colors = dailyLuckyColors[dayOfWeek] || { lucky: ['สีทอง', 'สีขาว'], unlucky: ['สีดำ'] };

    result.push({
      date: dateStr,
      dayOfMonth: d,
      month,
      yearBE,
      yearCE,
      dayOfWeek,
      dayNameTh: dayNames[dayOfWeek],
      lunarDateTh: fullLunarDateTh,
      lunarPhaseThShort: lunarInfo.lunarPhaseThShort,
      lunarPhase: lunarInfo.isWaning ? 'waning' : 'waxing',
      lunarDay: lunarInfo.lunarDay,
      lunarMonth: lunarInfo.lunarMonth,
      thaiRuk,
      thaiRukNameTh: rukMeta.nameTh,
      thaiRukMeaning: rukMeta.meaningTh,
      thaiRukHighlight: rukMeta.highlightTh,
      nakshatraNameTh: rukInfo.nakshatraNameTh,
      nakshatraNumber: rukInfo.nakshatraNumber,
      dithiName,
      isMasterAuspicious: isMaster,
      rating,
      suitableCategories: Array.from(new Set(suitableCategories)),
      bestHours: {
        primaryTime: '09:09 - 10:39 น.',
        secondaryTime: '13:19 - 14:49 น.',
        ubakongYama: ubakongText,
        minuteAuspicious: '09:09 น., 09:39 น., 14:19 น.',
      },
      kalaYoga,
      kalaYogaLabel,
      auspiciousDirection:
        dayOfWeek === 3
          ? 'ทิศใต้ (ทิศศรีนำฤกษ์)'
          : dayOfWeek === 2
          ? 'ทิศตะวันออก (ทิศเดช)'
          : 'ทิศตะวันออกเฉียงเหนือ (ทิศศรี)',
      luckyColors: colors.lucky,
      unluckyColors: colors.unlucky,
      ceremonyTips,
      prohibitions:
        kalaYoga === 'ubatha' || kalaYoga === 'lokawinas'
          ? ['ห้ามจัดงานแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามออกรถใหม่, ห้ามเปิดบริษัทเด็ดขาด']
          : ['งดเว้นการประกอบพิธีที่ขัดกับหลักคุณธรรม'],
      buddhistHolyDay: lunarInfo.isHolyDay,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Multilingual Localization Helpers for Auspicious Calendar (TH / EN / ZH)
// ---------------------------------------------------------------------------
export const MONTHS_BY_LANG: Record<SupportedLang, readonly string[]> = {
  th: THAI_MONTHS,
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  zh: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
};

export const WEEKDAYS_BY_LANG: Record<SupportedLang, readonly string[]> = {
  th: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

const FULL_DAY_NAMES_BY_LANG: Record<SupportedLang, readonly string[]> = {
  th: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
};

export function getLocalizedMonths(lang: SupportedLang): readonly string[] {
  return MONTHS_BY_LANG[lang];
}

export function getLocalizedWeekdays(lang: SupportedLang): readonly string[] {
  return WEEKDAYS_BY_LANG[lang];
}

export function getLocalizedFullDayName(dayOfWeek: number, lang: SupportedLang): string {
  return FULL_DAY_NAMES_BY_LANG[lang][dayOfWeek] || FULL_DAY_NAMES_BY_LANG[lang][0];
}

const BIRTH_DAY_LOCALE: Record<BirthDayId, {
  en: { label: string; planet: string; kalakini: string; sri: string };
  zh: { label: string; planet: string; kalakini: string; sri: string };
}> = {
  sunday: {
    en: { label: 'Sunday', planet: 'Sun (1)', kalakini: 'Friday', sri: 'Wednesday (Day)' },
    zh: { label: '星期日生', planet: '日曜 (1)', kalakini: '星期五', sri: '星期三（日间）' },
  },
  monday: {
    en: { label: 'Monday', planet: 'Moon (2)', kalakini: 'Sunday', sri: 'Saturday' },
    zh: { label: '星期一生', planet: '月曜 (2)', kalakini: '星期日', sri: '星期六' },
  },
  tuesday: {
    en: { label: 'Tuesday', planet: 'Mars (3)', kalakini: 'Monday', sri: 'Thursday' },
    zh: { label: '星期二生', planet: '火曜 (3)', kalakini: '星期一', sri: '星期四' },
  },
  wednesday_day: {
    en: { label: 'Wednesday (Day 06:00 - 17:59)', planet: 'Mercury (4)', kalakini: 'Tuesday', sri: 'Wednesday Night / Rahu' },
    zh: { label: '星期三（日间 06:00-17:59）', planet: '水曜 (4)', kalakini: '星期二', sri: '星期三夜间 / 罗睺' },
  },
  wednesday_night: {
    en: { label: 'Wednesday (Night 18:00 - 05:59 / Rahu)', planet: 'Rahu (8)', kalakini: 'Thursday', sri: 'Monday' },
    zh: { label: '星期三（夜间 18:00-05:59 / 罗睺）', planet: '罗睺 (8)', kalakini: '星期四', sri: '星期一' },
  },
  thursday: {
    en: { label: 'Thursday', planet: 'Jupiter (5)', kalakini: 'Saturday', sri: 'Sunday' },
    zh: { label: '星期四生', planet: '木曜 (5)', kalakini: '星期六', sri: '星期日' },
  },
  friday: {
    en: { label: 'Friday', planet: 'Venus (6)', kalakini: 'Wednesday Night / Rahu', sri: 'Tuesday' },
    zh: { label: '星期五生', planet: '金曜 (6)', kalakini: '星期三（夜间）/ 罗睺', sri: '星期二' },
  },
  saturday: {
    en: { label: 'Saturday', planet: 'Saturn (7)', kalakini: 'Wednesday (Day)', sri: 'Friday' },
    zh: { label: '星期六生', planet: '土曜 (7)', kalakini: '星期三（日间）', sri: '星期五' },
  },
};

export interface LocalizedBirthDayOption extends BirthDayOption {
  label: string;
  rulerPlanetLocalized: string;
  kalakiniDayName: string;
  sriDayName: string;
}

export function getLocalizedBirthDays(lang: SupportedLang): LocalizedBirthDayOption[] {
  return BIRTH_DAYS.map((b) => {
    if (lang === 'th') {
      return {
        ...b,
        label: b.labelTh,
        rulerPlanetLocalized: b.rulerPlanet,
        kalakiniDayName: b.kalakiniDayNameTh,
        sriDayName: b.sriDayNameTh,
      };
    }
    const loc = BIRTH_DAY_LOCALE[b.id][lang];
    return {
      ...b,
      label: loc.label,
      rulerPlanetLocalized: loc.planet,
      kalakiniDayName: loc.kalakini,
      sriDayName: loc.sri,
    };
  });
}

const WORK_CATEGORY_LOCALE: Record<AuspiciousWorkCategory, {
  en: { title: string; shortDesc: string; taboos: string };
  zh: { title: string; shortDesc: string; taboos: string };
}> = {
  wedding: {
    en: {
      title: 'Wedding & Marriage Registration',
      shortDesc: 'Fosters lasting love, mutual harmony, charm, and a blissful household.',
      taboos: 'Avoid Ubatha, Lokawinas, Tuesdays, Saturdays, and either partner’s Kalakini day.',
    },
    zh: {
      title: '嫁娶喜事 / 婚姻登记',
      shortDesc: '增进白头偕老之缘、夫妻和顺、福泽满堂、家宅安康。',
      taboos: '避开乌巴凶日、灭绝凶日、星期二、星期六及新人双方忌日。',
    },
  },
  house: {
    en: {
      title: 'Housewarming & Moving In',
      shortDesc: 'Establishes rock-solid foundations, peace, good health, and growing prosperity.',
      taboos: 'Avoid Ubatha, Lokawinas, Tuesdays, Saturdays, and the homeowner’s Kalakini day.',
    },
    zh: {
      title: '乔迁新居 / 入宅安家',
      shortDesc: '根基稳固、家宅清宁、健康顺遂、财源稳步增长。',
      taboos: '避开乌巴凶日、灭绝凶日、星期二、星期六及户主生辰忌日。',
    },
  },
  merit: {
    en: {
      title: 'Merit-Making & Blessing Ceremonies',
      shortDesc: 'Elevates spiritual grace, clears obstacles, and uplifts family & business fortune.',
      taboos: 'Avoid Ubatha and Lokawinas days.',
    },
    zh: {
      title: '祈福做功德 / 开光拜神',
      shortDesc: '广积善缘、消灾解厄、得护法庇佑、家业兴旺。',
      taboos: '避开乌巴凶日与灭绝凶日。',
    },
  },
  vehicle_business: {
    en: {
      title: 'New Vehicle & Business Opening',
      shortDesc: 'Safe travels on the road, thriving commerce, rising profit, and steady expansion.',
      taboos: 'Strictly avoid the owner’s Kalakini day as well as Ubatha and Lokawinas days.',
    },
    zh: {
      title: '提新车 / 开张开业',
      shortDesc: '出入平安顺畅、商机兴旺、客似云来、生意蒸蒸日上。',
      taboos: '严禁于车主或店主忌日，以及乌巴凶日、灭绝凶日行事。',
    },
  },
  others: {
    en: {
      title: 'Other Auspicious Matters (Deals, Aesthetics)',
      shortDesc: 'Smooth negotiations, contract signings, auspicious self-care, and fortunate ventures.',
      taboos: 'Avoid Tuesdays and Saturdays for cosmetic procedures; choose clear Ubakong hours for deals.',
    },
    zh: {
      title: '其他吉事（签约谈判 / 仪容开运）',
      shortDesc: '利于商务谈判、签约成交、焕新仪容及重要决断。',
      taboos: '美容塑形宜避开周二与周六；商务谈判宜择吉时出行。',
    },
  },
};

export interface LocalizedWorkCategoryInfo {
  id: AuspiciousWorkCategory;
  title: string;
  icon: string;
  shortDesc: string;
  preferredRuk: ThaiRukType[];
  taboos: string;
}

export function getLocalizedWorkCategories(
  lang: SupportedLang
): Record<AuspiciousWorkCategory, LocalizedWorkCategoryInfo> {
  const entries = (Object.keys(WORK_CATEGORIES_INFO) as AuspiciousWorkCategory[]).map((key) => {
    const base = WORK_CATEGORIES_INFO[key];
    if (lang === 'th') {
      return [key, { id: base.id, title: base.titleTh, icon: base.icon, shortDesc: base.shortDesc, preferredRuk: base.preferredRuk, taboos: base.taboosTh }] as const;
    }
    const loc = WORK_CATEGORY_LOCALE[key][lang];
    return [key, { id: base.id, title: loc.title, icon: base.icon, shortDesc: loc.shortDesc, preferredRuk: base.preferredRuk, taboos: loc.taboos }] as const;
  });
  return Object.fromEntries(entries) as Record<AuspiciousWorkCategory, LocalizedWorkCategoryInfo>;
}

const THAI_RUK_LOCALE: Record<ThaiRukType, {
  en: { name: string; alias: string; meaning: string; highlight: string; bestFor: string };
  zh: { name: string; alias: string; meaning: string; highlight: string; bestFor: string };
}> = {
  daliddo: {
    en: {
      name: 'Daliddo Ruk',
      alias: 'Auspicious Timing for Requests & Goodwill',
      meaning: 'Moon enters the mansion of favor and empathy—people respond kindly to sincere appeals and negotiations.',
      highlight: 'Favorable for compromise, requesting support, applications, and gentle mediation.',
      bestFor: 'Job applications, interviews, loan requests, debt recovery, and seeking elder support.',
    },
    zh: {
      name: '达利陀吉星（祈恩求援宿）',
      alias: '顺遂恳请与和解之吉日',
      meaning: '太阴临慈悲感应之星宿，诚心求助或洽谈最易获得贵人恻隐与支持。',
      highlight: '利于协商调解、申办请求、争取体谅与顺利获准。',
      bestFor: '求职面试、申请贷款、催收款项、拜托长辈引荐。',
    },
  },
  mahatthano: {
    en: {
      name: 'Mahatthano Ruk',
      alias: 'The Wealth & Merchant’s Fortune',
      meaning: 'Moon illuminates abundant wealth and flowing commerce—prime timing for prosperity.',
      highlight: 'Excels in financial fortune, trade growth, asset acquisition, and steady cash flow.',
      bestFor: 'Grand openings, new vehicles, housewarming, weddings, investments, and contracts.',
    },
    zh: {
      name: '大富吉星（富贵生财宿）',
      alias: '商贾兴隆聚财吉日',
      meaning: '太阴入丰盈聚宝之星宿，主财禄丰厚、买卖兴隆、事业蒸蒸日上。',
      highlight: '旺正偏财运、资产积累、交易成交与富足吉祥。',
      bestFor: '开张开业、提新车、乔迁、嫁娶、签约投资与置业。',
    },
  },
  joro: {
    en: {
      name: 'Joro Ruk',
      alias: 'The Bold Competitor’s Timing',
      meaning: 'Swift and decisive lunar energy empowering bold action, competition, and breakthroughs.',
      highlight: 'Excels in competitive bids, sports, rapid launches, and overcoming rivals.',
      bestFor: 'Competitions, bidding tenders, scholarship exams, legal filings, and bold campaigns.',
    },
    zh: {
      name: '勇决星（竞逐制胜宿）',
      alias: '锐意争先与突破之日',
      meaning: '星象敏捷果断，主行动迅速、机智过人、破局致胜。',
      highlight: '利于竞赛竞标、抢占先机、维权胜诉与开拓新局。',
      bestFor: '体育竞赛、项目投标、奖学金考试、诉讼维权与新品突围。',
    },
  },
  bhumipalo: {
    en: {
      name: 'Bhumipalo Ruk',
      alias: 'The Guardian of Land & Stability',
      meaning: 'Moon anchors lasting stability like sacred earth—ideal for homes, land, and long-term roots.',
      highlight: 'Excels in permanence, peaceful households, real estate, and durable foundations.',
      bestFor: 'Housewarming, moving in, land purchase, groundbreaking, construction, and home blessings.',
    },
    zh: {
      name: '护土吉星（安居固本宿）',
      alias: '置业安宅与基业长青日',
      meaning: '星气厚重如大地，主根基牢靠、合家平安、事业稳如泰山。',
      highlight: '最旺长久稳固、家庭和睦、不动产交易与兴工动土。',
      bestFor: '入宅乔迁、买地购房、动土奠基、安居祈福。',
    },
  },
  thesatri: {
    en: {
      name: 'Thesatri Ruk',
      alias: 'The Traveler & Bustling Trade Timing',
      meaning: 'Moon brings lively foot traffic, travel fortune, and energetic commercial movement.',
      highlight: 'Excels in cross-border trade, logistics, hospitality, dining, and entertainment.',
      bestFor: 'Restaurants, cafes, hotels, tourism, logistics, livestreams, and travel ventures.',
    },
    zh: {
      name: '行商吉星（远游通达宿）',
      alias: '客流如织与商旅兴旺日',
      meaning: '太阴临流动兴旺之星宿，主往来络绎、人气旺盛、交易活跃。',
      highlight: '旺跨区商贸、交通运输、文旅餐饮及文娱传播行业。',
      bestFor: '开设餐厅咖啡馆、酒店旅游、物流贸易、直播带货。',
    },
  },
  thewi: {
    en: {
      name: 'Thewi Ruk',
      alias: 'The Sovereign Grace & Romance Timing',
      meaning: 'Moon bestows grace, charisma, tenderness, and auspicious harmony in love and elegance.',
      highlight: 'Excels in charm, popularity, happy marriage, beauty, and family warmth.',
      bestFor: 'Weddings, engagements, marriage registration, beauty care, and creative studios.',
    },
    zh: {
      name: '天后吉星（婉雅姻缘宿）',
      alias: '人缘魅力与美满姻缘日',
      meaning: '星光柔美尊贵，主魅力大增、贵人爱护、姻缘和合与优雅风范。',
      highlight: '最旺桃花人缘、婚姻幸福、美容美学及家庭温馨。',
      bestFor: '婚礼庆典、订婚登记、美容护理、美业开业。',
    },
  },
  phetchakat: {
    en: {
      name: 'Phetchakat Ruk',
      alias: 'The Decisive Cleaver of Obstacles',
      meaning: 'Sharp, resolute timing suited for cutting away misfortune, surgery, and decisive resets.',
      highlight: 'Excels in resolving lingering obstacles, medical procedures, and karmic cleansing.',
      bestFor: 'Medical surgery, bad-luck cleansing, ordination, and cutting off toxic habits.',
    },
    zh: {
      name: '决断星（斩障破厄宿）',
      alias: '果决治病与化解阻碍日',
      meaning: '星象刚毅果断，利于斩断阻滞、祛除病气、清净身心。',
      highlight: '利于突破瓶颈、医疗手术、化煞祈福及重整旗鼓。',
      bestFor: '外科疗愈、化解太岁厄运、剃度修行、断舍离旧习。',
    },
  },
  raja: {
    en: {
      name: 'Raja Ruk',
      alias: 'The Royal Authority & Honor Timing',
      meaning: 'Moon radiates sovereignty, prestige, triumph over hurdles, and noble leadership.',
      highlight: 'Excels in authority, reputation, executive milestones, and backing from VIP patrons.',
      bestFor: 'Headquarters launch, promotions, executive vehicles, major signings, VIP meetings.',
    },
    zh: {
      name: '帝王吉星（尊荣权威宿）',
      alias: '显赫威望与升迁吉日',
      meaning: '星气尊贵庄严，主官禄威望、贵人提携、胜券在握。',
      highlight: '旺事业声望、领袖气场、高阶晋升与重量级合作。',
      bestFor: '总部揭幕、履新升职、喜提座驾、重大签约、拜会尊长。',
    },
  },
  samano: {
    en: {
      name: 'Samano Ruk',
      alias: 'The Serene Monk’s Blessing Timing',
      meaning: 'Moon radiates tranquility, wholesome merit, divine protection, and spiritual clarity.',
      highlight: 'Excels in peace of mind, merit-making, spiritual protection, and calm harmony.',
      bestFor: 'Annual merit ceremonies, home/office blessings, ordination, meditation, and temple tours.',
    },
    zh: {
      name: '禅悦吉星（清净福田宿）',
      alias: '安详修福与诸神护佑日',
      meaning: '星象宁静祥和，主善德圆满、天神庇佑、心灵澄明安泰。',
      highlight: '最旺消灾祈福、家宅清净、修行禅坐与积善纳祥。',
      bestFor: '年度祈福、公司/新居法会、禅修静坐、九寺朝圣。',
    },
  },
};

export function getLocalizedThaiRuk(type: ThaiRukType, lang: SupportedLang) {
  const base = THAI_RUK_DESCRIPTIONS[type];
  if (lang === 'th') {
    return {
      name: base.nameTh,
      alias: base.alias,
      meaning: base.meaningTh,
      highlight: base.highlightTh,
      bestFor: base.bestFor,
      icon: base.icon,
    };
  }
  const loc = THAI_RUK_LOCALE[type][lang];
  return { ...loc, icon: base.icon };
}

export function getLocalizedKalaYogaLabel(day: AuspiciousDay, lang: SupportedLang): string {
  if (lang === 'th') return day.kalaYogaLabel;
  if (lang === 'en') {
    if (day.kalaYoga === 'thongchai') return `⭐ Thongchai Victory Day (${day.yearCE})`;
    if (day.kalaYoga === 'athipadi') return `Athipadi Sovereign Day (${day.yearCE})`;
    if (day.kalaYoga === 'ubatha') return `⚠️ Ubatha Taboo Day (${day.yearCE})`;
    if (day.kalaYoga === 'lokawinas') return `⛔ Lokawinas Inauspicious Day (${day.yearCE})`;
    return 'Standard Day';
  }
  if (day.kalaYoga === 'thongchai') return `⭐ 年度大吉旗胜日 (${day.yearCE})`;
  if (day.kalaYoga === 'athipadi') return `年度尊贵主宰日 (${day.yearCE})`;
  if (day.kalaYoga === 'ubatha') return `⚠️ 年度乌巴凶忌日 (${day.yearCE})`;
  if (day.kalaYoga === 'lokawinas') return `⛔ 年度灭绝凶忌日 (${day.yearCE})`;
  return '平日';
}

const THAKSA_LOCALE: Record<ThaksaRelation['relation'], {
  en: { name: string; badge: string; advice: (birthLabel: string) => string };
  zh: { name: string; badge: string; advice: (birthLabel: string) => string };
}> = {
  kalakini: {
    en: {
      name: 'Kalakini (Taboo)',
      badge: '⚠️ Kalakini Day (Avoid)',
      advice: (b) => `This is the personal Kalakini taboo day for those born on ${b}. Avoid weddings, vehicle delivery, or housewarming.`,
    },
    zh: {
      name: '灾煞忌日（避用）',
      badge: '⚠️ 个人忌日（宜避开）',
      advice: (b) => `此日为${b}之人的大煞忌日，传统星相宜避开嫁娶、提新车或乔迁入宅等重要仪式。`,
    },
  },
  boriwan: {
    en: {
      name: 'Boriwan (Support)',
      badge: 'Boriwan (Allies & Team)',
      advice: () => 'A day of supportive companions—expect loyal cooperation from peers and team members.',
    },
    zh: {
      name: '辅弼星（贵人协助）',
      badge: '辅弼（人缘助力）',
      advice: () => '得团队与亲友衷心协作之日，众人齐心、事半功倍。',
    },
  },
  ayu: {
    en: {
      name: 'Ayu (Vitality)',
      badge: 'Ayu (Health & Longevity)',
      advice: () => 'Boosts physical vitality, refreshed spirit, and serene resilience.',
    },
    zh: {
      name: '长寿星（安康顺遂）',
      badge: '长寿（身心康泰）',
      advice: () => '旺健康元气与身心安适之日，适合调养、安宅与祈福。',
    },
  },
  dej: {
    en: {
      name: 'Dej (Authority)',
      badge: 'Dej (Power & Victory)',
      advice: () => 'Highly auspicious for leadership, sharp negotiation, and overcoming obstacles.',
    },
    zh: {
      name: '威德星（权威胜局）',
      badge: '威德（气场与胜算）',
      advice: () => '主气场强盛、谈判犀利、突破难关、赢得尊严与主动权。',
    },
  },
  sri: {
    en: {
      name: 'Sri (Supreme Fortune)',
      badge: '⭐ Sri Auspicious (Wealth & Grace)',
      advice: () => 'Your supreme lucky day—enhances wealth, blessings, popularity, and all auspicious ceremonies.',
    },
    zh: {
      name: '吉祥福星（财禄大吉）',
      badge: '⭐ 本命大吉（招财纳福）',
      advice: () => '您生辰八大星象中最吉之日，大旺财禄、喜庆与诸事吉祥圆满。',
    },
  },
  mula: {
    en: {
      name: 'Mula (Foundation)',
      badge: 'Mula (Roots & Assets)',
      advice: () => 'Strengthens property, inheritance, and durable long-term security.',
    },
    zh: {
      name: '根基星（资产稳固）',
      badge: '根基（家业长青）',
      advice: () => '利于置业留财、夯实事业与家庭长远根基。',
    },
  },
  utsaha: {
    en: {
      name: 'Utsaha (Diligence)',
      badge: 'Utsaha (Effort Rewarded)',
      advice: () => 'Rewarding results follow focused perseverance and active preparation.',
    },
    zh: {
      name: '精进星（勤勉有成）',
      badge: '精进（耕耘收获）',
      advice: () => '只要积极推进与勤奋筹备，便能换来实打实的圆满成果。',
    },
  },
  montri: {
    en: {
      name: 'Montri (Patronage)',
      badge: 'Montri (Elder Backing)',
      advice: () => 'Senior mentors and noble patrons show goodwill and clear the path forward.',
    },
    zh: {
      name: '贵人星（长辈提携）',
      badge: '贵人（庇佑顺畅）',
      advice: () => '易获师长、上司及贵人悉心照拂，诸事沟通顺畅无阻。',
    },
  },
};

export function getLocalizedThaksaRelation(
  thaksa: ThaksaRelation,
  birthDayId: BirthDayId,
  lang: SupportedLang
): ThaksaRelation {
  if (lang === 'th') return thaksa;
  const birthOpt = getLocalizedBirthDays(lang).find((b) => b.id === birthDayId);
  const loc = THAKSA_LOCALE[thaksa.relation][lang];
  return {
    ...thaksa,
    nameTh: loc.name,
    badgeText: loc.badge,
    advice: loc.advice(birthOpt?.label || ''),
  };
}

const COLOR_TRANSLATIONS: Record<string, { en: string; zh: string }> = {
  'สีเขียวมรกต': { en: 'Emerald Green', zh: '祖母绿' },
  'สีชมพู': { en: 'Rose Pink', zh: '玫瑰粉' },
  'สีทอง': { en: 'Imperial Gold', zh: '皇室金' },
  'สีน้ำเงินเข้ม': { en: 'Dark Navy', zh: '深海蓝' },
  'สีม่วงเม็ดมะปราง': { en: 'Plum Purple', zh: '梅子紫' },
  'สีเขียวสด': { en: 'Fresh Green', zh: '翠绿色' },
  'สีแดงเพลิง': { en: 'Fiery Red', zh: '烈焰红' },
  'สีส้มทอง': { en: 'Amber Gold', zh: '琥珀橙金' },
  'สีดำขลับ': { en: 'Jet Black', zh: '玄黑色' },
  'สีม่วง': { en: 'Violet Purple', zh: '紫罗兰' },
  'สีขาวนวล': { en: 'Cream White', zh: '柔白' },
  'สีเขียวเหนี่ยวทรัพย์': { en: 'Wealth Jade Green', zh: '招财翡翠绿' },
  'สีเหลืองบุษราคัม': { en: 'Topaz Yellow', zh: '黄玉金' },
  'สีขาว': { en: 'Pure White', zh: '纯净白' },
  'สีชมพูสด': { en: 'Bright Pink', zh: '亮粉红' },
  'สีส้มอิฐ': { en: 'Terracotta Orange', zh: '砖橙色' },
  'สีฟ้า': { en: 'Sky Blue', zh: '天蓝色' },
  'สีแดง': { en: 'Crimson Red', zh: '朱砂红' },
  'สีดำสนิท': { en: 'Pitch Black', zh: '纯黑' },
  'สีฟ้าพาสเทล': { en: 'Pastel Blue', zh: '粉彩蓝' },
  'สีชมพูอ่อน': { en: 'Soft Pink', zh: '淡粉色' },
  'สีเทาเข้ม': { en: 'Charcoal Grey', zh: '深灰色' },
  'สีม่วงเข้ม': { en: 'Deep Purple', zh: '深紫色' },
  'สีดำ': { en: 'Black', zh: '黑色' },
};

function translateColorList(colors: string[], lang: SupportedLang): string[] {
  if (lang === 'th') return colors;
  return colors.map((c) => COLOR_TRANSLATIONS[c]?.[lang] || c);
}

function getLocalizedDirection(dayOfWeek: number, lang: SupportedLang, thFallback: string): string {
  if (lang === 'th') return thFallback;
  if (lang === 'en') {
    if (dayOfWeek === 3) return 'South (Sri Auspicious Direction)';
    if (dayOfWeek === 2) return 'East (Dej Authority Direction)';
    return 'Northeast (Sri Auspicious Direction)';
  }
  if (dayOfWeek === 3) return '正南（吉星开运方）';
  if (dayOfWeek === 2) return '正东（威德贵人方）';
  return '东北（喜神财位方）';
}

function getLocalizedUbakongAndDithi(day: AuspiciousDay, lang: SupportedLang) {
  if (lang === 'th') {
    return {
      ubakongYama: day.bestHours.ubakongYama,
      dithiName: day.dithiName,
      primaryTime: day.bestHours.primaryTime,
      secondaryTime: day.bestHours.secondaryTime,
      minuteAuspicious: day.bestHours.minuteAuspicious,
    };
  }
  const timeSuffix = lang === 'en' ? '' : '';
  const primaryTime = lang === 'en' ? '09:09 - 10:39 AM' : '09:09 - 10:39';
  const secondaryTime = lang === 'en' ? '13:19 - 14:49 PM' : '13:19 - 14:49';
  const minuteAuspicious = lang === 'en' ? '09:09, 09:39, 14:19' : '09:09、09:39、14:19';

  if (lang === 'en') {
    const ubakongYama =
      day.kalaYoga === 'thongchai'
        ? 'Double-Four Wealth Hour (Prosperity & Big Deals)'
        : day.kalaYoga === 'ubatha' || day.kalaYoga === 'lokawinas'
        ? 'Two-Zero Retreat Hour (Pause Major Ceremonies)'
        : day.kalaYoga === 'athipadi'
        ? 'Raja Sovereign Hour (Clear Path & Victory)'
        : 'Serene Clear Hour (Protected & Smooth Progress)';
    let dithiName = 'Siddhi-Chok Dithi (Smooth Success)';
    if (day.kalaYoga === 'thongchai') dithiName = 'Chai-Chok & Maha Siddhi Dithi (Supreme Victory)';
    else if (day.kalaYoga === 'athipadi') dithiName = 'Raja-Chok Dithi (Highest Honor)';
    else if (day.kalaYoga === 'ubatha' || day.kalaYoga === 'lokawinas') dithiName = 'Cautionary Dithi / Day of Restraint';
    else if (day.buddhistHolyDay) dithiName = day.lunarDay === 15 ? 'Amrit-Chok & Full Moon Dithi' : 'Amrit-Chok Dithi (Obstacle-Free)';
    else if (day.isMasterAuspicious) dithiName = 'Amrit-Chok Dithi (Peak Achievement)';
    return { ubakongYama, dithiName, primaryTime, secondaryTime, minuteAuspicious };
  }

  const ubakongYama =
    day.kalaYoga === 'thongchai'
      ? '双吉旺财时（财源广进、利于成交大单）'
      : day.kalaYoga === 'ubatha' || day.kalaYoga === 'lokawinas'
      ? '退守避煞时（宜静不宜动、暂缓重大吉事）'
      : day.kalaYoga === 'athipadi'
      ? '帝王胜算时（一路坦途、克服阻滞）'
      : '清宁顺遂时（平安护佑、诸事顺畅）';
  let dithiName = '悉地吉时（顺遂圆满）';
  if (day.kalaYoga === 'thongchai') dithiName = '胜吉大成星格（全面致胜）';
  else if (day.kalaYoga === 'athipadi') dithiName = '尊荣王吉星格（声望隆盛）';
  else if (day.kalaYoga === 'ubatha' || day.kalaYoga === 'lokawinas') dithiName = '损耗戒慎星格（宜守不宜攻）';
  else if (day.buddhistHolyDay) dithiName = day.lunarDay === 15 ? '甘露吉日 & 望月满圆夜' : '甘露吉日（诸障消融）';
  else if (day.isMasterAuspicious) dithiName = '甘露胜日（事半功倍）';
  void timeSuffix;
  return { ubakongYama, dithiName, primaryTime, secondaryTime, minuteAuspicious };
}

export function getLocalizedDayDetails(day: AuspiciousDay, lang: SupportedLang) {
  if (lang === 'th') {
    return {
      dayName: day.dayNameTh,
      lunarDate: day.lunarDateTh,
      lunarPhaseShort: day.lunarPhaseThShort,
      thaiRukName: day.thaiRukNameTh,
      thaiRukMeaning: day.thaiRukMeaning,
      thaiRukHighlight: day.thaiRukHighlight,
      nakshatraName: day.nakshatraNameTh,
      dithiName: day.dithiName,
      kalaYogaLabel: day.kalaYogaLabel,
      auspiciousDirection: day.auspiciousDirection,
      luckyColors: day.luckyColors,
      unluckyColors: day.unluckyColors,
      bestHours: day.bestHours,
      ceremonyTips: day.ceremonyTips,
      prohibitions: day.prohibitions,
    };
  }

  const ruk = getLocalizedThaiRuk(day.thaiRuk, lang);
  const nakMeta = THAI_NAKSHATRAS[day.nakshatraNumber - 1];
  const moonIcon = day.lunarPhaseThShort.split(' ').pop() || '🌙';
  const isSpecialNov24 = day.yearBE === 2569 && day.month === 11 && day.dayOfMonth === 24;

  const lunarDate =
    lang === 'en'
      ? `${day.lunarPhase === 'waxing' ? 'Waxing' : 'Waning'} Day ${day.lunarDay}, Lunar Month ${day.lunarMonth}${
          isSpecialNov24
            ? ' (Full Moon / Loy Krathong / Buddhist Holy Day)'
            : day.buddhistHolyDay
            ? day.lunarDay === 15 && day.lunarPhase === 'waxing'
              ? ' (Grand Holy Day / Full Moon)'
              : ' (Buddhist Holy Day)'
            : ''
        }`
      : `${day.lunarPhase === 'waxing' ? '上弦' : '下弦'}初${day.lunarDay} · 泰历${day.lunarMonth}月${
          isSpecialNov24
            ? '（满月 / 水灯节 / 大佛日）'
            : day.buddhistHolyDay
            ? day.lunarDay === 15 && day.lunarPhase === 'waxing'
              ? '（望月大佛日）'
              : '（泰历斋戒佛日）'
            : ''
        }`;

  const lunarPhaseShort =
    lang === 'en'
      ? `${day.lunarPhase === 'waxing' ? 'Waxing' : 'Waning'} ${day.lunarDay} ${moonIcon}`
      : `${day.lunarPhase === 'waxing' ? '上' : '下'}${day.lunarDay} ${moonIcon}`;

  const tips: AuspiciousDay['ceremonyTips'] = {};
  if (day.kalaYoga !== 'ubatha' && day.kalaYoga !== 'lokawinas') {
    if (day.ceremonyTips.wedding) {
      tips.wedding =
        lang === 'en'
          ? `Conch-blessing and marriage registration under ${ruk.name} nurture lasting devotion and household harmony.`
          : `于「${ruk.name}」举行婚礼洒水祈福与婚姻登记，寓意琴瑟和鸣、白首同心。`;
    }
    if (day.ceremonyTips.house) {
      tips.house =
        lang === 'en'
          ? 'Bring a sacred image, full rice jar, pure water, and auspicious offerings into the new home at first light.'
          : '吉时恭请佛像、满桶香米、净水与吉数礼金入宅安居，祈愿合家兴旺。';
    }
    if (day.ceremonyTips.merit) {
      tips.merit = isSpecialNov24
        ? lang === 'en'
          ? 'Offer morning alms and float a Krathong at dusk to honor the River Goddess and renew good fortune.'
          : '清晨布施供僧，夜晚放水灯祈福谢水神，消灾增福、万事顺遂。'
        : lang === 'en'
        ? 'Offer morning alms, release fish compassionately, and chant sacred blessings for family peace.'
        : '清晨布施供奉、慈悲放生并静心诵经，广结福缘、护佑家宅平安。';
    }
    if (day.ceremonyTips.vehicle_business) {
      tips.vehicle_business =
        lang === 'en'
          ? 'Ideal for taking delivery of a new vehicle or cutting the ribbon to welcome flourishing revenue.'
          : '最宜提取新车出库或店铺剪彩开张，迎接滚滚财源与平安顺利。';
    }
    if (day.ceremonyTips.others) {
      tips.others = isSpecialNov24
        ? lang === 'en'
          ? 'Bathe in the 12th-month full moonlight to uplift personal grace, charm, and prosperity blessings.'
          : '十二月满月之夜沐浴清辉，静心祈愿人缘魅力与财禄丰盈。'
        : lang === 'en'
        ? 'Favorable for business negotiations, signing agreements, or auspicious self-care milestones.'
        : '适合商务谈判、重要签约成交，或进行焕新仪容之吉事。';
    }
  }

  const timing = getLocalizedUbakongAndDithi(day, lang);

  return {
    dayName: getLocalizedFullDayName(day.dayOfWeek, lang),
    lunarDate,
    lunarPhaseShort,
    thaiRukName: ruk.name,
    thaiRukMeaning: ruk.meaning,
    thaiRukHighlight: ruk.highlight,
    nakshatraName:
      lang === 'en'
        ? nakMeta?.transliteration || day.nakshatraNameTh
        : `${nakMeta?.transliteration || day.nakshatraNameTh} · 第${day.nakshatraNumber}宿`,
    dithiName: timing.dithiName,
    kalaYogaLabel: getLocalizedKalaYogaLabel(day, lang),
    auspiciousDirection: getLocalizedDirection(day.dayOfWeek, lang, day.auspiciousDirection),
    luckyColors: translateColorList(day.luckyColors, lang),
    unluckyColors: translateColorList(day.unluckyColors, lang),
    bestHours: {
      primaryTime: timing.primaryTime,
      secondaryTime: timing.secondaryTime,
      ubakongYama: timing.ubakongYama,
      minuteAuspicious: timing.minuteAuspicious,
    },
    ceremonyTips: tips,
    prohibitions:
      day.kalaYoga === 'ubatha' || day.kalaYoga === 'lokawinas'
        ? [
            lang === 'en'
              ? 'Strictly avoid weddings, housewarming, new vehicle delivery, or grand company openings.'
              : '严禁举办婚礼、乔迁入宅、提新车或盛大开业仪式。',
          ]
        : [
            lang === 'en'
              ? 'Refrain from unethical actions or unkind speech during ceremonies.'
              : '仪式期间忌口舌争执与违背善德之举。',
          ],
  };
}

