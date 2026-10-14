const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname)));

let gameRoom = {
    players: [],
    gameStarted: false
};

io.on('connection', (socket) => {
    socket.on('join-game', (username) => {
        if (gameRoom.players.length < 2) {
            gameRoom.players.push({ id: socket.id, name: username });
            
            // Birinci giren şəxs oyunu başlada bilər
            if (gameRoom.players.length === 1) {
                socket.emit('set-host', true);
            } else {
                socket.emit('set-host', false);
                io.emit('ready-to-start', gameRoom.players);
            }
        } else {
            socket.emit('room-full');
        }
    });

    socket.on('start-game-signal', () => {
        io.emit('game-started');
    });

    socket.on('disconnect', () => {
        gameRoom.players = gameRoom.players.filter(p => p.id !== socket.id);
        gameRoom.gameStarted = false;
        io.emit('player-disconnected', gameRoom.players);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server işləyir: port ${PORT}`);
});
