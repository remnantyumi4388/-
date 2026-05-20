import { defaultTasks, GAME_SECONDS } from "@/lib/gameConfig";
import type { ChatMessage, GameRoomSnapshot, GameStatus, Player, Result, Vector2 } from "@/lib/gameRoomTypes";

export { GAME_SECONDS, defaultTasks };

export type GameRoom = {
  code: string;
  hostId: string;
  players: Player[];
  tasks: typeof defaultTasks;
  chat: ChatMessage[];
  status: GameStatus;
  result: Result;
  lightsOut: boolean;
  wrongVotes: number;
  startedAt?: number;
  meetingStartedAt?: number;
  votes: Record<string, string>;
  createdAt: number;
  updatedAt: number;
};

type GameRoomGlobal = typeof globalThis & {
  __aiLabRooms?: Map<string, GameRoom>;
};

const colors = ["#ef4444", "#3b82f6", "#84cc16", "#facc15", "#a855f7", "#f97316", "#22d3ee", "#f8fafc"];

export function getRooms() {
  const globalRoomStore = globalThis as GameRoomGlobal;
  globalRoomStore.__aiLabRooms ??= new Map<string, GameRoom>();
  return globalRoomStore.__aiLabRooms;
}

export function copyTasks() {
  return defaultTasks.map((task) => ({ ...task, position: { ...task.position } }));
}

export function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function createPlayer(name: string, index: number, position?: Vector2): Player {
  return {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 16) || `Player${index + 1}`,
    color: colors[index % colors.length],
    role: "researcher",
    position: position ?? { x: (index - 2) * 1.4, z: index % 2 === 0 ? 1.4 : -1.2 },
    isAlive: true,
    isBot: false,
    hasVoted: false,
    lastSeen: Date.now()
  };
}

export function createRoom(name: string) {
  const rooms = getRooms();
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();

  const host = createPlayer(name, 0, { x: 0, z: 1.2 });
  const room: GameRoom = {
    code,
    hostId: host.id,
    players: [host],
    tasks: copyTasks(),
    chat: [systemMessage("방이 생성되었습니다. 코드를 친구에게 공유해서 함께 입장하세요.")],
    status: "lobby",
    result: null,
    lightsOut: false,
    wrongVotes: 0,
    votes: {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  rooms.set(code, room);
  return { room, playerId: host.id };
}

export function publicRoom(room: GameRoom, viewerId?: string): GameRoomSnapshot {
  updateRoomOutcome(room);
  const now = Date.now();

  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map((player) => ({
      ...player,
      role: player.id === viewerId ? player.role : "researcher"
    })),
    tasks: room.tasks,
    chat: room.chat.slice(-60),
    status: room.status,
    result: room.result,
    lightsOut: room.lightsOut,
    wrongVotes: room.wrongVotes,
    timeLeft:
      room.status === "playing" && room.startedAt
        ? Math.max(0, GAME_SECONDS - Math.floor((now - room.startedAt) / 1000))
        : GAME_SECONDS,
    meetingEndsAt: room.meetingStartedAt ? room.meetingStartedAt + 60_000 : undefined
  };
}

export function touchRoom(room: GameRoom) {
  room.updatedAt = Date.now();
}

export function startRoom(room: GameRoom) {
  const candidates = room.players.filter((player) => player.isAlive);
  const impostorIndex = Math.floor(Math.random() * candidates.length);
  room.players = room.players.map((player) => ({
    ...player,
    role: candidates[impostorIndex]?.id === player.id ? "fakeResearcher" : "researcher",
    isAlive: true,
    hasVoted: false
  }));
  room.tasks = copyTasks();
  room.status = "playing";
  room.result = null;
  room.lightsOut = false;
  room.wrongVotes = 0;
  room.votes = {};
  room.startedAt = Date.now();
  room.meetingStartedAt = undefined;
  room.chat.push(systemMessage("역할이 배정되었습니다. 가짜 연구원을 찾아내세요."));
  touchRoom(room);
}

export function restartRoom(room: GameRoom) {
  room.players = room.players.map((player, index) => ({
    ...player,
    role: "researcher",
    isAlive: true,
    hasVoted: false,
    position: { x: (index - 2) * 1.4, z: index % 2 === 0 ? 1.4 : -1.2 }
  }));
  room.tasks = copyTasks();
  room.status = "lobby";
  room.result = null;
  room.lightsOut = false;
  room.wrongVotes = 0;
  room.votes = {};
  room.startedAt = undefined;
  room.meetingStartedAt = undefined;
  room.chat.push(systemMessage("새 라운드가 준비되었습니다."));
  touchRoom(room);
}

export function systemMessage(text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    playerId: "system",
    playerName: "SYSTEM",
    color: "#67e8f9",
    text,
    createdAt: Date.now()
  };
}

export function updateRoomOutcome(room: GameRoom) {
  if (room.status !== "playing" && room.status !== "meeting") return;

  if (room.tasks.every((task) => task.completed)) {
    room.status = "result";
    room.result = "researchersWin";
    room.chat.push(systemMessage("모든 미션이 완료되었습니다. 연구원 팀 승리!"));
    return;
  }

  const alive = room.players.filter((player) => player.isAlive);
  const aliveImpostors = alive.filter((player) => player.role === "fakeResearcher").length;
  const aliveResearchers = alive.length - aliveImpostors;
  if (aliveImpostors > 0 && aliveResearchers <= aliveImpostors) {
    room.status = "result";
    room.result = "impostorWins";
    room.chat.push(systemMessage("가짜 연구원이 연구소를 장악했습니다."));
    return;
  }

  if (room.status === "playing" && room.startedAt && Date.now() - room.startedAt > GAME_SECONDS * 1000) {
    room.status = "result";
    room.result = "impostorWins";
    room.chat.push(systemMessage("제한 시간이 끝났습니다. 가짜 연구원 승리."));
  }
}

export function resolveVotes(room: GameRoom) {
  const alive = room.players.filter((player) => player.isAlive);
  if (Object.keys(room.votes).length < alive.length) return;

  const counts = Object.values(room.votes).reduce<Record<string, number>>((acc, targetId) => {
    acc[targetId] = (acc[targetId] ?? 0) + 1;
    return acc;
  }, {});
  const [targetId, topVotes] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? ["skip", 0];
  const tied = Object.values(counts).filter((count) => count === topVotes).length > 1;

  room.votes = {};
  room.players = room.players.map((player) => ({ ...player, hasVoted: false }));

  if (targetId === "skip" || tied) {
    room.status = "playing";
    room.meetingStartedAt = undefined;
    room.chat.push(systemMessage("동표 또는 스킵으로 추방자가 없습니다."));
    return;
  }

  const exiled = room.players.find((player) => player.id === targetId);
  if (!exiled) {
    room.status = "playing";
    room.meetingStartedAt = undefined;
    return;
  }

  room.players = room.players.map((player) =>
    player.id === targetId ? { ...player, isAlive: false } : player
  );

  if (exiled.role === "fakeResearcher") {
    room.status = "result";
    room.result = "researchersWin";
    room.chat.push(systemMessage(`${exiled.name} 추방 성공. 연구원 팀 승리!`));
  } else {
    room.wrongVotes += 1;
    if (room.wrongVotes >= 2) {
      room.status = "result";
      room.result = "impostorWins";
      room.chat.push(systemMessage("오추방이 누적되었습니다. 가짜 연구원 승리."));
    } else {
      room.status = "playing";
      room.meetingStartedAt = undefined;
      room.chat.push(systemMessage(`${exiled.name}은 연구원이었습니다.`));
    }
  }
}
