# ♟️ Multiplayer Chess Game – Real-Time Networking with Sockets

A **web-based multiplayer chess game** built using **Python socket programming** with full real-time networking, matchmaking, spectator mode, and in-game chat.  
This project is a complete demonstration of **client-server architecture**, **full-stack logic**, and **real-time communication systems**.

---

## 🚀 Features

- **Real-Time Multiplayer**
  - Play chess over a network with live move synchronization
- **Lobby & Matchmaking**
  - Players join a lobby and get matched automatically
- **Spectator Mode**
  - Watch live ongoing games without interfering
- **In-Game Chat**
  - Communicate with opponents or spectators during the game
- **Full Chess Logic**
  - Legal move validation, check, checkmate, stalemate
- **Turn Management**
  - Enforced timers for each move
- **Scalable Server**
  - Supports multiple games and spectators simultaneously

---

## 🛠 Tech Stack

- **Programming Language:** Python
- **Networking:** Socket Programming (TCP)
- **Frontend:** Web-based chessboard UI
- **Data Format:** JSON for client-server communication
- **Architecture:** Client-Server model with multi-client handling

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

git clone https://github.com/yourusername/multiplayer-chess.git
cd multiplayer-chess

2️⃣ Install Dependencies
pip install -r requirements.txt

3️⃣ Start the Server
python server/server.py

4️⃣ Start the Client(s)
python client/client.py

Open multiple clients to simulate multiplayer play

One client will be assigned White, the other Black

Additional clients can join as Spectators

🔄 How It Works
🖥 Client
-Connects to the server via TCP socket

-Sends move data to the server in JSON format

-Receives updated board state and renders it

-Handles in-game chat communication

🖧 Server
-Accepts multiple incoming connections

-Manages player matchmaking

-Validates moves based on chess rules

-Broadcasts updated game state to both players and spectators

-Handles turn timing and chat messages

🧠 Key Learnings
--Designing a real-time multiplayer application

--Implementing client-server architecture

--Managing synchronization across multiple clients

--Building both frontend UI and backend logic

--Handling network latency and state consistency


