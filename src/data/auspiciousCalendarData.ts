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
  if (!Number.isInteger(year)) return 2569;
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
