import { NextRequest, NextResponse } from "next/server";
import {
  createPlayer,
  createRoom,
  getRooms,
  publicRoom,
  resolveVotes,
  restartRoom,
  startRoom,
  systemMessage,
  touchRoom,
  updateRoomOutcome
} from "@/lib/gameRoomStore";

const MAX_PLAYERS = 6;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function getRoomOrResponse(code: string | null) {
  if (!code) return { error: json({ error: "room code required" }, 400) };
  const room = getRooms().get(code.toUpperCase());
  if (!room) return { error: json({ error: "room not found" }, 404) };
  updateRoomOutcome(room);
  return { room };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const playerId = request.nextUrl.searchParams.get("playerId") ?? undefined;
  const { room, error } = getRoomOrResponse(code);
  if (error) return error;

  if (playerId) {
    const player = room.players.find((item) => item.id === playerId);
    if (player) player.lastSeen = Date.now();
  }

  return json({ room: publicRoom(room, playerId) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");

  if (action === "create") {
    const { room, playerId } = createRoom(String(body.name ?? "Player"));
    return json({ room: publicRoom(room, playerId), playerId });
  }

  if (action === "join") {
    const code = String(body.code ?? "").toUpperCase();
    const { room, error } = getRoomOrResponse(code);
    if (error) return error;
    if (room.status !== "lobby") return json({ error: "game already started" }, 409);
    if (room.players.length >= MAX_PLAYERS) return json({ error: "room is full" }, 409);

    const player = createPlayer(String(body.name ?? "Player"), room.players.length);
    room.players.push(player);
    room.chat.push(systemMessage(`${player.name}님이 입장했습니다.`));
    touchRoom(room);
    return json({ room: publicRoom(room, player.id), playerId: player.id });
  }

  const code = String(body.code ?? "").toUpperCase();
  const playerId = String(body.playerId ?? "");
  const { room, error } = getRoomOrResponse(code);
  if (error) return error;
  const player = room.players.find((item) => item.id === playerId);
  if (!player) return json({ error: "player not found" }, 404);
  player.lastSeen = Date.now();

  if (action === "sync") {
    if (body.position && typeof body.position.x === "number" && typeof body.position.z === "number") {
      player.position = {
        x: Math.max(-13, Math.min(13, body.position.x)),
        z: Math.max(-12, Math.min(13, body.position.z))
      };
    }
    touchRoom(room);
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "start") {
    if (room.hostId !== playerId) return json({ error: "host only" }, 403);
    if (room.players.length < 2) return json({ error: "need at least 2 players" }, 409);
    startRoom(room);
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "restart") {
    if (room.hostId !== playerId) return json({ error: "host only" }, 403);
    restartRoom(room);
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "completeTask") {
    const task = room.tasks.find((item) => item.id === String(body.taskId));
    if (room.status !== "playing" || !task || task.completed) return json({ room: publicRoom(room, playerId) });
    if (player.role === "fakeResearcher") {
      room.chat.push(systemMessage(`${player.name}님이 미션 콘솔 근처에 머물렀습니다.`));
    } else {
      task.completed = true;
      task.completedBy = playerId;
      room.chat.push(systemMessage(`${player.name}님이 ${task.name} 완료.`));
    }
    updateRoomOutcome(room);
    touchRoom(room);
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "sabotage") {
    if (room.status === "playing" && player.role === "fakeResearcher" && !room.lightsOut) {
      room.lightsOut = true;
      room.chat.push(systemMessage("조명 해킹이 발생했습니다. 전기실에서 복구하세요."));
      touchRoom(room);
    }
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "repair") {
    if (room.status === "playing" && room.lightsOut) {
      room.lightsOut = false;
      room.chat.push(systemMessage(`${player.name}님이 조명을 복구했습니다.`));
      touchRoom(room);
    }
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "meeting") {
    if (room.status === "playing") {
      room.status = "meeting";
      room.meetingStartedAt = Date.now();
      room.votes = {};
      room.players = room.players.map((item) => ({ ...item, hasVoted: false }));
      room.chat.push(systemMessage(`${player.name}님이 긴급 회의를 호출했습니다.`));
      touchRoom(room);
    }
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "vote") {
    if (room.status === "meeting") {
      const targetId = String(body.targetId ?? "skip");
      room.votes[playerId] = targetId;
      room.players = room.players.map((item) =>
        item.id === playerId ? { ...item, hasVoted: true } : item
      );
      room.chat.push(systemMessage(`${player.name}님이 투표했습니다.`));
      resolveVotes(room);
      touchRoom(room);
    }
    return json({ room: publicRoom(room, playerId) });
  }

  if (action === "chat") {
    const text = String(body.text ?? "").trim().slice(0, 160);
    if (text) {
      room.chat.push({
        id: crypto.randomUUID(),
        playerId,
        playerName: player.name,
        color: player.color,
        text,
        createdAt: Date.now()
      });
      touchRoom(room);
    }
    return json({ room: publicRoom(room, playerId) });
  }

  return json({ error: "unknown action" }, 400);
}
