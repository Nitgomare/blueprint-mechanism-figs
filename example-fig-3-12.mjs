// 示例 · 原图对齐：图 3-12 造型机的翻箱机构（双摇杆 ABCD，砂箱固定在连杆 BC 上）
// 依据：mechanism-principles-4e/docs/chapters/03/index.md:136 与教材原图
//   「双摇杆机构 ABCD…将固定在连杆 BC 上的砂箱在 BC 位置造型振实后，翻转 180°，转到 B′C′ 位置」
// 杆长按原图像素比例折算：AB 180 / BC 56 / CD 245 / AD 100（s+l = 301 > p+q = 280 → 双摇杆）
// 做法：连杆驱动 θ（BC 方向），θ ∈ [−90°, +90°] 恰好是原图那两个位置，砂箱翻 180°。

import { writeFileSync } from "node:fs";
import * as B from "./bp.mjs";
import * as M from "./mech.mjs";

const C = B.C;
const L = { a: 210, b: 66, c: 290, d: 118 };
const SIDE = 1;
const PHI0 = 141, PHI1 = 81;          // 摇杆 AB 角：原图 BC / B′C′ 两个位置（实测）
const cls = M.classify(L);

const FLASK = { len: 58, wid: 34, fin: 12, finW: 20, gap: 5 };   // 砂箱：矩形 + 端部台阶
const S = 1.25, OX = 306, OY = 515;
const sx = (u) => OX + u * S, sy = (w) => OY - w * S;

/* ---------------- 几何 ---------------- */
const pose = (ph) => M.solve4(L, ph, -1);                  // 摇杆驱动，手性 −1（与原图一致）

// 轨迹（B、C 的弧）与终点影位
const N = 90;
const pathB = [], pathC = [];
for (let i = 0; i <= N; i++) {
  const s = pose(PHI0 + (PHI1 - PHI0) * i / N);
  if (s) { pathB.push(s.B); pathC.push(s.C); }
}
const sStart = pose(PHI0), sEnd = pose(PHI1);

const boxOf = (s) => {
  const ux = (s.C[0] - s.B[0]) / L.b, uy = (s.C[1] - s.B[1]) / L.b;
  const nx = -uy, ny = ux;
  const o = [s.C[0] + ux * FLASK.gap, s.C[1] + uy * FLASK.gap];   // 台阶朝 C 外侧
  const P = (e, m) => [o[0] + ux * e + nx * m, o[1] + uy * e + ny * m];
  const hl = FLASK.len, hw = FLASK.wid / 2, fw = FLASK.finW / 2;
  return [
    P(0, -hw), P(hl, -hw), P(hl, -fw),                       // 长边
    P(hl + FLASK.fin, -fw), P(hl + FLASK.fin, fw), P(hl, fw),// 端部台阶
    P(hl, hw), P(0, hw)                                      // 另一长边
  ];
};
const poly = (pts) => pts.map((p, i) => (i ? "L" : "M") + sx(p[0]).toFixed(2) + " " + sy(p[1]).toFixed(2)).join("") + "Z";

/* ---------------- 静态 ---------------- */
const parts = [];
parts.push(B.grid({ w: 1000, h: 750 }));
parts.push(B.frameBox({ w: 1000, h: 750 }));
parts.push(B.header({
  fig: "FIG. 3-12", title: "造型机的翻箱机构",
  sub: "FLASK TIPPING · 双摇杆", right: "REV. A · 1 : 1"
}));

// 机架 AD：地面阴影线 + 两铰支座 + 机架虚线
const groundY = sy(0);
const hatch = (cx, w = 66) => {
  let d = `M${cx - w / 2} ${groundY + 16}L${cx + w / 2} ${groundY + 16}`;
  for (let i = -w / 2; i <= w / 2; i += 11) d += `M${(cx + i).toFixed(1)} ${groundY + 16}L${(cx + i - 7).toFixed(1)} ${groundY + 25}`;
  return d;
};
parts.push(`<path d="${hatch(sx(0))}${hatch(sx(L.d))}" fill="none" stroke="${C.faint}" stroke-width="1.1" stroke-linecap="round"/>`);
parts.push(B.support(sx(0), groundY, C.ink));
parts.push(B.support(sx(L.d), groundY, C.ink));
parts.push(`<line x1="${sx(0)}" y1="${groundY}" x2="${sx(L.d)}" y2="${groundY}" stroke="${C.frame}" stroke-width="2.2" stroke-dasharray="7 5" stroke-linecap="round"/>`);

// 两条点划线轨迹（B→B′、C→C′）—— 原图的标志性画法
const arcD = (arr) => arr.map((p, i) => (i ? "L" : "M") + sx(p[0]).toFixed(2) + " " + sy(p[1]).toFixed(2)).join("");
parts.push(`<path d="${arcD(pathB)}" fill="none" stroke="${C.dim}" stroke-width="1.4" stroke-dasharray="10 3 2 3"/>`);
parts.push(`<path d="${arcD(pathC)}" fill="none" stroke="${C.dim}" stroke-width="1.4" stroke-dasharray="10 3 2 3"/>`);

// 终点影位（砂箱 + 连杆虚线）
parts.push(`<path id="ghostBox" d="${poly(boxOf(sEnd))}" fill="none" stroke="${C.faint}" stroke-width="1.2" stroke-dasharray="5 5"/>`);
parts.push(`<line x1="${sx(sEnd.B[0])}" y1="${sy(sEnd.B[1])}" x2="${sx(sEnd.C[0])}" y2="${sy(sEnd.C[1])}"
  stroke="${C.faint}" stroke-width="1.2" stroke-dasharray="5 5"/>`);
parts.push(`<text x="${(sx(sEnd.B[0]) + 16).toFixed(1)}" y="${(sy(sEnd.B[1]) + 14).toFixed(1)}" font-family="${B.FONT.mono}" font-size="12" font-style="italic" fill="${C.faint}">B′</text>`);
parts.push(`<text x="${(sx(sEnd.C[0]) + 16).toFixed(1)}" y="${(sy(sEnd.C[1]) - 6).toFixed(1)}" font-family="${B.FONT.mono}" font-size="12" font-style="italic" fill="${C.faint}">C′</text>`);

// 杆件（AB 输入摇杆用 accent；BC、CD 墨色）
parts.push(B.linkLines({ id: "crank", base: C.accent, w: 6.5, under: 11 }));
parts.push(B.linkLines({ id: "link", w: 6.5, under: 11 }));
parts.push(B.linkLines({ id: "rocker", w: 6.5, under: 11 }));

// 砂箱（多边形，随连杆转；画在杆件之上，白填充）
parts.push(`<path id="box" d="${poly(boxOf(sStart))}" fill="${C.paper2}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`);
parts.push(`<path id="boxIn" d="M0 0" fill="none" stroke="${C.ink2}" stroke-width="1.2"/>`);
parts.push(`<text id="boxTag" text-anchor="middle" dominant-baseline="central" font-family="${B.FONT.zh}" font-size="9.5" fill="${C.dim}" letter-spacing="0.08em">砂箱</text>`);

// 铰点 + 字母
parts.push(B.pin({ id: "pinA", at: [sx(0), groundY], r: 9, cross: true }));
parts.push(B.pin({ id: "pinD", at: [sx(L.d), groundY], r: 9, cross: true }));
parts.push(B.pin({ id: "pinB", r: 9, cross: true }));
parts.push(B.pin({ id: "pinC", r: 9, cross: true }));
const lab = (t, x, y, col = C.ink2, size = 13) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${B.FONT.mono}" font-size="${size}" font-style="italic" fill="${col}">${t}</text>`;
parts.push(lab("A", sx(0) - 34, groundY + 50));
parts.push(lab("D", sx(L.d) + 22, groundY + 50));
parts.push(B.tag({ id: "tagB", text: "B", dx: -20, dy: -12 }));
parts.push(B.tag({ id: "tagC", text: "C", dx: -22, dy: 14 }));

// 杆号
parts.push(`<text id="n1" text-anchor="middle" font-family="${B.FONT.mono}" font-size="12" fill="${C.dim}">1</text>`);
parts.push(`<text id="n2" text-anchor="middle" font-family="${B.FONT.mono}" font-size="12" fill="${C.dim}">2</text>`);
parts.push(`<text id="n3" text-anchor="middle" font-family="${B.FONT.mono}" font-size="12" fill="${C.dim}">3</text>`);

/* ---------------- 面板 ---------------- */
const PX = 690;
parts.push(`<line x1="${PX}" y1="150" x2="${PX + 254}" y2="150" stroke="${C.faint}" stroke-width="1"/>`);
parts.push(B.readout({ id: "thetaV", cn: "连杆转角", en: "COUPLER", mark: "θ", x: PX, y: 186 }));
parts.push(B.readout({ id: "alphaV", cn: "输入摇杆角", en: "ROCKER AB", mark: "α", x: PX, y: 276 }));
parts.push(`<line x1="${PX}" y1="350" x2="${PX + 254}" y2="350" stroke="${C.faint}" stroke-width="1"/>`);
parts.push(`<text x="${PX}" y="374" font-family="${B.FONT.zh}" font-size="12" fill="${C.dim}">翻转进度</text>`);
parts.push(`<text x="${PX + 254}" y="374" text-anchor="end" font-family="${B.FONT.mono}" font-size="12" fill="${C.dim}"><tspan id="progV">0</tspan>%</text>`);
parts.push(`<line id="progBg" x1="${PX}" y1="390" x2="${PX + 254}" y2="390" stroke="${C.faint}" stroke-width="4" stroke-linecap="round"/>`);
parts.push(`<line id="prog" x1="${PX}" y1="390" x2="${PX}" y2="390" stroke="${C.accent}" stroke-width="4" stroke-linecap="round"/>`);
parts.push(`<text x="${PX}" y="412" font-family="${B.FONT.zh}" font-size="11.5" fill="${C.dim}">上料位 · φ 141°</text>`);
parts.push(`<text x="${PX + 254}" y="412" text-anchor="end" font-family="${B.FONT.zh}" font-size="11.5" fill="${C.dim}">翻到位 · φ 81°</text>`);

parts.push(`<text x="${PX}" y="440" font-family="${B.FONT.zh}" font-size="12" fill="${C.ink2}">构件长度</text>`);
parts.push(`<text x="${PX + 254}" y="440" text-anchor="end" font-family="${B.FONT.mono}" font-size="10" fill="${C.dim}">mm</text>`);
const rows = [["AB 输入摇杆", L.a, C.accent], ["BC 连杆（砂箱在其上）", L.b, C.ink], ["CD 输出摇杆", L.c, C.ink], ["AD 机架", L.d, null]];
rows.forEach(([lab, v, col], i) => parts.push(B.row({ x: PX, y: 462 + i * 24, w: 254, label: lab, value: v, style: col ? "solid" : "dash", color: col })));

parts.push(`<text x="${PX}" y="566" font-family="${B.FONT.zh}" font-size="11.5" fill="${C.ink2}">s+l = ${L.b}+${L.c} = ${L.b + L.c} &gt; p+q = ${L.a}+${L.d} = ${L.a + L.d}</text>`);
parts.push(`<text x="${PX}" y="584" font-family="${B.FONT.zh}" font-size="11.5" fill="${C.accent}">→ ${cls.cn}</text>`);

parts.push(B.titleBlock({ W: 1000, H: 750, kicker: "MECHANISM STUDY", name: "FLASK TIPPER", cn: "翻箱机构 · 图 3-12", no: "M-03-12", scale: "1 : 1" }));
parts.push(B.hint(56, 712, "拖动翻转砂箱"));
parts.push(`<style>#box,#boxIn,#boxTag{transition:none}</style>`);

/* ---------------- 页面脚本 ---------------- */
const figCode = `
const $ = (id) => document.getElementById(id);
const L = ${JSON.stringify(L)};
const P0 = ${PHI0} * Math.PI / 180, P1 = ${PHI1} * Math.PI / 180;
const PHI0 = P0;
const S = ${S}, OX = ${OX}, OY = ${OY};
const sx = (u) => OX + u * S, sy = (w) => OY - w * S;
const FLASK = ${JSON.stringify(FLASK)};

function solve4(L, phiDeg, side) {
  const { a, b, c, d } = L, R = Math.PI / 180;
  const p = phiDeg * R;
  const B = [a * Math.cos(p), a * Math.sin(p)], D = [d, 0];
  const dx = D[0] - B[0], dy = D[1] - B[1], dist = Math.hypot(dx, dy);
  if (dist > b + c || dist < Math.abs(b - c)) return null;
  const q = (b * b - c * c + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, b * b - q * q)) * side;
  const ux = dx / dist, uy = dy / dist;
  const C = [B[0] + q * ux - h * uy, B[1] + q * uy + h * ux];
  return { A: [0, 0], B, C, D, coupler: Math.atan2(C[1] - B[1], C[0] - B[0]) * 180 / Math.PI };
}
function boxOf(s) {
  const ux = (s.C[0] - s.B[0]) / L.b, uy = (s.C[1] - s.B[1]) / L.b;
  const nx = -uy, ny = ux;
  const o = [s.C[0] + ux * FLASK.gap, s.C[1] + uy * FLASK.gap];
  const P = (e, m) => [o[0] + ux * e + nx * m, o[1] + uy * e + ny * m];
  const hl = FLASK.len, hw = FLASK.wid / 2, fw = FLASK.finW / 2;
  return [P(0,-hw), P(hl,-hw), P(hl,-fw), P(hl+FLASK.fin,-fw), P(hl+FLASK.fin,fw), P(hl,fw), P(hl,hw), P(0,hw)];
}
const poly = (pts) => pts.map((p,i)=> (i?"L":"M") + sx(p[0]).toFixed(2) + " " + sy(p[1]).toFixed(2)).join("") + "Z";
const un = (x) => { while (x > 180) x -= 360; while (x <= -180) x += 360; return x; };

const el = {
  crank:$("crank"), link:$("link"), rock:$("rocker"),
  box:$("box"), boxIn:$("boxIn"), boxTag:$("boxTag"),
  pinB:$("pinB"), pinC:$("pinC"), tagB:$("tagB"), tagC:$("tagC"),
  tagB2:$("tagB2"), tagC2:$("tagC2"),
  theta:$("thetaV"), alpha:$("alphaV"), prog:$("prog"), progV:$("progV"),
  n1:$("n1"), n2:$("n2"), n3:$("n3")
};
const setLine = (id, p, q) => {
  const L1 = el[id], U = el[id + "U"];
  L1.setAttribute("x1", sx(p[0]).toFixed(2)); L1.setAttribute("y1", sy(p[1]).toFixed(2));
  L1.setAttribute("x2", sx(q[0]).toFixed(2)); L1.setAttribute("y2", sy(q[1]).toFixed(2));
  if (U) { U.setAttribute("x1", L1.getAttribute("x1")); U.setAttribute("y1", L1.getAttribute("y1"));
           U.setAttribute("x2", L1.getAttribute("x2")); U.setAttribute("y2", L1.getAttribute("y2")); }
};
const movePin = (id, p) => el[id].setAttribute("transform", "translate(" + sx(p[0]).toFixed(2) + " " + sy(p[1]).toFixed(2) + ")");
const moveTag = (id, p, dx, dy) => el[id].setAttribute("transform",
  "translate(" + (sx(p[0]) + dx).toFixed(2) + " " + (sy(p[1]) + dy).toFixed(2) + ")");

let start = null;
function draw() {
  const ph = phi * 180 / Math.PI;
  const s = solve4(L, ph, -1);
  if (!s) return "";
  if (!start) start = s.coupler;
  setLine("crank", s.A, s.B); setLine("link", s.B, s.C); setLine("rock", s.C, s.D);
  movePin("pinB", s.B); movePin("pinC", s.C);
  moveTag("tagB", s.B, -20, -10); moveTag("tagC", s.C, -44, 6);
  el.box.setAttribute("d", poly(boxOf(s)));
  const bx = boxOf(s);
  const cx = bx.reduce((a, p) => a + p[0], 0) / bx.length, cy = bx.reduce((a, p) => a + p[1], 0) / bx.length;
  el.boxIn.setAttribute("d", poly(bx.map(p => [p[0] + (cx - p[0]) * 0.16, p[1] + (cy - p[1]) * 0.16])));
  el.boxTag.setAttribute("x", sx(cx).toFixed(2)); el.boxTag.setAttribute("y", sy(cy).toFixed(2));
  const tilt = Math.abs(un(s.coupler - start));
  el.theta.textContent = tilt.toFixed(0);
  el.alpha.textContent = ph.toFixed(0);
  const prog = (P0 - phi) / (P0 - P1);
  el.progV.textContent = Math.round(prog * 100);
  el.prog.setAttribute("x2", (${PX} + 254 * prog).toFixed(1));
  el.n1.setAttribute("x", sx((s.A[0] + s.B[0]) / 2).toFixed(1)); el.n1.setAttribute("y", sy((s.A[1] + s.B[1]) / 2).toFixed(1));
  el.n2.setAttribute("x", sx((s.B[0] + s.C[0]) / 2 - 12).toFixed(1)); el.n2.setAttribute("y", sy((s.B[1] + s.C[1]) / 2).toFixed(1));
  el.n3.setAttribute("x", sx((s.C[0] + s.D[0]) / 2).toFixed(1)); el.n3.setAttribute("y", sy((s.C[1] + s.D[1]) / 2).toFixed(1));
  return "连杆 " + tilt.toFixed(0) + "° · 摇杆 " + ph.toFixed(0) + "°";
}
`;

const R2 = Math.PI / 180;
const script = figCode + B.driver({
  rate: 0.006, idle: 3800, tour: 0.35, bounce: true,
  min: Math.min(PHI1, PHI0) * R2, max: Math.max(PHI1, PHI0) * R2,
  step: Math.abs(PHI0 - PHI1) * R2 / 36,
  home: Math.max(PHI0, PHI1) * R2, end: Math.min(PHI0, PHI1) * R2
});

const html = B.page({
  title: "图3-12 造型机的翻箱机构 · 白纸蓝图",
  body: parts.join(""),
  script,
  caption: `造型机的翻箱机构：双摇杆机构 ABCD，杆长按教材原图比例量取 AB 210、BC 66、CD 290、AD 118（s+l = 356 > p+q = 328，不满足格拉肖夫条件）。砂箱固定在连杆 BC 上：先在 BC 位置造型振实，再由摇杆 AB 摆过 60° 带动连杆把砂箱送到 B′C′ 位置以便拔模。图中点划线是铰点 B、C 的轨迹，虚线是砂箱的终点位置。<b>按四杆位形实测</b>，这段运动里连杆转过约 149°（不是严格的 180°）——教材所说的「翻转 180°」是指砂箱被整个翻过来、顶面朝下以便拔模，绘图时按 180° 示意。`
});
writeFileSync(new URL("./example-fig-3-12.html", import.meta.url), html);
console.log("wrote example-fig-3-12.html", (html.length / 1024).toFixed(0) + " KB");
