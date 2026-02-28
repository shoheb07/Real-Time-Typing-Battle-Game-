const socket = io();
let startTime;
let roomCode;

function joinRoom() {
  const username = document.getElementById("username").value;
  roomCode = document.getElementById("room").value;

  socket.emit("joinRoom", { username, room: roomCode });

  document.getElementById("joinSection").classList.add("hidden");
  document.getElementById("gameSection").classList.remove("hidden");
}

socket.on("startGame", (paragraph) => {
  document.getElementById("paragraph").innerText = paragraph;
  startTime = new Date();
});

function finishGame() {
  const text = document.getElementById("inputText").value;
  const time = (new Date() - startTime) / 1000;

  socket.emit("finishTyping", {
    room: roomCode,
    text,
    time
  });
}

socket.on("gameOver", (winner) => {
  document.getElementById("result").innerText =
    `Winner: ${winner.username} | WPM: ${winner.wpm}`;
});