import type { Task } from "@/lib/gameRoomTypes";

export const GAME_SECONDS = 300;

export const defaultTasks: Task[] = [
  {
    id: "server-restore",
    name: "서버 복구",
    room: "SERVER",
    position: { x: -8.5, z: -6.5 },
    duration: 4,
    completed: false
  },
  {
    id: "electrical-switch",
    name: "전기 배선",
    room: "ELECTRICAL",
    position: { x: 8.5, z: -6.5 },
    duration: 3,
    completed: false
  },
  {
    id: "ai-core-check",
    name: "AI 코어 안정화",
    room: "AI CORE",
    position: { x: 0, z: 7.8 },
    duration: 5,
    completed: false
  },
  {
    id: "security-scan",
    name: "보안 로그 스캔",
    room: "SECURITY",
    position: { x: -10, z: 4.5 },
    duration: 4,
    completed: false
  },
  {
    id: "sample-sort",
    name: "샘플 정리",
    room: "CAFETERIA",
    position: { x: 9.5, z: 4.8 },
    duration: 4,
    completed: false
  }
];
