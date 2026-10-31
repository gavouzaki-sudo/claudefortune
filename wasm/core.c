/*
 * Lucky Shrine - Wasm core (freestanding C, no libc)
 * หวย ดวงชะตา และสะเดาะเคราะห์ออนไลน์ - สมองกลหลังบ้าน
 *
 * Build: see ../build.sh  (clang --target=wasm32 -nostdlib ...)
 *
 * Conventions
 *  - Every exported function that returns data writes UTF-8 JSON into an
 *    internal output buffer and returns its byte length (or a negative
 *    error code). JS reads it with out_ptr()/out_len().
 *  - Strings/arrays coming from JS are copied into memory obtained from
 *    wasm_alloc(); call wasm_reset() before each bridge call.
 *  - Everything is for entertainment only. Lottery numbers are NOT
 *    predictions.
 */

typedef unsigned char u8;
typedef unsigned int u32;
typedef unsigned long long u64;

#define EXPORT(n) __attribute__((export_name(n)))

#define WASM_VERSION 1

/* ------------------------------------------------------------------ */
/* libc stubs the compiler may reference                              */
/* ------------------------------------------------------------------ */
void *memcpy(void *d, const void *s, unsigned n) {
  u8 *a = (u8 *)d;
  const u8 *b = (const u8 *)s;
  while (n--) *a++ = *b++;
  return d;
}
void *memset(void *d, int c, unsigned n) {
  u8 *a = (u8 *)d;
  while (n--) *a++ = (u8)c;
  return d;
}

/* ------------------------------------------------------------------ */
/* bump allocator for data passed in from JS                          */
/* ------------------------------------------------------------------ */
#define HEAP_SZ (2 * 1024 * 1024)
static u8 heap[HEAP_SZ] __attribute__((aligned(16)));
static u32 hp;

EXPORT("wasm_alloc") u32 wasm_alloc(u32 n) {
  n = (n + 15u) & ~15u;
  if (n == 0 || n > HEAP_SZ - hp) return 0;
  u32 p = (u32)(unsigned long)&heap[hp];
  hp += n;
  return p;
}
EXPORT("wasm_reset") void wasm_reset(void) { hp = 0; }
EXPORT("wasm_version") int wasm_version(void) { return WASM_VERSION; }
EXPORT("wasm_heap_size") u32 wasm_heap_size(void) { return HEAP_SZ; }

/* ------------------------------------------------------------------ */
/* JSON writer                                                        */
/* ------------------------------------------------------------------ */
#define OUT_SZ 32768
static char out[OUT_SZ];
static int op, overflow;
static int stk[10], sp, pv;

static void oc(char c) {
  if (op < OUT_SZ - 1) out[op++] = c;
  else overflow = 1;
}
static void os_esc(const char *s) {
  for (; *s; s++) {
    unsigned char c = (unsigned char)*s;
    if (c == '"' || c == '\\') { oc('\\'); oc((char)c); }
    else if (c < 0x20) { oc(' '); }
    else oc((char)c);
  }
}
static void os(const char *s) { while (*s) oc(*s++); }
static void j_sep(void) {
  if (pv) { pv = 0; return; }
  if (sp > 0) {
    if (stk[sp - 1]) stk[sp - 1] = 0;
    else oc(',');
  }
}
static void j_open(char c) {
  j_sep();
  oc(c);
  if (sp < 10) stk[sp++] = 1;
}
static void j_close(char c) {
  oc(c);
  if (sp > 0) sp--;
}
static void j_key(const char *k) {
  j_sep();
  oc('"'); os(k); os("\":");
  pv = 1;
}
static void j_str(const char *v) { j_sep(); oc('"'); os_esc(v); oc('"'); }
static void j_int(int v) {
  j_sep();
  char t[12]; int n = 0; u32 u;
  if (v < 0) { oc('-'); u = (u32)(-(v + 1)) + 1u; } else u = (u32)v;
  do { t[n++] = (char)('0' + u % 10); u /= 10; } while (u);
  while (n) oc(t[--n]);
}
static void j_bool(int b) { j_sep(); os(b ? "true" : "false"); }
static void kv_str(const char *k, const char *v) { j_key(k); j_str(v); }
static void kv_int(const char *k, int v) { j_key(k); j_int(v); }
static void kv_bool(const char *k, int v) { j_key(k); j_bool(v); }
static void j_begin(void) { op = 0; sp = 0; pv = 0; overflow = 0; j_open('{'); }
static int j_end(void) {
  j_close('}');
  out[op] = 0;
  return overflow ? -2 : op;
}

EXPORT("out_ptr") u32 out_ptr(void) { return (u32)(unsigned long)out; }
EXPORT("out_len") int out_len(void) { return op; }

/* ------------------------------------------------------------------ */
/* RNG + hashing                                                      */
/* ------------------------------------------------------------------ */
#define FNV_OFF 1469598103934665603ULL
#define FNV_PRIME 1099511628211ULL

static u64 rs = 0x9E3779B97F4A7C15ULL;

static u64 smix(u64 *s) {
  u64 z = (*s += 0x9E3779B97F4A7C15ULL);
  z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9ULL;
  z = (z ^ (z >> 27)) * 0x94D049BB133111EBULL;
  return z ^ (z >> 31);
}
static u32 rnd32(void) { return (u32)(smix(&rs) >> 32); }
static u32 rnd_below(u32 n) {
  if (n < 2) return 0;
  u32 lim = (0xFFFFFFFFu / n) * n, r;
  do { r = rnd32(); } while (r >= lim);
  return r % n;
}
static void rmix(u64 x) {
  rs ^= x * 0x9E3779B97F4A7C15ULL;
  (void)smix(&rs);
}
static u64 fnv(const u8 *p, int n, u64 h) {
  for (int i = 0; i < n; i++) { h ^= p[i]; h *= FNV_PRIME; }
  return h;
}
static int slen(const char *s) { int n = 0; while (s[n]) n++; return n; }

EXPORT("seed_entropy") void seed_entropy(u32 a, u32 b, u32 c, u32 d) {
  rmix(((u64)a << 32) | b);
  rmix(((u64)c << 32) | d);
  rmix((u64)rnd32());
}

/* ------------------------------------------------------------------ */
/* session + zodiac                                                   */
/* ------------------------------------------------------------------ */
typedef struct { const char *name, *animal, *color, *dir; } Zod;
static const Zod ZOD[12] = {
  {"ชวด", "หนู", "น้ำเงิน", "ทิศเหนือ"},
  {"ฉลู", "วัว", "เหลืองทอง", "ทิศตะวันออกเฉียงเหนือ"},
  {"ขาล", "เสือ", "เขียว", "ทิศตะวันออก"},
  {"เถาะ", "กระต่าย", "ชมพู", "ทิศตะวันออก"},
  {"มะโรง", "งูใหญ่", "ทอง", "ทิศตะวันออกเฉียงใต้"},
  {"มะเส็ง", "งูเล็ก", "แดง", "ทิศใต้"},
  {"มะเมีย", "ม้า", "แดงสด", "ทิศใต้"},
  {"มะแม", "แพะ", "เหลือง", "ทิศตะวันตกเฉียงใต้"},
  {"วอก", "ลิง", "ขาว", "ทิศตะวันตก"},
  {"ระกา", "ไก่", "ขาวทอง", "ทิศตะวันตก"},
  {"จอ", "สุนัข", "ส้มอ่อน", "ทิศตะวันตกเฉียงเหนือ"},
  {"กุน", "หมู", "ฟ้าน้ำทะเล", "ทิศเหนือ"}};

/* index 0 = ชวด (rat) ... 11 = กุน (pig). Year 2020 = rat. */
static int year_branch(int y) { return (((y - 4) % 12) + 12) % 12; }

static struct { int valid; u64 h; int by; int z; } S;
static int cur_y = 2026, cur_m = 10, cur_d = 31;
static u32 lucky_calls;

EXPORT("set_date") void set_date(int y, int m, int d) {
  if (y >= 1900 && y <= 2200) cur_y = y;
  if (m >= 1 && m <= 12) cur_m = m;
  if (d >= 1 && d <= 31) cur_d = d;
}

/* returns resolved zodiac 0..11, or negative on error */
EXPORT("init_session") int init_session(const char *name, int len, int birth_year, int zodiac) {
  if (len < 0 || len > 400) return -1;
  if (birth_year > 2400) birth_year -= 543; /* accept พ.ศ. */
  if (birth_year < 1900 || birth_year > 2200) return -2;
  if (zodiac < -1 || zodiac > 11) return -3;
  S.h = fnv((const u8 *)name, len, FNV_OFF);
  S.h = fnv((const u8 *)&birth_year, 4, S.h);
  S.by = birth_year;
  S.z = (zodiac >= 0) ? zodiac : year_branch(birth_year);
  S.valid = 1;
  lucky_calls = 0;
  rmix(S.h);
  return S.z;
}

EXPORT("get_zodiac_info") int get_zodiac_info(int z) {
  if (z < 0) z = S.valid ? S.z : -1;
  if (z < 0 || z > 11) return -3;
  j_begin();
  kv_int("index", z);
  kv_str("name", ZOD[z].name);
  kv_str("animal", ZOD[z].animal);
  kv_str("color", ZOD[z].color);
  kv_str("direction", ZOD[z].dir);
  kv_str("current_year_name", ZOD[year_branch(cur_y)].name);
  kv_int("current_year_index", year_branch(cur_y));
  kv_int("year", cur_y);
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Siamese sticks (เซียมซี) - 28 sticks                               */
/* ------------------------------------------------------------------ */
typedef struct { int level; const char *title, *verse; } Stick;
static const Stick STICKS[28] = {
  {0, "มังกรทะยานฟ้า", "ลมหนุนส่งใจที่มั่น ฟ้ารอรับความตั้งใจ"},
  {1, "ตะวันพ้นหมอก", "เมฆบังผ่านไปแล้ว แสงสว่างรออยู่เบื้องหน้า"},
  {2, "สะพานข้ามสายน้ำ", "ก้าวทีละก้าวอย่างระวัง ฝั่งโน้นอยู่ไม่ไกล"},
  {1, "ต้นไม้ผลิดอก", "ปลูกไว้ด้วยใจอดทน วันนี้เริ่มเห็นผลงาม"},
  {2, "เรือฝ่าคลื่นลม", "คลื่นใหญ่ย่อมผ่านพ้น หากมือจับหางเสือมั่น"},
  {2, "เทียนไหวในลมเบา", "ไฟเล็กให้แสงนำทาง อย่าให้ใจหวั่นไหว"},
  {0, "หงส์ฟ้ากางปีก", "ความดีสะสมมานาน กำลังออกผลสู่โลก"},
  {2, "ภูเขาหมอกคลุม", "ทางข้างหน้ายังไม่ชัด รอให้หมอกจางก่อนก้าว"},
  {1, "นกน้อยรังใหม่", "เริ่มจากสิ่งเล็ก ค่อยๆ สร้างค่อยๆ มั่นคง"},
  {2, "กระต่ายใต้จันทร์", "อย่าหลงแสงเงาลวง ถามใจตนเองให้ชัด"},
  {3, "ฝนแล้งรอเมฆ", "ความขาดแคลนเพียงชั่วคราว ประหยัดไว้รอวันฝน"},
  {0, "ดอกบัวพ้นโคลน", "ผ่านความยากมาแล้ว งามสง่าเหนือน้ำนิ่ง"},
  {1, "ทองคำในธารทราย", "ของมีค่ารออยู่ใกล้ตัว ขยันค้นหาจะพบ"},
  {1, "ระฆังยามเช้า", "เสียงใสปลุกความหวัง วันใหม่เหมาะแก่การเริ่ม"},
  {0, "ม้าเร็วบนทางโล่ง", "จังหวะดีให้รีบคว้า แต่อย่าลืมมองทาง"},
  {3, "ฟ้าครึ้มก่อนฝน", "เตรียมร่มไว้ล่วงหน้า พายุผ่านแล้วฟ้าสดใส"},
  {3, "ประตูปิดสนิท", "อย่าฝืนผลักให้เหนื่อย รอเวลาเปิดเองดีกว่า"},
  {1, "เกลียวคลื่นสู่ฝั่ง", "ความพยายามไม่สูญเปล่า ทุกคลื่นพาใกล้ฝั่ง"},
  {0, "ปลาคาร์ปข้ามประตูมังกร", "อดทนทวนกระแส ผลสุดท้ายคือความสำเร็จ"},
  {1, "ลานวัดยามเย็น", "ใจสงบเป็นทรัพย์ ความสุขอยู่ที่ความพอดี"},
  {3, "กิ่งหักกลางลม", "สิ่งไม่จำเป็นหลุดไป เพื่อให้ต้นแข็งแรงขึ้น"},
  {3, "เมฆดำเหนือทุ่งนา", "งานหนักยังไม่จบ ระวังพลาดเพราะรีบร้อน"},
  {2, "สะพานไม้เก่า", "ก่อนเดินต้องตรวจให้แน่ แล้วจึงข้ามอย่างช้าๆ"},
  {1, "ลมใต้ปีกนก", "มีผู้ช่วยหนุนเสริม รับน้ำใจและตอบแทนเขา"},
  {0, "ดาวเหนือนำทาง", "เป้าหมายชัดเจน ย่อมไม่หลงทิศแม้ฟ้ามืด"},
  {1, "แสงทองยามรุ่ง", "วันใหม่มาพร้อมโอกาส ลุกขึ้นรับด้วยใจเบิกบาน"},
  {2, "เงาในกระจกน้ำ", "ตรึกตรองก่อนตัดสินใจ สิ่งที่เห็นอาจไม่ใช่ทั้งหมด"},
  {2, "ทางแยกในป่า", "เลือกทางด้วยข้อมูลและใจที่สงบ ไม่ต้องรีบ"}};

static const char *LEVEL_NAME[4] = {"ดีเยี่ยม", "ดี", "ปานกลาง", "ควรระวัง"};
static const char *ASPECT_NAME[4] = {"การเงิน", "ความรัก", "สุขภาพ", "การงาน"};

/* [level][aspect][variant] */
static const char *STICK_TEXT[4][4][3] = {
  {/* ดีเยี่ยม */
   {"โชคลาภเปิดทาง รายได้เข้าจากหลายทาง ควรเก็บออมส่วนหนึ่งไว้ด้วย",
    "การลงทุนที่ศึกษามาดีให้ผลงาม แต่อย่าลืมกระจายความเสี่ยง",
    "มีผู้ใหญ่หรือเพื่อนอุปถัมภ์ด้านเงิน ตอบแทนด้วยน้ำใจจะยิ่งเจริญ"},
   {"คนโสดมีโอกาสพบคนถูกใจ คนมีคู่ความสัมพันธ์หวานชื่น",
    "ความรักมั่นคง ถึงเวลาพูดคุยเรื่องอนาคตร่วมกัน",
    "คนเก่าหรือเพื่อนเก่ากลับมาทักทาย ใช้ความจริงใจนำทาง"},
   {"สุขภาพแข็งแรง พลังงานดี เหมาะกับการเริ่มออกกำลังกายสม่ำเสมอ",
    "ร่างกายฟื้นตัวไว ใจสบาย นอนหลับพักผ่อนได้ดี",
    "สุขภาพโดยรวมดีมาก ยังควรตรวจร่างกายประจำปีตามปกติ"},
   {"งานก้าวหน้า มีโอกาสได้รับความไว้วางใจให้ดูแลเรื่องสำคัญ",
    "ไอเดียใหม่ได้รับการยอมรับ กล้านำเสนอได้เลย",
    "ความอุตสาหะที่ผ่านมาเริ่มออกผล ผู้บริหารมองเห็นผลงาน"}},
  {/* ดี */
   {"การเงินราบรื่น มีรายรับสม่ำเสมอ ใช้จ่ายอย่างมีแผนจะเหลือเก็บ",
    "มีโอกาสรายได้เสริมเล็กๆ น้อยๆ อย่ารีบร้อนตัดสินใจ",
    "เงินที่ค้างอยู่มีแนวโน้มได้คืน ติดตามด้วยท่าทีสุภาพ"},
   {"ความสัมพันธ์ดี ใส่ใจกันในเรื่องเล็กๆ จะยิ่งแน่นแฟ้น",
    "มีโอกาสทำความรู้จักคนใหม่ผ่านกิจกรรมหรือเพื่อนแนะนำ",
    "ความเข้าใจกันเพิ่มขึ้น ถ้าเปิดใจรับฟังก่อนพูด"},
   {"สุขภาพดีโดยรวม รักษาเวลานอนและดื่มน้ำให้พอ",
    "มีอาการเล็กน้อยหายได้เองหากพักผ่อนเพียงพอ",
    "การเดินและยืดเส้นช่วยให้สดชื่นขึ้นมาก"},
   {"งานดำเนินไปตามแผน มีผู้ช่วยเหลือเมื่อต้องการ",
    "ได้โอกาสเรียนรู้สิ่งใหม่ที่เป็นประโยชน์ต่อสายงาน",
    "ผลงานค่อยๆ สะสม ความสม่ำเสมอคือกุญแจ"}},
  {/* ปานกลาง */
   {"รายรับรายจ่ายพอดีตัว ยังไม่ควรลงทุนเสี่ยงสูงหรือกู้เพิ่ม",
    "ทบทวนค่าใช้จ่ายประจำ ตัดสิ่งไม่จำเป็นจะช่วยได้มาก",
    "เงินมาช้าแต่มา อดทนและรอจังหวะที่เหมาะ"},
   {"ความรักอยู่ในช่วงนิ่งๆ ให้เวลากับกันและกันมากขึ้น",
    "อย่าเพิ่งด่วนสรุปความรู้สึก รอให้ใจชัดเจนก่อน",
    "คนโสดควรโฟกัสที่ตัวเองก่อน จังหวะดีจะมาเอง"},
   {"ระวังความเหนื่อยสะสมและการนอนไม่พอ",
    "ควรปรับเรื่องอาหารและการขยับร่างกายให้สม่ำเสมอ",
    "อย่าละเลยอาการเล็กน้อย ถ้าเป็นต่อเนื่องควรพบแพทย์"},
   {"งานมีอุปสรรคเล็กน้อย แก้ได้ด้วยการสื่อสารให้ชัดเจน",
    "ช่วงนี้เหมาะกับการวางแผนมากกว่าการเปลี่ยนแปลงใหญ่",
    "อย่ารับงานเกินกำลัง จัดลำดับความสำคัญให้ดี"}},
  {/* ควรระวัง */
   {"ระวังรายจ่ายฉุกเฉินและการค้ำประกันหรือให้ยืมเงิน",
    "งดการเสี่ยงโชคและการลงทุนที่ไม่เข้าใจ ตรวจสัญญาให้รอบคอบ",
    "ควรมีเงินสำรองและระวังกลโกงออนไลน์"},
   {"ระวังคำพูดที่ทำร้ายกัน ใช้เวลาให้ใจเย็นลงก่อนคุยเรื่องใหญ่",
    "ความเข้าใจผิดอาจเกิดขึ้น ตรวจสอบข้อเท็จจริงก่อนตัดสินใจ",
    "อย่าเพิ่งตัดสินใจเรื่องใหญ่ในอารมณ์ รอให้ใจสงบ"},
   {"ควรพักผ่อนให้มากและตรวจสุขภาพ อย่าฝืนร่างกาย",
    "ระวังอุบัติเหตุจากการเดินทางและความเหนื่อยล้า",
    "ดูแลสุขภาพใจควบคู่กับกาย พูดคุยกับคนที่ไว้ใจได้"},
   {"ระวังความผิดพลาดจากความเร่งรีบ ตรวจงานซ้ำก่อนส่ง",
    "อาจมีแรงเสียดทานในที่ทำงาน ตั้งสติและบันทึกข้อตกลงเป็นลายลักษณ์อักษร",
    "เลี่ยงการตัดสินใจเปลี่ยนงานทันที ประเมินให้รอบด้านก่อน"}}};

EXPORT("draw_siamese_sticks") int draw_siamese_sticks(int shake_power) {
  if (shake_power < 0) shake_power = 0;
  if (shake_power > 100000) shake_power = 100000;
  rmix((u64)shake_power + 0x51ED270BULL);
  int n = (int)rnd_below(28);
  const Stick *s = &STICKS[n];
  j_begin();
  kv_int("stick", n + 1);
  kv_int("level", s->level);
  kv_str("level_name", LEVEL_NAME[s->level]);
  kv_str("title", s->title);
  kv_str("verse", s->verse);
  j_key("aspects");
  j_open('[');
  for (int a = 0; a < 4; a++) {
    j_open('{');
    kv_str("name", ASPECT_NAME[a]);
    kv_str("text", STICK_TEXT[s->level][a][(n * 5 + a * 2) % 3]);
    j_close('}');
  }
  j_close(']');
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Tarot (22 major arcana)                                            */
/* ------------------------------------------------------------------ */
typedef struct { const char *th, *en, *up, *rev; } Tarot;
static const Tarot TAROT[22] = {
  {"ผู้เริ่มต้น", "The Fool", "เริ่มต้นสิ่งใหม่ กล้าลองอย่างมีสติ", "ประมาทหรือขาดการวางแผน ชะลอแล้วทบทวน"},
  {"จอมเวท", "The Magician", "มีทรัพยากรครบ ลงมือได้เลย", "ขาดโฟกัสหรือใช้ความสามารถไม่ตรงทาง"},
  {"สตรีนักบวช", "The High Priestess", "ฟังสัญชาตญาณ ความลับกำลังเผยทีละน้อย", "ข้อมูลยังไม่ครบ อย่าเพิ่งสรุป"},
  {"จักรพรรดินี", "The Empress", "ความอุดมสมบูรณ์ ความเมตตา และการเติบโต", "พึ่งพาผู้อื่นมากไปหรือลืมดูแลตัวเอง"},
  {"จักรพรรดิ", "The Emperor", "ระเบียบ ความมั่นคง ภาวะผู้นำ", "ดื้อรั้นหรือเข้มงวดเกินไป ลองผ่อนปรน"},
  {"ผู้สอนธรรม", "The Hierophant", "คำแนะนำจากผู้ใหญ่ ประเพณี และแบบแผนที่ดี", "ฝืนกรอบหรือไม่ฟังใคร ลองเปิดรับมุมมองอื่น"},
  {"คู่รัก", "The Lovers", "ความรักและการเลือกที่ตรงกับหัวใจ", "ลังเลหรือความไม่ลงรอย ต้องพูดคุยให้ชัด"},
  {"รถศึก", "The Chariot", "ชัยชนะจากความมุ่งมั่นและวินัย", "หลงทิศหรือควบคุมอารมณ์ไม่อยู่"},
  {"พลัง", "Strength", "ความกล้าหาญอย่างอ่อนโยน ใจเย็นชนะทุกสิ่ง", "สงสัยในตัวเอง ต้องการกำลังใจ"},
  {"ฤๅษี", "The Hermit", "เวลาทบทวนตัวเอง ความสงบนำปัญญา", "โดดเดี่ยวเกินไป ลองติดต่อคนที่ไว้ใจ"},
  {"กงล้อโชคชะตา", "Wheel of Fortune", "จังหวะชีวิตกำลังเปลี่ยนไปในทางที่ดี", "ติดขัดชั่วคราว วงล้อจะหมุนต่อไป"},
  {"ความยุติธรรม", "Justice", "ความจริงและความสมดุล การตัดสินใจที่เป็นธรรม", "ความไม่เป็นธรรมหรือการเลี่ยงความรับผิดชอบ"},
  {"ผู้ถูกแขวน", "The Hanged Man", "หยุดและมองมุมใหม่ ยอมปล่อยเพื่อได้มากกว่า", "ยื้อโดยไม่เกิดประโยชน์ ถึงเวลาตัดสินใจ"},
  {"การเปลี่ยนผ่าน", "Death", "จบสิ่งเก่าเพื่อเริ่มสิ่งใหม่ ไม่ได้หมายถึงความตายจริง", "ต่อต้านการเปลี่ยนแปลง ปล่อยวางจะเบาขึ้น"},
  {"ความพอดี", "Temperance", "สมดุล อดทน ผสมผสานอย่างลงตัว", "มากหรือน้อยเกินพอดี กลับมาหาทางสายกลาง"},
  {"พันธนาการ", "The Devil", "ระวังความยึดติดและนิสัยที่ผูกมัดตัวเอง", "เริ่มหลุดจากพันธนาการ ได้อิสระคืนมา"},
  {"หอคอย", "The Tower", "การเปลี่ยนแปลงฉับพลันที่ทำลายของเก่าที่ไม่มั่นคง", "ฝืนเลี่ยงการเปลี่ยนแปลง ผลกระทบยังค้างอยู่"},
  {"ดวงดาว", "The Star", "ความหวังและการเยียวยา แสงสว่างปลายทาง", "ความหวังริบหรี่ ต้องเติมศรัทธาให้ตัวเอง"},
  {"ดวงจันทร์", "The Moon", "ความไม่แน่นอนและความกลัวที่เงาหลอก", "ความจริงเริ่มกระจ่าง ความกลัวจางลง"},
  {"ดวงอาทิตย์", "The Sun", "ความสุข ความสำเร็จ และพลังบวก", "ความสุขมาช้ากว่าที่คิด แต่ยังอยู่ใกล้"},
  {"การตื่นรู้", "Judgement", "ถึงเวลาตื่นรู้และตัดสินใจครั้งสำคัญ", "ลังเลหรือวิพากษ์ตัวเองหนักเกินไป"},
  {"โลก", "The World", "สำเร็จครบวงจร ได้รับสิ่งที่ตั้งใจ", "ใกล้เสร็จแล้วแต่ยังขาดอีกขั้นหนึ่ง"}};

EXPORT("draw_tarot_cards") int draw_tarot_cards(int count) {
  if (count < 1) count = 1;
  if (count > 10) count = 10;
  int deck[22];
  for (int i = 0; i < 22; i++) deck[i] = i;
  rmix((u64)count * 0x7F4A7C15ULL);
  for (int i = 21; i > 0; i--) { /* Fisher-Yates */
    int j = (int)rnd_below((u32)(i + 1));
    int t = deck[i]; deck[i] = deck[j]; deck[j] = t;
  }
  j_begin();
  kv_int("count", count);
  j_key("cards");
  j_open('[');
  for (int i = 0; i < count; i++) {
    const Tarot *c = &TAROT[deck[i]];
    int rev = (rnd_below(3) == 0);
    j_open('{');
    kv_int("id", deck[i]);
    kv_str("name", c->th);
    kv_str("en", c->en);
    kv_bool("reversed", rev);
    kv_str("meaning", rev ? c->rev : c->up);
    j_close('}');
  }
  j_close(']');
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Lucky numbers                                                      */
/* ------------------------------------------------------------------ */
static u64 daily_seed(u32 salt) {
  u64 h = S.valid ? S.h : FNV_OFF;
  u32 d = (u32)(cur_y * 10000 + cur_m * 100 + cur_d);
  h = fnv((const u8 *)&d, 4, h);
  h = fnv((const u8 *)&salt, 4, h);
  int z = S.valid ? S.z : 0;
  h = fnv((const u8 *)&z, 4, h);
  return h;
}
static void put_num(int v, int digits) {
  char t[8]; int n = digits;
  t[n] = 0;
  while (n--) { t[n] = (char)('0' + v % 10); v /= 10; }
  j_str(t);
}

/* category: 0 = two-digit, 1 = three-digit, 2 = all (+ running digits) */
EXPORT("generate_lucky_numbers") int generate_lucky_numbers(int category) {
  if (category < 0 || category > 2) return -1;
  u64 st = daily_seed(lucky_calls++);
  rmix(st);
  int by = S.valid ? S.by : 2000;
  int z = S.valid ? S.z : 0;
  j_begin();
  kv_int("category", category);
  if (category == 0 || category == 2) {
    j_key("two");
    j_open('[');
    put_num(((by % 10) * 10 + z % 10) % 100, 2);
    for (int i = 1; i < 3; i++) put_num((int)(smix(&st) % 100), 2);
    j_close(']');
  }
  if (category == 1 || category == 2) {
    j_key("three");
    j_open('[');
    put_num((by % 10) * 100 + (cur_d % 10) * 10 + z % 10, 3);
    for (int i = 1; i < 3; i++) put_num((int)(smix(&st) % 1000), 3);
    j_close(']');
  }
  if (category == 2) {
    int a = (int)(smix(&st) % 10), b = (int)(smix(&st) % 10);
    if (b == a) b = (b + 3) % 10;
    j_key("run");
    j_open('[');
    j_int(a); j_int(b);
    j_close(']');
  }
  kv_str("note", "เลขนี้ใช้เพื่อความบันเทิงเท่านั้น ไม่ได้ทำนายผลสลากจริง และการเสี่ยงโชคมีความเสี่ยงเสมอ");
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Bad-luck remedy (ปีชง / สะเดาะเคราะห์)                              */
/* ------------------------------------------------------------------ */
static const int BREAK_PAIR[12] = {9, 4, 11, 6, 1, 8, 3, 10, 5, 0, 7, 2};
/* 0 none, 1 own year, 2 clash, 3 harm, 4 break */
static int relation(int mine, int yr) {
  if (mine == yr) return 1;
  if ((mine + 6) % 12 == yr) return 2;
  if ((mine + yr) % 12 == 7) return 3;
  if (BREAK_PAIR[mine] == yr) return 4;
  return 0;
}
static const char *REL_NAME[5] = {"ไม่ชง (ดวงปกติ)", "ปีตรงนักษัตร", "ปีชง (ปะทะ)", "ปีไห่ (เบียดเบียน)", "ปีพัง (ทำลาย)"};
static const int REL_SEV[5] = {0, 1, 3, 2, 1};
static const char *REL_TEXT[5] = {
  "ปีนี้ดวงไม่ตรงกับปีชงโดยตรง ใช้ชีวิตตามปกติ เสริมดวงด้วยการทำบุญและรักษาน้ำใจต่อผู้อื่น",
  "ปีตรงนักษัตรเชื่อกันว่าพลังชีวิตแปรผัน ควรทำใจให้นิ่ง ใส่ของสีมงคล และทำบุญไหว้พระ",
  "ปีชงตรงเชื่อกันว่าดวงปะทะแรง ควรเพิ่มความรอบคอบทุกด้าน ประหยัดอดออม และระวังการเดินทาง",
  "ปีไห่เชื่อกันว่ามีเรื่องกวนใจจากคนใกล้ตัว ควรสื่อสารตรงไปตรงมาและหลีกเลี่ยงข้อพิพาท",
  "ปีพังเชื่อกันว่าแผนที่วางไว้อาจสะดุด ควรเผื่อแผนสำรองและไม่ฝืนเปลี่ยนแปลงใหญ่"};
static const char *PROBLEM_NAME[4] = {"การเงิน", "ความรัก", "สุขภาพ", "การงาน"};
static const char *PRACTICAL[4] = {
  "ทำบัญชีรายรับรายจ่าย ตั้งเงินสำรองฉุกเฉิน 3-6 เดือน และหลีกเลี่ยงการกู้หรือค้ำประกันให้ใคร",
  "ตั้งเวลาคุยกันแบบไม่มีโทรศัพท์ ฟังก่อนตอบ และขอโทษตรงๆ เมื่อเป็นฝ่ายผิด",
  "ตรวจสุขภาพประจำปี นอนให้พอ ออกกำลังกายเบาๆ และพบแพทย์เมื่อมีอาการผิดปกติ",
  "จดงานค้างและจัดลำดับความสำคัญ สื่อสารกับหัวหน้าให้ชัดเจน และพัฒนาทักษะเพิ่มเติม"};
static const char *MERIT[4] = {
  "ทำบุญบริจาคช่วยผู้ขาดแคลน และไหว้พระขอพรด้วยดอกไม้ ธูป เทียน",
  "ไหว้ขอพรด้วยดอกไม้สีชมพูหรือสีแดง ตั้งจิตให้มีเมตตาต่อคนรอบข้าง",
  "ถวายสังฆทานหรือบริจาคช่วยโรงพยาบาล และสวดแผ่เมตตา",
  "ไหว้พระหรือศาลเจ้าประจำถิ่น ขอพรให้การงานราบรื่น และตั้งใจช่วยเหลือเพื่อนร่วมงาน"};

EXPORT("calculate_bad_luck_remedy") int calculate_bad_luck_remedy(int zodiac, int problem_type) {
  if (problem_type < 0 || problem_type > 3) return -1;
  if (zodiac < 0) zodiac = S.valid ? S.z : -1;
  if (zodiac < 0 || zodiac > 11) return -3;
  int yb = year_branch(cur_y);
  int rel = relation(zodiac, yb);
  j_begin();
  kv_int("zodiac", zodiac);
  kv_str("zodiac_name", ZOD[zodiac].name);
  kv_int("year", cur_y);
  kv_str("year_name", ZOD[yb].name);
  kv_int("relation", rel);
  kv_str("relation_name", REL_NAME[rel]);
  kv_int("severity", REL_SEV[rel]);
  kv_str("problem", PROBLEM_NAME[problem_type]);
  kv_str("summary", REL_TEXT[rel]);
  kv_str("practical", PRACTICAL[problem_type]);
  kv_str("merit", MERIT[problem_type]);
  kv_str("color", ZOD[zodiac].color);
  kv_str("direction", ZOD[zodiac].dir);
  kv_str("yantra", "นะ โม พุท ธา ยะ");
  j_key("mantra");
  j_open('[');
  j_str("นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (3 จบ)");
  j_str("สัพเพ สัตตา อะเวรา โหนตุ อัพยาปัชฌา โหนตุ อะนีฆา โหนตุ สุขี อัตตานัง ปะริหะรันตุ");
  j_close(']');
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Digital offering (candle / lantern / ...)                          */
/* ------------------------------------------------------------------ */
static const char *OFFER_NAME[6] = {"จุดเทียน", "ลอยโคม", "ถวายธูปดอกไม้", "สาดน้ำสงกรานต์", "ลอยกระทง", "อั่งเปา"};

/* keyword groups: 0 money 1 love 2 health 3 work */
static const char *KW[4][8] = {
  {"เงิน", "หนี้", "ลงทุน", "จน", "รวย", "ค่าใช้จ่าย", "การเงิน", 0},
  {"รัก", "แฟน", "คู่", "เลิก", "หัวใจ", "คิดถึง", "อกหัก", 0},
  {"ป่วย", "สุขภาพ", "โรค", "เจ็บ", "ปวด", "เหนื่อย", "นอนไม่หลับ", 0},
  {"งาน", "เจ้านาย", "เรียน", "สอบ", "ลูกค้า", "เพื่อนร่วมงาน", "ลาออก", 0}};
static const char *CARE_WORDS[6] = {"ฆ่าตัวตาย", "อยากตาย", "ทำร้ายตัวเอง", "ไม่อยากมีชีวิต", "จบชีวิต", 0};
static const char *GUIDE[5][2] = {
  {"ความกังวลเรื่องเงินเป็นเรื่องจริง ลองแบ่งปัญหาเป็นก้อนเล็กๆ แล้วจัดการทีละก้อน และขอคำปรึกษาจากคนที่ไว้ใจหรือหน่วยงานให้คำปรึกษาได้",
   "เส้นทางการเงินเริ่มจากรู้ตัวเลขจริงของตัวเอง เขียนทุกอย่างออกมา แล้วคุณจะเห็นทางไปต่อชัดขึ้น"},
  {"หัวใจที่เหนื่อยต้องการเวลา ให้ตัวเองพักก่อนตัดสินใจ และเล่าความรู้สึกให้คนที่ไว้ใจฟัง",
   "ความรักที่ดีเริ่มจากการรักตัวเอง วันนี้ลองทำสิ่งเล็กๆ ที่ทำให้คุณยิ้มได้"},
  {"ร่างกายกำลังบอกให้พัก ลองนอนให้พอ และพบแพทย์ถ้ามีอาการต่อเนื่อง",
   "สุขภาพกายและใจเกี่ยวพันกัน ลองหายใจลึกๆ ช้าๆ สัก 5 ครั้ง แล้วค่อยๆ ดูแลตัวเองทีละอย่าง"},
  {"งานที่หนักจะเบาลงเมื่อแบ่งเป็นขั้นตอน เลือกเรื่องสำคัญที่สุดเพียงหนึ่งเรื่องแล้วเริ่มจากตรงนั้น",
   "ความเหนื่อยในการงานไม่ได้แปลว่าคุณไม่เก่ง ลองขอคำปรึกษาจากคนที่ไว้ใจ"},
  {"สิ่งที่คุณปล่อยลอยไปวันนี้คือความกังวลที่แบกไว้ ขอให้ใจเบาลงและเห็นทางออกในเร็ววัน",
   "การเขียนความในใจออกมาคือก้าวแรกของการคลี่คลาย ขอให้ทุกอย่างค่อยๆ ดีขึ้น"}};
static const char *CARE_MSG =
  "ขอบคุณที่ไว้ใจเล่าออกมา ความเจ็บปวดนี้เป็นเรื่องจริง และคุณไม่ต้องแบกมันอยู่คนเดียว "
  "ถ้าคุณกำลังคิดทำร้ายตัวเอง โปรดโทรสายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง) หรือบอกคนที่ไว้ใจให้มาอยู่ด้วยตอนนี้ "
  "หากอยู่ในอันตรายเฉียบพลันโทร 1669";

static int has_sub(const u8 *h, int hn, const char *nd) {
  int nn = slen(nd);
  if (nn == 0 || nn > hn) return 0;
  for (int i = 0; i + nn <= hn; i++) {
    int k = 0;
    while (k < nn && h[i + k] == (u8)nd[k]) k++;
    if (k == nn) return 1;
  }
  return 0;
}

static void hex8(u32 v, char *o) {
  for (int i = 7; i >= 0; i--) { o[i] = "0123456789ABCDEF"[v & 15]; v >>= 4; }
  o[8] = 0;
}

EXPORT("process_digital_offering") int process_digital_offering(int offering_type, const char *text, int len) {
  if (offering_type < 0 || offering_type > 5) return -1;
  if (len < 0 || len > 4000) return -2;
  const u8 *t = (const u8 *)text;
  for (int i = 0; CARE_WORDS[i]; i++) {
    if (has_sub(t, len, CARE_WORDS[i])) {
      j_begin();
      kv_str("offering", OFFER_NAME[offering_type]);
      kv_bool("care", 1);
      kv_str("message", CARE_MSG);
      return j_end();
    }
  }
  int best = 4, bestc = 0;
  for (int g = 0; g < 4; g++) {
    int c = 0;
    for (int k = 0; KW[g][k]; k++) c += has_sub(t, len, KW[g][k]);
    if (c > bestc) { bestc = c; best = g; }
  }
  u64 h = fnv(t, len, FNV_OFF);
  h ^= S.valid ? S.h : 0;
  rmix(h);
  j_begin();
  kv_str("offering", OFFER_NAME[offering_type]);
  kv_bool("care", 0);
  kv_str("category", best < 4 ? PROBLEM_NAME[best] : "ทั่วไป");
  kv_str("message", GUIDE[best][(h >> 7) & 1]);
  kv_int("merit", 10 + (int)(rnd_below(90)));
  j_key("lucky");
  put_num((int)(rnd_below(100)), 2);
  kv_str("color", ZOD[S.valid ? S.z : (int)rnd_below(12)].color);
  return j_end();
}

/* Candle ritual: hold to light. Needs >= 4000 ms to unlock. */
static const char *DEDICATION[3] = {
  "ขอให้ใจสงบ สว่างดั่งแสงเทียน",
  "ขอให้ทุกข์เบาบาง สุขเข้ามาแทนที่",
  "ขอให้ปัญญานำทาง พ้นเคราะห์ภัยทั้งปวง"};

EXPORT("candle_unlock") int candle_unlock(int hold_ms) {
  if (hold_ms < 0) hold_ms = 0;
  if (hold_ms > 60000) hold_ms = 60000;
  int level = hold_ms / 50;
  if (level > 100) level = 100;
  j_begin();
  kv_int("level", level);
  if (hold_ms < 4000) {
    kv_bool("unlocked", 0);
    kv_int("remaining_ms", 4000 - hold_ms);
    return j_end();
  }
  rmix((u64)hold_ms);
  kv_bool("unlocked", 1);
  kv_str("dedication", DEDICATION[rnd_below(3)]);
  j_key("mantra");
  j_open('[');
  j_str("นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (3 จบ)");
  j_str("สัพเพ สัตตา สุขิตา โหนตุ");
  j_close(']');
  j_key("lucky2"); put_num((int)rnd_below(100), 2);
  j_key("lucky3"); put_num((int)rnd_below(1000), 3);
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Image scan (local only; pixel statistics used as a seed)           */
/* ------------------------------------------------------------------ */
static const char *ELEM[5] = {"ไฟ", "ดิน", "โลหะ", "น้ำ", "ไม้"};
static const char *IMG_READ[2][5] = {
  {"บุคลิกร้อนแรงมีพลัง เป็นผู้นำโดยธรรมชาติ ควรใจเย็นเมื่อตัดสินใจ",
   "มั่นคงน่าไว้ใจ สะสมความสำเร็จช้าแต่แน่นอน",
   "เฉียบคม มีระเบียบ ละเอียดรอบคอบ เหมาะกับงานที่ต้องการความแม่นยำ",
   "ปรับตัวเก่ง ลึกซึ้ง ใช้สัญชาตญาณและความคิดสร้างสรรค์ได้ดี",
   "เติบโตเรื่อยๆ ใจกว้าง ชอบเรียนรู้และช่วยเหลือผู้อื่น"},
  {"เส้นพลังงานเด่น ชอบลงมือทำ เหมาะกับการเริ่มต้นสิ่งใหม่",
   "เส้นชีวิตมั่นคง ชีวิตเติบโตแบบสะสม ค่อยเป็นค่อยไป",
   "เส้นการงานชัด วินัยดี ผลงานเป็นระเบียบ",
   "เส้นใจลึกซึ้ง อ่อนไหวและเข้าใจผู้อื่น",
   "เส้นโชคแตกกิ่ง มีโอกาสหลายทาง ขอให้เลือกอย่างมีสติ"}};

static int score5(u64 h, int k) { return 1 + (int)(((h >> (8 * k)) & 0xFF) % 5); }

/* px: RGBA bytes; mode 0 = face, 1 = palm */
EXPORT("process_image_scan") int process_image_scan(const u8 *px, int len, int mode) {
  if (!px || len < 16 || len > (int)(1024 * 1024) || (mode != 0 && mode != 1)) return -1;
  int n = len / 4;
  u64 sr = 0, sg = 0, sb = 0, edge = 0;
  int prev = -1;
  for (int i = 0; i < n; i++) {
    int r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    sr += (u64)r; sg += (u64)g; sb += (u64)b;
    int lum = (r * 30 + g * 59 + b * 11) / 100;
    if (prev >= 0) edge += (u64)(lum > prev ? lum - prev : prev - lum);
    prev = lum;
  }
  int mr = (int)(sr / (u64)n), mg = (int)(sg / (u64)n), mb = (int)(sb / (u64)n);
  int me = (int)(edge / (u64)n);
  u64 h = fnv(px, len, FNV_OFF);
  h ^= S.valid ? S.h : 0;
  h *= FNV_PRIME;
  int el = (mr * 3 + mg * 5 + mb * 7 + me * 11 + (int)(h & 0xFF)) % 5;
  j_begin();
  kv_int("mode", mode);
  kv_str("element", ELEM[el]);
  kv_str("reading", IMG_READ[mode][el]);
  j_key("scores");
  j_open('{');
  kv_int("wealth", score5(h, 0));
  kv_int("love", score5(h, 1));
  kv_int("health", score5(h, 2));
  kv_int("career", score5(h, 3));
  j_close('}');
  char hx[9];
  hex8((u32)(h >> 16), hx);
  kv_str("fingerprint", hx);
  kv_int("brightness", (mr * 30 + mg * 59 + mb * 11) / 100);
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Signature analysis. pts = int32 triples (x, y, stroke_id)          */
/* ------------------------------------------------------------------ */
EXPORT("process_signature") int process_signature(const int *p, int n) {
  if (!p || n < 8 || n > 20000) return -1;
  int minx = 1 << 30, maxx = -(1 << 30), miny = 1 << 30, maxy = -(1 << 30);
  int strokes = 0, lastS = -1, px = 0, py = 0, pdx = 0, pdy = 0, rev = 0, segs = 0;
  float len = 0.0f;
  u64 h = S.valid ? S.h : FNV_OFF;
  for (int i = 0; i < n; i++) {
    int x = p[i * 3], y = p[i * 3 + 1], s = p[i * 3 + 2];
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
    if (s != lastS) { strokes++; lastS = s; }
    else {
      int dx = x - px, dy = y - py;
      len += __builtin_sqrtf((float)(dx * dx + dy * dy));
      if (dx || dy) {
        if (segs > 0 && (dx * pdx + dy * pdy) < 0) rev++;
        pdx = dx; pdy = dy; segs++;
      }
    }
    px = x; py = y;
    h = fnv((const u8 *)&x, 4, h);
    h = fnv((const u8 *)&y, 4, h);
  }
  int w = maxx - minx, ht = maxy - miny;
  int big = w > ht ? w : ht;
  int size = big > 600 ? 2 : (big < 250 ? 0 : 1);
  int net = p[1] - p[(n - 1) * 3 + 1]; /* screen y grows downward */
  int rise = (ht > 20 && net * 4 > ht) ? 2 : ((ht > 20 && -net * 4 > ht) ? 0 : 1);
  int jag = segs > 0 ? rev * 100 / segs : 0;
  int jc = jag > 35 ? 2 : (jag < 15 ? 0 : 1);

  static const char *SIZE_T[3] = {
    "ลายเซ็นเล็กกระชับ สะท้อนความละเอียดรอบคอบและรักสงบ",
    "ลายเซ็นขนาดพอดี สะท้อนความสมดุลระหว่างตัวตนและผู้อื่น",
    "ลายเซ็นใหญ่ สะท้อนความมั่นใจและชอบเป็นศูนย์กลาง"};
  static const char *RISE_T[3] = {
    "เส้นทอดลง สะท้อนความระมัดระวังและคิดมาก ควรให้กำลังใจตัวเอง",
    "เส้นเรียบระดับ สะท้อนความมั่นคงและอารมณ์คงที่",
    "เส้นพุ่งขึ้น สะท้อนความหวังและมองโลกในแง่ดี"};
  static const char *JAG_T[3] = {
    "เส้นลื่นไหล สะท้อนความอ่อนโยนและปรับตัวเก่ง",
    "จังหวะปานกลาง สะท้อนความยืดหยุ่นและหนักแน่นเมื่อจำเป็น",
    "มุมหักเยอะ สะท้อนความคิดไวและอารมณ์เปลี่ยนเร็ว"};

  int bit0 = (int)((h >> 3) & 1), bit1 = (int)((h >> 11) & 1);
  int bit2 = (int)((h >> 19) & 1), bit3 = (int)((h >> 27) & 1);
  int wealth = 2 + (rise == 2) + (size == 2) + bit0;
  int love = 2 + (jc == 0) + (strokes <= 2) + bit1;
  int career = 2 + (rise == 2) + (jc == 1) + (strokes >= 3) + bit2;
  int luck = 2 + bit3 + (size == 1) + (jc < 2);
  if (wealth > 5) wealth = 5;
  if (love > 5) love = 5;
  if (career > 5) career = 5;
  if (luck > 5) luck = 5;

  j_begin();
  kv_int("strokes", strokes);
  kv_int("length", (int)len);
  kv_int("width", w);
  kv_int("height", ht);
  kv_int("jaggedness", jag);
  j_key("traits");
  j_open('[');
  j_str(SIZE_T[size]);
  j_str(RISE_T[rise]);
  j_str(JAG_T[jc]);
  j_close(']');
  j_key("scores");
  j_open('{');
  kv_int("wealth", wealth);
  kv_int("love", love);
  kv_int("career", career);
  kv_int("luck", luck);
  j_close('}');
  return j_end();
}

/* ------------------------------------------------------------------ */
/* Festivals                                                          */
/* ------------------------------------------------------------------ */
static const char *FEST_NAME[6] = {"วันธรรมดา", "สงกรานต์", "ฮาโลวีน", "ลอยกระทง", "ตรุษจีน", "ปีใหม่"};
static const char *FEST_TAG[6] = {
  "ศาลเจ้าแห่งโชคลาภ เปิดให้ขอพรทุกวัน",
  "สาดน้ำทายโชค เปิดคำทำนายปีใหม่ไทย",
  "เปิดโลงศพ สุ่มไพ่ดาร์กแฟนตาซี",
  "ลอยกระทงดิจิทัล ลุ้นเลขเด็ด",
  "อั่งเปาดิจิทัลพารวย",
  "นับถอยหลังสู่ปีแห่งโชค"};

/* 0 normal, 1 songkran, 2 halloween, 3 loy krathong, 4 chinese new year, 5 new year */
EXPORT("get_festival") int get_festival(int month, int day) {
  if (month == 4) return 1;
  if (month == 10) return 2;
  if (month == 11) return 3;
  if ((month == 1 && day >= 15) || month == 2) return 4;
  if ((month == 12 && day >= 20) || (month == 1 && day < 15)) return 5;
  return 0;
}

EXPORT("festival_info") int festival_info(int id) {
  if (id < 0 || id > 5) return -1;
  j_begin();
  kv_int("id", id);
  kv_str("name", FEST_NAME[id]);
  kv_str("tagline", FEST_TAG[id]);
  return j_end();
}

static const char *BLESS[6][3][2] = {
  {{"พรประจำวัน", "ขอให้วันนี้ใจเบา ทำสิ่งเล็กๆ ให้ดีที่สุด แล้วโชคจะตามมาเอง"},
   {"ธูปหนึ่งดอก", "ความตั้งใจที่ซื่อตรงคือเครื่องบูชาที่ดีที่สุด"},
   {"ใจสงบเป็นทรัพย์", "ขอให้พบความสงบกลางความวุ่นวายและเห็นทางออกชัดเจน"}},
  {{"น้ำใสใจสบาย", "น้ำที่รดวันนี้ชะล้างเรื่องหนักใจปีเก่า ปีใหม่ขอให้เย็นกายสบายใจ การเงินไหลคล่องเหมือนสายน้ำ"},
   {"สาดน้ำเรียกโชค", "ปีใหม่ไทยนี้มีเกณฑ์พบผู้ใหญ่ใจดีช่วยเหลือ ขอให้เดินทางปลอดภัยและพบแต่คนน้ำใจงาม"},
   {"รดน้ำขอพร", "ขอให้ผู้ใหญ่อวยพร ครอบครัวพร้อมหน้า สุขภาพแข็งแรง และเริ่มสิ่งใหม่ได้ราบรื่น"}},
  {{"คำสาปกลายเป็นพร", "ความกลัวที่ซ่อนอยู่กำลังสลายตามแสงจันทร์ ผู้ที่กล้าเผชิญสิ่งที่หลบหนีจะได้ของขวัญกลับมา"},
   {"หีบสมบัติแวมไพร์", "ของมีค่ารออยู่ในที่ที่ไม่มีใครกล้ามอง ลองกลับไปสะสางเรื่องค้างคา ผลที่ได้อาจเกินคาด"},
   {"เงาแห่งเที่ยงคืน", "เงาของคุณแค่ตามหาความจริง ฟังเสียงเล็กๆ ในใจ แล้วตัดสินใจอย่างมีสติ"}},
  {{"กระทงนำพร", "ขอให้ความขุ่นเคืองลอยไปกับสายน้ำ และรับแสงสว่างของความหวังใหม่"},
   {"ขอขมาแม่คงคา", "ขอบคุณสายน้ำที่หล่อเลี้ยงชีวิต ขอให้โชคลาภไหลมาเทมา และมีความสุขสงบ"},
   {"ธารน้ำนำโชค", "ความตั้งใจที่ตั้งไว้จะเป็นจริงทีละก้าว ขอให้พบเรื่องดีที่รออยู่ปลายทาง"}},
  {{"อั่งเปามงคล", "ซินเจียยู่อี่ ซินนี้ฮวดไช้ ขอให้การงานก้าวหน้าและสุขภาพแข็งแรง"},
   {"มังกรทองนำโชค", "ปีใหม่ของใจเริ่มวันนี้ ลงมือทำสิ่งที่ตั้งใจ ผลจะค่อยๆ งอกงาม"},
   {"ทรัพย์เข้าบ้าน", "ขอให้ค้าขายคล่อง เงินทองไหลมา และมีเวลาอยู่กับคนที่รัก"}},
  {{"ตั้งใจใหม่", "ปีใหม่เป็นโอกาสวางเป้าหมายเล็กๆ ที่ทำได้จริง เริ่มจากหนึ่งเรื่องก่อน"},
   {"พรปีใหม่", "ขอให้ปีหน้าสุขภาพดี ใจสงบ และได้ทำสิ่งที่รัก"},
   {"นับถอยหลังสู่โชค", "สิ่งดีๆ รอคนที่ลงมือ ขอให้ทุกก้าวของปีใหม่มั่นคง"}}};
static const int ANGPAO[7] = {8, 18, 28, 66, 88, 168, 888};

EXPORT("draw_festival_blessing") int draw_festival_blessing(int id) {
  if (id < 0 || id > 5) return -1;
  rmix((u64)id + 0xFE57ULL);
  int k = (int)rnd_below(3);
  j_begin();
  kv_int("festival", id);
  kv_str("title", BLESS[id][k][0]);
  kv_str("text", BLESS[id][k][1]);
  j_key("lucky"); put_num((int)rnd_below(100), 2);
  if (id == 4) kv_int("angpao", ANGPAO[rnd_below(7)]);
  return j_end();
}
