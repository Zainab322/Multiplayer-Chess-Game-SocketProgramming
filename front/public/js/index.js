let isSpectator = false;
let gameHasStarted = false;
var board = null;
var game = new Chess();
var $status = $("#status");
var $pgn = $("#pgn");
let gameOver = false;

// --- Timer Configuration ---
const MOVE_TIME_LIMIT = 60;
let timerInterval;
var $timer = $("#timer");

function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = MOVE_TIME_LIMIT;
  $timer.html(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    $timer.html(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      socket.emit('timeOut');
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  $timer.html('');
}

// --- Chessboard & Move Handling ---
function onDragStart(source, piece, position, orientation) {
  if (game.game_over() || !gameHasStarted || gameOver || isSpectator)
    return false;

  if (
    (playerColor === "black" && piece.search(/^w/) !== -1) ||
    (playerColor === "white" && piece.search(/^b/) !== -1)
  ) {
    return false;
  }

  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  let theMove = { from: source, to: target, promotion: "q" };
  var move = game.move(theMove);

  if (move === null) return "snapback";

  socket.emit("move", theMove);
  updateStatus();
}

socket.on("newMove", function (move) {
  game.move(move);
  board.position(game.fen());
  updateStatus();
});

function onSnapEnd() {
  board.position(game.fen());
}

// --- Status & PGN Update ---
function updateStatus() {
  var status = "";
  var moveColor = "White";

  if (game.turn() === "b") {
    moveColor = "Black";
  }

  if (game.in_checkmate()) {
    status = "Game over, " + moveColor + " is in checkmate.";
  } else if (game.in_draw()) {
    status = "Game over, drawn position";
  } else if (gameOver) {
    status = "Opponent disconnected, you win!";
  } else if (!gameHasStarted) {
    status = "Waiting for black to join";
  } else if (isSpectator) {
    status = "Spectator mode: Watching the game";
  } else {
    status = moveColor + " to move";
    if (game.in_check()) {
      status += ", " + moveColor + " is in check";
    }
  }

  $status.html(status);
  $pgn.html(game.pgn());

  // --- Timer Control ---
  if (!gameOver && gameHasStarted && !isSpectator) {
    let currentTurnColor = game.turn() === 'w' ? 'white' : 'black';
    if (currentTurnColor === playerColor) {
      startTimer();
    } else {
      stopTimer();
    }
  } else {
    stopTimer();
  }
}

// --- Board Initialization ---
var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  pieceTheme: "/public/img/chesspieces/wikipedia/{piece}.png",
};

board = Chessboard("myBoard", config);

if (playerColor === "black") {
  board.flip();
}

updateStatus();

// --- Game & Spectator Setup ---
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("code")) {
  isSpectator = urlParams.get("spectator") === "true";
  socket.emit("joinGame", {
    code: urlParams.get("code"),
    isSpectator: isSpectator,
  });
}

socket.on("startGame", function () {
  gameHasStarted = true;
  updateStatus();
});

socket.on("gameOverDisconnect", function () {
  gameOver = true;
  updateStatus();
});

// ─── Export Move History Handler ───
document.getElementById('exportHistory').addEventListener('click', () => {
  const pgnText = game.pgn();
  const blob = new Blob([pgnText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'chess_game_history.pgn';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});


// ---- Game‐over ----
socket.on('gameOver', (reason) => {
  alert(`Game over: ${reason}`);

  gameOver = true;
  updateStatus();
});


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("sendMessage").addEventListener("click", function () {
    let messageText = document.getElementById("message").value;

    const forbiddenRegex = /fast/gi;
    messageText = messageText.replace(forbiddenRegex, "").replace(/\s+/g, " ").trim();

    if (messageText !== "" && playerColor !== "spectator") {
      const message = {
        text: messageText,
        sender: playerColor,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit("chatMessage", message);
      document.getElementById("message").value = "";
    }
  });

  socket.on("newChatMessage", function (message) {
    const chatMessages = document.getElementById("chatMessages");
    const messageElement = document.createElement("li");
    messageElement.textContent = `${message.timestamp} ${message.sender}: ${message.text}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});


if (isSpectator) {
  document.getElementById("chatInput").style.display = "none";
  document.getElementById("spectatorMessage").style.display = "block";
}
