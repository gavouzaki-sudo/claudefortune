// Smart Contextual Theme Engine
// Intelligently matches themes based on calendar date, festivals, and user geography/timezone without annoying permission popups.

export interface ThemeInfo {
  id: string;
  name: string;
  nameEn: string;
  category: 'festival' | 'cultural' | 'core';
  description: string;
  palette: string[]; // [primary, accent, background]
}

export const ALL_THEMES: ThemeInfo[] = [
  // 1. Core Sanctuary Theme
  {
    id: 'shrine',
    name: 'ศาลเจ้ามงคลดั้งเดิม',
    nameEn: 'Sacred Lacquer Shrine',
    category: 'core',
    description: 'สีชาดและทองคำแท้ มนต์ขลังแห่งศาลเจ้าศักดิ์สิทธิ์',
    palette: ['#b3261e', '#e8b94a', '#120a08'],
  },
  // 2. Festival Themes
  {
    id: 'xmas',
    name: 'เทศกาลคริสต์มาส',
    nameEn: 'Christmas & Winter Holiday',
    category: 'festival',
    description: 'ต้นสนเอเวอร์กรีน ผลฮอลลี่เบอร์รี่ และดาวเบธเลเฮมสีทองอร่าม',
    palette: ['#c92a2a', '#ffd700', '#051a0e'],
  },
  {
    id: 'songkran',
    name: 'เทศกาลสงกรานต์',
    nameEn: 'Songkran Water Festival',
    category: 'festival',
    description: 'สายน้ำเย็นชุ่มฉ่ำ สาดประกายแสงตะวันสีฟ้าครามและทอง',
    palette: ['#1a9fc9', '#ffd966', '#04202a'],
  },
  {
    id: 'halloween',
    name: 'เทศกาลฮาโลวีน',
    nameEn: 'Halloween & Samhain',
    category: 'festival',
    description: 'รัตติกาลลึกลับ ตะเกียงฟักทองสีส้มเพลิง และมนต์ม่วงเข้ม',
    palette: ['#7a2bd1', '#ff8a1f', '#0b0612'],
  },
  {
    id: 'loy',
    name: 'เทศกาลลอยกระทง',
    nameEn: 'Loy Krathong Festival',
    category: 'festival',
    description: 'แสงเทียนกระทงลอยบนสายน้ำยามราตรี สะท้อนแสงจันทร์เพ็ญ',
    palette: ['#e0602d', '#ffcf70', '#061220'],
  },
  {
    id: 'cny',
    name: 'เทศกาลตรุษจีน',
    nameEn: 'Chinese Lunar New Year',
    category: 'festival',
    description: 'สีแดงมงคลจักรพรรดิ โคมไฟทองคำ และพลังหยินหยางแห่งความมั่งคั่ง',
    palette: ['#d62020', '#ffd24a', '#260404'],
  },
  {
    id: 'newyear',
    name: 'เทศกาลปีใหม่สากล',
    nameEn: 'Global New Year',
    category: 'festival',
    description: 'ท้องฟ้าราตรีกึ่งศตวรรษ ประกายพลุสีครามและแสงดาวระยิบระยับ',
    palette: ['#7e6bff', '#f1d27a', '#090c1d'],
  },
  // 3. Cultural & Regional Themes
  {
    id: 'thai',
    name: 'อารยธรรมไทยโบราณ',
    nameEn: 'Siam Royal Temple',
    category: 'cultural',
    description: 'สีม่วงครามราชสำนัก ลายรดน้ำทองคำ และดอกบัวบวงสรวง',
    palette: ['#9c27b0', '#e8b94a', '#14081c'],
  },
  {
    id: 'vedic',
    name: 'อารยธรรมเวทมนตร์อินเดีย',
    nameEn: 'Vedic Saffron & Gold',
    category: 'cultural',
    description: 'สีส้มหญ้าฝรั่น ดอกดาวเรืองบูชาไฟ และไม้จันทน์หอม',
    palette: ['#e65100', '#ffb347', '#1f0d04'],
  },
  {
    id: 'egyptian',
    name: 'อารยธรรมไอยคุปต์อียิปต์',
    nameEn: 'Egyptian Lapis & Sun Gold',
    category: 'cultural',
    description: 'หินลาพิสลาซูลีสีน้ำเงินเข้มและทองคำแท้แห่งฟาโรห์สุริยเทพ',
    palette: ['#1565c0', '#f5c542', '#081224'],
  },
  {
    id: 'islamic',
    name: 'อารยธรรมอิสลามิคดวงดาว',
    nameEn: 'Islamic Celestial Emerald',
    category: 'cultural',
    description: 'มรกตสีเขียวเข้ม เสี้ยวจันทร์ทองคำ และลวดลายเรขาคณิตศักดิ์สิทธิ์',
    palette: ['#1b8a5a', '#d4af37', '#041a13'],
  },
  {
    id: 'western',
    name: 'อารยธรรมสากลจักรราศี',
    nameEn: 'Western Celestial Starlight',
    category: 'cultural',
    description: 'ห้วงอวกาศน้ำเงินลึก แสงดาวสีเงินและกลุ่มดาวจักรราศีสากล',
    palette: ['#3f51b5', '#e0d070', '#0a0d1f'],
  },
  {
    id: 'aztec_mayan',
    name: 'อารยธรรมแอซเท็ก-มายา',
    nameEn: 'Mesoamerican Sun Stone',
    category: 'cultural',
    description: 'ศิลาสุริยันสีดินเผา แอมเบอร์ และมนต์แห่งพีระมิดโบราณ',
    palette: ['#c0392b', '#e68c32', '#1a0f07'],
  },
  {
    id: 'native_american',
    name: 'อารยธรรมชนเผ่าพื้นเมือง',
    nameEn: 'Indigenous Turquoise & Earth',
    category: 'cultural',
    description: 'หินเทอร์ควอยซ์สีฟ้าเขียว ดินผาสีแดง และจิตวิญญาณแห่งสายลม',
    palette: ['#2a9d8f', '#d49a6a', '#151010'],
  },
  // 4. New Elemental & Seasonal Themes
  {
    id: 'valentine',
    name: 'เทศกาลแห่งความรัก',
    nameEn: 'Valentine & Sacred Love',
    category: 'festival',
    description: 'สระบัวสีชมพู กุหลาบแดง และประกายแสงสีทองอบอุ่นแห่งรักแท้',
    palette: ['#e91e63', '#ff80ab', '#180714'],
  },
  {
    id: 'midautumn',
    name: 'เทศกาลไหว้พระจันทร์',
    nameEn: 'Mid-Autumn Moon Harvest',
    category: 'festival',
    description: 'แสงจันทร์เพ็ญสีเหลืองนวล ครามราตรี และโคมไฟมงคล',
    palette: ['#ffd54f', '#ffb300', '#0a1026'],
  },
  {
    id: 'frost',
    name: 'เหมันต์หิมะบริสุทธิ์',
    nameEn: 'Sacred Frost & Crystal',
    category: 'core',
    description: 'ขาวประกายหิมะ ฟ้าไอซ์บลู และคริสตัลน้ำแข็งแห่งความสงบ',
    palette: ['#80d8ff', '#e0f7fa', '#04101a'],
  },
  {
    id: 'forest',
    name: 'พนาลัยพฤกษาศักดิ์สิทธิ์',
    nameEn: 'Sacred Emerald Grove',
    category: 'cultural',
    description: 'เขียวมรกตไพร ทองคำแสงตะวันลอดใบไม้ และจิตวิญญาณแห่งผืนป่า',
    palette: ['#2e7d32', '#aed581', '#061a0b'],
  },
];

export function detectSmartTheme(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // 1. Calendar Festival Check (Precise dates for world celebrations)
  // Christmas & Noel season: Dec 15 to Dec 27
  if (month === 12 && day >= 15 && day <= 27) {
    return 'xmas';
  }
  // New Year Eve & Early January: Dec 28 to Jan 5
  if ((month === 12 && day >= 28) || (month === 1 && day <= 5)) {
    return 'newyear';
  }
  // Frost / Winter Solstice & Cold Season: Jan 6 to Jan 19
  if (month === 1 && day >= 6 && day <= 19) {
    return 'frost';
  }
  // Valentine season: Feb 10 to Feb 18
  if (month === 2 && day >= 10 && day <= 18) {
    return 'valentine';
  }
  // Lunar New Year / Chinese New Year season: Jan 20 to Feb 20 (when not Valentine)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 20)) {
    return 'cny';
  }
  // Songkran Thai Water Festival: Apr 10 to Apr 18
  if (month === 4 && day >= 10 && day <= 18) {
    return 'songkran';
  }
  // Mid-Autumn Moon Festival: Sep 15 to Oct 5
  if ((month === 9 && day >= 15) || (month === 10 && day <= 5)) {
    return 'midautumn';
  }
  // Halloween / Samhain season: Oct 25 to Nov 2
  if ((month === 10 && day >= 25) || (month === 11 && day <= 2)) {
    return 'halloween';
  }
  // Loy Krathong season: Nov 5 to Nov 25
  if (month === 11 && day >= 5 && day <= 25) {
    return 'loy';
  }

  // 2. User Geographic & Cultural Context (via Timezone & Locale without permission prompts)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (typeof navigator !== 'undefined' ? navigator.language : '') || '';

    if (tz.includes('Bangkok') || lang.startsWith('th')) {
      return 'thai';
    }
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || lang.startsWith('hi')) {
      return 'vedic';
    }
    if (tz.includes('Cairo') || tz.includes('Egypt')) {
      return 'egyptian';
    }
    if (
      tz.includes('Dubai') ||
      tz.includes('Riyadh') ||
      tz.includes('Baghdad') ||
      tz.includes('Tehran') ||
      tz.includes('Istanbul') ||
      lang.startsWith('ar')
    ) {
      return 'islamic';
    }
    if (
      tz.includes('Mexico') ||
      tz.includes('Cancun') ||
      tz.includes('Bogota') ||
      tz.includes('Lima') ||
      tz.includes('Guatemala')
    ) {
      return 'aztec_mayan';
    }
    if (
      tz.includes('Denver') ||
      tz.includes('Phoenix') ||
      tz.includes('Anchorage') ||
      tz.includes('Edmonton')
    ) {
      return 'native_american';
    }
    if (tz.includes('Europe') || tz.includes('London') || tz.includes('Paris') || tz.includes('Rome')) {
      return 'western';
    }
    if (tz.includes('Shanghai') || tz.includes('Taipei') || tz.includes('Hong_Kong') || lang.startsWith('zh')) {
      return 'cny';
    }
  } catch {
    // Ignore detection error
  }

  // 3. Auspicious shrine theme default
  return 'shrine';
}
