const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  }
});

function makeRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    }});

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        service: "fourbarg-online",
        status: "ready",
        stage: "room-server-foundation",
        multiplayer: "websocket",
        note: "Room creation and lobby transport are implemented; card-game rules are not yet enabled."
      });
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
      const roomCode = makeRoomCode();
      const id = env.ROOMS.idFromName(roomCode);
      const stub = env.ROOMS.get(id);
      const response = await stub.fetch("https://room.internal/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomCode, roomName: typeof body.roomName === "string" ? body.roomName.slice(0, 40) : "اتاق چهاربرگ" })
      });
      if (!response.ok) return json({ error: "Could not create room" }, 500);
      return json({ roomCode, websocketPath: `/room/${roomCode}`, maxPlayers: 4 }, 201);
    }

    const roomMatch = url.pathname.match(/^\/room\/([A-HJ-NP-Z2-9]{6})$/);
    if (roomMatch && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      const id = env.ROOMS.idFromName(roomMatch[1]);
      return env.ROOMS.get(id).fetch(request);
    }

    return json({ error: "Not found" }, 404);
  }
};

export class FourBargRoom {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = null;
    this.sockets = new Set();
  }

  async loadState() {
    if (!this.state) {
      this.state = await this.ctx.storage.get("room") || null;
    }
    return this.state;
  }

  async saveAndBroadcast() {
    await this.ctx.storage.put("room", this.state);
    const message = JSON.stringify({ type: "room_state", room: this.publicState() });
    for (const socket of this.sockets) {
      try { socket.send(message); } catch { this.sockets.delete(socket); }
    }
  }

  publicState() {
    if (!this.state) return null;
    return {
      roomCode: this.state.roomCode,
      roomName: this.state.roomName,
      status: this.state.status,
      maxPlayers: 4,
      players: this.state.players.map(({ id, name, connected, seat }) => ({ id, name, connected, seat }))
    };
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/create" && request.method === "POST") {
      if (await this.loadState()) return new Response("Already exists", { status: 409 });
      const data = await request.json();
      this.state = {
        roomCode: data.roomCode,
        roomName: data.roomName || "اتاق چهاربرگ",
        status: "waiting",
        players: [],
        createdAt: Date.now()
      };
      await this.ctx.storage.put("room", this.state);
      return new Response("created", { status: 201 });
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      if (url.pathname === "/state") {
        await this.loadState();
        return Response.json(this.publicState());
      }
      return new Response("WebSocket upgrade required", { status: 426 });
    }

    await this.loadState();
    if (!this.state) return new Response("Room not found", { status: 404 });
    if (this.state.status !== "waiting") return new Response("Room is not accepting players", { status: 409 });

    const name = (url.searchParams.get("name") || "بازیکن").trim().slice(0, 24) || "بازیکن";
    if (this.state.players.length >= 4) return new Response("Room is full", { status: 409 });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const player = {
      id: crypto.randomUUID(),
      name,
      connected: true,
      seat: this.state.players.length
    };
    this.state.players.push(player);
    this.sockets.add(server);
    server.accept();

    server.send(JSON.stringify({ type: "welcome", playerId: player.id, room: this.publicState() }));
    await this.saveAndBroadcast();

    server.addEventListener("message", async (event) => {
      if (typeof event.data !== "string" || event.data.length > 2048) {
        server.close(1009, "Message too large");
        return;
      }
      let message;
      try { message = JSON.parse(event.data); } catch {
        server.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }
      if (!message || typeof message.type !== "string") {
        server.send(JSON.stringify({ type: "error", error: "Invalid message" }));
        return;
      }
      // Only lobby chat is supported in this foundation. Card actions will be
      // added as server-validated commands, never accepted as client state.
      if (message.type === "ping") {
        server.send(JSON.stringify({ type: "pong", at: Date.now() }));
      } else {
        server.send(JSON.stringify({ type: "error", error: "Unsupported action at this stage" }));
      }
    });

    const removePlayer = async () => {
      this.sockets.delete(server);
      const index = this.state?.players.findIndex((p) => p.id === player.id) ?? -1;
      if (index >= 0) {
        this.state.players[index].connected = false;
        await this.saveAndBroadcast();
      }
    };
    server.addEventListener("close", removePlayer);
    server.addEventListener("error", removePlayer);

    return new Response(null, { status: 101, webSocket: client });
  }
}
