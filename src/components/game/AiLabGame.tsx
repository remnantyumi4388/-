"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copy,
  Cpu,
  Lightbulb,
  MessageCircle,
  MousePointer2,
  Play,
  RadioTower,
  RotateCcw,
  Send,
  ShieldAlert,
  Siren,
  Users,
  Vote,
  Wifi
} from "lucide-react";
import * as THREE from "three";
import { defaultTasks, GAME_SECONDS } from "@/lib/gameConfig";
import type { ChatMessage, GameRoomSnapshot, GameStatus, Player, Result, Task } from "@/lib/gameRoomTypes";

type Mode = "local" | "online";

type Room = {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: number;
  accent: number;
};

const INTERACTION_RANGE = 2.6;
const MOVE_SPEED = 5.2;
const WORLD_X = 13;
const WORLD_Z_MIN = -12;
const WORLD_Z_MAX = 13;
const SYNC_MS = 420;

const rooms: Room[] = [
  { id: "lobby", name: "LOBBY", x: 0, z: 0, w: 7.8, d: 6.7, color: 0x6b7c8f, accent: 0x38bdf8 },
  { id: "server", name: "SERVER", x: -8.5, z: -6.5, w: 6.2, d: 5.1, color: 0x526a7c, accent: 0x22c55e },
  { id: "electrical", name: "ELECTRICAL", x: 8.5, z: -6.5, w: 6.2, d: 5.1, color: 0x6f6a5f, accent: 0xfacc15 },
  { id: "core", name: "AI CORE", x: 0, z: 7.8, w: 7.1, d: 5.7, color: 0x5b6474, accent: 0xef4444 },
  { id: "security", name: "SECURITY", x: -10, z: 4.5, w: 5.2, d: 4.6, color: 0x51687a, accent: 0x38bdf8 },
  { id: "cafeteria", name: "CAFETERIA", x: 9.5, z: 4.8, w: 5.6, d: 4.9, color: 0x697782, accent: 0x34d399 },
  { id: "medbay", name: "MEDBAY", x: 0, z: -10.2, w: 5.8, d: 3.4, color: 0x64798a, accent: 0xa78bfa }
];

const localTemplate = [
  { id: "local-player", name: "Redbean", color: "#ef4444", isBot: false, position: { x: 0, z: 1.2 } },
  { id: "bot-blue", name: "BerryBlue", color: "#3b82f6", isBot: true, position: { x: -1.8, z: -1.2 } },
  { id: "bot-green", name: "LimeLight", color: "#84cc16", isBot: true, position: { x: 1.8, z: -1.2 } },
  { id: "bot-gold", name: "SunnyD", color: "#facc15", isBot: true, position: { x: 0, z: -2.6 } }
];

const tutorialSteps = [
  {
    title: "1. 이동과 카메라",
    body: "WASD로 움직이거나 바닥을 클릭해서 이동합니다. 마우스를 드래그하면 시점을 돌리고, 휠로 화면 거리를 조정할 수 있습니다.",
    tag: "기본 조작"
  },
  {
    title: "2. 미션 완료",
    body: "서버실, 전기실, AI 코어실의 콘솔 가까이에서 미션 버튼을 누르세요. 진행 바가 끝날 때까지 콘솔 근처에 머무르면 미션이 완료됩니다.",
    tag: "연구원 목표"
  },
  {
    title: "3. 사보타지 대응",
    body: "가짜 연구원은 조명 해킹을 일으킬 수 있습니다. 조명이 꺼지면 전기실로 이동해 조명 복구 버튼을 눌러 시야를 회복하세요.",
    tag: "위기 대응"
  },
  {
    title: "4. 회의와 투표",
    body: "긴급 회의에서는 채팅으로 수상한 행동을 공유하고 투표합니다. 가짜 연구원을 맞히면 연구원 승리, 오추방이 쌓이면 가짜 연구원이 유리합니다.",
    tag: "추리 승부"
  }
];

const distance2D = (a: { x: number; z: number }, b: { x: number; z: number }) =>
  Math.hypot(a.x - b.x, a.z - b.z);

const clampPosition = (position: { x: number; z: number }) => ({
  x: THREE.MathUtils.clamp(position.x, -WORLD_X, WORLD_X),
  z: THREE.MathUtils.clamp(position.z, WORLD_Z_MIN, WORLD_Z_MAX)
});

function copyTasks() {
  return defaultTasks.map((task) => ({ ...task, position: { ...task.position } }));
}

function createLobbyPlayers(): Player[] {
  return localTemplate.map((player) => ({
    ...player,
    position: { ...player.position },
    role: "researcher",
    isAlive: true,
    hasVoted: false
  }));
}

function createLocalPlayers(): Player[] {
  const impostorIndex = Math.floor(Math.random() * localTemplate.length);
  return localTemplate.map((player, index) => ({
    ...player,
    position: { ...player.position },
    role: index === impostorIndex ? "fakeResearcher" : "researcher",
    isAlive: true,
    hasVoted: false
  }));
}

function createLocalMessage(text: string, name = "SYSTEM", color = "#67e8f9"): ChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    playerId: name === "SYSTEM" ? "system" : "local-player",
    playerName: name,
    color,
    text,
    createdAt: Date.now()
  };
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString();
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes} : ${rest}`;
}

function getRoomAt(position: { x: number; z: number }) {
  return (
    rooms.find(
      (room) =>
        position.x >= room.x - room.w / 2 &&
        position.x <= room.x + room.w / 2 &&
        position.z >= room.z - room.d / 2 &&
        position.z <= room.z + room.d / 2
    )?.name ?? "CORRIDOR"
  );
}

async function roomRequest(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/game/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload })
  });
  const data = (await response.json().catch(() => ({}))) as {
    room?: GameRoomSnapshot;
    playerId?: string;
    error?: string;
  };

  if (!response.ok) throw new Error(data.error ?? "요청을 처리하지 못했습니다.");
  return data;
}

function createRobot(color: string) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.34,
    metalness: 0.3
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.3,
    metalness: 0.62,
    emissive: 0x0f172a,
    emissiveIntensity: 0.28
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b3858,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.95,
    roughness: 0.12,
    metalness: 0.74
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.76, 10, 18), bodyMaterial);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 28, 18), bodyMaterial);
  head.position.y = 1.6;
  head.scale.set(1.05, 0.9, 1);
  head.castShadow = true;
  group.add(head);

  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 12), glassMaterial);
  visor.position.set(0, 1.62, 0.42);
  visor.scale.set(1.32, 0.55, 0.28);
  group.add(visor);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.78, 0.26), bodyMaterial);
  backpack.position.set(0, 0.98, -0.5);
  backpack.castShadow = true;
  group.add(backpack);

  [-0.56, 0.56].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.48, 7, 11), bodyMaterial);
    arm.position.set(x, 0.98, 0.03);
    arm.rotation.z = x > 0 ? -0.24 : 0.24;
    arm.castShadow = true;
    group.add(arm);

    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.28, 7, 11), darkMaterial);
    foot.position.set(x * 0.35, 0.22, 0.04);
    foot.castShadow = true;
    group.add(foot);
  });

  const chestLight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.02), glassMaterial);
  chestLight.position.set(0, 1.08, 0.5);
  group.add(chestLight);

  return group;
}

function addRoom(scene: THREE.Scene, room: Room) {
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: room.color,
    roughness: 0.48,
    metalness: 0.38
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(room.w, 0.13, room.d), floorMaterial);
  floor.position.set(room.x, -0.07, room.z);
  floor.receiveShadow = true;
  scene.add(floor);

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: room.accent,
    emissive: room.accent,
    emissiveIntensity: 0.38,
    roughness: 0.28,
    metalness: 0.62
  });
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x9aa6b2,
    roughness: 0.42,
    metalness: 0.52,
    transparent: true,
    opacity: 0.36,
    depthWrite: false
  });
  const wallHeight = 1.55;
  const wallThickness = 0.16;

  [
    { x: 0, z: -room.d / 2, w: room.w, d: wallThickness },
    { x: 0, z: room.d / 2, w: room.w, d: wallThickness },
    { x: -room.w / 2, z: 0, w: wallThickness, d: room.d },
    { x: room.w / 2, z: 0, w: wallThickness, d: room.d }
  ].forEach((wall) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(wall.w, wallHeight, wall.d), wallMaterial);
    mesh.position.set(room.x + wall.x, wallHeight / 2, room.z + wall.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(Math.min(room.w, room.d) * 0.23, 0.035, 8, 64), trimMaterial);
  ring.position.set(room.x, 0.08, room.z);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const seamMaterial = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.55,
    metalness: 0.38,
    transparent: true,
    opacity: 0.42
  });
  for (let ix = -1; ix <= 1; ix += 1) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, room.d * 0.82), seamMaterial);
    seam.position.set(room.x + (ix * room.w) / 4, 0.03, room.z);
    scene.add(seam);
  }
  for (let iz = -1; iz <= 1; iz += 1) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(room.w * 0.82, 0.025, 0.035), seamMaterial);
    seam.position.set(room.x, 0.031, room.z + (iz * room.d) / 4);
    scene.add(seam);
  }

  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.06), trimMaterial);
  sign.position.set(room.x, 1.2, room.z - room.d / 2 + 0.1);
  scene.add(sign);
}

function addCorridor(scene: THREE.Scene, x: number, z: number, w: number, d: number) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.09, d),
    new THREE.MeshStandardMaterial({ color: 0x687887, roughness: 0.56, metalness: 0.36 })
  );
  floor.position.set(x, -0.08, z);
  floor.receiveShadow = true;
  scene.add(floor);

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    emissive: 0x0891b2,
    emissiveIntensity: 0.28
  });
  [-0.42, 0.42].forEach((offset) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, 0.04), stripeMaterial);
    stripe.position.set(x, 0.02, z + offset * d);
    scene.add(stripe);
  });
}

function addConsole(scene: THREE.Scene, task: Task, color = 0x22c55e) {
  const consoleGroup = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.86, 0.78),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.38, metalness: 0.72 })
  );
  base.position.y = 0.42;
  base.castShadow = true;
  consoleGroup.add(base);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.38, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x07111f,
      emissive: color,
      emissiveIntensity: 1.15
    })
  );
  screen.position.set(0, 0.72, 0.41);
  consoleGroup.add(screen);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.52, 12),
    new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.9, roughness: 0.18 })
  );
  handle.position.set(-0.4, 0.55, 0.43);
  handle.rotation.z = 0.52;
  consoleGroup.add(handle);

  consoleGroup.position.set(task.position.x, 0, task.position.z);
  scene.add(consoleGroup);
  return consoleGroup;
}

function addDecor(scene: THREE.Scene) {
  const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x7b8794, roughness: 0.48, metalness: 0.42 });
  const cyanMaterial = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.48
  });
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e5f83,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.28,
    roughness: 0.18,
    metalness: 0.55,
    transparent: true,
    opacity: 0.64
  });

  [
    [-11, -9],
    [-5, 5.7],
    [6.8, 7.2],
    [11.6, 1.4],
    [-11.3, 0.6],
    [4.8, -10.6]
  ].forEach(([x, z], index) => {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.82), crateMaterial);
    crate.position.set(x, 0.36, z);
    crate.rotation.y = index * 0.35;
    crate.castShadow = true;
    scene.add(crate);
  });

  [
    [-3.4, 0],
    [3.4, 0],
    [0, 4.4],
    [0, -4.2]
  ].forEach(([x, z]) => {
    const doorLight = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.08), cyanMaterial);
    doorLight.position.set(x, 0.12, z);
    scene.add(doorLight);
  });

  [
    [-12.4, -2.6, Math.PI / 2],
    [12.4, 2.6, Math.PI / 2],
    [-3.8, 12.4, 0],
    [3.8, -12.4, 0]
  ].forEach(([x, z, rotation]) => {
    const windowPanel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 0.08), windowMaterial);
    windowPanel.position.set(x, 1.25, z);
    windowPanel.rotation.y = rotation;
    scene.add(windowPanel);
  });

  const softPanelMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xf8fafc,
    emissiveIntensity: 0.7,
    roughness: 0.35,
    metalness: 0.18
  });
  [
    [-6, 2.2],
    [6, 2.2],
    [-6, -2.2],
    [6, -2.2],
    [0, 10.4],
    [0, -9.8]
  ].forEach(([x, z]) => {
    const ceilingPanel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 0.42), softPanelMaterial);
    ceilingPanel.position.set(x, 2.6, z);
    scene.add(ceilingPanel);
  });
}

export function AiLabGame() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotRefs = useRef<Map<string, THREE.Group>>(new Map());
  const consoleRefs = useRef<Map<string, THREE.Group>>(new Map());
  const keysRef = useRef<Set<string>>(new Set());
  const playerPositionRef = useRef({ x: 0, z: 1.2 });
  const pointerTargetRef = useRef<{ x: number; z: number } | null>(null);
  const botTargetsRef = useRef<Map<string, { x: number; z: number }>>(new Map());
  const cameraYawRef = useRef(0);
  const cameraDistanceRef = useRef(9.5);
  const dragRef = useRef({ active: false, x: 0, y: 0, moved: false });
  const sabotageClockRef = useRef(0);
  const botWorkClockRef = useRef(0);
  const lastStatusRef = useRef<GameStatus>("lobby");
  const statusRef = useRef<GameStatus>("lobby");
  const playersRef = useRef<Player[]>([]);
  const tasksRef = useRef<Task[]>([]);
  const lightsOutRef = useRef(false);
  const modeRef = useRef<Mode>("local");
  const playerIdRef = useRef("local-player");

  const [mode, setMode] = useState<Mode>("local");
  const [playerId, setPlayerId] = useState("local-player");
  const [nickname, setNickname] = useState("Redbean");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [onlineRoom, setOnlineRoom] = useState<GameRoomSnapshot | null>(null);
  const [networkMessage, setNetworkMessage] = useState("온라인 방을 만들거나 코드로 입장할 수 있습니다.");

  const [localPlayers, setLocalPlayers] = useState<Player[]>(() => createLobbyPlayers());
  const [localTasks, setLocalTasks] = useState<Task[]>(() => copyTasks());
  const [localStatus, setLocalStatus] = useState<GameStatus>("lobby");
  const [localTimeLeft, setLocalTimeLeft] = useState(GAME_SECONDS);
  const [localLightsOut, setLocalLightsOut] = useState(false);
  const [localResult, setLocalResult] = useState<Result>(null);
  const [localWrongVotes, setLocalWrongVotes] = useState(0);
  const [localChat, setLocalChat] = useState<ChatMessage[]>(() => [
    createLocalMessage("로컬 모드입니다. 온라인 방을 만들면 친구와 같이 플레이할 수 있습니다.")
  ]);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [message, setMessage] = useState("방을 만들거나 로컬 게임을 시작하세요.");
  const [chatInput, setChatInput] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [pendingStartMode, setPendingStartMode] = useState<Mode | null>(null);
  const [clearedTaskNotice, setClearedTaskNotice] = useState<{ id: string; name: string; room: string } | null>(null);
  const [cameraZoom, setCameraZoom] = useState(58);
  const [, setUiPulse] = useState(0);

  const room = onlineRoom;
  const status = room?.status ?? localStatus;
  const basePlayers = room?.players ?? localPlayers;
  const tasks = room?.tasks ?? localTasks;
  const lightsOut = room?.lightsOut ?? localLightsOut;
  const result = room?.result ?? localResult;
  const wrongVotes = room?.wrongVotes ?? localWrongVotes;
  const timeLeft = room?.timeLeft ?? localTimeLeft;
  const chatMessages = room?.chat ?? localChat;
  const currentPlayer = basePlayers.find((player) => player.id === playerId) ?? basePlayers[0];
  const userRole = currentPlayer?.role ?? "researcher";
  const hostId = room?.hostId ?? "local-player";
  const isHost = playerId === hostId;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const currentLocation = getRoomAt(playerPositionRef.current);
  const meetingSecondsLeft =
    status === "meeting" && room?.meetingEndsAt
      ? Math.max(0, Math.ceil((room.meetingEndsAt - Date.now()) / 1000))
      : 60;

  const displayPlayers = basePlayers.map((player) =>
    player.id === playerId ? { ...player, position: { ...playerPositionRef.current } } : player
  );

  const nearbyTask =
    tasks.find(
      (task) =>
        !task.completed &&
        distance2D(playerPositionRef.current, task.position) <= INTERACTION_RANGE
    ) ?? null;
  const nearElectrical = distance2D(playerPositionRef.current, { x: 8.5, z: -6.5 }) <= INTERACTION_RANGE;

  const finishLocalGame = useCallback((nextResult: Result, nextMessage: string) => {
    setLocalResult(nextResult);
    setLocalStatus("result");
    setActiveTaskId(null);
    setTaskProgress(0);
    setMessage(nextMessage);
    setLocalChat((current) => [...current, createLocalMessage(nextMessage)]);
  }, []);

  const resetLocalGame = useCallback(() => {
    setMode("local");
    setOnlineRoom(null);
    setRoomCode("");
    setPlayerId("local-player");
    playerPositionRef.current = { x: 0, z: 1.2 };
    pointerTargetRef.current = null;
    setLocalPlayers(createLobbyPlayers());
    setLocalTasks(copyTasks());
    setLocalTimeLeft(GAME_SECONDS);
    setLocalLightsOut(false);
    setLocalStatus("lobby");
    setLocalResult(null);
    setLocalWrongVotes(0);
    setActiveTaskId(null);
    setTaskProgress(0);
    setClearedTaskNotice(null);
    sabotageClockRef.current = 0;
    botWorkClockRef.current = 0;
    setMessage("로컬 로비로 돌아왔습니다.");
    setLocalChat([createLocalMessage("새 로컬 라운드가 준비되었습니다.")]);
  }, []);

  const applyRoomResponse = useCallback((data: { room?: GameRoomSnapshot; playerId?: string }) => {
    if (data.playerId) {
      setPlayerId(data.playerId);
      playerIdRef.current = data.playerId;
    }
    if (data.room) {
      setMode("online");
      setOnlineRoom(data.room);
      setRoomCode(data.room.code);
      const id = data.playerId ?? playerIdRef.current;
      const me = data.room.players.find((player) => player.id === id);
      if (me && data.room.status === "lobby") playerPositionRef.current = { ...me.position };
    }
  }, []);

  const postOnline = useCallback(
    async (action: string, payload: Record<string, unknown> = {}) => {
      const data = await roomRequest(action, payload);
      applyRoomResponse(data);
      return data;
    },
    [applyRoomResponse]
  );

  const createOnlineRoom = useCallback(async () => {
    try {
      setNetworkMessage("온라인 방을 만드는 중...");
      const data = await roomRequest("create", { name: nickname });
      applyRoomResponse(data);
      setNetworkMessage("방이 생성되었습니다. 코드를 공유하세요.");
      setMessage("온라인 로비가 열렸습니다. 친구가 들어오면 시작하세요.");
    } catch (error) {
      setNetworkMessage(error instanceof Error ? error.message : "방 생성 실패");
    }
  }, [applyRoomResponse, nickname]);

  const joinOnlineRoom = useCallback(async () => {
    try {
      setNetworkMessage("방에 입장하는 중...");
      const data = await roomRequest("join", { code: joinCode, name: nickname });
      applyRoomResponse(data);
      setNetworkMessage("온라인 방에 입장했습니다.");
      setMessage("온라인 로비에 입장했습니다.");
    } catch (error) {
      setNetworkMessage(error instanceof Error ? error.message : "입장 실패");
    }
  }, [applyRoomResponse, joinCode, nickname]);

  const copyRoomCode = useCallback(async () => {
    if (!roomCode) return;
    await navigator.clipboard?.writeText(roomCode);
    setNetworkMessage("방 코드가 복사되었습니다.");
  }, [roomCode]);

  const startLocalGame = useCallback(() => {
    const nextPlayers = createLocalPlayers();
    setMode("local");
    setOnlineRoom(null);
    setRoomCode("");
    setPlayerId("local-player");
    playerPositionRef.current = { x: 0, z: 1.2 };
    pointerTargetRef.current = null;
    sabotageClockRef.current = 0;
    botWorkClockRef.current = 0;
    setLocalPlayers(nextPlayers);
    setLocalTasks(copyTasks());
    setLocalTimeLeft(GAME_SECONDS);
    setLocalLightsOut(false);
    setLocalResult(null);
    setLocalWrongVotes(0);
    setLocalStatus("playing");
    setActiveTaskId(null);
    setTaskProgress(0);
    setClearedTaskNotice(null);
    setMessage("역할이 배정되었습니다. 미션과 투표로 승리하세요.");
    setLocalChat([createLocalMessage("역할이 배정되었습니다. 가짜 연구원을 찾아내세요.")]);
  }, []);

  const startOnlineGame = useCallback(async () => {
    if (!roomCode || !playerId) return;
    try {
      await postOnline("start", { code: roomCode, playerId });
      setMessage("온라인 라운드가 시작되었습니다.");
    } catch (error) {
      setNetworkMessage(error instanceof Error ? error.message : "게임 시작 실패");
    }
  }, [playerId, postOnline, roomCode]);

  const restartOnlineGame = useCallback(async () => {
    if (!roomCode || !playerId) return;
    try {
      await postOnline("restart", { code: roomCode, playerId });
      playerPositionRef.current = { x: 0, z: 1.2 };
      setClearedTaskNotice(null);
      setMessage("온라인 로비로 돌아왔습니다.");
    } catch (error) {
      setNetworkMessage(error instanceof Error ? error.message : "재시작 실패");
    }
  }, [playerId, postOnline, roomCode]);

  const openTutorialChoice = useCallback((nextMode: Mode) => {
    setPendingStartMode(nextMode);
    setTutorialStep(0);
    setTutorialOpen(true);
  }, []);

  const closeTutorialChoice = useCallback(() => {
    setTutorialOpen(false);
    setPendingStartMode(null);
    setTutorialStep(0);
  }, []);

  const beginAfterTutorial = useCallback(() => {
    const nextMode = pendingStartMode ?? mode;

    setTutorialOpen(false);
    setPendingStartMode(null);
    setTutorialStep(0);

    if (nextMode === "online") {
      void startOnlineGame();
      return;
    }

    startLocalGame();
  }, [mode, pendingStartMode, startLocalGame, startOnlineGame]);

  const triggerSabotage = useCallback(async () => {
    if (status !== "playing" || lightsOut) return;
    if (mode === "online") {
      await postOnline("sabotage", { code: roomCode, playerId });
    } else {
      setLocalLightsOut(true);
      setLocalChat((current) => [...current, createLocalMessage("조명 해킹이 발생했습니다. 전기실에서 복구하세요.")]);
    }
    setMessage("조명 해킹 발생. 연구원 시야가 흔들립니다.");
  }, [lightsOut, mode, playerId, postOnline, roomCode, status]);

  const repairLights = useCallback(async () => {
    if (!lightsOut || !nearElectrical) return;
    if (mode === "online") {
      await postOnline("repair", { code: roomCode, playerId });
    } else {
      setLocalLightsOut(false);
      setLocalChat((current) => [...current, createLocalMessage("조명이 복구되었습니다.")]);
    }
    sabotageClockRef.current = 0;
    setMessage("조명을 복구했습니다.");
  }, [lightsOut, mode, nearElectrical, playerId, postOnline, roomCode]);

  const beginTask = useCallback(
    (task: Task) => {
      if (status !== "playing" || activeTaskId) return;
      setActiveTaskId(task.id);
      setTaskProgress(0);
      setClearedTaskNotice(null);
      setMessage(`${task.name} 진행 중... 콘솔 앞에 머무르세요.`);
    },
    [activeTaskId, status]
  );

  const callMeeting = useCallback(async () => {
    if (status !== "playing") return;
    setActiveTaskId(null);
    setTaskProgress(0);
    if (mode === "online") {
      await postOnline("meeting", { code: roomCode, playerId });
    } else {
      setLocalStatus("meeting");
      setLocalPlayers((current) => current.map((player) => ({ ...player, hasVoted: false })));
      setLocalChat((current) => [...current, createLocalMessage("긴급 회의가 호출되었습니다.")]);
    }
    setMessage("긴급 회의입니다. 채팅으로 의심 정황을 공유하세요.");
  }, [mode, playerId, postOnline, roomCode, status]);

  const castVote = useCallback(
    async (targetId: string) => {
      if (status !== "meeting") return;

      if (mode === "online") {
        await postOnline("vote", { code: roomCode, playerId, targetId });
        setMessage("투표했습니다. 다른 플레이어의 투표를 기다리는 중입니다.");
        return;
      }

      const alivePlayers = localPlayers.filter((player) => player.isAlive);
      const botVotes = alivePlayers
        .filter((player) => player.isBot)
        .map((bot) => {
          const candidates = alivePlayers.filter((candidate) => candidate.id !== bot.id);
          const choice = candidates[Math.floor(Math.random() * candidates.length)];
          return { voter: bot.id, targetId: choice.id };
        });
      const votes = [{ voter: "local-player", targetId }, ...botVotes];
      const counts = votes.reduce<Record<string, number>>((acc, vote) => {
        acc[vote.targetId] = (acc[vote.targetId] ?? 0) + 1;
        return acc;
      }, {});
      const [winnerId, topVotes] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? ["skip", 0];
      const tied = Object.values(counts).filter((count) => count === topVotes).length > 1;

      if (winnerId === "skip" || tied) {
        setLocalStatus("playing");
        setLocalChat((current) => [...current, createLocalMessage("동표 또는 스킵으로 추방자가 없습니다.")]);
        setMessage("추방자가 없습니다. 다시 연구소로 돌아갑니다.");
        return;
      }

      const exiled = localPlayers.find((player) => player.id === winnerId);
      if (!exiled) return;

      setLocalPlayers((current) =>
        current.map((player) => (player.id === exiled.id ? { ...player, isAlive: false } : player))
      );

      if (exiled.role === "fakeResearcher") {
        finishLocalGame("researchersWin", `${exiled.name} 추방 성공. 연구원 팀 승리!`);
        return;
      }

      const nextWrongVotes = localWrongVotes + 1;
      setLocalWrongVotes(nextWrongVotes);
      if (nextWrongVotes >= 2) {
        finishLocalGame("impostorWins", "오추방이 누적되었습니다. 가짜 연구원 승리.");
        return;
      }

      setLocalStatus("playing");
      setLocalChat((current) => [...current, createLocalMessage(`${exiled.name}은 연구원이었습니다.`)]);
      setMessage(`${exiled.name}은 연구원이었습니다. 남은 기회가 많지 않습니다.`);
    },
    [finishLocalGame, localPlayers, localWrongVotes, mode, playerId, postOnline, roomCode, status]
  );

  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");

    if (mode === "online") {
      await postOnline("chat", { code: roomCode, playerId, text });
      return;
    }

    setLocalChat((current) => [
      ...current,
      createLocalMessage(text, currentPlayer?.name ?? nickname, currentPlayer?.color ?? "#ef4444")
    ]);
  }, [chatInput, currentPlayer?.color, currentPlayer?.name, mode, nickname, playerId, postOnline, roomCode]);

  useEffect(() => {
    modeRef.current = mode;
    playerIdRef.current = playerId;
    statusRef.current = status;
    playersRef.current = displayPlayers;
    tasksRef.current = tasks;
    lightsOutRef.current = lightsOut;
  }, [displayPlayers, lightsOut, mode, playerId, status, tasks]);

  useEffect(() => {
    if (lastStatusRef.current !== "playing" && status === "playing") {
      setRoleDialogOpen(true);
    }
    lastStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (mode !== "online" || !roomCode || !playerId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const params = new URLSearchParams({ code: roomCode, playerId });
        const response = await fetch(`/api/game/room?${params.toString()}`);
        const data = (await response.json()) as { room?: GameRoomSnapshot; error?: string };
        if (!cancelled && response.ok && data.room) setOnlineRoom(data.room);
      } catch {
        if (!cancelled) setNetworkMessage("온라인 동기화가 잠시 지연되고 있습니다.");
      }
    };

    poll();
    const interval = window.setInterval(poll, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [mode, playerId, roomCode]);

  useEffect(() => {
    if (mode !== "online" || !roomCode || !playerId) return;
    const interval = window.setInterval(() => {
      if (statusRef.current === "meeting" || statusRef.current === "result") return;
      void roomRequest("sync", { code: roomCode, playerId, position: playerPositionRef.current }).then(applyRoomResponse).catch(() => {
        setNetworkMessage("위치 동기화 실패. 곧 다시 시도합니다.");
      });
    }, SYNC_MS);
    return () => window.clearInterval(interval);
  }, [applyRoomResponse, mode, playerId, roomCode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      keysRef.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const setPointerTarget = (event: PointerEvent) => {
      if (!cameraRef.current || !mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
      raycaster.setFromCamera(pointer, cameraRef.current);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hit)) {
        pointerTargetRef.current = clampPosition({ x: hit.x, z: hit.z });
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      dragRef.current = { active: true, x: event.clientX, y: event.clientY, moved: false };
      mount.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = event.clientX - dragRef.current.x;
      const dy = event.clientY - dragRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) dragRef.current.moved = true;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;
      if (dragRef.current.moved) cameraYawRef.current += dx * 0.006;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragRef.current.moved) setPointerTarget(event);
      dragRef.current.active = false;
      if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraDistanceRef.current = THREE.MathUtils.clamp(cameraDistanceRef.current + event.deltaY * 0.012, 5.4, 14.5);
      setCameraZoom(Math.round(((14.5 - cameraDistanceRef.current) / 9.1) * 100));
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x102030);
    scene.fog = new THREE.Fog(0x102030, 18, 48);
    sceneRef.current = scene;
    const robots = robotRefs.current;
    const consoles = consoleRefs.current;

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 7.4, 9.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x102030, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight(0xe0f2fe, 0.86);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.35);
    keyLight.position.set(5, 13, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const redWarning = new THREE.PointLight(0xff2418, 0, 18);
    redWarning.position.set(0, 4.8, 0);
    scene.add(redWarning);

    const coreLight = new THREE.PointLight(0x22d3ee, 1.7, 22);
    coreLight.position.set(0, 3.2, 7.8);
    scene.add(coreLight);

    [
      [-8.5, 2.4, -6.5],
      [8.5, 2.4, -6.5],
      [0, 2.4, 0],
      [0, 2.4, 7.8],
      [-10, 2.4, 4.5],
      [9.5, 2.4, 4.8]
    ].forEach(([x, y, z]) => {
      const roomLight = new THREE.PointLight(0xf8fafc, 0.92, 7.2);
      roomLight.position.set(x, y, z);
      scene.add(roomLight);
    });

    addCorridor(scene, 0, 0, 25, 2.2);
    addCorridor(scene, 0, -6.5, 19, 2.1);
    addCorridor(scene, 0, 5.4, 22, 2.1);
    addCorridor(scene, 0, 0, 2.2, 24);
    rooms.forEach((roomItem) => addRoom(scene, roomItem));
    defaultTasks.forEach((task, index) => {
      const colors = [0x22c55e, 0xfacc15, 0xef4444, 0x38bdf8, 0x34d399];
      consoles.set(task.id, addConsole(scene, task, colors[index] ?? 0x22c55e));
    });
    addDecor(scene);

    const meetingButton = new THREE.Group();
    const buttonBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 1.02, 0.24, 48),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.38, metalness: 0.62 })
    );
    buttonBase.position.y = 0.13;
    meetingButton.add(buttonBase);
    const buttonTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.28, 48),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x7f1d1d,
        emissiveIntensity: 1.35
      })
    );
    buttonTop.position.y = 0.39;
    meetingButton.add(buttonTop);
    scene.add(meetingButton);

    const syncRobotMeshes = (currentPlayers: Player[]) => {
      const ids = new Set(currentPlayers.map((player) => player.id));
      currentPlayers.forEach((player) => {
        if (robots.has(player.id)) return;
        const robot = createRobot(player.color);
        robot.position.set(player.position.x, 0, player.position.z);
        robots.set(player.id, robot);
        scene.add(robot);
      });
      robots.forEach((robot, id) => {
        if (ids.has(id)) return;
        scene.remove(robot);
        robots.delete(id);
      });
    };

    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    let frameId = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.035);
      last = now;

      const currentStatus = statusRef.current;
      const currentPlayers = playersRef.current;
      const currentTasks = tasksRef.current;
      const currentLightsOut = lightsOutRef.current;
      const currentPlayerId = playerIdRef.current;
      const canMove = currentStatus === "playing" || currentStatus === "lobby";
      const me = currentPlayers.find((player) => player.id === currentPlayerId);

      syncRobotMeshes(currentPlayers);

      if (canMove && me?.isAlive) {
        const input = new THREE.Vector3();
        if (keysRef.current.has("KeyW") || keysRef.current.has("ArrowUp")) input.z -= 1;
        if (keysRef.current.has("KeyS") || keysRef.current.has("ArrowDown")) input.z += 1;
        if (keysRef.current.has("KeyA") || keysRef.current.has("ArrowLeft")) input.x -= 1;
        if (keysRef.current.has("KeyD") || keysRef.current.has("ArrowRight")) input.x += 1;

        if (input.lengthSq() > 0) {
          pointerTargetRef.current = null;
          input.normalize();
          const yaw = cameraYawRef.current;
          const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
          const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
          const movement = forward.multiplyScalar(-input.z).add(right.multiplyScalar(input.x));
          movement.normalize().multiplyScalar(MOVE_SPEED * delta);
          playerPositionRef.current = clampPosition({
            x: playerPositionRef.current.x + movement.x,
            z: playerPositionRef.current.z + movement.z
          });
        } else if (pointerTargetRef.current) {
          const target = pointerTargetRef.current;
          const dx = target.x - playerPositionRef.current.x;
          const dz = target.z - playerPositionRef.current.z;
          const length = Math.hypot(dx, dz);
          if (length < 0.18) {
            pointerTargetRef.current = null;
          } else {
            const step = Math.min(length, MOVE_SPEED * delta);
            playerPositionRef.current = clampPosition({
              x: playerPositionRef.current.x + (dx / length) * step,
              z: playerPositionRef.current.z + (dz / length) * step
            });
          }
        }
      }

      currentPlayers.forEach((player) => {
        const robot = robots.get(player.id);
        if (!robot) return;

        let position = player.id === currentPlayerId ? playerPositionRef.current : player.position;
        if (modeRef.current === "local" && currentStatus === "playing" && player.isBot && player.isAlive) {
          const availableTasks = currentTasks.filter((task) => !task.completed);
          const target =
            botTargetsRef.current.get(player.id) ??
            availableTasks[Math.floor(Math.random() * Math.max(availableTasks.length, 1))]?.position ??
            { x: 0, z: 0 };
          botTargetsRef.current.set(player.id, target);
          const direction = { x: target.x - player.position.x, z: target.z - player.position.z };
          const length = Math.hypot(direction.x, direction.z);
          if (length < 0.35) {
            botTargetsRef.current.set(
              player.id,
              availableTasks[Math.floor(Math.random() * Math.max(availableTasks.length, 1))]?.position ?? { x: 0, z: 0 }
            );
          } else {
            position = {
              x: player.position.x + (direction.x / length) * delta * 1.55,
              z: player.position.z + (direction.z / length) * delta * 1.55
            };
            player.position = position;
          }
        }

        robot.visible = player.isAlive;
        robot.position.x += (position.x - robot.position.x) * 0.2;
        robot.position.z += (position.z - robot.position.z) * 0.2;
        robot.rotation.y = Math.sin(now * 0.0015 + player.name.length) * 0.14;
        robot.position.y = Math.sin(now * 0.006 + player.id.length) * 0.035;
      });

      consoles.forEach((consoleGroup, id) => {
        const task = currentTasks.find((item) => item.id === id);
        consoleGroup.visible = !task?.completed;
      });

      if (cameraRef.current) {
        const target = new THREE.Vector3(playerPositionRef.current.x, 1.05, playerPositionRef.current.z);
        const yaw = cameraYawRef.current;
        const distance = cameraDistanceRef.current;
        const desired = new THREE.Vector3(
          target.x + Math.sin(yaw) * distance,
          4.6 + distance * 0.33,
          target.z + Math.cos(yaw) * distance
        );
        cameraRef.current.position.lerp(desired, 0.08);
        cameraRef.current.lookAt(target);
      }

      ambient.intensity = currentLightsOut ? 0.28 : 0.86;
      hemiLight.intensity = currentLightsOut ? 0.34 : 1.1;
      keyLight.intensity = currentLightsOut ? 0.72 : 2.35;
      redWarning.intensity = currentLightsOut ? 4.2 : 0;
      coreLight.intensity = currentLightsOut ? 0.72 : 1.7;

      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      robots.clear();
      consoles.clear();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUiPulse((current) => current + 1);
      if (modeRef.current === "local") {
        setLocalPlayers((current) =>
          current.map((player) => {
            const livePlayer = playersRef.current.find((item) => item.id === player.id) ?? player;
            return player.id === "local-player"
              ? { ...player, position: { ...playerPositionRef.current } }
              : { ...player, position: { ...livePlayer.position } };
          })
        );
      }
    }, 180);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mode !== "local" || localStatus !== "playing") return;
    const interval = window.setInterval(() => {
      setLocalTimeLeft((current) => {
        if (current <= 1) {
          finishLocalGame("impostorWins", "시간 종료. 가짜 연구원이 복구를 막았습니다.");
          return 0;
        }
        return current - 1;
      });
      sabotageClockRef.current += 1;
      botWorkClockRef.current += 1;
      const fakeBotAlive = playersRef.current.some(
        (player) => player.isBot && player.role === "fakeResearcher" && player.isAlive
      );
      if (fakeBotAlive && !lightsOutRef.current && sabotageClockRef.current > 36) {
        setLocalLightsOut(true);
        setMessage("조명 해킹 발생. 전기실에서 복구하세요.");
        setLocalChat((current) => [...current, createLocalMessage("조명 해킹이 발생했습니다.")]);
      }
      if (!lightsOutRef.current && botWorkClockRef.current >= 24) {
        botWorkClockRef.current = 0;
        const hasResearchBot = playersRef.current.some(
          (player) => player.isBot && player.role === "researcher" && player.isAlive
        );
        const nextBotTask = tasksRef.current.find((task) => !task.completed);
        if (hasResearchBot && nextBotTask) {
          setLocalTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === nextBotTask.id ? { ...task, completed: true, completedBy: "bot" } : task
            )
          );
          setLocalChat((current) => [...current, createLocalMessage(`AI 봇이 ${nextBotTask.name} 완료.`)]);
        }
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [finishLocalGame, localStatus, mode]);

  useEffect(() => {
    if (!activeTaskId || status !== "playing") return;
    const task = tasks.find((item) => item.id === activeTaskId);
    if (!task) return;

    const interval = window.setInterval(() => {
      if (distance2D(playerPositionRef.current, task.position) > INTERACTION_RANGE + 0.45) {
        setActiveTaskId(null);
        setTaskProgress(0);
        setMessage("콘솔에서 멀어져 미션이 중단되었습니다.");
        return;
      }

      setTaskProgress((current) => {
        const next = Math.min(current + 0.2, task.duration);
        if (next >= task.duration) {
          const isResearcherTaskClear = userRole !== "fakeResearcher";
          setActiveTaskId(null);
          setTaskProgress(0);
          setMessage(isResearcherTaskClear ? `${task.name} 완료.` : `${task.name} 근처에서 작업하는 척했습니다.`);
          if (mode === "online") {
            void postOnline("completeTask", { code: roomCode, playerId, taskId: task.id }).then((data) => {
              const completedTask = data.room?.tasks.find((item) => item.id === task.id && item.completed);
              if (completedTask) {
                setClearedTaskNotice({ id: completedTask.id, name: completedTask.name, room: completedTask.room });
              }
            });
          } else if (userRole === "fakeResearcher") {
            setLocalChat((chat) => [...chat, createLocalMessage(`${currentPlayer?.name ?? "Player"}님이 미션 콘솔 근처에 머물렀습니다.`)]);
          } else {
            setLocalTasks((currentTasks) =>
              currentTasks.map((item) =>
                item.id === task.id ? { ...item, completed: true, completedBy: playerId } : item
              )
            );
            setClearedTaskNotice({ id: task.id, name: task.name, room: task.room });
            setLocalChat((chat) => [...chat, createLocalMessage(`${task.name} 완료.`)]);
          }
          return 0;
        }
        return next;
      });
    }, 200);

    return () => window.clearInterval(interval);
  }, [activeTaskId, currentPlayer?.name, mode, playerId, postOnline, roomCode, status, tasks, userRole]);

  useEffect(() => {
    if (mode === "local" && localStatus === "playing" && localTasks.every((task) => task.completed)) {
      finishLocalGame("researchersWin", "모든 미션 완료. 연구원 팀 승리!");
    }
  }, [finishLocalGame, localStatus, localTasks, mode]);

  useEffect(() => {
    if (!clearedTaskNotice) return;

    const timeout = window.setTimeout(() => setClearedTaskNotice(null), 2400);

    return () => window.clearTimeout(timeout);
  }, [clearedTaskNotice]);

  const taskProgressPercent = activeTaskId
    ? Math.round((taskProgress / (tasks.find((task) => task.id === activeTaskId)?.duration ?? 1)) * 100)
    : 0;
  const readableTime = formatTime(timeLeft);
  const roleTitle = userRole === "fakeResearcher" ? "가짜 연구원" : "연구원";
  const roleDescription =
    userRole === "fakeResearcher"
      ? "미션을 방해하고 조명 해킹으로 혼란을 만든 뒤, 회의에서 정체를 숨기세요."
      : "미션을 완료하고 채팅과 투표로 가짜 연구원을 찾아내세요.";
  const canStartOnline = mode === "online" && isHost && status === "lobby" && displayPlayers.length >= 2;
  const currentTutorialStep = tutorialSteps[tutorialStep];
  const isLastTutorialStep = tutorialStep === tutorialSteps.length - 1;

  return (
    <main className={lightsOut ? "game-shell game-shell--danger" : "game-shell"}>
      <div ref={mountRef} className="game-canvas" aria-label="AI LAB 3D game scene" />

      <div className="station-map" aria-hidden="true">
        <div className="station-grid" />
        <div className="station-room room-lobby">LOBBY</div>
        <div className="station-room room-server">SERVER</div>
        <div className="station-room room-electrical">ELECTRICAL</div>
        <div className="station-room room-core">AI CORE</div>
        <div className="station-room room-security">SECURITY</div>
        <div className="station-room room-cafeteria">CAFETERIA</div>
        <div className="station-room room-medbay">MEDBAY</div>
        <div className="station-corridor corridor-main" />
        <div className="station-corridor corridor-spine" />
        <div className="station-button" />
        {tasks.map((task) => (
          <span
            key={task.id}
            className={task.completed ? "task-dot task-dot--done" : "task-dot"}
            style={
              {
                "--map-x": `${((task.position.x + WORLD_X) / (WORLD_X * 2)) * 100}%`,
                "--map-y": `${((task.position.z - WORLD_Z_MIN) / (WORLD_Z_MAX - WORLD_Z_MIN)) * 100}%`
              } as CSSProperties
            }
          />
        ))}
        {displayPlayers.map((player) => (
          <span
            key={player.id}
            className={player.isAlive ? "map-robot" : "map-robot map-robot--out"}
            style={
              {
                "--robot-color": player.color,
                "--map-x": `${((player.position.x + WORLD_X) / (WORLD_X * 2)) * 100}%`,
                "--map-y": `${((player.position.z - WORLD_Z_MIN) / (WORLD_Z_MAX - WORLD_Z_MIN)) * 100}%`
              } as CSSProperties
            }
          />
        ))}
      </div>

      <section className="hud hud-top">
        <div className="brand-block">
          <span className="brand-icon">
            <Bot size={20} />
          </span>
          <div>
            <p>AI LAB</p>
            <h1>가짜 연구원</h1>
          </div>
        </div>
        <div className="status-strip">
          <span>남은 시간 : {readableTime}</span>
          <span>미션 : {completedTasks} / {tasks.length}</span>
          <span>오추방 : {wrongVotes} / 2</span>
          <span>현재 위치 : {currentLocation}</span>
          <span className={lightsOut ? "danger-text" : ""}>상태 : {lightsOut ? "조명 해킹" : "정상"}</span>
        </div>
      </section>

      <section className="hud hud-left">
        <div className="panel room-panel">
          <p className="eyebrow">ROOM CODE</p>
          <div className="room-code-row">
            <strong>{roomCode || "LOCAL"}</strong>
            {roomCode && (
              <button className="icon-action" onClick={copyRoomCode} aria-label="방 코드 복사">
                <Copy size={17} />
              </button>
            )}
          </div>
          <span className="online-indicator">
            <Wifi size={14} />
            {mode === "online" ? "온라인 서버 연결" : "로컬 + AI 봇"}
          </span>
        </div>

        <div className="panel players-panel">
          <div className="panel-title">
            <Users size={16} />
            PLAYERS {displayPlayers.length}/6
          </div>
          {displayPlayers.map((player) => (
            <div key={player.id} className="player-row">
              <span className="player-color" style={{ background: player.color }} />
              <span>{player.name}</span>
              {player.id === hostId && <small>HOST</small>}
              <em>{player.isAlive ? (player.hasVoted ? "Voted" : "Ready") : "Out"}</em>
            </div>
          ))}
        </div>

        <div className="panel tasks-panel">
          <div className="panel-title">
            <Cpu size={16} />
            TOTAL TASKS
          </div>
          <div className="task-bars" aria-label={`task progress ${progressPercent}%`}>
            {tasks.map((task) => (
              <span key={task.id} className={task.completed ? "filled" : ""} />
            ))}
          </div>
          {tasks.map((task) => (
            <div key={task.id} className={task.completed ? "mission-row mission-row--complete" : "mission-row"}>
              <CheckCircle2 size={15} className={task.completed ? "complete" : ""} />
              <span>{task.name}</span>
              <small className={task.completed ? "mission-status mission-status--complete" : "mission-status"}>
                {task.completed ? "클리어" : task.room}
              </small>
            </div>
          ))}
        </div>
      </section>

      <section className="hud hud-right">
        <div className="panel online-panel">
          <div className="panel-title">
            <RadioTower size={16} />
            ONLINE
          </div>
          <input
            className="game-input"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            maxLength={16}
            placeholder="닉네임"
          />
          <div className="online-actions">
            <button className="secondary-action" onClick={createOnlineRoom}>
              방 만들기
            </button>
            <input
              className="game-input"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder="코드 입력"
              maxLength={6}
            />
            <button className="secondary-action" onClick={joinOnlineRoom}>
              입장
            </button>
          </div>
          <p className="tiny-copy">{networkMessage}</p>
        </div>

        <div className="panel action-panel">
          {status === "lobby" && (
            <>
              <button className="primary-action" onClick={() => openTutorialChoice("local")}>
                <Play size={17} />
                로컬 시작
              </button>
              {mode === "online" && (
                <button className="primary-action" disabled={!canStartOnline} onClick={() => openTutorialChoice("online")}>
                  <Play size={17} />
                  온라인 시작
                </button>
              )}
            </>
          )}
          {status === "playing" && nearbyTask && (
            <button className="primary-action" disabled={!!activeTaskId} onClick={() => beginTask(nearbyTask)}>
              <Cpu size={17} />
              {nearbyTask.name}
            </button>
          )}
          {status === "playing" && userRole === "fakeResearcher" && (
            <button className="danger-action" disabled={lightsOut} onClick={triggerSabotage}>
              <Lightbulb size={17} />
              조명 해킹
            </button>
          )}
          {status === "playing" && lightsOut && (
            <button className="primary-action" disabled={!nearElectrical} onClick={repairLights}>
              <ShieldAlert size={17} />
              조명 복구
            </button>
          )}
          {status === "playing" && (
            <button className="secondary-action" onClick={callMeeting}>
              <Siren size={17} />
              긴급 회의
            </button>
          )}
          {status === "result" && (
            <button className="primary-action" onClick={mode === "online" ? restartOnlineGame : resetLocalGame}>
              <RotateCcw size={17} />
              로비로 이동
            </button>
          )}
          <div className="camera-readout">
            <MousePointer2 size={15} />
            클릭 이동 · 휠 줌 {cameraZoom}%
          </div>
        </div>

        <div className={lightsOut ? "panel sabotage-panel is-active" : "panel sabotage-panel"}>
          <div className="panel-title">
            <AlertTriangle size={16} />
            SABOTAGE INFO
          </div>
          <strong>{lightsOut ? "LIGHTS OFFLINE" : "NO ACTIVE SABOTAGE"}</strong>
          <p>{lightsOut ? "전기실 콘솔에서 조명을 복구해야 합니다." : "가짜 연구원은 조명 해킹으로 시야를 흔들 수 있습니다."}</p>
        </div>
      </section>

      <section className="chat-dock">
        <div className="chat-log">
          {chatMessages.slice(-5).map((chat) => (
            <p key={chat.id}>
              <strong style={{ color: chat.color }}>{chat.playerName}:</strong> {chat.text}
            </p>
          ))}
        </div>
        <div className="chat-input-row">
          <MessageCircle size={17} />
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") void sendChat();
            }}
            maxLength={160}
            placeholder="가짜를 맞추기 위한 채팅..."
          />
          <button className="icon-action" onClick={() => void sendChat()} aria-label="채팅 보내기">
            <Send size={16} />
          </button>
        </div>
      </section>

      {activeTaskId && (
        <div className="task-overlay">
          <p>미션 수행 중</p>
          <div className="progress-track">
            <span style={{ width: `${taskProgressPercent}%` }} />
          </div>
        </div>
      )}

      {clearedTaskNotice && status === "playing" && (
        <div className="mission-clear-toast" role="status">
          <CheckCircle2 size={20} />
          <div>
            <strong>미션 클리어</strong>
            <span>
              {clearedTaskNotice.name} 체크 완료 · {clearedTaskNotice.room}
            </span>
          </div>
        </div>
      )}

      {status === "meeting" && (
        <div className="modal-backdrop modal-backdrop--meeting">
          <section className="meeting-modal">
            <div className="meeting-head">
              <div className="modal-title">
                <Vote size={22} />
                <div>
                  <p>EMERGENCY MEETING</p>
                  <h2>누가 가짜 연구원인가요?</h2>
                </div>
              </div>
              <span>{meetingSecondsLeft}s</span>
            </div>
            <div className="vote-grid">
              {displayPlayers
                .filter((player) => player.isAlive)
                .map((player) => (
                  <button key={player.id} disabled={currentPlayer?.hasVoted} onClick={() => void castVote(player.id)}>
                    <span style={{ background: player.color }} />
                    {player.name}
                    {player.id === playerId ? " (나)" : ""}
                  </button>
                ))}
              <button disabled={currentPlayer?.hasVoted} onClick={() => void castVote("skip")}>
                <span />
                스킵
              </button>
            </div>
            <p className="meeting-copy">아래 채팅으로 위치, 미션, 수상한 행동을 공유한 뒤 투표하세요.</p>
          </section>
        </div>
      )}

      {tutorialOpen && status === "lobby" && (
        <div className="modal-backdrop">
          <section className="tutorial-modal">
            <div className="tutorial-head">
              <div>
                <p>튜토리얼 선택</p>
                <h2>시작 전에 튜토리얼을 볼까요?</h2>
              </div>
              <button className="icon-action tutorial-close" onClick={closeTutorialChoice} aria-label="튜토리얼 닫기">
                닫기
              </button>
            </div>

            <div className="tutorial-step-card">
              <span>{currentTutorialStep.tag}</span>
              <h3>{currentTutorialStep.title}</h3>
              <p>{currentTutorialStep.body}</p>
            </div>

            <div className="tutorial-dots" aria-label={`튜토리얼 ${tutorialStep + 1} / ${tutorialSteps.length}`}>
              {tutorialSteps.map((step, index) => (
                <span key={step.title} className={index === tutorialStep ? "is-active" : ""} />
              ))}
            </div>

            <div className="tutorial-actions">
              <button className="secondary-action" onClick={beginAfterTutorial}>
                바로 시작
              </button>
              {isLastTutorialStep ? (
                <button className="primary-action" onClick={beginAfterTutorial}>
                  튜토리얼 끝내고 시작
                </button>
              ) : (
                <button
                  className="primary-action"
                  onClick={() => setTutorialStep((step) => Math.min(step + 1, tutorialSteps.length - 1))}
                >
                  {tutorialStep === 0 ? "튜토리얼 보기" : "다음"}
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {roleDialogOpen && status === "playing" && (
        <div className="modal-backdrop">
          <section className={`role-modal ${userRole === "fakeResearcher" ? "role-modal--fake" : ""}`}>
            <p>YOUR ROLE</p>
            <h2>{roleTitle}</h2>
            <span>{roleDescription}</span>
            <button className="primary-action" onClick={() => setRoleDialogOpen(false)}>
              확인
            </button>
          </section>
        </div>
      )}

      {status === "result" && (
        <div className="modal-backdrop">
          <section className={`result-modal ${result === "impostorWins" ? "defeat" : "victory"}`}>
            <p>{result === "researchersWin" ? "VICTORY" : "DEFEAT"}</p>
            <h2>{result === "researchersWin" ? "연구원 팀 승리" : "가짜 연구원 승리"}</h2>
            <span>{message}</span>
            <button className="primary-action" onClick={mode === "online" ? restartOnlineGame : resetLocalGame}>
              <RotateCcw size={17} />
              다시 시작
            </button>
          </section>
        </div>
      )}

      <div className="help-strip">
        <span>클릭: 이동</span>
        <span>드래그: 카메라 회전</span>
        <span>마우스 휠: 화면 확대/축소</span>
        <span>WASD: 이동</span>
      </div>
    </main>
  );
}
