const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const paragraphs = [
  "JavaScript is a powerful programming language.",
  "Real time applications use WebSockets.",
  "Typing speed improves with daily practice.",
  "Socket IO enables multiplayer functionality."
];

function calculateWPM(text, timeInSeconds) {
  const words = text.trim().split(" ").length;
  return Math.round((words / timeInSeconds) * 60);
}

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        paragraph: paragraphs[Math.floor(Math.random() * paragraphs.length)],
        started: false
      };
    }

    rooms[room].players.push({
      id: socket.id,
      username,
      wpm: 0,
      finished: false
    });

    io.to(room).emit("roomData", rooms[room]);

    if (rooms[room].players.length >= 2 && !rooms[room].started) {
      rooms[room].started = true;
      io.to(room).emit("startGame", rooms[room].paragraph);
    }
  });

  socket.on("finishTyping", ({ room, text, time }) => {
    const player = rooms[room].players.find(p => p.id === socket.id);
    player.wpm = calculateWPM(text, time);
    player.finished = true;

    if (rooms[room].players.every(p => p.finished)) {
      const winner = rooms[room].players.reduce((a, b) => 
        a.wpm > b.wpm ? a : b
      );
      io.to(room).emit("gameOver", winner);
      rooms[room].started = false;
    }
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room].players = rooms[room].players.filter(
        p => p.id !== socket.id
      );
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});