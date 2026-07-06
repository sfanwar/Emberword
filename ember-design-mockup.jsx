import React from "react";

// ─── EMBER · design mockup (static, non-playable) ───
// Palette: charred #14100C · ember #FF6B2C · amber #FFB347 · coal-blue #5E93A6 · ash #4A443D · bone #E8DDCE

const S = 24; // hex size
const W = Math.sqrt(3) * S;

const hexPoints = (cx, cy) => {
  let pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + S * Math.cos(a)).toFixed(1)},${(cy + S * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};

// axial -> pixel (pointy-top)
const pos = (q, r) => ({ x: W * (q + r / 2), y: 1.5 * S * r });

// radius-3 hex map
const cells = [];
for (let q = -3; q <= 3; q++)
  for (let r = -3; r <= 3; r++)
    if (Math.abs(q + r) <= 3) cells.push({ q, r });

// sample game state
const tiles = {
  // player word EMBER (orange), just played this round — burn 3
  "0,-1": { l: "E", v: 1, o: "p", burn: 3, fresh: true },
  "1,-1": { l: "M", v: 3, o: "p", burn: 3, fresh: true },
  "2,-1": { l: "B", v: 3, o: "p", burn: 3, fresh: true },
  "3,-1": { l: "E", v: 1, o: "p", burn: 3, fresh: true },
  "3,0": { l: "R", v: 1, o: "p", burn: 3, fresh: true },
  // older player tiles, cooling — burn 1
  "-2,1": { l: "A", v: 1, o: "p", burn: 1 },
  "-1,1": { l: "S", v: 1, o: "p", burn: 1 },
  "0,1": { l: "H", v: 4, o: "p", burn: 1 },
  // opponent word SMOKE (coal blue) — burn 2
  "-1,-1": { l: "S", v: 1, o: "o", burn: 2 },
  "-1,0": { l: "M", v: 3, o: "o", burn: 2 },
  "0,0": { l: "O", v: 1, o: "o", burn: 2 },
  "1,0": { l: "K", v: 5, o: "o", burn: 2 },
  "2,0": { l: "E", v: 1, o: "o", burn: 2 },
};
const ash = new Set(["-3,2", "-2,2", "2,-3", "3,-3", "1,2"]);
const forge = "0,2"; // bonus cell

const rack = [
  { l: "F", v: 4 }, { l: "L", v: 1 }, { l: "A", v: 1 }, { l: "R", v: 1 },
  { l: "E", v: 1 }, { l: "D", v: 2 }, { l: "★", v: 0 },
];

const Pips = ({ n, cx, cy }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <circle
        key={i}
        cx={cx - 8 + i * 8}
        cy={cy + 13}
        r={2.2}
        fill={i < n ? "#1A0F05" : "rgba(26,15,5,0.25)"}
      />
    ))}
  </g>
);

export default function EmberMockup() {
  return (
    <div style={st.page}>
      <style>{css}</style>

      <div style={st.eyebrow}>CONCEPT MOCKUP · NOT PLAYABLE</div>
      <h1 style={st.logo}>EMBER</h1>
      <div style={st.tag}>the word game where the board burns</div>

      {/* ── phone frame ── */}
      <div style={st.phone}>
        <div style={st.screen}>
          {/* top bar */}
          <div style={st.topbar}>
            <div style={st.player}>
              <div style={{ ...st.avatar, background: "linear-gradient(135deg,#FF6B2C,#FFB347)" }}>F</div>
              <div>
                <div style={st.pname}>Fahad</div>
                <div style={{ ...st.pscore, color: "#FFB347" }}>142</div>
              </div>
            </div>
            <div style={st.timer}>
              <div style={st.timerRing}>
                <span style={st.timerNum}>0:41</span>
              </div>
              <div style={st.round}>ROUND 7</div>
            </div>
            <div style={{ ...st.player, flexDirection: "row-reverse", textAlign: "right" }}>
              <div style={{ ...st.avatar, background: "linear-gradient(135deg,#3E6B7C,#7FB4C4)" }}>M</div>
              <div>
                <div style={st.pname}>Mara</div>
                <div style={{ ...st.pscore, color: "#7FB4C4" }}>128</div>
              </div>
            </div>
          </div>

          {/* score toast */}
          <div style={st.toast}>
            EMBER forged · <b style={{ color: "#FFB347" }}>+34</b> · hex-line ×2
          </div>

          {/* board */}
          <svg viewBox="-160 -132 320 268" style={{ width: "100%", display: "block" }}>
            {cells.map(({ q, r }) => {
              const key = `${q},${r}`;
              const { x, y } = pos(q, r);
              const t = tiles[key];
              const isAsh = ash.has(key);
              const isForge = key === forge;

              if (t) {
                const grad = t.o === "p" ? "url(#gp)" : "url(#go)";
                return (
                  <g key={key} className={t.fresh ? "flick" : ""}>
                    <polygon points={hexPoints(x, y)} fill={grad}
                      stroke={t.o === "p" ? "#FFD9A0" : "#A8D4E0"} strokeWidth="1.4" />
                    <text x={x} y={y + 2} textAnchor="middle" fontSize="17"
                      fontWeight="800" fill="#1A0F05" fontFamily="'Bricolage Grotesque',sans-serif">{t.l}</text>
                    <text x={x + 12} y={y - 8} textAnchor="middle" fontSize="7"
                      fontWeight="700" fill="rgba(26,15,5,0.7)">{t.v}</text>
                    <Pips n={t.burn} cx={x} cy={y} />
                  </g>
                );
              }
              if (isAsh) {
                return (
                  <g key={key}>
                    <polygon points={hexPoints(x, y)} fill="#3A342D" stroke="#4A443D" strokeWidth="1" />
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill="#8B8378">✦</text>
                  </g>
                );
              }
              if (isForge) {
                return (
                  <g key={key}>
                    <polygon points={hexPoints(x, y)} fill="#221C15" stroke="#FF6B2C"
                      strokeWidth="1.6" strokeDasharray="3 2" />
                    <text x={x} y={y + 3} textAnchor="middle" fontSize="7" fontWeight="700"
                      fill="#FF6B2C" letterSpacing="1">×3</text>
                  </g>
                );
              }
              return (
                <polygon key={key} points={hexPoints(x, y)} fill="#1D1812"
                  stroke="#2E271F" strokeWidth="1" />
              );
            })}
            <defs>
              <linearGradient id="gp" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF6B2C" /><stop offset="100%" stopColor="#FFB347" />
              </linearGradient>
              <linearGradient id="go" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5E93A6" /><stop offset="100%" stopColor="#8FC3D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* rack */}
          <div style={st.rack}>
            {rack.map((t, i) => (
              <div key={i} style={st.rackTile}>
                <span style={st.rackL}>{t.l}</span>
                <span style={st.rackV}>{t.v || ""}</span>
              </div>
            ))}
          </div>

          {/* actions */}
          <div style={st.actions}>
            <button style={st.plead}>⚖ Plead a word <span style={st.pleadBadge}>1</span></button>
            <button style={st.forgeBtn}>FORGE ▸</button>
          </div>
        </div>
      </div>

      {/* ── mechanics legend ── */}
      <div style={st.legend}>
        {[
          ["●●●  Burn pips", "Every tile lives 3 rounds, then collapses to ash. The board never sits still."],
          ["✦  Ash cells", "Burned-out hexes become wildcards — dead words become new openings."],
          ["×3  Forge hex", "Bonus cells migrate each round toward the coldest region of the board."],
          ["⚖  Plead a word", "Rejected slang? Argue your case in one line — an AI judge rules live, once per match."],
        ].map(([h, b], i) => (
          <div key={i} style={st.card}>
            <div style={st.cardH}>{h}</div>
            <div style={st.cardB}>{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;700;800&family=Space+Grotesk:wght@400;500;700&display=swap');
.flick { animation: flick 2.4s ease-in-out infinite; transform-origin: center; }
@keyframes flick { 0%,100%{opacity:1} 50%{opacity:.82} }
@media (prefers-reduced-motion: reduce){ .flick{animation:none} }
button { cursor: pointer; }
`;

const st = {
  page: { minHeight: "100vh", background: "#14100C", color: "#E8DDCE", fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px 48px" },
  eyebrow: { fontSize: 10, letterSpacing: 3, color: "#6E6862", marginBottom: 10 },
  logo: { fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 44, margin: 0, letterSpacing: 6, background: "linear-gradient(90deg,#FF6B2C,#FFB347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  tag: { fontSize: 13, color: "#9C9284", marginTop: 4, marginBottom: 26 },
  phone: { width: 340, borderRadius: 38, padding: 10, background: "#0B0906", boxShadow: "0 0 0 1px #322A20, 0 30px 60px rgba(0,0,0,.6), 0 0 90px rgba(255,107,44,.10)" },
  screen: { borderRadius: 28, background: "linear-gradient(180deg,#191410 0%,#14100C 100%)", overflow: "hidden", padding: "14px 12px 16px" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  player: { display: "flex", alignItems: "center", gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#1A0F05", fontFamily: "'Bricolage Grotesque',sans-serif" },
  pname: { fontSize: 11, color: "#9C9284" },
  pscore: { fontSize: 17, fontWeight: 700, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1 },
  timer: { textAlign: "center" },
  timerRing: { width: 46, height: 46, borderRadius: "50%", border: "2px solid #FF6B2C", borderTopColor: "#3A342D", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" },
  timerNum: { fontSize: 12, fontWeight: 700 },
  round: { fontSize: 8, letterSpacing: 2, color: "#6E6862", marginTop: 3 },
  toast: { margin: "10px auto 2px", width: "fit-content", fontSize: 11, color: "#C9BEAE", background: "#221C15", border: "1px solid #322A20", borderRadius: 20, padding: "4px 12px" },
  rack: { display: "flex", justifyContent: "center", gap: 6, marginTop: 4 },
  rackTile: { width: 36, height: 40, borderRadius: 8, background: "linear-gradient(160deg,#2B241C,#221C15)", border: "1px solid #3B3226", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  rackL: { fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 17, color: "#E8DDCE" },
  rackV: { position: "absolute", top: 3, right: 5, fontSize: 8, color: "#8B8378" },
  actions: { display: "flex", gap: 8, marginTop: 12 },
  plead: { flex: 1, background: "transparent", border: "1px solid #4A443D", color: "#C9BEAE", borderRadius: 12, padding: "10px 0", fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", position: "relative" },
  pleadBadge: { background: "#FF6B2C", color: "#1A0F05", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontWeight: 700, marginLeft: 4 },
  forgeBtn: { flex: 1, background: "linear-gradient(90deg,#FF6B2C,#FFB347)", border: "none", color: "#1A0F05", borderRadius: 12, padding: "10px 0", fontWeight: 800, fontSize: 13, letterSpacing: 1.5, fontFamily: "'Bricolage Grotesque',sans-serif" },
  legend: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 380, marginTop: 26 },
  card: { background: "#1B1611", border: "1px solid #2A231B", borderRadius: 14, padding: "12px 14px" },
  cardH: { fontSize: 12, fontWeight: 700, color: "#FFB347", marginBottom: 5, fontFamily: "'Bricolage Grotesque',sans-serif" },
  cardB: { fontSize: 11, lineHeight: 1.5, color: "#9C9284" },
};
