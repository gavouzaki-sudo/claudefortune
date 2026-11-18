import type { SupportedLang } from './types';
import type { StickResult } from '../../types';
import {
  STICK_VERSE_SETS,
  STICK_ASPECT_SETS,
  TAROT_MEANING_SETS,
  TAROT_TITLE_ZH,
  type TarotMeaningSet,
} from '../ritualProphecies';

// ---------------------------------------------------------------------------
// 1. Siamese Sticks (28 sticks × 5 sets + 4 tiers × 4 aspects × 5 sets)
// ---------------------------------------------------------------------------
export const STICK_TITLES_LOCALIZED: readonly { th: string; en: string; zh: string }[] = [
  { th: 'มังกรทะยานฟ้า', en: 'Dragon Soaring Heavenward', zh: '神龙腾霄' },
  { th: 'ตะวันพ้นหมอก', en: 'Sun Breaking Through the Mist', zh: '拨云见日' },
  { th: 'สะพานข้ามสายน้ำ', en: 'Bridge Across the Stream', zh: '小桥渡水' },
  { th: 'ต้นไม้ผลิดอก', en: 'Tree Bursting into Bloom', zh: '枯木逢春' },
  { th: 'เรือฝ่าคลื่นลม', en: 'Boat Braving Wind and Waves', zh: '扁舟破浪' },
  { th: 'เทียนไหวในลมเบา', en: 'Candle Flickering in a Gentle Breeze', zh: '微风摇烛' },
  { th: 'หงส์ฟ้ากางปีก', en: 'Celestial Phoenix Spreading Its Wings', zh: '金凤展翼' },
  { th: 'ภูเขาหมอกคลุม', en: 'Mountain Veiled in Cloud', zh: '云雾锁山' },
  { th: 'นกน้อยรังใหม่', en: 'Little Bird Building a New Nest', zh: '雏雀筑巢' },
  { th: 'กระต่ายใต้จันทร์', en: 'Hare Beneath the Moonlight', zh: '月下玉兔' },
  { th: 'ฝนแล้งรอเมฆ', en: 'Parched Earth Awaiting Rain', zh: '旱苗盼雨' },
  { th: 'ดอกบัวพ้นโคลน', en: 'Lotus Rising Above the Mire', zh: '出泥青莲' },
  { th: 'ทองคำในธารทราย', en: 'Gold Hidden in River Sand', zh: '沙里淘金' },
  { th: 'ระฆังยามเช้า', en: 'Morning Temple Bell', zh: '晨钟清响' },
  { th: 'ม้าเร็วบนทางโล่ง', en: 'Swift Steed on the Open Road', zh: '骏马奔原' },
  { th: 'ฟ้าครึ้มก่อนฝน', en: 'Overcast Sky Before the Storm', zh: '山雨欲来' },
  { th: 'ประตูปิดสนิท', en: 'The Bolted Gate', zh: '朱门紧闭' },
  { th: 'เกลียวคลื่นสู่ฝั่ง', en: 'Ripples Reaching the Shore', zh: '浪涌归岸' },
  { th: 'ปลาคาร์ปข้ามประตูมังกร', en: 'Koi Leaping the Dragon Gate', zh: '鲤跃龙门' },
  { th: 'ลานวัดยามเย็น', en: 'Temple Courtyard at Dusk', zh: '暮色禅庭' },
  { th: 'กิ่งหักกลางลม', en: 'Dry Branch Snapped by the Wind', zh: '风折枯枝' },
  { th: 'เมฆดำเหนือทุ่งนา', en: 'Dark Clouds Over the Fields', zh: '乌云压野' },
  { th: 'สะพานไม้เก่า', en: 'Old Wooden Footbridge', zh: '古木旧桥' },
  { th: 'ลมใต้ปีกนก', en: 'Wind Beneath the Wings', zh: '顺风托翼' },
  { th: 'ดาวเหนือนำทาง', en: 'Guiding North Star', zh: '北斗引路' },
  { th: 'แสงทองยามรุ่ง', en: 'Golden Dawn Light', zh: '晓光初照' },
  { th: 'เงาในกระจกน้ำ', en: 'Reflections on Water', zh: '水镜幻影' },
  { th: 'ทางแยกในป่า', en: 'Crossroads in the Forest', zh: '林间歧路' },
];

export const STICK_LEVEL_NAMES_LOCALIZED: Record<SupportedLang, readonly [string, string, string, string]> = {
  th: ['ดีเยี่ยม', 'ดี', 'ปานกลาง', 'ควรระวัง'],
  en: ['Supreme Fortune', 'Favorable', 'Balanced', 'Take Care'],
  zh: ['上上大吉', '中吉顺遂', '平吉稳守', '下吉宜慎'],
};

export const STICK_ASPECT_NAMES_LOCALIZED: Record<SupportedLang, readonly [string, string, string, string]> = {
  th: ['การเงิน', 'ความรัก', 'สุขภาพ', 'การงาน'],
  en: ['Finance', 'Love', 'Health', 'Career'],
  zh: ['财运', '姻缘', '健康', '事业'],
};

export const STICK_VERSE_SETS_EN: readonly [string, string, string, string, string][] = [
  [
    'Tailwinds lift a resolute heart; heaven awaits your earnest resolve.',
    'The dragon stirs from slumber; clouds part for those who persevere.',
    'Golden wings unfurl above the peaks; destiny opens the path to triumph.',
    'Heaven grants a golden hour—act with integrity and great success follows.',
    'Winds and waves speed your vessel onward; past merit and present timing align.',
  ],
  [
    'The obscuring clouds have passed; bright light now shines ahead.',
    'Dawn illuminates the horizon; lingering worries quietly dissolve.',
    'Morning mist clears away, revealing a fresher and brighter road.',
    'After a dark night, the warm sun restores strength and clarity to your heart.',
    'Patience has carried you through uncertainty; clear direction now emerges.',
  ],
  [
    'Step carefully one pace at a time; the far shore is not far away.',
    'A timber bridge spans the stream—walk mindfully and you will arrive safely.',
    'Though currents rush beneath the bridge, steady poise brings you safely across.',
    'One deliberate step outweighs a grand leap taken without reflection.',
    'Your destination awaits across the bank; prudence is your truest companion.',
  ],
  [
    'Planted with patience, today those seeds begin bearing fine fruit.',
    'Branches burst with buds; your quiet diligence now blossoms into reward.',
    'Roots long anchored beneath the soil now welcome their season of bloom.',
    'Clear water and steady care bring vibrant blossoms before your eyes.',
    'Every ounce of kindness and effort you invested is taking root and flourishing.',
  ],
  [
    'Great waves always subside when your hands hold the helm steady.',
    'Your ship braves strong gusts; stay grounded and you will reach harbor safely.',
    'Tempests at sea test the spirit; a calm mind never loses its bearings.',
    'Do not panic at crashing swells—seasoned wisdom guides you into calm waters.',
    'Anchor your mindfulness; winds and waves will soon soften.',
  ],
  [
    'A small flame lights the path; keep your heart from wavering.',
    'A candle in a gentle breeze stays tender yet steadfast through the night.',
    'Guard the inner lantern of your spirit—it is bright enough for tonight’s step.',
    'Soft drafts pass from time to time; let inner stillness shield your flame.',
    'Even a modest spark holds priceless worth in the dark; nurture your faith.',
  ],
  [
    'Virtue cultivated long ago now blooms openly for the world to see.',
    'The golden phoenix descends into the garden; honor and good news draw near.',
    'Soaring gracefully above the clouds, mentors and peers look upon you kindly.',
    'Integrity built in quiet days now opens doors of auspicious opportunity.',
    'Your life enters a radiant chapter, drawing true allies and achievement.',
  ],
  [
    'The trail ahead remains veiled; wait for the fog to lift before stepping forth.',
    'Peaks sit wrapped in mist—pause and survey the terrain before major choices.',
    'Rushing through dense fog invites missteps; waiting a moment keeps you safe.',
    'It is not yet time to show every card; gather facts and wait for clear skies.',
    'Observe developments calmly; once mist parts, the true path reveals itself.',
  ],
  [
    'Begin with humble steps; build steadily toward lasting stability.',
    'A little bird gathers twig by twig; a warm, secure nest is taking shape.',
    'Enduring success rises brick by brick when laid with patience and care.',
    'Never belittle today’s small strides—they form tomorrow’s firm foundation.',
    'Songbirds greet the dawn; fresh vitality blossoms in home and work.',
  ],
  [
    'Do not chase shimmering illusions; ask your own heart what is true.',
    'Moonlight on water looks vivid yet cannot be held—distinguish truth from mirage.',
    'Examine your deepest wishes before following the applause of the crowd.',
    'Quiet reflection beneath the moon reveals details previously overlooked.',
    'Weigh reason alongside feeling so sweet words never lead you astray.',
  ],
  [
    'Scarcity is only temporary; conserve wisely while awaiting the rain.',
    'Dry earth awaits the first shower—preserve your energy and resources now.',
    'A dry season teaches the worth of every drop; careful budgeting sees you through.',
    'Rainclouds are gathering in the distance; hold steady just a little longer.',
    'Trim needless expenses and guard your health; when rain falls, all revives.',
  ],
  [
    'Having risen past hardship, you now bloom gracefully above still waters.',
    'The lotus emerges unsullied from mud to greet the sun; trials forged your strength.',
    'Sincerity and pure conduct lift you clear of tangled past troubles.',
    'After heavy seasons, respect and peace of mind return to comfort you.',
    'Radiant above turmoil, serenity and auspicious grace surround your path.',
  ],
  [
    'Treasures lie close at hand; diligent seeking uncovers them.',
    'Gold glints quietly in clear river sand—look closely at what surrounds you.',
    'Unceasing persistence turns ordinary chances into genuine wealth.',
    'Familiar skills and trusted bonds are ready to yield pride and income.',
    'A raw gem awaits your polish; add extra care and the result shines.',
  ],
  [
    'A clear chime awakens hope; a new dawn favors fresh beginnings.',
    'The morning temple bell resonates afar; good news from afar or elders arrives.',
    'Begin the day with a bright spirit; lingering knots untangle smoothly.',
    'An auspicious call invites you to welcome fresh opportunity knocking at your door.',
    'Timing aligns harmoniously—launch your plans or important talks with confidence.',
  ],
  [
    'Seize the auspicious timing swiftly, yet keep your eyes on the road.',
    'A noble steed gallops across open plains; swifter progress than expected arrives.',
    'Golden chances race to meet you; agility paired with mindfulness seals victory.',
    'Travel and negotiations flow briskly now—simply avoid overreaching speed.',
    'Full of vigor, surge toward your goal with poised alertness.',
  ],
  [
    'Prepare your umbrella in advance; clear skies follow once the storm passes.',
    'Dark clouds gather in the distance; backup plans keep you steady and secure.',
    'Heed early warning signs—prevention serves better than later repair.',
    'Squalls blow hard yet pass swiftly; stay calm and await the rainbow.',
    'Mind your words and key documents; brighter skies await beyond this cloud.',
  ],
  [
    'Do not exhaust yourself forcing a locked door; await its natural opening.',
    'A tightly bolted gate signals that the right hour has not yet arrived.',
    'Pushing blindly drains strength—step back, organize, and timing will open.',
    'Certain matters are not closed forever; they simply need more time to ripen.',
    'Tend the doors already open to you, and this latch will yield in due course.',
  ],
  [
    'No sincere effort is wasted; every wave brings your boat nearer shore.',
    'Gentle ripples carry the vessel beachward, steady and never turning back.',
    'Consistent work on your goals draws closer to the finish line each day.',
    'Encouragement from loved ones upholds your stride forward.',
    'The horizon brightens step by step—sustain this steady rhythm.',
  ],
  [
    'Endure swimming against the current; ultimate triumph awaits at the crest.',
    'A koi leaps the Dragon Gate waterfall—great trials transform into high honor.',
    'Refusing to yield to obstacles elevates you to a higher chapter of life.',
    'Though your climb demands extra effort, the reward at the summit excels all.',
    'Courage turns headwinds into lift toward lasting mastery.',
  ],
  [
    'Peace of mind is true wealth; lasting joy lives in sufficiency.',
    'Beneath evening temple bodhi shade, cool breezes soothe every restless thought.',
    'Simplicity and contentment bring richness no coin can purchase.',
    'Release comparison with others and discover authentic inner fortune.',
    'Harmony surrounds you as family and friends offer heartfelt warmth.',
  ],
  [
    'What is unessential falls away so the trunk may grow stronger.',
    'Winds snap dry branches, clearing space for tender green shoots to emerge.',
    'An ending or release may be quiet protection sparing you heavier weight.',
    'Let go of what stalls growth so your core roots stand unshaken.',
    'Once life is decluttered, lighter ease and sturdier growth follow.',
  ],
  [
    'Heavy work is not yet complete; guard against errors born of haste.',
    'Dusk clouds over the fields remind you to inspect details before harvest.',
    'Multiple duties press at once—prioritize step by step to stay in command.',
    'Urgency risks overlooking vital details; review everything once more.',
    'Settle tasks patiently without overtaxing your body or spirit.',
  ],
  [
    'Test the footing thoroughly before you step, then cross without haste.',
    'Old planks across the brook still hold if you test weight step by step.',
    'Verify contracts, terms, and promises clearly before committing.',
    'There is no need to race others; slow and steady reaches the mark whole.',
    'Thorough care today closes off future risks.',
  ],
  [
    'Helpful allies rise to support you; receive grace and return kindness.',
    'Gentle updrafts lift the bird higher without straining its wings.',
    'True friends and mentors extend wise counsel and welcome openings.',
    'Cooperation and generosity bring complex efforts to graceful completion.',
    'Remember those who stood beside you and repay loyalty sincerely.',
  ],
  [
    'With a clear destination, you never lose direction even under dark skies.',
    'The North Star shines steadfast on the horizon, anchoring every choice.',
    'No matter how seasons shift, your core values and stance remain firm.',
    'Focus and admirable discipline attract enduring prosperity.',
    'Your vision ahead is clear—march forward along your chosen plan.',
  ],
  [
    'A fresh day brings fresh opportunity; rise to meet it with gladness.',
    'Silver and gold tinge the dawn, breathing crisp vitality into new starts.',
    'Enthusiasm and a warm smile open doors to wealth and friendship.',
    'Tangled thoughts loosen, making way for joyful news.',
    'Dawn carries bright fortune—early good deeds bless the whole day.',
  ],
  [
    'Pause and reflect before deciding; surface appearances rarely tell all.',
    'Ripples distort reflections on water—wait for stillness to see truth clearly.',
    'Do not trust rumors or first impressions; verify the background first.',
    'Poise and discernment protect you cleanly from misunderstandings.',
    'Hear both sides thoroughly before acting, and your judgment hits the mark.',
  ],
  [
    'Choose your path with clear facts and a calm mind; no need to rush.',
    'At forest crossroads, consult your inner compass before choosing a trail.',
    'Multiple paths appear—seeking wise counsel clarifies which suits you best.',
    'Hesitation fades once you rank what truly matters in your life.',
    'No road is wholly wrong once chosen thoughtfully and walked responsibly.',
  ],
];

export const STICK_VERSE_SETS_ZH: readonly [string, string, string, string, string][] = [
  [
    '东风得意送行舟，天意垂青志必酬。',
    '潜龙醒蛰腾云起，雾散天开路自通。',
    '金翼高翔凌绝顶，青云得路耀前程。',
    '天赐良机正此时，诚心笃行必成大事。',
    '顺风顺水助帆行，旧福新缘共聚辉。',
  ],
  [
    '乌云既散见晴空，万里光明在眼前。',
    '曙色初开照四方，烦忧渐化入清风。',
    '晨雾消融展新途，柳暗花明气象新。',
    '长夜既尽朝阳暖，定心静气见生机。',
    '守得云开见月明，自此方向渐清晰。',
  ],
  [
    '步步为营莫急躁，彼岸风光已在望。',
    '木桥横渡清溪水，沉心稳步自然通。',
    '纵然桥下急流涌，从容不迫保安康。',
    '踏实前行胜盲进，深思熟虑方无虞。',
    '彼岸清宁待归人，谨慎同行胜千金。',
  ],
  [
    '昔日辛勤播善因，今朝花发渐成荫。',
    '新枝吐蕊报春光，诚心耕耘终见果。',
    '深根固本待时久，喜迎繁花满园春。',
    '清泉浇灌心血成，枝头硕果映晴空。',
    '善行苦功皆不负，水到渠成庆丰年。',
  ],
  [
    '狂风巨浪终须息，稳把航舵自有方。',
    '孤舟破浪迎风行，定神稳守必安然。',
    '沧海风波是历练，心静自然不迷航。',
    '莫因浪涌生惊慌，阅历终引入静港。',
    '定心持正莫动摇，风平浪静就在即。',
  ],
  [
    '微灯虽小照前途，莫教心志随风摇。',
    '风中残烛光犹在，细心护持夜色明。',
    '守住心中一盏灯，足照明朝前行路。',
    '微风拂动休惊扰，静气如同护灯罩。',
    '暗夜微光价值千金，信心不灭福自存。',
  ],
  [
    '积善之家庆有余，声名福泽正芳菲。',
    '金凤翩然落瑶园，嘉音荣耀次第来。',
    '凌云展翅仪态佳，贵人亲友皆赞赏。',
    '诚笃积德终感天，良机门户为您开。',
    '流年焕彩辉星斗，良朋佳绩伴身行。',
  ],
  [
    '前路微茫雾未消，静待清明再启程。',
    '山巅尚笼层云雾，停步观局莫妄断。',
    '浓雾急行易失足，暂缓观势更安全。',
    '时机未熟勿尽显，收集周全待天晴。',
    '静观其变心莫急，云开自见真路径。',
  ],
  [
    '万丈高楼平地起，点滴累积自成真。',
    '雏雀衔枝筑暖巢，家业安稳渐成形。',
    '长久基业赖微功，一砖一瓦尽用心。',
    '莫轻今日小步进，正是他年大栋梁。',
    '晨鸟清啼迎日出，家宅事业生机旺。',
  ],
  [
    '莫逐水中空花影，反观本心辨真伪。',
    '水中月影虽明净，虚幻难握须分明。',
    '细思内心真所求，莫被喧嚣浮誉迷。',
    '月下沉心静思量，便见往日未察处。',
    '理智同行真心在，甜言浮华难动摇。',
  ],
  [
    '一时清贫莫长忧，节用蓄力待甘霖。',
    '久旱沃土盼初雨，俭省储备以待时。',
    '清苦教人惜寸水，周密理财自渡关。',
    '远方雨云已凝聚，忍耐坚持胜百计。',
    '删减虚耗保康健，春雨一降万物苏。',
  ],
  [
    '历尽艰辛出浊流，净莲亭立照清波。',
    '荷花出泥向朝阳，逆境琢磨成铁骨。',
    '清白正直护君行，脱离旧扰得自在。',
    '苦尽甘来添尊荣，身心舒畅福泽归。',
    '静立尘外心自明，清净吉庆常护佑。',
  ],
  [
    '宝藏原在咫尺间，勤寻细察自逢缘。',
    '清溪砂底藏金屑，留心身边即宝山。',
    '持恒淘洗不懈怠，平常机缘化佳财。',
    '固有技艺与旧谊，即将带来美誉收成。',
    '璞玉犹待精细雕，多加一分心力更生辉。',
  ],
  [
    '清音报晓生希望，旭日正宜开新局。',
    '晨钟悠远传千里，远方佳信或贵人至。',
    '清心开启新一朝，久悬心事渐化解。',
    '吉祥晨钟提醒君，良机已然扣门来。',
    '天时契合正得宜，立项洽谈皆顺遂。',
  ],
  [
    '良机既现当速取，仍须留意脚下途。',
    '骏马驰骋万里原，进境神速胜预期。',
    '鸿运当头急迎上，机敏沉稳定胜局。',
    '出行商议皆通泰，唯戒过急失分寸。',
    '精神饱满向高标，行健兼慎美名扬。',
  ],
  [
    '未雨绸缪先备伞，风雨过后见艳阳。',
    '远天黑云已积聚，备好后策自心安。',
    '微兆初现休轻忽，防患未然胜补牢。',
    '骤雨虽狂难久留，静心等候彩虹天。',
    '言辞契约多慎重，熬过阴云即朗晴。',
  ],
  [
    '莫耗心力推闭门，静待时来门自开。',
    '重门深锁意自明，缘分火候尚未到。',
    '强求徒费精气神，退步整顿待良辰。',
    '世事未曾尽绝路，唯需时日待花熟。',
    '先耕眼下敞开门，此门他日自松闩。',
  ],
  [
    '一分耕耘一分功，浪推轻舟近岸边。',
    '轻涛送艇向金沙，虽缓不退稳向前。',
    '持续用心修德业，距离目标日日近。',
    '亲友温暖相扶持，护您踏实步步高。',
    '前途光明次第现，守定步调勿松懈。',
  ],
  [
    '逆水行舟莫言苦，功成名就在后头。',
    '锦鲤奋跃过龙门，重重考验化荣耀。',
    '不向艰难轻低头，生命格局跃新高。',
    '纵需比人多辛劳，终局厚报胜言表。',
    '勇心化逆成东风，直上青云揽硕果。',
  ],
  [
    '心安即是真富贵，知足常乐福绵长。',
    '古寺菩提晚风凉，吹散胸中百结愁。',
    '简朴清欢胜黄金，内心丰盈千金难买。',
    '莫与浮名竞高低，反求清福真富足。',
    '家门和顺友相亲，岁岁安暖胜神仙。',
  ],
  [
    '去芜存菁添新生，主干方得更苍劲。',
    '风落枯枝非损失，腾出空间萌新芽。',
    '旧缘散去莫伤怀，或是暗中避重担。',
    '果断舍弃绊脚物，方保根本稳如山。',
    '整顿生活辞繁杂，轻装上阵更兴旺。',
  ],
  [
    '重任在肩未尽功，急躁疏忽易成差。',
    '暮云低垂田野上，收成之前再细查。',
    '万绪纷至理有序，分清缓急便稳妥。',
    '赶工最忌漏要害，复核一遍保安康。',
    '从容梳理心莫急，切忌透支伤元神。',
  ],
  [
    '踏板试稳方移步，安步当车无险阻。',
    '溪边老桥虽可用，步步探稳最平安。',
    '合同字据问清晰，莫待事后生枝节。',
    '不必随人忙追赶，稳行千里终圆满。',
    '今日细致加谨慎，杜绝来日百般忧。',
  ],
  [
    '贵人添翼扶君上，受恩怀德善相报。',
    '柔和长风助高飞，不费重功达云霄。',
    '良师益友献良策，开启顺遂新机缘。',
    '同心协力兼广施，难事亦能圆满成。',
    '铭记雪中送炭人，真情厚意常回报。',
  ],
  [
    '目标既定志不移，长夜漫漫不迷途。',
    '北斗悬天耀四野，万般抉择有所依。',
    '岁月流转世事变，本心立场稳如松。',
    '坚毅律己成风范，远大财福自然随。',
    '前路画卷已分明，依计笃行必获全胜。',
  ],
  [
    '新朝初启迎良机，欢喜奋发正当时。',
    '曦光紫气染天边，注入清新生活力。',
    '热忱笑颜广结缘，招财纳友两相宜。',
    '久郁心结渐舒解，喜讯佳音替旧愁。',
    '清晨吉气最吉祥，早行善事福全天。',
  ],
  [
    '三思而后行方妥，眼前表象未必真。',
    '微波摇曳水中影，静待水定见真容。',
    '莫信流言初印象，查清原委方定音。',
    '沉着睿智明秋毫，恰避误解与偏颇。',
    '兼听双方细求证，一锤定音准无差。',
  ],
  [
    '明辨信息心定静，从容抉择勿仓皇。',
    '深林岔路纷繁处，先看心罗盘再行。',
    '既有数途供斟酌，请教明师更清晰。',
    '排定人生轻重序，犹疑困惑自然消。',
    '路无绝对对与错，选定笃行尽责便成佳途。',
  ],
];

export const STICK_ASPECT_SETS_EN: readonly (readonly [string, string, string, string, string][])[] = [
  // Level 0: Supreme Fortune
  [
    [
      'Wealth avenues open wide with multiple inflows; remember to save a wise reserve.',
      'Cash flow moves smoothly—unexpected windfalls or returns on earlier efforts shine.',
      'Resources flow steadily; mentors or returning clients bring promising profit.',
      'Financial stewardship aligns cleanly, leaving room to invest and compound wealth.',
      'Strong wealth luck favors closing deals and reaching rewarding agreements.',
    ],
    [
      'Singles have warm odds of meeting someone special; couples enjoy deep sweetness.',
      'Your radiant charm draws tender attention and heartfelt mutual support.',
      'Singles meet warm, sincere prospects; couples grow closer toward lasting commitment.',
      'Deep mutual understanding blossoms—hearts stay attuned without needing many words.',
      'Romance flows smoothly with shared trips or joyful celebrations on the horizon.',
    ],
    [
      'Vitality runs strong and balanced—ideal for starting steady exercise habits.',
      'Energy rebounds rapidly, resilience strengthens, and lingering fatigue clears.',
      'A peaceful mind refreshes the body; restful sleep brings upbeat mornings.',
      'Mind and body harmonize well—favorable for long-term wellness routines.',
      'Spirits feel nimble and vibrant; keep hydrated and stretch regularly.',
    ],
    [
      'Work advances swiftly; expect trust and key responsibilities coming your way.',
      'Superiors and partners recognize your excellence—promotions or growth draw near.',
      'Fresh creativity stands out, earning enthusiastic backing for your proposals.',
      'Major projects conclude gracefully, lifting reputation and credibility high.',
      'Career doors swing wide—decisive action brings well-earned triumph.',
    ],
  ],
  // Level 1: Favorable
  [
    [
      'Finances remain steady with dependable income; thoughtful budgeting builds savings.',
      'Modest side earnings help keep cash reserves comfortably cushioned.',
      'Delayed payments or owed returns begin trickling back reliably.',
      'Spending stays well under control, leaving surplus for merit and steady saving.',
      'Trade and price talks proceed amiably toward fair, wholesome profit.',
    ],
    [
      'Relationships thrive; small daily acts of thoughtfulness deepen affection.',
      'New connections may bloom through shared hobbies, merit events, or close friends.',
      'Gentle, affectionate warmth grows as attentive listening strengthens trust.',
      'Quiet conversations progress warmly—steady sincerity is your finest charm.',
      'Partners share home and work duties harmoniously, deepening stability.',
    ],
    [
      'Overall health stays sound; maintain regular sleep and ample clean water.',
      'Minor discomforts ease swiftly with rest and warm, nourishing meals.',
      'Morning walks in gentle sun and light stretches keep spirits bright.',
      'Health holds steady—simply rest your eyes regularly from prolonged screen time.',
      'Your body responds kindly to gentle care; new wellness habits stick quickly.',
    ],
    [
      'Work unfolds smoothly on schedule, with helpful hands nearby when needed.',
      'New skills or practical tools broaden your expertise and future prospects.',
      'Teammates collaborate smoothly, clearing earlier bottlenecks with ease.',
      'Consistency and accountability earn quiet, lasting professional trust.',
      'Favorable timing for coordination and building constructive partnerships.',
    ],
  ],
  // Level 2: Balanced
  [
    [
      'Income and expenses stay evenly matched; hold off on risky bets or new debt.',
      'Review recurring bills and trim small leaks to free up breathing room.',
      'Inflows arrive slightly slower than hoped yet remain manageable with planning.',
      'Skip impulse purchases and keep cash cushions handy for peace of mind.',
      'Earnings stay level—steady diligence turns patience into quiet gain.',
    ],
    [
      'Love moves at a calm pace; carve out unhurried quality time together.',
      'Avoid rushing to conclusions about their feelings—let actions speak over time.',
      'Singles thrive by tending personal growth first until right timing arrives.',
      'Busy routines may create brief distance; send a thoughtful check-in note.',
      'Affection remains gentle and safe—nurture bonds without heavy pressure.',
    ],
    [
      'Watch out for accumulated fatigue and short nights of sleep.',
      'Keep mealtimes steady and go lighter on heavy spices or late caffeine.',
      'Neck and shoulder tension may surface—change posture and stretch often.',
      'Do not brush off mild allergies or nagging headaches; consult care if persistent.',
      'Step back from stressful news and preserve quiet relaxation each day.',
    ],
    [
      'Minor work hiccups resolve swiftly through clear, respectful communication.',
      'Favorable for refining workflows and quality checks rather than bold upheaval.',
      'Avoid overloading your plate—clear priorities prevent frustrating delays.',
      'Progress moves slightly slower than targeted, yet stays well within recovery.',
      'Double-check documents and schedules thoroughly to prevent rework.',
    ],
  ],
  // Level 3: Take Care
  [
    [
      'Guard against sudden expenses and avoid co-signing loans or lending cash.',
      'Skip high-risk wagers or unfamiliar schemes; read every financial line closely.',
      'Keep emergency savings secure and stay alert against online scams or dubious links.',
      'Budget ahead for home or vehicle upkeep so unexpected repairs stay painless.',
      'Pause big-ticket spending until facts and reserves stand firmer.',
    ],
    [
      'Mind sharp words spoken in haste; cool down calmly before serious talks.',
      'Outsider gossip could spark misunderstandings—check facts directly first.',
      'Do not make major relationship choices while hurt or frustrated.',
      'Soften rigid expectations and respect personal space to ease friction.',
      'Singles should take time reading intentions before giving away full trust.',
    ],
    [
      'Prioritize deep rest and timely checkups; avoid overexerting your body.',
      'Stay alert during travel, rushing, or late-night fatigue to prevent slips.',
      'Tend mental wellbeing alongside physical health; confide in someone trusted.',
      'Guard against seasonal bugs and recover fully before resuming heavy workloads.',
      'Cut back on late nights and skipped meals to protect vitality.',
    ],
    [
      'Prevent careless mistakes from rushing—proofread work before submitting.',
      'Team friction or differing views may arise; stay poised and keep written notes.',
      'Avoid abrupt resignations or sudden pivots; weigh every backup plan first.',
      'Deadlines or briefs may shift; stay calm and adapt step by step.',
      'Protect confidential files and stay mindful when handling tools or sensitive data.',
    ],
  ],
];

export const STICK_ASPECT_SETS_ZH: readonly (readonly [string, string, string, string, string][])[] = [
  // Level 0: 上上大吉
  [
    [
      '财源广进多路来，仍宜留存一部分稳健储蓄。',
      '资金周转格外顺畅，有望迎来意外收获或过往投资回报。',
      '财帛盈门，长辈或老客户将带来丰厚收益契机。',
      '理财调配得宜，收支有余且可稳步增值。',
      '进财气势强劲，谈单签约与利益协商皆大欢喜。',
    ],
    [
      '单身者易逢心仪良人，有伴者情意绵绵甜蜜融洽。',
      '个人魅力与亲和力旺盛，伴侣体贴关怀、彼此扶持。',
      '单身有望结识条件温暖真诚的对象，有伴者关系迈向稳固。',
      '心灵深处高度默契，无需多言便能心领神会。',
      '感情顺遂温暖，适合相约出游或共享喜庆时刻。',
    ],
    [
      '体魄强健精力充沛，最适合开启规律健身养生计划。',
      '神采奕奕免疫力佳，过往疲惫劳损恢复迅速。',
      '心境轻松带动身康体健，睡眠安稳晨起充满朝气。',
      '身心平衡极佳，宜制定长期调养作息。',
      '元气满满行动敏捷，记得常补水分与温和伸展。',
    ],
    [
      '事业稳步高升，有望受托负责核心关键事务。',
      '成绩亮眼获上司与伙伴赏识，升迁或拓展在望。',
      '创意灵感出众，提案规划多能获得全力支持。',
      '重要项目圆满收官，声望与专业口碑节节攀升。',
      '职场机遇大开，果断落实便能迎来捷报。',
    ],
  ],
  // Level 1: 中吉顺遂
  [
    [
      '正财平稳收入可靠，量入为出必有盈余留存。',
      '有望获得小额副业进账，温和添补手头宽裕度。',
      '盼望已久的款项或旧欠开始出现回流迹象。',
      '开支拿捏有度，尚有余力行善布施兼长线储蓄。',
      '买卖洽谈顺畅和谐，利润合理稳妥。',
    ],
    [
      '感情和谐顺心，日常微小细节的关怀更增情浓。',
      '有望通过聚会活动、公益场合或挚友引荐结识新缘。',
      '气氛温柔融洽，耐心倾听最能深化彼此依恋。',
      '暧昧互动朝良性发展，真诚稳重正是最大魅力。',
      '伴侣合力打理家庭与工作，感情根基更为扎实。',
    ],
    [
      '整体健康良好，保持规律作息与充足饮水即可。',
      '微恙小疾很快平复，注意静养与温热均衡饮食。',
      '清晨沐浴暖阳散步舒展筋骨，令心神更加清明。',
      '健康稳健，仅需留意长时间看屏幕适度闭目休息。',
      '身体对日常调理反应灵敏，养成新好习惯见效快。',
    ],
    [
      '事务依计划顺利推进，关键时常有贵人伸援手。',
      '习得新技能或新工具，有效延伸职场竞争力。',
      '同事团队协作顺畅，先前卡壳之处开始活络推进。',
      '踏实负责的作风正在积累长远宝贵的职场信用。',
      '最宜协调对接与拓展合作人脉，为将来铺路。',
    ],
  ],
  // Level 2: 平吉稳守
  [
    [
      '收支大致相抵，暂不宜高风险投资或新增借贷。',
      '梳理固定开销，裁减琐碎无谓支出更显从容。',
      '进财较预期略慢些许，但严密规划仍可控有度。',
      '克制一时冲动消费，手留备用现金心里更踏实。',
      '收益持平，全赖勤恳耕耘逐步积累成效。',
    ],
    [
      '情感处于平稳静水期，宜多花些专属时间陪伴彼此。',
      '莫过早揣测对方心意，留心长期实际行动再作判断。',
      '单身者宜先专注自我精进，缘分成熟时自会走来。',
      '各自忙碌易生些许疏离，记得常发暖心问候联系。',
      '关系平淡却安心，不施压地温柔延续即可。',
    ],
    [
      '留神积累疲劳与睡眠不足，莫硬撑透支。',
      '宜规律按时用餐，晚间减少重辣或浓茶咖啡。',
      '肩颈腰背易发酸紧，工作间隙记得常起身活动。',
      '勿忽略过敏或轻微头痛等小征兆，持续不适早诊治。',
      '少看令人焦虑的消息，每天预留专属放松时刻。',
    ],
    [
      '工作或有微阻，诚恳清晰的沟通即可顺畅化解。',
      '近期重在完善流程与查漏补缺，不宜冒进大改。',
      '切忌同时揽过多事务，排定先后次序便不慌乱。',
      '进展或略缓于既定目标，但及时调整仍来得及补齐。',
      '反复核对文书细节与日程约定，减少返工耗神。',
    ],
  ],
  // Level 3: 下吉宜慎
  [
    [
      '慎防突发应急支出，切忌替人担保或贸然借钱。',
      '远离博彩投机与陌生投资，每条金融条款务必细看。',
      '守紧应急备用金，防范网络诈骗或陌生可疑链接。',
      '提前预留居家或车辆检修预算，免得大笔突支打乱节奏。',
      '暂缓大宗消费决策，待时机与把握更稳妥后再动。',
    ],
    [
      '留神急话伤人心，大事先待情绪平复后再好好谈。',
      '防旁人流言挑拨误会，先向当事人求证真伪。',
      '切莫在委屈或动怒时轻易作出重大感情决定。',
      '适度放宽期待并尊重私人空间，可明显化解摩擦。',
      '单身者慎防虚情假意之人，慢观品行莫一次交心。',
    ],
    [
      '务必多加休养并安排体检，切勿强行熬夜赶工。',
      '出行、赶路或疲倦时提高警觉，谨防磕碰小意外。',
      '兼顾心理舒缓与身体健康，心烦压力大时多找亲友倾诉。',
      '防范季节交换小疾，待彻底康复再全力投入忙碌。',
      '减少熬夜及忽略三餐等伤身习惯，细心护养元气。',
    ],
    [
      '戒急戒躁防粗心疏失，文稿交办前再三复查。',
      '团队意见或现分歧摩擦，沉稳保留书面沟通记录为妥。',
      '勿一时冲动辞职或仓促转行，先备妥周全退路与方案。',
      '部分日程可能延后或修改，心平气和随势微调。',
      '严守工作机密，使用器材与重要数据时加倍专注留神。',
    ],
  ],
];

// ---------------------------------------------------------------------------
// 2. Tarot Major Arcana 22 Cards × 5 Sets × { up, rev }
// ---------------------------------------------------------------------------
export const TAROT_MEANING_SETS_EN: readonly [TarotMeaningSet, TarotMeaningSet, TarotMeaningSet, TarotMeaningSet, TarotMeaningSet][] = [
  // 0: The Fool
  [
    { up: 'A fresh beginning—step boldly forward with mindfulness.', rev: 'Recklessness or lack of planning—slow down and reflect.' },
    { up: 'A new adventure beckons; a light heart welcomes unfamiliar wonders.', rev: 'Guard against impulsive choices before weighing real risks.' },
    { up: 'Release rigid habits and welcome fresh luck through openness.', rev: 'Hesitation or oversight trips your stride; seek wise counsel.' },
    { up: 'Ideal timing for launching new projects, travel, or fresh chapters.', rev: 'Avoid rushing into vague agreements—check every detail first.' },
    { up: 'Trust the road ahead; walk freely yet stay attentive.', rev: 'You may be escaping an old issue rather than truly restarting—ground yourself.' },
  ],
  // 1: The Magician
  [
    { up: 'Every tool you need is already in hand—take decisive action.', rev: 'Scattered focus or talents applied in the wrong direction.' },
    { up: 'Your skill and resourcefulness are ready to turn plans into reality.', rev: 'Watch out for smooth overpromising or spreading energy too thin.' },
    { up: 'Favorable hour for action, commerce, and pitching bright ideas.', rev: 'Energy stalls from self-doubt—center your mind and start step by step.' },
    { up: 'Transform bright thoughts into tangible results through steady focus.', rev: 'Check intentions and hard facts around you; question flashy hype.' },
    { up: 'Resources and allies stand ready—consistent follow-through seals success.', rev: 'Gather wandering attention and focus on one top priority.' },
  ],
  // 2: The High Priestess
  [
    { up: 'Trust quiet intuition; hidden truths are gently surfacing.', rev: 'Facts remain incomplete—refrain from jumping to conclusions.' },
    { up: 'Answers rest within calm silence rather than hurried questioning.', rev: 'Avoid shutting out your own feelings or believing baseless whispers.' },
    { up: 'Intuition runs remarkably sharp—notice subtle cues to read the truth.', rev: 'Concealed matters may emerge abruptly; keep a composed heart.' },
    { up: 'Deep reflection and contemplative study awaken clear inner wisdom.', rev: 'Step out of overthinking loops—trusted perspective brings clarity.' },
    { up: 'Poised composure and quiet dignity shield you from surrounding noise.', rev: 'Do not ignore quiet inner warnings—pause and tune into your gut.' },
  ],
  // 3: The Empress
  [
    { up: 'Abundance, warmth, nurturing grace, and fruitful growth.', rev: 'Over-relying on others or neglecting your own self-care.' },
    { up: 'Comfort, nourishment, thriving creativity, and genuine affection.', rev: 'Drained from giving too much—take time to replenish your own energy.' },
    { up: 'Warm fortune in home, family, aesthetics, or culinary ventures.', rev: 'Mind impulsive comfort spending or excessive worry over household matters.' },
    { up: 'Lead with tenderness and generosity; friendships and plenty flow back.', rev: 'Stress dampens creative spark—resting near nature restores flow.' },
    { up: 'Life blooms richly now; nurture wellness and cherish what you love.', rev: 'Never wait solely for others to validate your worth—honor yourself first.' },
  ],
  // 4: The Emperor
  [
    { up: 'Order, stability, clear boundaries, and steady leadership.', rev: 'Excessive stubbornness or rigid control—allow gentle flexibility.' },
    { up: 'Structure and discipline anchor your position and command situation cleanly.', rev: 'Overbearing authority may stir quiet resistance at work or home.' },
    { up: 'Strong backing from respected elders or stepping into leadership roles.', rev: 'Disorganization or indecision delays results—set clear ground rules.' },
    { up: 'Plan long-term and honor your word; steadfast poise earns deep respect.', rev: 'Soften pride and hear junior voices to unlock stubborn impasses.' },
    { up: 'Accountability and clear principles serve as your protective shield now.', rev: 'Heavy responsibility breeds strain—delegate thoughtfully.' },
  ],
  // 5: The Hierophant
  [
    { up: 'Wise guidance from elders, tradition, and time-tested values.', rev: 'Pushing against norms without listening—open up to fresh angles.' },
    { up: 'Honor integrity, ethics, and sound customs for smooth, safe passage.', rev: 'Question outdated habits that no longer serve present reality.' },
    { up: 'Teachers or seasoned mentors illuminate a way past present hurdles.', rev: 'Handle differences with elders gently through calm, respectful logic.' },
    { up: 'Auspicious for merit-making, blessings, higher learning, or mentoring.', rev: 'Follow authentic fit over social pressure—choose what genuinely aligns.' },
    { up: 'Loyal adherence to principles builds lasting trust and steady honor.', rev: 'Innovate creatively without discarding core duties.' },
  ],
  // 6: The Lovers
  [
    { up: 'Heartfelt romance and choices aligned cleanly with your true values.', rev: 'Indecision or discord—honest conversation is needed now.' },
    { up: 'Deep harmony between two hearts opens rewarding partnership and love.', rev: 'A lingering crossroads demands an honest, wholehearted choice.' },
    { up: 'Meet a partner, ally, or beloved who mirrors your deepest ideals.', rev: 'Misaligned values or muddled talks require candid repair.' },
    { up: 'Choose what resonates truthfully within, even if releasing false comfort.', rev: 'Avoid impulsive romantic choices or blurred triangles—seek clarity fast.' },
    { up: 'Affection and loyal friendship uplift every decision you face.', rev: 'Restore inner peace within yourself before seeking love from others.' },
  ],
  // 7: The Chariot
  [
    { up: 'Triumph forged through resolute determination and discipline.', rev: 'Losing direction or letting impatience steer the reins.' },
    { up: 'Surmount hurdles decisively; travel and swift movement bring bright news.', rev: 'Speeding ahead unchecked risks swerving off course—ease up and steer.' },
    { up: 'Unite opposing forces toward one clear target and victory is yours.', rev: 'Hot tempers or haste could crack plans nearly finished.' },
    { up: 'Strong odds of winning competitions or standing out gracefully.', rev: 'Feeling stalled like wheels in mud—recheck whether the goal fits your heart.' },
    { up: 'No matter how rough the track, grit steers you cleanly past the finish.', rev: 'Ease off trying to micromanage everything alone; reset your pace.' },
  ],
  // 8: Strength
  [
    { up: 'Gentle courage and calm poise overcome any obstacle.', rev: 'Self-doubt surfaces; seek quiet encouragement and rest.' },
    { up: 'Compassion and steady mindfulness tame fierce challenges softly.', rev: 'Inner battery runs low from carrying too much—grant yourself rest.' },
    { up: 'Master inner fears and harsh moods, unleashing radiant confidence.', rev: 'Don’t let brief frustration or criticism shake belief in your worth.' },
    { up: 'Warm, patient diplomacy wins over even the most stubborn counterparts.', rev: 'Calm anxious loops by opening up to loved ones you trust.' },
    { up: 'Resilient peace of mind radiates quiet magnetism and warm grace.', rev: 'Stay centered when provoked; refuse impulsive reactions.' },
  ],
  // 9: The Hermit
  [
    { up: 'A season of quiet reflection—stillness awakens deep wisdom.', rev: 'Too isolated—reach out gently to someone you trust.' },
    { up: 'Step back awhile to hear inner truth; your lantern lights the step ahead.', rev: 'Solitude is turning into loneliness—reconnect warmly with true friends.' },
    { up: 'Clear answers emerge through deep thought rather than chasing crowds.', rev: 'Pride may reject helpful advice from caring allies—listen openly.' },
    { up: 'A wise elder or your own hard-won wisdom guides the next move.', rev: 'Avoid brooding over past chapters instead of stepping forward.' },
    { up: 'Quiet simplicity restores spirit and clarity throughout the week.', rev: 'Once inner clarity returns, step back out to share warmth with others.' },
  ],
  // 10: Wheel of Fortune
  [
    { up: 'Life’s wheel turns decisively toward brighter, favorable momentum.', rev: 'Temporary delay—stay patient as the wheel continues turning.' },
    { up: 'Fortune’s wheel brings timely coincidences and fresh doorways.', rev: 'Plans face a brief pause; await the next swell without losing heart.' },
    { up: 'A pivotal turning point arrives—adapt swiftly to ride the upward wave.', rev: 'Skip heavy gambles while currents stay choppy; wait for steadier ground.' },
    { up: 'Past merit meets ripe timing, turning stagnation into lively motion.', rev: 'Repeating patterns invite a fresh mindset to break old cycles.' },
    { up: 'Change is natural—this turn lifts you into a more promising phase.', rev: 'Hold neither past wins nor past errors rigidly; all evolves.' },
  ],
  // 11: Justice
  [
    { up: 'Truth, fairness, clear balance, and impartial judgment prevail.', rev: 'Unfairness or dodging accountability—restore honest balance.' },
    { up: 'Fairness returns what was sown; contracts and papers find clear justice.', rev: 'Audit agreements and numbers closely for bias or missing clauses.' },
    { up: 'Let clear reason outweigh emotion in key decisions for sound results.', rev: 'Avoid judging from one angle alone, and own mistakes cleanly.' },
    { up: 'Legal matters, talks, or shared distributions settle on fair terms.', rev: 'Imbalance between work and life asks for wiser scheduling.' },
    { up: 'Unwavering integrity forms your strongest shield and clearest peace.', rev: 'Face facts directly—honesty resolves troubles swifter than evasion.' },
  ],
  // 12: The Hanged Man
  [
    { up: 'Pause and shift perspective; wise surrender opens greater gain.', rev: 'Stalling fruitlessly—the hour has come to choose and move.' },
    { up: 'Slowing down is no defeat; it grants golden clarity from a fresh angle.', rev: 'Lingering in limbo too long—take concrete action now.' },
    { up: 'Release small attachments today for richer rewards tomorrow.', rev: 'Effort feels wasted—check whether your direction still rings true.' },
    { up: 'Flip the problem upside down to discover an inventive way out.', rev: 'Stop waiting for rescue or procrastinating; claim initiative yourself.' },
    { up: 'Wait serenely in limbo while wisdom distills and timing ripens.', rev: 'Let go of what has already ended so tomorrow walks free.' },
  ],
  // 13: Death
  [
    { up: 'An old chapter closes so a brighter new chapter may begin.', rev: 'Resisting needed change—softening your grip brings relief.' },
    { up: 'A clean ending clears space for dawn light of renewal.', rev: 'Clinging to stale habits slows much finer prospects from arriving.' },
    { up: 'Outgrow unaligned routines, work, or ties to step into graceful renewal.', rev: 'Fear of loss weighs heavy—release bit by bit for lighter peace.' },
    { up: 'Clear lingering clutter and stale obligations so fresh vitality pours in.', rev: 'Unresolved past issues circle back for one final clean closure.' },
    { up: 'A profound transition carries you onto sturdier, higher ground.', rev: 'Accept shifting truths openly and adaptation grows surprisingly gentle.' },
  ],
  // 14: Temperance
  [
    { up: 'Harmony, patience, and poised blending of elements bring success.', rev: 'Excess or imbalance—return gently toward the middle path.' },
    { up: 'Harmonize contrasting parts gracefully into peaceful, lasting achievement.', rev: 'Haste or extremes tilt your balance—moderate your stride.' },
    { up: 'Calm adaptability heals strained nerves and mends ruffled bonds.', rev: 'Patience wears thin—breathe deeply before reacting to triggers.' },
    { up: 'Moderation proves your golden key in money, career, and wellness.', rev: 'Balance time and funds wisely; avoid pouring everything into one basket.' },
    { up: 'Blessings blend calmly toward ripeness; patience brings finest fruit.', rev: 'Avoid juggling too many raw threads at once—order each part clearly.' },
  ],
  // 15: The Devil
  [
    { up: 'Mind unhealthy attachments or habits quietly holding you captive.', rev: 'Chains begin loosening—reclaim clarity and personal freedom.' },
    { up: 'Spot cravings, greed, or draining bonds eroding your true voice.', rev: 'Awaken bravely and cut ties with habits that dim your peace.' },
    { up: 'Gain and temptation carry strings—read fine print carefully first.', rev: 'Gradually unlocking relief from debt, tension, or lingering fear.' },
    { up: 'Magnetic passion surges high—never hand reason completely over to impulse.', rev: 'Welcome emotional recovery as clarity and self-mastery return.' },
    { up: 'Ask whether what you chase brings real joy or self-forged chains.', rev: 'Turn past missteps into wiser, sturdier inner armor.' },
  ],
  // 16: The Tower
  [
    { up: 'Sudden shake-ups sweep away fragile structures built on shaky ground.', rev: 'Trying to dodge needed upheaval leaves tension unresolved.' },
    { up: 'Truth flashes clear like lightning, freeing you from hollow foundations.', rev: 'Early tremors urge voluntary fixes before circumstance forces change.' },
    { up: 'Brief disruption clears ground to rebuild on honest, lasting footing.', rev: 'Clinging to crumbling plans only doubles exhaustion.' },
    { up: 'Keep calm through surprises; once dust settles, wide blue skies appear.', rev: 'Having weathered a sharp shock, tidy up remaining loose ends cleanly.' },
    { up: 'Illusions shatter so your feet may walk solidly upon truth.', rev: 'Release long-pent stress through constructive, healthy outlets.' },
  ],
  // 17: The Star
  [
    { up: 'Radiant hope, gentle healing, and guiding starlight ahead.', rev: 'Hope feels dim—rekindle faith and tenderness toward yourself.' },
    { up: 'A lucky star lights your path; after storms, graceful renewal arrives.', rev: 'Passing discouragement clouds light—rest calmly and spot small blessings.' },
    { up: 'Sincere wishes find open skies while inspiration flows freely.', rev: 'Unrealistic demands bring fatigue—pace goals with natural energy.' },
    { up: 'Warm allies or timely fortune soothe body and heart back to radiance.', rev: 'Keep faith alive—unseen seeds are still growing beneath the surface.' },
    { up: 'Grace flows through kindness and generosity; quiet acclaim grows steadily.', rev: 'Reconnect with nature or trusted loved ones to refresh your heart.' },
  ],
  // 18: The Moon
  [
    { up: 'Uncertainty and shadows test perception—tread thoughtfully.', rev: 'Mist begins clearing as shadows yield to plain truth.' },
    { up: 'Moonlit paths cast illusions; delay major decisions spun from worry.', rev: 'Doubts dissolve cleanly, revealing honest answers long obscured.' },
    { up: 'Dreams and intuition speak loudly—listen calmly without panic.', rev: 'Confusions untangle cleanly when you face fears gently.' },
    { up: 'Watch for vague promises or foggy terms—wait until daylight clarifies all.', rev: 'Spotting subtle flaws early saves trouble cleanly.' },
    { up: 'Move cautiously step by step; fears loom larger than real facts.', rev: 'Stepping free from emotional fog onto clear, direct ground.' },
  ],
  // 19: The Sun
  [
    { up: 'Bright joy, radiant success, clarity, and warm vitality.', rev: 'Success arrives slightly slower yet stays warmly within reach.' },
    { up: 'Triumphant sunlight shines full—expect warmth, clear truth, and good news.', rev: 'Light endures behind a passing cloud—keep spirit glowing steady.' },
    { up: 'Vital health, cheerful heart, and vibrant progress in work and wealth.', rev: 'Guard against overconfidence or skipped rest dimming your glow.' },
    { up: 'Your candor and bright smile draw mentors and true allies gladly.', rev: 'Seek less applause from others and celebrate your own quiet strides.' },
    { up: 'A golden season of harmony at home and joyful achievement.', rev: 'Hold steady a touch longer—thin clouds soon drift past clear sun.' },
  ],
  // 20: Judgement
  [
    { up: 'A moment of awakening, clarity, and decisive rebirth arrives.', rev: 'Hesitation or harsh self-criticism holds back your stride.' },
    { up: 'A higher calling rings clear—release regrets and enter your next chapter.', rev: 'Fear of error keeps you frozen; forgive yourself gently and move.' },
    { up: 'Past deeds echo back as welcome news and rightful elevation.', rev: 'Close old lessons cleanly so readiness greets fresh opportunity.' },
    { up: 'Inner conviction clarifies—stand tall and follow your truest calling.', rev: 'Quiet outside chatter and honor your own authentic growth.' },
    { up: 'Forgiveness and renewal flood life with bright, unburdened vigor.', rev: 'Act decisively on long-delayed matters before timing passes.' },
  ],
  // 21: The World
  [
    { up: 'Complete fulfillment—cycles close cleanly with cherished goals achieved.', rev: 'Almost complete—one final thoughtful step remains.' },
    { up: 'Grand endeavors finish gracefully, crowned with pride and honor.', rev: 'Polish remaining loose details before calling the work complete.' },
    { up: 'Horizons widen globally—favorable for travel, global work, and broad ties.', rev: 'Do not stop two paces shy of the ribbon—push gently to completion.' },
    { up: 'Every piece falls into place in harmonious fulfillment and peace.', rev: 'Final signatures or answers arrive shortly—wait with calm poise.' },
    { up: 'Close one proud cycle gracefully and ascend to a richer horizon.', rev: 'Inspect the last overlooked step to crown everything cleanly.' },
  ],
];

export const TAROT_MEANING_SETS_ZH: readonly [TarotMeaningSet, TarotMeaningSet, TarotMeaningSet, TarotMeaningSet, TarotMeaningSet][] = [
  // 0: 愚者
  [
    { up: '全新启程，保持觉知勇敢尝试。', rev: '疏忽大意或欠缺周全规划，宜放慢仔细斟酌。' },
    { up: '崭新探索正等待着您，轻装怀好奇心迎接未知。', rev: '慎防未评估风险便冲动拍板。' },
    { up: '打破旧框束缚，接纳新意带来清爽好运。', rev: '犹疑或粗心易绊住脚步，宜请教有识之士。' },
    { up: '正宜开启新项目、出行远游或翻开人生新篇章。', rev: '切莫仓促签署模糊协议，细节务必逐项核实。' },
    { up: '信赖前方道路，自由前行而心怀分寸。', rev: '留意是否只是逃避旧题而非真正重新开始，先站稳脚跟。' },
  ],
  // 1: 魔术师
  [
    { up: '条件与资源俱备，尽可笃定动手落实。', rev: '精力分散或才干未用到关键实处。' },
    { up: '您的技艺与才思已足以化构想为具体成果。', rev: '留神华而不实的空谈，或摊子铺得太广难精进。' },
    { up: '正值行动、商谈与展示创意的极佳时机，表现亮眼。', rev: '因自我怀疑导致卡顿，收摄心神一步步做起。' },
    { up: '以专注自律将脑中蓝图落实成触手可及的收获。', rev: '核清周遭人意与客观实据，切勿轻信夸大宣传。' },
    { up: '器具与助缘皆已就位，唯欠持之以恒地推进。', rev: '收起散乱心思，先锁紧最重要的一件事全力以赴。' },
  ],
  // 2: 女祭司
  [
    { up: '倾听直觉灵光，隐秘真相正悄然显露。', rev: '资讯尚不完整，切莫急下定论。' },
    { up: '寻觅的答案藏在安静观照之中，不必急着四处追问。', rev: '慎防压抑真实感受，或轻信毫无依据的流言。' },
    { up: '第六感格外敏锐，留心微小细节便能洞察实质。', rev: '暗藏实情或意外显露，先稳住平和心境。' },
    { up: '沉潜深学、体悟智慧哲学正助您豁然贯通。', rev: '勿独自陷入空想循环，适度听取专业视角。' },
    { up: '沉静庄重与从容气度自会护您远离纷扰。', rev: '切莫忽略内心微小的警醒信号，停步诚实听自己。' },
  ],
  // 3: 皇后
  [
    { up: '丰盛富足、温情滋养与生机勃勃的成长。', rev: '过度依赖他人，或忽略了对自身的温柔照料。' },
    { up: '生活安暖充实，创作硕果累累并收获真诚疼爱。', rev: '付出过多感到精疲力竭，请先为自己充电歇息。' },
    { up: '家庭和美、居所温馨，美学与餐饮等事业尤为顺旺。', rev: '留意随性消费过头，或对家务亲人过度忧虑。' },
    { up: '以温和善意待人处事，人缘与福财自会循环归来。', rev: '压力令灵感暂滞，亲近自然草木最能修复元气。' },
    { up: '生命正值花繁叶茂之时，正宜调理康健并深耕所爱。', rev: '别把价值完全寄托于他人肯定，先好好珍重自己。' },
  ],
  // 4: 皇帝
  [
    { up: '秩序井然、基础稳固与稳健的领导力。', rev: '过于固执严苛，宜适度留出弹性余地。' },
    { up: '条理与自律助您牢牢掌控局面并筑牢根基。', rev: '态度过硬容易在团队或家庭中引来抵触反感。' },
    { up: '有望得威望长辈鼎力相助，或肩负统筹重任。', rev: '缺条理或拍板犹疑，需明确立下规矩分工。' },
    { up: '长远规划且言出必行，沉稳担当自然赢得敬重。', rev: '放下身段倾听晚辈或基层建议，困局自会打开。' },
    { up: '明确原则与责任心即是此刻护身坚盾。', rev: '重担压肩易现紧绷，学会合理分派任务更佳。' },
  ],
  // 5: 教皇
  [
    { up: '长者明师指点、优良传统与稳妥规范。', rev: '固执叛逆或闭门不听劝，宜开放接纳多元观点。' },
    { up: '恪守诚信道义与正当常轨，生活自然安稳顺遂。', rev: '该重新审视不再合时宜的旧框规矩了。' },
    { up: '师长或资深前辈将在卡壳之处为您点亮明灯。', rev: '与长辈理念若现分歧，以温和有礼的道理沟通。' },
    { up: '宜行善祈福、参与吉礼、深造进修或传道解惑。', rev: '勿因怕特立独行而盲从潮流，选真正契合自身之路。' },
    { up: '对准则始终如一的诚笃将筑起久远信誉与清誉。', rev: '可稳妥破旧立新，唯莫丢弃基本担当。' },
  ],
  // 6: 恋人
  [
    { up: '情缘投契与顺应本心的真挚抉择。', rev: '犹疑摇摆或理念不合，亟需坦诚深谈。' },
    { up: '双方默契和谐，促成良性合作与美满情谊。', rev: '面前岔路尚待取舍，请依内心真实去选定一方。' },
    { up: '遇合志同道合的伴侣、知己或契合拍档。', rev: '沟通偏差或价值观歧异，宜认真正视并修补。' },
    { up: '坚定选择符合本心信念的路，哪怕需舍去浮华。', rev: '慎防一时情绪用事或感情纠葛，尽快厘清界限。' },
    { up: '温情与良朋善意支持着您每个重大决定。', rev: '先调和自己内心的平衡，再向外界索求爱与安稳。' },
  ],
  // 7: 战车
  [
    { up: '凭坚定意志与严明自律克难制胜。', rev: '偏离方向或情绪失控难驾驭。' },
    { up: '果敢突破险阻，出行奔走将为您带回喜讯。', rev: '冲刺过猛反易忽略路况，暂缓微调方向盘防失稳。' },
    { up: '整合矛盾力量同向发力，胜券必稳握手中。', rev: '急躁与火气易令临门一脚的好事生出裂痕。' },
    { up: '近期竞赛比拼、业绩考核颇有夺魁风采。', rev: '若觉陷入泥淖般阻滞，先核实方向是否仍合初衷。' },
    { up: '任凭前路坎坷崎岖，专注定力终助您驶入终点。', rev: '别把所有事全揽在一人手里硬控，重新调好生活节奏。' },
  ],
  // 8: 力量
  [
    { up: '温柔的勇气与沉静之心终胜万难。', rev: '陷入自我怀疑，此刻需要温柔鼓舞与休养。' },
    { up: '慈悲定力无需硬碰硬便足以化大难于无形。', rev: '长期硬撑导致心力透支，请允许自己好好喘口气。' },
    { up: '驯服心中畏惧与浮躁，迸发温润强大的创造力。', rev: '莫被急躁或苛责击退自信，深信自身潜力。' },
    { up: '柔中带刚的耐心斡旋能妥善说服顽固对手。', rev: '别任焦虑啃噬勇气，向挚爱亲友敞开心怀聊聊。' },
    { up: '内心清朗沉稳，以真诚柔和散发令人敬重的魅力。', rev: '逢挑衅先定住心神，不让冲动情绪耗损自身底气。' },
  ],
  // 9: 隐者
  [
    { up: '静思自省之时，清净生出通透智慧。', rev: '过度孤僻封闭，宜主动联系信任之人。' },
    { up: '暂避喧嚣聆听心声，手中慧灯自会照亮窄径。', rev: '独处已渐化为孤寂，试着向真挚好友敞开对话。' },
    { up: '关键答案来自深度思考，而非盲从他人脚步。', rev: '勿因顾忌面子拒听善意忠告，虚心听取一二。' },
    { up: '德高望重的长者或自身沉淀已久的阅历为您引路。', rev: '谨防沉溺往昔回忆不肯走出既定角落。' },
    { up: '本周崇简守静最能深度滋养并修复心灵元气。', rev: '莫永远逃避人群，待心定神清便走出去共享阳光。' },
  ],
  // 10: 命运之轮
  [
    { up: '命运之轮正顺势朝向明亮吉利的方向转动。', rev: '遭遇短暂迟滞，耐心等候轮盘继续运转。' },
    { up: '机遇轮盘转动，适时带来新鲜良机与巧妙善缘。', rev: '既定计划暂逢停顿期，守稳心态静待下一波推力。' },
    { up: '关键转折已现端倪，敏捷顺应把握这股上升浪潮。', rev: '局势未稳前避免重仓赌注，耐心等待明朗节点。' },
    { up: '往昔善果遇合良辰，将沉闷停滞转为生机焕发。', rev: '同类困扰反复浮现，提醒您更换思路跳出旧循环。' },
    { up: '变化本是世间常态，此次流转正引向更佳新境界。', rev: '不执念往昔得失荣辱，顺时演进方能自在。' },
  ],
  // 11: 正义
  [
    { up: '真相明朗、平衡有序与公正无私的裁断。', rev: '失衡偏颇或回避应负之责，宜尽快补正。' },
    { up: '种因得果丝毫不爽，文书契约皆能获公正护佑。', rev: '仔细复核条款数字，提防偏漏或关键细节缺席。' },
    { up: '大事以理性准绳为先，终将得出服人且无愧的结果。', rev: '切勿仅凭单一视角下判断，有错坦诚修正为佳。' },
    { up: '讼事争议、谈判或权益分配将依公正原则顺解。', rev: '工作与生活失衡正在提醒您重新合理调配时间。' },
    { up: '光明磊落便是最佳护身甲，令心境坦荡从容。', rev: '直面现实真相，远比逃避敷衍更能迅速止损解围。' },
  ],
  // 12: 倒吊人
  [
    { up: '暂缓停步换个视角，明智放手反能收获更多。', rev: '无谓僵持消耗心力，已到拍板抉择之时。' },
    { up: '放慢步调并非认输，而是难得的换位洞悉良机。', rev: '久困旧局停滞太久，果断打破僵局走出来吧。' },
    { up: '愿在眼下小处作出让步成全，来日回报更见丰厚。', rev: '付出却感徒劳空转，先核对大方向是否真走对。' },
    { up: '倒转角度看待眼下难题，意想不到的妙策油然而生。', rev: '戒除拖延或空等他人救场，自己站出来拿主意。' },
    { up: '于悬而未决中静心沉淀智慧，静待时机圆熟。', rev: '舍断早已落幕之人与事，把自由还给往后人生。' },
  ],
  // 13: 死神
  [
    { up: '告别旧篇以迎来新局，象征蜕变新生而非实义之亡。', rev: '抗拒必然转变，适度放下反觉海阔天空。' },
    { up: '旧章干脆落幕，方能腾出洁净空间迎接黎明新光。', rev: '执恋熟悉习惯正在拖慢更美好机遇的登场节奏。' },
    { up: '顺势调整已不适用的旧道或关系，迎来华丽蜕生。', rev: '畏惧失去令胸口沉重，逐件轻放便能轻松前行。' },
    { up: '清扫长期积压的琐累与心头杂物，新生能量随即涌入。', rev: '久拖未决的旧题正重返视野，催您彻底收尾了结。' },
    { up: '一次关键转型将带您步入更高稳的发展层级。', rev: '坦然接纳既定变局，适应与转圜比想象中平顺许多。' },
  ],
  // 14: 节制
  [
    { up: '调和平衡、耐心淬炼与恰到好处的融合。', rev: '过犹不及失了分寸，请温和回归中道。' },
    { up: '巧妙融合不同元素相得益彰，引致安宁与硕果。', rev: '操之过急或极端用事令节奏失衡，收稳步调居中。' },
    { up: '从容调适与温柔耐心能抚平心绪、弥合裂痕。', rev: '耐性渐薄易烦躁，回应外界前先深长舒缓呼吸。' },
    { up: '中庸之道正是开财、稳业与养生的黄金钥匙。', rev: '妥善统筹时间钱财，忌偏废一方顾此失彼。' },
    { up: '诸般善缘正温和酝酿成熟，沉心静候终结美果。', rev: '莫将过多未熟企划混为一谈，分块梳理至各安其位。' },
  ],
  // 15: 恶魔
  [
    { up: '警觉执念贪欲或令己画地为牢的旧习惯。', rev: '束缚正逐渐松解，重新夺回心智自由。' },
    { up: '明察私欲诱惑或消耗自我的羁绊，莫失本心。', rev: '清醒觉醒勇敢斩断消耗精气的陋习枷锁。' },
    { up: '权势利益常附带隐形条件，签诺前务必细审约束。', rev: '正稳步解除债务、压力或长年压抑的内心焦虑。' },
    { up: '诱惑与热潮高涨之际，切莫让冲动淹没清醒理智。', rev: '心灵复苏喜兆已现，重掌清明自觉与自在人生。' },
    { up: '反观所追逐之物究竟是真欢喜，还是亲手戴上的枷锁。', rev: '借过往教训筑牢更为敏锐稳固的心灵防火墙。' },
  ],
  // 16: 高塔
  [
    { up: '突发震荡击碎虚浮根基，促使彻底重建。', rev: '硬抗逃避必要变革，隐患余波依然悬留。' },
    { up: '真相如闪电破空揭露，助您脱离早已腐朽的旧格局。', rev: '先兆示警尽早主动修整错漏，胜于被迫剧变。' },
    { up: '短暂动荡清出地基，反利于改建更为踏实坚稳的新居。', rev: '因畏惧改变而苦苦修补危楼，越撑越显疲惫。' },
    { up: '骤变突至保持镇定定神，待尘埃落定必见朗阔蓝天。', rev: '险中化险平稳着陆，仍宜细心清理收好余下尾账。' },
    { up: '摇醒虚幻泡沫，让生命重新踏踏实实踩在真地上。', rev: '该用健康建设性的方式宣泄释放积压已久的紧绷。' },
  ],
  // 17: 星星
  [
    { up: '明亮希望、温柔疗愈与前路星光引路。', rev: '微光似有黯淡，急需重燃内在信心与温柔。' },
    { up: '吉星轻耀照拂前程，历经风波正步入润心修复期。', rev: '短暂倦怠遮蔽视线，歇心看清身旁微小美好。' },
    { up: '纯正心愿有望欣然实现，才思灵感清泉涌流。', rev: '目标设得过高反致疲惫，微调节奏匹配现有气力。' },
    { up: '暖心良伴或美好善缘带来身心慰藉，生命重焕生机。', rev: '即使眼下未见显效亦勿放弃，信念种子仍在抽芽。' },
    { up: '善施慈爱自有福报环生，清雅口碑正温和远播。', rev: '亲近天地自然或贴心知己，给心田重新灌注甘泉。' },
  ],
  // 18: 月亮
  [
    { up: '朦胧未明与暗影惊疑，步履宜多留神观察。', rev: '迷雾渐退见明朗，莫名忧惧悄然消散。' },
    { up: '夜行月影易生幻象，切莫依据揣测焦虑轻下大事决定。', rev: '疑团云雾正在化开，久藏实情渐露清晰答案。' },
    { up: '梦境潜意识频频传递灵讯，静听观照而勿慌乱。', rev: '误会隔阂逐步冰释，鼓起勇气直面心忧便感释怀。' },
    { up: '提防模棱两可的言辞或模糊条款，静待阳光照亮再定。', rev: '及时察觉细微破绽或漏洞，巧妙避开无谓损失。' },
    { up: '怀揣谨慎逐寸前行，心魔往往比事实本身更为庞大。', rev: '走出情绪漩涡迷阵，坦直明快的前路已然可见。' },
  ],
  // 19: 太阳
  [
    { up: '阳光喜悦、辉煌成果与饱满正向活力。', rev: '喜讯虽比预期稍缓抵达，却依旧明媚在即。' },
    { up: '胜利晴辉灿烂普照，明朗、温暖与捷报正翩然而至。', rev: '硕果依然候于前方，唯有薄云暂遮莫轻易熄火。' },
    { up: '体健心欢气宇明朗，事业与财禄双双焕发光彩。', rev: '留神盲目乐观或废寝忘食伤神，守稳张弛均衡。' },
    { up: '坦诚阳光的笑容广招贵人前辈与良朋热情相助。', rev: '少些渴求外人掌声，真诚赞许并肯定自己的每一步。' },
    { up: '家门和煦、心想事成的鼎盛美好黄金岁月。', rev: '再沉心坚持片刻，浮云即将飘散迎来烈日长明。' },
  ],
  // 20: 审判
  [
    { up: '迎来觉醒蜕变与重大抉择的清朗时刻。', rev: '犹疑退缩或过分苛责自身，阻滞了前行步伐。' },
    { up: '新机召唤清越响起，是时候放下昔憾迈入新境界了。', rev: '害怕犯错与内在自责捆住双脚，先原谅自己启程。' },
    { up: '往昔善功心血化作回响，带来欣喜捷报与格局跃升。', rev: '彻底吸收总结过往教训，新机临门才不致犹豫。' },
    { up: '内心答案早已清晰，挺身立定遵循真正志向而行。', rev: '勿过多迎合外界杂音评头论足，忠于自我成长。' },
    { up: '宽恕往事与翻新出发带来轻盈清净的生命活力。', rev: '把握良机当断则断，解决久拖未决之要事。' },
  ],
  // 21: 世界
  [
    { up: '功德圆满周全，如愿收获心驰所向之果。', rev: '大功将成未竟，尚欠临门稳妥收尾一环。' },
    { up: '重大使命圆满落成，欣然摘取荣耀与满心自豪。', rev: '尚余细微收口打磨待清，做实做全再行收笔。' },
    { up: '视野宏阔通达四海，宜远行、涉外业务或广拓人脉。', rev: '终点已在眼帘切莫半途松气，再添一鼓气力完美收官。' },
    { up: '生命拼图环环相扣圆满归位，尽享和谐满足。', rev: '终局签约或终审答复微迟些许，从容静候稳成。' },
    { up: '体面优雅地结束一轮耕耘，蓄势攀登更崇高圆满之境。', rev: '再细检最容易被疏忽的末步环节，一补即圆融。' },
  ],
];

export function getLocalizedTarotMeaning(
  id: number,
  reversed: boolean,
  setIdx: number,
  lang: SupportedLang,
  fallbackTh?: string
): string {
  const safeId = ((id % 22) + 22) % 22;
  const safeSet = ((setIdx % 5) + 5) % 5;
  if (lang === 'en') {
    const item = TAROT_MEANING_SETS_EN[safeId]?.[safeSet];
    if (item) return reversed ? item.rev : item.up;
  }
  if (lang === 'zh') {
    const item = TAROT_MEANING_SETS_ZH[safeId]?.[safeSet];
    if (item) return reversed ? item.rev : item.up;
  }
  if (fallbackTh) return fallbackTh;
  const item = TAROT_MEANING_SETS[safeId]?.[safeSet];
  return item ? (reversed ? item.rev : item.up) : '';
}

export function getTarotTtsName(
  id: number,
  thName: string,
  enName: string,
  lang: SupportedLang
): string {
  if (lang === 'en') return enName || thName;
  if (lang === 'zh') {
    const zh = TAROT_TITLE_ZH[id];
    if (zh) return zh.replace(/\s*\([^)]*\)/g, '').trim();
    return enName || thName;
  }
  return thName;
}

export function getLocalizedStickResult(
  res: StickResult,
  setIdx: number,
  lang: SupportedLang
): StickResult {
  const safeIdx = clampIndex(res.stick - 1, STICK_TITLES_LOCALIZED.length);
  const safeLevel = clampIndex(res.level, 4);
  const safeSet = ((setIdx % 5) + 5) % 5;

  if (lang === 'th') {
    return {
      ...res,
      title: STICK_TITLES_LOCALIZED[safeIdx]?.th || res.title,
      level_name: STICK_LEVEL_NAMES_LOCALIZED.th[safeLevel] || res.level_name,
      verse: STICK_VERSE_SETS[safeIdx]?.[safeSet] || res.verse,
      aspects: res.aspects.map((a, i) => ({
        name: STICK_ASPECT_NAMES_LOCALIZED.th[i] || a.name,
        text: STICK_ASPECT_SETS[safeLevel]?.[i]?.[safeSet] || a.text,
      })),
    };
  }

  const verseTable = lang === 'en' ? STICK_VERSE_SETS_EN : STICK_VERSE_SETS_ZH;
  const aspectTable = lang === 'en' ? STICK_ASPECT_SETS_EN : STICK_ASPECT_SETS_ZH;

  return {
    ...res,
    title: STICK_TITLES_LOCALIZED[safeIdx]?.[lang] || res.title,
    level_name: STICK_LEVEL_NAMES_LOCALIZED[lang][safeLevel] || res.level_name,
    verse: verseTable[safeIdx]?.[safeSet] || res.verse,
    aspects: res.aspects.map((a, i) => ({
      name: STICK_ASPECT_NAMES_LOCALIZED[lang][i] || a.name,
      text: aspectTable[safeLevel]?.[i]?.[safeSet] || a.text,
    })),
  };
}

function clampIndex(idx: number, len: number): number {
  if (!Number.isFinite(idx) || idx < 0) return 0;
  if (idx >= len) return len - 1;
  return idx;
}
