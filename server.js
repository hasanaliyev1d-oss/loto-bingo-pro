const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));
app.get("/health", (_req, res) => res.json({ ok: true, game: "Loto Bingo Pro" }));

const MAX_PLAYERS = 6;
const ROOM_PIN = "666";
const CARD_PRICE = 0; // Dostlarla pulsuz oynamaq üçün.
const room = {
  players: {},
  calledNumbers: [],
  gameStarted: false,
  interval: null,
  lastNumber: null,
  winner: null
};

function makeCard() {
  // 3x9 kart: hər sətirdə 5 rəqəm, ümumilikdə 15 rəqəm.
  // Sütun aralıqları: 1-9, 10-19, ... 80-90.
  const card = Array.from({ length: 3 }, () => Array(9).fill(null));
  const rowCounts = [0, 0, 0];
  const colCounts = Array(9).fill(0);

  // Hər sətirdə 5, hər sütunda ən çox 3 rəqəm olan 15 xana seç.
  const positions = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) positions.push({ r, c });
  }

  // Təsadüfi qarışdırıb etibarlı 15 xana seçməyə çalış.
  let chosen = null;
  for (let attempt = 0; attempt < 5000; attempt++) {
    const shuffled = positions.slice().sort(() => Math.random() - 0.5);
    const candidate = Array.from({ length: 3 }, () => Array(9).fill(false));
    const rc = [0, 0, 0], cc = Array(9).fill(0);
    let ok = true;
    for (const p of shuffled) {
      if (rc[p.r] < 5 && cc[p.c] < 3) {
        candidate[p.r][p.c] = true;
        rc[p.r]++; cc[p.c]++;
      }
      if (rc.every(n => n === 5)) break;
    }
    if (rc.every(n => n === 5) && cc.every(n => n >= 1 && n <= 3)) {
      chosen = candidate;
      break;
    }
  }
  // Həmişə işləyən ehtiyat variant: hər sətirdə 5 xana, sütun tutumları 1-3.
  if (!chosen) {
    chosen = Array.from({ length: 3 }, () => Array(9).fill(false));
    const cols = [0,1,2,3,4,5,6,7,8,0,2,4,6,8,1];
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 5; k++) chosen[r][cols[r*5+k]] = true;
    }
  }

  for (let c = 0; c < 9; c++) {
    const low = c === 0 ? 1 : c * 10;
    const high = c === 8 ? 90 : c * 10 + 9;
    const count = chosen.reduce((sum, row) => sum + (row[c] ? 1 : 0), 0);
    const nums = [];
    while (nums.length < count) {
      const n = Math.floor(Math.random() * (high - low + 1)) + low;
      if (!nums.includes(n)) nums.push(n);
    }
    nums.sort((a,b) => a-b);
    let i = 0;
    for (let r = 0; r < 3; r++) {
      if (chosen[r][c]) card[r][c] = nums[i++];
    }
  }
  return card;
}

function publicPlayers() {
  const result = {};
  for (const [id, p] of Object.entries(room.players)) {
    result[id] = {
      username: p.username,
      cardsCount: p.cards.length,
      ready: p.cards.length > 0
    };
  }
  return result;
}

function sendState() {
  io.emit("update_players", publicPlayers());
  io.emit("game_state", {
    gameStarted: room.gameStarted,
    calledNumbers: room.calledNumbers,
    lastNumber: room.lastNumber,
    winner: room.winner
  });
}

function stopGame() {
  if (room.interval) clearInterval(room.interval);
  room.interval = null;
  room.gameStarted = false;
}

function resetRound() {
  stopGame();
  room.calledNumbers = [];
  room.lastNumber = null;
  room.winner = null;
  for (const p of Object.values(room.players)) p.markedNumbers = [];
  sendState();
  io.emit("round_reset");
}

io.on("connection", (socket) => {
  console.log("Qoşuldu:", socket.id);

  socket.on("join_game", (payload = {}) => {
    const username = String(payload.username || "").trim().slice(0, 20);
    const pin = String(payload.pin || "").trim();

    if (!username) return socket.emit("error_msg", "Zəhmət olmasa adını yaz.");
    if (pin !== ROOM_PIN) return socket.emit("error_msg", "Şifrə yanlışdır. Şifrə 666-dır.");

    if (!room.players[socket.id] && Object.keys(room.players).length >= MAX_PLAYERS) {
      return socket.emit("error_msg", "Otaq doludur. Maksimum 6 nəfər oynaya bilər.");
    }
    if (room.gameStarted) return socket.emit("error_msg", "Oyun başlayıb. Növbəti raundu gözlə.");

    if (!room.players[socket.id]) {
      room.players[socket.id] = { username, cards: [], markedNumbers: [] };
    } else {
      room.players[socket.id].username = username;
    }

    socket.emit("joined_success", { username });
    socket.emit("my_cards", room.players[socket.id].cards);
    socket.emit("game_state", {
      gameStarted: room.gameStarted,
      calledNumbers: room.calledNumbers,
      lastNumber: room.lastNumber,
      winner: room.winner
    });
    sendState();
  });

  socket.on("get_card", () => {
    const p = room.players[socket.id];
    if (!p) return socket.emit("error_msg", "Əvvəlcə oyuna qoşul.");
    if (room.gameStarted) return socket.emit("error_msg", "Oyun gedərkən kart almaq olmaz.");
    if (p.cards.length >= 3) return socket.emit("error_msg", "Bir oyunçu maksimum 3 kart ala bilər.");
    p.cards.push(makeCard());
    p.markedNumbers = [];
    socket.emit("my_cards", p.cards);
    sendState();
  });

  socket.on("start_game", () => {
    if (!room.players[socket.id]) return socket.emit("error_msg", "Əvvəlcə oyuna qoşul.");
    if (room.gameStarted) return socket.emit("error_msg", "Oyun artıq başlayıb.");
    const players = Object.values(room.players);
    if (players.length < 1) return socket.emit("error_msg", "Oyunçu yoxdur.");
    if (players.some(p => p.cards.length === 0)) {
      return socket.emit("error_msg", "Hər oyunçu əvvəlcə ən azı bir kart götürməlidir.");
    }

    room.calledNumbers = [];
    room.lastNumber = null;
    room.winner = null;
    for (const p of players) p.markedNumbers = [];
    room.gameStarted = true;
    io.emit("game_started");
    sendState();

    room.interval = setInterval(() => {
      if (!room.gameStarted) return;
      if (room.calledNumbers.length >= 90) {
        stopGame();
        io.emit("info_msg", "Bütün rəqəmlər çıxdı, qalib olmadı. Yeni raund başlada bilərsiniz.");
        sendState();
        return;
      }

      let n;
      do { n = Math.floor(Math.random() * 90) + 1; }
      while (room.calledNumbers.includes(n));
      room.calledNumbers.push(n);
      room.lastNumber = n;

      // Rəqəmlər kartlarda avtomatik işarələnir.
      for (const p of Object.values(room.players)) {
        p.markedNumbers = room.calledNumbers.slice();
        const won = p.cards.some(card =>
          card.flat().filter(v => v !== null).every(v => p.markedNumbers.includes(v))
        );
        if (won) {
          room.winner = p.username;
          stopGame();
          io.emit("game_won", { winner: p.username, number: n });
          break;
        }
      }

      io.emit("number_called", { number: n, allCalled: room.calledNumbers });
      sendState();
    }, 2500);
  });

  socket.on("disconnect", () => {
    delete room.players[socket.id];
    console.log("Ayrıldı:", socket.id);
    if (Object.keys(room.players).length === 0) resetRound();
    else sendState();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Loto Bingo Pro serveri ${PORT} portunda işləyir.`);
});
