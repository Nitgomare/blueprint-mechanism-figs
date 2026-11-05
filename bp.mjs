// 白纸蓝图 —— 共用图版语言（参考 crank-rocker-film，反相到白纸）
export const C = {
  paper: "#F7F8FA",
  paper2: "#FFFFFF",
  gridMinor: "rgba(28,64,112,0.075)",
  gridMajor: "rgba(28,64,112,0.15)",
  rule: "#254878",
  ink: "#16202E",
  ink2: "#41546B",
  dim: "#6E819A",
  faint: "#A9B7C7",
  accent: "#1D5BD6",
  accentSoft: "rgba(29,91,214,0.10)",
  frame: "#8794A6",
};

export const FONT = {
  zh: '"Microsoft YaHei","Noto Sans SC","PingFang SC",sans-serif',
  mono: '"JetBrains Mono","Cascadia Mono",Consolas,"Roboto Mono",monospace',
};

export const grid = ({ w = 1000, h = 750 } = {}) => `
<defs>
  <pattern id="gm" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M40 0H0V40" fill="none" stroke="${C.rule}" stroke-opacity="0.075" stroke-width="1"/>
  </pattern>
  <pattern id="gM" width="200" height="200" patternUnits="userSpaceOnUse">
    <rect width="200" height="200" fill="url(#gm)"/>
    <path d="M200 0H0V200" fill="none" stroke="${C.rule}" stroke-opacity="0.15" stroke-width="1.1"/>
  </pattern>
</defs>
<rect width="${w}" height="${h}" fill="${C.paper}"/>
<rect width="${w}" height="${h}" fill="url(#gM)"/>`;

export const frameBox = ({ w = 1000, h = 750 } = {}) => `
<rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="none" stroke="${C.rule}" stroke-opacity="0.55" stroke-width="1.5"/>
<rect x="23" y="23" width="${w - 46}" height="${h - 46}" fill="none" stroke="${C.rule}" stroke-opacity="0.28" stroke-width="1"/>
<path d="M16 52h9M16 ${h - 52}h9M${w - 25} 52h9M${w - 25} ${h - 52}h9" stroke="${C.rule}" stroke-opacity="0.5" stroke-width="1.1"/>
<path d="M52 16v9M${w - 52} 16v9M52 ${h - 16}v-9M${w - 52} ${h - 16}v-9" stroke="${C.rule}" stroke-opacity="0.5" stroke-width="1.1"/>`;

export const header = ({ fig, title, sub, right, w = 1000 }) => `
<text x="56" y="52" font-family="${FONT.mono}" font-size="11.5" fill="${C.dim}" letter-spacing="0.24em">${fig}</text>
<text x="56" y="88" font-family="${FONT.zh}" font-size="26" font-weight="600" fill="${C.ink}" letter-spacing="0.06em">${title}</text>
<text x="56" y="111" font-family="${FONT.mono}" font-size="11" fill="${C.dim}" letter-spacing="0.2em">${sub}</text>
<text x="${w - 56}" y="52" text-anchor="end" font-family="${FONT.mono}" font-size="11.5" fill="${C.dim}" letter-spacing="0.24em">${right}</text>`;

/* 标题栏：默认右下角贴内框（内框 23，留 12），固定 260×116 —— 内部文字排到 y+109，压高度会溢出 */
export const titleBlock = ({ W = 1000, H = 750, x = W - 23 - 12 - 260, y = H - 23 - 12 - 116, w = 260, h = 116, kicker = "MECHANISM STUDY", name, cn, no, scale = "1 : 1" }) => `
<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.paper2}" stroke="${C.rule}" stroke-opacity="0.45" stroke-width="1.2"/>
  <line x1="${x}" y1="${y + 34}" x2="${x + w}" y2="${y + 34}" stroke="${C.rule}" stroke-opacity="0.35" stroke-width="1"/>
  <line x1="${x}" y1="${y + 78}" x2="${x + w}" y2="${y + 78}" stroke="${C.rule}" stroke-opacity="0.35" stroke-width="1"/>
  <line x1="${x + 174}" y1="${y + 34}" x2="${x + 174}" y2="${y + h}" stroke="${C.rule}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="${x + 12}" y="${y + 18}" font-family="${FONT.mono}" font-size="9.5" fill="${C.dim}" letter-spacing="0.22em">${kicker}</text>
  <text x="${x + 12}" y="${y + 60}" font-family="${FONT.mono}" font-size="14" fill="${C.ink}" letter-spacing="0.12em">${name}</text>
  <text x="${x + 12}" y="${y + 74}" font-family="${FONT.zh}" font-size="10.5" fill="${C.dim}" letter-spacing="0.08em">${cn}</text>
  <text x="${x + 12}" y="${y + 94}" font-family="${FONT.zh}" font-size="9.5" fill="${C.dim}" letter-spacing="0.1em">图号</text>
  <text x="${x + 12}" y="${y + 109}" font-family="${FONT.mono}" font-size="11" fill="${C.ink2}" letter-spacing="0.1em">${no}</text>
  <text x="${x + 186}" y="${y + 52}" font-family="${FONT.zh}" font-size="9.5" fill="${C.dim}" letter-spacing="0.1em">比例</text>
  <text x="${x + 186}" y="${y + 68}" font-family="${FONT.mono}" font-size="12" fill="${C.ink}" letter-spacing="0.08em">${scale}</text>
</g>`;

export const hint = (x = 56, y = 708, text = "拖动转曲柄") => `
<text x="${x}" y="${y}" font-family="${FONT.zh}" font-size="11.5" fill="${C.dim}" letter-spacing="0.12em">${text}</text>
<text x="${x + 88}" y="${y}" font-family="${FONT.mono}" font-size="11.5" fill="${C.faint}" letter-spacing="0.1em">·</text>
<text x="${x + 100}" y="${y}" font-family="${FONT.mono}" font-size="11.5" fill="${C.dim}" letter-spacing="0.12em">← → 步进 · 空格暂停</text>`;

/* 关节：同心圆 + 中心十字 */
export const pin = ({ id, color = C.ink, r = 9, at = null, cross = true }) => `
<g id="${id}"${at ? ` transform="translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})"` : ""}>
  <circle r="${r + 4.5}" fill="${C.paper2}"/>
  <circle r="${r}" fill="${C.paper2}" stroke="${color}" stroke-width="2.2"/>
  <circle r="${(r * 0.3).toFixed(1)}" fill="${color}"/>
  ${cross ? `<path d="M${-(r + 8)} 0h${2 * (r + 8)}M0 ${-(r + 8)}v${2 * (r + 8)}" stroke="${color}" stroke-width="0.8" stroke-opacity="0.45"/>` : ""}
</g>`;

/* 固定铰接地符号 */
export const support = (x, y, color = C.ink2) => `
<g>
  <path d="M${x - 14} ${y + 15} L${x} ${y + 12} L${x + 14} ${y + 15}" stroke="${color}" stroke-width="1.7" fill="none" stroke-opacity="0.8"/>
  <path d="M${x - 12} ${y + 17} L${x} ${y + 48} L${x + 12} ${y + 17} Z" fill="${color}" fill-opacity="0.06" stroke="${color}" stroke-width="1.4" stroke-opacity="0.75"/>
  <line x1="${x - 20}" y1="${y + 48}" x2="${x + 20}" y2="${y + 48}" stroke="${color}" stroke-width="1.5" stroke-opacity="0.75"/>
  ${Array.from({ length: 5 }, (_, i) => `<line x1="${x - 17 + i * 9}" y1="${y + 48}" x2="${x - 22 + i * 9}" y2="${y + 57}" stroke="${color}" stroke-width="1.1" stroke-opacity="0.5"/>`).join("")}
</g>`;

/* 字母圈标 */
export const tag = ({ id, text, dx = 0, dy = 0, color = C.ink2 }) => `
<g id="${id}"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}>
  <circle r="14" fill="${C.paper2}" stroke="${C.rule}" stroke-opacity="0.35" stroke-width="1.1"/>
  <text text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="15" font-style="italic" fill="${color}">${text}</text>
</g>`;

/* 杆件：暗描边 + 本体（两条线），双色可选 */
export const linkLines = ({ id, base = C.ink, w = 7, under = 11.5 }) => `
<line id="${id}U" x1="0" y1="0" x2="0" y2="0" stroke="${C.paper2}" stroke-width="${under}" stroke-linecap="round"/>
<line id="${id}" x1="0" y1="0" x2="0" y2="0" stroke="${base}" stroke-width="${w}" stroke-linecap="round"/>`;

/* 面板里的读数块 */
export const readout = ({ id, cn, en, mark, x = 690, y = 196, color = C.ink, markColor = C.accent }) => `
<text x="${x}" y="${y}" font-family="${FONT.zh}" font-size="12.5" fill="${C.dim}" letter-spacing="0.14em">${cn}</text>
<text x="${x + 20 + cn.length * 13.5}" y="${y}" font-family="${FONT.mono}" font-size="11" fill="${C.faint}" letter-spacing="0.18em">${en}</text>
<text x="${x + 254}" y="${y}" text-anchor="end" font-family="${FONT.mono}" font-size="13" fill="${markColor}">${mark}</text>
<text x="${x}" y="${y + 44}" font-family="${FONT.mono}" font-size="42" fill="${color}" letter-spacing="0.01em"><tspan id="${id}">0.0</tspan><tspan font-size="19" fill="${markColor}" dx="3" dy="-16">°</tspan></text>`;

export const row = ({ x = 690, y = 472, w = 254, label, value, style = "solid", color = C.ink }) => {
  const dash = style === "dash" ? ` stroke-dasharray="5 4"` : "";
  return `
<line x1="${x}" y1="${y - 4}" x2="${x + 14}" y2="${y - 4}" stroke="${color}" stroke-width="2.8"${dash}/>
<text x="${x + 26}" y="${y}" font-family="${FONT.zh}" font-size="12.5" fill="${C.ink2}">${label}</text>
<text x="${x + w}" y="${y}" text-anchor="end" font-family="${FONT.mono}" font-size="13" fill="${C.ink}">${value}</text>`;
};

export const page = ({ title, body, script, caption, w = 1000, h = 750 }) => `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  :root{
    --mono:${FONT.mono};
    --zh:${FONT.zh};
  }
  *{box-sizing:border-box}
  html,body{margin:0;background:#EDEFF3;color:#16202E}
  body{padding:28px 20px 48px;display:flex;justify-content:center}
  .wrap{width:min(1000px,100%)}
  .stage{position:relative;width:100%;aspect-ratio:${w}/${h};background:${C.paper};border:1px solid rgba(28,64,112,.22);border-radius:2px;overflow:hidden;cursor:grab;outline:none;user-select:none;-webkit-user-select:none;touch-action:pan-y;box-shadow:0 1px 2px rgba(20,40,70,.06),0 12px 28px -18px rgba(20,40,70,.35)}
  .stage:active{cursor:grabbing}
  .stage:focus:not(:focus-visible){box-shadow:none}
  .stage:focus-visible{box-shadow:inset 0 0 0 1.5px rgba(29,91,214,.6)}
  .stage svg{display:block;width:100%;height:100%}
  #crank,#link,#rocker,#rod{filter:drop-shadow(0 1px 1.2px rgba(20,40,70,.18))}
  .cap{margin-top:13px;font-family:var(--zh);font-size:13px;line-height:1.75;color:#5A6B80;letter-spacing:.01em}
  .cap b{color:#16202E;font-weight:600}
  @media (max-width:720px){
    body{padding:14px 10px 26px}
    .cap{font-size:12px;line-height:1.65}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="stage" data-stage tabindex="0" role="slider" aria-label="${title}：拖动或方向键转动曲柄" aria-valuemin="0" aria-valuemax="360" aria-valuenow="150">
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">
      ${body}
    </svg>
  </div>
  <div class="cap">${caption}</div>
</div>
<script>
${script}
</script>
</body>
</html>`;

/* 页面驱动：拖拽 / 键盘 / 空闲自动演示（各图共用）
   可选 min/max 限制取值（有界机构）、bounce 自动演示到端部反弹、step/home/end 改步进与端点 */
export const driver = ({ rate = 0.012, idle = 3800, tour = 0.8, min = -Infinity, max = Infinity, bounce = false, step = null, home = 0, end = Math.PI * 2 } = {}) => `
const calm = matchMedia("(prefers-reduced-motion: reduce)");
const stage = document.querySelector("[data-stage]");
const MIN = ${min}, MAX = ${max}, BOUNCE = ${bounce}, STEP = ${step === null ? "5 * Math.PI / 180" : step};
const clamp = (v) => Math.min(MAX, Math.max(MIN, v));
let phi = clamp(PHI0), target = phi, touring = false, dir = 1, idleAt = performance.now(), frame = 0, last = 0, drag = null;
function kick(){ idleAt = performance.now(); if(!frame){ last = 0; frame = requestAnimationFrame(tick); } }
function tick(now){
  frame = 0;
  const dt = Math.min((now - last) / 1000, 1/30) || 0.016;
  last = now;
  if (touring && !drag){
    target += dir * ${tour} * dt;
    if (target >= MAX){ target = MAX; dir = BOUNCE ? -1 : 0; if (!BOUNCE) touring = false; }
    else if (target <= MIN){ target = MIN; dir = BOUNCE ? 1 : 0; if (!BOUNCE) touring = false; }
  }
  if (!calm.matches){
    const d = target - phi;
    phi += Math.abs(d) < 1e-4 ? d : d * (1 - Math.exp(-dt / 0.15));
    if (Math.abs(d) < 1e-4) phi = target;
  } else phi = target;
  draw();
  if ((touring || Math.abs(target - phi) > 1e-4)) frame = requestAnimationFrame(tick);
}
stage.addEventListener("pointerdown", (e) => {
  stage.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, phi: target }; touring = false; dir = 1;
  stage.focus({ preventScroll: true }); kick();
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  target = clamp(drag.phi + (e.clientX - drag.x) * ${rate});
  phi = target; kick();
});
const endDrag = () => { if (!drag) return; drag = null; kick(); };
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight"){ target = clamp(target + STEP); touring = false; dir = 1; kick(); e.preventDefault(); }
  else if (e.key === "ArrowLeft"){ target = clamp(target - STEP); touring = false; dir = 1; kick(); e.preventDefault(); }
  else if (e.key === "Home"){ target = clamp(${home}); touring = false; dir = 1; kick(); e.preventDefault(); }
  else if (e.key === "End"){ target = clamp(${end}); touring = false; dir = 1; kick(); e.preventDefault(); }
  else if (e.key === " "){ touring = !touring; dir = 1; kick(); e.preventDefault(); }
});
setInterval(() => {
  if (calm.matches) return;
  if (!drag && !touring && performance.now() - idleAt > ${idle}) { touring = true; dir = 1; kick(); }
}, 600);
draw();
if (!calm.matches) frame = requestAnimationFrame(tick);
`;
