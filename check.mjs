#!/usr/bin/env node
// 机构体检：node check.mjs <a> <b> <c> <d> [side=1] [杆宽=6.5] [--need-flip]
// 硬性三项（无解帧 / 换支跳变 / 刚体不变量）不过 → 退出码 1。
// --need-flip 追加要求：连杆一个周期能转过 180°（即必须是双曲柄）。
import { classify, sweep4, rigidCheck } from "./mech.mjs";

const raw = process.argv.slice(2);
const flags = raw.filter(s => s.startsWith("--"));
const argv = raw.filter(s => !s.startsWith("--"));
if (argv.length < 4) {
  console.log("用法: node check.mjs <a> <b> <c> <d> [side=1] [杆宽=6.5] [--need-flip]");
  console.log("例:   node check.mjs 45 120 90 100 1 6.5");
  process.exit(2);
}
const [a, b, c, d] = argv.slice(0, 4).map(Number);
const side = Number(argv[4] ?? 1) >= 0 ? 1 : -1;
const BAR = Number(argv[5] ?? 6.5);
const needFlip = flags.includes("--need-flip");
const L = { a, b, c, d };
const CLR = BAR + 8;

const cls = classify(L);
const sw = sweep4(L, side, 360);
const rg = rigidCheck(L, side, 72);

const hard = [];   // 不合格
const soft = [];   // 提醒
const info = [];   // 事实

const pad = (s, n) => s + " ".repeat(Math.max(1, n - [...s].reduce((w, ch) => w + (/[\u4e00-\u9fa5]/.test(ch) ? 2 : 1), 0)));

console.log(`\n机构  a=AB ${a}  b=BC ${b}  c=CD ${c}  d=AD ${d}    装配 side=${side > 0 ? "+1" : "-1"}`);
console.log(`判定  s+l = ${cls.s} + ${cls.l} = ${cls.sum} ${cls.grashof ? "≤" : ">"} p+q = ${cls.pq}  →  ${cls.cn}\n`);

if (sw.bad > 0) hard.push(["无解帧", `${sw.bad} / ${sw.frames}`,
  "机构在这个 φ 区间过不去：缩短杆长、加大机架，或改输入变量"]);
else info.push(["无解帧", `0 / ${sw.frames}（全程有解）`]);

if (sw.maxJump >= 90) hard.push(["换支跳变", `${sw.maxJump.toFixed(1)}°`,
  "相邻帧跳变 > 90° = 求解器换了装配模式。固定 side，并检查 dist 与 |b−c| / b+c 的边界"]);
else info.push(["换支跳变", `${sw.maxJump.toFixed(2)}°（< 90°，未换支）`]);

if (!rg.ok) hard.push(["刚体不变量", `最大偏差 ${rg.worst.toExponential(1)} mm`,
  "杆长在扫掠中变了：求解器错了，或绘图里长度被缩放了两次"]);
else info.push(["刚体不变量", `杆长偏差 ${rg.worst.toExponential(1)} mm（恒定）`]);

info.push(["摇杆摆角 ψ", `${sw.psiMin.toFixed(1)}° … ${sw.psiMax.toFixed(1)}°（摆角 ${sw.swing.toFixed(1)}°）`]);
info.push(["连杆转角累计", `${sw.couplerSweep.toFixed(1)}° / 周${sw.couplerSweep > 340 ? "（整周，可带动载物翻 180°）" : "（不到整周，不能翻 180°）"}`]);
info.push(["扫掠包围盒", `u ${sw.bbox[0].toFixed(0)} … ${sw.bbox[1].toFixed(0)}，w ${sw.bbox[2].toFixed(0)} … ${sw.bbox[3].toFixed(0)}`]);

if (sw.minGap < CLR) soft.push(["杆件间距", `${sw.minGap.toFixed(1)} mm < ${CLR} mm`,
  "非相邻杆件会「折」在一起：若它们本来就分层（真机上也交错），可在图上按深度分层加白色底衬；否则加长机架或缩短曲柄"]);
else info.push(["杆件最小间距", `${sw.minGap.toFixed(1)} mm（≥ ${CLR}）`]);

if (needFlip && sw.couplerSweep <= 340) hard.push(["需要翻 180°", `连杆只有 ${sw.couplerSweep.toFixed(1)}° / 周`,
  "要连杆（或挂在连杆上的砂箱、平台）翻 180°，机构必须是双曲柄（机架最短且满足格拉肖夫）"]);

for (const [k, v] of info) console.log(`  · ${pad(k, 14)} ${v}`);
for (const [k, v, why] of soft) console.log(`  ! ${pad(k, 14)} ${v}\n      → ${why}`);
for (const [k, v, why] of hard) console.log(`  ✗ ${pad(k, 14)} ${v}\n      → ${why}`);

console.log("");
if (cls.kind === "crank-rocker") console.log("提示  曲柄摇杆：输入用曲柄角 φ，摇杆只在 ψ 区间摆动；图上别把它画成整周。");
else if (cls.kind === "double-crank") console.log("提示  双曲柄：φ 与 ψ 都整周回转；要让载物翻 180°，用连杆转角 θ∈[0,180] 当输入。");
else console.log("提示  双摇杆：两根连架杆都只能摆动，连杆转角到不了 180°。");

if (hard.length) { console.log(`\n✗ 不合格 ${hard.length} 项 —— 先改机构，别开始画。\n`); process.exit(1); }
console.log("\n✓ 硬性三项通过，可以开始画。\n");
