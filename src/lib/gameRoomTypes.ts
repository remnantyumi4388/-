export type Role = "researcher" | "fakeResearcher";
export type GameStatus = "lobby" | "playing" | "meeting" | "result";
export type Result = "researchersWin" | "impostorWins" | null;

export type Vector2 = {
  x: number;
  z: number;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  role: Role;
  position: Vector2;
  isAlive: boolean;
  isBot: boolean;
  hasVoted: boolean;
  lastSeen?: number;
};

export type Task = {
  id: string;
  name: string;
  room: string;
  position: Vector2;
  duration: number;
  completed: boolean;
  completedBy?: string;
};

export type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  color: string;
  text: string;
  createdAt: number;
};

export type GameRoomSnapshot = {
  code: string;
  hostId: string;
  players: Player[];
  tasks: Task[];
  chat: ChatMessage[];
  status: GameStatus;
  result: Result;
  lightsOut: boolean;
  wrongVotes: number;
  timeLeft: number;
  meetingEndsAt?: number;
};
