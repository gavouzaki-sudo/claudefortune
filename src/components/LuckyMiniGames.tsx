import React, { useState, useEffect, useRef, useCallback } from 'react';

export type MiniGameType = 'rps' | 'mole' | 'ox' | 'connect' | 'demon';

interface LuckyMiniGamesProps {
  onWin: () => void;
  onLose: () => void;
  onToast: (msg: string) => void;
  burnLevel: number;
}

/* =========================================================================
   1. ROCK-PAPER-SCISSORS (เป่ายิ้งฉุบ)
   ========================================================================= */
const RPSGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  type Choice = 'rock' | 'paper' | 'scissors';
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [outcome, setOutcome] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);

  const choices: { id: Choice; icon: string; label: string }[] = [
    { id: 'rock', icon: '✊', label: 'ค้อน' },
    { id: 'scissors', icon: '✌️', label: 'กรรไกร' },
    { id: 'paper', icon: '✋', label: 'กระดาษ' },
  ];

  const handlePlay = (choice: Choice) => {
    if (isShooting) return;
    setPlayerChoice(choice);
    setIsShooting(true);
    setOutcome(null);

    setTimeout(() => {
      const all: Choice[] = ['rock', 'paper', 'scissors'];
      const ai = all[Math.floor(Math.random() * all.length)];
      setAiChoice(ai);

      let res: 'win' | 'lose' | 'draw';
      if (choice === ai) {
        res = 'draw';
      } else if (
        (choice === 'rock' && ai === 'scissors') ||
        (choice === 'scissors' && ai === 'paper') ||
        (choice === 'paper' && ai === 'rock')
      ) {
        res = 'win';
      } else {
        res = 'lose';
      }

      setOutcome(res);
      setIsShooting(false);

      if (res === 'win') {
        onWin();
      } else if (res === 'lose') {
        onLose();
      }
    }, 450);
  };

  return (
    <div className="mini-game-container rps-container">
      <h4 className="mini-game-heading">✊ เป่ายิ้งฉุบกับสิ่งศักดิ์สิทธิ์</h4>
      <p className="mini-game-sub">เลือกค้อน กรรไกร หรือกระดาษ หากชนะเพลิงจะลามไหม้ยันต์ทันที!</p>

      <div className="rps-arena">
        <div className="rps-fighter player-side">
          <span className="rps-badge">คุณ</span>
          <span className={`rps-hand-display ${isShooting ? 'shaking-hand' : ''}`}>
            {playerChoice
              ? choices.find((c) => c.id === playerChoice)?.icon
              : '❓'}
          </span>
        </div>

        <span className="rps-vs">VS</span>

        <div className="rps-fighter ai-side">
          <span className="rps-badge">ศาลเจ้า</span>
          <span className={`rps-hand-display ${isShooting ? 'shaking-hand' : ''}`}>
            {aiChoice
              ? choices.find((c) => c.id === aiChoice)?.icon
              : '🏮'}
          </span>
        </div>
      </div>

      {outcome && (
        <div className={`mini-game-result-msg msg-${outcome}`}>
          {outcome === 'win' && '🎉 คุณชนะ! เพลิงเผายันต์เพิ่มขึ้น +1 ส่วน!'}
          {outcome === 'lose' && '🏮 ศาลเจ้าชนะ! ยันต์ยังไม่ไหม้ ลองเป่าใหม่อีกครั้ง'}
          {outcome === 'draw' && '🤝 เสมอกัน! จิตประสาน ตั้งสมาธิแล้วเป่าใหม่'}
        </div>
      )}

      <div className="rps-buttons-row">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn ghost rps-choice-btn ${playerChoice === c.id ? 'active' : ''}`}
            onClick={() => handlePlay(c.id)}
            disabled={isShooting}
          >
            <span className="choice-icon">{c.icon}</span>
            <span className="choice-text">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   2. WHACK-A-MOLE (ตีตัวตุ่น / ภูตนำโชค)
   ========================================================================= */
const WhackMoleGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({
  onWin,
  onLose,
}) => {
  const [activeMoleIndex, setActiveMoleIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(8);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [gameOverResult, setGameOverResult] = useState<'win' | 'lose' | null>(null);

  const timerRef = useRef<number | null>(null);
  const moleIntervalRef = useRef<number | null>(null);

  const TARGET_HITS = 3;

  const startGame = () => {
    setScore(0);
    setTimeLeft(8);
    setGameOverResult(null);
    setGameRunning(true);
    setActiveMoleIndex(Math.floor(Math.random() * 9));
  };

  // Timer loop
  useEffect(() => {
    if (!gameRunning) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(moleIntervalRef.current!);
          setGameRunning(false);
          setGameOverResult('lose');
          onLose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    moleIntervalRef.current = window.setInterval(() => {
      setActiveMoleIndex(Math.floor(Math.random() * 9));
    }, 850);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
    };
  }, [gameRunning, onLose]);

  // Handle hitting a mole
  const handleHit = (index: number) => {
    if (!gameRunning || activeMoleIndex !== index) return;

    setActiveMoleIndex(null);
    const newScore = score + 1;
    setScore(newScore);

    if (newScore >= TARGET_HITS) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
      setGameRunning(false);
      setGameOverResult('win');
      onWin();
    }
  };

  return (
    <div className="mini-game-container mole-container">
      <h4 className="mini-game-heading">🦔 ตีภูตนำโชคศาลเจ้า</h4>
      <p className="mini-game-sub">
        แตะตีภูตทองที่โผล่จากกระถางให้ครบ <b>{TARGET_HITS} ครั้ง</b> ภายใน 8 วินาที
      </p>

      <div className="mole-status-row">
        <span className="status-badge">
          คะแนน: <b>{score}</b> / {TARGET_HITS}
        </span>
        <span className="status-badge timer-badge">
          เวลา: <b>{timeLeft}s</b>
        </span>
      </div>

      <div className="mole-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`mole-pot ${activeMoleIndex === i ? 'has-mole' : ''}`}
            onClick={() => handleHit(i)}
            disabled={!gameRunning}
            aria-label={`กระถางใบที่ ${i + 1}`}
          >
            <span className="pot-rim">🏺</span>
            {activeMoleIndex === i && (
              <span className="mole-avatar popup-anim">👻</span>
            )}
          </button>
        ))}
      </div>

      {gameOverResult && (
        <div className={`mini-game-result-msg msg-${gameOverResult}`}>
          {gameOverResult === 'win'
            ? '🎉 ตีครบเป้าหมายสำเร็จ! เพลิงไหม้ยันต์เพิ่ม +1 ส่วน!'
            : '⏰ หมดเวลา! ยังตีไม่ทัน ลองกดเริ่มใหม่อีกครั้ง'}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.6rem' }}>
        <button
          type="button"
          className="btn primary btn-mole-start"
          onClick={startGame}
          disabled={gameRunning}
        >
          {gameRunning ? 'กำลังเล่น...' : score === 0 ? '▶ เริ่มตีตัวตุ่น' : '🔄 เล่นใหม่อีกครั้ง'}
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   3. TIC-TAC-TOE (OX)
   ========================================================================= */
const TicTacToeGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({
  onWin,
  onLose,
}) => {
  type Cell = 'O' | 'X' | null;
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [winner, setWinner] = useState<'O' | 'X' | 'draw' | null>(null);
  const [isAiTurn, setIsAiTurn] = useState<boolean>(false);

  const checkWinner = (squares: Cell[]): 'O' | 'X' | 'draw' | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every((cell) => cell !== null)) {
      return 'draw';
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isAiTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'O'; // Player is O
    setBoard(newBoard);

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      if (w === 'O') onWin();
      else if (w === 'X') onLose();
      return;
    }

    // AI Turn (casual friendly AI)
    setIsAiTurn(true);
    setTimeout(() => {
      const openIndices = newBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((idx): idx is number => idx !== null);

      if (openIndices.length === 0) {
        setIsAiTurn(false);
        return;
      }

      // Check if AI can win or block player occasionally
      let chosenMove = openIndices[Math.floor(Math.random() * openIndices.length)];

      for (const idx of openIndices) {
        const testBoard = [...newBoard];
        testBoard[idx] = 'X';
        if (checkWinner(testBoard) === 'X') {
          chosenMove = idx;
          break;
        }
      }

      newBoard[chosenMove] = 'X';
      setBoard(newBoard);
      setIsAiTurn(false);

      const postAiWinner = checkWinner(newBoard);
      if (postAiWinner) {
        setWinner(postAiWinner);
        if (postAiWinner === 'O') onWin();
        else if (postAiWinner === 'X') onLose();
      }
    }, 400);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsAiTurn(false);
  };

  return (
    <div className="mini-game-container ox-container">
      <h4 className="mini-game-heading">❌ เกม OX ประลองปัญญา (คุณคือ ⭕)</h4>
      <p className="mini-game-sub">
        วางเรียง ⭕ ให้ครบ 3 ช่อง (แนวนอน แนวตั้ง หรือแนวทแยง) เพื่อจุดไฟเผายันต์!
      </p>

      <div className="ox-grid">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className={`ox-cell ${cell ? `cell-${cell.toLowerCase()}` : ''}`}
            onClick={() => handleCellClick(i)}
            disabled={!!cell || !!winner || isAiTurn}
          >
            {cell === 'O' && <span className="ox-sym o-sym">⭕</span>}
            {cell === 'X' && <span className="ox-sym x-sym">❌</span>}
          </button>
        ))}
      </div>

      {winner && (
        <div
          className={`mini-game-result-msg msg-${
            winner === 'O' ? 'win' : winner === 'X' ? 'lose' : 'draw'
          }`}
        >
          {winner === 'O' && '🎉 คุณเรียงครบ 3 ช่อง ชนะแล้ว! เพลิงเผายันต์เพิ่ม +1 ส่วน!'}
          {winner === 'X' && '🏮 ศาลเจ้าชนะในตานี้! ยันต์ยังไม่ไหม้ ลองแก้มือใหม่'}
          {winner === 'draw' && '🤝 เสมอกัน! กระดานเต็มพอดี ลองเล่นอีกครั้ง'}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.6rem' }}>
        <button type="button" className="btn ghost btn-ox-reset" onClick={resetBoard}>
          <span>🔄 รีเซ็ตกระดาน OX</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   4. NUMBER CONNECT (เชื่อมสีเส้นห้ามทับกัน: 1..5)
   ========================================================================= */
const NumberConnectGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  // 5x5 grid with pairs of numbers 1..5
  // Preset layout ensuring clean non-overlapping solution
  // Node coordinates:
  // 1: (0,0) and (0,4)
  // 2: (1,1) and (1,3)
  // 3: (2,0) and (4,0)
  // 4: (2,4) and (4,4)
  // 5: (3,2) and (4,2)
  interface Point {
    r: number;
    c: number;
  }

  const PAIR_NODES: Record<number, [Point, Point]> = {
    1: [
      { r: 0, c: 0 },
      { r: 0, c: 4 },
    ],
    2: [
      { r: 1, c: 1 },
      { r: 1, c: 3 },
    ],
    3: [
      { r: 2, c: 0 },
      { r: 4, c: 0 },
    ],
    4: [
      { r: 2, c: 4 },
      { r: 4, c: 4 },
    ],
    5: [
      { r: 3, c: 2 },
      { r: 4, c: 2 },
    ],
  };

  const PAIR_COLORS: Record<number, string> = {
    1: '#ef4444', // Red
    2: '#22c55e', // Green
    3: '#3b82f6', // Blue
    4: '#eab308', // Yellow
    5: '#a855f7', // Purple
  };

  // Connected state for each of the 5 pairs
  const [connectedPairs, setConnectedPairs] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [solved, setSolved] = useState<boolean>(false);

  const isEndpoint = (r: number, c: number): number | null => {
    for (let num = 1; num <= 5; num++) {
      const [p1, p2] = PAIR_NODES[num];
      if ((p1.r === r && p1.c === c) || (p2.r === r && p2.c === c)) {
        return num;
      }
    }
    return null;
  };

  const handleCellClick = (r: number, c: number) => {
    if (solved) return;
    const epNum = isEndpoint(r, c);

    if (epNum !== null) {
      if (activeNumber === null) {
        // Select starting number
        setActiveNumber(epNum);
      } else if (activeNumber === epNum) {
        // Connected!
        const next = { ...connectedPairs, [epNum]: true };
        setConnectedPairs(next);
        setActiveNumber(null);

        // Check if all 5 connected
        if (Object.values(next).every((v) => v === true)) {
          setSolved(true);
          onWin();
        }
      } else {
        // Switched to a different start number
        setActiveNumber(epNum);
      }
    }
  };

  const handleReset = () => {
    setConnectedPairs({ 1: false, 2: false, 3: false, 4: false, 5: false });
    setActiveNumber(null);
    setSolved(false);
  };

  return (
    <div className="mini-game-container connect-container">
      <h4 className="mini-game-heading">🔢 เชื่อมเลขคู่สีห้ามทับกัน (1 ถึง 5)</h4>
      <p className="mini-game-sub">
        แตะจับคู่ตัวเลขเดียวกัน (1 จับ 1, 2 จับ 2 ... 5 จับ 5) ให้ครบทั้ง 5 เส้น
      </p>

      {/* Progress chips */}
      <div className="connect-chips-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`connect-chip ${connectedPairs[n] ? 'connected' : ''} ${
              activeNumber === n ? 'active-selecting' : ''
            }`}
            style={{ borderColor: PAIR_COLORS[n] }}
          >
            <span
              className="chip-dot"
              style={{ background: PAIR_COLORS[n] }}
            />
            คู่ที่ {n} {connectedPairs[n] ? '✓' : ''}
          </span>
        ))}
      </div>

      <div className="connect-grid-5x5">
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="connect-row">
            {Array.from({ length: 5 }).map((_, c) => {
              const num = isEndpoint(r, c);
              const isConn = num ? connectedPairs[num] : false;
              const isSelected = num === activeNumber;

              return (
                <button
                  key={c}
                  type="button"
                  className={`connect-cell ${num ? 'is-endpoint' : 'is-blank'} ${
                    isConn ? 'is-connected' : ''
                  } ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    backgroundColor: num ? (isConn || isSelected ? PAIR_COLORS[num] : undefined) : undefined,
                    borderColor: num ? PAIR_COLORS[num] : undefined,
                  }}
                  disabled={!num}
                >
                  {num ? (
                    <span className="connect-num-label">{num}</span>
                  ) : (
                    <span className="connect-blank-dot" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {solved && (
        <div className="mini-game-result-msg msg-win">
          🎉 เชื่อมครบทั้ง 5 คู่เรียบร้อย! เพลิงเผายันต์เพิ่ม +1 ส่วน!
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.6rem' }}>
        <button type="button" className="btn ghost" onClick={handleReset}>
          <span>🔄 รีเซ็ตเส้นเชื่อม</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   5. PICK 3 CARDS: AVOID THE DEMON (เปิดไพ่เจอปิศาจ แพ้ มีสามใบ)
   ========================================================================= */
const DemonCardGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({
  onWin,
  onLose,
}) => {
  // 3 cards: 2 are Blessing (✨), 1 is Demon (👹)
  const [demonIndex, setDemonIndex] = useState<number>(() => Math.floor(Math.random() * 3));
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const handlePickCard = (index: number) => {
    if (revealed) return;
    setSelectedCard(index);
    setRevealed(true);

    if (index === demonIndex) {
      setResult('lose');
      onLose();
    } else {
      setResult('win');
      onWin();
    }
  };

  const handlePlayAgain = () => {
    setDemonIndex(Math.floor(Math.random() * 3));
    setSelectedCard(null);
    setRevealed(false);
    setResult(null);
  };

  return (
    <div className="mini-game-container demon-container">
      <h4 className="mini-game-heading">🃏 เปิดไพ่หลบปิศาจ (มี 3 ใบ)</h4>
      <p className="mini-game-sub">
        มีไพ่ 3 ใบ คว่ำอยู่: <b>2 ใบเป็นพรเทพเจ้า</b> และ <b>1 ใบเป็นปิศาจร้าย</b>{' '}
        เปิดให้ได้พรเพื่อจุดไฟเผายันต์!
      </p>

      <div className="demon-cards-row">
        {[0, 1, 2].map((idx) => {
          const isDemon = idx === demonIndex;
          const isChosen = selectedCard === idx;

          return (
            <button
              key={idx}
              type="button"
              className={`demon-card ${revealed ? 'is-flipped' : ''} ${
                isChosen ? 'is-chosen' : ''
              }`}
              onClick={() => handlePickCard(idx)}
              disabled={revealed}
            >
              <div className="demon-card-inner">
                {/* Back Face (Card Cover) */}
                <div className="demon-card-back">
                  <span className="card-cover-seal">🎴</span>
                  <span className="card-cover-num">ใบที่ {idx + 1}</span>
                </div>

                {/* Front Face (Revealed Blessing or Demon) */}
                <div className={`demon-card-front ${isDemon ? 'front-demon' : 'front-blessing'}`}>
                  <span className="card-reveal-icon">{isDemon ? '👹' : '✨'}</span>
                  <span className="card-reveal-title">
                    {isDemon ? 'ปิศาจ!' : 'พรเทพเจ้า'}
                  </span>
                  <span className="card-reveal-sub">
                    {isDemon ? 'แพ้ในตานี้' : 'ชนะแล้ว!'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mini-game-result-msg msg-${result}`}>
          {result === 'win'
            ? '🎉 เปิดได้พรเทพเจ้า! คุณชนะ! เพลิงเผายันต์เพิ่ม +1 ส่วน!'
            : '👹 เจอปิศาจรบกวน! ตานี้แพ้ ไฟจึงยังไม่ลาม ลองแก้มือใหม่'}
        </div>
      )}

      {revealed && (
        <div className="row center" style={{ marginTop: '0.6rem' }}>
          <button type="button" className="btn ghost" onClick={handlePlayAgain}>
            <span>🔄 เปิดไพ่อีกรอบ</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   MAIN EXPORT COORDINATOR
   ========================================================================= */
export const LuckyMiniGames: React.FC<LuckyMiniGamesProps> = ({
  onWin,
  onLose,
  onToast,
  burnLevel,
}) => {
  const [activeTab, setActiveTab] = useState<MiniGameType>('rps');

  const tabs: { id: MiniGameType; icon: string; name: string }[] = [
    { id: 'rps', icon: '✊', name: 'เป่ายิ้งฉุบ' },
    { id: 'mole', icon: '🦔', name: 'ตีตัวตุ่น' },
    { id: 'ox', icon: '❌', name: 'OX' },
    { id: 'connect', icon: '🔢', name: 'เชื่อมเลข 1-5' },
    { id: 'demon', icon: '🃏', name: 'ไพ่ปิศาจ' },
  ];

  return (
    <div className="lucky-minigames-section">
      <div className="minigame-selector-header">
        <span className="minigame-header-title">
          🎮 เลือกมินิเกมเพื่อจุดไฟเผายันต์ ({burnLevel}/3 ตา)
        </span>
      </div>

      {/* Horizontal mini game selector tabs */}
      <div className="minigame-tab-bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`minigame-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Active Game Stage */}
      <div className="minigame-stage-wrapper">
        {activeTab === 'rps' && <RPSGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'mole' && <WhackMoleGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'ox' && <TicTacToeGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'connect' && <NumberConnectGame onWin={onWin} />}
        {activeTab === 'demon' && <DemonCardGame onWin={onWin} onLose={onLose} />}
      </div>
    </div>
  );
};
