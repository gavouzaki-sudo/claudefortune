import React, { useState, useEffect, useRef } from 'react';
import { getRandomArrayItem } from '../utils/formatters';

type MiniGameType = 'rps' | 'mole' | 'ox' | 'match' | 'demon';

interface LuckyMiniGamesProps {
  onWin: () => void;
  onLose: () => void;
}

/* =========================================================================
   1. ROCK-PAPER-SCISSORS (เป่ายิ้งฉุบ - เพิ่มความยาก แข่ง 2 ใน 3 แต้ม)
   ========================================================================= */
const RPSGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  type Choice = 'rock' | 'paper' | 'scissors';
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [matchOver, setMatchOver] = useState<'win' | 'lose' | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const lastPlayerChoiceRef = useRef<Choice | null>(null);

  const TARGET_POINTS = 2; // Best of 3 (แข่ง 2 แต้ม)

  const choices: { id: Choice; icon: string; label: string }[] = [
    { id: 'rock', icon: '✊', label: 'ค้อน' },
    { id: 'scissors', icon: '✌️', label: 'กรรไกร' },
    { id: 'paper', icon: '✋', label: 'กระดาษ' },
  ];

  const handlePlay = (choice: Choice) => {
    if (isShooting || matchOver) return;
    setPlayerChoice(choice);
    setIsShooting(true);
    setRoundResult(null);

    setTimeout(() => {
      const all: Choice[] = ['rock', 'paper', 'scissors'];
      // Smart AI counter: 45% chance to predict counter to player's previous move
      let ai: Choice;
      if (lastPlayerChoiceRef.current && Math.random() < 0.45) {
        if (lastPlayerChoiceRef.current === 'rock') ai = 'paper';
        else if (lastPlayerChoiceRef.current === 'paper') ai = 'scissors';
        else ai = 'rock';
      } else {
        ai = getRandomArrayItem(all, all[0]);
      }

      lastPlayerChoiceRef.current = choice;
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

      setRoundResult(res);
      setIsShooting(false);

      if (res === 'win') {
        const nextScore = playerScore + 1;
        setPlayerScore(nextScore);
        if (nextScore >= TARGET_POINTS) {
          setMatchOver('win');
          onWin();
        }
      } else if (res === 'lose') {
        const nextAiScore = aiScore + 1;
        setAiScore(nextAiScore);
        if (nextAiScore >= TARGET_POINTS) {
          setMatchOver('lose');
          onLose();
        }
      }
    }, 450);
  };

  const handleResetMatch = () => {
    setPlayerScore(0);
    setAiScore(0);
    setPlayerChoice(null);
    setAiChoice(null);
    setRoundResult(null);
    setMatchOver(null);
    lastPlayerChoiceRef.current = null;
  };

  return (
    <div className="mini-game-container rps-container">
      <div className="mini-game-header-row">
        <h4 className="mini-game-heading">เป่ายิ้งฉุบกับสิ่งศักดิ์สิทธิ์</h4>
        <span className="status-badge timer-badge">
          คะแนน: <b>{playerScore} - {aiScore}</b> (ชิง 2 แต้ม)
        </span>
      </div>
      <p className="mini-game-sub">
        ต้องเป่ายิ้งฉุบชนะให้ได้ <b>{TARGET_POINTS} แต้ม</b> ก่อนศาลเจ้า จึงจะจุดไฟเผายันต์สำเร็จ!
      </p>

      <div className="rps-arena">
        <div className="rps-fighter player-side">
          <span className="rps-badge">คุณ ({playerScore}/{TARGET_POINTS})</span>
          <span className={`rps-hand-display ${isShooting ? 'shaking-hand' : ''}`}>
            {playerChoice
              ? choices.find((c) => c.id === playerChoice)?.icon
              : '❓'}
          </span>
        </div>

        <span className="rps-vs">VS</span>

        <div className="rps-fighter ai-side">
          <span className="rps-badge">ศาลเจ้า ({aiScore}/{TARGET_POINTS})</span>
          <span className={`rps-hand-display ${isShooting ? 'shaking-hand' : ''}`}>
            {aiChoice
              ? choices.find((c) => c.id === aiChoice)?.icon
              : '🏮'}
          </span>
        </div>
      </div>

      {roundResult && !matchOver && (
        <div className={`mini-game-result-msg msg-${roundResult}`}>
          {roundResult === 'win' && '👏 ยกนี้คุณได้แต้ม! ชนะเพิ่มอีก 1 ครั้งเพื่อผ่าน'}
          {roundResult === 'lose' && '🏮 ศาลเจ้าได้แต้มนี้! ตั้งสมาธิแล้วแก้มือ'}
          {roundResult === 'draw' && '🤝 เสมอกัน! ยังไม่ได้แต้ม ออกค้อน กรรไกร กระดาษใหม่'}
        </div>
      )}

      {matchOver && (
        <div className={`mini-game-result-msg msg-${matchOver}`}>
          {matchOver === 'win'
            ? '🎉 ชนะการประลอง 2 ใน 3 สำเร็จ! เพลิงเผายันต์เพิ่มขึ้น +1 ส่วน!'
            : '🏮 ศาลเจ้าได้ 2 แต้มก่อน! ตานี้แพ้ ลองเริ่มประลองใหม่อีกครั้ง'}
        </div>
      )}

      <div className="rps-buttons-row">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn ghost rps-choice-btn ${playerChoice === c.id ? 'active' : ''}`}
            onClick={() => handlePlay(c.id)}
            disabled={isShooting || Boolean(matchOver)}
          >
            <span className="choice-icon">{c.icon}</span>
            <span className="choice-text">{c.label}</span>
          </button>
        ))}
      </div>

      {matchOver && (
        <div className="row center" style={{ marginTop: '0.45rem' }}>
          <button type="button" className="btn ghost" onClick={handleResetMatch}>
            <span>🔄 เริ่มประลองใหม่ (ชิง 2 แต้ม)</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   2. WHACK-A-SPIRIT (ตีภูต - เพิ่มความยาก 5 ครั้งใน 7วิ + ระวังกะโหลก)
   ========================================================================= */
interface ActiveItem {
  index: number;
  type: 'spirit' | 'curse';
}

const WhackMoleGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({
  onWin,
  onLose,
}) => {
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [gameOverResult, setGameOverResult] = useState<'win' | 'lose' | null>(null);

  const timerRef = useRef<number | null>(null);
  const moleIntervalRef = useRef<number | null>(null);

  const TARGET_HITS = 5; // Target hits raised to 5
  const TIME_LIMIT = 7;  // Time limit tightened to 7 seconds

  const startGame = () => {
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setGameOverResult(null);
    setGameRunning(true);
    // 30% chance for curse decoy, 70% spirit
    const isCurse = Math.random() < 0.3;
    setActiveItem({
      index: Math.floor(Math.random() * 9),
      type: isCurse ? 'curse' : 'spirit',
    });
  };

  // Timer loop
  useEffect(() => {
    if (!gameRunning) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
          setTimeout(() => {
            setGameRunning(false);
            setGameOverResult('lose');
            onLose();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Faster mole popup speed (520ms)
    moleIntervalRef.current = window.setInterval(() => {
      const isCurse = Math.random() < 0.3;
      setActiveItem({
        index: Math.floor(Math.random() * 9),
        type: isCurse ? 'curse' : 'spirit',
      });
    }, 520);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
    };
  }, [gameRunning, onLose]);

  // Handle hitting a pot
  const handleHit = (index: number) => {
    if (!gameRunning || !activeItem || activeItem.index !== index) return;

    if (activeItem.type === 'curse') {
      // Hit a cursed skull - penalty!
      setActiveItem(null);
      setScore((prev) => Math.max(0, prev - 1));
      setTimeLeft((prev) => Math.max(1, prev - 1));
      return;
    }

    // Hit spirit
    setActiveItem(null);
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
      <div className="mini-game-header-row">
        <h4 className="mini-game-heading">ตีภูตนำโชคศาลเจ้า</h4>
        <span className="status-badge timer-badge">
          ⏱️ เวลา: <b>{timeLeft}s</b> | แต้ม: <b>{score}/{TARGET_HITS}</b>
        </span>
      </div>
      <p className="mini-game-sub">
        ตีภูตทอง 👻 ให้ครบ <b>{TARGET_HITS} ครั้ง</b> ใน <b>{TIME_LIMIT}s</b> (ระวัง! ห้ามแตะกะโหลก 💀 จะเสียแต้ม)
      </p>

      <div className="mole-grid">
        {Array.from({ length: 9 }).map((_, i) => {
          const isCurrent = activeItem && activeItem.index === i;
          return (
            <button
              key={i}
              type="button"
              className={`mole-pot ${isCurrent ? 'has-mole' : ''}`}
              onClick={() => handleHit(i)}
              disabled={!gameRunning}
              aria-label={`กระถางใบที่ ${i + 1}`}
            >
              <span className="pot-rim">🏺</span>
              {isCurrent && (
                <span className={`mole-avatar popup-anim ${activeItem.type === 'curse' ? 'curse-avatar' : ''}`}>
                  {activeItem.type === 'curse' ? '💀' : '👻'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {gameOverResult && (
        <div className={`mini-game-result-msg msg-${gameOverResult}`}>
          {gameOverResult === 'win'
            ? '🎉 ตีภูตครบ 5 ตัวสำเร็จตามเวลา! เพลิงไหม้ยันต์เพิ่ม +1 ส่วน!'
            : '⏰ หมดเวลา! ยังตีไม่ครบ 5 ตัว ลองกดเริ่มใหม่อีกครั้ง'}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.35rem' }}>
        <button
          type="button"
          className="btn primary btn-mole-start"
          onClick={startGame}
          disabled={gameRunning}
        >
          {gameRunning ? 'กำลังเล่น...' : score === 0 ? '▶ เริ่มตีภูต' : '🔄 เล่นใหม่อีกครั้ง'}
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   3. TIC-TAC-TOE (OX - เพิ่มความยาก AI อัจฉริยะ ป้องกันและจู่โจมแม่นยำ)
   ========================================================================= */
const TicTacToeGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({
  onWin,
  onLose,
}) => {
  type Cell = 'O' | 'X' | null;
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [winner, setWinner] = useState<'O' | 'X' | 'draw' | null>(null);
  const [isAiTurn, setIsAiTurn] = useState<boolean>(false);

  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (squares: Cell[]): 'O' | 'X' | 'draw' | null => {
    for (const [a, b, c] of WIN_LINES) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as 'O' | 'X';
      }
    }
    if (squares.every((sq) => sq !== null)) {
      return 'draw';
    }
    return null;
  };

  // Strategic AI move calculation
  const getStrategicAiMove = (currentBoard: Cell[]): number => {
    const available = currentBoard
      .map((val, i) => (val === null ? i : null))
      .filter((val): val is number => val !== null);

    // 1. Check if AI ('X') can win immediately in 1 move
    for (const idx of available) {
      const copy = [...currentBoard];
      copy[idx] = 'X';
      if (checkWinner(copy) === 'X') return idx;
    }

    // 2. Block player ('O') if player can win in 1 move
    for (const idx of available) {
      const copy = [...currentBoard];
      copy[idx] = 'O';
      if (checkWinner(copy) === 'O') return idx;
    }

    // 3. Take center (4) if available
    if (currentBoard[4] === null) return 4;

    // 4. Take corner squares (0, 2, 6, 8)
    const corners = [0, 2, 6, 8].filter((c) => currentBoard[c] === null);
    if (corners.length > 0) {
      return getRandomArrayItem(corners, corners[0]);
    }

    // 5. Take any remaining available cell
    return getRandomArrayItem(available, available[0]);
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner || isAiTurn) return;

    const newBoard = [...board];
    newBoard[idx] = 'O';
    setBoard(newBoard);

    const winStatus = checkWinner(newBoard);
    if (winStatus) {
      setWinner(winStatus);
      if (winStatus === 'O') onWin();
      else if (winStatus === 'X') onLose();
      return;
    }

    // AI's Turn
    setIsAiTurn(true);
    setTimeout(() => {
      const chosenIdx = getStrategicAiMove(newBoard);
      if (chosenIdx !== undefined && chosenIdx !== -1) {
        newBoard[chosenIdx] = 'X';
        setBoard(newBoard);

        const aiWinStatus = checkWinner(newBoard);
        if (aiWinStatus) {
          setWinner(aiWinStatus);
          if (aiWinStatus === 'O') onWin();
          else if (aiWinStatus === 'X') onLose();
        }
      }
      setIsAiTurn(false);
    }, 380);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsAiTurn(false);
  };

  return (
    <div className="mini-game-container ox-container">
      <div className="mini-game-header-row">
        <h4 className="mini-game-heading">เกม OX (คุณคือ ⭕)</h4>
        <span className="status-badge ox-badge">
          {winner ? 'จบเกม' : isAiTurn ? 'ศาลเจ้ากำลังคิด...' : 'ตาของคุณ'}
        </span>
      </div>
      <p className="mini-game-sub">
        ศาลเจ้าเล่นเชิงกลยุทธ์! เรียง ⭕ ให้ได้ 3 ช่องแนวนอน แนวตั้ง หรือแนวทแยงเพื่อเอาชนะ ❌
      </p>

      <div className="ox-grid">
        {board.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            className={`ox-cell ${cell ? `cell-${cell.toLowerCase()}` : ''}`}
            onClick={() => handleCellClick(idx)}
            disabled={Boolean(cell || winner || isAiTurn)}
            aria-label={`ช่องที่ ${idx + 1} ${cell ? cell : 'ว่าง'}`}
          >
            {cell === 'O' && <span className="ox-symbol ox-o">⭕</span>}
            {cell === 'X' && <span className="ox-symbol ox-x">❌</span>}
          </button>
        ))}
      </div>

      {winner && (
        <div
          className={`mini-game-result-msg msg-${
            winner === 'O' ? 'win' : winner === 'X' ? 'lose' : 'draw'
          }`}
        >
          {winner === 'O' && '🎉 สุดยอด! คุณเอาชนะ OX ศาลเจ้าได้! เพลิงเผายันต์เพิ่มขึ้น +1 ส่วน!'}
          {winner === 'X' && '🏮 ศาลเจ้าชนะ! ยันต์ยังไม่ไหม้ ลองวางหมากใหม่อีกครั้ง'}
          {winner === 'draw' && '🤝 เสมอกัน! กลยุทธ์เสมอกัน ลองวางหมากใหม่อีกตาเพื่อเอาชนะ'}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.4rem' }}>
        <button type="button" className="btn ghost" onClick={resetGame}>
          <span>🔄 เริ่มเกม OX ใหม่</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   4. AUSPICIOUS IMAGE MATCHING GAME (จับคู่ภาพมงคล - เพิ่มความยาก 6 คู่ 12 ใบ แข่งเวลา 22 วินาที)
   ========================================================================= */
interface MatchCard {
  id: number;
  symbol: string;
  name: string;
  pairKey: string;
}

const MATCH_ITEMS_HARD = [
  { symbol: '🏮', name: 'โคมมงคล', pairKey: 'lantern' },
  { symbol: '🪙', name: 'เหรียญทอง', pairKey: 'coin' },
  { symbol: '🪷', name: 'ดอกบัว', pairKey: 'lotus' },
  { symbol: '🐘', name: 'ช้างแก้ว', pairKey: 'elephant' },
  { symbol: '🔔', name: 'ระฆังทอง', pairKey: 'bell' },
  { symbol: '🕯️', name: 'เทียนชัย', pairKey: 'candle' },
];

const shuffleHardMatchCards = (): MatchCard[] => {
  const deck: MatchCard[] = [];
  MATCH_ITEMS_HARD.forEach((item, index) => {
    deck.push({ id: index * 2, symbol: item.symbol, name: item.name, pairKey: item.pairKey });
    deck.push({ id: index * 2 + 1, symbol: item.symbol, name: item.name, pairKey: item.pairKey });
  });
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const AuspiciousMatchGame: React.FC<{ onWin: () => void; onLose?: () => void }> = ({ onWin, onLose }) => {
  const [cards, setCards] = useState<MatchCard[]>(() => shuffleHardMatchCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(22);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [timeUp, setTimeUp] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Countdown timer once player starts playing
  useEffect(() => {
    if (!timerStarted || isWon || timeUp) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            setTimeUp(true);
            onLose?.();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerStarted, isWon, timeUp, onLose]);

  const handleCardClick = (idx: number) => {
    if (isLocked || isWon || timeUp) return;
    if (!timerStarted) setTimerStarted(true);

    if (flippedIndices.includes(idx)) return;
    const clickedCard = cards[idx];
    if (matchedKeys.includes(clickedCard.pairKey)) return;

    if (flippedIndices.length === 0) {
      setFlippedIndices([idx]);
    } else if (flippedIndices.length === 1) {
      const firstIdx = flippedIndices[0];
      const firstCard = cards[firstIdx];
      const newFlipped = [firstIdx, idx];
      setFlippedIndices(newFlipped);
      setIsLocked(true);

      if (firstCard.pairKey === clickedCard.pairKey) {
        // Matched!
        setTimeout(() => {
          const newMatched = [...matchedKeys, clickedCard.pairKey];
          setMatchedKeys(newMatched);
          setFlippedIndices([]);
          setIsLocked(false);

          if (newMatched.length === MATCH_ITEMS_HARD.length) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsWon(true);
            onWin();
          }
        }, 400);
      } else {
        // Not matched - flip back
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 700);
      }
    }
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCards(shuffleHardMatchCards());
    setFlippedIndices([]);
    setMatchedKeys([]);
    setIsLocked(false);
    setIsWon(false);
    setTimeLeft(22);
    setTimerStarted(false);
    setTimeUp(false);
  };

  return (
    <div className="mini-game-container match-container">
      <div className="mini-game-header-row">
        <h4 className="mini-game-heading">เกมจับคู่ภาพมงคล</h4>
        <span className={`status-badge timer-badge ${timeLeft <= 6 ? 'timer-danger' : ''}`}>
          ⏱️ เวลา: <b>{timeLeft}s</b> | คู่: <b>{matchedKeys.length}/{MATCH_ITEMS_HARD.length}</b>
        </span>
      </div>
      <p className="mini-game-sub">
        จับคู่ภาพมงคลให้ครบทั้ง <b>{MATCH_ITEMS_HARD.length} คู่</b> (12 ใบ) ภายใน <b>22 วินาที</b>!
      </p>

      {/* 4x3 Match Cards Grid */}
      <div className="match-cards-grid grid-12-cards">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedKeys.includes(card.pairKey);
          const isMatched = matchedKeys.includes(card.pairKey);

          return (
            <button
              key={`${card.pairKey}-${idx}`}
              type="button"
              className={`match-card-btn ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''}`}
              onClick={() => handleCardClick(idx)}
              disabled={isFlipped || isLocked || timeUp}
              aria-label={`การ์ดใบที่ ${idx + 1} ${isFlipped ? card.name : 'คว่ำอยู่'}`}
            >
              <div className="match-card-inner">
                {/* Back (Facing down) */}
                <div className="match-card-face match-card-back">
                  <span className="card-seal-icon">🎴</span>
                </div>
                {/* Front (Facing up) */}
                <div className="match-card-face match-card-front">
                  <span className="card-symbol-icon">{card.symbol}</span>
                  <span className="card-symbol-label">{card.name}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isWon && (
        <div className="mini-game-result-msg msg-win">
          🎉 ยอดเยี่ยม! จับคู่ครบทั้ง 6 คู่ทันเวลา! เพลิงเผายันต์เพิ่มขึ้น +1 ส่วน!
        </div>
      )}

      {timeUp && !isWon && (
        <div className="mini-game-result-msg msg-lose">
          ⏰ หมดเวลา! ยังจับคู่ไม่ครบทั้ง 6 คู่ กดเริ่มใหม่เพื่อลองอีกครั้ง
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.45rem' }}>
        <button type="button" className="btn ghost" onClick={handleRestart}>
          <span>🔄 สับการ์ดใหม่ (รีเซ็ตเวลา 22s)</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   5. PICK CARDS: AVOID THE DEMON (เปิดไพ่หลบปิศาจ - เพิ่มความยาก ไพ่ 4 ใบ ปิศาจ 2 ใบ)
   ========================================================================= */
const DemonCardGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({
  onWin,
  onLose,
}) => {
  // 4 cards: 2 are Blessing (✨), 2 are Demon (👹) - 50/50 chance
  const generateDeck = () => {
    const deck = [false, false, true, true]; // true = demon, false = blessing
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const [cards, setCards] = useState<boolean[]>(() => generateDeck());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const handlePickCard = (index: number) => {
    if (revealed) return;
    setSelectedCard(index);
    setRevealed(true);

    const isDemon = cards[index];
    if (isDemon) {
      setResult('lose');
      onLose();
    } else {
      setResult('win');
      onWin();
    }
  };

  const handlePlayAgain = () => {
    setCards(generateDeck());
    setSelectedCard(null);
    setRevealed(false);
    setResult(null);
  };

  return (
    <div className="mini-game-container demon-container">
      <div className="mini-game-header-row">
        <h4 className="mini-game-heading">เปิดไพ่หลบปิศาจ (มี 4 ใบ)</h4>
        <span className="status-badge demon-badge">
          {revealed ? (result === 'win' ? '🎉 ได้รับพร' : '👹 โดนปิศาจ') : 'เลือกไพ่ 1 ใบ'}
        </span>
      </div>
      <p className="mini-game-sub">
        มีไพ่ 4 ใบ: <b>2 ใบเป็นพรเทพเจ้า ✨</b> และ <b>2 ใบเป็นปิศาจร้าย 👹</b>{' '}
        เปิดให้ได้พรเพื่อจุดไฟเผายันต์!
      </p>

      <div className="demon-cards-row demon-4-cards">
        {[0, 1, 2, 3].map((idx) => {
          const isDemon = cards[idx];
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
            ? '🎉 เปิดได้พรเทพเจ้า! คุณชนะบททดสอบ! เพลิงเผายันต์เพิ่ม +1 ส่วน!'
            : '👹 เจอปิศาจดักจับ! ตานี้แพ้ ไฟจึงยังไม่ลาม ลองแก้มือใหม่'}
        </div>
      )}

      {revealed && (
        <div className="row center" style={{ marginTop: '0.45rem' }}>
          <button type="button" className="btn ghost" onClick={handlePlayAgain}>
            <span>🔄 สับไพ่อีกรอบ</span>
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
}) => {
  const [activeTab, setActiveTab] = useState<MiniGameType>('rps');

  const tabs: { id: MiniGameType; name: string }[] = [
    { id: 'rps', name: 'เป่ายิ้งฉุบ' },
    { id: 'mole', name: 'ตีภูต' },
    { id: 'ox', name: 'OX' },
    { id: 'match', name: 'จับคู่' },
    { id: 'demon', name: 'ไพ่ปิศาจ' },
  ];

  return (
    <div className="lucky-minigames-section">
      {/* 5 Mini-Game Selector Tabs: Centered text without emojis */}
      <div className="minigame-tab-bar" role="tablist" aria-label="เลือกมินิเกม">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`minigame-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Active Game Stage: Directly below and snug to the tab buttons */}
      <div className="minigame-stage-wrapper">
        {activeTab === 'rps' && <RPSGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'mole' && <WhackMoleGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'ox' && <TicTacToeGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'match' && <AuspiciousMatchGame onWin={onWin} onLose={onLose} />}
        {activeTab === 'demon' && <DemonCardGame onWin={onWin} onLose={onLose} />}
      </div>
    </div>
  );
};
