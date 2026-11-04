// 平面连杆机构求解器 —— 构建与页面共用（纯函数，不依赖任何 DOM）
// 约定：A 在原点，D 在 (d,0)；a=AB 曲柄侧，b=BC 连杆，c=CD，d=AD 机架。
// 角度单位：本文所有对外角度均为「度」，输入角 φ、θ 也是度。

export const D2R = Math.PI / 180;
export const DEG = 180 / Math.PI;

/* ---------------- 1. 类型判定（格拉肖夫） ---------------- */
export function classify(L) {
  const arr = [L.a, L.b, L.c, L.d];
  const sorted = [...arr].sort((x, y) => x - y);
  const s = sorted[0], l = sorted[3], pq = sorted[1] + sorted[2];
  const grashof = s + l <= pq + 1e-9;
  let kind, cn;
  if (!grashof) {
    kind = "double-rocker"; cn = "双摇杆机构（非格拉肖夫）";
  } else if (L.d === s) {
    kind = "double-crank"; cn = "双曲柄机构（机架最短）";
  } else if (L.b === s) {
    kind = "double-rocker"; cn = "双摇杆机构（连杆最短）";
  } else {
    kind = "crank-rocker"; cn = "曲柄摇杆机构（最短杆为连架杆）";
  }
  return { s, l, pq, sum: s + l, grashof, kind, cn };
}

/* ---------------- 2. 线段最近距离（判穿模/折叠） ---------------- */
function ptSeg(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const L2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L2));
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy);
}
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
export function segDist(p1, p2, p3, p4) {
  const s1 = cross(p1, p2, p3), s2 = cross(p1, p2, p4);
  const s3 = cross(p3, p4, p1), s4 = cross(p3, p4, p2);
  if (s1 * s2 < 0 && s3 * s4 < 0) return 0;
  return Math.min(ptSeg(p1, p3, p4), ptSeg(p2, p3, p4), ptSeg(p3, p1, p2), ptSeg(p4, p1, p2));
}

/* ---------------- 3. 曲柄驱动：给定 φ（度），求 B、C ---------------- */
// side = +1 / -1 固定手性；换支会让机构「翻面」
export function solve4(L, phiDeg, side = 1) {
  const { a, b, c, d } = L;
  const A = [0, 0], D = [d, 0];
  const p = phiDeg * D2R;
  const B = [a * Math.cos(p), a * Math.sin(p)];
  const dx = D[0] - B[0], dy = D[1] - B[1], dist = Math.hypot(dx, dy);
  if (dist > b + c || dist < Math.abs(b - c)) return null;      // 该 φ 无解
  const q = (b * b - c * c + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, b * b - q * q)) * side;
  const ux = dx / dist, uy = dy / dist;
  const C = [B[0] + q * ux - h * uy, B[1] + q * uy + h * ux];
  return {
    A, B, C, D,
    phi: phiDeg,
    psi: Math.atan2(C[1] - D[1], C[0] - D[0]) * DEG,           // 摇杆角（从 +x 起，逆时针为正）
    coupler: Math.atan2(C[1] - B[1], C[0] - B[0]) * DEG        // 连杆方向
  };
}

/* ---------------- 4. 连杆驱动：给定连杆方向 θ（度），反求 B ---------------- */
// 用于「连杆上固结砂箱、要它连续翻 180°」这类机构
export function poseByCoupler(L, thetaDeg, side = -1) {
  const { a, b, c, d } = L;
  const A = [0, 0], D = [d, 0];
  const t = thetaDeg * D2R;
  const u = [Math.cos(t), Math.sin(t)];
  const E = [D[0] - b * u[0], D[1] - b * u[1]];                 // 把 C 平移到 E 处反解
  const dist = Math.hypot(E[0], E[1]);
  if (dist > a + c || dist < Math.abs(a - c)) return null;
  const q = (a * a - c * c + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, a * a - q * q)) * side;
  const ux = E[0] / dist, uy = E[1] / dist;
  const B = [q * ux - h * uy, q * uy + h * ux];
  const C = [B[0] + b * u[0], B[1] + b * u[1]];
  return {
    A, B, C, D, theta: thetaDeg,
    alpha: Math.atan2(B[1], B[0]) * DEG,
    psi: Math.atan2(C[1] - D[1], C[0] - D[0]) * DEG
  };
}

/* ---------------- 5. 扫掠统计（构建时打印） ---------------- */
export function sweep4(L, side = 1, n = 360) {
  let bad = 0, jump = 0, prev = null;
  let psiMin = Infinity, psiMax = -Infinity;
  let cPrev = null, cAcc = 0;                                    // 连杆转角累计
  let minGap = Infinity;
  let umin = Infinity, umax = -Infinity, wmin = Infinity, wmax = -Infinity;

  for (let i = 0; i <= n; i++) {
    const phi = (360 * i) / n;
    const s = solve4(L, phi, side);
    if (!s) { bad++; prev = null; cPrev = null; continue; }

    psiMin = Math.min(psiMin, s.psi);
    psiMax = Math.max(psiMax, s.psi);

    if (prev) {
      // 用最短角差比较，避免 ±180° 处的假跳变
      const d1 = Math.abs(((s.psi - prev.psi + 540) % 360) - 180);
      const d2 = Math.abs(((s.coupler - prev.coupler + 540) % 360) - 180);
      jump = Math.max(jump, d1, d2);
    }
    if (cPrev !== null) {
      let diff = s.coupler - cPrev;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      cAcc += diff;
    }
    cPrev = s.coupler;
    prev = s;

    minGap = Math.min(minGap, segDist(s.A, s.B, s.C, s.D));      // 曲柄与摇杆的最小间距
    for (const p of [s.B, s.C]) {
      umin = Math.min(umin, p[0]); umax = Math.max(umax, p[0]);
      wmin = Math.min(wmin, p[1]); wmax = Math.max(wmax, p[1]);
    }
  }
  return {
    frames: n + 1, bad,
    psiMin, psiMax, swing: psiMax - psiMin,
    couplerSweep: Math.abs(cAcc),                                // 一个周期的连杆转角（360 = 整周）
    maxJump: jump,
    minGap,
    bbox: [umin, umax, wmin, wmax]
  };
}

/* ---------------- 6. 刚体不变量（任意两帧杆长必须恒定） ---------------- */
export function rigidCheck(L, side = 1, n = 72, tol = 1e-9) {
  const ref = { AB: L.a, BC: L.b, CD: L.c, AD: L.d };
  let worst = 0;
  for (let i = 0; i <= n; i++) {
    const s = solve4(L, (360 * i) / n, side);
    if (!s) continue;
    const now = {
      AB: Math.hypot(s.B[0] - s.A[0], s.B[1] - s.A[1]),
      BC: Math.hypot(s.C[0] - s.B[0], s.C[1] - s.B[1]),
      CD: Math.hypot(s.C[0] - s.D[0], s.C[1] - s.D[1]),
      AD: Math.hypot(s.D[0] - s.A[0], s.D[1] - s.A[1])
    };
    for (const k in ref) worst = Math.max(worst, Math.abs(now[k] - ref[k]));
  }
  return { worst, ok: worst < tol };
}
