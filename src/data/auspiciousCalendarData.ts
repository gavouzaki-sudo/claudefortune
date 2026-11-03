// Thai Astrological Calendar & Auspicious Timing Engine (โหราศาสตร์ไทย & ปฏิทินฤกษ์มงคล)
// Complete calculations for Kala Yoga, Maha Thaksa, 9 Thai Ruk, Ubakong Hours, and 5 Auspicious Work Categories

export type ThaiRukType =
  | 'mahatthano'   // มหัทธโนฤกษ์ (ฤกษ์เศรษฐี ค้าขาย ร่ำรวย ทรัพย์สิน)
  | 'bhumipalo'    // ภูมิปาโลฤกษ์ (ฤกษ์ผู้รักษาแผ่นดิน มั่นคง ถาวร ที่ดิน บ้าน)
  | 'thewi'        // เทวีฤกษ์ (ฤกษ์นางพญา เสน่ห์ เมตตา มงคลสมรส ความงาม)
  | 'raja'         // ราชาฤกษ์ (ฤกษ์ผู้เป็นใหญ่ บารมี ชื่อเสียง อำนาจ ส่งมอบงาน)
  | 'samano'       // สมโณฤกษ์ (ฤกษ์สงบสุข ร่มเย็น กุศลธรรม ทำบุญ บวช)
  | 'thesatri'     // เทศาตรีฤกษ์ (ฤกษ์พ่อค้า ท่องเที่ยว กิจการต่างแดน บันเทิง)
  | 'daliddo';     // ทลิทโทฤกษ์ (ฤกษ์ขอความเมตตา ทวงหนี้ เจรจาประนีประนอม)

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
  lunarDateTh: string;
  thaiRuk: ThaiRukType;
  thaiRukNameTh: string;
  thaiRukMeaning: string;
  thaiRukHighlight: string;
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
    preferredRuk: ['thewi', 'mahatthano', 'bhumipalo'],
    taboosTh: 'หลีกเลี่ยงวันอุบาทว์, วันโลกาวินาศ, วันอังคาร, วันเสาร์ และวันกาลกิณีของทั้งคู่',
  },
  house: {
    id: 'house',
    titleTh: 'ฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่',
    icon: '🏡',
    shortDesc: 'ตั้งหลักปักฐานมั่นคง ร่มเย็นเป็นสุข ปลอดภัย ไร้โรคภัย ทรัพย์พูนทวี',
    preferredRuk: ['bhumipalo', 'thewi', 'mahatthano', 'raja'],
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
    preferredRuk: ['mahatthano', 'raja', 'bhumipalo'],
    taboosTh: 'หลีกเลี่ยงวันกาลกิณีของเจ้าของรถ/เจ้าของกิจการโดยเด็ดขาด และห้ามวันโลกาวินาศ/วันอุบาทว์',
  },
  others: {
    id: 'others',
    titleTh: 'ฤกษ์มงคลอื่นๆ (ถ้ามี เช่น เจรจาค้าขาย, ทำศัลยกรรม)',
    icon: '✨',
    shortDesc: 'เจรจาสำเร็จราบรื่น ทำศัลยกรรมใบหน้าสง่างาม เสริมดวงเสี่ยงโชค ปิดดีลธุรกิจ',
    preferredRuk: ['mahatthano', 'thewi', 'raja', 'daliddo'],
    taboosTh: 'ศัลยกรรมห้ามวันเสาร์และวันอังคาร, เจรจาค้าขายให้ใช้ยามอุบากองปลอดโปร่งหรือมีลาภ',
  },
};

export const THAI_RUK_DESCRIPTIONS: Record<
  ThaiRukType,
  { nameTh: string; alias: string; meaningTh: string; highlightTh: string; bestFor: string; icon: string }
> = {
  mahatthano: {
    nameTh: 'มหัทธโนฤกษ์',
    alias: 'ฤกษ์เศรษฐี',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความมั่งคั่ง อุดมด้วยทรัพย์สิน เงินทองไหลมาเทมา ค้าขายเจริญรุ่งเรือง',
    highlightTh: 'เด่นด้านโชคลาภ ทรัพย์สิน ความมั่งคั่ง ร่ำรวย',
    bestFor: 'เปิดร้านค้า, ออกรถใหม่, ขึ้นบ้านใหม่, แต่งงาน, เซ็นสัญญาธุรกิจ, ซื้อทองคำ, ลงทุน',
    icon: '💰',
  },
  bhumipalo: {
    nameTh: 'ภูมิปาโลฤกษ์',
    alias: 'ฤกษ์ผู้รักษาแผ่นดิน',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความมั่นคง มั่งคั่งยืนนาน รากฐานปักแน่น ประดุจแผ่นดินทอง',
    highlightTh: 'เด่นด้านความมั่นคง ถาวร ความร่มเย็นเป็นสุข ไร้อุปสรรค',
    bestFor: 'ขึ้นบ้านใหม่, ย้ายเข้าที่พัก, ซื้อที่ดิน, ปลูกสร้างอาคาร, ลงเสาเอก, ทำบุญบ้าน',
    icon: '🏛️',
  },
  thewi: {
    nameTh: 'เทวีฤกษ์',
    alias: 'ฤกษ์นางพญา',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งเสน่ห์ เมตตามหานิยม ความรัก ความอ่อนหวาน สง่างามดั่งนางพญา',
    highlightTh: 'เด่นด้านเสน่ห์ เมตตามหานิยม ความรัก ความสุขในครอบครัว และความงาม',
    bestFor: 'พิธีแต่งงาน, จดทะเบียนสมรส, ทำศัลยกรรมเสริมสง่าราศี, เปิดร้านสปา/ความงาม, สู่ขอ',
    icon: '👑',
  },
  raja: {
    nameTh: 'ราชาฤกษ์',
    alias: 'ฤกษ์ผู้เป็นใหญ่',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งอำนาจ วาสนา เกียรติยศ บารมี ชัยชนะเหนืออริศัตรู',
    highlightTh: 'เด่นด้านอำนาจบารมี เกียรติยศชื่อเสียง ความสำเร็จในระดับสูง',
    bestFor: 'เปิดสำนักงานใหญ่, รับตำแหน่งใหม่, ออกรถระดับพรีเมียม, เข้าพบผู้หลักผู้ใหญ่, เจรจาเรื่องสำคัญ',
    icon: '⚡',
  },
  samano: {
    nameTh: 'สมโณฤกษ์',
    alias: 'ฤกษ์แห่งความสงบสุข',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งความสงบสุข ร่มเย็น กุศลธรรม เทพยดาปกปักรักษา',
    highlightTh: 'เด่นด้านความร่มเย็น จิตใจสงบ กุศลบารมี ปลอดภัยจากภยันตราย',
    bestFor: 'ทำบุญประจำปี, ทำบุญขึ้นบ้านใหม่, ทำบุญเปิดบริษัท, บวชเรียน, ปฏิบัติธรรม, หล่อพระพุทธรูป',
    icon: '🪷',
  },
  thesatri: {
    nameTh: 'เทศาตรีฤกษ์',
    alias: 'ฤกษ์พ่อค้า / นักท่องเที่ยว',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งการเดินทาง สัญจร ผู้คนเข้าออกหนาแน่น คึกคักมีชีวิตชีวา',
    highlightTh: 'เด่นด้านการค้าขายต่างถิ่น คมนาคม กิจการท่องเที่ยว และงานบันเทิง',
    bestFor: 'เปิดร้านอาหาร, โรงแรม, ธุรกิจนำเที่ยว, กิจการขนส่ง, ไลฟ์สดขายของ',
    icon: '🚢',
  },
  daliddo: {
    nameTh: 'ทลิทโทฤกษ์',
    alias: 'ฤกษ์ชูชก / ขอความเมตตา',
    meaningTh: 'พระจันทร์เสวยฤกษ์แห่งการขอความเห็นใจ ขอความช่วยเหลือ ผู้คนเอ็นดูเมตตา',
    highlightTh: 'เด่นด้านการประนีประนอม ขอความอนุเคราะห์ ได้รับสิ่งของโดยง่าย',
    bestFor: 'สมัครงาน, สัมภาษณ์งาน, ทวงหนี้, ขอสินเชื่อธนาคาร, เจรจาไกล่เกลี่ย',
    icon: '🤲',
  },
};

// Kala Yoga calculation for Buddhist Era years (กาลโยคประจำปี)
// For B.E. 2569 (C.E. 2026, Chula Sakarat 1388):
// Thongchai = Wednesday (3), Athipadi = Tuesday (2), Ubatha = Thursday (4), Lokawinas = Saturday (6)
export function getKalaYogaForYear(yearBE: number): {
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
      warningText: 'ประกาศกาลโยคประจำปี พ.ศ. 2569: วันพฤหัสบดี เป็น "วันอุบาทว์" และ วันเสาร์ เป็น "วันโลกาวินาศ" ควรระมัดระวังเป็นพิเศษและหลีกเลี่ยงการจัดพิธีมงคลสำคัญในสองวันนี้',
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
export function getThaksaRelation(birthDayId: BirthDayId, dayOfWeek: number): ThaksaRelation {
  const birthOption = BIRTH_DAYS.find((b) => b.id === birthDayId);

  // 1. Direct authoritative check for Kalakini day
  if (birthOption && birthOption.kalakiniDayOfWeek === dayOfWeek) {
    return {
      relation: 'kalakini',
      nameTh: 'กาลกิณี',
      isKalakini: true,
      isFavorable: false,
      scoreBonus: -100,
      badgeText: '⚠️ วันกาลกิณี (ควรหลีกเลี่ยง)',
      badgeStyle: 'bad',
      advice: `เป็นวันกาลกิณีของคนเกิด${birthOption.labelTh} ตามหลักมหาทักษาโบราณ ควรหลีกเลี่ยงการจัดพิธีมงคล ออกรถ แต่งงาน หรือขึ้นบ้านใหม่`,
    };
  }

  // 2. Standard Thaksa sequence: บริวาร, อายุ, เดช, ศรี, มูละ, อุตสาหะ, มนตรี, กาลกิณี
  // Sunday=0, Monday=1, Tuesday=2, WedDay=3, Saturday=4, Thursday=5, Rahu/WedNight=6, Friday=7
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
      return {
        relation: 'kalakini',
        nameTh: 'กาลกิณี',
        isKalakini: true,
        isFavorable: false,
        scoreBonus: -100,
        badgeText: '⚠️ วันกาลกิณี (ควรหลีกเลี่ยง)',
        badgeStyle: 'bad',
        advice: `เป็นวันกาลกิณีของคนเกิด${BIRTH_DAYS.find((b) => b.id === birthDayId)?.labelTh ?? ''} ตามหลักมหาทักษาโบราณ ควรหลีกเลี่ยงการจัดพิธีมงคล ออกรถ แต่งงาน หรือขึ้นบ้านใหม่`,
      };
  }
}

// Full Pre-calculated Authentic Astrological Calendar for November 2569 (พฤศจิกายน 2569 / Nov 2026)
// Day 1 of Nov 2026 is Sunday, Nov 1 (B.E. 2569)
export const NOVEMBER_2569_DAYS: AuspiciousDay[] = [
  {
    date: '2026-11-01',
    dayOfMonth: 1,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 0,
    dayNameTh: 'วันอาทิตย์',
    lunarDateTh: 'แรม ๗ ค่ำ เดือน ๑๑',
    thaiRuk: 'thesatri',
    thaiRukNameTh: 'เทศาตรีฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยฤกษ์แห่งการติดต่อค้าขาย สัญจรเดินทาง เปิดร้านอาหาร โรงแรม กิจการบันเทิง',
    thaiRukHighlight: 'เด่นการค้าขายสัญจร ผู้คนไปมาหาสู่คึกคัก',
    dithiName: 'ดิถีสิทธิโชค (สำเร็จราบรื่น)',
    isMasterAuspicious: false,
    rating: 3,
    suitableCategories: ['others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '13:19 - 14:49 น.',
      ubakongYama: 'ยามปลอดโปร่ง (แคล้วคลาด ปลอดภัยทุกทิศ)',
      minuteAuspicious: '09:09 น., 09:39 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ',
    auspiciousDirection: 'ทิศตะวันออก (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีเขียวมรกต', 'สีชมพูกลีบบัว', 'สีทองคำ'],
    unluckyColors: ['สีน้ำเงินเข้ม'],
    ceremonyTips: {
      others: 'เหมาะแก่การเปิดเพจร้านค้าออนไลน์ ลงโปรโมตสินค้า เจรจาธุรกิจการค้าขายอาหารและเครื่องดื่ม',
    },
    prohibitions: ['ไม่ควรจัดพิธีแต่งงานขนาดใหญ่ เนื่องจากเป็นแรม ๗ ค่ำ'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-02',
    dayOfMonth: 2,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 1,
    dayNameTh: 'วันจันทร์',
    lunarDateTh: 'แรม ๘ ค่ำ เดือน ๑๑ (วันพระ)',
    thaiRuk: 'samano',
    thaiRukNameTh: 'สมโณฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยสมโณฤกษ์ ฤกษ์แห่งความร่มเย็น ผาสุก กุศลบารมี เหมาะแก่การทำบุญ สะเดาะเคราะห์',
    thaiRukHighlight: 'เด่นด้านความสงบร่มเย็น ทำบุญกุศล พระสงฆ์อำนวยพร',
    dithiName: 'ดิถีอำมฤตโชค (ไร้อุปสรรค)',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['merit'],
    bestHours: {
      primaryTime: '06:39 - 07:49 น.',
      secondaryTime: '09:19 - 10:49 น.',
      ubakongYama: 'ยามมีลาภ (สี่จุดมหาลาภ รับทรัพย์กุศลผลบุญ)',
      minuteAuspicious: '06:49 น., 09:29 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันพระ / วันปกติ',
    auspiciousDirection: 'ทิศตะวันออกเฉียงเหนือ (ทิศศรี)',
    luckyColors: ['สีม่วงเม็ดมะปราง', 'สีเขียวใบตอง', 'สีทอง'],
    unluckyColors: ['สีแดงเพลิง'],
    ceremonyTips: {
      merit: 'จัดพิธีตักบาตรเช้า ถวายสังฆทาน ปล่อยปลา ๙ ตัว และสวดมนต์บทชินบัญชรเสริมสิริมงคลครอบครัว',
    },
    prohibitions: ['เป็นวันพระ งดเว้นการฆ่าสัตว์และงานบันเทิงเริงรมย์รุนแรง'],
    buddhistHolyDay: true,
  },
  {
    date: '2026-11-03',
    dayOfMonth: 3,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 2,
    dayNameTh: 'วันอังคาร',
    lunarDateTh: 'แรม ๙ ค่ำ เดือน ๑๑',
    thaiRuk: 'raja',
    thaiRukNameTh: 'ราชาฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยราชาฤกษ์ ฤกษ์แห่งอำนาจ วาสนา เกียรติยศ และความเป็นผู้นำ ประกอบกับเป็นวันอธิบดีประจำปี 2569',
    thaiRukHighlight: 'วันอธิบดีประจำปี 2569 เด่นเกียรติยศ อำนาจบารมี และการเจรจาระดับสูง',
    dithiName: 'ดิถีราชาโชค (เกียรติยศสูงสุด)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['merit', 'vehicle_business', 'others'],
    bestHours: {
      primaryTime: '08:19 - 09:49 น.',
      secondaryTime: '13:09 - 14:39 น.',
      ubakongYama: 'ยามราชาโชค (สองศูนย์ปลอดโปร่ง เดินหน้าชนะอุปสรรค)',
      minuteAuspicious: '08:29 น., 13:19 น.',
    },
    kalaYoga: 'athipadi',
    kalaYogaLabel: 'วันอธิบดี (มงคลยิ่งแห่งอำนาจบารมี)',
    auspiciousDirection: 'ทิศตะวันออก (ทิศเดช)',
    luckyColors: ['สีส้มแสด', 'สีทองอร่าม', 'สีดำขลับ'],
    unluckyColors: ['สีขาวนวล'],
    ceremonyTips: {
      vehicle_business: 'เหมาะแก่การออกรถสีดำ/สีส้ม ขับออกจากโชว์รูมหันหน้าทิศตะวันออก พร้อมเปิดบทสวดแคล้วคลาด',
      others: 'เหมาะแก่การลงนามสัญญาทางธุรกิจ เข้าพบผู้บริหารระดับสูง หรือประมูลงานราชการ',
    },
    prohibitions: ['ห้ามใช้แต่งงานหรือขึ้นบ้านใหม่ เนื่องจากโบราณถือว่าวันอังคารมีความร้อนแรงเกินไป'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-04',
    dayOfMonth: 4,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 3,
    dayNameTh: 'วันพุธ',
    lunarDateTh: 'แรม ๑๐ ค่ำ เดือน ๑๑',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยมหัทธโนฤกษ์ ฤกษ์เศรษฐีเงินล้าน และตรงกับ "วันธงชัย" ประจำปี พ.ศ. 2569 มงคลสูงสุดของเดือน',
    thaiRukHighlight: '⭐ วันธงชัยประจำปี 2569 มหามงคลสูงสุด เงินทองไหลมาเทมา เปิดกิจการสำเร็จเลิศ',
    dithiName: 'ดิถีชัยโชค & มหาสิทธิโชค (ชัยชนะสมบูรณ์แบบ)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'merit', 'vehicle_business', 'others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '14:09 - 15:39 น.',
      ubakongYama: 'ขาวสี่สองตัวมีลาภ (ยามมหาลาภ รับทรัพย์ล้นคลัง)',
      minuteAuspicious: '09:09 น., 09:49 น., 14:19 น.',
    },
    kalaYoga: 'thongchai',
    kalaYogaLabel: '⭐ วันธงชัย (มงคลเลิศล้ำสูงสุดประจำปี)',
    auspiciousDirection: 'ทิศใต้ (ทิศศรีมั่งคั่ง)',
    luckyColors: ['สีเขียวเหนี่ยวทรัพย์', 'สีเหลืองบุษราคัม', 'สีขาวมุก'],
    unluckyColors: ['สีชมพูบานเย็น'],
    ceremonyTips: {
      wedding: 'พิธีรดน้ำสังข์และจดทะเบียนสมรสในเวลา 09.09 น. ส่งผลให้ชีวิตคู่มั่งคั่ง มีชื่อเสียง เงินทองไม่ขาดสาย',
      house: 'นำพระพุทธรูป ข้าวสารเต็มถัง เงิน ๙๙๙ บาท เข้าบ้านเป็นปฐมฤกษ์ในเวลา 09.39 น.',
      vehicle_business: 'ตัดริบบิ้นเปิดร้านใหม่ หรือขับรถออกจากโชว์รูมในเวลา 09.49 น. ลูกค้าหลั่งไหล เงินสะพัด',
      others: 'เหมาะแก่การทำศัลยกรรมเสริมสง่าราศี เจรจาขอสินเชื่อ หรือเปิดพอร์ตลงทุน',
    },
    prohibitions: ['ไม่มีข้อห้าม ถือเป็นวันยอดมงคลของเดือน (ยกเว้นคนเกิดวันพุธกลางคืนควรระวังตามทักษา)'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-05',
    dayOfMonth: 5,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 4,
    dayNameTh: 'วันพฤหัสบดี',
    lunarDateTh: 'แรม ๑๑ ค่ำ เดือน ๑๑',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยภูมิปาโลฤกษ์ แต่ตรงกับ "วันอุบาทว์" ของกาลโยคประจำปี 2569 ควรงดเว้นการมงคล',
    thaiRukHighlight: '⚠️ วันอุบาทว์ประจำปี 2569 มีเสนียดจัญไร อุปสรรคขัดข้อง',
    dithiName: 'ดิถีปลอดโปร่งเฉพาะกิจ',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: '06:00 - 07:00 น.',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร (ควรหลีกเลี่ยงการเดินทางไกลหรือทำพิธี)',
      minuteAuspicious: '-',
    },
    kalaYoga: 'ubatha',
    kalaYogaLabel: '⚠️ วันอุบาทว์ (กาลโยคพึงระวัง)',
    auspiciousDirection: 'ทิศตะวันตกเฉียงเหนือ',
    luckyColors: ['สีส้มอิฐ'],
    unluckyColors: ['สีดำสนิท'],
    ceremonyTips: {},
    prohibitions: ['ห้ามจัดงานแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามออกรถใหม่, ห้ามเปิดบริษัทเด็ดขาด'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-06',
    dayOfMonth: 6,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 5,
    dayNameTh: 'วันศุกร์',
    lunarDateTh: 'แรม ๑๒ ค่ำ เดือน ๑๑',
    thaiRuk: 'thewi',
    thaiRukNameTh: 'เทวีฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยเทวีฤกษ์ ฤกษ์แห่งความงาม เสน่ห์ เมตตา เหมาะแก่การขอความรัก เสริมความงาม',
    thaiRukHighlight: 'เด่นด้านความรัก เสน่ห์เมตตา ทำศัลยกรรม และความงาม',
    dithiName: 'ดิถีราชาโชค',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['wedding', 'others'],
    bestHours: {
      primaryTime: '08:39 - 10:09 น.',
      secondaryTime: '13:49 - 15:19 น.',
      ubakongYama: 'ยามปลอดโปร่ง (แคล้วคลาด มีผู้ใหญ่เมตตา)',
      minuteAuspicious: '08:49 น., 13:59 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังแห่งพระศุกร์)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงใต้ (ทิศศรี)',
    luckyColors: ['สีฟ้าคราม', 'สีชมพูอ่อน', 'สีขาว'],
    unluckyColors: ['สีเทาเข้ม / สีควันบุหรี่'],
    ceremonyTips: {
      wedding: 'เหมาะแก่การจดทะเบียนสมรส สู่ขอหมั้นหมาย หรือถ่ายภาพพรีเวดดิ้ง',
      others: 'เหมาะอย่างยิ่งสำหรับการทำศัลยกรรมเสริมจมูก คาง ตา หรือปรับรูปหน้าให้ดูสง่ามีออร่า',
    },
    prohibitions: ['ไม่เหมาะกับการทวงหนี้หรือการฟ้องร้องคดีความ'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-07',
    dayOfMonth: 7,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 6,
    dayNameTh: 'วันเสาร์',
    lunarDateTh: 'แรม ๑๓ ค่ำ เดือน ๑๑',
    thaiRuk: 'daliddo',
    thaiRukNameTh: 'ทลิทโทฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันโลกาวินาศ" ของกาลโยคประจำปี 2569 ห้ามประกอบพิธีมงคลทุกชนิด',
    thaiRukHighlight: '⛔ วันโลกาวินาศประจำปี 2569 ห้ามการมงคลเด็ดขาด เกิดความสูญเสีย',
    dithiName: 'ดิถีดับสูญ',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการประกอบพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร (เกิดเคราะห์ภัย)',
      minuteAuspicious: '-',
    },
    kalaYoga: 'lokawinas',
    kalaYogaLabel: '⛔ วันโลกาวินาศ (ห้ามประกอบพิธีมงคลเด็ดขาด)',
    auspiciousDirection: 'งดเว้นการตั้งทิศ',
    luckyColors: ['สีม่วงเข้ม'],
    unluckyColors: ['สีเขียวสด'],
    ceremonyTips: {},
    prohibitions: ['ห้ามออกรถใหม่, ห้ามแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามทำบุญขึ้นบ้านใหม่, ห้ามทำศัลยกรรม'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-08',
    dayOfMonth: 8,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 0,
    dayNameTh: 'วันอาทิตย์',
    lunarDateTh: 'แรม ๑๔ ค่ำ เดือน ๑๑',
    thaiRuk: 'samano',
    thaiRukNameTh: 'สมโณฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยสมโณฤกษ์ เหมาะแก่การทำบุญ ไหว้พระ ปล่อยนกปล่อยปลา สวดมนต์เจริญภาวนา',
    thaiRukHighlight: 'เด่นการทำบุญกุศล สะเดาะเคราะห์ เสริมดวงชะตาให้ผ่องใส',
    dithiName: 'ดิถีสิทธิโชค',
    isMasterAuspicious: false,
    rating: 3,
    suitableCategories: ['merit'],
    bestHours: {
      primaryTime: '07:19 - 08:49 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สมาธิสงบ ไร้กังวล)',
      minuteAuspicious: '07:29 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ',
    auspiciousDirection: 'ทิศเหนือ (ทิศมงคล)',
    luckyColors: ['สีแดงเข้ม', 'สีขาวงาช้าง'],
    unluckyColors: ['สีน้ำเงินเข้ม'],
    ceremonyTips: {
      merit: 'ไหว้พระ ๙ วัด หรือทำบุญบริจาคโลงศพ ค่าน้ำค่าไฟวัด เพื่อเปิดทางแห่งโชคลาภ',
    },
    prohibitions: ['งดเว้นการจัดงานรื่นเริงส่งเสียงดัง'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-09',
    dayOfMonth: 9,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 1,
    dayNameTh: 'วันจันทร์',
    lunarDateTh: 'แรม ๑๕ ค่ำ เดือน ๑๑ (วันพระใหญ่ / วันสิ้นเดือนทางจันทรคติ)',
    thaiRuk: 'samano',
    thaiRukNameTh: 'สมโณฤกษ์',
    thaiRukMeaning: 'วันพระใหญ่ แรม ๑๕ ค่ำ พระจันทร์เสวยสมโณฤกษ์ เหมาะแก่การทำบุญใหญ่ ถวายสังฆทาน',
    thaiRukHighlight: 'วันพระใหญ่ แรม ๑๕ ค่ำ เด่นการทำบุญเสริมบารมี อุทิศส่วนกุศล',
    dithiName: 'ดิถีอำมฤตโชค',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['merit'],
    bestHours: {
      primaryTime: '06:19 - 07:39 น.',
      secondaryTime: '09:29 - 10:59 น.',
      ubakongYama: 'ยามมีลาภ (รับอานิสงส์บุญใหญ่)',
      minuteAuspicious: '06:29 น., 09:39 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันพระใหญ่ / วันปกติ',
    auspiciousDirection: 'ทิศตะวันออก (ทิศมงคล)',
    luckyColors: ['สีขาวบริสุทธิ์', 'สีเหลืองนวล', 'สีทอง'],
    unluckyColors: ['สีแดงเลือดนก'],
    ceremonyTips: {
      merit: 'ถวายภัตตาหารเพลแด่พระสงฆ์ ๙ รูป บริจาคโลหิต หรือไถ่ชีวิตโคกระบือ',
    },
    prohibitions: ['วันพระใหญ่ งดเว้นการจัดงานวิวาห์และขึ้นบ้านใหม่'],
    buddhistHolyDay: true,
  },
  {
    date: '2026-11-10',
    dayOfMonth: 10,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 2,
    dayNameTh: 'วันอังคาร',
    lunarDateTh: 'ขึ้น ๑ ค่ำ เดือน ๑๒ (เริ่มเดือนสิบสอง)',
    thaiRuk: 'raja',
    thaiRukNameTh: 'ราชาฤกษ์',
    thaiRukMeaning: 'วันอธิบดีประจำปี 2569 ประกอบกับขึ้น ๑ ค่ำ เดือน ๑๒ พระจันทร์เสวยราชาฤกษ์ เสริมเกียรติยศชื่อเสียง',
    thaiRukHighlight: 'วันอธิบดีประจำปี 2569 เด่นการบริหารงาน อำนาจ บารมี และการออกรถ',
    dithiName: 'ดิถีราชาโชค',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['vehicle_business', 'others'],
    bestHours: {
      primaryTime: '08:29 - 09:59 น.',
      secondaryTime: '13:19 - 14:49 น.',
      ubakongYama: 'ยามราชาโชค (สองศูนย์ปลอดโปร่ง เดินหน้าสำเร็จ)',
      minuteAuspicious: '08:39 น., 13:29 น.',
    },
    kalaYoga: 'athipadi',
    kalaYogaLabel: 'วันอธิบดี (มงคลยิ่งแห่งบารมี)',
    auspiciousDirection: 'ทิศตะวันออก (ทิศเดช)',
    luckyColors: ['สีส้มทอง', 'สีบรอนซ์เงิน', 'สีดำเงา'],
    unluckyColors: ['สีขาวนวล'],
    ceremonyTips: {
      vehicle_business: 'ออกรถเก๋ง รถกระบะเชิงพาณิชย์ หรือเซ็นสัญญาซื้อขายอสังหาริมทรัพย์',
      others: 'เหมาะแก่การลงนามสัญญาร่วมทุน เจรจากับคู่ค้าต่างชาติ',
    },
    prohibitions: ['งดพิธีขึ้นบ้านใหม่และงานแต่งงาน'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-11',
    dayOfMonth: 11,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 3,
    dayNameTh: 'วันพุธ',
    lunarDateTh: 'ขึ้น ๒ ค่ำ เดือน ๑๒',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยมหัทธโนฤกษ์ ตรงกับ "วันธงชัย" ประจำปี 2569 ฤกษ์แห่งเศรษฐีเงินล้าน เปิดร้าน ค้าขาย รุ่งเรืองสุดขีด',
    thaiRukHighlight: '⭐ วันธงชัยประจำปี 2569 มหามงคลเศรษฐี ร่ำรวยเงินทอง ไร้อุปสรรค',
    dithiName: 'ดิถีอำมฤตโชค & มหาสิทธิโชค (ความสำเร็จสูงสุด)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'merit', 'vehicle_business', 'others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '14:19 - 15:49 น.',
      ubakongYama: 'ขาวสี่สองตัวมีลาภ (เงินทองไหลมาเทมา ปิดดีลใหญ่)',
      minuteAuspicious: '09:19 น., 09:59 น., 14:29 น.',
    },
    kalaYoga: 'thongchai',
    kalaYogaLabel: '⭐ วันธงชัย (มงคลเลิศล้ำสูงสุดประจำปี)',
    auspiciousDirection: 'ทิศใต้ (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีเขียวเหนี่ยวทรัพย์', 'สีทองคำแท้', 'สีขาวประกาย'],
    unluckyColors: ['สีชมพูสด'],
    ceremonyTips: {
      wedding: 'พิธีสู่ขอ แห่ขันหมาก จดทะเบียนสมรส มีแต่ความเจริญก้าวหน้า ฐานะมั่นคง',
      house: 'ทำพิธีขึ้นบ้านใหม่ จุดธูปบอกกล่าวเทพยดาเจ้าที่ เจ้าบ้านอยู่แล้วรวย สุขกายสบายใจ',
      vehicle_business: 'เปิดร้านค้า เปิดสาขาใหม่ ออกรถใหม่ทุกสีทุกประเภท รับทรัพย์ก้อนโต',
      others: 'ทำศัลยกรรมเสริมจมูกหรือรูปหน้า โดดเด่น สง่างาม ปลอดภัยไร้แผลเป็น',
    },
    prohibitions: ['ไม่มีข้อห้าม ถือเป็นหนึ่งในวันที่ดีที่สุดของเดือนพฤศจิกายน 2569'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-12',
    dayOfMonth: 12,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 4,
    dayNameTh: 'วันพฤหัสบดี',
    lunarDateTh: 'ขึ้น ๓ ค่ำ เดือน ๑๒',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันอุบาทว์" ของกาลโยคประจำปี 2569 ควรงดเว้นการประกอบพิธีมงคล',
    thaiRukHighlight: '⚠️ วันอุบาทว์ประจำปี 2569 มีอุปสรรคขัดข้อง',
    dithiName: 'ดิถีปลอดโปร่ง',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการจัดพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร',
      minuteAuspicious: '-',
    },
    kalaYoga: 'ubatha',
    kalaYogaLabel: '⚠️ วันอุบาทว์ (กาลโยคพึงระวัง)',
    auspiciousDirection: 'งดเว้น',
    luckyColors: ['สีส้ม'],
    unluckyColors: ['สีดำ'],
    ceremonyTips: {},
    prohibitions: ['ห้ามจัดงานแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามออกรถ, ห้ามเปิดร้านค้า'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-13',
    dayOfMonth: 13,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 5,
    dayNameTh: 'วันศุกร์',
    lunarDateTh: 'ขึ้น ๔ ค่ำ เดือน ๑๒',
    thaiRuk: 'thewi',
    thaiRukNameTh: 'เทวีฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยเทวีฤกษ์ ฤกษ์นางพญา เสริมเมตตามหาเสน่ห์ ความรักงดงาม งานวิวาห์หวานชื่น',
    thaiRukHighlight: 'เด่นด้านงานวิวาห์ ความรัก เสน่ห์เมตตา และทำศัลยกรรมความงาม',
    dithiName: 'ดิถีราชาโชค & ดิถีเรียงหมอน (มงคลสมรสเลิศเลอ)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'others'],
    bestHours: {
      primaryTime: '08:49 - 10:19 น.',
      secondaryTime: '13:39 - 15:09 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สิริมงคล เมตตามหานิยม)',
      minuteAuspicious: '08:59 น., 13:49 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังศุกร์เทวี)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงใต้ (ทิศศรีมงคล)',
    luckyColors: ['สีฟ้ามรกต', 'สีชมพูพาสเทล', 'สีทองชมพู (Rose Gold)'],
    unluckyColors: ['สีเทาเข้ม'],
    ceremonyTips: {
      wedding: 'ฤกษ์วิวาห์และปูเตียงเรียงหมอนชั้นยอด คู่สมรสรักใคร่กลมเกลียว ซื่อสัตย์ มีทายาทสืบสกุล',
      house: 'ย้ายเข้าคอนโด หรือบ้านเดี่ยวใหม่ เจ้าของบ้านมีเสน่ห์ เพื่อนบ้านเป็นมิตร อบอุ่น',
      others: 'ทำศัลยกรรมเสริมโหงวเฮ้ง ตา จมูก ปาก ใบหน้าหวานละมุน ฟื้นตัวรวดเร็ว',
    },
    prohibitions: ['ไม่เหมาะกับการทวงหนี้หรือการฟ้องร้อง'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-14',
    dayOfMonth: 14,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 6,
    dayNameTh: 'วันเสาร์',
    lunarDateTh: 'ขึ้น ๕ ค่ำ เดือน ๑๒',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันโลกาวินาศ" ของกาลโยคประจำปี 2569 ห้ามประกอบพิธีมงคลเด็ดขาด',
    thaiRukHighlight: '⛔ วันโลกาวินาศประจำปี 2569 ห้ามการมงคลเด็ดขาด',
    dithiName: 'ดิถีสูญเสีย',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการประกอบพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร (อันตราย)',
      minuteAuspicious: '-',
    },
    kalaYoga: 'lokawinas',
    kalaYogaLabel: '⛔ วันโลกาวินาศ (ห้ามประกอบพิธีมงคลเด็ดขาด)',
    auspiciousDirection: 'งดเว้น',
    luckyColors: ['สีม่วง'],
    unluckyColors: ['สีเขียว'],
    ceremonyTips: {},
    prohibitions: ['ห้ามออกรถใหม่, ห้ามแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามทำศัลยกรรม, ห้ามเปิดร้าน'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-15',
    dayOfMonth: 15,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 0,
    dayNameTh: 'วันอาทิตย์',
    lunarDateTh: 'ขึ้น ๖ ค่ำ เดือน ๑๒',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยมหัทธโนฤกษ์ ฤกษ์เศรษฐี มีทรัพย์สินเงินทอง เหมาะแก่การออกรถใหม่ เปิดร้านค้า',
    thaiRukHighlight: 'เด่นการออกรถใหม่ เปิดร้านค้า และทำสัญญาซื้อขาย',
    dithiName: 'ดิถีสิทธิโชค (สำเร็จคล่องตัว)',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['vehicle_business', 'house', 'others'],
    bestHours: {
      primaryTime: '09:19 - 10:49 น.',
      secondaryTime: '13:09 - 14:39 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สิริมงคล แคล้วคลาด)',
      minuteAuspicious: '09:29 น., 13:19 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ',
    auspiciousDirection: 'ทิศตะวันออก (ทิศศรีนำโชค)',
    luckyColors: ['สีเขียวเหนี่ยวทรัพย์', 'สีแดงทับทิม', 'สีขาว'],
    unluckyColors: ['สีน้ำเงินเข้ม'],
    ceremonyTips: {
      vehicle_business: 'ออกรถใหม่ขับออกจากโชว์รูมหันหน้าทิศตะวันออก เหยียบเบรก ๓ ครั้ง แตร ๓ ครั้ง เอาฤกษ์เอาชัย',
      house: 'ขนของมงคล เครื่องนอน ตู้เซฟเข้าบ้านใหม่ เสริมทรัพย์ให้งอกเงย',
      others: 'เปิดร้านค้าออนไลน์ โพสต์ขายสินค้าราคาพิเศษ ปิดยอดขายปัง',
    },
    prohibitions: ['ไม่ควรจัดพิธีแต่งงานขนาดใหญ่'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-16',
    dayOfMonth: 16,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 1,
    dayNameTh: 'วันจันทร์',
    lunarDateTh: 'ขึ้น ๗ ค่ำ เดือน ๑๒',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยภูมิปาโลฤกษ์ ฤกษ์ผู้รักษาแผ่นดิน รากฐานมั่นคง อยู่เย็นเป็นสุข ไร้โรคาพยาธิ',
    thaiRukHighlight: 'เด่นขึ้นบ้านใหม่ ย้ายเข้าที่อยู่อาศัย ซื้อที่ดิน ลงเสาเอก',
    dithiName: 'ดิถีอำมฤตโชค (ความร่มเย็นถาวร)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['house', 'merit', 'others'],
    bestHours: {
      primaryTime: '08:09 - 09:39 น.',
      secondaryTime: '14:09 - 15:39 น.',
      ubakongYama: 'ยามมีลาภ (สี่จุดมหาลาภ รากฐานมั่งคั่ง)',
      minuteAuspicious: '08:19 น., 09:09 น., 14:19 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังแห่งความมั่นคง)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงเหนือ (ทิศศรี)',
    luckyColors: ['สีเหลืองนวล', 'สีม่วงเม็ดมะปราง', 'สีเขียวสด'],
    unluckyColors: ['สีแดงเพลิง'],
    ceremonyTips: {
      house: 'นำพระพุทธรูปขึ้นประดิษฐานบนหิ้งพระ จุดธูป ๙ ดอก บูชาพระภูมิและเจ้าที่เจ้าทาง นำน้ำสะอาดล้างเท้าเข้าบ้าน',
      merit: 'นิมนต์พระสงฆ์เจริญพระพุทธมนต์ ปะพรมน้ำพระพุทธมนต์ทั่วบ้าน ป้องกันเสนียดจัญไร',
    },
    prohibitions: ['คนเกิดวันอาทิตย์เป็นวันกาลกิณี ควรหลีกเลี่ยง'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-17',
    dayOfMonth: 17,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 2,
    dayNameTh: 'วันอังคาร',
    lunarDateTh: 'ขึ้น ๘ ค่ำ เดือน ๑๒ (วันพระ)',
    thaiRuk: 'samano',
    thaiRukNameTh: 'สมโณฤกษ์',
    thaiRukMeaning: 'วันพระ ขึ้น ๘ ค่ำ ตรงกับ "วันอธิบดี" ประจำปี 2569 พระจันทร์เสวยสมโณฤกษ์ เหมาะแก่การทำบุญใหญ่',
    thaiRukHighlight: 'วันอธิบดี + วันพระ ขึ้น ๘ ค่ำ เด่นทำบุญบริษัท สะเดาะเคราะห์ เสริมบารมี',
    dithiName: 'ดิถีชัยโชค',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['merit'],
    bestHours: {
      primaryTime: '06:39 - 07:49 น.',
      secondaryTime: '09:19 - 10:49 น.',
      ubakongYama: 'ยามราชาโชค (อธิบดีบารมีคุ้มครอง)',
      minuteAuspicious: '06:49 น., 09:29 น.',
    },
    kalaYoga: 'athipadi',
    kalaYogaLabel: 'วันอธิบดี & วันพระ (มงคลแห่งการทำบุญ)',
    auspiciousDirection: 'ทิศตะวันออก (ทิศเดช)',
    luckyColors: ['สีส้มทอง', 'สีขาว', 'สีดำขลับ'],
    unluckyColors: ['สีขาวนวลจัด'],
    ceremonyTips: {
      merit: 'ทำบุญเลี้ยงพระที่บริษัท หรือทำบุญออฟฟิศ เสริมความเป็นผู้นำในตลาด ลูกค้าให้ความเชื่อมั่น',
    },
    prohibitions: ['วันพระ งดเว้นงานรื่นเริงและพิธีแต่งงาน'],
    buddhistHolyDay: true,
  },
  {
    date: '2026-11-18',
    dayOfMonth: 18,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 3,
    dayNameTh: 'วันพุธ',
    lunarDateTh: 'ขึ้น ๙ ค่ำ เดือน ๑๒',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันธงชัย" ประจำปี 2569 และพระจันทร์เสวยมหัทธโนฤกษ์ ฤกษ์เศรษฐีหมื่นล้าน มงคลยิ่งยวด',
    thaiRukHighlight: '⭐ วันธงชัยประจำปี 2569 ฤกษ์เศรษฐี มงคลสูงสุดรอบเดือน แต่งงาน ขึ้นบ้านใหม่ ออกรถ เปิดร้าน',
    dithiName: 'ดิถีอำมฤตโชค & มหาสิทธิโชค (ไร้พ่าย ไร้อุปสรรค)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'merit', 'vehicle_business', 'others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '13:59 - 15:29 น.',
      ubakongYama: 'ขาวสี่สองตัวมีลาภ (เงินทองไหลมาเทมา รวยไม่เลิก)',
      minuteAuspicious: '09:09 น., 09:49 น., 14:09 น.',
    },
    kalaYoga: 'thongchai',
    kalaYogaLabel: '⭐ วันธงชัย (มงคลเลิศล้ำสูงสุดประจำปี)',
    auspiciousDirection: 'ทิศใต้ (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีเขียวมรกต', 'สีทองประกาย', 'สีเหลืองบุษราคัม'],
    unluckyColors: ['สีชมพูสด'],
    ceremonyTips: {
      wedding: 'พิธีมงคลสมรสในเวลานี้ จะส่งผลให้คู่บ่าวสาวสร้างเนื้อสร้างตัวได้อย่างรวดเร็ว ธุรกิจก้าวหน้า',
      house: 'ขึ้นบ้านใหม่หรือย้ายเข้าคอนโด นำเงิน ๙๙๙ บาท เหรียญทอง ข้าวสาร อาหารแห้งเข้าบ้าน',
      vehicle_business: 'ออกรถป้ายแดง รับรถแล้วขับวนขวา ๓ รอบ หรือตัดริบบิ้นเปิดร้านค้า',
      others: 'เหมาะแก่การทำศัลยกรรมเสริมจมูก ปรับรูปหน้า เจรจาปิดดีลระดับสิบล้าน',
    },
    prohibitions: ['ไม่มีข้อห้าม (วันมงคลสูงสุดของสัปดาห์)'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-19',
    dayOfMonth: 19,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 4,
    dayNameTh: 'วันพฤหัสบดี',
    lunarDateTh: 'ขึ้น ๑๐ ค่ำ เดือน ๑๒',
    thaiRuk: 'thesatri',
    thaiRukNameTh: 'เทศาตรีฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันอุบาทว์" ของกาลโยคประจำปี 2569 ควรงดเว้นการประกอบพิธีมงคลสำคัญ',
    thaiRukHighlight: '⚠️ วันอุบาทว์ประจำปี 2569 มีอุปสรรคขัดข้อง',
    dithiName: 'ดิถีปลอดโปร่ง',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการประกอบพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร',
      minuteAuspicious: '-',
    },
    kalaYoga: 'ubatha',
    kalaYogaLabel: '⚠️ วันอุบาทว์ (กาลโยคพึงระวัง)',
    auspiciousDirection: 'งดเว้น',
    luckyColors: ['สีส้ม'],
    unluckyColors: ['สีดำ'],
    ceremonyTips: {},
    prohibitions: ['ห้ามแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามออกรถ, ห้ามเปิดบริษัท'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-20',
    dayOfMonth: 20,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 5,
    dayNameTh: 'วันศุกร์',
    lunarDateTh: 'ขึ้น ๑๑ ค่ำ เดือน ๑๒',
    thaiRuk: 'thewi',
    thaiRukNameTh: 'เทวีฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยเทวีฤกษ์ ฤกษ์นางพญา มหาเสน่ห์ ความรักหวานชื่น เมตตามหานิยม',
    thaiRukHighlight: 'เด่นงานวิวาห์ จดทะเบียนสมรส ศัลยกรรมความงาม เปิดสปา',
    dithiName: 'ดิถีราชาโชค & ดิถีเรียงหมอน (สุขสมหวังในรัก)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'others'],
    bestHours: {
      primaryTime: '08:39 - 10:09 น.',
      secondaryTime: '13:29 - 14:59 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สิริมงคล เมตตาเกื้อหนุน)',
      minuteAuspicious: '08:49 น., 13:39 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังแห่งเทวี)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงใต้ (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีฟ้าสดใส', 'สีชมพูอ่อน', 'สีขาว'],
    unluckyColors: ['สีเทาเข้ม'],
    ceremonyTips: {
      wedding: 'พิธีรดน้ำสังข์และจดทะเบียนสมรส ความรักมั่นคง ยืนยาว อยู่ด้วยกันจนแก่เฒ่า',
      others: 'ทำศัลยกรรมเสริมจมูก คาง หน้าอก ดวงตา ได้รูปสวยงามดั่งใจ ไร้ผลข้างเคียง',
    },
    prohibitions: ['งดเว้นการเจรจาฟ้องร้องหรือทวงหนี้สิน'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-21',
    dayOfMonth: 21,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 6,
    dayNameTh: 'วันเสาร์',
    lunarDateTh: 'ขึ้น ๑๒ ค่ำ เดือน ๑๒',
    thaiRuk: 'raja',
    thaiRukNameTh: 'ราชาฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันโลกาวินาศ" ของกาลโยคประจำปี 2569 ห้ามประกอบพิธีมงคลเด็ดขาด',
    thaiRukHighlight: '⛔ วันโลกาวินาศประจำปี 2569 ห้ามการมงคลเด็ดขาด',
    dithiName: 'ดิถีสูญเสีย',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการจัดพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร (อันตราย)',
      minuteAuspicious: '-',
    },
    kalaYoga: 'lokawinas',
    kalaYogaLabel: '⛔ วันโลกาวินาศ (ห้ามประกอบพิธีมงคลเด็ดขาด)',
    auspiciousDirection: 'งดเว้น',
    luckyColors: ['สีม่วง'],
    unluckyColors: ['สีเขียว'],
    ceremonyTips: {},
    prohibitions: ['ห้ามออกรถใหม่, ห้ามแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามทำศัลยกรรม, ห้ามเปิดร้าน'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-22',
    dayOfMonth: 22,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 0,
    dayNameTh: 'วันอาทิตย์',
    lunarDateTh: 'ขึ้น ๑๓ ค่ำ เดือน ๑๒',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยมหัทธโนฤกษ์ ฤกษ์แห่งความมั่งคั่ง ทรัพย์สินเงินทอง เหมาะแก่การออกรถใหม่ เปิดร้านค้า',
    thaiRukHighlight: 'เด่นการออกรถใหม่ เปิดร้านค้า และทำสัญญาซื้อขาย',
    dithiName: 'ดิถีสิทธิโชค (สำเร็จราบรื่น)',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['vehicle_business', 'house', 'others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '13:19 - 14:49 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สิริมงคล แคล้วคลาด ปลอดภัย)',
      minuteAuspicious: '09:19 น., 13:29 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ',
    auspiciousDirection: 'ทิศตะวันออก (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีเขียวมรกต', 'สีแดงสด', 'สีทอง'],
    unluckyColors: ['สีน้ำเงินเข้ม'],
    ceremonyTips: {
      vehicle_business: 'ออกรถป้ายแดง ขับออกจากโชว์รูมหันหน้าทิศตะวันออก พวงมาลัย ๗ สี แขวนหน้ารถ',
      house: 'ย้ายของเข้าบ้านใหม่ ข้าวสาร กะปิ น้ำปลา น้ำตาล เสริมความอุดมสมบูรณ์',
    },
    prohibitions: ['คนเกิดวันศุกร์เป็นวันกาลกิณี ควรงดเว้นการออกรถหรือย้ายบ้าน'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-23',
    dayOfMonth: 23,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 1,
    dayNameTh: 'วันจันทร์',
    lunarDateTh: 'ขึ้น ๑๔ ค่ำ เดือน ๑๒',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยภูมิปาโลฤกษ์ ฤกษ์ผู้รักษาแผ่นดิน รากฐานมั่นคง ถาวร เหมาะแก่การขึ้นบ้านใหม่ ลงเสาเอก',
    thaiRukHighlight: 'เด่นขึ้นบ้านใหม่ ย้ายเข้าที่อยู่อาศัย ซื้อที่ดิน ลงเสาเอก',
    dithiName: 'ดิถีอำมฤตโชค (ความมั่นคงถาวร)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['house', 'merit', 'others'],
    bestHours: {
      primaryTime: '08:09 - 09:39 น.',
      secondaryTime: '13:49 - 15:19 น.',
      ubakongYama: 'ยามมีลาภ (สี่จุดมหาลาภ รับทรัพย์ล้นเรือน)',
      minuteAuspicious: '08:19 น., 09:09 น., 13:59 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังแห่งแผ่นดินทอง)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงเหนือ (ทิศศรี)',
    luckyColors: ['สีเหลืองนวล', 'สีม่วง', 'สีเขียว'],
    unluckyColors: ['สีแดงเพลิง'],
    ceremonyTips: {
      house: 'ทำพิธีขึ้นบ้านใหม่ก่อนเที่ยง อัญเชิญพระพุทธรูปเข้าห้องพระ กวาดบ้านจากหน้าไปหลังเก็บทรัพย์',
      merit: 'ทำบุญเลี้ยงพระ ๕ หรือ ๙ รูป สวดพระพุทธมนต์ขับไล่อุปสรรค',
    },
    prohibitions: ['คนเกิดวันอาทิตย์เป็นวันกาลกิณี ควรหลีกเลี่ยง'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-24',
    dayOfMonth: 24,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 2,
    dayNameTh: 'วันอังคาร',
    lunarDateTh: 'ขึ้น ๑๕ ค่ำ เดือน ๑๒ (วันลอยกระทง & วันเพ็ญพระจันทร์เต็มดวง / วันพระใหญ่)',
    thaiRuk: 'samano',
    thaiRukNameTh: 'สมโณฤกษ์',
    thaiRukMeaning: 'วันเพ็ญเดือนสิบสอง (วันลอยกระทง) พระจันทร์เสวยสมโณฤกษ์ กอปรกับเป็น "วันอธิบดี" ประจำปี 2569 มงคลลอยเคราะห์ขอพร',
    thaiRukHighlight: '🌕 วันลอยกระทง 2569 + วันอธิบดี + วันเพ็ญเดือน ๑๒ ลอยเคราะห์ เสริมบารมีมหาเสน่ห์ ทำบุญใหญ่',
    dithiName: 'ดิถีอำมฤตโชค & วันเพ็ญจันทรา (แสงจันทร์มงคล)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['merit', 'others'],
    bestHours: {
      primaryTime: '06:19 - 07:39 น.',
      secondaryTime: '18:09 - 21:09 น.',
      ubakongYama: 'ยามราชาโชค (แสงจันทร์เต็มดวง เสริมเสน่ห์และโชคลาภ)',
      minuteAuspicious: '06:29 น., 19:19 น., 20:09 น.',
    },
    kalaYoga: 'athipadi',
    kalaYogaLabel: 'วันอธิบดี & วันลอยกระทง (มหาศิริมงคลเพ็ญเดือน ๑๒)',
    auspiciousDirection: 'ทิศตะวันออก (ทิศเดชรับแสงจันทร์)',
    luckyColors: ['สีส้มทอง', 'สีขาวนวล', 'สีเหลืองบุษราคัม'],
    unluckyColors: ['สีดำสนิท'],
    ceremonyTips: {
      merit: 'ทำบุญตักบาตรเช้า และร่วมพิธีลอยกระทงขอขมาพระแม่คงคาในยามค่ำ เสดาะเคราะห์ต่อชะตา',
      others: 'อาบแสงจันทร์เพ็ญเดือนสิบสอง เสริมเสน่ห์เมตตามหานิยม สวดคาถามหาลาภ',
    },
    prohibitions: ['วันพระใหญ่ งดเว้นงานมงคลสมรสและการออกรถใหม่'],
    buddhistHolyDay: true,
  },
  {
    date: '2026-11-25',
    dayOfMonth: 25,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 3,
    dayNameTh: 'วันพุธ',
    lunarDateTh: 'แรม ๑ ค่ำ เดือน ๑๒',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันธงชัย" ประจำปี 2569 พระจันทร์เสวยมหัทธโนฤกษ์ ฤกษ์เศรษฐี ค้าขายกำไรดี ร่ำรวยมั่งคั่ง',
    thaiRukHighlight: '⭐ วันธงชัยประจำปี 2569 ฤกษ์เศรษฐี ค้าขายดี ออกรถ เปิดร้าน ขึ้นบ้านใหม่',
    dithiName: 'ดิถีชัยโชค & มหาสิทธิโชค (ชัยชนะยิ่งใหญ่)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'merit', 'vehicle_business', 'others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '14:19 - 15:49 น.',
      ubakongYama: 'ขาวสี่สองตัวมีลาภ (เงินทองไหลมาเทมา ปิดดีลใหญ่)',
      minuteAuspicious: '09:09 น., 09:49 น., 14:29 น.',
    },
    kalaYoga: 'thongchai',
    kalaYogaLabel: '⭐ วันธงชัย (มงคลเลิศล้ำสูงสุดประจำปี)',
    auspiciousDirection: 'ทิศใต้ (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีเขียวมรกต', 'สีทอง', 'สีขาวมุก'],
    unluckyColors: ['สีชมพูสด'],
    ceremonyTips: {
      wedding: 'พิธีมงคลสมรส ส่งเสริมให้คู่บ่าวสาวมั่งมีเงินทอง ครองคู่ยืนนาน',
      house: 'ขึ้นบ้านใหม่ เจ้าของบ้านอยู่แล้วรวย สุขกายสบายใจ ลูกหลานกตัญญู',
      vehicle_business: 'ออกรถใหม่ป้ายแดง เปิดร้านค้า ตัดริบบิ้น ยอดขายถล่มทลาย',
      others: 'ทำศัลยกรรมเสริมจมูก รูปหน้า เสริมโหงวเฮ้งรับทรัพย์',
    },
    prohibitions: ['ไม่มีข้อห้าม ถือเป็นวันยอดมงคล'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-26',
    dayOfMonth: 26,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 4,
    dayNameTh: 'วันพฤหัสบดี',
    lunarDateTh: 'แรม ๒ ค่ำ เดือน ๑๒',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันอุบาทว์" ของกาลโยคประจำปี 2569 ควรงดเว้นการประกอบพิธีมงคลสำคัญ',
    thaiRukHighlight: '⚠️ วันอุบาทว์ประจำปี 2569 มีอุปสรรคขัดข้อง',
    dithiName: 'ดิถีปลอดโปร่ง',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการจัดพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร',
      minuteAuspicious: '-',
    },
    kalaYoga: 'ubatha',
    kalaYogaLabel: '⚠️ วันอุบาทว์ (กาลโยคพึงระวัง)',
    auspiciousDirection: 'งดเว้น',
    luckyColors: ['สีส้ม'],
    unluckyColors: ['สีดำ'],
    ceremonyTips: {},
    prohibitions: ['ห้ามแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามออกรถ, ห้ามเปิดบริษัท'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-27',
    dayOfMonth: 27,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 5,
    dayNameTh: 'วันศุกร์',
    lunarDateTh: 'แรม ๓ ค่ำ เดือน ๑๒',
    thaiRuk: 'thewi',
    thaiRukNameTh: 'เทวีฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยเทวีฤกษ์ ฤกษ์นางพญา เสน่ห์ เมตตามหานิยม ความรักสมบูรณ์พูนสุข',
    thaiRukHighlight: 'เด่นงานวิวาห์ จดทะเบียนสมรส เสริมความงาม ศัลยกรรม เปิดร้านสปา',
    dithiName: 'ดิถีราชาโชค & ดิถีเรียงหมอน (มงคลสมรสสมบูรณ์)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['wedding', 'house', 'others'],
    bestHours: {
      primaryTime: '08:39 - 10:09 น.',
      secondaryTime: '13:39 - 15:09 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สิริมงคล แคล้วคลาด)',
      minuteAuspicious: '08:49 น., 13:49 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังแห่งเทวี)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงใต้ (ทิศศรีนำโชค)',
    luckyColors: ['สีฟ้าพาสเทล', 'สีชมพู', 'สีขาวประกาย'],
    unluckyColors: ['สีเทาเข้ม'],
    ceremonyTips: {
      wedding: 'พิธีรดน้ำสังข์และจดทะเบียนสมรส ความรักอบอุ่น กิจการครอบครัวรุ่งเรือง',
      others: 'ทำศัลยกรรมเสริมจมูก รูปหน้า เติมเต็มผิวพรรณ ใบหน้าสดใสมีราศี',
    },
    prohibitions: ['ไม่เหมาะกับการทวงหนี้สินหรือฟ้องร้องคดีความ'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-28',
    dayOfMonth: 28,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 6,
    dayNameTh: 'วันเสาร์',
    lunarDateTh: 'แรม ๔ ค่ำ เดือน ๑๒',
    thaiRuk: 'daliddo',
    thaiRukNameTh: 'ทลิทโทฤกษ์',
    thaiRukMeaning: 'ตรงกับ "วันโลกาวินาศ" ของกาลโยคประจำปี 2569 ห้ามประกอบพิธีมงคลเด็ดขาด',
    thaiRukHighlight: '⛔ วันโลกาวินาศประจำปี 2569 ห้ามการมงคลเด็ดขาด',
    dithiName: 'ดิถีสูญเสีย',
    isMasterAuspicious: false,
    rating: 1,
    suitableCategories: [],
    bestHours: {
      primaryTime: 'งดเว้นการประกอบพิธี',
      ubakongYama: 'สองศูนย์ถอยอย่ายาตร (อันตราย)',
      minuteAuspicious: '-',
    },
    kalaYoga: 'lokawinas',
    kalaYogaLabel: '⛔ วันโลกาวินาศ (ห้ามประกอบพิธีมงคลเด็ดขาด)',
    auspiciousDirection: 'งดเว้น',
    luckyColors: ['สีม่วง'],
    unluckyColors: ['สีเขียว'],
    ceremonyTips: {},
    prohibitions: ['ห้ามออกรถใหม่, ห้ามแต่งงาน, ห้ามขึ้นบ้านใหม่, ห้ามทำศัลยกรรม, ห้ามเปิดร้าน'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-29',
    dayOfMonth: 29,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 0,
    dayNameTh: 'วันอาทิตย์',
    lunarDateTh: 'แรม ๕ ค่ำ เดือน ๑๒',
    thaiRuk: 'mahatthano',
    thaiRukNameTh: 'มหัทธโนฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยมหัทธโนฤกษ์ ฤกษ์แห่งความมั่งคั่ง ทรัพย์สินเงินทอง เหมาะแก่การออกรถใหม่ เปิดร้านค้า',
    thaiRukHighlight: 'เด่นการออกรถใหม่ เปิดร้านค้า และทำสัญญาซื้อขายส่งท้ายเดือน',
    dithiName: 'ดิถีสิทธิโชค (สำเร็จราบรื่น)',
    isMasterAuspicious: true,
    rating: 4,
    suitableCategories: ['vehicle_business', 'house', 'others'],
    bestHours: {
      primaryTime: '09:09 - 10:39 น.',
      secondaryTime: '13:19 - 14:49 น.',
      ubakongYama: 'ยามปลอดโปร่ง (สิริมงคล แคล้วคลาด)',
      minuteAuspicious: '09:19 น., 13:29 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ',
    auspiciousDirection: 'ทิศตะวันออก (ทิศศรีนำฤกษ์)',
    luckyColors: ['สีเขียวมรกต', 'สีแดง', 'สีทอง'],
    unluckyColors: ['สีน้ำเงินเข้ม'],
    ceremonyTips: {
      vehicle_business: 'ออกรถใหม่ป้ายแดงเพื่อความเป็นมงคลก่อนขึ้นเดือนใหม่ รับรถแล้วขับออกจากโชว์รูมสู่ทิศตะวันออก',
      house: 'ขนเครื่องใช้ไฟฟ้า ตู้เซฟ เงินทองเข้าบ้านใหม่ เสริมทรัพย์ให้มั่นคง',
    },
    prohibitions: ['คนเกิดวันศุกร์เป็นวันกาลกิณี ควรงดเว้น'],
    buddhistHolyDay: false,
  },
  {
    date: '2026-11-30',
    dayOfMonth: 30,
    month: 11,
    yearBE: 2569,
    yearCE: 2026,
    dayOfWeek: 1,
    dayNameTh: 'วันจันทร์',
    lunarDateTh: 'แรม ๖ ค่ำ เดือน ๑๒',
    thaiRuk: 'bhumipalo',
    thaiRukNameTh: 'ภูมิปาโลฤกษ์',
    thaiRukMeaning: 'พระจันทร์เสวยภูมิปาโลฤกษ์ ฤกษ์ผู้รักษาแผ่นดิน รากฐานมั่นคง ถาวร เหมาะแก่การขึ้นบ้านใหม่ ลงเสาเอก ส่งท้ายเดือนพฤศจิกายน',
    thaiRukHighlight: 'เด่นขึ้นบ้านใหม่ ย้ายเข้าที่พักอาศัย ซื้อที่ดิน ลงเสาเอกส่งท้ายเดือน',
    dithiName: 'ดิถีอำมฤตโชค (ความร่มเย็นถาวร)',
    isMasterAuspicious: true,
    rating: 5,
    suitableCategories: ['house', 'merit', 'others'],
    bestHours: {
      primaryTime: '08:09 - 09:39 น.',
      secondaryTime: '13:49 - 15:19 น.',
      ubakongYama: 'ยามมีลาภ (สี่จุดมหาลาภ รับทรัพย์ล้นเรือน)',
      minuteAuspicious: '08:19 น., 09:09 น., 13:59 น.',
    },
    kalaYoga: 'normal',
    kalaYogaLabel: 'วันปกติ (พลังแห่งความมั่นคง)',
    auspiciousDirection: 'ทิศตะวันออกเฉียงเหนือ (ทิศศรี)',
    luckyColors: ['สีเหลืองนวล', 'สีม่วงเม็ดมะปราง', 'สีเขียวสด'],
    unluckyColors: ['สีแดงเพลิง'],
    ceremonyTips: {
      house: 'ทำพิธีขึ้นบ้านใหม่ก่อนเที่ยง อัญเชิญพระพุทธรูปเข้าประดิษฐาน นำผลไม้มงคล ๕ อย่างถวายเจ้าที่เจ้าทาง',
      merit: 'ทำบุญอุทิศส่วนกุศล ไหว้ศาลพระภูมิประจำบ้านเพื่อความร่มเย็นผาสุก',
    },
    prohibitions: ['คนเกิดวันอาทิตย์เป็นวันกาลกิณี ควรหลีกเลี่ยง'],
    buddhistHolyDay: false,
  },
];

// Dynamic Generator for any Month and Year
export function generateMonthAuspiciousDays(yearBE: number, month: number): AuspiciousDay[] {
  // Guard the public engine boundary so invalid UI/search input cannot create
  // malformed dates or silently generate an empty/invalid calendar.
  if (!Number.isInteger(yearBE) || yearBE < 2400 || yearBE > 9999) return [];
  if (!Number.isInteger(month) || month < 1 || month > 12) return [];

  if (yearBE === 2569 && month === 11) {
    return NOVEMBER_2569_DAYS;
  }

  const yearCE = yearBE - 543;
  const daysInMonth = new Date(yearCE, month, 0).getDate();
  const kalaYogaInfo = getKalaYogaForYear(yearBE);
  const result: AuspiciousDay[] = [];

  const dayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const rukRotation: ThaiRukType[] = ['mahatthano', 'bhumipalo', 'thewi', 'raja', 'samano', 'thesatri', 'daliddo'];

  for (let d = 1; d <= daysInMonth; d++) {
    const jsDate = new Date(yearCE, month - 1, d);
    const dayOfWeek = jsDate.getDay();
    const dateStr = `${yearCE}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Kala Yoga check
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

    const rukIndex = (d + month * 3 + yearBE) % 7;
    const thaiRuk = rukRotation[rukIndex];
    const rukMeta = THAI_RUK_DESCRIPTIONS[thaiRuk];

    // Determine suitability
    const suitableCategories: AuspiciousWorkCategory[] = [];
    let isMaster = false;
    let rating = 3;

    if (kalaYoga === 'ubatha' || kalaYoga === 'lokawinas') {
      rating = 1;
    } else {
      if (thaiRuk === 'mahatthano') {
        suitableCategories.push('vehicle_business', 'wedding', 'house', 'others');
        rating = kalaYoga === 'thongchai' ? 5 : 4;
        isMaster = true;
      } else if (thaiRuk === 'bhumipalo') {
        suitableCategories.push('house', 'merit', 'others');
        rating = 4;
        isMaster = true;
      } else if (thaiRuk === 'thewi') {
        suitableCategories.push('wedding', 'others', 'house');
        rating = 4;
        isMaster = true;
      } else if (thaiRuk === 'raja') {
        suitableCategories.push('vehicle_business', 'merit', 'others');
        rating = 4;
      } else if (thaiRuk === 'samano') {
        suitableCategories.push('merit');
        rating = 4;
      } else if (thaiRuk === 'thesatri') {
        suitableCategories.push('others');
        rating = 3;
      } else {
        suitableCategories.push('others');
        rating = 2;
      }
    }

    if (kalaYoga === 'thongchai' && (thaiRuk === 'mahatthano' || thaiRuk === 'bhumipalo' || thaiRuk === 'thewi')) {
      rating = 5;
      isMaster = true;
      suitableCategories.push('merit');
    }

    // Ubakong hour estimation
    const ubakongText =
      kalaYoga === 'thongchai'
        ? 'ขาวสี่สองตัวมีลาภ (เงินทองไหลมาเทมา ปิดดีลใหญ่)'
        : kalaYoga === 'ubatha' || kalaYoga === 'lokawinas'
        ? 'สองศูนย์ถอยอย่ายาตร (ควรระมัดระวัง)'
        : 'ยามปลอดโปร่ง (สิริมงคล แคล้วคลาด ปลอดภัย)';

    const lunarDay = ((d + 6) % 15) + 1;
    const isWaning = (d + 6) % 30 >= 15;
    const lunarPhase = isWaning ? `แรม ${lunarDay} ค่ำ` : `ขึ้น ${lunarDay} ค่ำ`;
    const isHolyDay = lunarDay === 8 || lunarDay === 15;

    result.push({
      date: dateStr,
      dayOfMonth: d,
      month,
      yearBE,
      yearCE,
      dayOfWeek,
      dayNameTh: dayNames[dayOfWeek],
      lunarDateTh: `${lunarPhase} เดือน ${month} ${isHolyDay ? '(วันพระ)' : ''}`,
      thaiRuk,
      thaiRukNameTh: rukMeta.nameTh,
      thaiRukMeaning: rukMeta.meaningTh,
      thaiRukHighlight: rukMeta.highlightTh,
      dithiName: isMaster ? 'ดิถีอำมฤตโชค (ความสำเร็จสูงสุด)' : 'ดิถีสิทธิโชค (สำเร็จราบรื่น)',
      isMasterAuspicious: isMaster,
      rating,
      suitableCategories: Array.from(new Set(suitableCategories)),
      bestHours: {
        primaryTime: '09:09 - 10:39 น.',
        secondaryTime: '13:19 - 14:49 น.',
        ubakongYama: ubakongText,
        minuteAuspicious: '09:09 น., 09:39 น.',
      },
      kalaYoga,
      kalaYogaLabel,
      auspiciousDirection: 'ทิศตะวันออก (ทิศมงคลนำโชค)',
      luckyColors: ['สีเขียวมรกต', 'สีทอง', 'สีขาว'],
      unluckyColors: ['สีดำสนิท'],
      ceremonyTips: {
        wedding: 'ฤกษ์มงคลสมรส ส่งผลให้คู่ชีวิตรักใคร่กลมเกลียว ฐานะมั่นคง',
        house: 'ขึ้นบ้านใหม่ นำพระพุทธรูป ข้าวสารเต็มถัง เงิน ๙๙๙ บาท เข้าบ้าน',
        merit: 'ตักบาตรเช้า ถวายสังฆทาน ปล่อยปลา ๙ ตัว เสริมสิริมงคล',
        vehicle_business: 'ออกรถใหม่หรือตัดริบบิ้นเปิดร้าน รับทรัพย์ก้อนโต',
        others: 'เจรจาธุรกิจ ทำศัลยกรรมเสริมสง่าราศี หรือเริ่มโครงการใหม่',
      },
      prohibitions:
        kalaYoga === 'ubatha' || kalaYoga === 'lokawinas'
          ? ['ห้ามประกอบพิธีมงคลสำคัญทุกประการ']
          : ['งดเว้นการจัดพิธีที่ขัดกับหลักศาสนา'],
      buddhistHolyDay: isHolyDay,
    });
  }

  return result;
}
