// High-fidelity Lucky Card Canvas Generator
// Renders an authentic, ornate gold-embossed divination card for social sharing and saving

import { drawRoundedRect } from './canvasUtils';
import type { SupportedLang } from '../data/locales/types';

export interface CardData {
  type: 'stick' | 'tarot' | 'number' | 'remedy' | 'scan' | 'auspicious';
  title: string;
  subtitle?: string;
  dateStr?: string;
  systemName?: string;
  symbolName?: string;
  symbolIcon?: string;
  element?: string;
  aura?: string;
  details: {
    stickNumber?: number;
    fortuneTitle?: string;
    aspects?: {
      finance?: string;
      love?: string;
      health?: string;
      career?: string;
    };
    poem?: string;
    tarotCards?: Array<{
      name: string;
      nameEn?: string;
      glyph?: string;
      reversed?: boolean;
      position?: string;
    }>;
    luckyNumbers?: {
      twoDigits?: string[];
      threeDigits?: string[];
    };
    remedyInfo?: {
      clashType?: string;
      yearName?: string;
      advice?: string;
    };
    auspiciousInfo?: {
      dateFormatted?: string;
      lunarDate?: string;
      thaiRukName?: string;
      thaiRukMeaning?: string;
      kalaYoga?: string;
      category?: string;
      bestHours?: string;
      direction?: string;
      luckyColors?: string;
      ceremonyTip?: string;
    };
  };
}

const CANVAS_STRINGS: Record<SupportedLang, {
  headerBanner: string;
  subBanner: string;
  datePrefix: string;
  dateLocale: string;
  elementPrefix: string;
  elementDefault: string;
  stickLabel: string;
  stickNumPrefix: string;
  stickDefaultTitle: string;
  aspectFinanceLabel: string;
  aspectFinanceDef: string;
  aspectLoveLabel: string;
  aspectLoveDef: string;
  aspectHealthLabel: string;
  aspectHealthDef: string;
  aspectCareerLabel: string;
  aspectCareerDef: string;
  stickQuote: string;
  tarotDefaultTitle: string;
  cardWord: string;
  tarotReversed: string;
  tarotUpright: string;
  tarotSummaryTitle: string;
  tarotSummaryLine1: string;
  tarotSummaryLine2: string;
  numHeader: string;
  numCatBoth: string;
  numCat2: string;
  numCat3: string;
  numBurnOk: string;
  numTipsTitle: string;
  numTip1: string;
  numTip2: string;
  numTip3: string;
  numTip4: string;
  auspHeader: string;
  auspCatLabel: string;
  auspCatDef: string;
  auspTimeLabel: string;
  auspTimeDef: string;
  auspDirLabel: string;
  auspDirDef: string;
  auspColorLabel: string;
  auspColorDef: string;
  auspTipTitle: string;
  auspTipDef: string;
  auspBlessingFooter: string;
  remedyHeader: string;
  remedyTitle: string;
  remedyLine1: string;
  remedyLine2: string;
  remedyLine3: string;
  sealText: string;
  footerText: string;
}> = {
  th: {
    headerBanner: '🏮  ศ า ล เ จ้ า แ ห่ ง โ ช ค ล า ภ  🏮',
    subBanner: 'LUCKY SHRINE · SACRED FORTUNE CARD',
    datePrefix: 'บันทึกชะตา ณ วันที่',
    dateLocale: 'th-TH',
    elementPrefix: 'ธาตุ',
    elementDefault: 'มงคล',
    stickLabel: 'ใบเซียมซีมงคล',
    stickNumPrefix: 'ที่ ',
    stickDefaultTitle: 'มั่งมีศรีสุข โชคลาภบารมี',
    aspectFinanceLabel: '💰 การเงิน & โชคลาภ',
    aspectFinanceDef: 'มีเกณฑ์ได้รับลาภลอย การเงินคล่องตัว',
    aspectLoveLabel: '💖 ความรัก & วาสนา',
    aspectLoveDef: 'คนโสดพบมิตรดี คนมีคู่เกื้อหนุนกัน',
    aspectHealthLabel: '🌿 สุขภาพ & ร่างกาย',
    aspectHealthDef: 'แข็งแรง สดชื่น ปราศจากโรคภัยเบียดเบียน',
    aspectCareerLabel: '⚖️ การงาน & ธุรกิจ',
    aspectCareerDef: 'เจริญก้าวหน้า มีผู้ใหญ่คอยอุปถัมภ์',
    stickQuote: '“ตั้งมั่นในความดี มีสติครองตน เทพยดาจะคุ้มครอง”',
    tarotDefaultTitle: 'ไพ่ยิปซีเปิดลิขิตชะตา',
    cardWord: 'ใบที่',
    tarotReversed: 'ไพ่กลับหัว (Reversed)',
    tarotUpright: 'ไพ่หัวตั้ง (Upright)',
    tarotSummaryTitle: 'ภาพรวมสารจากไพ่ทาโรต์',
    tarotSummaryLine1: 'พลังงานชะตากำลังผลักดันให้เกิดการเปลี่ยนแปลงในทางที่ดี',
    tarotSummaryLine2: 'จงเชื่อมั่นในสัญชาตญาณและความพากเพียรของตนเอง',
    numHeader: 'เลขมงคลบันดาลโชค',
    numCatBoth: 'เลขเด่นประทานพร',
    numCat2: 'เลขท้าย 2 ตัวมงคล',
    numCat3: 'เลขท้าย 3 ตัวมงคล',
    numBurnOk: '✨ ยันต์มอดไหม้สมบูรณ์ ปลดล็อกพลังตัวเลข 100%',
    numTipsTitle: '🌟 เคล็ดลับเสริมดวงมงคล:',
    numTip1: '• วันมงคลประจำสัปดาห์: วันพฤหัสบดี และ วันอาทิตย์',
    numTip2: '• สีกาลกิณีควรเลี่ยง: ดำสนิท / สีมงคลเสริมโชค: สีทองและสีเขียวมรกต',
    numTip3: '• ทิศมงคลในการเจรจาค้าขาย: ทิศตะวันออกเฉียงเหนือ',
    numTip4: '• ทำบุญปล่อยปลา หรือบริจาคโลหิตเพื่อเสริมสง่าราศี',
    auspHeader: 'ฤกษ์งามยามดีมหามงคล',
    auspCatLabel: '🏷️ เหมาะสำหรับงาน:',
    auspCatDef: 'ทุกงานมงคล',
    auspTimeLabel: '⏰ ช่วงเวลายามมงคล:',
    auspTimeDef: '09:09 - 10:39 น.',
    auspDirLabel: '🧭 ทิศมงคลนำฤกษ์:',
    auspDirDef: 'ทิศตะวันออก (ทิศศรี)',
    auspColorLabel: '🎨 สีมงคลเสริมโชค:',
    auspColorDef: 'สีทอง / สีเขียวมรกต',
    auspTipTitle: '📜 เคล็ดพิธีเสริมสิริมงคล:',
    auspTipDef: 'จุดธูป ๙ ดอก อธิษฐานจิตตั้งมั่น บูชาพระรัตนตรัยและเทพยดาอำนวยพร',
    auspBlessingFooter: 'ขอความสำเร็จ ความเจริญรุ่งเรือง ไร้อุปสรรค จงบังเกิดแก่ท่าน',
    remedyHeader: 'ยันต์คุ้มครองสะเดาะเคราะห์',
    remedyTitle: 'พุทธานุภาพคุ้มครอง ปัดเป่าอุปสรรค',
    remedyLine1: 'ดวงชะตาของท่านได้รับการหนุนนำด้วยกุศลบารมี',
    remedyLine2: 'เคราะห์หนักจักกลายเป็นเบา เคราะห์เบาจักมลายหายสูญ',
    remedyLine3: 'หมั่นสวดมนต์ แผ่เมตตา และทำจิตใจให้ผ่องใส',
    sealText: 'มั่งมี ศรีสุข · 吉祥如意',
    footerText: 'ศาลเจ้าแห่งโชคลาภ (Lucky Shrine) · ประมวลผลในเครื่อง 100% เพื่อความบันเทิง',
  },
  en: {
    headerBanner: '🏮  L U C K Y   S H R I N E  🏮',
    subBanner: 'SACRED FORTUNE ORACLE CARD',
    datePrefix: 'Recorded on',
    dateLocale: 'en-US',
    elementPrefix: '',
    elementDefault: 'Auspicious Element',
    stickLabel: 'SACRED FORTUNE STICK',
    stickNumPrefix: '#',
    stickDefaultTitle: 'Abundance, Peace & Good Fortune',
    aspectFinanceLabel: '💰 Wealth & Fortune',
    aspectFinanceDef: 'Steady financial flow with pleasant surprises.',
    aspectLoveLabel: '💖 Love & Harmony',
    aspectLoveDef: 'Warm connections and mutual support blossom.',
    aspectHealthLabel: '🌿 Health & Vitality',
    aspectHealthDef: 'Refreshed energy and balanced wellbeing.',
    aspectCareerLabel: '⚖️ Career & Endeavors',
    aspectCareerDef: 'Steady progress backed by helpful mentors.',
    stickQuote: '“Walk in virtue with a calm heart, and good fortune follows.”',
    tarotDefaultTitle: 'Tarot Destiny Spread',
    cardWord: 'Card',
    tarotReversed: 'Reversed',
    tarotUpright: 'Upright',
    tarotSummaryTitle: 'Tarot Reading Insight',
    tarotSummaryLine1: 'Favorable currents are gently guiding meaningful transformation.',
    tarotSummaryLine2: 'Trust your intuition and keep moving forward with patience.',
    numHeader: 'SACRED LUCKY NUMBERS',
    numCatBoth: 'BLESSED ORACLE NUMBERS',
    numCat2: 'LUCKY 2-DIGIT SEAL',
    numCat3: 'LUCKY 3-DIGIT SEAL',
    numBurnOk: '✨ Talisman ritual complete · Oracle numbers revealed 100%',
    numTipsTitle: '🌟 Daily Auspicious Guidance:',
    numTip1: '• Auspicious Days of the Week: Thursday & Sunday',
    numTip2: '• Lucky Colors: Imperial Gold & Emerald Green',
    numTip3: '• Favorable Direction: Northeast',
    numTip4: '• Share kindness or make merit to nurture peace and clarity',
    auspHeader: 'AUSPICIOUS TIMING & BLESSING',
    auspCatLabel: '🏷️ Ideal For:',
    auspCatDef: 'All Auspicious Ceremonies',
    auspTimeLabel: '⏰ Prime Window:',
    auspTimeDef: '09:09 - 10:39 AM',
    auspDirLabel: '🧭 Lucky Direction:',
    auspDirDef: 'East (Sri Direction)',
    auspColorLabel: '🎨 Lucky Colors:',
    auspColorDef: 'Gold / Emerald Green',
    auspTipTitle: '📜 Ceremony Blessing Note:',
    auspTipDef: 'Light incense mindfully and dedicate merit for peace and harmony.',
    auspBlessingFooter: 'May success, serenity, and smooth progress be with you.',
    remedyHeader: 'SACRED PROTECTION TALISMAN',
    remedyTitle: 'Protected by Grace · Clear of Obstacles',
    remedyLine1: 'Your path is uplifted by mindful merit and calm intention.',
    remedyLine2: 'Heavy burdens soften, and lingering worries gently dissolve.',
    remedyLine3: 'Practice gratitude, loving-kindness, and inner stillness.',
    sealText: 'PROSPERITY & PEACE · 吉祥如意',
    footerText: 'Lucky Shrine · 100% On-Device Client Processing for Entertainment',
  },
  zh: {
    headerBanner: '🏮  吉 祥 福 禄 灵 签 阁  🏮',
    subBanner: 'LUCKY SHRINE · 专属开运灵符',
    datePrefix: '录运日期：',
    dateLocale: 'zh-CN',
    elementPrefix: '',
    elementDefault: '吉祥元素',
    stickLabel: '御守吉祥灵签',
    stickNumPrefix: '第 ',
    stickDefaultTitle: '福寿安康 · 财源广进',
    aspectFinanceLabel: '💰 财运与福禄',
    aspectFinanceDef: '财气聚拢，偏正财皆见顺遂流通之象。',
    aspectLoveLabel: '💖 姻缘与人际',
    aspectLoveDef: '单身宜遇良缘，伴侣彼此扶持和顺。',
    aspectHealthLabel: '🌿 健康与元气',
    aspectHealthDef: '精力充沛安泰，宜保持作息舒心。',
    aspectCareerLabel: '⚖️ 事业与功名',
    aspectCareerDef: '稳步攀升，易遇贵人赏识与提携。',
    stickQuote: '“存善念、守正心，诸神护佑吉祥长随。”',
    tarotDefaultTitle: '塔罗秘境指引',
    cardWord: '第',
    tarotReversed: '逆位（Reversed）',
    tarotUpright: '正位（Upright）',
    tarotSummaryTitle: '塔罗牌阵总览指引',
    tarotSummaryLine1: '吉运能量正推动局势朝着光明与转机稳步迈进',
    tarotSummaryLine2: '请相信内心的直觉与日复一日的笃定耕耘',
    numHeader: '灵符赐福开运数',
    numCatBoth: '星象赐福吉数',
    numCat2: '二位数幸运灵码',
    numCat3: '三位数幸运灵码',
    numBurnOk: '✨ 灵符化烬圆满 · 100% 解锁专属幸运吉数',
    numTipsTitle: '🌟 日常开运护身锦囊：',
    numTip1: '• 本周吉祥日：星期四、星期日',
    numTip2: '• 宜避重色：纯黑 / 开运旺色：皇室金、祖母绿',
    numTip3: '• 洽谈招财吉方：东北方',
    numTip4: '• 随喜行善布施或静心祈福，更添福慧祥瑞',
    auspHeader: '良辰吉日御守金卡',
    auspCatLabel: '🏷️ 宜办吉事：',
    auspCatDef: '诸事皆宜',
    auspTimeLabel: '⏰ 黄金吉时：',
    auspTimeDef: '09:09 - 10:39',
    auspDirLabel: '🧭 开运吉方：',
    auspDirDef: '正东 / 东北喜神方',
    auspColorLabel: '🎨 幸运旺色：',
    auspColorDef: '金色 / 祖母绿',
    auspTipTitle: '📜 祈福仪式锦囊：',
    auspTipDef: '诚心焚香祈愿，广积善缘，诸神庇佑合家安康。',
    auspBlessingFooter: '愿顺遂圆满、福禄安康与您常伴左右',
    remedyHeader: '太岁护身消灾灵符',
    remedyTitle: '诸佛护佑 · 化煞呈祥',
    remedyLine1: '您的运势正得善德福慧护持照拂',
    remedyLine2: '重厄化轻，轻忧自散，诸障悉皆消融',
    remedyLine3: '常怀慈悲感恩，静心正念则万事安泰',
    sealText: '招财进宝 · 吉祥如意',
    footerText: 'Lucky Shrine · 100% 本地隐私运算 · 仅供休闲祈福娱乐',
  },
};

export async function generateLuckyCardBlob(
  data: CardData,
  lang: SupportedLang = 'th'
): Promise<Blob> {
  const L = CANVAS_STRINGS[lang];
  const canvas = document.createElement('canvas');
  const width = 900;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // 1. Background gradient (Deep temple lacquer red & cosmic gold darkness)
  const bgGrad = ctx.createRadialGradient(
    width / 2, height * 0.35, 100,
    width / 2, height / 2, 850
  );
  bgGrad.addColorStop(0, '#2e0f0f');
  bgGrad.addColorStop(0.5, '#190807');
  bgGrad.addColorStop(1, '#0c0403');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle background star dust / golden embers
  ctx.fillStyle = 'rgba(232, 185, 74, 0.12)';
  for (let i = 0; i < 60; i++) {
    const x = ((i * 137) % width);
    const y = ((i * 269) % height);
    const r = (i % 3) + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Outer and Inner Ornate Gold Borders
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Corner decorative knots
  const drawCornerKnot = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#e8b94a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, 0);
    ctx.lineTo(26, 26);
    ctx.lineTo(0, 26);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(13, 13, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  drawCornerKnot(48, 48, 0);
  drawCornerKnot(width - 48, 48, Math.PI / 2);
  drawCornerKnot(width - 48, height - 48, Math.PI);
  drawCornerKnot(48, height - 48, -Math.PI / 2);

  // 3. Header Section
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff8a1f';
  ctx.font = '34px serif';
  ctx.fillText(L.headerBanner, width / 2, 110);

  ctx.fillStyle = '#d4af37';
  ctx.font = '600 18px "Noto Sans Thai", sans-serif';
  ctx.fillText(L.subBanner, width / 2, 142);

  // Date banner
  const dateStr = data.dateStr || new Date().toLocaleDateString(L.dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillStyle = '#cdb995';
  ctx.font = '15px "Noto Sans Thai", sans-serif';
  ctx.fillText(`${L.datePrefix} ${dateStr}`.trim(), width / 2, 172);

  // Top divider line
  ctx.strokeStyle = 'rgba(232, 185, 74, 0.35)';
  ctx.beginPath();
  ctx.moveTo(120, 195);
  ctx.lineTo(width - 120, 195);
  ctx.stroke();

  // 4. User Guardian Badge
  if (data.systemName || data.symbolName) {
    const badgeY = 236;
    ctx.fillStyle = 'rgba(46, 20, 16, 0.9)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 100, badgeY - 26, width - 200, 52, [26]);
    ctx.fill();
    ctx.stroke();

    const elemLabel = `${L.elementPrefix}${data.element || L.elementDefault}`;
    const identityText = `${data.symbolIcon || '✨'} ${data.systemName || ''} · ${data.symbolName || ''} (${elemLabel})`;
    ctx.fillStyle = '#f6ead2';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(identityText, width / 2, badgeY + 7);
  }

  // 5. Content Section by Type
  if (data.type === 'stick') {
    const stickNum = data.details.stickNumber || 1;
    // Red Lacquer Plate for Stick Number
    ctx.fillStyle = '#8b1010';
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, width / 2 - 130, 290, 260, 95, [18]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffe082';
    ctx.font = '16px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.stickLabel, width / 2, 322);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Noto Sans Thai", serif';
    ctx.fillText(`${L.stickNumPrefix}${stickNum}${lang === 'zh' ? ' 号' : ''}`, width / 2, 368);

    // Title / Grade
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Sans Thai", serif';
    ctx.fillText(data.details.fortuneTitle || L.stickDefaultTitle, width / 2, 440);

    // 4 Aspects Grid Box
    const boxX = 80;
    const boxY = 475;
    const boxW = width - 160;
    const boxH = 410;

    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, [16]);
    ctx.fill();
    ctx.stroke();

    const aspects = [
      { label: L.aspectFinanceLabel, val: data.details.aspects?.finance || L.aspectFinanceDef },
      { label: L.aspectLoveLabel, val: data.details.aspects?.love || L.aspectLoveDef },
      { label: L.aspectHealthLabel, val: data.details.aspects?.health || L.aspectHealthDef },
      { label: L.aspectCareerLabel, val: data.details.aspects?.career || L.aspectCareerDef },
    ];

    aspects.forEach((asp, idx) => {
      const itemY = boxY + 45 + idx * 92;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffcf70';
      ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
      ctx.fillText(asp.label, boxX + 30, itemY);

      ctx.fillStyle = '#fdf1d8';
      ctx.font = '17px "Noto Sans Thai", sans-serif';
      const clipped = asp.val.length > 62 ? asp.val.slice(0, 59) + '...' : asp.val;
      ctx.fillText(clipped, boxX + 30, itemY + 30);

      if (idx < aspects.length - 1) {
        ctx.strokeStyle = 'rgba(232, 185, 74, 0.15)';
        ctx.beginPath();
        ctx.moveTo(boxX + 25, itemY + 54);
        ctx.lineTo(boxX + boxW - 25, itemY + 54);
        ctx.stroke();
      }
    });

    // Poem / Summary Quote
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8b94a';
    ctx.font = 'italic 18px "Noto Sans Thai", serif';
    ctx.fillText(L.stickQuote, width / 2, 930);
  } else if (data.type === 'tarot') {
    // Tarot Cards
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Noto Sans Thai", serif';
    ctx.fillText(data.title || L.tarotDefaultTitle, width / 2, 310);

    const cards = data.details.tarotCards || [];
    const count = Math.min(cards.length, 3);
    const cardW = 210;
    const cardH = 340;
    const gap = 30;
    const startX = (width - (count * cardW + (count - 1) * gap)) / 2;

    cards.slice(0, 3).forEach((card, idx) => {
      const cX = startX + idx * (cardW + gap);
      const cY = 350;

      // Card frame
      ctx.fillStyle = 'rgba(32, 16, 24, 0.9)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, cX, cY, cardW, cardH, [12]);
      ctx.fill();
      ctx.stroke();

      // Position title
      ctx.fillStyle = '#e8b94a';
      ctx.font = '14px "Noto Sans Thai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.position || `${L.cardWord} ${idx + 1}`, cX + cardW / 2, cY + 32);

      // Glyph
      ctx.font = '54px serif';
      ctx.fillText(card.glyph || '🔮', cX + cardW / 2, cY + 130);

      // Card name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px "Noto Sans Thai", sans-serif';
      const displayCardName = card.name.length > 20 ? card.name.slice(0, 18) + '…' : card.name;
      ctx.fillText(displayCardName, cX + cardW / 2, cY + 220);

      // Status Upright / Reversed
      ctx.fillStyle = card.reversed ? '#ff8a1f' : '#7fd99a';
      ctx.font = '14px "Noto Sans Thai", sans-serif';
      ctx.fillText(card.reversed ? L.tarotReversed : L.tarotUpright, cX + cardW / 2, cY + 260);
    });

    // Tarot interpretation summary box
    const boxX = 80;
    const boxY = 730;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, boxX, boxY, width - 160, 180, [14]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.tarotSummaryTitle, width / 2, boxY + 45);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.tarotSummaryLine1, width / 2, boxY + 85);
    ctx.fillText(L.tarotSummaryLine2, width / 2, boxY + 120);
  } else if (data.type === 'number') {
    // Lucky Numbers
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Sans Thai", serif';
    ctx.fillText(L.numHeader, width / 2, 310);

    // Golden Seal Box
    const sealX = width / 2 - 200;
    const sealY = 360;
    ctx.fillStyle = '#1c0a0a';
    ctx.strokeStyle = '#ffb84d';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, sealX, sealY, 400, 240, [24]);
    ctx.fill();
    ctx.stroke();

    const twoDigit = data.details.luckyNumbers?.twoDigits?.[0];
    const threeDigit = data.details.luckyNumbers?.threeDigits?.[0];

    let numberDisplayText = '';
    let categoryLabel = L.numCatBoth;
    if (twoDigit && threeDigit) {
      numberDisplayText = `${twoDigit}   ·   ${threeDigit}`;
    } else if (twoDigit) {
      categoryLabel = L.numCat2;
      numberDisplayText = twoDigit;
    } else if (threeDigit) {
      categoryLabel = L.numCat3;
      numberDisplayText = threeDigit;
    } else {
      numberDisplayText = '89   ·   728';
    }

    ctx.fillStyle = '#e8b94a';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText(categoryLabel, width / 2, sealY + 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px "Chonburi", "Noto Serif Thai", serif';
    ctx.fillText(numberDisplayText, width / 2, sealY + 135);

    ctx.fillStyle = '#7fd99a';
    ctx.font = '15px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.numBurnOk, width / 2, sealY + 195);

    // Tips Box
    const tipY = 640;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 80, tipY, width - 160, 250, [16]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.numTipsTitle, 115, tipY + 45);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.numTip1, 115, tipY + 90);
    ctx.fillText(L.numTip2, 115, tipY + 135);
    ctx.fillText(L.numTip3, 115, tipY + 180);
    ctx.fillText(L.numTip4, 115, tipY + 220);
  } else if (data.type === 'auspicious') {
    const info = data.details.auspiciousInfo;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px "Chonburi", "Noto Serif Thai", serif';
    ctx.fillText(L.auspHeader, width / 2, 320);

    const boxY = 360;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.9)';
    ctx.strokeStyle = '#e8b94a';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, 70, boxY, width - 140, 520, [20]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(232, 185, 74, 0.15)';
    drawRoundedRect(ctx, 90, boxY + 20, width - 180, 70, [12]);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.dateFormatted || data.title, width / 2, boxY + 50);

    ctx.fillStyle = '#ffcf70';
    ctx.font = '16px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.lunarDate || '', width / 2, boxY + 74);

    // Thai Ruk Badge & Meaning
    ctx.fillStyle = '#e8b94a';
    ctx.font = 'bold 26px "Chonburi", "Noto Serif Thai", serif';
    ctx.fillText(`✨ ${info?.thaiRukName || ''} ✨`, width / 2, boxY + 130);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '16px "Noto Sans Thai", sans-serif';
    const meaningText = info?.thaiRukMeaning || '';
    ctx.fillText(meaningText.length > 62 ? meaningText.slice(0, 59) + '...' : meaningText, width / 2, boxY + 165);

    // Details Grid
    ctx.textAlign = 'left';
    const gridY = boxY + 205;
    const leftX = 105;

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.auspCatLabel, leftX, gridY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    const catStr = info?.category || L.auspCatDef;
    ctx.fillText(catStr.length > 42 ? catStr.slice(0, 39) + '...' : catStr, leftX + 185, gridY);

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.auspTimeLabel, leftX, gridY + 45);
    ctx.fillStyle = '#7fd99a';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.bestHours || L.auspTimeDef, leftX + 185, gridY + 45);

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.auspDirLabel, leftX, gridY + 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.direction || L.auspDirDef, leftX + 185, gridY + 90);

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.auspColorLabel, leftX, gridY + 135);
    ctx.fillStyle = '#ffd24a';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.luckyColors || L.auspColorDef, leftX + 185, gridY + 135);

    // Bottom Blessing Note
    ctx.fillStyle = 'rgba(232, 185, 74, 0.08)';
    drawRoundedRect(ctx, 95, gridY + 170, width - 190, 110, [10]);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb84d';
    ctx.font = 'bold 16px "Noto Sans Thai", sans-serif';
    ctx.fillText(L.auspTipTitle, width / 2, gridY + 200);

    ctx.fillStyle = '#ecdcc1';
    ctx.font = '15px "Noto Sans Thai", sans-serif';
    const tipText = info?.ceremonyTip || L.auspTipDef;
    ctx.fillText(tipText.length > 58 ? tipText.substring(0, 55) + '...' : tipText, width / 2, gridY + 235);
    ctx.fillText(L.auspBlessingFooter, width / 2, gridY + 260);
  } else {
    // Remedy / Sacred Journey / Other
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Sans Thai", serif';
    ctx.fillText(data.title || L.remedyHeader, width / 2, 320);

    const boxY = 380;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 80, boxY, width - 160, 500, [16]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '60px serif';
    ctx.fillText('☯️', width / 2, boxY + 80);

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 24px "Noto Sans Thai", serif';
    ctx.fillText(data.details.remedyInfo?.yearName || L.remedyTitle, width / 2, boxY + 150);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    if (data.details.remedyInfo?.clashType || data.details.remedyInfo?.advice) {
      const line1 = data.details.remedyInfo.clashType || L.remedyLine1;
      const line2 = data.details.remedyInfo.advice || L.remedyLine2;
      ctx.fillText(line1.length > 62 ? line1.slice(0, 59) + '...' : line1, width / 2, boxY + 215);
      ctx.fillText(line2.length > 62 ? line2.slice(0, 59) + '...' : line2, width / 2, boxY + 260);
      ctx.fillText(L.remedyLine3, width / 2, boxY + 305);
    } else {
      ctx.fillText(L.remedyLine1, width / 2, boxY + 210);
      ctx.fillText(L.remedyLine2, width / 2, boxY + 250);
      ctx.fillText(L.remedyLine3, width / 2, boxY + 290);
    }
  }

  // 6. Bottom Auspicious Seal & Certification
  const sealBottomY = height - 170;

  ctx.fillStyle = 'rgba(179, 38, 30, 0.9)';
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, width / 2 - 125, sealBottomY - 10, 250, 50, [10]);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 17px "Noto Serif Thai", serif';
  ctx.fillText(L.sealText, width / 2, sealBottomY + 23);

  // Footer Disclaimer
  ctx.fillStyle = 'rgba(205, 185, 149, 0.7)';
  ctx.font = '13px "Noto Sans Thai", sans-serif';
  ctx.fillText(L.footerText, width / 2, height - 75);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png', 0.95);
  });
}

