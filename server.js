
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const adminPassword = process.env.ADMIN_PASSWORD || "admin";

const db = new Database(process.env.DB_PATH || path.join(__dirname, "zaalvoetbal.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  open INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO settings(id, open) VALUES (1, 1);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  registered_at TEXT NOT NULL,
  team INTEGER
);
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function getState() {
  const players = db.prepare("SELECT id,name,registered_at,team FROM players ORDER BY id").all();
  const open = !!db.prepare("SELECT open FROM settings WHERE id=1").get().open;

  let teams = { 1: [], 2: [] };
  const reserves = [];
  players.forEach((p, i) => {
    if (p.team === 1) teams[1].push(p);
    else if (p.team === 2) teams[2].push(p);
    else if (i >= 10) reserves.push(p);
  });

  // Compatibility: if teams have not yet been assigned, assign the first 10.
  const assigned = players.filter(p => p.team === 1 || p.team === 2).length;
  if (players.length >= 10 && assigned < 10) {
    randomizeFirstTen();
    return getState();
  }

  return { open, teams, reserves, total: players.length };
}

function randomizeFirstTen() {
  const firstTen = db.prepare("SELECT id FROM players ORDER BY id LIMIT 10").all();
  if (firstTen.length < 10) return;
  const ids = firstTen.map(x => x.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const tx = db.transaction(() => {
    db.prepare("UPDATE players SET team=NULL").run();
    const stmt = db.prepare("UPDATE players SET team=? WHERE id=?");
    ids.forEach((id, i) => stmt.run(i < 5 ? 1 : 2, id));
  });
  tx();
}

app.get("/api/state", (req, res) => res.json(getState()));

app.post("/api/register", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const setting = db.prepare("SELECT open FROM settings WHERE id=1").get();

  if (!setting.open) return res.status(409).json({error:"De inschrijving is gesloten."});
  if (!name) return res.status(400).json({error:"Vul je naam in."});
  if (name.length > 80) return res.status(400).json({error:"Naam is te lang."});

  const count = db.prepare("SELECT COUNT(*) AS n FROM players").get().n;
  if (count >= 10) {
    // Invallers have team=NULL and are naturally ordered by id.
    db.prepare("INSERT INTO players(name,registered_at,team) VALUES (?,?,NULL)")
      .run(name, new Date().toISOString());
  } else {
    db.prepare("INSERT INTO players(name,registered_at,team) VALUES (?,?,NULL)")
      .run(name, new Date().toISOString());
    if (count + 1 === 10) randomizeFirstTen();
  }

  res.json(getState());
});

function requireAdmin(req, res, next) {
  const supplied = req.headers["x-admin-password"];
  if (!supplied || supplied !== adminPassword)
    return res.status(401).json({error:"Onjuiste admin-wachtwoord."});
  next();
}

app.get("/api/admin/state", requireAdmin, (req,res) => res.json(getState()));

app.post("/api/admin/randomize", requireAdmin, (req,res) => {
  randomizeFirstTen();
  res.json(getState());
});

app.post("/api/admin/toggle", requireAdmin, (req,res) => {
  db.prepare("UPDATE settings SET open = CASE open WHEN 1 THEN 0 ELSE 1 END WHERE id=1").run();
  res.json(getState());
});

app.delete("/api/admin/player/:id", requireAdmin, (req,res) => {
  const id = Number(req.params.id);
  db.prepare("DELETE FROM players WHERE id=?").run(id);

  // Rebuild teams from the first 10 remaining registrations.
  const firstTen = db.prepare("SELECT id FROM players ORDER BY id LIMIT 10").all();
  db.prepare("UPDATE players SET team=NULL").run();
  if (firstTen.length === 10) {
    const ids = firstTen.map(x=>x.id);
    for (let i=ids.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [ids[i],ids[j]]=[ids[j],ids[i]];
    }
    const stmt=db.prepare("UPDATE players SET team=? WHERE id=?");
    ids.forEach((pid,i)=>stmt.run(i<5?1:2,pid));
  }
  res.json(getState());
});

app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => console.log(`Zaalvoetbal draait op http://localhost:${port}`));
