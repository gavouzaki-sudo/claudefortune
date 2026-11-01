import React from 'react';
import type { UserSession } from '../types';
export type DivinationTopic = 'stick' | 'tarot' | 'number' | 'ritual' | 'love' | 'scan' | 'festival';

interface DivinationHubProps {
  session: UserSession;
  onSelectTopic: (topic: DivinationTopic) => void;
  onBackToGate: () => void;
  festivalName?: string;
}

interface MenuItem {
  id: DivinationTopic;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
}

export const DivinationHub: React.FC<DivinationHubProps> = ({
  session,
  onSelectTopic,
  onBackToGate,
  festivalName,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'stick',
      title: 'เสี่ยงเซียมซี',
      badge: 'ศาสตร์ศักดิ์สิทธิ์โบราณ',
      subtitle: 'เซียมซีมงคล 28 ใบ',
      description: 'เขย่ากระบอกไม้ไผ่ ขอพรทวยเทพ สดับรับฟังคำทำนายโชคลาภ การงาน ความรัก และสุขภาพ',
      icon: '🏮',
      accentColor: '#ffc94d',
    },
    {
      id: 'tarot',
      title: 'ไพ่ยิปซี',
      badge: 'ศาสตร์สากลตะวันตก',
      subtitle: 'ไพ่ทาโรต์เปิดลิขิตชะตา',
      description: 'เปิดไพ่ 1 ถึง 5 ใบ ส่องอดีต ปัจจุบัน อนาคต ผ่านห้องลับแม่มดหรือหอดูดาวพ่อมด',
      icon: '🔮',
      accentColor: '#d79bff',
    },
    {
      id: 'number',
      title: 'เลขมงคล',
      badge: 'ตัวเลขลิขิตนำโชค',
      subtitle: 'ศิลาสุสานเที่ยงคืน',
      description: 'สัมผัสคลื่นพลังตัวเลขนำโชค 2 ตัว 3 ตัว และเลขมหาโภคทรัพย์ประจำดวงชะตาของคุณ',
      icon: '🪦',
      accentColor: '#9dffb8',
    },
    {
      id: 'ritual',
      title: 'สะเดาะเคราะห์',
      badge: 'ปลดเปลื้องเคราะห์กรรม',
      subtitle: 'จากนรกสู่แสงสวรรค์',
      description: 'ตรวจสอบปีชง 4 มิติ แก้เคล็ด เสริมชะตา และจุดประทีปเทียนชัยอธิษฐานจิต',
      icon: '🪷',
      accentColor: '#ffd96a',
    },
    {
      id: 'love',
      title: 'ดวงความรัก',
      badge: 'สระบัวจันทร์สีชมพู',
      subtitle: 'วาสนาคู่แท้ & ธาตุสมพงษ์',
      description: 'เช็กสถานะหัวใจคนโสด คนแอบชอบ คนมีคู่ ส่องวาสนาคู่ชะตาและบทสวดมหาเสน่ห์',
      icon: '💖',
      accentColor: '#ff80ab',
    },
    {
      id: 'scan',
      title: 'สแกนดวง',
      badge: 'ไฮเทคโหงวเฮ้ง',
      subtitle: 'สแกนใบหน้า & เส้นลายมือ',
      description: 'วิเคราะห์โหงวเฮ้ง 5 ขุนเขา และ 4 เส้นลายมือหลัก (ชีวิต สมอง หัวใจ โชคชะตา) ด้วยเลเซอร์',
      icon: '🖐',
      accentColor: '#46dcff',
    },
    {
      id: 'festival',
      title: festivalName ? `ลานขอพร (${festivalName})` : 'ไหว้พระขอพร',
      badge: 'ศิริมงคลแห่งสายน้ำ',
      subtitle: 'วัดริมน้ำยามพลบค่ำ & โคมลอย',
      description: 'ถวายเครื่องสักการะ ปล่อยโคมลอยสู่ฟากฟ้าราตรี และจุดพลุถวายพรเสริมสิริมงคล',
      icon: '✨',
      accentColor: '#ffb347',
    },
  ];

  return (
    <section id="divination-hub" className="panel divination-hub-panel animate-rise">
      {/* Altar Banner Header */}
      <div className="hub-welcome-header">
        <div className="hub-avatar-ring">
          <span className="hub-avatar-icon">{session.symbolIcon}</span>
        </div>
        <div className="hub-welcome-text">
          <span className="hub-sys-badge">
            {session.systemName} · ผู้ถือครองสัญลักษณ์ {session.symbolName}
          </span>
          <h2 className="hub-title">หอพยากรณ์และมณฑลพิธีกรรม</h2>
          <p className="hub-sub">
            เลือกศาสตร์ศักดิ์สิทธิ์ที่ท่านปรารถนาจะเปิดประตูชะตาและสดับรับฟังคำทำนาย
          </p>
        </div>
        <div className="hub-back-btn-wrap">
          <button
            type="button"
            className="btn ghost btn-hub-back-gate"
            onClick={onBackToGate}
            title="กลับสู่ผืนฟ้าเพื่อเปลี่ยนอารยธรรมอื่น"
          >
            <span>🔄 เปลี่ยนอารยธรรมอื่น</span>
          </button>
        </div>
      </div>

      {/* Grid of 7 Divination Choice Cards */}
      <div className="hub-cards-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="hub-menu-card"
            style={{ '--card-acc': item.accentColor } as React.CSSProperties}
            onClick={() => onSelectTopic(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTopic(item.id);
              }
            }}
          >
            <div className="card-top-row">
              <span className="card-item-icon">{item.icon}</span>
              <span className="card-badge">{item.badge}</span>
            </div>

            <h3 className="card-item-title">{item.title}</h3>
            <span className="card-item-subtitle">{item.subtitle}</span>

            <p className="card-item-desc">{item.description}</p>

            <div className="card-footer-action">
              <span className="card-enter-text">เข้าสู่พิธี</span>
              <span className="card-enter-arrow">➔</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
