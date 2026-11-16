import React, { useState, useEffect, useRef } from 'react';
import { getRandomArrayItem } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

type MiniGameType = 'rps' | 'mole' | 'ox' | 'match' | 'demon';

interface LuckyMiniGamesProps {
  onWin: () => void;
  onLose: () => void;
}

/* =========================================================================
   1. ROCK-PAPER-SCISSORS (เป่ายิ้งฉุบ - เพิ่มความยาก แข่ง 2 ใน 3 แต้ม)
   ========================================================================= */
const RPSGame: React.FC<{ onWin: () => void; onLose: () => void }> = ({ onWin, onLose }) => {
  const { t, format } = useLanguage();
  type Choice = 'rock' | 'paper' | 'scissors';
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [matchOver, setMatchOver] = useState<'win' | 'lose' | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const lastPlayerChoiceRef = useRef<Choice | null>(null);
  const shotTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (shotTimerRef.current !== null) {
        clearTimeout(shotTimerRef.current);
        shotTimerRef.current = null;
      }
    };
  }, []);

  const TARGET_POINTS = 2; // Best of 3 (แข่ง 2 แต้ม)

  const choices: { id: Choice; icon: string; label: string }[] = [
    { id: 'rock', icon: '✊', label: t.mgRpsRock },
    { id: 'scissors', icon: '✌️', label: t.mgRpsScissors },
    { id: 'paper', icon: '✋', label: t.mgRpsPaper },
  ];

  const handlePlay = (choice: Choice) => {
    if (isShooting || matchOver) return;
    setPlayerChoice(choice);
    setIsShooting(true);
    setRoundResult(null);

    if (shotTimerRef.current !== null) {
      clearTimeout(shotTimerRef.current);
    }
    shotTimerRef.current = window.setTimeout(() => {
      shotTimerRef.current = null;
      if (!isMountedRef.current) return;

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
    if (shotTimerRef.current !== null) {
      clearTimeout(shotTimerRef.current);
      shotTimerRef.current = null;
    }
    setIsShooting(false);
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
        <h4 className="mini-game-heading">{t.mgRpsTitle}</h4>
        <span className="status-badge timer-badge">
          <b>{format(t.mgRpsScore, { player: playerScore, ai: aiScore, target: TARGET_POINTS })}</b>
        </span>
      </div>
      <p className="mini-game-sub">
        {format(t.mgRpsSub, { target: TARGET_POINTS })}
      </p>

      <div className="rps-arena">
        <div className="rps-fighter player-side">
          <span className="rps-badge">{format(t.mgRpsPlayerBadge, { score: playerScore, target: TARGET_POINTS })}</span>
          <span className={`rps-hand-display ${isShooting ? 'shaking-hand' : ''}`}>
            {playerChoice
              ? choices.find((c) => c.id === playerChoice)?.icon
              : '❓'}
          </span>
        </div>

        <span className="rps-vs">VS</span>

        <div className="rps-fighter ai-side">
          <span className="rps-badge">{format(t.mgRpsAiBadge, { score: aiScore, target: TARGET_POINTS })}</span>
          <span className={`rps-hand-display ${isShooting ? 'shaking-hand' : ''}`}>
            {aiChoice
              ? choices.find((c) => c.id === aiChoice)?.icon
              : '🏮'}
          </span>
        </div>
      </div>

      {roundResult && !matchOver && (
        <div className={`mini-game-result-msg msg-${roundResult}`}>
          {roundResult === 'win' && t.mgRpsRoundWin}
          {roundResult === 'lose' && t.mgRpsRoundLose}
          {roundResult === 'draw' && t.mgRpsRoundDraw}
        </div>
      )}

      {matchOver && (
        <div className={`mini-game-result-msg msg-${matchOver}`}>
          {matchOver === 'win' ? t.mgRpsMatchWin : t.mgRpsMatchLose}
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
            <span>{t.mgRpsReset}</span>
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
  const { t, format } = useLanguage();
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [gameOverResult, setGameOverResult] = useState<'win' | 'lose' | null>(null);

  const timerRef = useRef<number | null>(null);
  const moleIntervalRef = useRef<number | null>(null);
  const onLoseRef = useRef(onLose);
  onLoseRef.current = onLose;

  const TARGET_HITS = 5; // Target hits raised to 5
  const TIME_LIMIT = 7;  // Time limit tightened to 7 seconds

  const startGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
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
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
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
  }, [gameRunning]);

  // Trigger lose once when countdown hits 0 (kept out of state updater for StrictMode safety)
  useEffect(() => {
    if (gameRunning && timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
      setGameRunning(false);
      setGameOverResult('lose');
      onLoseRef.current();
    }
  }, [gameRunning, timeLeft]);

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
        <h4 className="mini-game-heading">{t.mgMoleTitle}</h4>
        <span className="status-badge timer-badge">
          <b>{format(t.mgMoleStatus, { time: timeLeft, score, target: TARGET_HITS })}</b>
        </span>
      </div>
      <p className="mini-game-sub">
        {format(t.mgMoleSub, { target: TARGET_HITS, time: TIME_LIMIT })}
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
              aria-label={format(t.mgMolePotAria, { index: i + 1 })}
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
            ? format(t.mgMoleWin, { target: TARGET_HITS })
            : format(t.mgMoleLose, { target: TARGET_HITS })}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.35rem' }}>
        <button
          type="button"
          className="btn primary btn-mole-start"
          onClick={startGame}
          disabled={gameRunning}
        >
          {gameRunning ? t.mgMolePlaying : score === 0 ? t.mgMoleStart : t.mgMoleReplay}
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
  const { t, format } = useLanguage();
  type Cell = 'O' | 'X' | null;
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [winner, setWinner] = useState<'O' | 'X' | 'draw' | null>(null);
  const [isAiTurn, setIsAiTurn] = useState<boolean>(false);
  const aiTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (aiTimerRef.current !== null) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, []);

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
    if (aiTimerRef.current !== null) {
      clearTimeout(aiTimerRef.current);
    }
    aiTimerRef.current = window.setTimeout(() => {
      aiTimerRef.current = null;
      if (!isMountedRef.current) return;
      const chosenIdx = getStrategicAiMove(newBoard);
      if (chosenIdx !== undefined && chosenIdx !== -1) {
        const aiBoard = [...newBoard];
        aiBoard[chosenIdx] = 'X';
        setBoard(aiBoard);

        const aiWinStatus = checkWinner(aiBoard);
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
    if (aiTimerRef.current !== null) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsAiTurn(false);
  };

  return (
    <div className="mini-game-container ox-container">
      <div className="mini-game-header-row">
        <h4 className="mini-game-heading">{t.mgOxTitle}</h4>
        <span className="status-badge ox-badge">
          {winner ? t.mgOxOver : isAiTurn ? t.mgOxAiTurn : t.mgOxYourTurn}
        </span>
      </div>
      <p className="mini-game-sub">
        {t.mgOxSub}
      </p>

      <div className="ox-grid">
        {board.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            className={`ox-cell ${cell ? `cell-${cell.toLowerCase()}` : ''}`}
            onClick={() => handleCellClick(idx)}
            disabled={Boolean(cell || winner || isAiTurn)}
            aria-label={format(t.mgOxCellAria, { index: idx + 1, state: cell ? cell : t.mgOxEmpty })}
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
          {winner === 'O' && t.mgOxWin}
          {winner === 'X' && t.mgOxLose}
          {winner === 'draw' && t.mgOxDraw}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.4rem' }}>
        <button type="button" className="btn ghost" onClick={resetGame}>
          <span>{t.mgOxReset}</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   4. AUSPICIOUS IMAGE MATCHING GAME (จับคู่ภาพมงคล - เพิ่มความยาก 6 คู่ 12 ใบ แข่งเวลา 22 วินาที)
   ========================================================================= */
type MatchLabelKey =
  | 'mgMatchItemLantern'
  | 'mgMatchItemCoin'
  | 'mgMatchItemLotus'
  | 'mgMatchItemElephant'
  | 'mgMatchItemBell'
  | 'mgMatchItemCandle';

interface MatchCard {
  id: number;
  symbol: string;
  labelKey: MatchLabelKey;
  pairKey: string;
}

const MATCH_ITEMS_HARD: { symbol: string; labelKey: MatchLabelKey; pairKey: string }[] = [
  { symbol: '🏮', labelKey: 'mgMatchItemLantern', pairKey: 'lantern' },
  { symbol: '🪙', labelKey: 'mgMatchItemCoin', pairKey: 'coin' },
  { symbol: '🪷', labelKey: 'mgMatchItemLotus', pairKey: 'lotus' },
  { symbol: '🐘', labelKey: 'mgMatchItemElephant', pairKey: 'elephant' },
  { symbol: '🔔', labelKey: 'mgMatchItemBell', pairKey: 'bell' },
  { symbol: '🕯️', labelKey: 'mgMatchItemCandle', pairKey: 'candle' },
];

const shuffleHardMatchCards = (): MatchCard[] => {
  const deck: MatchCard[] = [];
  MATCH_ITEMS_HARD.forEach((item, index) => {
    deck.push({ id: index * 2, symbol: item.symbol, labelKey: item.labelKey, pairKey: item.pairKey });
    deck.push({ id: index * 2 + 1, symbol: item.symbol, labelKey: item.labelKey, pairKey: item.pairKey });
  });
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const AuspiciousMatchGame: React.FC<{ onWin: () => void; onLose?: () => void }> = ({ onWin, onLose }) => {
  const { t, format } = useLanguage();
  const [cards, setCards] = useState<MatchCard[]>(() => shuffleHardMatchCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(22);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [timeUp, setTimeUp] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const flipTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const onLoseRef = useRef(onLose);
  onLoseRef.current = onLose;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (flipTimerRef.current !== null) {
        clearTimeout(flipTimerRef.current);
        flipTimerRef.current = null;
      }
    };
  }, []);

  // Countdown timer once player starts playing
  useEffect(() => {
    if (!timerStarted || isWon || timeUp) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerStarted, isWon, timeUp]);

  // Handle countdown reaching 0 outside the state updater
  useEffect(() => {
    if (timerStarted && !isWon && !timeUp && timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flipTimerRef.current !== null) {
        clearTimeout(flipTimerRef.current);
        flipTimerRef.current = null;
      }
      setTimeUp(true);
      setIsLocked(false);
      onLoseRef.current?.();
    }
  }, [timerStarted, isWon, timeUp, timeLeft]);

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

      if (flipTimerRef.current !== null) {
        clearTimeout(flipTimerRef.current);
      }

      if (firstCard.pairKey === clickedCard.pairKey) {
        // Matched!
        flipTimerRef.current = window.setTimeout(() => {
          flipTimerRef.current = null;
          if (!isMountedRef.current) return;
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
        flipTimerRef.current = window.setTimeout(() => {
          flipTimerRef.current = null;
          if (!isMountedRef.current) return;
          setFlippedIndices([]);
          setIsLocked(false);
        }, 700);
      }
    }
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (flipTimerRef.current !== null) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
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
        <h4 className="mini-game-heading">{t.mgMatchTitle}</h4>
        <span className={`status-badge timer-badge ${timeLeft <= 6 ? 'timer-danger' : ''}`}>
          <b>{format(t.mgMatchStatus, { time: timeLeft, matched: matchedKeys.length, total: MATCH_ITEMS_HARD.length })}</b>
        </span>
      </div>
      <p className="mini-game-sub">
        {format(t.mgMatchSub, { total: MATCH_ITEMS_HARD.length, time: 22 })}
      </p>

      {/* 4x3 Match Cards Grid */}
      <div className="match-cards-grid grid-12-cards">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedKeys.includes(card.pairKey);
          const isMatched = matchedKeys.includes(card.pairKey);
          const cardLabel = t[card.labelKey];

          return (
            <button
              key={`${card.pairKey}-${idx}`}
              type="button"
              className={`match-card-btn ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''}`}
              onClick={() => handleCardClick(idx)}
              disabled={isFlipped || isLocked || timeUp}
              aria-label={format(t.mgMatchCardAria, {
                index: idx + 1,
                state: isFlipped ? cardLabel : t.mgMatchFaceDown,
              })}
            >
              <div className="match-card-inner">
                {/* Back (Facing down) */}
                <div className="match-card-face match-card-back">
                  <span className="card-seal-icon">🎴</span>
                </div>
                {/* Front (Facing up) */}
                <div className="match-card-face match-card-front">
                  <span className="card-symbol-icon">{card.symbol}</span>
                  <span className="card-symbol-label">{cardLabel}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isWon && (
        <div className="mini-game-result-msg msg-win">
          {format(t.mgMatchWin, { total: MATCH_ITEMS_HARD.length })}
        </div>
      )}

      {timeUp && !isWon && (
        <div className="mini-game-result-msg msg-lose">
          {format(t.mgMatchLose, { total: MATCH_ITEMS_HARD.length })}
        </div>
      )}

      <div className="row center" style={{ marginTop: '0.45rem' }}>
        <button type="button" className="btn ghost" onClick={handleRestart}>
          <span>{t.mgMatchReset}</span>
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
  const { t, format } = useLanguage();
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
        <h4 className="mini-game-heading">{t.mgDemonTitle}</h4>
        <span className="status-badge demon-badge">
          {revealed ? (result === 'win' ? t.mgDemonWon : t.mgDemonLost) : t.mgDemonPick}
        </span>
      </div>
      <p className="mini-game-sub">
        {t.mgDemonSub}
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
                  <span className="card-cover-num">{format(t.mgDemonCardNum, { index: idx + 1 })}</span>
                </div>

                {/* Front Face (Revealed Blessing or Demon) */}
                <div className={`demon-card-front ${isDemon ? 'front-demon' : 'front-blessing'}`}>
                  <span className="card-reveal-icon">{isDemon ? '👹' : '✨'}</span>
                  <span className="card-reveal-title">
                    {isDemon ? t.mgDemonName : t.mgDemonBlessingName}
                  </span>
                  <span className="card-reveal-sub">
                    {isDemon ? t.mgDemonSubLose : t.mgDemonSubWin}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mini-game-result-msg msg-${result}`}>
          {result === 'win' ? t.mgDemonMsgWin : t.mgDemonMsgLose}
        </div>
      )}

      {revealed && (
        <div className="row center" style={{ marginTop: '0.45rem' }}>
          <button type="button" className="btn ghost" onClick={handlePlayAgain}>
            <span>{t.mgDemonReset}</span>
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
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MiniGameType>('rps');

  const tabs: { id: MiniGameType; name: string }[] = [
    { id: 'rps', name: t.mgTabRps },
    { id: 'mole', name: t.mgTabMole },
    { id: 'ox', name: t.mgTabOx },
    { id: 'match', name: t.mgTabMatch },
    { id: 'demon', name: t.mgTabDemon },
  ];

  return (
    <div className="lucky-minigames-section">
      {/* 5 Mini-Game Selector Tabs: Centered text without emojis */}
      <div className="minigame-tab-bar" role="tablist" aria-label={t.mgTabListAria}>
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
