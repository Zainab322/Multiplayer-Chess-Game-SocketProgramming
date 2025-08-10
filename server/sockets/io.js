// server/sockets/io.js
const games = {}; 

module.exports = (io) => {
  io.on("connection", (socket) => {
    let currentCode = null;

    socket.on("joinGame", (data) => {
      currentCode = data.code;

      // Initialize game state if not present
      if (!games[currentCode]) {
        games[currentCode] = {
          white: null,
          black: null,
          spectators: [],
          gameStarted: false,
          gameEnded: false
        };
      }

      socket.join(currentCode);

      // Handle player joins
      if (data.isSpectator) {
        games[currentCode].spectators.push(socket.id);
        io.to(currentCode).emit("newSpectator", socket.id);
      } else {
        if (games[currentCode].white === null) {
          games[currentCode].white = socket.id;
        } else if (games[currentCode].black === null) {
          games[currentCode].black = socket.id;
        }
      }

      // Start game when two players are in
      if (
        games[currentCode].white &&
        games[currentCode].black &&
        !games[currentCode].gameStarted
      ) {
        games[currentCode].gameStarted = true;
        io.to(currentCode).emit("startGame");
      }
    });

    // Handle move events
    socket.on("move", (move) => {
      if (games[currentCode].gameStarted && !games[currentCode].gameEnded) {
        io.to(currentCode).emit("newMove", move);
      }
    });

    // Handle timeout events
    socket.on("timeOut", () => {
      if (
        currentCode &&
        games[currentCode].gameStarted &&
        !games[currentCode].gameEnded
      ) {
        games[currentCode].gameEnded = true;

        // Determine loser/winner by socket ID
        const loserId = socket.id;
        let loserColor = "";
        let winnerColor = "";
        if (games[currentCode].white === loserId) {
          loserColor = "white";
          winnerColor = "black";
        } else if (games[currentCode].black === loserId) {
          loserColor = "black";
          winnerColor = "white";
        }

        io.to(currentCode).emit(
          "gameOver",
          `${loserColor} timed out. ${winnerColor} wins!`
        );
      }
    });

    socket.on("chatMessage", (message) => {
      message.text = message.text
        .replace(/fast/gi, "")
        .replace(/\s+/g, " ")  
        .trim(); 

      io.to(currentCode).emit("newChatMessage", message);
    });

    // Handle disconnects
    socket.on("disconnect", () => {
      if (!currentCode) return;

      // If someone leaves who isn’t a player, just notify
      if (games[currentCode].spectators.length > 0) {
        io.to(currentCode).emit("spectatorLeft", socket.id);
      } else {
        // Player disconnected: end game
        games[currentCode].gameEnded = true;
        io.to(currentCode).emit("gameOverDisconnect");
        delete games[currentCode];
      }
    });
  });
};
