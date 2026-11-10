// High-fidelity Lucky Card Canvas Generator
// Renders an authentic, ornate gold-embossed divination card for social sharing and saving

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

export async function generateLuckyCardBlob(data: CardData): Promise<Blob> {
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
  ctx.fillText('🏮  ศ า ล เ จ้ า แ ห่ ง โ ช ค ล า ภ  🏮', width / 2, 110);

  ctx.fillStyle = '#d4af37';
  ctx.font = '600 18px "Noto Sans Thai", sans-serif';
  ctx.fillText('LUCKY SHRINE · SACRED FORTUNE CARD', width / 2, 142);

  // Date banner
  const dateStr = data.dateStr || new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillStyle = '#cdb995';
  ctx.font = '15px "Noto Sans Thai", sans-serif';
  ctx.fillText(`บันทึกชะตา ณ วันที่ ${dateStr}`, width / 2, 172);

  // Top divider line with diamond emblem
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
    ctx.beginPath();
    ctx.roundRect(100, badgeY - 26, width - 200, 52, [26]);
    ctx.fill();
    ctx.stroke();

    const identityText = `${data.symbolIcon || '✨'} ${data.systemName || ''} · ${data.symbolName || ''} (ธาตุ${data.element || 'มงคล'})`;
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
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, 290, 260, 95, [18]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffe082';
    ctx.font = '16px "Noto Sans Thai", sans-serif';
    ctx.fillText('ใบเซียมซีมงคล', width / 2, 322);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Noto Sans Thai", serif';
    ctx.fillText(`ที่  ${stickNum}`, width / 2, 368);

    // Title / Grade
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Sans Thai", serif';
    ctx.fillText(data.details.fortuneTitle || 'มั่งมีศรีสุข โชคลาภบารมี', width / 2, 440);

    // 4 Aspects Grid Box
    const boxX = 80;
    const boxY = 475;
    const boxW = width - 160;
    const boxH = 410;

    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, [16]);
    ctx.fill();
    ctx.stroke();

    const aspects = [
      { label: '💰 การเงิน & โชคลาภ', val: data.details.aspects?.finance || 'มีเกณฑ์ได้รับลาภลอย การเงินคล่องตัว' },
      { label: '💖 ความรัก & วาสนา', val: data.details.aspects?.love || 'คนโสดพบมิตรดี คนมีคู่เกื้อหนุนกัน' },
      { label: '🌿 สุขภาพ & ร่างกาย', val: data.details.aspects?.health || 'แข็งแรง สดชื่น ปราศจากโรคภัยเบียดเบียน' },
      { label: '⚖️ การงาน & ธุรกิจ', val: data.details.aspects?.career || 'เจริญก้าวหน้า มีผู้ใหญ่คอยอุปถัมภ์' },
    ];

    aspects.forEach((asp, idx) => {
      const itemY = boxY + 45 + idx * 92;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffcf70';
      ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
      ctx.fillText(asp.label, boxX + 30, itemY);

      ctx.fillStyle = '#fdf1d8';
      ctx.font = '17px "Noto Sans Thai", sans-serif';
      // Wrap text if needed
      ctx.fillText(asp.val, boxX + 30, itemY + 30);

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
    ctx.fillText('“ตั้งมั่นในความดี มีสติครองตน เทพยดาจะคุ้มครอง”', width / 2, 930);
  } else if (data.type === 'tarot') {
    // Tarot Cards
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Noto Sans Thai", serif';
    ctx.fillText(data.title || 'ไพ่ยิปซีเปิดลิขิตชะตา', width / 2, 310);

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
      ctx.beginPath();
      ctx.roundRect(cX, cY, cardW, cardH, [12]);
      ctx.fill();
      ctx.stroke();

      // Position title
      ctx.fillStyle = '#e8b94a';
      ctx.font = '14px "Noto Sans Thai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.position || `ใบที่ ${idx + 1}`, cX + cardW / 2, cY + 32);

      // Glyph
      ctx.font = '54px serif';
      ctx.fillText(card.glyph || '🔮', cX + cardW / 2, cY + 130);

      // Card name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
      ctx.fillText(card.name, cX + cardW / 2, cY + 220);

      // Status Upright / Reversed
      ctx.fillStyle = card.reversed ? '#ff8a1f' : '#7fd99a';
      ctx.font = '14px "Noto Sans Thai", sans-serif';
      ctx.fillText(card.reversed ? 'ไพ่กลับหัว (Reversed)' : 'ไพ่หัวตั้ง (Upright)', cX + cardW / 2, cY + 260);
    });

    // Tarot interpretation summary box
    const boxX = 80;
    const boxY = 730;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, width - 160, 180, [14]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
    ctx.fillText('ภาพรวมสารจากไพ่ทาโรต์', width / 2, boxY + 45);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    ctx.fillText('พลังงานชะตากำลังผลักดันให้เกิดการเปลี่ยนแปลงในทางที่ดี', width / 2, boxY + 85);
    ctx.fillText('จงเชื่อมั่นในสัญชาตญาณและความพากเพียรของตนเอง', width / 2, boxY + 120);
  } else if (data.type === 'number') {
    // Lucky Numbers
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Sans Thai", serif';
    ctx.fillText('เลขมงคลบันดาลโชค', width / 2, 310);

    // Golden Seal Box
    const sealX = width / 2 - 200;
    const sealY = 360;
    ctx.fillStyle = '#1c0a0a';
    ctx.strokeStyle = '#ffb84d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(sealX, sealY, 400, 240, [24]);
    ctx.fill();
    ctx.stroke();

    const twoDigit = data.details.luckyNumbers?.twoDigits?.[0];
    const threeDigit = data.details.luckyNumbers?.threeDigits?.[0];

    let numberDisplayText = '';
    let categoryLabel = 'เลขเด่นประทานพร';
    if (twoDigit && threeDigit) {
      numberDisplayText = `${twoDigit}   ·   ${threeDigit}`;
    } else if (twoDigit) {
      categoryLabel = 'เลขท้าย 2 ตัวมงคล';
      numberDisplayText = twoDigit;
    } else if (threeDigit) {
      categoryLabel = 'เลขท้าย 3 ตัวมงคล';
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
    ctx.font = '16px "Noto Sans Thai", sans-serif';
    ctx.fillText('✨ ยันต์มอดไหม้สมบูรณ์ ปลดล็อกพลังตัวเลข 100%', width / 2, sealY + 195);

    // Tips Box
    const tipY = 640;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(80, tipY, width - 160, 250, [16]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
    ctx.fillText('🌟 เคล็ดลับเสริมดวงมงคล:', 115, tipY + 45);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    ctx.fillText('• วันมงคลประจำสัปดาห์: วันพฤหัสบดี และ วันอาทิตย์', 115, tipY + 90);
    ctx.fillText('• สีกาลกิณีควรเลี่ยง: ดำสนิท / สีมงคลเสริมโชค: สีทองและสีเขียวมรกต', 115, tipY + 135);
    ctx.fillText('• ทิศมงคลในการเจรจาค้าขาย: ทิศตะวันออกเฉียงเหนือ', 115, tipY + 180);
    ctx.fillText('• ทำบุญปล่อยปลา หรือบริจาคโลหิตเพื่อเสริมสง่าราศี', 115, tipY + 220);
  } else if (data.type === 'auspicious') {
    // Auspicious Timing & Calendar Card (ปฏิทินวันมงคลและฤกษ์งามยามดี)
    const info = data.details.auspiciousInfo;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px "Chonburi", "Noto Serif Thai", serif';
    ctx.fillText('ฤกษ์งามยามดีมหามงคล', width / 2, 320);

    const boxY = 360;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.9)';
    ctx.strokeStyle = '#e8b94a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(70, boxY, width - 140, 520, [20]);
    ctx.fill();
    ctx.stroke();

    // Ornate gold banner inside box
    ctx.fillStyle = 'rgba(232, 185, 74, 0.15)';
    ctx.beginPath();
    ctx.roundRect(90, boxY + 20, width - 180, 70, [12]);
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
    ctx.font = 'bold 28px "Chonburi", "Noto Serif Thai", serif';
    ctx.fillText(`✨ ${info?.thaiRukName || 'มหัทธโนฤกษ์'} ✨`, width / 2, boxY + 130);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '17px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.thaiRukMeaning || '', width / 2, boxY + 165);

    // Details Grid
    ctx.textAlign = 'left';
    const gridY = boxY + 205;
    const leftX = 105;

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText('🏷️ เหมาะสำหรับงาน:', leftX, gridY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.category || 'ทุกงานมงคล', leftX + 170, gridY);

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText('⏰ ช่วงเวลายามมงคล:', leftX, gridY + 45);
    ctx.fillStyle = '#7fd99a';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.bestHours || '09:09 - 10:39 น.', leftX + 170, gridY + 45);

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText('🧭 ทิศมงคลนำฤกษ์:', leftX, gridY + 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.direction || 'ทิศตะวันออก (ทิศศรี)', leftX + 170, gridY + 90);

    ctx.fillStyle = '#ffcf70';
    ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
    ctx.fillText('🎨 สีมงคลเสริมโชค:', leftX, gridY + 135);
    ctx.fillStyle = '#ffd24a';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText(info?.luckyColors || 'สีทอง / สีเขียวมรกต', leftX + 170, gridY + 135);

    // Bottom Blessing Note
    ctx.fillStyle = 'rgba(232, 185, 74, 0.08)';
    ctx.beginPath();
    ctx.roundRect(95, gridY + 170, width - 190, 110, [10]);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb84d';
    ctx.font = 'bold 16px "Noto Sans Thai", sans-serif';
    ctx.fillText('📜 เคล็ดพิธีเสริมสิริมงคล:', width / 2, gridY + 200);

    ctx.fillStyle = '#ecdcc1';
    ctx.font = '15px "Noto Sans Thai", sans-serif';
    const tipText = info?.ceremonyTip || 'จุดธูป ๙ ดอก อธิษฐานจิตตั้งมั่น บูชาพระรัตนตรัยและเทพยดาอำนวยพร';
    ctx.fillText(tipText.length > 55 ? tipText.substring(0, 52) + '...' : tipText, width / 2, gridY + 235);
    ctx.fillText('ขอความสำเร็จ ความเจริญรุ่งเรือง ไร้อุปสรรค จงบังเกิดแก่ท่าน', width / 2, gridY + 260);
  } else {
    // Remedy / Other
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Sans Thai", serif';
    ctx.fillText('ยันต์คุ้มครองสะเดาะเคราะห์', width / 2, 320);

    const boxY = 380;
    ctx.fillStyle = 'rgba(25, 12, 10, 0.85)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, boxY, width - 160, 500, [16]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '60px serif';
    ctx.fillText('☯️', width / 2, boxY + 80);

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 26px "Noto Sans Thai", serif';
    ctx.fillText('พุทธานุภาพคุ้มครอง ปัดเป่าอุปสรรค', width / 2, boxY + 150);

    ctx.fillStyle = '#fdf1d8';
    ctx.font = '18px "Noto Sans Thai", sans-serif';
    ctx.fillText('ดวงชะตาของท่านได้รับการหนุนนำด้วยกุศลบารมี', width / 2, boxY + 210);
    ctx.fillText('เคราะห์หนักจักกลายเป็นเบา เคราะห์เบาจักมลายหายสูญ', width / 2, boxY + 250);
    ctx.fillText('หมั่นสวดมนต์ แผ่เมตตา และทำจิตใจให้ผ่องใส', width / 2, boxY + 290);
  }

  // 6. Bottom Auspicious Seal & Certification
  const sealBottomY = height - 170;

  // Auspicious Seal (Red Chinese/Thai Stamp)
  ctx.fillStyle = 'rgba(179, 38, 30, 0.9)';
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(width / 2 - 110, sealBottomY - 10, 220, 50, [10]);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 18px "Noto Serif Thai", serif';
  ctx.fillText('มั่งมี ศรีสุข · 吉祥如意', width / 2, sealBottomY + 23);

  // Footer Disclaimer & URL
  ctx.fillStyle = 'rgba(205, 185, 149, 0.7)';
  ctx.font = '13px "Noto Sans Thai", sans-serif';
  ctx.fillText('ศาลเจ้าแห่งโชคลาภ (Lucky Shrine) · ประมวลผลในเครื่อง 100% เพื่อความบันเทิง', width / 2, height - 75);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png', 0.95);
  });
}
