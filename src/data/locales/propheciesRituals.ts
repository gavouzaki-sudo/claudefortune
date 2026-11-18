import type { SupportedLang } from './types';
import type { OfferingResult, RemedyResult } from '../../types';
import {
  CANDLE_PROPHECY_SETS,
  OFFERING_GUIDE_SETS,
  REMEDY_SUMMARY_SETS,
  REMEDY_PRACTICAL_SETS,
  REMEDY_MERIT_SETS,
  REMEDY_MANTRA_SETS,
  FESTIVAL_BLESSING_SETS,
  IMAGE_SCAN_READINGS,
  SIGNATURE_TRAIT_SETS,
  type CandleProphecySet,
  type FestivalBlessingSet,
} from '../ritualProphecies';

const safeSet = (setIdx: number) => ((setIdx % 5) + 5) % 5;

// ---------------------------------------------------------------------------
// 3. Candle Lighting (5 sets)
// ---------------------------------------------------------------------------
export const CANDLE_PROPHECY_SETS_EN: readonly CandleProphecySet[] = [
  {
    dedication: 'May your heart find peace and clarity, shining bright like candlelight guiding every step.',
    mantra: [
      'Namo Tassa Bhagavato Arahato Sammasambuddhassa (3 times)',
      'Sabbe Satta Sukhita Hontu — May all beings be happy and at peace.',
    ],
  },
  {
    dedication: 'May this sacred flame honor the Triple Gem, gently dissolving sorrow and inviting serene joy.',
    mantra: [
      'Itipiso Bhagava Buddho Metta Dhammo Karuna Sangho Panna',
      'May this candlelight shelter your destiny with calm and lasting fortune.',
    ],
  },
  {
    dedication: 'May wisdom shine clear as a steady flame, dispelling dark obstacles and clearing every hazard.',
    mantra: [
      'Buddho Kalo Kato Hotu Mahalabho Bhavantu Me',
      'May timely fortune and noble companions gather safely around your path.',
    ],
  },
  {
    dedication: 'By the grace of this sacred flame, may longevity, merit, and strength grow steadily.',
    mantra: [
      'Na Ma Pha Tha — Loving-kindness, compassion, grace, joy, and tender care',
      'May vitality, radiance, health, and longevity endure forevermore.',
    ],
  },
  {
    dedication: 'May the victory candle glow bright within, uplifting career, wealth, and wholesome health.',
    mantra: [
      'Jayo Niccam Mahajayo Labham Bhavantu Me',
      'May victory, peace, and blessing abide with you and your loved ones day and night.',
    ],
  },
];

export const CANDLE_PROPHECY_SETS_ZH: readonly CandleProphecySet[] = [
  {
    dedication: '愿心境澄明安稳，如长明灯火照亮人生每一步征程。',
    mantra: [
      '南无本师释迦牟尼佛（三称）',
      '愿一切众生身心安乐、吉祥如意。',
    ],
  },
  {
    dedication: '以一盏清灯供养三宝，愿忧愁消散，光明欢喜顺遂常伴。',
    mantra: [
      '佛慈光被 慧炬长明 法喜充满 众善护持',
      '祈愿此盏福灯护佑命途安康顺畅。',
    ],
  },
  {
    dedication: '愿智慧如烛焰清明，驱散阴霾阻碍，化解一切凶险波折。',
    mantra: [
      '诸佛护念 福慧双增 吉祥临门 万事顺遂',
      '愿富贵善缘与良师益友安全聚首于身旁。',
    ],
  },
  {
    dedication: '仰仗续命福灯殊胜功德，愿寿元绵长、福德日增、根基稳固。',
    mantra: [
      '南无大慈大悲 消灾延寿 广聚善缘',
      '愿康健安乐、光采沛然、长久安稳常随。',
    ],
  },
  {
    dedication: '胜慧宝灯心头常亮，祈愿事业精进、财源宽裕、身心康泰。',
    mantra: [
      '大吉大利 福德圆满 吉祥常胜',
      '愿平安福庆昼夜伴随您与至亲阖家安康。',
    ],
  },
];

export function getLocalizedCandleProphecy(
  setIdx: number,
  lang: SupportedLang,
  fallback?: { dedication: string; mantra: string[] }
): { dedication: string; mantra: string[] } {
  const s = safeSet(setIdx);
  if (lang === 'en') return CANDLE_PROPHECY_SETS_EN[s] || CANDLE_PROPHECY_SETS_EN[0];
  if (lang === 'zh') return CANDLE_PROPHECY_SETS_ZH[s] || CANDLE_PROPHECY_SETS_ZH[0];
  if (fallback && fallback.dedication) return fallback;
  return CANDLE_PROPHECY_SETS[s] || CANDLE_PROPHECY_SETS[0];
}

// ---------------------------------------------------------------------------
// 4. Sky Lantern Release (5 categories × 5 sets) + Care Message
// ---------------------------------------------------------------------------
export const OFFERING_CATEGORIES_LOCALIZED: readonly { th: string; en: string; zh: string }[] = [
  { th: 'การเงิน', en: 'Finance', zh: '财运' },
  { th: 'ความรัก', en: 'Love', zh: '感情' },
  { th: 'สุขภาพ', en: 'Health', zh: '健康' },
  { th: 'การงาน', en: 'Career', zh: '事业' },
  { th: 'ทั่วไป', en: 'General Blessings', zh: '综合祈福' },
];

export const OFFERING_GUIDE_SETS_EN: readonly [string, string, string, string, string][] = [
  // 0: Finance
  [
    'Financial worries feel heavy—break obligations into small manageable steps and ask trusted advisors for perspective.',
    'Organize income and expenses today step by step; steady fortune grows naturally from discipline and honesty.',
    'Let financial anxiety drift skyward with the lantern while quietly setting aside small, steady savings.',
    'Fresh earning openings are unfolding—sharpen practical skills and weigh real value before spending.',
    'Wise mentors offer sound financial counsel; calm talks help untangle lingering obligations gently.',
  ],
  // 1: Love
  [
    'A weary heart needs breathing room—pause to rest before deciding and confide in someone you trust.',
    'Show kindness to your own heart first; when inner peace settles, sincere affection naturally gravitates near.',
    'Understanding grows through listening without blame—release quiet resentment and speak with warmth.',
    'Genuine bonds never need rushing; allow patient time to reveal steady care from both sides.',
    'Lantern light invites gentle compassion around you—forgive old slights to welcome lighter peace.',
  ],
  // 2: Health
  [
    'Your body is asking for rest—prioritize proper sleep and consult a physician if symptoms persist.',
    'Loosen daily tension gradually, choose warm nourishing meals, and drink ample clean water each day.',
    'Deep breathing and calm composure are natural medicine—stretch gently and rest your eyes often.',
    'Heed subtle body signals early; regular checkups serve as quiet protection for your wellbeing.',
    'Send lingering stress into the night sky and claim deep rest so natural recovery works in full.',
  ],
  // 3: Career
  [
    'Heavy workloads clear one task at a time—remember to replenish your own inner strength along the way.',
    'Rank top priorities first and act systematically; tangible progress will soon stand clearly in view.',
    'Workplace pressure is refining precious experience; clear team communication lightens half the load.',
    'An opportunity to prove genuine dedication draws near—stay thorough and your work will shine.',
    'Leave unnecessary worry behind after hours so tomorrow finds your creativity refreshed.',
  ],
  // 4: General
  [
    'Pure intention marks the beginning of every blessing—step forward lightly with a steady heart.',
    'Glowing lantern light scatters gloom; pray with loving-kindness and wholesome support follows.',
    'Release lingering past regrets to the evening breeze and welcome quiet peace with new openings.',
    'Gratitude and humility shield every mile of your path cleanly and safely.',
    'Guard wholesome conduct and clear thoughts—every sincere offering bears gentle, lasting fruit.',
  ],
];

export const OFFERING_GUIDE_SETS_ZH: readonly [string, string, string, string, string][] = [
  // 0: Finance
  [
    '财务焦虑往往很真实，试着把难题拆成小块逐步化解，必要时也可向信赖亲友或专业机构寻求建议。',
    '从今日起梳理收支账目，一步步减轻负担；稳健福财自会从自律与诚实中生发。',
    '将钱财重担随祈福天灯轻放夜空，同时坚持点滴储蓄累积底气。',
    '新的创收渠道正在悄然开启，持续打磨实用技能并在消费前衡量实效。',
    '长辈或行家会给出受用的理财点拨，温和协商也有望让久拖财务找到舒缓出路。',
  ],
  // 1: Love
  [
    '疲惫的心需要休息时间，先让自己缓一口气再做决定，也可向信任的朋友倾诉感受。',
    '请先温柔善待自己的心灵；当内在归于宁静，真诚契合的好缘自然会被吸引而来。',
    '体谅源自不带评判的倾听，放下委屈与猜疑，用温和真诚的话语开启交流。',
    '真挚情谊从不需急于催逼，让时间温柔印证彼此长久的耐心与真心。',
    '明灯引来四周和气善意，释怀过往琐怨方能迎入轻松舒畅的新心情。',
  ],
  // 2: Health
  [
    '身体正提醒您需要停下来休养，保持充足睡眠；若持续不适请及时就医诊察。',
    '适度舒缓紧绷神经，日常宜食温热易消化的饭菜并保证足量清净饮水。',
    '深长呼吸与平和心境便是上乘良药，记得定时舒展筋骨并闭目养神。',
    '趁早留神身体发出的细微讯号，定期体检正是护佑身心康宁的明智之举。',
    '将沉重烦忧交付广袤夜空，好好安睡一场让自我修复力充分运转。',
  ],
  // 3: Career
  [
    '再繁重的任务只要一件件逐项清办终能化解，莫忘随时为自己补充心气能量。',
    '先抓稳最要紧的一件事按部就班推进，清晰成果自会水到渠成。',
    '眼前职务压力正淬炼成宝贵资历，与团队保持明晰协作能省下大半周折。',
    '展现真才实干的良机即将到来，保持严谨细致便能赢得赞誉与瞩目。',
    '下班后请把多余忧思留在门外，明朝方能满血归来挥洒创意。',
  ],
  // 4: General
  [
    '良善的起心动念正是万般吉祥的开端，愿您怀着轻盈稳健之心坚定前行。',
    '天灯明辉照散阴霾，以慈悲温暖之心祈愿，美事良缘自会循序相助。',
    '让旧日芥蒂随清风散去，敞开心怀迎接本周悄然而至的安宁与新机。',
    '知恩与谦和将成为随行护身甲，护佑一路平安顺遂。',
    '守持正念与清净善行，您诚心种下的每一分福德皆会令所愿逐一成真。',
  ],
];

export const CARE_MESSAGE_LOCALIZED: Record<SupportedLang, string> = {
  th:
    'ขอบคุณที่ไว้ใจเล่าออกมา ความเจ็บปวดนี้เป็นเรื่องจริง และคุณไม่ต้องแบกมันอยู่คนเดียว ' +
    'ถ้าคุณกำลังคิดทำร้ายตัวเอง โปรดโทรสายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง) หรือบอกคนที่ไว้ใจให้มาอยู่ด้วยตอนนี้ ' +
    'หากอยู่ในอันตรายเฉียบพลันโทร 1669',
  en:
    'Thank you for trusting enough to share this. Your pain is real, and you do not have to carry it alone. ' +
    'If you are thinking of hurting yourself, please call Thailand’s 24-hour Mental Health Hotline at 1323 (or your local crisis line), ' +
    'or reach out to someone you trust to stay beside you right now. In immediate danger, call 1669 (or local emergency services).',
  zh:
    '感谢您愿意倾诉心声。这份痛苦是真实存在的，您并不需要独自一人扛着它。' +
    '若您正有伤害自己的念头，请立即拨打 24 小时心理援助热线（泰国 1323 / 中国希望24热线 400-161-9995 / 当地紧急心理专线），' +
    '或联系信赖的亲友陪伴在旁；如遇紧急危险请拨打当地急救电话（泰国 1669 / 120）。',
};

export function getOfferingCategoryIndex(catTh?: string): number {
  const idx = OFFERING_CATEGORIES_LOCALIZED.findIndex((c) => c.th === (catTh || '').trim());
  return idx >= 0 ? idx : 4;
}

// ---------------------------------------------------------------------------
// 5. Chong Remedy (12 Zodiacs, Colors, Directions, 5 Relations × 5, 4 × 5, 5 Mantras)
// ---------------------------------------------------------------------------
export const ZODIAC_LOCALIZED: readonly { th: string; en: string; zh: string; colorEn: string; colorZh: string; dirEn: string; dirZh: string }[] = [
  { th: 'ชวด', en: 'Rat', zh: '鼠', colorEn: 'Deep Blue', colorZh: '深蓝色', dirEn: 'North', dirZh: '正北方' },
  { th: 'ฉลู', en: 'Ox', zh: '牛', colorEn: 'Golden Yellow', colorZh: '金黄色', dirEn: 'Northeast', dirZh: '东北方' },
  { th: 'ขาล', en: 'Tiger', zh: '虎', colorEn: 'Emerald Green', colorZh: '翠绿色', dirEn: 'East', dirZh: '正东方' },
  { th: 'เถาะ', en: 'Rabbit', zh: '兔', colorEn: 'Soft Pink', colorZh: '柔粉色', dirEn: 'East', dirZh: '正东方' },
  { th: 'มะโรง', en: 'Dragon', zh: '龙', colorEn: 'Imperial Gold', colorZh: '明金色', dirEn: 'Southeast', dirZh: '东南方' },
  { th: 'มะเส็ง', en: 'Snake', zh: '蛇', colorEn: 'Crimson Red', colorZh: '朱红色', dirEn: 'South', dirZh: '正南方' },
  { th: 'มะเมีย', en: 'Horse', zh: '马', colorEn: 'Bright Red', colorZh: '正红色', dirEn: 'South', dirZh: '正南方' },
  { th: 'มะแม', en: 'Goat', zh: '羊', colorEn: 'Warm Yellow', colorZh: '暖黄色', dirEn: 'Southwest', dirZh: '西南方' },
  { th: 'วอก', en: 'Monkey', zh: '猴', colorEn: 'Pure White', colorZh: '纯白色', dirEn: 'West', dirZh: '正西方' },
  { th: 'ระกา', en: 'Rooster', zh: '鸡', colorEn: 'White Gold', colorZh: '白金色', dirEn: 'West', dirZh: '正西方' },
  { th: 'จอ', en: 'Dog', zh: '狗', colorEn: 'Warm Apricot', colorZh: '暖杏橙', dirEn: 'Northwest', dirZh: '西北方' },
  { th: 'กุน', en: 'Pig', zh: '猪', colorEn: 'Ocean Blue', colorZh: '海蓝色', dirEn: 'North', dirZh: '正北方' },
];

export function getLocalizedColorName(colorTh: string, lang: SupportedLang): string {
  if (lang === 'th') return colorTh;
  const thColors = ['น้ำเงิน', 'เหลืองทอง', 'เขียว', 'ชมพู', 'ทอง', 'แดง', 'แดงสด', 'เหลือง', 'ขาว', 'ขาวทอง', 'ส้มอ่อน', 'ฟ้าน้ำทะเล'];
  const idx = thColors.indexOf((colorTh || '').trim());
  if (idx >= 0) return lang === 'en' ? ZODIAC_LOCALIZED[idx].colorEn : ZODIAC_LOCALIZED[idx].colorZh;
  return colorTh;
}

export function getLocalizedDirectionName(dirTh: string, lang: SupportedLang): string {
  if (lang === 'th') return dirTh;
  const thDirs = [
    'ทิศเหนือ',
    'ทิศตะวันออกเฉียงเหนือ',
    'ทิศตะวันออก',
    'ทิศตะวันออกเฉียงใต้',
    'ทิศใต้',
    'ทิศตะวันตกเฉียงใต้',
    'ทิศตะวันตก',
    'ทิศตะวันตกเฉียงเหนือ',
  ];
  const enDirs = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const zhDirs = ['正北方', '东北方', '正东方', '东南方', '正南方', '西南方', '正西方', '西北方'];
  const idx = thDirs.indexOf((dirTh || '').trim());
  if (idx >= 0) return lang === 'en' ? enDirs[idx] : zhDirs[idx];
  return dirTh;
}

export function getLocalizedZodiacNameByThai(nameTh: string, lang: SupportedLang): string {
  if (lang === 'th') return nameTh;
  const found = ZODIAC_LOCALIZED.find((z) => z.th === nameTh.trim());
  return found ? found[lang] : nameTh;
}

export const REMEDY_SUMMARY_SETS_EN: readonly [string, string, string, string, string][] = [
  // 0: Safe / No Clash
  [
    'Your sign has no direct clash this year—live peacefully and nurture fortune through merit and kindness.',
    'Karmic currents stay balanced without harsh friction; favorable for steady growth with calm judgment.',
    'Year energy flows harmoniously—generosity and regular mindfulness prayers heighten good fortune.',
    'Free from major Chong friction; steady diligence and integrity bring reliable progress.',
    'Your chart shines clear—a warm smile and mindful poise naturally attract allies and fortune.',
  ],
  // 1: Direct Zodiac Year (Benmingnian / คัก)
  [
    'In your own zodiac year, energies fluctuate gently—keep calm, wear lucky hues, and visit a shrine calmly.',
    'Your birth-sign year invites dynamic shifts; steady awareness and cool temper turn turbulence into grace.',
    'Annual energy mirrors your core self—make thoughtful choices and entrust blessings to Tai Sui.',
    'When your sign meets the ruling year, offer candles or lamp oil to keep clarity bright.',
    'Life moves swiftly in a cycle year—keep backup plans ready and welcome wise guidance from elders.',
  ],
  // 2: Direct Clash (Chong / ปะทะ)
  [
    'A direct clash year advises thorough caution in every sphere, mindful saving, and unhurried travel.',
    'Clashing annual tides call for poised defense—sidestep arguments, dodge reckless risks, and renew merit.',
    'A clash year brings meaningful tests—double-check contracts and travel carefully for smooth protection.',
    'Channel clashing motion positively: refresh your home space, practice animal-saving charity, and build savings.',
    'Pay respect sincerely to Tai Sui and uphold ethical clarity; heavy hurdles ease remarkably.',
  ],
  // 3: Harm (Hai / เบียดเบียน)
  [
    'This subtle friction year warns of small misunderstandings nearby—speak candidly and steer clear of disputes.',
    'Guard against petty gossip or sensitive hurt around peers; polite boundaries keep your heart peaceful.',
    'Interpersonal sensitivity runs high—listen twice before speaking once and question unverified rumors.',
    'Balance expectations with close companions and dissolve lingering tension through patient reason.',
    'Protect peace through healthy boundaries; offer light or clean water merit to cultivate goodwill.',
  ],
  // 4: Break (Phua / ทำลาย)
  [
    'Minor disruptions may brush plans this year—keep contingency options ready and avoid forcing big pivots.',
    'Watch for small breakdowns or minor friction escalating; inspect readiness carefully before acting.',
    'A break-aspect nudges caution around delays or split routines—adapt flexibly and order returns swiftly.',
    'Hold off on risky ventures or co-signing loans; repair worn household items to refresh stability.',
    'Stay supple as bamboo in strong wind—once passing shakes settle, stronger foundations arise.',
  ],
];

export const REMEDY_SUMMARY_SETS_ZH: readonly [string, string, string, string, string][] = [
  // 0: 不犯太岁
  [
    '今年命格与流年无直接刑冲，生活稳健平顺，适合借行善修德、广结善缘来添福添彩。',
    '流年气场平稳少剧烈冲击，正宜稳步积善并审慎拓展关键事务。',
    '岁运相扶顺畅，日常乐善好施兼虔诚礼佛诵经，贵人福气愈发凸显。',
    '无大冲克阻滞，保持勤恳自律与踏实作风便能收获长远安稳回报。',
    '运势晴朗通透，常怀笑意与清醒正念最易招引贵友良缘与吉财。',
  ],
  // 1: 值太岁（本命年）
  [
    '适逢本命值太岁之年，气场波动较频，宜守静心神、常搭吉祥幸运色并抽空拜神祈福。',
    '值太岁易带来周遭变化起伏，保持清醒正念、戒急戒怒方能化险为夷、转危为安。',
    '本命流年贴身映射心境，言行抉择宜沉稳周密，并虔诚向太岁星君摄符安岁。',
    '本命星临照宜常添光明福德，敬献蜡烛或供长明灯油最助前路清朗顺畅。',
    '生活节奏起伏较往年敏锐，凡事备好预案并虚心听取善意长辈提点最为稳妥。',
  ],
  // 2: 冲太岁
  [
    '冲太岁之年运势动荡较多，诸事宜加倍严谨、勤俭储蓄并留心出行交通安全。',
    '流年对冲提醒您以静制动、沉着应局，远离口舌争端与高危投机并适时扫除晦气。',
    '冲太岁实为重要历练之年，核清合同字据与交通动向，自能平安化解冲煞。',
    '不妨将对冲动能化为正向变动：整理迁动家居陈设、行善护生放生并蓄备现金。',
    '虔诚参拜太岁星君、持守正道五戒善心，再重难关亦能悄然化轻化吉。',
  ],
  // 3: 害太岁
  [
    '害太岁之年慎防身边人际细微磨擦或误会，遇事坦诚直爽沟通并远离无谓纷争。',
    '防小人暗议或亲近之间莫名生怨，保持礼貌有度距离反得耳根清净。',
    '流年易牵动敏锐情绪与人际琐扰，少说多听、切莫轻信未经查实的流言。',
    '适度调平衡对身边伴侣亲友的期待，善用包容理智解开积压小疙瘩。',
    '立定清醒界限防无形耗损，可多捐供灯光照明或净水布施以广结慈悲善缘。',
  ],
  // 4: 破太岁
  [
    '破太岁之年既定计划偶易生微阻破漏，重要安排宜预留后手并避强行剧变。',
    '留神日常器物破损或小摩擦被放大升级，每次落手前细致查验准备度。',
    '破星入运提醒慎防合作破裂或进度延误，顺势灵活调整便能逐步重回正轨。',
    '切莫冲动重金投资或替人担保，修葺居家老旧破损物件颇有解厄聚吉妙效。',
    '令内心保持如芦苇迎风般的柔韧弹性，待短暂震荡过去，新根基将更加坚牢。',
  ],
];

export const REMEDY_PRACTICAL_SETS_EN: readonly [string, string, string, string, string][] = [
  [
    'Track income and expenses closely, maintain 3–6 months of reserves, and avoid lending or co-signing loans.',
    'Separate daily spending from core savings accounts, audit recurring bills, and skip speculative wagers.',
    'Review weekly cash flow carefully and commit only to thoroughly researched, safe ventures.',
    'Clear high-interest small debts early and double-check links or requests to guard against fraud.',
    'Protect healthy liquidity reserves and delay non-essential installment spending for peace of mind.',
  ],
  [
    'Set aside phone-free time to talk calmly, listen before replying, and apologize honestly when mistaken.',
    'Nurture warmth in small daily gestures, show appreciation, and honor each other openly.',
    'When tension rises, pause ten quiet minutes before speaking to avoid hurtful words.',
    'Honor mutual personal space while keeping unhurried shared routines alive.',
    'Express real needs gently and clearly so silent doubts never accumulate.',
  ],
  [
    'Schedule an annual checkup, guard sleep hours, exercise gently, and seek medical advice promptly if unwell.',
    'Keep steady sleep schedules, dim screens one hour before bed, and stay well hydrated.',
    'Monitor stress early with slow breathing exercises or 20–30 minutes of brisk walking daily.',
    'Choose fresh whole meals, go lighter on excess sugar/salt, and stay extra alert while commuting.',
    'Never ignore persistent fatigue—protect recovery windows and consult trusted professionals.',
  ],
  [
    'List pending tasks by clear priority, align expectations with supervisors, and sharpen core skills.',
    'Confirm work agreements and key specs in writing to prevent costly misunderstandings.',
    'Keep your workspace tidy and review deliverables carefully before sending them off.',
    'Welcome constructive feedback gracefully and collaborate warmly with peers.',
    'Guard clear boundaries between active work hours and restorative rest to prevent burnout.',
  ],
];

export const REMEDY_PRACTICAL_SETS_ZH: readonly [string, string, string, string, string][] = [
  [
    '认真记好收支明细，备齐 3 至 6 个月应急备用金，绝不盲目借贷或替人做担保。',
    '明确隔离日常花费与储蓄账户，核查重复扣费且切忌高风险博弈。',
    '每周复盘财务收支流向，只参与功课做足且安全稳妥的项目。',
    '优先清还高利息小额债务，付款与点击链接前多方验证防诈骗。',
    '守紧流动现金储备，暂缓非必需的分期大宗消费，换取全年安稳踏实。',
  ],
  [
    '约定放下手机的专心交流时光，先倾听再回应，有错坦诚致歉。',
    '于微小日常中注入关怀体贴，多表达谢意并在人前给足伴侣体面。',
    '情绪初起波澜时先静心十分钟再发言，避开脱口伤人的冷言锐语。',
    '尊重彼此独立空间，同时保留规律轻松的共同休闲活动。',
    '温柔坦率地道出真实心愿，莫任由猜测怀疑在心底累积隔阂。',
  ],
  [
    '按期安排体检、保证充足睡眠、温和坚持运动，有异状及时求医问诊。',
    '固定作息节律，睡前一小时远离强光屏幕并每天喝足洁净温水。',
    '留神自身压力指数，每天抽二三十分钟深呼吸放松或散步拉筋。',
    '多选清淡新鲜食材、少糖少油咸，上下班通勤留意交通安全。',
    '若现长期倦怠感切勿硬撑透支，安排休息调养并及时请教专科医师。',
  ],
  [
    '梳理待办轻重缓急逐一攻克，同上司明确预期目标并持续打磨专业技能。',
    '关键共识与分工细则落笔书面留存，有效杜绝口头误传偏差。',
    '保持办公环境整洁有序，每次交稿汇报前务必细心复检无误。',
    '以开放心态接纳建设性建议，用谦和礼貌的态度凝聚团队合力。',
    '明确界定办公与休养生息界线，防止长期积劳导致能量枯竭。',
  ],
];

export const REMEDY_MERIT_SETS_EN: readonly [string, string, string, string, string][] = [
  [
    'Donate kindly to those in need and offer flowers, incense, and candles with a sincere heart.',
    'Contribute to temple upkeep, community meal offerings, or wholesome charity.',
    'Tidy your home altar and wallet neatly while dedicating gentle goodwill to all beings.',
    'Support student scholarships or medical equipment funds to nourish wisdom and clean prosperity.',
    'Offer golden marigolds and pure water in serene gratitude for smooth financial flow.',
  ],
  [
    'Offer pink or red blossoms respectfully while cultivating genuine kindness toward everyone around you.',
    'Practice loving-kindness meditation and share paired offerings in harmony and goodwill.',
    'Honor parents, elders, and benefactors with gratitude to awaken authentic relational grace.',
    'Present paired lotuses or twin candles with a bright heart wishing peace for all.',
    'Care for shelter animals or youth charities to cultivate warm, pure compassion.',
  ],
  [
    'Offer Sangha robes/essentials or support hospital wards alongside quiet loving-kindness reflection.',
    'Support compassionate life-saving charities, release fish mindfully, or donate blood if able.',
    'Contribute medicines or health supplies to infirmaries and senior care homes.',
    'Chant healing verses peacefully while releasing bitter grudges from your mind.',
    'Donate clean drinking water or filtration support to bless life with freshness and vitality.',
  ],
  [
    'Visit a local temple or shrine sincerely for clear work passage and gladly assist colleagues.',
    'Donate temple lights, candles, or lamp oil to illuminate sharp clarity and wisdom at work.',
    'Donate study guides, books, or school supplies to young learners in rural schools.',
    'Pay sincere respect at your trusted shrine with fresh fruit offerings.',
    'Refrain from workplace gossip and genuinely celebrate the successes of peers.',
  ],
];

export const REMEDY_MERIT_SETS_ZH: readonly [string, string, string, string, string][] = [
  [
    '量力捐助扶危济困，并携鲜花香烛虔诚祈愿赐福。',
    '随喜添护寺庙香火、布施斋食或行善供养，广积厚福。',
    '整理干净家中佛台或财位与钱包，诵经念佛回向消灾顺遂。',
    '助学兴教或随喜医疗设备善款，开启清净智慧财源正道。',
    '敬供金黄吉祥花卉与清净净水祈佑财路畅通安稳。',
  ],
  [
    '以粉色或红色吉花供奉祈福，并在心中修持待人和蔼温柔之慈心。',
    '常修慈悲观想并回向情感和美，可成对置办吉祥供品添喜。',
    '孝敬感恩父母师长与有恩之人，最易唤醒真挚长久好人缘。',
    '以欢喜晴朗之心敬献双支莲花或对烛，真诚祝愿众生安乐。',
    '关怀助养流浪动物或儿福公益，培植温润澄净的大爱气场。',
  ],
  [
    '行布施供僧或随喜资助医院善款，兼修慈悲心观护佑康宁。',
    '力所能及参与护生善行、救助危畜或合规无偿献血积攒大功德。',
    '向长者安养院或病患捐助实用药品与健康护理物资。',
    '静心诵持安康祝祷或修习禅观静坐，令内心澄明不积郁结。',
    '捐助饮用水或净水设施善举，滋养生命源头清润强健。',
  ],
  [
    '诚心前往庙宇祈求工作顺达，并在职场乐于热心帮扶同事。',
    '供奉照明灯具、祈福蜡烛或添注灯油，点亮工作思维清晰与贵人运。',
    '向偏远学区儿童捐赠励志书册、教材或学习文具，广开智慧人缘。',
    '以新鲜吉果诚敬供奉太岁星君及守护神明，礼敬感恩。',
    '立愿在职场戒绝是非流言，真诚随喜并喝彩他人的成果进步。',
  ],
];

export const REMEDY_MANTRA_SETS_EN: readonly [string, string][] = [
  [
    'Namo Tassa Bhagavato Arahato Sammasambuddhassa (3 times)',
    'Sabbe Satta Sukhita Hontu — May all beings be happy and well.',
  ],
  [
    'Great Guardian Tai Sui of Highest Virtue, kindly shelter and steady this year’s path.',
    'May every trial and worry transform into safety, wisdom, and lasting peace.',
  ],
  [
    'Buddham Saranam Gacchami, Dhammam Saranam Gacchami, Sangham Saranam Gacchami',
    'Vipatti-patibahaya Sabba-sampatti-siddhiya Sabba-dukkha Vinassantu.',
  ],
  [
    'Itipiso Bhagava Na Mo Buddha Ya — Protected and safe in every step.',
    'Bhavatu Sabba-mangalam Rakkhantu Sabba-devata.',
  ],
  [
    'Loving-kindness, Compassion, Grace, Joy, and Gentle Good Fortune.',
    'May all sorrow, grief, illness, and danger fade completely into peace.',
  ],
];

export const REMEDY_MANTRA_SETS_ZH: readonly [string, string][] = [
  [
    '南无本师释迦牟尼佛（三称）',
    '愿十方一切众生离苦得乐，安稳祥和。',
  ],
  [
    '恭请当年值年太岁星君大慈大悲，垂慈护佑本命元辰光彩安泰。',
    '祈愿一切灾障忧患皆化作吉祥康宁与长久欢喜。',
  ],
  [
    '南无皈依佛、南无皈依法、南无皈依僧',
    '仰仗三宝慈威消灾解厄，一切诸苦皆悉消散、诸事圆满。',
  ],
  [
    '南无阿弥陀佛 佛光普照 诸行平安吉祥',
    '愿十方善神护法常伴左右，护持一切出入顺遂无虞。',
  ],
  [
    '慈心广济 悲愿常行 喜舍随缘 和顺安康',
    '祈愿一切病苦烦忧险厄尽皆消散，吉祥如意常驻心间。',
  ],
];

// ---------------------------------------------------------------------------
// 6. Festival Blessings (6 ids × 5 sets, incl. id=2 for Coffin Card)
// ---------------------------------------------------------------------------
export const FESTIVAL_BLESSING_SETS_EN: readonly [FestivalBlessingSet, FestivalBlessingSet, FestivalBlessingSet, FestivalBlessingSet, FestivalBlessingSet][] = [
  // 0: Weekday
  [
    { title: 'Daily Blessing', text: 'Keep a light heart today, do small things well, and quiet fortune follows naturally.' },
    { title: 'One Incense Stick', text: 'An honest, steady intention is the finest offering—carrying serene peace straight to your heart.' },
    { title: 'Calm Heart, True Wealth', text: 'Find quiet stillness amid busy hours and spot clear solutions to every concern.' },
    { title: 'Morning Radiance', text: 'Kindness toward yourself and others today calls loyal allies swiftly to your side.' },
    { title: 'Steady Stride', text: 'Every quiet, persistent effort carries you closer to cherished achievement.' },
  ],
  // 1: Songkran
  [
    { title: 'Clear Water, Serene Mind', text: 'Refreshing water washes away last year’s heaviness; may prosperity flow smoothly like cool streams.' },
    { title: 'Auspicious Splash', text: 'Respectful elders bring generous help this Thai New Year—expect safe travels and warm company.' },
    { title: 'Blessing of Elders', text: 'May elders’ warm blessings, family unity, vibrant health, and smooth new starts grace your year.' },
    { title: 'Sacred Jasmine Garland', text: 'Filial gratitude brings highest merit; may life remain cool and comforted like sacred water.' },
    { title: 'Radiant New Year', text: 'Welcome joyful news and refreshing growth across work, wealth, and tender romance.' },
  ],
  // 2: Halloween / Coffin Oracle
  [
    { title: 'Curse Turned Into Blessing', text: 'Hidden fears dissolve beneath cool moonlight—those brave enough to face what they avoided reclaim a true gift.' },
    { title: 'The Midnight Treasure Chest', text: 'Valuable rewards lie waiting where few dare look; settle lingering unfinished tasks for surprising upside.' },
    { title: 'Voice in the Midnight Shadow', text: 'Shadows merely echo truth—pause to hear your quiet inner voice and choose with poised clarity.' },
    { title: 'Rebirth & Life Extension', text: 'Lay old sorrow gently to rest inside the past, stepping forth renewed in clarity and pure vigor.' },
    { title: 'Moonlight Over the Night Sky', text: 'Even in the darkest watch, steady mindfulness guides rich fortune back into your hands.' },
  ],
  // 3: Loy Krathong
  [
    { title: 'Lanterns & Krathongs of Grace', text: 'Let past grievances drift safely away upon gentle currents while welcoming radiant hope.' },
    { title: 'Gratitude to Mother River', text: 'With thanks to the waters nourishing life, may abundance flow steadily with quiet peace.' },
    { title: 'Flowing Stream of Luck', text: 'Your heartfelt goals ripen step by step toward bright rewards waiting ahead.' },
    { title: 'Twelfth-Month Full Moon Light', text: 'A single candle glow on the river clears dark hurdles, leaving gentle coolness and joy.' },
    { title: 'River of Compassion', text: 'Burdens drift downstream while sincere merit circles back to shelter and enrich your days.' },
  ],
  // 4: Lunar New Year
  [
    { title: 'Auspicious Red Envelope', text: 'Xin Jia Yu Yi, Xin Ni Huat Chai—wishing career elevation and radiant vitality!' },
    { title: 'Golden Dragon Luck', text: 'A fresh cycle of spirit opens today; pursue earnest ambitions and watch abundance sprout.' },
    { title: 'Prosperity Enters Home', text: 'May trade flourish smoothly, wealth flow homeward, and joyful warmth fill family gatherings.' },
    { title: 'Lion Dance Fortune', text: 'Drum away lingering gloom and swing wide the front door to prosperity and rising honor.' },
    { title: 'Peaches of Longevity', text: 'May long life, grace, gladness, strength, and harmonious family ties bless all four seasons.' },
  ],
  // 5: New Year
  [
    { title: 'Clear Fresh Resolve', text: 'A new year brings space for practical, joyful milestones—begin earnestly with one clear focus.' },
    { title: 'New Year Wishing Grace', text: 'May the year ahead bring vibrant health, serene composure, and deeply fulfilling work.' },
    { title: 'Countdown to Bright Luck', text: 'Wonderful outcomes greet sincere action—may every step in the new year hold firm.' },
    { title: 'First Auspicious Dawn', text: 'Step into the new calendar year with cheerful mindfulness as welcome doors open all year.' },
    { title: 'First Ray of Hope', text: 'May yesterday serve as wise teacher while tomorrow shines bright with triumph and peace.' },
  ],
];

export const FESTIVAL_BLESSING_SETS_ZH: readonly [FestivalBlessingSet, FestivalBlessingSet, FestivalBlessingSet, FestivalBlessingSet, FestivalBlessingSet][] = [
  // 0: 平日祈福
  [
    { title: '今日善念护佑', text: '愿今日心境轻盈，踏实做好身边小事，好运自会循香而至。' },
    { title: '清香一柱祈安康', text: '真诚不欺的初心即是最上乘供品，引来满心清宁祥和。' },
    { title: '心定即是聚宝盆', text: '祈愿身处繁杂仍守得一方安宁，诸事皆见清晰顺解之路。' },
    { title: '晨光积福喜气来', text: '今日善待自己兼温润待人，自会感召知心贵友扶助左右。' },
    { title: '稳步前行必成器', text: '每一份坚持到底的微光耕耘，正悄然载着您迈近美满硕果。' },
  ],
  // 1: 宋干节（泼水节）
  [
    { title: '净水涤烦心舒畅', text: '清冽吉祥水洗尽旧岁重负，祈愿新年身心清凉、财流顺畅滚滚而来。' },
    { title: '泼水招吉迎贵人', text: '泰历新年有望得宽厚长辈提携带路，祝福出行平安、常逢良善君子。' },
    { title: '礼敬长辈添寿福', text: '愿长辈嘉言赐福、合家团圆兴旺、身康体健、万般新局开端顺遂。' },
    { title: '吉祥茉莉花环绕', text: '至诚孝悌唤来无上福泽，愿生涯如沐甘露般温润阴凉无忧。' },
    { title: '泰岁新春耀鸿途', text: '喜迎四方捷报与滋润生气，事业、财禄、佳缘全年繁茂长红。' },
  ],
  // 2: 万圣灵匣 / 棺木延寿牌阵
  [
    { title: '化煞为福转鸿运', text: '潜藏心底的畏惧正随月华消融，敢于直面曾逃避之事者将收获意外珍宝。' },
    { title: '午夜灵匣藏瑰宝', text: '真正贵重契机常藏于他人不敢窥探之处，回首理清旧账或现惊喜回报。' },
    { title: '子夜暗影真谛现', text: '影迹只在催促您探寻真相，静听心底清明微声，沉稳果断作出抉择。' },
    { title: '祈福续命焕新生', text: '将昔日忧伤稳妥尘封于身后，以更坚毅清明、焕然一新的生命力迈出灵匣。' },
    { title: '朗月照破暗夜穹', text: '纵身处静谧幽微夜色之中，清醒正念与睿智亦会携丰厚福禄归返身旁。' },
  ],
  // 3: 水灯节
  [
    { title: '明灯载福顺水流', text: '愿胸中芥蒂郁结随柔波远逝，心中迎回希望曙光与清朗好景。' },
    { title: '谢恩湄南河母庇佑', text: '感念清水滋养生命万物，祈愿福财源远流长、心神安泰自在。' },
    { title: '碧水生辉报佳音', text: '心头郑重许下的期盼正逐阶成真，愿旅途尽头满载欢喜善果。' },
    { title: '十二月望满月明灯', text: '水灯中央一点柔光破开迷障，化散坎坷，只留清凉顺遂与笑意。' },
    { title: '慈悲长河护身行', text: '烦恼顺水漂远，虔诚福德化作柔光回照守护您阖家圆融丰足。' },
  ],
  // 4: 农历新年
  [
    { title: '吉祥红包贺新春', text: '新正如意，新年发财！祝福职场蒸蒸日上、体魄健朗沛然。' },
    { title: '金龙跃升纳吉祥', text: '心境新岁始于足下，踏实落实心中志向，良果必渐次抽芽长成。' },
    { title: '财源滚滚入宝宅', text: '祈愿生意兴隆顺畅、银财滚滚归库，更有充裕闲暇陪伴挚爱亲人。' },
    { title: '瑞狮醒春启财门', text: '鼓乐驱尽旧岁浊气，推开宅门喜迎贵气、禄位与家运腾飞。' },
    { title: '仙桃献寿福满堂', text: '愿寿元、气色、安乐、健旺四福俱全，家门团结和睦喜乐常驻。' },
  ],
  // 5: 元旦跨年
  [
    { title: '立定新春好志向', text: '新岁正是定下切实可行小目标的良辰，先专注做实第一件大事。' },
    { title: '新年祈愿万事兴', text: '祈愿来岁身心康健、心境安稳清亮，并全情投入挚爱理想之事。' },
    { title: '跨年倒数迎鸿福', text: '美好奖赏眷顾笃行实干之人，祝福新年每一步皆走得扎实有力。' },
    { title: '元辰初晓启嘉运', text: '以清醒欢喜之姿掀开新历序幕，全年皆有顺畅机遇为您敞开大门。' },
    { title: '希望曙光耀前程', text: '愿往事皆化滋养智慧的宝贵阶梯，面前新程满盈胜利功成与静好安宁。' },
  ],
];

export function getLocalizedFestivalBlessing(
  festId: number,
  setIdx: number,
  lang: SupportedLang,
  fallback?: { title: string; text: string }
): { title: string; text: string } {
  const safeFest = ((festId % 6) + 6) % 6;
  const s = safeSet(setIdx);
  if (lang === 'en') return FESTIVAL_BLESSING_SETS_EN[safeFest]?.[s] || FESTIVAL_BLESSING_SETS_EN[0][0];
  if (lang === 'zh') return FESTIVAL_BLESSING_SETS_ZH[safeFest]?.[s] || FESTIVAL_BLESSING_SETS_ZH[0][0];
  if (fallback && fallback.text) return fallback;
  return FESTIVAL_BLESSING_SETS[safeFest]?.[s] || FESTIVAL_BLESSING_SETS[0][0];
}

// ---------------------------------------------------------------------------
// 8. Scan Fortune (Image Scan 2×5×5 & Signature 3×3×5) & Lucky Number Note
// ---------------------------------------------------------------------------
export const IMAGE_SCAN_READINGS_EN: readonly (readonly [string, string, string, string, string][])[] = [
  // mode 0: Face
  [
    // 0: Metal
    [
      'Clear facial radiance aligned with Metal energy—bright gaze and poise draw timely fortune.',
      'Forehead and cheekbones glow cleanly; Metal vitality attracts noble favor and steady trust.',
      'Balanced contours radiate quiet prosperity—Metal supports persuasive talks and smooth deals.',
      'Resolute eyes reflect firm Metal element—favorable for wise finance and long-term credit.',
      'Fresh complexion projects natural authority; Metal luck welcomes generous backing this week.',
    ],
    // 1: Water
    [
      'Clear facial radiance aligned with Water energy—gentle warmth invites auspicious turns.',
      'Soft eyes radiate natural charm; Water harmony eases collaboration and tender romance.',
      'Relaxed expression flows with Water grace—adapt swiftly to change and expect lucky trips.',
      'Refreshed glow signals strong Water presence, inviting serenity and kind support from elders.',
      'Open Water currents spark nimble wit and creative pathways toward bright rewards.',
    ],
    // 2: Wood
    [
      'Clear facial radiance aligned with Wood energy—vibrant poise signals rising fortune.',
      'Lively complexion echoes flourishing Wood—clear sign of steady expansion and growth.',
      'Wood aura stimulates forward-looking ideas—ideal for study, planning, and new allies.',
      'Youthful, hopeful countenance mirrors Wood vitality—quiet efforts steadily bloom.',
      'Gentle determination of Wood attracts like-minded partners ready to build beside you.',
    ],
    // 3: Fire
    [
      'Clear facial radiance aligned with Fire energy—sparkling focus invites standout luck.',
      'Bright eyes brim with creative spark; Fire boosts reputation, visibility, and leadership.',
      'Lively glow carries Fire warmth—confidence helps talents shine before wide audiences.',
      'Swift Fire currents attract brisk good news; temper zeal with calm care for doubled gain.',
      'Radiant Fire clears sluggishness, lighting bold fresh openings in work and community.',
    ],
    // 4: Earth
    [
      'Clear facial radiance aligned with Earth energy—grounded presence draws steady fortune.',
      'Poised features convey trustworthiness; Earth favors home stability, property, and family.',
      'Dignified Earth countenance inspires others to entrust key duties and assets to you.',
      'Quiet strength of Earth anchors fortune securely through shifting tides.',
      'Balanced Earth grace mirrors rich harvest—steady patience yields enduring wealth.',
    ],
  ],
  // mode 1: Palm
  [
    // 0: Metal
    [
      'Strong palm lines and mounts reflect Metal energy—life steadily turns toward firm stability.',
      'Full mounts channel Metal clarity; fate line highlights systematic wealth and sound planning.',
      'Crisp Metal palm lines signal decisive resolve—high-value ventures earn fitting esteem.',
      'Defined palm creases reflect Metal discipline—responsible diligence yields rich returns.',
      'Metal hand energy welcomes timely support from influential mentors.',
    ],
    // 1: Water
    [
      'Fluid palm lines reflect Water energy—graceful currents guide life toward calmer prosperity.',
      'Supple lines express Water artistry—strength in communication, design, and gentle diplomacy.',
      'Active Moon mount aligns with Water intuition—sharp instincts and luck via travel or digital commerce.',
      'Water palm traits reveal empathy and adaptability—solving tough puzzles through cool wisdom.',
      'Flowing Water energy on your palm encourages smooth circulation of income and opportunity.',
    ],
    // 2: Wood
    [
      'Branching palm lines reflect Wood energy—steady upward vigor marks thriving growth ahead.',
      'Life and head lines spread cleanly like Wood—sharp planning and ceaseless curiosity shine.',
      'Wood palm structure signals organic career expansion compounding gracefully over time.',
      'Strong Jupiter mount echoes Wood leadership—gifted for teaching, advising, and guiding teams.',
      'Resilient Wood vitality heals setbacks swiftly—few obstacles can halt long-term growth.',
    ],
    // 3: Fire
    [
      'Radiant palm lines reflect Fire energy—swift momentum carries life toward bright recognition.',
      'Clear Sun line highlights Fire passion—determined focus brings brisk honor and advance.',
      'Lively Fire markings reflect bold creativity, helping you stand out swiftly in your field.',
      'Action-ready Fire hands move fast—add calm double-checking before signing deals for clean wins.',
      'Sparkling Fire current across the palm draws fresh opportunities quickly into reach.',
    ],
    // 4: Earth
    [
      'Solid palm contours reflect Earth energy—quiet persistence builds lasting, grounded fortune.',
      'Substantial palm structure echoes Earth steadiness—prosperity forged through honest craft.',
      'Earth markings strongly bless real estate, crafts, and trust-based long-term ventures.',
      'Heart and life lines harmonize cleanly under Earth—warm family shelter stands dependable.',
      'Steadfast Earth energy guards hard-earned assets securely against needless leaks.',
    ],
  ],
];

export const IMAGE_SCAN_READINGS_ZH: readonly (readonly [string, string, string, string, string][])[] = [
  // mode 0: 面相
  [
    // 0: 金
    [
      '面相神采出众，映像主属“金”行；眼神清明透亮，近期颇具迎纳大吉顺运之象。',
      '额庭与颧部明润生辉，金气扶助声誉渐隆，易得长辈赏识与托付重任。',
      '轮廓匀称透显贵气，金象有利商务谈判顺畅推进、促成关键合作。',
      '目光沉毅坚定映照金行本色，正宜理智理财并稳步积累长期信用。',
      '肤色明洁自生旺财磁场，本周金行护佑易见佳财与良师鼎力扶持。',
    ],
    // 1: 水
    [
      '面相润泽柔和，映像主属“水”行；目光温润清澈，吉运正顺水势聚拢而来。',
      '神情亲和充满慈悲魅力，水行滋润令沟通公关与良缘情感格外顺畅。',
      '面容松弛舒展契合水德，临机应变灵敏且有望于奔波出行中收获喜财。',
      '神采水润充沛显现水行之象，为您引来内心安适与宽厚长辈怜惜垂青。',
      '水系面相灵气敞开，敏锐悟性与文思创意正牵引您步向雅致新机。',
    ],
    // 2: 木
    [
      '面相蕴藏生发之气，映像主属“木”行；眉宇清明蓬勃，正值运势节节高升之时。',
      '气色清新充满生机正应木象，预示万事起新苗、业务逐步扩展兴隆之兆。',
      '木气护持上进宏图，极宜潜心深造进修、规划蓝图并广结新挚友。',
      '神情年轻朝气心怀希冀，木行助力过往辛勤付出缓缓抽枝结出美果。',
      '温柔而坚定的木系定力正吸引理念同频的伙伴团队并肩同行。',
    ],
    // 3: 火
    [
      '面相光泽亮堂，映像主属“火”行；神采焕发灼亮，吉讯好运正加速汇集。',
      '眼眸闪耀创造光彩，火行强力推升个人声名显赫、魅力关注与领导威望。',
      '面露热烈朝气勃勃，火气助您勇于一展才华并赢得众人由衷喝彩认可。',
      '火行敏速招引捷报频传，只需持稳冷静不躁，成果自会成倍绽放。',
      '火系明耀光晕一扫沉闷怠惰，在工作与社交舞台骤然点亮亮眼契机。',
    ],
    // 4: 土
    [
      '面相厚重沉稳，映像主属“土”行；神态从容安泰，好运正向踏实稳健凝聚。',
      '气度端凝极富信赖感，土象尤助不动产置业、基业扎根与家门和美。',
      '稳重端正的土象面相令周遭深信不疑，乐于将核心要务或资财放心相托。',
      '厚土之定静化作天然护盾，护佑您在世事起伏之中依旧从容不迫。',
      '土行神采暗合丰收盈满之德，愈是沉心久耕，长远回报愈加丰厚醇美。',
    ],
  ],
  // mode 1: 手相
  [
    // 0: 金
    [
      '掌纹与掌丘清晰有力，映像主属“金”行；预示运势正稳步回升迈向坚实格局。',
      '掌丘饱满承接金气，事业命运线明朗，主擅系统规划、积累财帛有道。',
      '金型掌纹果决鲜明，操盘重要事务常能打造出高价值与崇高专业口碑。',
      '纹路刻划清晰深长应合金德，认真扛起担当必将收获名实相符的厚报。',
      '金气充盈手心，易迎来实力雄厚、见识广博的贵人伸出援手扶持。',
    ],
    // 1: 水
    [
      '掌纹柔和流转，映像主属“水”行；蕴示人生节律正灵活转向顺畅安稳。',
      '掌线秀美顺水德生发，在艺术审美、文辞沟通与柔化利益上独具优势。',
      '月丘丰润暗合水象灵性，直觉敏锐出众，且具出行贸易或网路获利良缘。',
      '水系手相映见仁慈之心与圆融通变，擅长凭冷静慧智巧解棘手难题。',
      '流水盈手之气场正温和助推资金流畅循环、往来进益绵绵不绝。',
    ],
    // 2: 木
    [
      '掌纹秀直延展，映像主属“木”行；生命运途恰如林木向阳，渐入稳健佳境。',
      '生命线与智慧线宛如繁枝伸展应木行，统筹大局与终身治学能力俱佳。',
      '木象手相表明职业发展势头长青，成绩将随岁月沉淀成倍递进增长。',
      '木星丘隆起承接木行秀气，极宜担当传道授业、顾问咨询与统率团队。',
      '木德手相自我复原力强劲，任凭途中偶现波折亦难阻其长远向上腾飞。',
    ],
    // 3: 火
    [
      '掌纹明朗活跃，映像主属“火”行；人生正值冲刺跃升、破局开朗的明快节奏。',
      '太阳线与重要主丘因火而显赫，果敢毅力将很快换来耀眼晋升与美名。',
      '火象手纹彰显无畏胆魄与开拓锐气，令您在同行之中脱颖而出抢占先机。',
      '火手雷厉风行，只需签约落笔前多加一份冷静复盘便能圆满滴水不漏。',
      '掌心勃发的火流气场正迅速聚拢鲜活新机遇，助真挚心愿更早结成实果。',
    ],
    // 4: 土
    [
      '手掌厚实稳重、主纹安固，映像主属“土”行；运程正扎实转向丰裕稳健。',
      '厚实端正的土型手相，主凭真本领与金字诚信一砖一瓦筑就深厚基业。',
      '土象手相格外契合土地建筑、实业耕耘以及重诺守信的长线稳健生意。',
      '感情线与生命线在土德调和下平衡舒展，家庭生活安稳和睦、彼此可依。',
      '厚土之力在掌间稳稳守财护产，财库安固不易因虚耗而无端外流。',
    ],
  ],
];

const SCAN_ELEMENT_TO_IDX: Record<string, number> = {
  โลหะ: 0,
  ทอง: 0,
  น้ำ: 1,
  ไม้: 2,
  ไฟ: 3,
  ดิน: 4,
};

export function getLocalizedImageScanReading(
  mode: number,
  elementTh: string,
  setIdx: number,
  lang: SupportedLang,
  fallbackTh?: string
): string {
  const m = mode === 1 ? 1 : 0;
  const elIdx = SCAN_ELEMENT_TO_IDX[(elementTh || '').trim()] ?? 0;
  const s = safeSet(setIdx);
  if (lang === 'en') return IMAGE_SCAN_READINGS_EN[m]?.[elIdx]?.[s] || '';
  if (lang === 'zh') return IMAGE_SCAN_READINGS_ZH[m]?.[elIdx]?.[s] || '';
  if (fallbackTh) return fallbackTh;
  return IMAGE_SCAN_READINGS[m]?.[elIdx]?.[s] || '';
}

export const SIGNATURE_TRAIT_SETS_EN = {
  size: [
    [
      'Compact signature reflects careful attention to detail and a love of quiet peace.',
      'Trim proportions show precision, methodical habits, and organized steady execution.',
      'Tightly knit strokes signify calm restraint, diplomacy, and modest confidence.',
      'Fine-scale signature signals deep concentration suited to specialized planning.',
      'Neat, compact framing supports careful stewardship of wealth and fact-based choices.',
    ],
    [
      'Medium-balanced strokes mirror healthy harmony between self-expression and others.',
      'Well-proportioned signature reflects natural flexibility—knowing when to advance or pause.',
      'Balanced hand size points to smooth rapport across every circle with approachable grace.',
      'Comfortable proportions on the page show steady governance over life and work.',
      'Steady medium rhythm blends quiet conviction with openness to fresh perspectives.',
    ],
    [
      'Bold, expansive signature conveys vivid confidence and natural stage presence.',
      'Wide sweeping strokes reveal broad vision and readiness to shoulder major projects.',
      'Open, generous calligraphy radiates leadership magnetism and drive for big milestones.',
      'Commanding size draws immediate eye—boosting persuasion in talks and business growth.',
      'Airy spacious lettering mirrors an open, compassionate heart eager to uplift others.',
    ],
  ],
  rise: [
    [
      'Downward slant signals cautious contemplation—offer yourself gentler encouragement.',
      'Slightly dipping tail urges setting down excess worry and trusting your strengths more.',
      'Down-tilted cadence favors thorough review; tilting the final stroke up lifts openness.',
      'Softening ending lines mirror quiet fatigue—prioritize rest and celebrate past wins.',
      'Descending rhythm hints at humility paired with self-pressure; step forward bravely.',
    ],
    [
      'Level baseline reflects emotional steadiness and dependable inner poise.',
      'Parallel horizontal flow marks fairness, reliability, and honoring every commitment.',
      'Steady horizon strokes show composure unshaken by passing noise—an anchor for peers.',
      'Balanced horizontal plane signals orderly continuity across daily life and business.',
      'Constant level stroke reflects crisp self-command during fast-moving moments.',
    ],
    [
      'Rising trajectory radiates quiet hope and constructive optimism.',
      'Upward tail flick signals healthy ambition and steady forward progress.',
      'Ascending baseline boosts career momentum, inviting inspiration and bright milestones.',
      'Climbing strokes express resilient grit that keeps growing past every hurdle.',
      'Upward lift favors fresh launches, letting mentors spot your sincere drive swiftly.',
    ],
  ],
  jagged: [
    [
      'Smooth flowing curves reflect gentle grace and effortless adaptability.',
      'Continuous rounded strokes aid smooth negotiations and warm, friendly rapport.',
      'Fluid, unbroken sweeps indicate agile thinking that resolves knots harmoniously.',
      'Silky connected strokes express warmth and natural skill at mending tensions.',
      'Even, gliding cadence hints at steady, unobstructed flow in work and income.',
    ],
    [
      'Balanced cadence pairs gentle warmth with quiet firmness whenever needed.',
      'Mix of crisp angles and smooth curves blends tactful compromise with clear boundaries.',
      'Even pen pressure mirrors sound logic paired cleanly with sincere empathy.',
      'Poised middle pacing signals practical, step-by-step problem solving in real time.',
      'Harmony of softness and clarity enhances grace across both service and leadership.',
    ],
    [
      'Crisp angular turns reflect swift thought and fast-shifting emotional energy.',
      'Sharp corners signal razor-keen analysis and rapid judgment under pressure.',
      'Frequent sharp pivots show vibrant drive and high creativity—breathe steadily before deciding.',
      'Pointed angles highlight quick wit; soften blunt edges slightly to prevent friction.',
      'Swift, energetic turns hold strong momentum—structured priorities turn speed into triumph.',
    ],
  ],
} as const;

export const SIGNATURE_TRAIT_SETS_ZH = {
  size: [
    [
      '字迹小巧紧凑，反映处事细致严谨、内心向往宁静平和。',
      '收放有度的签幅显示注重细节，擅长按部就班条理分明地办事。',
      '线条精致内敛，说明为人沉着谦和、懂得圆融退让不喜张扬。',
      '凝练字形表明极佳的专注定力，长于深度统筹专项细致事务。',
      '紧凑稳当的格局最利于守紧财库，重大决断皆以客观事实为准。',
    ],
    [
      '字幅大小适中，体现自我主张与兼顾他人感受之间的良好平衡。',
      '结构比例恰当，说明通达灵活、深谙何时该奋进何时宜沉稳蓄势。',
      '均衡舒展的字体能同各层级顺畅对接，自带令人舒心的亲和魅力。',
      '布局与版面相得益彰，映照您把生活与事业打理得平稳妥当。',
      '中等字势既有内在笃定主见，也始终保持倾听多元看法的开放胸怀。',
    ],
    [
      '签名大气舒展，尽显自信坦荡及乐于凝聚人群核心的胸襟气场。',
      '行笔宽阔放达，胸怀高远格局，勇于扛起大项目与核心重责。',
      '字体开阔俊朗，自带领袖风范与奔向非凡成就的充沛雄心。',
      '颇具存在感的大气字势尤为吸睛，在商谈签约与事业扩张上极加分。',
      '笔画间留白疏朗映见宽厚心胸，心怀仁善且乐于伸援帮扶他人。',
    ],
  ],
  rise: [
    [
      '收笔微微下倾，反映行事谨小慎微且易思虑过多，请常给自己打气鼓励。',
      '末笔略显低垂，提醒适当卸下紧绷心压，多肯定并相信自身潜能。',
      '下行笔调偏重周全反思，试着在末笔轻轻向上一挑更能开启新机气象。',
      '尾锋趋软映见些许累意积累，宜好好歇息并在过往功绩中重拾自信。',
      '向下的走势兼具谦逊与自我严求，多一分笃定信心步履将更加昂扬。',
    ],
    [
      '笔势平正稳妥，反映内心锚定扎实、情绪起伏平和安定。',
      '横平竖稳的平行势态象征为人处事公允厚道、重信守诺值得深交。',
      '匀速稳直的线迹显示不易被外界浮躁牵动心神，堪称团队定海神针。',
      '落笔始终平衡于同一水平面，生活与事业推进正呈稳步长红曲线。',
      '线条定静干练，临危急状况依然能沉住气自若掌控全局。',
    ],
    [
      '笔锋昂扬上行，流露心怀光明希冀与正向进取之生机。',
      '收尾有力仰起，预示充满良性抱负与持续攀登高峰的旺象。',
      '向上走势添旺事业步步高升，广纳鲜活灵感与来日荣光顺遂。',
      '挺拔向上的笔触体现越挫越勇的韧劲，不向困难低头且不断精进。',
      '升腾之势极利于启动全新谋划，极易让赏识您的贵人前辈一眼看见。',
    ],
  ],
  jagged: [
    [
      '曲线行云流水，折射柔和包容之心与极佳的随缘调适适应力。',
      '圆润连贯的弧笔助于业务磋商圆融顺利，并轻松收获真挚友谊。',
      '走势轻盈不滞，脑筋活络擅于温柔优雅地为复杂困局寻得出路。',
      '滑润不突兀的运笔体现仁厚心地，具备出色化解分歧之高情商。',
      '丝滑不绝的书写节奏正是近期财运与工作顺风顺水、少卡顿之佳兆。',
    ],
    [
      '刚柔并济、快慢适中，既能柔和变通又于关键原则毫不动摇。',
      '兼顾利落折角与温润弧度，进退有据既顾全和谐又不丢个人立场。',
      '行笔力度匀净，感性与理智兼备，既善共情体谅又护得住自身权益。',
      '稳当节律体现遇事条分缕析、一步一脚印依循实况务实调优。',
      '字里行间兼具温和气度与决断锐气，服务协作与带队统御皆游刃有余。',
    ],
    [
      '折笔转角鲜明，反映思维敏捷迅疾、思绪转换极富爆发张力。',
      '利落锐角彰显洞察犀利剖析透彻，紧急时刻能迅速拍板拿稳主意。',
      '频繁转折显示行动力与锐利创意高企，做重大决定前先深呼吸缓几秒更稳。',
      '尖锐折角凸显绝佳反应机智，说话沟通略添几分温和余韵可防生误会。',
      '运笔果断迅捷充满爆发冲劲，只要善加归整次序便能极速斩获卓越佳绩。',
    ],
  ],
} as const;

export function getLocalizedSignatureTraits(
  indices: [number, number, number],
  setIdx: number,
  lang: SupportedLang,
  fallbackTh?: string[]
): [string, string, string] {
  const [sz, rs, jc] = indices;
  const s = safeSet(setIdx);
  if (lang === 'en') {
    return [
      SIGNATURE_TRAIT_SETS_EN.size[sz]?.[s] || '',
      SIGNATURE_TRAIT_SETS_EN.rise[rs]?.[s] || '',
      SIGNATURE_TRAIT_SETS_EN.jagged[jc]?.[s] || '',
    ];
  }
  if (lang === 'zh') {
    return [
      SIGNATURE_TRAIT_SETS_ZH.size[sz]?.[s] || '',
      SIGNATURE_TRAIT_SETS_ZH.rise[rs]?.[s] || '',
      SIGNATURE_TRAIT_SETS_ZH.jagged[jc]?.[s] || '',
    ];
  }
  if (fallbackTh && fallbackTh.length >= 3) {
    return [fallbackTh[0], fallbackTh[1], fallbackTh[2]];
  }
  return [
    SIGNATURE_TRAIT_SETS.size[sz]?.[s] || '',
    SIGNATURE_TRAIT_SETS.rise[rs]?.[s] || '',
    SIGNATURE_TRAIT_SETS.jagged[jc]?.[s] || '',
  ];
}

export function getLocalizedLuckyNumberNote(lang: SupportedLang): string {
  if (lang === 'en') {
    return 'These auspicious numbers are for mindfulness, inspiration, and entertainment only — not real lottery predictions, as games of chance always carry risk.';
  }
  if (lang === 'zh') {
    return '以下吉数仅供日常灵感祈福与休闲娱乐参考，并非真实彩票开奖预测；请理性看待博弈风险。';
  }
  return 'เลขนี้ใช้เพื่อความบันเทิงเท่านั้น ไม่ได้ทำนายผลสลากจริง และการเสี่ยงโชคมีความเสี่ยงเสมอ';
}

export function getLocalizedOfferingResult(
  res: OfferingResult,
  setIdx: number,
  lang: SupportedLang
): OfferingResult {
  if (res.care) {
    return {
      ...res,
      message: CARE_MESSAGE_LOCALIZED[lang],
    };
  }
  const catIdx = getOfferingCategoryIndex(res.category);
  const s = safeSet(setIdx);
  const category = OFFERING_CATEGORIES_LOCALIZED[catIdx]?.[lang] || res.category;
  const message =
    lang === 'en'
      ? OFFERING_GUIDE_SETS_EN[catIdx]?.[s] || res.message
      : lang === 'zh'
      ? OFFERING_GUIDE_SETS_ZH[catIdx]?.[s] || res.message
      : OFFERING_GUIDE_SETS[catIdx]?.[s] || res.message;
  const color = res.color ? getLocalizedColorName(res.color, lang) : res.color;
  return {
    ...res,
    category,
    message,
    color,
  };
}

export function getLocalizedRemedyResult(
  res: RemedyResult,
  setIdx: number,
  problemIdx: number,
  lang: SupportedLang
): RemedyResult {
  const rel = ((res.relation % 5) + 5) % 5;
  const p = ((problemIdx % 4) + 4) % 4;
  const s = safeSet(setIdx);
  const problemNames: Record<SupportedLang, readonly [string, string, string, string]> = {
    th: ['การเงิน', 'ความรัก', 'สุขภาพ', 'การงาน'],
    en: ['Finance', 'Love', 'Health', 'Career'],
    zh: ['财运', '姻缘', '健康', '事业'],
  };
  if (lang === 'th') {
    return {
      ...res,
      summary: REMEDY_SUMMARY_SETS[rel]?.[s] || res.summary,
      practical: REMEDY_PRACTICAL_SETS[p]?.[s] || res.practical,
      merit: REMEDY_MERIT_SETS[p]?.[s] || res.merit,
      mantra: [...(REMEDY_MANTRA_SETS[s] || res.mantra)],
    };
  }
  return {
    ...res,
    zodiac_name: getLocalizedZodiacNameByThai(res.zodiac_name, lang),
    year_name: getLocalizedZodiacNameByThai(res.year_name, lang),
    problem: problemNames[lang][p] || res.problem,
    summary:
      (lang === 'en' ? REMEDY_SUMMARY_SETS_EN[rel]?.[s] : REMEDY_SUMMARY_SETS_ZH[rel]?.[s]) ||
      res.summary,
    practical:
      (lang === 'en' ? REMEDY_PRACTICAL_SETS_EN[p]?.[s] : REMEDY_PRACTICAL_SETS_ZH[p]?.[s]) ||
      res.practical,
    merit:
      (lang === 'en' ? REMEDY_MERIT_SETS_EN[p]?.[s] : REMEDY_MERIT_SETS_ZH[p]?.[s]) ||
      res.merit,
    color: getLocalizedColorName(res.color, lang),
    direction: getLocalizedDirectionName(res.direction, lang),
    mantra: [
      ...((lang === 'en' ? REMEDY_MANTRA_SETS_EN[s] : REMEDY_MANTRA_SETS_ZH[s]) || res.mantra),
    ],
  };
}
