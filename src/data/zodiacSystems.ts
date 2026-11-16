export interface ZodiacItem {
  id: number; // 0..11 mapping for Wasm compatibility
  name: string; // ชื่อสัญลักษณ์
  origName?: string; // ชื่อภาษาดั้งเดิม
  symbol: string; // อีโมจิ หรือ สัญลักษณ์
  element: string; // ธาตุลี้ลับ
  aura: string; // สีออร่ามงคล
  attribute: string; // พลังเหนือธรรมชาติ / พรศักดิ์สิทธิ์
}

export interface ZodiacSystem {
  id: string;
  name: string;
  region: string;
  mythos: string; // คำอธิบายความเชื่อเหนือธรรมชาติ
  icon: string;
  items: ZodiacItem[];
  // How to calculate symbol from year:
  // Most 12-year cycles use (year - 4) % 12 or (year - 3) % 12 for CE
  calculateFromYear: (year: number) => number;
}

// 1. Chinese Zodiac
const CHINESE_ITEMS: ZodiacItem[] = [
  { id: 0, name: "ชวด (หนู)", origName: "子 (Zǐ)", symbol: "🐀", element: "ธาตุน้ำหยิน", aura: "สีดำ/น้ำเงินเข้ม", attribute: "สติปัญญา พลิกแพลง และความอุดมสมบูรณ์" },
  { id: 1, name: "ฉลู (วัว)", origName: "丑 (Chǒu)", symbol: "🐂", element: "ธาตุดินหยิน", aura: "สีเหลืองทอง/น้ำตาล", attribute: "ความมั่นคง ความเพียร และบารมีสะสม" },
  { id: 2, name: "ขาล (เสือ)", origName: "寅 (Yín)", symbol: "🐅", element: "ธาตุไม้หยาง", aura: "สีเขียวมรกต/ส้ม", attribute: "อำนาจเด็ดขาด กล้าหาญ และขจัดภูตผี" },
  { id: 3, name: "เถาะ (กระต่าย)", origName: "卯 (Mǎo)", symbol: "🐇", element: "ธาตุไม้หยิน", aura: "สีเขียวอ่อน/หยก", attribute: "เมตตามหานิยม ความนุ่มนวล และอายุวัฒนะ" },
  { id: 4, name: "มะโรง (มังกรฟ้า)", origName: "辰 (Chén)", symbol: "🐉", element: "ธาตุดินหยาง", aura: "สีทองคำ/แดงมงคล", attribute: "มหาอำนาจบารมี สวรรค์ประทาน และโชคลาภสูงสุด" },
  { id: 5, name: "มะเส็ง (งูไฟ)", origName: "巳 (Sì)", symbol: "🐍", element: "ธาตุไฟหยิน", aura: "สีแดงชาด/ม่วง", attribute: "ญาณหยั่งรู้ เสน่ห์เร้นลับ และไหวพริบ" },
  { id: 6, name: "มะเมีย (ม้า)", origName: "午 (Wǔ)", symbol: "🐎", element: "ธาตุไฟหยาง", aura: "สีแดงสด/ทอง", attribute: "อิสรภาพ ความรวดเร็ว และชัยชนะเหนือศัตรู" },
  { id: 7, name: "มะแม (แพะ)", origName: "未 (Wèi)", symbol: "🐐", element: "ธาตุดินหยิน", aura: "สีชมพู/ขาวมุก", attribute: "ความสงบสุข ความคิดสร้างสรรค์ และศิลปศาสตร์" },
  { id: 8, name: "วอก (ลิง)", origName: "申 (Shēn)", symbol: "🐒", element: "ธาตุทองหยาง", aura: "สีขาวเงิน/ทองคำ", attribute: "ปัญญาไว ไหวพริบปฏิภาณ และการปลดล็อกอุปสรรค" },
  { id: 9, name: "ระกา (ไก่ทอง)", origName: "酉 (Yǒu)", symbol: "🐓", element: "ธาตุทองหยิน", aura: "สีทองคำขาว/แสด", attribute: "ความแม่นยำ ปลุกรุ่งอรุณแห่งโชค และเกียรติยศ" },
  { id: 10, name: "จอ (สุนัข)", origName: "戌 (Xū)", symbol: "🐕", element: "ธาตุดินหยาง", aura: "สีน้ำตาลอบอุ่น/เหลือง", attribute: "ความซื่อสัตย์ ปกป้องภัย และความจงรักภักดี" },
  { id: 11, name: "กุน (หมูมงคล)", origName: "亥 (Hài)", symbol: "🐖", element: "ธาตุน้ำหยาง", aura: "สีครามเข้ม/ดำนิล", attribute: "ความบริบูรณ์ โภคทรัพย์ไม่ขาดมือ และสันติสุข" },
];

// 2. Western / European Zodiac
const WESTERN_ITEMS: ZodiacItem[] = [
  { id: 0, name: "ราศีเมษ (Aries)", origName: "♈ Aries", symbol: "♈", element: "ธาตุไฟบรรลัยกัลป์", aura: "สีแดงเพลิง", attribute: "ผู้นำผู้เบิกทาง พลังชีวิตอันล้นพ้น และความหาญกล้า" },
  { id: 1, name: "ราศีพฤษภ (Taurus)", origName: "♉ Taurus", symbol: "♉", element: "ธาตุดินพสุธา", aura: "สีเขียวไพร/ชมพู", attribute: "ความอุดมสมบูรณ์ มรดกความมั่งคั่ง และความหนักแน่น" },
  { id: 2, name: "ราศีเมถุน (Gemini)", origName: "♊ Gemini", symbol: "♊", element: "ธาตุลมแปรปรวน", aura: "สีเหลืองสว่าง", attribute: "สื่อสารมนตรา ทวิลักษณ์ และการเชื่อมโยงมิติ" },
  { id: 3, name: "ราศีกรกฎ (Cancer)", origName: "♋ Cancer", symbol: "♋", element: "ธาตุน้ำมหาสมุทร", aura: "สีเงินจันทรา/ขาวบริสุทธิ์", attribute: "ญาณจิตสัมผัส การคุ้มครองครอบครัว และพลังแห่งดวงจันทร์" },
  { id: 4, name: "ราศีสิงห์ (Leo)", origName: "♌ Leo", symbol: "♌", element: "ธาตุไฟสุริยะ", aura: "สีทองเปล่งประกาย", attribute: "มหาบารมีราชสีห์ หัวใจกล้าแกร่ง และรัศมีดวงอาทิตย์" },
  { id: 5, name: "ราศีกันย์ (Virgo)", origName: "♍ Virgo", symbol: "♍", element: "ธาตุดินบริสุทธิ์", aura: "สีเขียวมะกอก/ครีม", attribute: "วิจารณญาณอันบริสุทธิ์ การเยียวยา และความประณีต" },
  { id: 6, name: "ราศีตุลย์ (Libra)", origName: "♎ Libra", symbol: "♎", element: "ธาตุลมแห่งความสมดุล", aura: "สีฟ้าพาสเทล/ชมพูกุหลาบ", attribute: "คันชั่งแห่งความยุติธรรม เสน่ห์อันเย้ายวน และสันติธรรม" },
  { id: 7, name: "ราศีพิจิก (Scorpio)", origName: "♏ Scorpio", symbol: "♏", element: "ธาตุน้ำลึกลับ", aura: "สีแดงเลือดนก/ดำสนิท", attribute: "พลังจิตวิญญาณคืนชีพ การเกิดใหม่ และความเร้นลับ" },
  { id: 8, name: "ราศีธนู (Sagittarius)", origName: "♐ Sagittarius", symbol: "♐", element: "ธาตุไฟนำทาง", aura: "สีม่วงเข้ม/น้ำเงินคราม", attribute: "ศรแห่งปัญญา การผจญภัยสู่ขอบจักรวาล และความจริงสูงสุด" },
  { id: 9, name: "ราศีมังกร (Capricorn)", origName: "♑ Capricorn", symbol: "♑", element: "ธาตุดินขุนเขา", aura: "สีดำ/เทาเข้ม", attribute: "ความมุ่งมั่นทะยานฟ้า วินัยเหล็ก และการสร้างอาณาจักร" },
  { id: 10, name: "ราศีกุมภ์ (Aquarius)", origName: "♒ Aquarius", symbol: "♒", element: "ธาตุลมดวงดาว", aura: "สีฟ้าอิเล็กทริก/เงิน", attribute: "ผู้ตื่นรู้แห่งยุคใหม่ นวัตกรรมแห่งสายน้ำดาราจักร" },
  { id: 11, name: "ราศีมีน (Pisces)", origName: "♓ Pisces", symbol: "♓", element: "ธาตุน้ำไร้ขอบเขต", aura: "สีเขียวน้ำทะเล/ม่วงลาเวนเดอร์", attribute: "มนตราความฝัน โทรจิตไร้กาลเวลา และความเมตตาสากล" },
];

// 3. Thai Zodiac (สยามมณฑล / ล้านนา)
const THAI_ITEMS: ZodiacItem[] = [
  { id: 0, name: "ชวด (หนูทองมงคล)", origName: "ชวด", symbol: "🐀", element: "ธาตุน้ำมหานที", aura: "สีขาวบริสุทธิ์", attribute: "มิ่งขวัญแห่งความฉลาด ค้าขายคล่อง กำไรล้นหลาม" },
  { id: 1, name: "ฉลู (วัวอุสุภราช)", origName: "ฉลู", symbol: "🐂", element: "ธาตุดินแม่พระธรณี", aura: "สีเหลืองจำปา", attribute: "บารมีพระโคอุสุภราช พลังค้ำชูบ้านเมืองและครอบครัว" },
  { id: 2, name: "ขาล (เสือสมิงมหาอำนาจ)", origName: "ขาล", symbol: "🐅", element: "ธาตุไม้ดงพญาเย็น", aura: "สีส้มเปลวเพลิง", attribute: "มหาอำนาจตบะเดชะ สะกดศัตรูหมู่มารให้ยำเกรง" },
  { id: 3, name: "เถาะ (กระต่ายแก้วศศิธร)", origName: "เถาะ", symbol: "🐇", element: "ธาตุไม้หอมสวรรค์", aura: "สีนวลจันทร์", attribute: "โชคเมตตามหานิยม มหาเสน่ห์ดั่งพระจันทร์วันเพ็ญ" },
  { id: 4, name: "มะโรง (พญานาคาธิบดี)", origName: "มะโรง", symbol: "🐉", element: "ธาตุดินบัลลังก์บาดาล", aura: "สีเขียวมรกตเหลือบทอง", attribute: "พญานาคมหาโชค ประทานทรัพย์สมบัติบาดาลและฝนทิพย์" },
  { id: 5, name: "มะเส็ง (พญางูเก็จแก้ว)", origName: "มะเส็ง", symbol: "🐍", element: "ธาตุไฟกสิณ", aura: "สีแดงทับทิม", attribute: "แคล้วคลาดปลอดภัย มนต์สะกดจิตใจ และสัมผัสที่หก" },
  { id: 6, name: "มะเมีย (ม้าแก้วอัศวราช)", origName: "มะเมีย", symbol: "🐎", element: "ธาตุไฟประลัยจักร", aura: "สีแดงชาด", attribute: "ม้าแก้วพระจักรพรรดิ ก้าวหน้าไร้สิ่งขัดขวาง ชนะศึกทุกทิศ" },
  { id: 7, name: "มะแม (แพะทองโภคทรัพย์)", origName: "มะแม", symbol: "🐐", element: "ธาตุดินทิพย์", aura: "สีเหลืองอ่อนขมิ้น", attribute: "ความร่มเย็นเป็นสุข ปราศจากโรคภัย และอุปถัมภ์ค้ำชู" },
  { id: 8, name: "วอก (พญาวานรหนุมาน)", origName: "วอก", symbol: "🐒", element: "ธาตุทองคงกระพัน", aura: "สีขาวเงินยวง", attribute: "ฤทธานุภาพหนุมาน อาสาสำเร็จทุกภารกิจ ไม่มีวันพ่ายแพ้" },
  { id: 9, name: "ระกา (ไก่แก้วสาริกา)", origName: "ระกา", symbol: "🐓", element: "ธาตุทองแก้วมณี", aura: "สีทองชมพู", attribute: "เสียงขันเรียกทรัพย์ ปลุกโชคลาภ ป้องกันเสนียดจัญไร" },
  { id: 10, name: "จอ (สุนัขท้าวเวสสุวรรณ)", origName: "จอ", symbol: "🐕", element: "ธาตุดินศิลาแลง", aura: "สีน้ำตาลทอง", attribute: "พิทักษ์ทรัพย์สิน ป้องกันภัยมืด และความภักดีนิรันดร์" },
  { id: 11, name: "กุน (พญาคชสารมงคล / ช้างแก้ว)", origName: "กุน (ล้านนาเป็นช้าง)", symbol: "🐘", element: "ธาตุน้ำสระอโนดาต", aura: "สีครามเข้ม", attribute: "ช้างแก้วมงคลแห่งล้านนา หนุนชะตามหาเศรษฐี อุดมสมบูรณ์" },
];

// 4. Vedic / Hindu Zodiac (ราศีเวทิก)
const VEDIC_ITEMS: ZodiacItem[] = [
  { id: 0, name: "เมษะ (Mesha - พระอัคนี)", origName: "मेष Mesha", symbol: "🐏", element: "ธาตุอัคนี (ไฟ)", aura: "สีแดงสดดั่งเปลวสุริยัน", attribute: "พระอัคนีประทานพลังการเริ่มต้น ความกล้าหาญไร้ขีดจำกัด" },
  { id: 1, name: "วฤศภะ (Vrishabha - พระแม่สุรภี)", origName: "वृषभ Vrishabha", symbol: "🐂", element: "ธาตุปฤถวี (ดิน)", aura: "สีขาวมุกและเขียวใบตอง", attribute: "พระแม่วัวสารพัดนึก ประทานทรัพย์มหาศาลและความสุขสงบ" },
  { id: 2, name: "มิถุน (Mithuna - มหามายา)", origName: "मिथुन Mithuna", symbol: "👥", element: "ธาตุวายุ (ลม)", aura: "สีเขียวใบไม้สด", attribute: "มนตราแห่งพระพุธ สติปัญญาพริบพราวและวาทศิลป์สะกดจิต" },
  { id: 3, name: "กรกฏะ (Karka - พระจันทร์จันทรา)", origName: "कर्क Karka", symbol: "🦀", element: "ธาตุวารี (น้ำ)", aura: "สีขาวเงินสว่างไสว", attribute: "พระโสมะประทานความเมตตา ดวงจิตสงบ และการหยั่งรู้สัจธรรม" },
  { id: 4, name: "สิงหะ (Simha - พระนรสิงห์)", origName: "सिंह Simha", symbol: "🦁", element: "ธาตุเตชัส (เปลวเพลิง)", aura: "สีทองสุกปลั่ง", attribute: "มหาอำนาจนรสิงห์ ปราบสิ่งอัปมงคล และเกียรติยศสูงสุด" },
  { id: 5, name: "กันยา (Kanya - พระลักษมีสาวพรหมจารี)", origName: "कन्या Kanya", symbol: "🧕", element: "ธาตุดินศักดิ์สิทธิ์", aura: "สีเขียวหยกและเหลืองมัสตาร์ด", attribute: "ความบริสุทธิ์แห่งการบูชา ความเฉลียวฉลาด และการบำเพ็ญบุญ" },
  { id: 6, name: "ตุลา (Tula - พระธรรมราชา)", origName: "तुला Tula", symbol: "⚖️", element: "ธาตุวายุสวรรค์", aura: "สีฟ้าครามและขาว", attribute: "ตราชั่งพระยมราช เที่ยงธรรม ความสุขารมณ์ และความสมดุล" },
  { id: 7, name: "วฤศจิกะ (Vrishchika - พระอังคาร)", origName: "वृश्चिक Vrishchika", symbol: "🦂", element: "ธาตุน้ำลึกแห่งมหาสมุทร", aura: "สีแดงทับทิมเข้ม", attribute: "ตบะญาณฤาษี พลังลี้ลับคุ้มกาย และการแปรเปลี่ยนเคราะห์เป็นโชค" },
  { id: 8, name: "ธนูษะ (Dhanu - พระพฤหัสบดี)", origName: "धनु Dhanu", symbol: "🏹", element: "ธาตุไฟประทีป", aura: "สีเหลืองดอกคูน", attribute: "คุรุเทพประทานปัญญา ญาณสมาธิ และโชคลาภจากครูบาอาจารย์" },
  { id: 9, name: "มกระ (Makara - พระพิรุณและมกร)", origName: "मकर Makara", symbol: "🐊", element: "ธาตุดินแข็งแกร่ง", aura: "สีน้ำเงินเข้มและดำ", attribute: "มกรผู้กลืนกินกาลเวลา ความอดทนเยี่ยงโยคี และความสำเร็จยิ่งใหญ่" },
  { id: 10, name: "กุมภะ (Kumbha - หม้อน้ำอมฤต)", origName: "कुम्भ Kumbha", symbol: "🏺", element: "ธาตุลมจักรวาล", aura: "สีฟ้าน้ำทะเล", attribute: "น้ำอมฤตเทวโลก ความหลุดพ้น และความรอบรู้สากลจักรวาล" },
  { id: 11, name: "มีนะ (Meena - มัสยาอวตาร)", origName: "मीन Meena", symbol: "🐟", element: "ธาตุน้ำเกษียรสมุทร", aura: "สีเหลืองทองและเขียวมรกต", attribute: "มัสยาอวตารคุ้มภัย นำพาดวงจิตข้ามห้วงมหรรณพสู่ความรุ่งเรือง" },
];

// 5. Islamic / Arabic Astrology (12 บุรุจแห่งดวงดาว)
const ISLAMIC_ITEMS: ZodiacItem[] = [
  { id: 0, name: "อัล-ฮะมัล (Al-Hamal - แกะสวรรค์)", origName: "الحمل", symbol: "♈", element: "ธาตุไฟ (นารี)", aura: "สีแดงทับทิม", attribute: "ความกล้าหาญ การเริ่มต้นสิ่งยิ่งใหญ่ และการปกป้อง" },
  { id: 1, name: "อัล-เษาร์ (Al-Thawr - โคทองคำ)", origName: "الثور", symbol: "♉", element: "ธาตุดิน (ตุรอบี)", aura: "สีเขียวมรกต", attribute: "บารมีความมั่นคง สัจจะวาจา และความมั่งคั่งยั่งยืน" },
  { id: 2, name: "อัล-เญาซาอ์ (Al-Jawza - สองดวงใจ)", origName: "الجوزاء", symbol: "♊", element: "ธาตุลม (ฮะวาอี)", aura: "สีเหลืองอำพัน", attribute: "ปัญญาความคิด วาทศิลป์ดึงดูดใจ และมิตรภาพทั่วหล้า" },
  { id: 3, name: "อัล-สะระฏอน (Al-Saratan - ปูแห่งน่านน้ำ)", origName: "السرطان", symbol: "♋", element: "ธาตุน้ำ (มาอี)", aura: "สีเงินจันทรา", attribute: "ความอ่อนโยน คุ้มครองเคหสถาน และญาณความหยั่งรู้" },
  { id: 4, name: "อัล-อะซัด (Al-Asad - ราชสีห์แห่งทะเลทราย)", origName: "الأسد", symbol: "♌", element: "ธาตุไฟ (นารี)", aura: "สีทองเปล่งประกาย", attribute: "เกียรติยศ ผู้นำที่น่าเกรงขาม และหัวใจอันยิ่งใหญ่" },
  { id: 5, name: "อัล-ซุนบุละฮ์ (Al-Sunbula - รวงข้าวสวรรค์)", origName: "السنبلة", symbol: "🌾", element: "ธาตุดิน (ตุรอบี)", aura: "สีเขียวมะกอก", attribute: "ความประณีต ผลผลิตอันอุดม และการเก็บเกี่ยวผลบุญ" },
  { id: 6, name: "อัล-มีซาน (Al-Mizan - ตราชั่งแห่งสัจธรรม)", origName: "الميزان", symbol: "⚖️", element: "ธาตุลม (ฮะวาอี)", aura: "สีฟ้าคราม", attribute: "ความยุติธรรม สันติสุข และความสมดุลแห่งชีวิต" },
  { id: 7, name: "อัล-อักรอบ (Al-Aqrab - แมงป่องเร้นลับ)", origName: "العقرب", symbol: "♏", element: "ธาตุน้ำ (มาอี)", aura: "สีม่วงเข้ม", attribute: "ความมุ่งมั่นลึกซึ้ง พลังจิตแข็งกล้า และการเอาชนะอุปสรรค" },
  { id: 8, name: "อัล-เกาส์ (Al-Qaws - คันศรนำวิถี)", origName: "القوس", symbol: "🏹", element: "ธาตุไฟ (นารี)", aura: "สีครามเข้ม", attribute: "การแสวงหาความจริงอันไกลโพ้น วิสัยทัศน์กว้างไกล และโชคดี" },
  { id: 9, name: "อัล-ญัดย์ (Al-Jady - แพะภูเขาผาชัน)", origName: "الجدي", symbol: "♑", element: "ธาตุดิน (ตุรอบี)", aura: "สีน้ำตาลเข้ม", attribute: "ความอดทนไม่ย่อท้อ บันไดสู่เกียรติยศ และความสำเร็จสูงสุด" },
  { id: 10, name: "อัล-ดัลว์ (Al-Dalw - ผู้หลั่งน้ำรินทิพย์)", origName: "الدلو", symbol: "🏺", element: "ธาตุลม (ฮะวาอี)", aura: "สีฟ้านภา", attribute: "ความโอบอ้อมอารี ความคิดก้าวล้ำ และการช่วยเหลือเพื่อนมนุษย์" },
  { id: 11, name: "อัล-ฮูต (Al-Hut - มัจฉาคู่เกษม)", origName: "الحوت", symbol: "🐟", element: "ธาตุน้ำ (มาอี)", aura: "สีเขียวน้ำทะเล", attribute: "ความเมตตาจิต จินตนาการไร้พรมแดน และความสงบแห่งวิญญาณ" },
];

// 6. Vietnamese Zodiac (12 Chi - มีควายน้ำ และแมว)
const VIETNAMESE_ITEMS: ZodiacItem[] = [
  { id: 0, name: "ปีชวด (Tý - หนูฉลาด)", origName: "Tý (Tí)", symbol: "🐀", element: "ธาตุน้ำ", aura: "สีดำ/น้ำเงิน", attribute: "ความว่องไว ปรับตัวได้ทุกสภาพ และโชคลาภสะสม" },
  { id: 1, name: "ปีฉลู (Sửu - ควายน้ำทรงพลัง)", origName: "Sửu (Trâu)", symbol: "🐃", element: "ธาตุดิน", aura: "สีน้ำตาลดิน/เขียว", attribute: "ความขยันมั่นคง ความอุดมสมบูรณ์แห่งท้องทุ่ง และพลังแผ่นดิน" },
  { id: 2, name: "ปีขาล (Dần - เสือลายพาดกลอน)", origName: "Dần (Hổ)", symbol: "🐅", element: "ธาตุไม้", aura: "สีส้มทอง", attribute: "อำนาจเด็ดเดี่ยว ปราบอริราชศัตรู และบารมีขจรไกล" },
  { id: 3, name: "ปีเถาะ (Mão - แมวนำโชค)", origName: "Mão (Mèo)", symbol: "🐱", element: "ธาตุไม้", aura: "สีขาวไข่มุก/ทอง", attribute: "เสน่ห์ล้นพ้น นำพาความสุขสงบ และกวักเงินทองเข้าเรือน" },
  { id: 4, name: "ปีมะโรง (Thìn - มังกรเวียดนาม)", origName: "Thìn (Rồng)", symbol: "🐉", element: "ธาตุดิน", aura: "สีแดง/ทองคำ", attribute: "สายเลือดมังกรแห่งอ่าวฮาลอง เกียรติยศและโชคลาภก้องหล้า" },
  { id: 5, name: "ปีมะเส็ง (Tỵ - งูมงคล)", origName: "Tỵ (Rắn)", symbol: "🐍", element: "ธาตุไฟ", aura: "สีม่วง/แดง", attribute: "ปัญญาหยั่งรู้ สัญชาตญาณแม่นยำ และการฟื้นฟูตัวเอง" },
  { id: 6, name: "ปีมะเมีย (Ngọ - อาชาคะนองศึก)", origName: "Ngọ (Ngựa)", symbol: "🐎", element: "ธาตุไฟ", aura: "สีแดงเพลิง", attribute: "ความรักอิสระ วิ่งสู่ความสำเร็จอย่างรวดเร็ว และโชคเดินทาง" },
  { id: 7, name: "ปีมะแม (Mùi - แพะภูเขา)", origName: "Mùi (Dê)", symbol: "🐐", element: "ธาตุดิน", aura: "สีเหลืองอ่อน", attribute: "ความอ่อนน้อมถ่อมตน ความคิดสร้างสรรค์ และคนรักใคร่" },
  { id: 8, name: "ปีวอก (Thân - ลิงชาญฉลาด)", origName: "Thân (Khỉ)", symbol: "🐒", element: "ธาตุทอง", aura: "สีเงิน", attribute: "แก้ปัญหาฉับพลัน พลิกวิกฤตเป็นโอกาส และรอยยิ้มนำโชค" },
  { id: 9, name: "ปีระกา (Dậu - ไก่แจ้รุ่งอรุณ)", origName: "Dậu (Gà)", symbol: "🐓", element: "ธาตุทอง", aura: "สีทองคำ", attribute: "ความซื่อตรง ขยันขันแข็ง และชื่อเสียงขจรขจาย" },
  { id: 10, name: "ปีจอ (Tuất - สุนัขผู้ภักดี)", origName: "Tuất (Chó)", symbol: "🐕", element: "ธาตุดิน", aura: "สีน้ำตาล", attribute: "ปกป้องคุ้มครอง มิตรแท้ที่ไว้ใจได้ และความปลอดภัยในชีวิต" },
  { id: 11, name: "ปีกุน (Hợi - หมูอุดมทรัพย์)", origName: "Hợi (Lợn)", symbol: "🐖", element: "ธาตุน้ำ", aura: "สีชมพูทอง", attribute: "ความสุขสมบูรณ์ การกินดีอยู่ดี และจิตใจกว้างขวาง" },
];

// 7. Burmese Zodiac (มหาภูติ 8 สัตว์ประจำวันเกิด)
const BURMESE_ITEMS: ZodiacItem[] = [
  { id: 0, name: "วันอาทิตย์ (ครุฑ - Galon)", origName: "တနင်္ဂနွေ (ဂဠုန်)", symbol: "🦅", element: "ธาตุไฟสุริยะ", aura: "สีแดงชาด", attribute: "พญาครุฑผู้ครองเวหา มีอำนาจเด็ดขาด ชนะอุปสรรคทั้งปวง" },
  { id: 1, name: "วันจันทร์ (เสือ - Kyas)", origName: "တနင်္လာ (ကျား)", symbol: "🐅", element: "ธาตุดินแห่งพงไพร", aura: "สีขาวนวลและส้ม", attribute: "เสือลายสง่างาม ความอดทนรอบคอบ และสายตาคมกริบ" },
  { id: 2, name: "วันอังคาร (สิงห์ - Chinthe)", origName: "အင်္ဂါ (ခြင်္သေ့)", symbol: "🦁", element: "ธาตุไฟแผดเผา", aura: "สีชมพูทับทิม", attribute: "สิงห์ผู้พิทักษ์เจดีย์ จิตใจเข้มแข็งกล้าหาญ และมีเสน่ห์ดึงดูด" },
  { id: 3, name: "วันพุธเช้า (ช้างมีงา - Hsin)", origName: "ဗုဒ္ဓဟူး (ဆင်)", symbol: "🐘", element: "ธาตุน้ำหล่อเลี้ยง", aura: "สีเขียวตองอ่อน", attribute: "ช้างศึกมิ่งขวัญ ปัญญาหลักแหลม มีผู้ใหญ่อุปถัมภ์ค้ำชู" },
  { id: 4, name: "วันพุธบ่าย/ราหู (ช้างไม่มีงา - Hsin ma)", origName: "ရာဟု (ဟိန်မ)", symbol: "🦣", element: "ธาตุดินลี้ลับ", aura: "สีครามเข้ม/เทาหมอก", attribute: "ช้างพังเร้นลับ พลิกดวงชะตา แคล้วคลาดจากภัยมืด" },
  { id: 5, name: "วันพฤหัสบดี (หนู - Kywe)", origName: "ကြာသပတေး (ကြွက်)", symbol: "🐀", element: "ธาตุไม้สัจธรรม", aura: "สีเหลืองจันทรา", attribute: "หนูผู้รวดเร็ว ความคิดสร้างสรรค์ รอบรู้ และเก็บเงินเก่ง" },
  { id: 6, name: "วันศุกร์ (หนูตะเภา - Puta)", origName: "သောကြာ (ပူး)", symbol: "🐹", element: "ธาตุลมแห่งความรัก", aura: "สีฟ้าใสบริสุทธิ์", attribute: "หนูตะเภานำโชค เมตตามหานิยม ความรักสดใส และความสุขสบาย" },
  { id: 7, name: "วันเสาร์ (พญานาค - Naga)", origName: "စနေ (နဂါး)", symbol: "🐉", element: "ธาตุไฟลึกใต้ดิน", aura: "สีดำนิลและม่วง", attribute: "พญานาคมหาเวทย์ พลังอำนาจเร้นลับ ปกป้องสิ่งล้ำค่าในชีวิต" },
  // Duplicate slots to maintain 12-slot array compatibility with Wasm RNG
  { id: 8, name: "วันอาทิตย์แรม (พญาครุฑทอง)", origName: "ဂဠုန်ทอง", symbol: "🦅", element: "ธาตุไฟสุริยะ", aura: "สีทองเปล่งประกาย", attribute: "ครุฑสยายปีก นำพาลาภยศและชื่อเสียงกว้างไกล" },
  { id: 9, name: "วันจันทร์เพ็ญ (เสือขาวคุ้มภัย)", origName: "ကျားဖြူ", symbol: "🐅", element: "ธาตุน้ำค้างสวรรค์", aura: "สีเงินยวง", attribute: "เสือขาวมิ่งมงคล คุ้มครองจากเคราะห์และศัตรูปองร้าย" },
  { id: 10, name: "วันพฤหัสบดีใหญ่ (หนูแก้วมหาลาภ)", origName: "ကြွက်ทอง", symbol: "🐀", element: "ธาตุทองคำ", aura: "สีทองคำ", attribute: "หนูแก้วสารพัดนึก เสี่ยงโชคเฮง ร่ำรวยไร้ขีดจำกัด" },
  { id: 11, name: "วันเสาร์ราตรี (นาคราชบันดาลทรัพย์)", origName: "နဂါးမင်း", symbol: "🐉", element: "ธาตุน้ำลึกบาดาล", aura: "สีเขียวนิลกาฬ", attribute: "พญานาคมรกต บันดาลแก้วแหวนเงินทองและโชคลาภใหญ่" },
];

// 8. Ancient Egyptian Zodiac (เทพเจ้าแห่งลุ่มน้ำไนล์)
const EGYPTIAN_ITEMS: ZodiacItem[] = [
  { id: 0, name: "แม่น้ำไนล์ (The Nile)", origName: "Hapi (The Nile)", symbol: "🌊", element: "ธาตุน้ำแห่งชีวิต", aura: "สีน้ำเงินสด", attribute: "บ่อเกิดแห่งสรรพสิ่ง การเริ่มต้นใหม่ และความอุดมสมบูรณ์ล้นพ้น" },
  { id: 1, name: "อามุน-รา (Amon-Ra)", origName: "Amon-Ra", symbol: "☀️", element: "ธาตุสุริยเทพ", aura: "สีทองคำบริสุทธิ์", attribute: "ราชาแห่งทวยเทพ ความเป็นผู้นำสูงส่ง และพลังชีวิตไร้ขีดจำกัด" },
  { id: 2, name: "มุต (Mut)", origName: "Mut", symbol: "🦅", element: "ธาตุลมแห่งสวรรค์", aura: "สีฟ้าคราม", attribute: "มารดาแห่งจักรวาล ความเอื้ออาทร และการปกป้องคุ้มครองวิญญาณ" },
  { id: 3, name: "เกบ (Geb)", origName: "Geb", symbol: "🌱", element: "ธาตุปฐพีมหาแผ่นดิน", aura: "สีน้ำตาลดิน/เขียว", attribute: "เทพแห่งผืนโลก ความซื่อสัตย์ ความหนักแน่น และโชคจากที่ดิน" },
  { id: 4, name: "โอซิริส (Osiris)", origName: "Osiris", symbol: "👑", element: "ธาตุแห่งการเกิดใหม่", aura: "สีดำ/เขียวมรกต", attribute: "ราชาแห่งโลกวิญญาณ การเอาชนะอุปสรรค และการฟื้นคืนชีพของดวงชะตา" },
  { id: 5, name: "ไอซิส (Isis)", origName: "Isis", symbol: "🪽", element: "ธาตุเวทมนตร์ศักดิ์สิทธิ์", aura: "สีน้ำเงินเข้มเหลือบทอง", attribute: "เทวีแห่งเวทมนตร์และการรักษา เยียวยาจิตใจและดึงดูดความรักแท้" },
  { id: 6, name: "ธอธ (Thoth)", origName: "Thoth", symbol: "🪶", element: "ธาตุลมแห่งปัญญา", aura: "สีเงินสว่าง", attribute: "เทพแห่งอักษรศาสตร์และปัญญา การเจรจา การสอบแข่งขัน และการหยั่งรู้" },
  { id: 7, name: "ฮอรัส (Horus)", origName: "Horus", symbol: "👁️", element: "ธาตุไฟแห่งท้องฟ้า", aura: "สีแดงส้ม/ทอง", attribute: "ดวงตาแห่งฮอรัส ชัยชนะเหนือความมืด ปกป้องจากมนต์ดำและศัตรู" },
  { id: 8, name: "อนูบิส (Anubis)", origName: "Anubis", symbol: "🐺", element: "ธาตุมิติลี้ลับ", aura: "สีดำนิลสนิท", attribute: "ผู้นำทางดวงวิญญาณ สัญชาตญาณลึกลับ และการปกป้องความลับ" },
  { id: 9, name: "เซธ (Seth)", origName: "Seth", symbol: "⚡", element: "ธาตุพายุทะเลทราย", aura: "สีแดงเพลิง", attribute: "เทพแห่งพายุ ความมุ่งมั่นไม่ยอมแพ้ และพลังทะลุทะลวงอุปสรรค" },
  { id: 10, name: "บาสเตต (Bastet)", origName: "Bastet", symbol: "🐈", element: "ธาตุไฟอบอุ่น", aura: "สีเขียวอ่อน/ชมพู", attribute: "เทวีแมวแห่งความสุข ความเพลิดเพลิน เสน่ห์ดึงดูด และคุ้มครองบ้านเรือน" },
  { id: 11, name: "เซคเมต (Sekhmet)", origName: "Sekhmet", symbol: "🦁", element: "ธาตุสุริยเพลิงพิโรธ", aura: "สีแดงเข้ม", attribute: "เทวีราชสีห์ ปัดเป่าโรคระบาด คุ้มกันภัย และพลังความยุติธรรมเด็ดขาด" },
];

// 9. Aztec & Mayan Calendar (สัญลักษณ์ปฏิทินสุริยะโทนัลโปฮัวลีและซอลคิน)
const AZTEC_MAYAN_ITEMS: ZodiacItem[] = [
  { id: 0, name: "ซิปักต์ลี (Cipactli - จระเข้แห่งปฐมกาล)", origName: "Cipactli / Imix", symbol: "🐊", element: "ธาตุน้ำดึกดำบรรพ์", aura: "สีเขียวหยกเข้ม", attribute: "การกำเนิดใหม่ ความอุดมสมบูรณ์ และรากฐานชีวิตที่แข็งแกร่ง" },
  { id: 1, name: "เอเฮคัทล์ (Ehecatl - เทพลมสวรรค์)", origName: "Ehecatl / Ik", symbol: "💨", element: "ธาตุลมแห่งชีวิต", aura: "สีขาวหมอก", attribute: "ลมหายใจแห่งปัญญา ความคิดพลิกแพลง และการสื่อสารข้ามมิติ" },
  { id: 2, name: "คัลลี (Calli - วิหารสุริยะ)", origName: "Calli / Akbal", symbol: "🏛️", element: "ธาตุดินมืดเร้นลับ", aura: "สีดำเงาและน้ำเงินเข้ม", attribute: "ความมั่นคงในเคหสถาน จิตใต้สำนึก และความสงบในจิตใจ" },
  { id: 3, name: "คูเอตซ์พาลิน (Cuetzpalin - กิ้งก่าสุริยัน)", origName: "Cuetzpalin / Kan", symbol: "🦎", element: "ธาตุไฟสุริยะ", aura: "สีเหลืองส้มสด", attribute: "พลังชีวิตฟื้นตัวรวดเร็ว ไม่ยอมแพ้ต่อโชคชะตา และสุขภาพแข็งแกร่ง" },
  { id: 4, name: "โคอัตล์ (Coatl - อสรพิษขนนกเกวตซัล)", origName: "Coatl / Chicchan", symbol: "🐍", element: "ธาตุวิญญาณแห่งฟ้าดิน", aura: "สีเขียวมรกตและทอง", attribute: "งูขนนกศักดิ์สิทธิ์ ปัญญาญาณเหนือธรรมชาติ และการยกกระดับจิต" },
  { id: 5, name: "มิคิซต์ลี (Miquiztli - การเปลี่ยนผ่านแห่งวิญญาณ)", origName: "Miquiztli / Cimi", symbol: "💀", element: "ธาตุแห่งการสิ้นสุดและเริ่มต้น", aura: "สีเงินและขาวกระดูก", attribute: "การปล่อยวางอดีต สิ้นเคราะห์หมดโศก และการเริ่มต้นชีวิตใหม่ที่รุ่งโรจน์" },
  { id: 6, name: "มาซัทล์ (Mazatl - กวางป่าศักดิ์สิทธิ์)", origName: "Mazatl / Manik", symbol: "🦌", element: "ธาตุดินและป่าไม้", aura: "สีน้ำตาลทอง", attribute: "ความสง่างาม สัญชาตญาณระวังภัย และความเมตตาปรานี" },
  { id: 7, name: "ทอชต์ลี (Tochtli - กระต่ายดวงจันทร์)", origName: "Tochtli / Lamat", symbol: "🐇", element: "ธาตุน้ำจันทรา", aura: "สีเหลืองทองอ่อน", attribute: "ความอุดมสมบูรณ์ ความสนุกสนานรื่นเริง และเสน่ห์ดึงดูดผู้คน" },
  { id: 8, name: "แอตล์ (Atl - สายน้ำศักดิ์สิทธิ์)", origName: "Atl / Muluc", symbol: "💧", element: "ธาตุน้ำชำระล้าง", aura: "สีฟ้าใสบริสุทธิ์", attribute: "การล้างบาป ล้างสิ่งอัปมงคล และการไหลเวียนของโชคลาภเงินทอง" },
  { id: 9, name: "โอเซโลทล์ (Ocelotl - เสือจากัวร์แห่งราตรี)", origName: "Ocelotl / Ix", symbol: "🐆", element: "ธาตุดินแห่งความมืด", aura: "สีดำลายทอง", attribute: "พลังนักรบชาแมน ลึกลับน่าเกรงขาม และสายตามองเห็นในความมืด" },
  { id: 10, name: "ควาอูห์ทลี (Cuauhtli - พญาอินทรีสุริยะ)", origName: "Cuauhtli / Men", symbol: "🦅", element: "ธาตุไฟแห่งดวงอาทิตย์", aura: "สีทองคำเจิดจ้า", attribute: "สายตากว้างไกล ความกล้าหาญมุ่งมั่นทะยานฟ้า และเกียรติยศสูงสุด" },
  { id: 11, name: "โชชิตล์ (Xochitl - มาลัยดอกไม้สวรรค์)", origName: "Xochitl / Ahau", symbol: "🌺", element: "ธาตุแห่งความงามและศิลป์", aura: "สีชมพูบานเย็นและแดง", attribute: "ความสุขสมหวัง ศิลปวัฒนธรรม ความรุ่งเรือง และความรักที่เบ่งบาน" },
];

// 10. Native American Zodiac (โทเท็มสัตว์วิญญาณชนเผ่าอินเดียแดง)
const NATIVE_AMERICAN_ITEMS: ZodiacItem[] = [
  { id: 0, name: "ห่านหิมะ (Snow Goose)", origName: "Waboos (Snow Goose)", symbol: "🪿", element: "ธาตุดินลมหนาว", aura: "สีขาวหิมะบริสุทธิ์", attribute: "ความทะเยอทะยาน การวางแผนระยะยาว และความบริสุทธิ์ใจ" },
  { id: 1, name: "นากน้ำ (Otter)", origName: "Otter", symbol: "🦦", element: "ธาตุลมแห่งการเล่น", aura: "สีเงินและฟ้าคราม", attribute: "ความเบิกบาน มิตรภาพไร้เดียงสา และมุมมองสร้างสรรค์นอกกรอบ" },
  { id: 2, name: "หมาป่า (Wolf)", origName: "Wolf", symbol: "🐺", element: "ธาตุน้ำแห่งสัญชาตญาณ", aura: "สีน้ำเงินครามเข้ม", attribute: "ครูผู้สอนทางจิตวิญญาณ สัญชาตญาณแม่นยำ และความภักดีต่อฝูง" },
  { id: 3, name: "เหยี่ยวแดง (Red Hawk)", origName: "Red Hawk", symbol: "🦅", element: "ธาตุไฟแห่งการตื่นรู้", aura: "สีแดงเพลิงและเหลือง", attribute: "ผู้เบิกทาง สายตาเฉียบแหลมมองทะลุภาพลวงตา และการตัดสินใจฉับไว" },
  { id: 4, name: "บีเวอร์ (Beaver)", origName: "Beaver", symbol: "🦫", element: "ธาตุดินสร้างสรรค์", aura: "สีน้ำตาลและฟ้า", attribute: "ผู้สร้างรากฐาน ความพากเพียรไม่ย่อท้อ และความมั่นคงในครอบครัว" },
  { id: 5, name: "กวางป่า (Deer)", origName: "Deer", symbol: "🦌", element: "ธาตุลมแห่งความอ่อนโยน", aura: "สีเขียวใบไม้และส้ม", attribute: "ความอ่อนโยนดั่งสายลม ปลอบประโลมจิตใจ และความรวดเร็วคล่องตัว" },
  { id: 6, name: "นกหัวขวาน (Woodpecker)", origName: "Woodpecker", symbol: "🪶", element: "ธาตุน้ำแห่งความรัก", aura: "สีชมพูกุหลาบ", attribute: "ผู้พิทักษ์รัง หัวใจแห่งความอบอุ่น และความผูกพันในครอบครัว" },
  { id: 7, name: "ปลาแซลมอน / สเตอร์เจียน (Sturgeon)", origName: "Sturgeon", symbol: "🐟", element: "ธาตุไฟในสายน้ำ", aura: "สีแดงทับทิม", attribute: "พลังแห่งความพยายามว่ายทวนกระแสน้ำ ความกล้าหาญ และความเป็นผู้นำ" },
  { id: 8, name: "หมีสีน้ำตาล (Brown Bear)", origName: "Brown Bear", symbol: "🐻", element: "ธาตุดินแห่งการใคร่ครวญ", aura: "สีน้ำตาลทองและม่วง", attribute: "ความสุขุมเยือกเย็น ญาณสมาธิ การเยียวยารักษา และความแข็งแกร่งดั่งภูผา" },
  { id: 9, name: "อีกาพยากรณ์ (Raven)", origName: "Raven", symbol: "🪶", element: "ธาตุลมแห่งมนตรา", aura: "สีดำเหลือบน้ำเงิน", attribute: "ผู้เชื่อมต่อมิติเวทมนตร์ ปัญญาความจริง และการเปลี่ยนแปลงชีวิต" },
  { id: 10, name: "งูศักดิ์สิทธิ์ (Snake)", origName: "Snake", symbol: "🐍", element: "ธาตุน้ำแห่งการลอกคราบ", aura: "สีส้มแสดและดำ", attribute: "การลอกคราบเพื่อเติบโต การรักษาโรคภัย และพลังจิตวิญญาณแฝงเร้น" },
  { id: 11, name: "นกฮูกราตรี (Owl)", origName: "Owl", symbol: "🦉", element: "ธาตุไฟในความมืด", aura: "สีทองอร่าม", attribute: "ปัญญาญาณหยั่งรู้ในความมืด การรู้ทันเล่ห์เหลี่ยม และความจริงใจ" },
];

export const ZODIAC_SYSTEMS: ZodiacSystem[] = [
  {
    id: "chinese",
    name: "จีน (นักษัตร 12 ราศี)",
    region: "เอเชียตะวันออก",
    mythos: "วัฏจักร 12 นักษัตรแห่งสวรรค์และธาตุทั้ง 5 ตามหลักหยินหยางและปฏิทินจันทรคติ",
    icon: "🐉",
    items: CHINESE_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "western",
    name: "ยุโรป / สากล (12 จักรราศี)",
    region: "ยุโรปและเมดิเตอร์เรเนียน",
    mythos: "ศาสตร์ดาราจักรราศี ดวงดาว ธาตุทั้งสี่ และเทววิทยาปรัชญากรีก-โรมัน",
    icon: "♈",
    items: WESTERN_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "thai",
    name: "ไทย (12 นักษัตรสยาม-ล้านนา)",
    region: "เอเชียอาคเนย์",
    mythos: "คัมภีร์พระเวทโบราณ พญานาคราช พญาคชสารมงคล และมิ่งขวัญคุ้มครองดวงชะตา",
    icon: "🐘",
    items: THAI_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "vedic",
    name: "อินเดีย (โหราศาสตร์พระเวท / นวเคราะห์)",
    region: "เอเชียใต้ / อินเดีย",
    mythos: "โหราศาสตร์พระเวท (Jyotish) มนตรามหายันตรา เทพเจ้า และกฎแห่งกรรม",
    icon: "🕉️",
    items: VEDIC_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "islamic",
    name: "อิสลาม / อาหรับ (12 บุรุจแห่งดวงดาว)",
    region: "ตะวันออกกลางและอาหรับ",
    mythos: "ศาสตร์ดาราศาสตร์และดวงดาวโบราณ การโคจรของกลุ่มดาวบุรุจบนฟากฟ้า",
    icon: "🌙",
    items: ISLAMIC_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "vietnamese",
    name: "เวียดนาม (12 นักษัตรเอเชียตะวันออกเฉียงใต้)",
    region: "เวียดนาม",
    mythos: "ความเชื่อ 12 สัตว์ศักดิ์สิทธิ์ โดยมีควายน้ำและแมวนำโชคแห่งความอุดมสมบูรณ์",
    icon: "🐃",
    items: VIETNAMESE_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "burmese",
    name: "พม่า (มหาภูติ 8 สัตว์ประจำวัน)",
    region: "พม่า / สุวรรณภูมิ",
    mythos: "คัมภีร์มหาภูติ 8 ทิศ สัตว์ประจำวันเกิด พระเจดีย์ชเวดากอง และเทวานุภาพ",
    icon: "🦚",
    items: BURMESE_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "egyptian",
    name: "อียิปต์โบราณ (เทพเจ้าแห่งลุ่มน้ำไนล์)",
    region: "อียิปต์โบราณ / แอฟริกาเหนือ",
    mythos: "ความลี้ลับแห่งพีระมิด ดวงตาฮอรัส สุริยเทพอามุนรา และมหาเวทเทวีไอซิส",
    icon: "𓂀",
    items: EGYPTIAN_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "aztec_mayan",
    name: "แอซเท็กและมายา (ปฏิทินสุริยะศักดิ์สิทธิ์)",
    region: "เมโสอเมริกา",
    mythos: "ปฏิทินสุริยะศักดิ์สิทธิ์ 260 วัน พญางูขนนกเกวตซัล และเสือจากัวร์แห่งราตรี",
    icon: "🗿",
    items: AZTEC_MAYAN_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
  {
    id: "native_american",
    name: "ชนเผ่าอินเดียแดง (โทเท็มวิญญาณแห่งธรรมชาติ)",
    region: "อเมริกาเหนือ",
    mythos: "วงล้อแห่งการเยียวยา (Medicine Wheel) โทเท็มสัตว์วิญญาณ และพระแม่ธรณี",
    icon: "🪶",
    items: NATIVE_AMERICAN_ITEMS,
    calculateFromYear: (year: number) => {
      const y = year > 2400 ? year - 543 : year;
      return ((y - 4) % 12 + 12) % 12;
    },
  },
];

import type { SupportedLang } from './translations';

export const GATE_SYSTEM_NODES: Record<
  string,
  {
    label: Record<SupportedLang, string>;
    sub: Record<SupportedLang, string>;
  }
> = {
  western: {
    label: { th: 'ยุโรป / สากล', en: 'Western Astrology', zh: '西方星象' },
    sub: { th: '12 จักรราศี', en: '12 Zodiac Signs', zh: '十二星座' },
  },
  native_american: {
    label: { th: 'อินเดียแดง', en: 'Native American', zh: '印第安图腾' },
    sub: { th: 'โทเท็มสัตว์วิญญาณ', en: 'Spirit Totems', zh: '自然灵兽' },
  },
  vedic: {
    label: { th: 'อินเดีย', en: 'Vedic Jyotish', zh: '印度吠陀' },
    sub: { th: 'โหราศาสตร์พระเวท', en: '12 Rashis', zh: '吠陀十二宫' },
  },
  islamic: {
    label: { th: 'อิสลาม / อาหรับ', en: 'Islamic / Arabic', zh: '阿拉伯星宿' },
    sub: { th: '12 บุรุจดวงดาว', en: '12 Celestial Buruj', zh: '十二天宫' },
  },
  burmese: {
    label: { th: 'พม่า', en: 'Burmese Mahabote', zh: '缅甸八宿' },
    sub: { th: 'มหาภูติ 8 สัตว์', en: '8 Guardian Beasts', zh: '八曜神兽' },
  },
  aztec_mayan: {
    label: { th: 'แอซเท็ก / มายา', en: 'Aztec & Mayan', zh: '阿兹特克玛雅' },
    sub: { th: 'ปฏิทินสุริยะ', en: 'Solar Tonalpohualli', zh: '太阳圣历' },
  },
  vietnamese: {
    label: { th: 'เวียดนาม', en: 'Vietnamese Chi', zh: '越南生肖' },
    sub: { th: '12 สัตว์ศักดิ์สิทธิ์', en: '12 Sacred Beasts', zh: '十二圣兽（含猫）' },
  },
  egyptian: {
    label: { th: 'อียิปต์โบราณ', en: 'Ancient Egyptian', zh: '古埃及神祇' },
    sub: { th: 'ทวยเทพแห่งไนล์', en: 'Gods of the Nile', zh: '尼罗河众神' },
  },
  thai: {
    label: { th: 'ไทย', en: 'Thai / Lanna', zh: '泰国暹罗生肖' },
    sub: { th: '12 นักษัตรสยาม', en: '12 Siamese Naksat', zh: '暹罗十二生肖' },
  },
  chinese: {
    label: { th: 'จีน', en: 'Chinese Zodiac', zh: '中国生肖' },
    sub: { th: '12 นักษัตรมังกรฟ้า', en: '12 Celestial Animals', zh: '天干地支十二生肖' },
  },
};

export const ZODIAC_SYSTEM_LOCALES: Record<
  string,
  {
    name: Record<SupportedLang, string>;
    region: Record<SupportedLang, string>;
  }
> = {
  chinese: {
    name: { th: 'จีน (นักษัตร 12 ราศี)', en: 'Chinese Zodiac (12 Animals)', zh: '中国传统十二生肖' },
    region: { th: 'เอเชียตะวันออก', en: 'East Asia', zh: '东亚' },
  },
  western: {
    name: { th: 'ยุโรป / สากล (12 จักรราศี)', en: 'Western Astrology (12 Signs)', zh: '西方古典十二星座' },
    region: { th: 'ยุโรปและเมดิเตอร์เรเนียน', en: 'Europe & Mediterranean', zh: '欧洲与地中海' },
  },
  thai: {
    name: { th: 'ไทย (12 นักษัตรสยาม-ล้านนา)', en: 'Thai / Lanna Zodiac (12 Naksat)', zh: '泰国暹罗·兰纳十二生肖' },
    region: { th: 'เอเชียอาคเนย์', en: 'Southeast Asia', zh: '东南亚' },
  },
  vedic: {
    name: { th: 'อินเดีย (โหราศาสตร์พระเวท / นวเคราะห์)', en: 'Vedic Astrology (12 Rashis)', zh: '印度吠陀占星（十二宫）' },
    region: { th: 'เอเชียใต้ / อินเดีย', en: 'South Asia / India', zh: '南亚 / 印度' },
  },
  islamic: {
    name: { th: 'อิสลาม / อาหรับ (12 บุรุจแห่งดวงดาว)', en: 'Arabic & Islamic Buruj (12 Mansions)', zh: '伊斯兰/阿拉伯十二星宫' },
    region: { th: 'ตะวันออกกลางและอาหรับ', en: 'Middle East & Arabia', zh: '中东与阿拉伯' },
  },
  vietnamese: {
    name: { th: 'เวียดนาม (12 นักษัตรเอเชียตะวันออกเฉียงใต้)', en: 'Vietnamese Zodiac (12 Chi)', zh: '越南十二地支生肖' },
    region: { th: 'เวียดนาม', en: 'Vietnam', zh: '越南' },
  },
  burmese: {
    name: { th: 'พม่า (มหาภูติ 8 สัตว์ประจำวัน)', en: 'Burmese Mahabote (8 Weekday Signs)', zh: '缅甸摩诃菩提八曜神兽' },
    region: { th: 'พม่า / สุวรรณภูมิ', en: 'Myanmar / Suvarnabhumi', zh: '缅甸' },
  },
  egyptian: {
    name: { th: 'อียิปต์โบราณ (เทพเจ้าแห่งลุ่มน้ำไนล์)', en: 'Ancient Egyptian (Deities of the Nile)', zh: '古埃及尼罗河神祇历' },
    region: { th: 'อียิปต์โบราณ / แอฟริกาเหนือ', en: 'Ancient Egypt / North Africa', zh: '古埃及 / 北非' },
  },
  aztec_mayan: {
    name: { th: 'แอซเท็กและมายา (ปฏิทินสุริยะศักดิ์สิทธิ์)', en: 'Aztec & Mayan Sacred Solar Calendar', zh: '阿兹特克与玛雅神圣太阳历' },
    region: { th: 'เมโสอเมริกา', en: 'Mesoamerica', zh: '中美洲' },
  },
  native_american: {
    name: { th: 'ชนเผ่าอินเดียแดง (โทเท็มวิญญาณแห่งธรรมชาติ)', en: 'Native American Medicine Wheel Totems', zh: '北美印第安自然灵兽图腾' },
    region: { th: 'อเมริกาเหนือ', en: 'North America', zh: '北美' },
  },
};

const SYSTEM_ITEM_NAMES_EN: Record<string, readonly string[]> = {
  chinese: [
    'Rat (Zi)', 'Ox (Chou)', 'Tiger (Yin)', 'Rabbit (Mao)', 'Dragon (Chen)', 'Snake (Si)',
    'Horse (Wu)', 'Goat (Wei)', 'Monkey (Shen)', 'Rooster (You)', 'Dog (Xu)', 'Pig (Hai)',
  ],
  western: [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ],
  thai: [
    'Chuat (Golden Rat)', 'Chalu (Royal Ox)', 'Khan (Sacred Tiger)', 'Tho (Moon Rabbit)',
    'Marong (Naga King)', 'Maseng (Jewel Serpent)', 'Mamia (Celestial Horse)', 'Mamae (Golden Goat)',
    'Wok (Hanuman Monkey)', 'Raka (Sarika Rooster)', 'Cho (Guardian Hound)', 'Kun (Auspicious White Elephant)',
  ],
  vedic: [
    'Mesha (Agni Aries)', 'Vrishabha (Surabhi Taurus)', 'Mithuna (Gemini)', 'Karka (Chandra Cancer)',
    'Simha (Narasimha Leo)', 'Kanya (Lakshmi Virgo)', 'Tula (Dharma Libra)', 'Vrishchika (Scorpio)',
    'Dhanu (Brihaspati Sagittarius)', 'Makara (Varuna Capricorn)', 'Kumbha (Amrita Aquarius)', 'Meena (Matsya Pisces)',
  ],
  islamic: [
    'Al-Hamal (Aries)', 'Al-Thawr (Taurus)', 'Al-Jawza (Gemini)', 'Al-Saratan (Cancer)',
    'Al-Asad (Leo)', 'Al-Sunbula (Virgo)', 'Al-Mizan (Libra)', 'Al-Aqrab (Scorpio)',
    'Al-Qaws (Sagittarius)', 'Al-Jady (Capricorn)', 'Al-Dalw (Aquarius)', 'Al-Hut (Pisces)',
  ],
  vietnamese: [
    'Ty (Clever Rat)', 'Suu (Water Buffalo)', 'Dan (Noble Tiger)', 'Mao (Lucky Cat)',
    'Thin (Halong Dragon)', 'Ty (Auspicious Snake)', 'Ngo (Swift Horse)', 'Mui (Mountain Goat)',
    'Than (Wise Monkey)', 'Dau (Dawn Rooster)', 'Tuat (Loyal Dog)', 'Hoi (Prosperous Pig)',
  ],
  burmese: [
    'Sunday (Galon Garuda)', 'Monday (Graceful Tiger)', 'Tuesday (Chinthe Lion)', 'Wednesday AM (Tusked Elephant)',
    'Wednesday PM / Rahu (Tuskless Elephant)', 'Thursday (Swift Rat)', 'Friday (Guinea Pig)', 'Saturday (Royal Naga)',
    'Waning Sunday (Golden Garuda)', 'Full Monday (White Guardian Tiger)', 'Great Thursday (Fortune Rat)', 'Night Saturday (Emerald Naga)',
  ],
  egyptian: [
    'The Nile (Hapi)', 'Amon-Ra', 'Mut', 'Geb', 'Osiris', 'Isis',
    'Thoth', 'Horus', 'Anubis', 'Set', 'Bastet', 'Sekhmet',
  ],
  aztec_mayan: [
    'Cipactli / Imix', 'Ehecatl / Ik', 'Calli / Akbal', 'Cuetzpalin / Kan',
    'Coatl / Chicchan', 'Miquiztli / Cimi', 'Mazatl / Manik', 'Tochtli / Lamat',
    'Atl / Muluc', 'Ocelotl / Ix', 'Cuauhtli / Men', 'Xochitl / Ahau',
  ],
  native_american: [
    'Snow Goose', 'Otter', 'Wolf', 'Red Hawk', 'Beaver', 'Deer',
    'Woodpecker', 'Sturgeon', 'Brown Bear', 'Raven', 'Snake', 'Owl',
  ],
};

const SYSTEM_ITEM_NAMES_ZH: Record<string, readonly string[]> = {
  chinese: [
    '子鼠', '丑牛', '寅虎', '卯兔', '辰龙', '巳蛇',
    '午马', '未羊', '申猴', '酉鸡', '戌狗', '亥猪',
  ],
  western: [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
  ],
  thai: [
    '子鼠 · 金鼠瑞兆', '丑牛 · 御牛神牛', '寅虎 · 威猛圣虎', '卯兔 · 玉兔迎月',
    '辰龙 · 纳迦龙王', '巳蛇 · 灵宝金蛇', '午马 · 天马骏骥', '未羊 · 聚宝金羊',
    '申猴 · 哈奴曼神猴', '酉鸡 · 吉祥金鸡', '戌狗 · 镇宅灵犬', '亥象 · 兰纳吉祥白象',
  ],
  vedic: [
    '白羊宫 (Mesha)', '金牛宫 (Vrishabha)', '双子宫 (Mithuna)', '巨蟹宫 (Karka)',
    '狮子宫 (Simha)', '处女宫 (Kanya)', '天秤宫 (Tula)', '天蝎宫 (Vrishchika)',
    '射手宫 (Dhanu)', '摩羯宫 (Makara)', '水瓶宫 (Kumbha)', '双鱼宫 (Meena)',
  ],
  islamic: [
    '白羊星宫 (Al-Hamal)', '金牛星宫 (Al-Thawr)', '双子星宫 (Al-Jawza)', '巨蟹星宫 (Al-Saratan)',
    '狮子星宫 (Al-Asad)', '室女星宫 (Al-Sunbula)', '天秤星宫 (Al-Mizan)', '天蝎星宫 (Al-Aqrab)',
    '人马星宫 (Al-Qaws)', '摩羯星宫 (Al-Jady)', '宝瓶星宫 (Al-Dalw)', '双鱼星宫 (Al-Hut)',
  ],
  vietnamese: [
    '鼠年 (Tý)', '水牛年 (Sửu)', '虎年 (Dần)', '招财猫年 (Mão)',
    '龙年 (Thìn)', '蛇年 (Tỵ)', '马年 (Ngọ)', '羊年 (Mùi)',
    '猴年 (Thân)', '鸡年 (Dậu)', '犬年 (Tuất)', '猪年 (Hợi)',
  ],
  burmese: [
    '周日 · 金翅鸟 (Galon)', '周一 · 瑞虎 (Kya)', '周二 · 圣狮 (Chinthe)', '周三上午 · 象王 (Hsin)',
    '周三晚/罗睺 · 无牙圣象', '周四 · 灵鼠 (Kywe)', '周五 · 祥豚 (Puta)', '周六 · 纳迦龙 (Naga)',
    '周日亏月 · 金羽迦楼罗', '周一满月 · 护法白虎', '周四大吉 · 聚财金鼠', '周六星夜 · 碧玉龙王',
  ],
  egyptian: [
    '尼罗河神 (Hapi)', '太阳神阿蒙拉 (Amon-Ra)', '天空女神穆特 (Mut)', '大地之神盖布 (Geb)',
    '冥王奥西里斯 (Osiris)', '魔法女神伊西斯 (Isis)', '智慧神托特 (Thoth)', '鹰神荷鲁斯 (Horus)',
    '冥界守护阿努比斯 (Anubis)', '风暴之神赛特 (Set)', '猫神巴斯特 (Bastet)', '狮首战神塞赫迈特 (Sekhmet)',
  ],
  aztec_mayan: [
    '太初鳄神 (Cipactli)', '天风羽神 (Ehecatl)', '太阳圣殿 (Calli)', '烈阳灵蜥 (Cuetzpalin)',
    '羽蛇神 (Quetzalcoatl)', '蜕变灵骷 (Miquiztli)', '圣林神鹿 (Mazatl)', '月宫玉兔 (Tochtli)',
    '圣水甘霖 (Atl)', '夜行美洲豹 (Ocelotl)', '太阳金鹰 (Cuauhtli)', '天堂花环 (Xochitl)',
  ],
  native_american: [
    '雪雁图腾 (Snow Goose)', '水獭图腾 (Otter)', '灵狼图腾 (Wolf)', '红鹰图腾 (Red Hawk)',
    '河狸图腾 (Beaver)', '森鹿图腾 (Deer)', '啄木鸟图腾 (Woodpecker)', '鲟鱼图腾 (Sturgeon)',
    '棕熊图腾 (Brown Bear)', '渡鸦图腾 (Raven)', '圣蛇图腾 (Snake)', '夜鸮图腾 (Owl)',
  ],
};

function translateElementString(el: string, lang: SupportedLang): string {
  if (lang === 'th') return el;
  const s = el.toLowerCase();
  if (s.includes('ไฟ') || s.includes('อัคนี') || s.includes('สุริย') || s.includes('เตชัส')) {
    return lang === 'en' ? 'Fire' : '火行';
  }
  if (s.includes('น้ำ') || s.includes('วารี')) {
    return lang === 'en' ? 'Water' : '水行';
  }
  if (s.includes('ดิน') || s.includes('ปฐพี') || s.includes('ปฤถวี')) {
    return lang === 'en' ? 'Earth' : '土行';
  }
  if (s.includes('ลม') || s.includes('วายุ')) {
    return lang === 'en' ? 'Air / Wind' : '风行';
  }
  if (s.includes('ไม้')) {
    return lang === 'en' ? 'Wood' : '木行';
  }
  if (s.includes('ทอง') || s.includes('โลหะ')) {
    return lang === 'en' ? 'Metal / Gold' : '金行';
  }
  return lang === 'en' ? 'Celestial Spirit' : '圣灵五行';
}

export function getLocalizedZodiacSystem(
  sys: ZodiacSystem,
  lang: SupportedLang
): { name: string; region: string } {
  if (lang === 'th') {
    return { name: sys.name, region: sys.region };
  }
  const loc = ZODIAC_SYSTEM_LOCALES[sys.id];
  if (!loc) return { name: sys.name, region: sys.region };
  return {
    name: loc.name[lang],
    region: loc.region[lang],
  };
}

export function getLocalizedZodiacItem(
  item: ZodiacItem,
  systemId: string,
  lang: SupportedLang
): { name: string; primaryLabel: string; secondaryLabel: string | null; element: string } {
  if (lang === 'th') {
    const primary = item.origName || item.name;
    const secondary = item.origName && item.name !== item.origName ? item.name : null;
    return {
      name: item.name,
      primaryLabel: primary,
      secondaryLabel: secondary,
      element: item.element,
    };
  }
  const list = lang === 'en' ? SYSTEM_ITEM_NAMES_EN[systemId] : SYSTEM_ITEM_NAMES_ZH[systemId];
  const localizedName = list?.[item.id] || item.origName || item.name;
  const primary = item.origName || localizedName;
  const secondary = item.origName && localizedName !== item.origName ? localizedName : null;
  return {
    name: localizedName,
    primaryLabel: primary,
    secondaryLabel: secondary,
    element: translateElementString(item.element, lang),
  };
}

