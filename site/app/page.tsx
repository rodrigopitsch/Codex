"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Screen = "menu" | "tic" | "ludo" | "cards";
type Mark = "" | "X" | "O";
type TicMode = "duo" | "cpu";
type TicOutcome = { winner: Mark | "draw"; line: number[] };
type Difficulty = "easy" | "medium" | "hard";
type Level = 1 | 2 | 3;
type Color = "red" | "green" | "yellow" | "blue";
type Coord = [number, number];
type LudoPiece = { id: number; steps: number };
type LudoPlayer = {
  id: Color;
  label: string;
  color: string;
  start: number;
  human: boolean;
  pieces: LudoPiece[];
};
type Suit = "♠" | "♥" | "♦" | "♣";
type TrailCard = { id: number; rank: number; suit: Suit };
type TrailProgress = { unlocked: number; stars: Record<number, number>; bestCombo: number };

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const TRACK: Coord[] = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],
];

const HOME_LANES: Record<Color, Coord[]> = {
  red: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

const BASE_SPOTS: Record<Color, Coord[]> = {
  red: [[2,2],[2,4],[4,2],[4,4]],
  green: [[2,10],[2,12],[4,10],[4,12]],
  yellow: [[10,10],[10,12],[12,10],[12,12]],
  blue: [[10,2],[10,4],[12,2],[12,4]],
};

const PLAYER_SEEDS: Omit<LudoPlayer, "pieces">[] = [
  { id: "red", label: "Você", color: "#ef4444", start: 0, human: true },
  { id: "green", label: "Verde", color: "#22c55e", start: 13, human: false },
  { id: "yellow", label: "Amarelo", color: "#eab308", start: 26, human: false },
  { id: "blue", label: "Azul", color: "#3b82f6", start: 39, human: false },
];

const SAFE_TRACK = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const START_COLORS: Partial<Record<number, Color>> = { 0: "red", 13: "green", 26: "yellow", 39: "blue" };
const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANK_LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const TRAIL_LEVELS = 12;
let cardId = 0;

function ticOutcome(board: Mark[]): TicOutcome | null {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line };
  }
  return board.every(Boolean) ? { winner: "draw", line: [] } : null;
}

function minimax(board: Mark[], maximizing: boolean): number {
  const result = ticOutcome(board);
  if (result) return result.winner === "O" ? 10 : result.winner === "X" ? -10 : 0;
  let score = maximizing ? -Infinity : Infinity;
  board.forEach((mark, index) => {
    if (mark) return;
    board[index] = maximizing ? "O" : "X";
    const next = minimax(board, !maximizing);
    board[index] = "";
    score = maximizing ? Math.max(score, next) : Math.min(score, next);
  });
  return score;
}

function bestTicMove(board: Mark[]): number {
  let score = -Infinity;
  let move = board.findIndex((mark) => !mark);
  board.forEach((mark, index) => {
    if (mark) return;
    board[index] = "O";
    const candidate = minimax(board, false);
    board[index] = "";
    if (candidate > score) { score = candidate; move = index; }
  });
  return move;
}

function makePlayers(level: Level): LudoPlayer[] {
  const pieceCount = level + 1;
  return PLAYER_SEEDS.slice(0, level + 1).map((player) => ({
    ...player,
    pieces: Array.from({ length: pieceCount }, (_, id) => ({ id, steps: -1 })),
  }));
}

function legalLudoMoves(player: LudoPlayer, roll: number): number[] {
  return player.pieces.flatMap((piece, index) => {
    if (piece.steps === 57) return [];
    if (piece.steps === -1) return roll === 6 ? [index] : [];
    return piece.steps + roll <= 57 ? [index] : [];
  });
}

function globalTrackPosition(player: LudoPlayer, piece: LudoPiece): number | null {
  return piece.steps >= 0 && piece.steps <= 51 ? (player.start + piece.steps) % 52 : null;
}

function applyLudoMove(players: LudoPlayer[], playerIndex: number, pieceIndex: number, roll: number) {
  const next = players.map((player) => ({ ...player, pieces: player.pieces.map((piece) => ({ ...piece })) }));
  const player = next[playerIndex];
  const piece = player.pieces[pieceIndex];
  piece.steps = piece.steps === -1 ? 0 : piece.steps + roll;
  let captures = 0;
  const destination = globalTrackPosition(player, piece);

  if (destination !== null && !SAFE_TRACK.has(destination)) {
    next.forEach((opponent, opponentIndex) => {
      if (opponentIndex === playerIndex) return;
      opponent.pieces.forEach((target) => {
        if (globalTrackPosition(opponent, target) === destination) {
          target.steps = -1;
          captures += 1;
        }
      });
    });
  }

  return {
    players: next,
    captures,
    finished: piece.steps === 57,
    won: player.pieces.every((candidate) => candidate.steps === 57),
  };
}

function dangerAt(players: LudoPlayer[], playerIndex: number, position: number | null): boolean {
  if (position === null || SAFE_TRACK.has(position)) return false;
  return players.some((opponent, index) => index !== playerIndex && opponent.pieces.some((piece) => {
    const opponentPosition = globalTrackPosition(opponent, piece);
    if (opponentPosition === null) return false;
    const distance = (position - opponentPosition + 52) % 52;
    return distance >= 1 && distance <= 6;
  }));
}

function chooseCpuMove(players: LudoPlayer[], playerIndex: number, moves: number[], roll: number, difficulty: Difficulty): number {
  if (difficulty === "easy") return moves[Math.floor(Math.random() * moves.length)];
  let best = moves[0];
  let bestScore = -Infinity;

  moves.forEach((pieceIndex) => {
    const before = players[playerIndex].pieces[pieceIndex].steps;
    const result = applyLudoMove(players, playerIndex, pieceIndex, roll);
    const after = result.players[playerIndex].pieces[pieceIndex];
    const position = globalTrackPosition(result.players[playerIndex], after);
    let score = Math.max(after.steps, 0) + Math.random() * 4;
    score += result.captures * (difficulty === "hard" ? 180 : 100);
    if (before === -1) score += difficulty === "hard" ? 55 : 28;
    if (result.finished) score += difficulty === "hard" ? 170 : 85;
    if (position !== null && SAFE_TRACK.has(position)) score += difficulty === "hard" ? 48 : 22;
    if (difficulty === "hard" && dangerAt(result.players, playerIndex, position)) score -= 75;
    if (score > bestScore) { bestScore = score; best = pieceIndex; }
  });
  return best;
}

function pieceCoordinate(player: LudoPlayer, piece: LudoPiece): Coord {
  if (piece.steps === -1) return BASE_SPOTS[player.id][piece.id];
  if (piece.steps <= 51) return TRACK[(player.start + piece.steps) % 52];
  return HOME_LANES[player.id][Math.min(piece.steps - 52, 5)];
}

function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function wrapRank(rank: number): number {
  return rank < 1 ? 13 : rank > 13 ? 1 : rank;
}

function isNeighbor(rank: number, foundation: number): boolean {
  return wrapRank(foundation - 1) === rank || wrapRank(foundation + 1) === rank;
}

function makeTrailCard(rank: number): TrailCard {
  cardId += 1;
  return { id: cardId, rank: wrapRank(rank), suit: randomSuit() };
}

function makeTrailHand(foundation: number, count: number): TrailCard[] {
  const direction = Math.random() > .5 ? 1 : -1;
  const cards = [makeTrailCard(foundation + direction)];
  while (cards.length < count) {
    const rank = Math.floor(Math.random() * 13) + 1;
    if (!isNeighbor(rank, foundation)) cards.push(makeTrailCard(rank));
  }
  return cards.sort(() => Math.random() - .5);
}

function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(""));
  const [current, setCurrent] = useState<Exclude<Mark, "">>("X");
  const [mode, setMode] = useState<TicMode>("duo");
  const [outcome, setOutcome] = useState<TicOutcome | null>(null);
  const [thinking, setThinking] = useState(false);
  const status = outcome ? outcome.winner === "draw" ? "Deu velha!" : `${outcome.winner} venceu!` : thinking ? "iPhone pensando…" : `Vez do ${current}`;

  function finish(nextBoard: Mark[]) {
    const nextOutcome = ticOutcome(nextBoard);
    if (!nextOutcome) return false;
    setOutcome(nextOutcome);
    return true;
  }

  function play(index: number) {
    if (outcome || thinking || board[index]) return;
    const next = [...board];
    next[index] = current;
    setBoard(next);
    if (finish(next)) return;
    if (mode === "duo") { setCurrent(current === "X" ? "O" : "X"); return; }
    setThinking(true);
    setCurrent("O");
    window.setTimeout(() => {
      const cpuBoard = [...next];
      cpuBoard[bestTicMove(cpuBoard)] = "O";
      setBoard(cpuBoard);
      setThinking(false);
      if (!finish(cpuBoard)) setCurrent("X");
    }, 320);
  }

  function reset(nextMode: TicMode = mode) {
    setBoard(Array(9).fill("")); setCurrent("X"); setMode(nextMode); setOutcome(null); setThinking(false);
  }

  return (
    <section className="game-card tic-card" aria-label="Jogo da velha">
      <GameHeader title="Jogo da Velha" subtitle="Clássico rápido" onBack={onBack} />
      <div className="segmented" aria-label="Modo de jogo">
        <button className={mode === "duo" ? "active" : ""} onClick={() => reset("duo")}>2 jogadores</button>
        <button className={mode === "cpu" ? "active" : ""} onClick={() => reset("cpu")}>Contra o iPhone</button>
      </div>
      <p className="status" aria-live="polite">{status}</p>
      <div className="tic-board" role="grid" aria-label="Tabuleiro do jogo da velha">
        {board.map((mark, index) => (
          <button
            aria-label={`Casa ${index + 1}, ${mark || "vazia"}`}
            className={`tic-cell ${mark.toLowerCase()} ${outcome?.line.includes(index) ? "win" : ""}`}
            disabled={Boolean(outcome) || thinking}
            key={index}
            onClick={() => play(index)}
            role="gridcell"
          >{mark}</button>
        ))}
      </div>
      <button className="primary-button" onClick={() => reset()}>Jogar novamente</button>
    </section>
  );
}

function GameHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <header className="game-header">
      <button className="back-button" onClick={onBack} aria-label="Voltar para os jogos">‹</button>
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      <span className="header-spacer" />
    </header>
  );
}

function Ludo({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [level, setLevel] = useState<Level>(1);
  const [players, setPlayers] = useState<LudoPlayer[]>(() => makePlayers(1));
  const [current, setCurrent] = useState(0);
  const [die, setDie] = useState<number | null>(null);
  const [legalPieces, setLegalPieces] = useState<number[]>([]);
  const [winner, setWinner] = useState<Color | null>(null);
  const [passPending, setPassPending] = useState(false);
  const [message, setMessage] = useState("Sua vez: role o dado");
  const currentPlayer = players[current];

  function reset(nextLevel: Level = level) {
    setLevel(nextLevel);
    setPlayers(makePlayers(nextLevel));
    setCurrent(0); setDie(null); setLegalPieces([]); setWinner(null); setPassPending(false);
    setMessage("Sua vez: role o dado");
  }

  function nextTurn(from: number, roll: number) {
    setDie(null); setLegalPieces([]);
    if (roll === 6) { setMessage(players[from].human ? "Tirou 6! Jogue novamente" : `${players[from].label} joga de novo`); return; }
    const next = (from + 1) % players.length;
    setCurrent(next);
    setMessage(players[next].human ? "Sua vez: role o dado" : `Vez de ${players[next].label}`);
  }

  function rollHuman() {
    if (!currentPlayer?.human || die !== null || winner || passPending) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    const moves = legalLudoMoves(currentPlayer, roll);
    setDie(roll);
    if (!moves.length) {
      setMessage(`Você tirou ${roll}, mas não há jogada`);
      setPassPending(true);
      return;
    }
    setLegalPieces(moves);
    setMessage(moves.length === 1 ? "Toque na peça destacada" : "Escolha uma peça para mover");
  }

  function moveHuman(pieceIndex: number) {
    if (!currentPlayer?.human || !legalPieces.includes(pieceIndex) || die === null) return;
    const result = applyLudoMove(players, current, pieceIndex, die);
    setPlayers(result.players);
    setLegalPieces([]);
    if (result.won) { setWinner(currentPlayer.id); setMessage("Você venceu o Ludo!"); return; }
    if (result.captures) setMessage(`Boa! Você capturou ${result.captures} peça${result.captures > 1 ? "s" : ""}`);
    nextTurn(current, die);
  }

  useEffect(() => {
    if (!passPending) return;
    const timer = window.setTimeout(() => {
      setPassPending(false);
      const next = (current + 1) % players.length;
      setCurrent(next); setDie(null); setLegalPieces([]);
      setMessage(players[next].human ? "Sua vez: role o dado" : `Vez de ${players[next].label}`);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [passPending, current, players]);

  useEffect(() => {
    const cpu = players[current];
    if (!cpu || cpu.human || winner || passPending) return;
    const timer = window.setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const moves = legalLudoMoves(cpu, roll);
      setDie(roll);
      if (!moves.length) {
        setMessage(`${cpu.label} tirou ${roll} e passou a vez`);
        setPassPending(true);
        return;
      }
      const choice = chooseCpuMove(players, current, moves, roll, difficulty);
      const result = applyLudoMove(players, current, choice, roll);
      setPlayers(result.players);
      if (result.won) { setWinner(cpu.id); setMessage(`${cpu.label} venceu a partida`); return; }
      setMessage(result.captures ? `${cpu.label} capturou uma peça` : `${cpu.label} tirou ${roll}`);
      nextTurn(current, roll);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [players, current, winner, passPending, difficulty]);

  const positioned = players.flatMap((player, playerIndex) => player.pieces.map((piece, pieceIndex) => ({
    player, playerIndex, piece, pieceIndex, coord: pieceCoordinate(player, piece),
  })));

  const winnerPlayer = players.find((player) => player.id === winner);

  return (
    <section className="ludo-card" aria-label="Jogo de Ludo">
      <GameHeader title="Ludo" subtitle="Corrida até o centro" onBack={onBack} />

      <div className="ludo-config">
        <div><span className="config-label">Nível</span><div className="mini-segmented">
          {([1,2,3] as Level[]).map((item) => <button className={level === item ? "active" : ""} key={item} onClick={() => reset(item)}>{item}</button>)}
        </div></div>
        <div><span className="config-label">Dificuldade</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} aria-label="Dificuldade">
          <option value="easy">Fácil</option><option value="medium">Média</option><option value="hard">Difícil</option>
        </select></div>
      </div>

      <div className="player-strip" aria-label="Jogadores">
        {players.map((player, index) => (
          <div className={`player-badge ${current === index && !winner ? "current" : ""}`} key={player.id}>
            <i style={{ background: player.color }} />
            <span>{player.label}</span>
            <b>{player.pieces.filter((piece) => piece.steps === 57).length}/{player.pieces.length}</b>
          </div>
        ))}
      </div>

      <div className="ludo-board" aria-label="Tabuleiro de Ludo">
        <div className="base-zone red"><span>Você</span></div>
        <div className="base-zone green"><span>Verde</span></div>
        <div className="base-zone yellow"><span>Amarelo</span></div>
        <div className="base-zone blue"><span>Azul</span></div>
        <div className="ludo-center">★</div>

        {TRACK.map(([row, col], index) => {
          const startColor = START_COLORS[index];
          return <span className={`track-cell ${startColor ? `start ${startColor}` : ""} ${SAFE_TRACK.has(index) ? "safe" : ""}`} key={`t${index}`} style={{ "--row": row, "--col": col } as CSSProperties}>{SAFE_TRACK.has(index) ? "★" : ""}</span>;
        })}
        {(Object.entries(HOME_LANES) as [Color, Coord[]][]).flatMap(([color, cells]) => cells.map(([row, col], index) => (
          <span className={`track-cell home-cell ${color}`} key={`${color}${index}`} style={{ "--row": row, "--col": col } as CSSProperties} />
        )))}

        {positioned.map((item, flatIndex) => {
          const sameSpot = positioned.filter((candidate, index) => index < flatIndex && candidate.coord[0] === item.coord[0] && candidate.coord[1] === item.coord[1]).length;
          const movable = item.playerIndex === current && item.player.human && legalPieces.includes(item.pieceIndex);
          const [row, col] = item.coord;
          return (
            <button
              aria-label={`${item.player.label}, peça ${item.pieceIndex + 1}${movable ? ", pode mover" : ""}`}
              className={`ludo-token slot-${Math.min(sameSpot, 3)} ${movable ? "movable" : ""}`}
              disabled={!movable}
              key={`${item.player.id}-${item.piece.id}`}
              onClick={() => moveHuman(item.pieceIndex)}
              style={{ "--token-row": row, "--token-col": col, "--token-color": item.player.color } as CSSProperties}
            >{item.pieceIndex + 1}</button>
          );
        })}
      </div>

      <div className="turn-panel">
        <div className="turn-copy"><span>{winnerPlayer ? "Fim de jogo" : currentPlayer?.human ? "Sua jogada" : `Jogando: ${currentPlayer?.label}`}</span><strong aria-live="polite">{message}</strong></div>
        <button className="dice-button" disabled={!currentPlayer?.human || die !== null || Boolean(winner) || passPending} onClick={rollHuman}>
          <span>{die ? DIE_FACES[die] : "🎲"}</span><b>{die ? die : "Rolar"}</b>
        </button>
      </div>

      {legalPieces.length > 0 && (
        <div className="move-options" aria-label="Peças disponíveis">
          {legalPieces.map((pieceIndex) => <button key={pieceIndex} onClick={() => moveHuman(pieceIndex)}>Mover peça {pieceIndex + 1}</button>)}
        </div>
      )}

      <div className="ludo-footer">
        <span>Nível {level}: {level + 1} peças • {level} adversário{level > 1 ? "s" : ""}</span>
        <button onClick={() => reset()}>Reiniciar partida</button>
      </div>
    </section>
  );
}

function CardFace({ card, selectable = false, hinted = false, onClick }: { card: TrailCard; selectable?: boolean; hinted?: boolean; onClick?: () => void }) {
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <button
      aria-label={`${RANK_LABELS[card.rank]} de ${card.suit}`}
      className={`playing-card ${red ? "card-red" : "card-black"} ${selectable ? "selectable" : ""} ${hinted ? "hinted" : ""}`}
      disabled={!onClick}
      onClick={onClick}
    >
      <span className="card-corner"><b>{RANK_LABELS[card.rank]}</b><i>{card.suit}</i></span>
      <strong>{card.suit}</strong>
      <span className="card-corner bottom"><b>{RANK_LABELS[card.rank]}</b><i>{card.suit}</i></span>
    </button>
  );
}

function CardTrail({ onBack }: { onBack: () => void }) {
  const [saved, setSaved] = useState<TrailProgress>({ unlocked: 1, stars: {}, bestCombo: 0 });
  const [level, setLevel] = useState(1);
  const [foundation, setFoundation] = useState<TrailCard>(() => makeTrailCard(7));
  const [hand, setHand] = useState<TrailCard[]>(() => makeTrailHand(7, 5));
  const [moves, setMoves] = useState(0);
  const [lives, setLives] = useState(3);
  const [shuffles, setShuffles] = useState(4);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("Encaixe uma carta vizinha");
  const [hintId, setHintId] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(true);

  const goal = 7 + level * 2;
  const handSize = level <= 4 ? 5 : level <= 8 ? 4 : 3;
  const initialShuffles = Math.max(4 - Math.floor((level - 1) / 4), 2);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("sala-jogos-trilha-progress");
      if (stored) setSaved(JSON.parse(stored) as TrailProgress);
      setShowRules(window.localStorage.getItem("sala-jogos-trilha-tutorial") !== "ok");
    } catch { /* progresso local indisponível */ }
  }, []);

  function closeRules() {
    setShowRules(false);
    try { window.localStorage.setItem("sala-jogos-trilha-tutorial", "ok"); } catch { /* jogo continua normalmente */ }
    window.setTimeout(showHint, 180);
  }

  function persist(next: TrailProgress) {
    setSaved(next);
    try { window.localStorage.setItem("sala-jogos-trilha-progress", JSON.stringify(next)); } catch { /* jogo continua sem salvar */ }
  }

  function startLevel(nextLevel: number) {
    const start = makeTrailCard(Math.floor(Math.random() * 13) + 1);
    const nextHandSize = nextLevel <= 4 ? 5 : nextLevel <= 8 ? 4 : 3;
    setLevel(nextLevel);
    setFoundation(start);
    setHand(makeTrailHand(start.rank, nextHandSize));
    setMoves(0); setLives(3); setCombo(0); setBestCombo(0); setScore(0);
    setShuffles(Math.max(4 - Math.floor((nextLevel - 1) / 4), 2));
    setPhase("playing"); setMessage("Encaixe uma carta vizinha"); setHintId(null);
  }

  function playCard(card: TrailCard) {
    if (phase !== "playing") return;
    if (!isNeighbor(card.rank, foundation.rank)) {
      const nextLives = lives - 1;
      setLives(nextLives); setCombo(0); setMessage("Essa carta não encaixa. Tente a anterior ou a próxima.");
      if (nextLives === 0) setPhase("lost");
      return;
    }

    const nextMoves = moves + 1;
    const nextCombo = combo + 1;
    const nextBest = Math.max(bestCombo, nextCombo);
    const replacement = makeTrailCard(card.rank + (Math.random() > .5 ? 1 : -1));
    setFoundation(card); setMoves(nextMoves); setCombo(nextCombo); setBestCombo(nextBest);
    setScore((value) => value + 100 + nextCombo * 20);
    setHand((cards) => cards.map((item) => item.id === card.id ? replacement : item).sort(() => Math.random() - .5));
    setMessage(nextCombo >= 5 ? `Sequência de ${nextCombo}!` : "Boa jogada — continue a trilha");
    setHintId(null);

    if (nextMoves >= goal) {
      const earned = lives === 3 && shuffles >= initialShuffles - 1 ? 3 : lives >= 2 ? 2 : 1;
      const nextSaved: TrailProgress = {
        unlocked: Math.max(saved.unlocked, Math.min(TRAIL_LEVELS, level + 1)),
        stars: { ...saved.stars, [level]: Math.max(saved.stars[level] || 0, earned) },
        bestCombo: Math.max(saved.bestCombo, nextBest),
      };
      persist(nextSaved); setPhase("won"); setMessage(`Nível concluído com ${earned} estrela${earned > 1 ? "s" : ""}!`);
    }
  }

  function shuffleHand() {
    if (phase !== "playing" || shuffles <= 0) return;
    setHand(makeTrailHand(foundation.rank, handSize));
    setShuffles((value) => value - 1); setCombo(0); setMessage("Nova mão distribuída"); setHintId(null);
  }

  function showHint() {
    const valid = hand.find((card) => isNeighbor(card.rank, foundation.rank));
    if (!valid) return;
    setHintId(valid.id); setMessage("A carta iluminada continua a sequência");
    window.setTimeout(() => setHintId(null), 1400);
  }

  return (
    <section className="card-game" aria-label="Paciência Trilha">
      <GameHeader title="Paciência Trilha" subtitle="Paciência encontra dominó" onBack={onBack} />

      <div className="trail-progress-top">
        <div><span>Nível {level}</span><strong>{moves}/{goal} cartas</strong></div>
        <div className="progress-rail"><i style={{ width: `${Math.min(100, moves / goal * 100)}%` }} /></div>
        <div className="trail-stats"><span>♥ {lives}</span><span>Combo {combo}</span><span>{score} pts</span></div>
      </div>

      <button className="how-to-button" onClick={() => setShowRules(true)}>ⓘ Como jogar</button>

      <div className="level-ribbon" aria-label="Níveis da Paciência Trilha">
        {Array.from({ length: TRAIL_LEVELS }, (_, index) => index + 1).map((item) => {
          const unlocked = item <= saved.unlocked;
          return <button className={item === level ? "active" : ""} disabled={!unlocked} key={item} onClick={() => startLevel(item)}><b>{unlocked ? item : "•"}</b><span>{"★".repeat(saved.stars[item] || 0)}</span></button>;
        })}
      </div>

      <div className="trail-table">
        <div className="foundation-zone">
          <span className="zone-label">Carta da trilha</span>
          <CardFace card={foundation} />
          <p>Jogue {RANK_LABELS[wrapRank(foundation.rank - 1)]} ou {RANK_LABELS[wrapRank(foundation.rank + 1)]}</p>
        </div>

        <div className="hand-instruction"><span>↓</span> Toque numa carta iluminada da sua mão</div>

        <div className="trail-hand" aria-label="Sua mão de cartas">
          {hand.map((card) => <CardFace key={card.id} card={card} selectable={isNeighbor(card.rank, foundation.rank)} hinted={hintId === card.id} onClick={() => playCard(card)} />)}
        </div>

        <p className="trail-message" aria-live="polite">{message}</p>
        <div className="trail-actions">
          <button onClick={showHint} disabled={phase !== "playing"}>💡 Dica</button>
          <button onClick={shuffleHand} disabled={phase !== "playing" || shuffles === 0}>↻ Trocar mão <b>{shuffles}</b></button>
        </div>

        {phase !== "playing" && (
          <div className={`trail-result ${phase}`}>
            <span>{phase === "won" ? "🏆" : "🃏"}</span>
            <h2>{phase === "won" ? "Trilha completa!" : "Fim da rodada"}</h2>
            <p>{phase === "won" ? `Melhor sequência: ${bestCombo}` : "Tente novamente — cada partida dura poucos minutos."}</p>
            <div>
              <button onClick={() => startLevel(level)}>Jogar novamente</button>
              {phase === "won" && level < TRAIL_LEVELS && <button className="result-primary" onClick={() => startLevel(level + 1)}>Próximo nível</button>}
            </div>
          </div>
        )}

        {showRules && (
          <div className="rules-overlay" role="dialog" aria-modal="true" aria-labelledby="trail-rules-title">
            <div className="rules-sheet">
              <span className="rules-kicker">Aprenda em 20 segundos</span>
              <h2 id="trail-rules-title">Como jogar</h2>
              <p className="rules-lead">Monte uma sequência usando uma carta <b>um número acima ou abaixo</b> da carta central.</p>
              <div className="rule-example" aria-label="Exemplo: sobre um sete, jogue seis ou oito">
                <span className="mini-card">6♠</span><i>ou</i><span className="mini-card center">7♥</span><i>ou</i><span className="mini-card">8♦</span>
              </div>
              <p className="rule-caption">Se a carta central é 7, toque em um 6 ou 8 da sua mão.</p>
              <ol>
                <li><b>Procure o brilho amarelo:</b> ele marca as cartas válidas.</li>
                <li><b>Complete a barra:</b> cada carta certa aproxima você do próximo nível.</li>
                <li><b>Cuidado com os erros:</b> uma carta errada tira uma vida.</li>
              </ol>
              <div className="rules-notes"><span>Ás ↔ Rei também encaixam</span><span>Combos dão mais pontos</span></div>
              <button className="rules-start" onClick={closeRules}>Entendi — começar</button>
            </div>
          </div>
        )}
      </div>

      <footer className="trail-footer"><span>Melhor combo: <b>{Math.max(saved.bestCombo, bestCombo)}</b></span><span>Progresso salvo neste aparelho</span></footer>
    </section>
  );
}

function Menu({ onSelect }: { onSelect: (screen: Screen) => void }) {
  return (
    <section className="menu-card">
      <div className="menu-heading"><span>🎮</span><div><p>Jogue direto no celular</p><h1>Sala de Jogos</h1></div></div>
      <p className="menu-subtitle">Escolha um jogo. Nada para instalar.</p>
      <div className="game-list">
        <button className="game-tile tic-tile" onClick={() => onSelect("tic")}>
          <span className="tile-art">X <i>O</i></span><span><b>Jogo da Velha</b><small>Rápido • 1 ou 2 jogadores</small></span><em>›</em>
        </button>
        <button className="game-tile ludo-tile" onClick={() => onSelect("ludo")}>
          <span className="tile-art"><i /><i /><i /><i /></span><span><b>Ludo</b><small>3 níveis • Dificuldade ajustável</small></span><em>›</em>
        </button>
        <button className="game-tile cards-tile" onClick={() => onSelect("cards")}>
          <span className="tile-art"><i>Q♥</i><i>J♠</i><i>10♦</i></span><span><b>Paciência Trilha</b><small>12 níveis • Combos • Progresso salvo</small></span><em>›</em>
        </button>
      </div>
      <p className="menu-tip">Dica: no Safari, use “Adicionar à Tela de Início” para abrir como aplicativo.</p>
    </section>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  return (
    <main className={`app-shell screen-${screen}`}>
      {screen === "menu" && <Menu onSelect={setScreen} />}
      {screen === "tic" && <TicTacToe onBack={() => setScreen("menu")} />}
      {screen === "ludo" && <Ludo onBack={() => setScreen("menu")} />}
      {screen === "cards" && <CardTrail onBack={() => setScreen("menu")} />}
    </main>
  );
}
