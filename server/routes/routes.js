let games = {};

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/white", (req, res) => {
    let code = req.query.code;
    if (!games[code]) {
      games[code] = {
        white: null,
        black: null,
        spectators: [],
        gameStarted: false,
      };
    }

    games[code].white = "player";
    res.render("game", { color: "white", code });
  });


  app.get("/black", (req, res) => {
    let code = req.query.code;
    if (!games[code]) {
      return res.redirect("/?error=invalidCode");
    }

    games[code].black = "player";

    if (games[code].white && games[code].black && !games[code].gameStarted) {
      games[code].gameStarted = true; 
      res.render("game", { color: "black", code });
    } else {
      res.render("game", { color: "black", code });
    }
  });

  app.get("/spectator", (req, res) => {
    let code = req.query.code;
    if (!games[code]) {
      return res.redirect("/?error=invalidCode");
    }
    res.render("game", { color: "spectator", code });
  });
};
