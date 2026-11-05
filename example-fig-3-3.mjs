// 样例：图 3-3 铰链四杆机构（曲柄摇杆）—— 白纸蓝图 · 二维点线示意
// 跑法：node example-fig-3-3.mjs   →  生成 example-fig-3-3.html
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as B from "./bp.mjs";
import { classify, sweep4, rigidCheck, solve4, D2R, DEG } from "./mech.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const C = B.C;
const W = 1000, H = 750;

/* ---------------- 1. 先算 ---------------- */
const L = { a: 45, b: 120, c: 90, d: 100 };   // AB 曲柄 / BC 连杆 / CD 摇杆 / AD 机架
const SIDE = 1;
const cls = classify(L);
const sw = sweep4(L, SIDE, 360);
const rg = rigidCheck(L, SIDE, 72);

if (sw.bad || sw.maxJump >= 90 || !rg.ok) {
  console.error("机构不合格，先改杆长：", { bad: sw.bad, jump: sw.maxJump, rigid: rg.worst });
  process.exit(1);
}
console.log(`${cls.cn}：s+l = ${cls.s}+${cls.l} = ${cls.sum} ≤ p+q = ${cls.pq}`);
console.log(`ψ ${sw.psiMin.toFixed(1)}° … ${sw.psiMax.toFixed(1)}°（摆角 ${sw.swing.toFixed(1)}°）· 连杆累计 ${sw.couplerSweep.toFixed(1)}°/周 · 最小间距 ${sw.minGap.toFixed(0)} mm`);

/* ---------------- 2. 视图 ---------------- */
const S = 2.9, OX = 175, OY = 500;
const sx = (u) => OX + u * S;
const sy = (w) => OY - w * S;
const PHI0 = 150;                               // 初始位形（度）
const s0 = solve4(L, PHI0, SIDE);

/* ---------------- 3. 静态图面 ---------------- */
const parts = [];
parts.push(B.grid({ w: W, h: H }));
parts.push(B.frameBox({ w: W, h: H }));
parts.push(B.header({ fig: "FIG. 3-3", title: "铰链四杆机构", sub: "HINGED FOUR-BAR · 曲柄摇杆", right: "REV. A · 1 : 1", w: W }));

// 机架 AD（虚线）、曲柄圆（点线）、摇杆摆角弧
const Ax = sx(0), Ay = sy(0), Dx = sx(L.d), Dy = sy(0);   // 机架沿 u 轴，w=0
parts.push(`<line x1="${Ax}" y1="${Ay}" x2="${Dx}" y2="${Dy}" stroke="${C.frame}" stroke-width="2.2" stroke-dasharray="7 5"/>`);
parts.push(`<circle cx="${Ax}" cy="${Ay}" r="${(L.a * S).toFixed(2)}" fill="none" stroke="${C.accent}" stroke-width="1.1" stroke-opacity="0.32" stroke-dasharray="2 7"/>`);

const R = L.c * S + 16;
const a0 = sw.psiMin * D2R, a1 = sw.psiMax * D2R;
const arc = (r, t0, t1) => `M${(Dx + r * Math.cos(t0)).toFixed(2)} ${(Dy - r * Math.sin(t0)).toFixed(2)}A${r} ${r} 0 0 0 ${(Dx + r * Math.cos(t1)).toFixed(2)} ${(Dy - r * Math.sin(t1)).toFixed(2)}`;
parts.push(`<path d="${arc(R, a0, a1)}" fill="none" stroke="${C.faint}" stroke-width="1"/>`);
parts.push(`<path d="${arc(R - 7, a0, a1)}" fill="none" stroke="${C.faint}" stroke-width="1" stroke-opacity="0.55"/>`);
{
  const ticks = [];
  const from = Math.ceil(sw.psiMin / 5) * 5, to = Math.floor(sw.psiMax / 5) * 5;
  for (let th = from; th <= to; th += 5) {
    const big = th % 15 === 0, r0 = R, r1 = R - (big ? 7 : 3.6);
    const t = th * D2R;
    ticks.push(`<line x1="${(Dx + r0 * Math.cos(t)).toFixed(2)}" y1="${(Dy - r0 * Math.sin(t)).toFixed(2)}" x2="${(Dx + r1 * Math.cos(t)).toFixed(2)}" y2="${(Dy - r1 * Math.sin(t)).toFixed(2)}" stroke="${big ? C.dim : C.faint}" stroke-width="${big ? 1.3 : 0.9}"/>`);
  }
  // 两端终止线：加粗，标记 ψ 极限
  for (const t of [a0, a1]) {
    ticks.push(`<line x1="${(Dx + R * Math.cos(t)).toFixed(2)}" y1="${(Dy - R * Math.sin(t)).toFixed(2)}" x2="${(Dx + (R - 4).toFixed(0) * Math.cos(t)).toFixed(2)}" y2="${(Dy - (R - 4).toFixed(0) * Math.sin(t)).toFixed(2)}" stroke="${C.ink2}" stroke-width="2.6"/>`);
  }
  parts.push(ticks.join(""));
  const tm = (a0 + a1) / 2;
  parts.push(`<text x="${(Dx + (R + 42) * Math.cos(tm)).toFixed(2)}" y="${(Dy - (R + 42) * Math.sin(tm)).toFixed(2)}" text-anchor="middle" font-family="${B.FONT.mono}" font-size="11.5" fill="${C.dim}">ψ ${sw.swing.toFixed(1)}°</text>`);
}

// 固定铰
parts.push(B.support(Ax, Ay));
parts.push(B.support(Dx, Dy));

// 杆件（近者后画）：摇杆 → 连杆 → 曲柄
parts.push(B.linkLines({ id: "link", w: 6.5, under: 11 }));
parts.push(B.linkLines({ id: "rocker", w: 6.5, under: 11 }));
parts.push(B.linkLines({ id: "crank", base: C.accent, w: 6.5, under: 11 }));

// 销钉：固定销静态定位，活动销每帧移动
parts.push(B.pin({ id: "pinA", at: [Ax, Ay], r: 8 }));
parts.push(B.pin({ id: "pinD", at: [Dx, Dy], r: 8 }));
parts.push(B.pin({ id: "pinB", r: 8, color: C.accent }));
parts.push(B.pin({ id: "pinC", r: 8 }));

// 字母圈标：A/D 固定，B/C 每帧跟随
parts.push(B.tag({ id: "tagA", text: "A", dx: Ax - 30, dy: Ay + 26 }));
parts.push(B.tag({ id: "tagD", text: "D", dx: Dx + 30, dy: Dy + 26 }));
parts.push(B.tag({ id: "tagB", text: "B" }));
parts.push(B.tag({ id: "tagC", text: "C" }));

// 杆号 1–4
const num = (id) => `<text id="${id}" text-anchor="middle" dominant-baseline="central" font-family="${B.FONT.mono}" font-size="11.5" fill="${C.dim}">${id.slice(1)}</text>`;
parts.push(num("n1") + num("n2") + num("n3") + num("n4"));

/* ---------------- 4. 右侧面板 ---------------- */
const PX = 640, VAL = PX + 254;
parts.push(`<line x1="${PX}" y1="150" x2="${VAL}" y2="150" stroke="${C.rule}" stroke-width="1" stroke-opacity="0.28"/>`);
parts.push(B.readout({ id: "phiV", cn: "曲柄", en: "CRANK", mark: "φ", x: PX, y: 176 }));
parts.push(B.readout({ id: "psiV", cn: "摇杆", en: "ROCKER", mark: "ψ", x: PX, y: 276, markColor: C.ink2 }));

// 摆角条：底条 + 当前位置标记
const BX0 = PX, BX1 = PX + 240, BY = 352;
parts.push(`<line x1="${BX0}" y1="${BY}" x2="${BX1}" y2="${BY}" stroke="${C.rule}" stroke-width="3" stroke-opacity="0.16" stroke-linecap="round"/>`);
parts.push(`<line id="psiTrack" x1="${BX0}" y1="${BY}" x2="${BX1}" y2="${BY}" stroke="${C.accent}" stroke-width="3" stroke-opacity="0.55" stroke-linecap="round"/>`);
parts.push(`<line id="psiMark" x1="${BX0}" y1="${BY - 9}" x2="${BX0}" y2="${BY + 9}" stroke="${C.ink}" stroke-width="1.6"/>`);
parts.push(`<text x="${BX0}" y="${BY + 24}" font-family="${B.FONT.zh}" font-size="11" fill="${C.faint}">极限 C₂ · ${sw.psiMin.toFixed(1)}°</text>`);
parts.push(`<text x="${BX1}" y="${BY + 24}" text-anchor="end" font-family="${B.FONT.zh}" font-size="11" fill="${C.faint}">极限 C₁ · ${sw.psiMax.toFixed(1)}°</text>`);
parts.push(`<text x="${BX0}" y="${BY + 46}" font-family="${B.FONT.zh}" font-size="11" fill="${C.ink2}">摆角 ψ = <tspan font-family="${B.FONT.mono}" fill="${C.ink}">${sw.swing.toFixed(1)}°</tspan></text>`);

// 构件长度表 + 格拉肖夫
parts.push(`<text x="${PX}" y="424" font-family="${B.FONT.zh}" font-size="12.5" fill="${C.ink2}">构件长度</text>`);
parts.push(`<text x="${VAL}" y="424" text-anchor="end" font-family="${B.FONT.mono}" font-size="11" fill="${C.faint}">mm</text>`);
parts.push(B.row({ x: PX, y: 450, w: 254, label: "AB 曲柄", value: String(L.a), color: C.accent }));
parts.push(B.row({ x: PX, y: 478, w: 254, label: "BC 连杆", value: String(L.b) }));
parts.push(B.row({ x: PX, y: 506, w: 254, label: "CD 摇杆", value: String(L.c) }));
parts.push(B.row({ x: PX, y: 534, w: 254, label: "AD 机架", value: String(L.d), style: "dash", color: C.frame }));
parts.push(`<line x1="${PX}" y1="552" x2="${VAL}" y2="552" stroke="${C.rule}" stroke-width="1" stroke-opacity="0.2"/>`);
parts.push(`<text x="${PX}" y="574" font-family="${B.FONT.mono}" font-size="12" fill="${C.dim}">格拉肖夫 s+l = ${cls.s}+${cls.l} = ${cls.sum} ≤ p+q = ${cls.pq}</text>`);
parts.push(`<text x="${PX}" y="592" font-family="${B.FONT.zh}" font-size="12" fill="${C.accent}">最短杆 AB 与机架相邻 → 曲柄摇杆机构</text>`);

parts.push(B.titleBlock({ name: "HINGED FOUR-BAR", cn: "平面连杆机构 · 图 3-3", no: "M-03-03", scale: "1 : 1" }));
parts.push(B.hint(56, 712, "拖动转曲柄"));

const body = parts.join("\n");

/* ---------------- 5. 页面脚本 ---------------- */
const pageScript = `
const PHI0 = ${(PHI0 * D2R).toFixed(8)};
const L = ${JSON.stringify(L)}, SIDE = ${SIDE};
const S = ${S}, OX = ${OX}, OY = ${OY}, D2R = ${D2R}, DEG = ${DEG};
${solve4.toString().replace(/^export /, "")}
const sx = (u) => OX + u * S, sy = (w) => OY - w * S;
const $ = (id) => document.getElementById(id);
const el = { crankU:$("crankU"), crank:$("crank"), linkU:$("linkU"), link:$("link"), rockerU:$("rockerU"), rocker:$("rocker"),
             pinB:$("pinB"), pinC:$("pinC"), tagB:$("tagB"), tagC:$("tagC"),
             n1:$("n1"), n2:$("n2"), n3:$("n3"), n4:$("n4"),
             phi:$("phiV"), psi:$("psiV"), mark:$("psiMark") };
const PSI0 = ${sw.psiMin.toFixed(3)}, PSI1 = ${sw.psiMax.toFixed(3)};
const BX0 = ${BX0}, BX1 = ${BX1}, BY = ${BY};

function seg(a, b){ const l = sy(a[1]) - sy(b[1]) === 0 ? "h" : ""; return [sx(a[0]),sy(a[1]),sx(b[0]),sy(b[1])]; }
function setLine(id, a, b){
  const [x1,y1,x2,y2] = [sx(a[0]), sy(a[1]), sx(b[0]), sy(b[1])];
  for (const k of [id, id + "U"]) { const e = el[k]; e.setAttribute("x1",x1.toFixed(2)); e.setAttribute("y1",y1.toFixed(2)); e.setAttribute("x2",x2.toFixed(2)); e.setAttribute("y2",y2.toFixed(2)); }
}
function movePin(id, p){ el[id].setAttribute("transform", "translate(" + sx(p[0]).toFixed(2) + " " + sy(p[1]).toFixed(2) + ")"); }
function moveTag(id, p, dx, dy){ el[id].setAttribute("transform", "translate(" + (sx(p[0])+dx).toFixed(2) + " " + (sy(p[1])+dy).toFixed(2) + ")"); }
function mid(a, b, off){                        // 杆中点 + 屏幕法向偏移
  const x1 = sx(a[0]), y1 = sy(a[1]), x2 = sx(b[0]), y2 = sy(b[1]);
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  return [ (x1+x2)/2 - dy/len*off, (y1+y2)/2 + dx/len*off ];
}
function putNum(id, p){ el[id].setAttribute("x", p[0].toFixed(2)); el[id].setAttribute("y", p[1].toFixed(2)); }

function draw(){
  const s = solve4(L, phi * DEG, SIDE);
  if (!s) return;
  setLine("crank", s.A, s.B);
  setLine("link",  s.B, s.C);
  setLine("rocker",s.C, s.D);
  movePin("pinB", s.B); movePin("pinC", s.C);
  moveTag("tagB", s.B, -24, -16); moveTag("tagC", s.C, 24, -16);
  putNum("n1", mid(s.A, s.B,  16));
  putNum("n2", mid(s.B, s.C, -16));
  putNum("n3", mid(s.C, s.D,  16));
  putNum("n4", mid(s.A, s.D,  22));
  const phiD = ((phi * DEG) % 360 + 360) % 360;
  el.phi.textContent = phiD.toFixed(1);
  el.psi.textContent = s.psi.toFixed(1);
  const t = (s.psi - PSI0) / (PSI1 - PSI0 || 1);
  el.mark.setAttribute("x1", (BX0 + Math.max(0, Math.min(1, t)) * (BX1 - BX0)).toFixed(2));
  el.mark.setAttribute("x2", el.mark.getAttribute("x1"));
}
${B.driver({ rate: 0.012, idle: 3800, tour: 0.6, min: 0, max: 2 * Math.PI, home: PHI0 * D2R, end: 2 * Math.PI })}
`;

/* ---------------- 6. 出页 ---------------- */
const caption = `<b>曲柄摇杆机构</b>：曲柄 AB 绕 A 整周回转，经连杆 BC 推摇杆 CD 绕 D 往复摆动，机架 AD 固定。` +
  `杆长 AB ${L.a} / BC ${L.b} / CD ${L.c} / AD ${L.d} mm，s+l = ${cls.s}+${cls.l} = ${cls.sum} ≤ p+q = ${cls.pq}，` +
  `最短杆 AB 与机架相邻 → 曲柄摇杆；摇杆摆角 ψ = ${sw.swing.toFixed(1)}°（C₂ ${sw.psiMin.toFixed(1)}° ↔ C₁ ${sw.psiMax.toFixed(1)}°）。`;

const html = B.page({ title: "图 3-3 铰链四杆机构 · 白纸蓝图", body, script: pageScript, caption, w: W, h: H });
writeFileSync(join(HERE, "example-fig-3-3.html"), html);
console.log(`wrote example-fig-3-3.html · ${(html.length / 1024).toFixed(0)} KB`);
