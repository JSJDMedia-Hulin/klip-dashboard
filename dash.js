"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/dash.ts
  var require_dash = __commonJS({
    "src/dash.ts"() {
      var GAUGE_TARGET = 0;
      var GAUGE_MAX = 1;
      var GAUGE_VALUE = 0;
      var COLLECTED = 0;
      var GOAL = 1;
      var BULLET_MAX = 1;
      var DAILY = [];
      var DAILY_TOTAL = 0;
      var KPIS = [];
      var LAST5 = [];
      var OPPS = [];
      var TOP = [];
      var KPI_ACCENTS = ["#38e1ff", "#a77bff", "#ffb547"];
      var isNum = (v) => typeof v === "number" && isFinite(v);
      var isPairs = (v) => Array.isArray(v) && v.every((p) => Array.isArray(p) && typeof p[0] === "string" && isNum(p[1]));
      function validData(d) {
        return d && isNum(d.GAUGE_TARGET) && isNum(d.GAUGE_MAX) && d.GAUGE_MAX > 0 && isNum(d.GAUGE_VALUE) && isNum(d.COLLECTED) && isNum(d.GOAL) && d.GOAL > 0 && isPairs(d.DAILY) && isNum(d.DAILY_TOTAL) && Array.isArray(d.KPIS) && d.KPIS.length >= 3 && d.KPIS.every((k) => k && typeof k.title === "string" && isNum(k.value)) && isPairs(d.LAST5) && Array.isArray(d.OPPS) && d.OPPS.every((s) => typeof s === "string") && isPairs(d.TOP);
      }
      function applyData(d) {
        GAUGE_TARGET = d.GAUGE_TARGET;
        GAUGE_MAX = d.GAUGE_MAX;
        GAUGE_VALUE = d.GAUGE_VALUE;
        COLLECTED = d.COLLECTED;
        GOAL = d.GOAL;
        BULLET_MAX = GOAL / 0.88;
        DAILY = d.DAILY;
        DAILY_TOTAL = d.DAILY_TOTAL;
        KPIS = d.KPIS.slice(0, 3).map((k, i) => ({ title: k.title, value: k.value, accent: k.accent || KPI_ACCENTS[i] }));
        LAST5 = d.LAST5;
        OPPS = d.OPPS;
        TOP = d.TOP;
      }
      var MAX_ROWS = 5;
      var rows = (a) => a.slice(0, MAX_ROWS);
      var TOP_RANKED = () => rows([...TOP].sort((a, b) => b[1] - a[1]));
      var RANK_COLORS = [
        ["#ffe08a", "#f2b51d", "#a97a06"],
        ["#f1f5fb", "#b9c4d6", "#7c879a"],
        ["#ffc59a", "#e0843f", "#9a5121"],
        ["#9fd0ff", "#3d8bff", "#1f4fa8"],
        ["#e2c6ff", "#a77bff", "#5b34b0"]
      ];
      var HUES = {
        "Sara Williams": 195,
        "Brittany Jackson": 320,
        "Maria Hamidi": 35,
        "Tan Gangani": 150,
        "Orlando Apodaca": 10,
        "Lilly Wang": 270,
        "Alan Zickefoose": 90,
        "Stacey Anderson": 345,
        "Lori Krueger": 240,
        "Scott Busenbark": 60,
        "Maddie Rife": 300,
        "Seth Dyson": 175
      };
      var TXT = "#eef2ff";
      var SUB = "#9fb0d8";
      var EDGE = "#3aa8ff";
      var money = (v) => "$" + Math.round(v).toLocaleString("en-US");
      var num = (v) => Math.round(v).toLocaleString("en-US");
      var clamp01 = (t) => t < 0 ? 0 : t > 1 ? 1 : t;
      var easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
      var easeOutBack = (t) => {
        const x = clamp01(t);
        const c1 = 1.4;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      };
      var DAILY_MIN_RH = 24;
      var BASE_W = 1600 / 1.32;
      var BASE_H = 775;
      var pctParam = (name, def) => {
        const m = new RegExp("[?&]" + name + "=([0-9]*\\.?[0-9]+)").exec(location.search);
        const v = m ? parseFloat(m[1]) : def;
        return isFinite(v) ? Math.max(0, Math.min(20, v)) : def;
      };
      var PAD_X = pctParam("padx", 4);
      var PAD_Y = pctParam("pady", 2.5);
      var CONTENT_SCALE = 0.95;
      var GAUGE_H = 445;
      var needH = () => Math.max(BASE_H, 12 + GAUGE_H + 12 + 118 + Math.max(1, DAILY.length) * DAILY_MIN_RH + 48);
      function layoutFor(vw, vh) {
        if (vw >= 760 || vw >= vh) {
          const px = vw * PAD_X / 100;
          const py = vh * PAD_Y / 100;
          const iw = Math.max(1, vw - 2 * px);
          const ih = Math.max(1, vh - 2 * py);
          const nh = needH();
          const s = CONTENT_SCALE * Math.min(iw / BASE_W, ih / nh);
          const W2 = vw / s;
          const H = vh / s;
          const ox = px / s;
          const oy = py / s;
          const IW = iw / s;
          const IH = ih / s;
          const m = 12;
          const g = 12;
          const cw = (IW - 2 * m - 3 * g) / 4;
          const cx = (i) => ox + m + i * (cw + g);
          const top0 = oy + 12;
          const bottom = oy + IH - 48;
          const extra = Math.max(0, IH - nh);
          const gh = GAUGE_H + extra * 0.5;
          const dy = top0 + gh + 12;
          const ly = top0 + 132;
          return {
            W: W2,
            H,
            mobile: false,
            gauge: { x: cx(0), y: top0, w: cw, h: gh },
            daily: { x: cx(0), y: dy, w: cw, h: bottom - dy },
            kpi: [1, 2, 3].map((i) => ({ x: cx(i), y: top0, w: cw, h: 120 })),
            sales: { x: cx(1), y: ly, w: cw, h: bottom - ly },
            opps: { x: cx(2), y: ly, w: cw, h: bottom - ly },
            top: { x: cx(3), y: ly, w: cw, h: bottom - ly },
            footer: { x: ox, y: oy + IH - 44, w: IW, h: 44 }
          };
        }
        const dailyExtra = (baseH) => Math.max(0, 118 + DAILY.length * DAILY_MIN_RH - baseH);
        const W = 400;
        const x = 14;
        const w = W - 28;
        let y = 14;
        const take = (h) => {
          const r = { x, y, w, h };
          y += h + 16;
          return r;
        };
        const gauge = take(500);
        const daily = take(320 + dailyExtra(320));
        const kpi = [take(124), take(124), take(124)];
        const sales = take(420);
        const opps = take(440);
        const top = take(520);
        const footer = { x: 0, y, w: W, h: 40 };
        return { W, H: y + 44, mobile: true, gauge, daily, kpi, sales, opps, top, footer };
      }
      function rr(c, x, y, w, h, r) {
        const k = Math.max(0, Math.min(r, w / 2, h / 2));
        c.beginPath();
        c.moveTo(x + k, y);
        c.arcTo(x + w, y, x + w, y + h, k);
        c.arcTo(x + w, y + h, x, y + h, k);
        c.arcTo(x, y + h, x, y, k);
        c.arcTo(x, y, x + w, y, k);
        c.closePath();
      }
      function box3d(c, x, y, w, h, dx, dy, front, top, side) {
        if (w <= 0 || h <= 0) return;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + w, y);
        c.lineTo(x + w + dx, y + dy);
        c.lineTo(x + dx, y + dy);
        c.closePath();
        c.fillStyle = top;
        c.fill();
        c.beginPath();
        c.moveTo(x + w, y);
        c.lineTo(x + w + dx, y + dy);
        c.lineTo(x + w + dx, y + h + dy);
        c.lineTo(x + w, y + h);
        c.closePath();
        c.fillStyle = side;
        c.fill();
        c.fillStyle = front;
        c.fillRect(x, y, w, h);
      }
      function font(c, weight, size, fam) {
        c.font = `${weight} ${size}px ${fam}`;
      }
      function fitFont(c, weight, size, fam, s, maxW) {
        font(c, weight, size, fam);
        const w = c.measureText(s).width;
        if (w > maxW && maxW > 0) font(c, weight, Math.max(8, size * maxW / w), fam);
      }
      function text(c, s, x, y, color, align, glow, blur) {
        c.save();
        c.textAlign = align;
        c.textBaseline = "middle";
        if (glow) {
          c.shadowColor = glow;
          c.shadowBlur = blur != null ? blur : 14;
        }
        c.fillStyle = color;
        c.fillText(s, x, y);
        c.restore();
      }
      function hueFor(name) {
        let hsh = 0;
        for (let i = 0; i < name.length; i++) hsh = hsh * 31 + name.charCodeAt(i) >>> 0;
        return hsh % 360;
      }
      function initials(name) {
        const parts = name.split(" ");
        return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "")).toUpperCase();
      }
      function avatar(c, name, x, y, r, fam, ring) {
        var _a2;
        const h = (_a2 = HUES[name]) != null ? _a2 : hueFor(name);
        c.save();
        c.shadowColor = "rgba(0,0,0,0.55)";
        c.shadowBlur = r * 0.6;
        c.shadowOffsetY = r * 0.3;
        const g = c.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
        g.addColorStop(0, `hsl(${h},90%,78%)`);
        g.addColorStop(0.55, `hsl(${h},70%,50%)`);
        g.addColorStop(1, `hsl(${h},75%,26%)`);
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = g;
        c.fill();
        c.restore();
        if (ring) {
          c.save();
          c.shadowColor = ring;
          c.shadowBlur = 12;
          c.strokeStyle = ring;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(x, y, r + 3, 0, Math.PI * 2);
          c.stroke();
          c.restore();
        }
        font(c, 700, Math.round(r * 0.8), fam);
        c.save();
        c.shadowColor = "rgba(0,0,0,0.5)";
        c.shadowBlur = 3;
        c.shadowOffsetY = 1;
        text(c, initials(name), x, y + 1, "#ffffff", "center");
        c.restore();
        const hl = c.createLinearGradient(x, y - r, x, y);
        hl.addColorStop(0, "rgba(255,255,255,0.55)");
        hl.addColorStop(1, "rgba(255,255,255,0)");
        c.beginPath();
        c.ellipse(x, y - r * 0.45, r * 0.62, r * 0.38, 0, 0, Math.PI * 2);
        c.fillStyle = hl;
        c.fill();
      }
      function panel(c, r, ex, ey, accent) {
        c.save();
        c.shadowColor = "rgba(0,0,0,0.65)";
        c.shadowBlur = 34;
        c.shadowOffsetX = ex * 1.4;
        c.shadowOffsetY = ey * 1.8;
        rr(c, r.x + ex, r.y + ey, r.w, r.h, 16);
        c.fillStyle = "#04060f";
        c.fill();
        c.restore();
        for (let i = 6; i >= 1; i--) {
          const f = i / 6;
          rr(c, r.x + ex * f, r.y + ey * f, r.w, r.h, 16);
          c.fillStyle = `rgb(${10 + (6 - i) * 2},${16 + (6 - i) * 3},${40 + (6 - i) * 5})`;
          c.fill();
        }
        const g = c.createLinearGradient(r.x, r.y, r.x + r.w * 0.4, r.y + r.h);
        g.addColorStop(0, "#1d2a55");
        g.addColorStop(0.5, "#141d3e");
        g.addColorStop(1, "#0e1530");
        rr(c, r.x, r.y, r.w, r.h, 16);
        c.fillStyle = g;
        c.fill();
        c.save();
        c.shadowColor = accent;
        c.shadowBlur = 16;
        c.globalAlpha *= 0.75;
        c.strokeStyle = accent;
        c.lineWidth = 1.4;
        rr(c, r.x, r.y, r.w, r.h, 16);
        c.stroke();
        c.restore();
        const hl = c.createLinearGradient(r.x, r.y, r.x, r.y + 40);
        hl.addColorStop(0, "rgba(255,255,255,0.18)");
        hl.addColorStop(1, "rgba(255,255,255,0)");
        c.save();
        rr(c, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 15);
        c.strokeStyle = hl;
        c.lineWidth = 2;
        c.stroke();
        c.restore();
      }
      function title(c, r, s, fam, accent) {
        font(c, 650, 19, fam);
        text(c, s, r.x + 20, r.y + 32, TXT, "left");
        const g = c.createLinearGradient(r.x + 20, 0, r.x + r.w - 20, 0);
        g.addColorStop(0, accent);
        g.addColorStop(1, "rgba(58,168,255,0)");
        c.save();
        c.shadowColor = accent;
        c.shadowBlur = 8;
        c.fillStyle = g;
        c.fillRect(r.x + 20, r.y + 50, r.w - 40, 2);
        c.restore();
      }
      function band(c, cx, cy, R, T, a0, a1) {
        c.beginPath();
        c.arc(cx, cy, R, a0, a1, false);
        c.arc(cx, cy, R - T, a1, a0, true);
        c.closePath();
      }
      function drawGauge(c, r, lt, t, fam) {
        const cx = r.x + r.w / 2;
        const cy = r.y + 208 + Math.max(0, r.h - 445) / 2;
        const R = Math.min(122, r.w / 2 - 34);
        const T = 36;
        const PI = Math.PI;
        const ft = GAUGE_TARGET / GAUGE_MAX;
        const fv = GAUGE_VALUE / GAUGE_MAX;
        const at = PI + ft * PI;
        c.save();
        c.beginPath();
        c.arc(cx, cy, R + 22, PI, 2 * PI);
        c.closePath();
        const bg = c.createRadialGradient(cx, cy, 10, cx, cy, R + 22);
        bg.addColorStop(0, "#1a2448");
        bg.addColorStop(1, "#070b1c");
        c.fillStyle = bg;
        c.fill();
        const rim = c.createLinearGradient(cx - R, cy - R, cx + R, cy);
        rim.addColorStop(0, "#5c6a8f");
        rim.addColorStop(0.5, "#e6ecff");
        rim.addColorStop(1, "#4a5677");
        c.strokeStyle = rim;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(cx, cy, R + 22, PI, 2 * PI);
        c.stroke();
        c.restore();
        const D = 14;
        for (let i = D; i >= 1; i--) {
          const k = 1 - i / D;
          band(c, cx, cy + i, R, T, PI, at);
          c.fillStyle = `rgb(${70 + k * 50},${10 + k * 10},${24 + k * 12})`;
          c.fill();
          band(c, cx, cy + i, R, T, at, 2 * PI);
          c.fillStyle = `rgb(${8 + k * 8},${55 + k * 35},${36 + k * 20})`;
          c.fill();
        }
        const red = c.createRadialGradient(cx, cy, R - T, cx, cy, R);
        red.addColorStop(0, "#7d1529");
        red.addColorStop(0.45, "#ff5468");
        red.addColorStop(1, "#b81f3a");
        const green = c.createRadialGradient(cx, cy, R - T, cx, cy, R);
        green.addColorStop(0, "#0c5a39");
        green.addColorStop(0.45, "#3ee69a");
        green.addColorStop(1, "#11885a");
        c.save();
        c.shadowColor = "rgba(255,70,95,0.6)";
        c.shadowBlur = 22;
        band(c, cx, cy, R, T, PI, at);
        c.fillStyle = red;
        c.fill();
        c.shadowColor = "rgba(60,230,150,0.6)";
        band(c, cx, cy, R, T, at, 2 * PI);
        c.fillStyle = green;
        c.fill();
        c.restore();
        c.strokeStyle = "rgba(255,255,255,0.35)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(cx, cy, R - 2, PI, 2 * PI);
        c.stroke();
        c.strokeStyle = "rgba(0,0,0,0.35)";
        c.beginPath();
        c.arc(cx, cy, R - T + 1, PI, 2 * PI);
        c.stroke();
        const sweep = easeOutBack(lt / 2);
        const wob = lt > 2.2 ? Math.sin(t * 2.3) * 35e-4 : 0;
        const fcur = Math.max(0, fv * sweep + wob);
        for (let i = 0; i <= 40; i++) {
          const f = i / 40;
          const a2 = PI + f * PI;
          const major = i % 10 === 0;
          const r0 = R + 6;
          const r1 = R + (major ? 18 : 12);
          c.strokeStyle = f <= fcur ? "#7ff0ff" : "rgba(140,160,215,0.45)";
          c.lineWidth = major ? 2.4 : 1.4;
          c.beginPath();
          c.moveTo(cx + Math.cos(a2) * r0, cy + Math.sin(a2) * r0);
          c.lineTo(cx + Math.cos(a2) * r1, cy + Math.sin(a2) * r1);
          c.stroke();
        }
        c.save();
        c.shadowColor = "#38e1ff";
        c.shadowBlur = 14;
        c.strokeStyle = "#38e1ff";
        c.lineWidth = 4;
        c.lineCap = "round";
        c.beginPath();
        c.arc(cx, cy, R - T - 10, PI, PI + Math.min(1, fcur) * PI);
        c.stroke();
        c.restore();
        c.save();
        c.shadowColor = "#ffffff";
        c.shadowBlur = 10;
        c.strokeStyle = "#ffffff";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(cx + Math.cos(at) * (R - T - 2), cy + Math.sin(at) * (R - T - 2));
        c.lineTo(cx + Math.cos(at) * (R + 4), cy + Math.sin(at) * (R + 4));
        c.stroke();
        c.restore();
        font(c, 500, 13, fam);
        text(c, "0", cx - R + T / 2, cy + 24, SUB, "center");
        text(c, num(GAUGE_MAX), cx + R - T / 2, cy + 24, SUB, "center");
        font(c, 600, 13, fam);
        const tlw = c.measureText(num(GAUGE_TARGET)).width / 2 + 6;
        const tlx = Math.max(r.x + tlw, Math.min(r.x + r.w - tlw, cx + Math.cos(at) * (R + 44)));
        text(c, num(GAUGE_TARGET), tlx, cy + Math.sin(at) * (R + 44) - 4, "#ffffff", "center");
        const a = PI + fcur * PI;
        const L = R - 4;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const px = -sa;
        const py = ca;
        const bw = 8;
        const tip = { x: cx + ca * L, y: cy + sa * L };
        const tail = { x: cx - ca * 24, y: cy - sa * 24 };
        const s1 = { x: cx + px * bw, y: cy + py * bw };
        const s2 = { x: cx - px * bw, y: cy - py * bw };
        c.save();
        c.translate(5, 8);
        c.fillStyle = "rgba(0,0,0,0.45)";
        c.beginPath();
        c.moveTo(tip.x, tip.y);
        c.lineTo(s1.x, s1.y);
        c.lineTo(tail.x, tail.y);
        c.lineTo(s2.x, s2.y);
        c.closePath();
        c.fill();
        c.restore();
        c.beginPath();
        c.moveTo(tip.x, tip.y);
        c.lineTo(s1.x, s1.y);
        c.lineTo(tail.x, tail.y);
        c.closePath();
        c.fillStyle = "#f6f8ff";
        c.fill();
        c.beginPath();
        c.moveTo(tip.x, tip.y);
        c.lineTo(s2.x, s2.y);
        c.lineTo(tail.x, tail.y);
        c.closePath();
        c.fillStyle = "#98a2bb";
        c.fill();
        c.save();
        c.shadowColor = "#ff4d63";
        c.shadowBlur = 10;
        c.fillStyle = "#ff4d63";
        c.beginPath();
        c.arc(tip.x, tip.y, 2.5, 0, PI * 2);
        c.fill();
        c.restore();
        const hub = c.createRadialGradient(cx - 7, cy - 7, 2, cx, cy, 21);
        hub.addColorStop(0, "#ffffff");
        hub.addColorStop(0.45, "#aeb7cc");
        hub.addColorStop(1, "#353c4f");
        c.save();
        c.shadowColor = "rgba(0,0,0,0.6)";
        c.shadowBlur = 10;
        c.shadowOffsetY = 4;
        c.beginPath();
        c.arc(cx, cy, 20, 0, PI * 2);
        c.fillStyle = hub;
        c.fill();
        c.restore();
        const cap = c.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 8);
        cap.addColorStop(0, "#5a6380");
        cap.addColorStop(1, "#141826");
        c.beginPath();
        c.arc(cx, cy, 8, 0, PI * 2);
        c.fillStyle = cap;
        c.fill();
        const cu = easeOut(lt / 1.8);
        font(c, 800, 42, fam);
        text(c, money(GAUGE_VALUE * cu), cx, cy + 66, "#ffffff", "center", "#38e1ff", 18);
        font(c, 600, 17, fam);
        text(c, "Collected MTD", cx, cy + 108, SUB, "center");
        font(c, 750, 24, fam);
        text(c, money(COLLECTED * easeOut((lt - 0.4) / 1.8)), cx, cy + 134, TXT, "center");
        const dx = 10;
        const dy = -8;
        const bx = r.x + 22;
        const bw2 = r.w - 44 - dx;
        const by = cy + 172;
        const bh = 20;
        const fr = GOAL / BULLET_MAX;
        box3d(c, bx, by, bw2 * fr, bh, dx, dy, "rgba(200,40,70,0.35)", "rgba(255,110,130,0.35)", "rgba(120,20,40,0.5)");
        box3d(c, bx + bw2 * fr, by, bw2 * (1 - fr), bh, dx, dy, "rgba(40,200,120,0.4)", "rgba(110,255,180,0.4)", "rgba(15,110,65,0.6)");
        const fillF = COLLECTED / BULLET_MAX * easeOut((lt - 0.6) / 1.6);
        const fw = bw2 * fillF;
        if (fw > 0.5) {
          const fg = c.createLinearGradient(0, by + 3, 0, by + bh - 3);
          fg.addColorStop(0, "#ff9aa9");
          fg.addColorStop(0.5, "#ff4d63");
          fg.addColorStop(1, "#b81f3a");
          c.save();
          c.shadowColor = "rgba(255,77,99,0.8)";
          c.shadowBlur = 14;
          box3d(c, bx + 2, by + 3, fw - 2, bh - 6, dx * 0.7, dy * 0.7, fg, "#ffb0bc", "#a01a33");
          c.restore();
          const mx = bx + fw;
          c.save();
          c.shadowColor = "#ffffff";
          c.shadowBlur = 12;
          box3d(c, mx - 2, by - 7, 4, bh + 14, dx, dy, "#ffffff", "#ffffff", "#c9d2ea");
          c.restore();
        }
        const gx = bx + bw2 * fr;
        c.strokeStyle = "rgba(255,255,255,0.6)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(gx, by + bh + 2);
        c.lineTo(gx, by + bh + 9);
        c.stroke();
        font(c, 600, 13, fam);
        text(c, "Goal " + num(GOAL), bx + bw2 + dx, by + bh + 22, SUB, "right");
      }
      function hotTest(p, x, y, w, h) {
        return p !== null && p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
      }
      function rowHighlight(c, x, y, w, h) {
        c.save();
        const g = c.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, "rgba(56,225,255,0.22)");
        g.addColorStop(1, "rgba(56,225,255,0.04)");
        rr(c, x, y, w, h, 10);
        c.fillStyle = g;
        c.fill();
        c.restore();
      }
      function drawDaily(c, r, lt, fam, p) {
        const y0 = r.y + 62;
        const list = DAILY;
        const n = Math.max(1, list.length);
        const rh = Math.min(48, Math.max(DAILY_MIN_RH, (r.h - 118) / n));
        const fs = Math.min(15, rh * 0.6);
        const bh = Math.min(14, rh * 0.55);
        const stg = Math.min(0.15, 1.2 / n);
        const vmax = Math.max(1, ...list.map((d) => d[1]));
        font(c, 650, fs, fam);
        const amtW = Math.max(1, ...list.map((d) => c.measureText(money(d[1])).width));
        font(c, 500, fs, fam);
        const nameMax = Math.max(1, ...list.map((d) => c.measureText(d[0]).width));
        const nx = r.x + 50;
        const avail = r.x + r.w - 18 - amtW - 12 - nx;
        const nameCol = Math.max(40, Math.min(nameMax + 10, avail - 40));
        const bx0 = nx + nameCol;
        const maxLen = Math.max(10, r.x + r.w - 18 - amtW - 12 - 7 - bx0);
        list.forEach(([name, v], i) => {
          const yc = y0 + i * rh + rh / 2;
          const ap2 = easeOut((lt - stg * i) / 0.6);
          c.save();
          c.globalAlpha *= ap2;
          c.translate((1 - ap2) * -24, 0);
          if (hotTest(p, r.x + 10, yc - rh / 2, r.w - 20, rh)) rowHighlight(c, r.x + 10, yc - rh / 2 + 2, r.w - 20, rh - 4);
          avatar(c, name, r.x + 30, yc, Math.min(13, rh / 2 - 1), fam);
          fitFont(c, 500, fs, fam, name, nameCol - 8);
          text(c, name, nx, yc, TXT, "left");
          const len = maxLen * v / vmax * easeOut((lt - 0.3 - stg * i) / 1.2);
          const fg = c.createLinearGradient(0, yc - bh / 2, 0, yc + bh / 2);
          fg.addColorStop(0, "#9feeff");
          fg.addColorStop(1, "#1aa6d6");
          c.save();
          c.shadowColor = "rgba(56,225,255,0.6)";
          c.shadowBlur = 10;
          box3d(c, bx0, yc - bh / 2 + 1, len, bh, 7, -5, fg, "#d4f8ff", "#0f6f93");
          c.restore();
          font(c, 650, fs, fam);
          text(c, money(v), r.x + r.w - 18, yc, TXT, "right");
          c.restore();
        });
        const ty = y0 + n * rh + 8;
        const lg = c.createLinearGradient(r.x + 20, 0, r.x + r.w - 20, 0);
        lg.addColorStop(0, "rgba(58,168,255,0.1)");
        lg.addColorStop(0.5, "rgba(58,168,255,0.7)");
        lg.addColorStop(1, "rgba(58,168,255,0.1)");
        c.fillStyle = lg;
        c.fillRect(r.x + 20, ty, r.w - 40, 1.5);
        const ap = easeOut((lt - 0.7) / 0.6);
        c.save();
        c.globalAlpha *= ap;
        font(c, 700, 16, fam);
        text(c, "Total", r.x + 24, ty + 26, SUB, "left");
        font(c, 800, 22, fam);
        text(c, money(DAILY_TOTAL * easeOut((lt - 0.7) / 1.4)), r.x + r.w - 20, ty + 26, "#ffffff", "right", "#38e1ff", 14);
        c.restore();
      }
      function drawKpi(c, r, k, lt, t, fam, mobile) {
        c.save();
        rr(c, r.x + 12, r.y + 54, r.w - 24, r.h - 66, 12);
        c.fillStyle = "rgba(0,0,0,0.28)";
        c.fill();
        c.clip();
        c.strokeStyle = "rgba(0,0,0,0.6)";
        c.lineWidth = 6;
        c.shadowColor = "rgba(0,0,0,0.8)";
        c.shadowBlur = 10;
        c.shadowOffsetY = 3;
        rr(c, r.x + 9, r.y + 51, r.w - 18, r.h - 60, 14);
        c.stroke();
        c.restore();
        font(c, 650, mobile ? 18 : 19, fam);
        text(c, k.title, r.x + r.w / 2, r.y + 30, TXT, "center");
        const v = k.value * easeOut(lt / 1.6);
        font(c, 800, 40, fam);
        text(c, money(v), r.x + r.w / 2, r.y + 54 + (r.h - 66) / 2 + 2, "#ffffff", "center", k.value > 0 ? k.accent : "rgba(160,170,200,0.5)", 20);
        const cyc = (t + r.x / 400) % 6 / 6;
        const sx = r.x - 120 + cyc * (r.w + 240) * 1;
        c.save();
        rr(c, r.x, r.y, r.w, r.h, 16);
        c.clip();
        const sg = c.createLinearGradient(sx - 60, r.y, sx + 60, r.y + r.h);
        sg.addColorStop(0, "rgba(255,255,255,0)");
        sg.addColorStop(0.5, "rgba(255,255,255,0.07)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = sg;
        c.fillRect(r.x, r.y, r.w, r.h);
        c.restore();
      }
      function chip(c, s, xr, yc, fam) {
        font(c, 750, 16, fam);
        const tw = c.measureText(s).width;
        const w = tw + 22;
        const h = 32;
        const x = xr - w;
        const y = yc - h / 2;
        for (let i = 5; i >= 1; i--) {
          rr(c, x, y + i, w, h, 16);
          c.fillStyle = "#0b5c3a";
          c.fill();
        }
        const g = c.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#6effb9");
        g.addColorStop(0.5, "#22c97c");
        g.addColorStop(1, "#139a5c");
        c.save();
        c.shadowColor = "rgba(60,230,150,0.55)";
        c.shadowBlur = 14;
        rr(c, x, y, w, h, 16);
        c.fillStyle = g;
        c.fill();
        c.restore();
        c.save();
        rr(c, x + 3, y + 2, w - 6, h / 2 - 2, 12);
        c.fillStyle = "rgba(255,255,255,0.25)";
        c.fill();
        c.restore();
        text(c, s, x + w / 2, yc + 1, "#04210f", "center");
      }
      function drawSales(c, r, lt, t, fam, p) {
        const y0 = r.y + 100;
        const list = rows(LAST5);
        const sp = list.length > 1 ? Math.min(140, (r.h - 150) / (list.length - 1)) : 0;
        const lx = r.x + 34;
        const yEnd = y0 + Math.max(0, list.length - 1) * sp;
        const grow = easeOut(lt / 1.4);
        const lg = c.createLinearGradient(0, y0, 0, yEnd);
        lg.addColorStop(0, "#38e1ff");
        lg.addColorStop(1, "#a77bff");
        c.save();
        c.shadowColor = "#38e1ff";
        c.shadowBlur = 10;
        c.fillStyle = lg;
        c.fillRect(lx - 1.5, y0, 3, (yEnd - y0) * grow);
        c.restore();
        if (lt > 1.4) {
          const py = y0 + t * 0.35 % 1 * (yEnd - y0);
          c.save();
          c.shadowColor = "#ffffff";
          c.shadowBlur = 14;
          c.fillStyle = "#ffffff";
          c.beginPath();
          c.arc(lx, py, 3.5, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
        list.forEach(([name, v], i) => {
          const yc = y0 + i * sp;
          const ap = easeOut((lt - 0.2 - 0.18 * i) / 0.7);
          c.save();
          c.globalAlpha *= ap;
          c.translate((1 - ap) * 40, 0);
          if (hotTest(p, r.x + 10, yc - 34, r.w - 20, 68)) rowHighlight(c, r.x + 10, yc - 34, r.w - 20, 68);
          avatar(c, name, lx, yc, 22, fam, "rgba(56,225,255,0.8)");
          font(c, 750, 16, fam);
          const chipW = c.measureText(money(v)).width + 22;
          const nW = r.w - 12 - chipW - 64 - 8;
          font(c, 650, 17, fam);
          const sp2 = name.lastIndexOf(" ");
          if (c.measureText(name).width > nW && sp2 > 0) {
            fitFont(c, 650, 16, fam, name.slice(0, sp2), nW);
            text(c, name.slice(0, sp2), r.x + 64, yc - 10, TXT, "left");
            fitFont(c, 650, 16, fam, name.slice(sp2 + 1), nW);
            text(c, name.slice(sp2 + 1), r.x + 64, yc + 10, TXT, "left");
          } else {
            fitFont(c, 650, 17, fam, name, nW);
            text(c, name, r.x + 64, yc, TXT, "left");
          }
          chip(c, money(v), r.x + r.w - 12, yc, fam);
          c.restore();
        });
      }
      function drawOpps(c, r, lt, fam, p, ex, ey) {
        const y0 = r.y + 72;
        const list = rows(OPPS);
        const sp = Math.min(118, (r.h - 90) / Math.max(1, list.length));
        const ch = Math.min(sp - 16, 64);
        list.forEach((name, i) => {
          const y = y0 + i * sp;
          const ap = easeOut((lt - 0.2 - 0.14 * i) / 0.7);
          const hot = hotTest(p, r.x + 18, y, r.w - 36, ch);
          const lift = hot ? -4 : 0;
          c.save();
          c.globalAlpha *= ap;
          c.translate((1 - ap) * 60, lift);
          const x = r.x + 18;
          const w = r.w - 36 - 6;
          const dx = 3 + ex * 0.4;
          const dy = 5 + ey * 0.2 - lift;
          for (let k = 4; k >= 1; k--) {
            rr(c, x + dx * k / 4, y + dy * k / 4, w, ch, 12);
            c.fillStyle = "#0a0f24";
            c.fill();
          }
          const g = c.createLinearGradient(x, y, x + w, y + ch);
          g.addColorStop(0, hot ? "#2f3f7c" : "#25336a");
          g.addColorStop(1, hot ? "#1c2756" : "#161f45");
          rr(c, x, y, w, ch, 12);
          c.fillStyle = g;
          c.fill();
          c.save();
          c.strokeStyle = hot ? "#ff6fe0" : "rgba(255,111,224,0.45)";
          c.shadowColor = "#ff4fd8";
          c.shadowBlur = hot ? 16 : 6;
          c.lineWidth = 1.2;
          rr(c, x, y, w, ch, 12);
          c.stroke();
          c.restore();
          c.save();
          rr(c, x + 2, y + 2, w - 4, ch / 2 - 2, 10);
          c.fillStyle = "rgba(255,255,255,0.05)";
          c.fill();
          c.restore();
          avatar(c, name, x + 34, y + ch / 2, Math.min(20, ch / 2 - 6), fam);
          fitFont(c, 650, 17, fam, name, w - 66 - 12);
          text(c, name, x + 66, y + ch / 2, TXT, "left");
          c.restore();
        });
      }
      function drawTop(c, r, lt, t, fam, p) {
        const base = r.y + r.h - 86;
        const Hc = Math.max(60, r.h - 250);
        const list = TOP_RANKED();
        const n = Math.max(1, list.length);
        const vmax = Math.max(1, ...list.map((d) => d[1]));
        const left = r.x + 20;
        const slot = (r.w - 40) / Math.max(4, n);
        const span = slot * n;
        const off = (r.w - 40 - span) / 2;
        const dx = Math.min(16, slot * 0.22);
        const dy = -10;
        const cw = Math.min(44, slot * 0.62);
        font(c, 550, 13, fam);
        let nameW = 1;
        list.forEach(([nm]) => nm.split(" ").forEach((w) => {
          nameW = Math.max(nameW, c.measureText(w).width);
        }));
        const nameSize = Math.min(13, 13 * (slot - 6) / nameW);
        const pg = c.createLinearGradient(0, base, 0, base + 16);
        pg.addColorStop(0, "#22305f");
        pg.addColorStop(1, "#111936");
        c.save();
        c.shadowColor = "rgba(58,168,255,0.5)";
        c.shadowBlur = 18;
        box3d(c, left - 4, base, r.w - 40 - dx + 8, 16, dx, dy, pg, "#2c3c74", "#0d1430");
        c.restore();
        c.strokeStyle = "rgba(58,168,255,0.7)";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(left - 4, base);
        c.lineTo(left - 4 + r.w - 40 - dx + 8, base);
        c.stroke();
        list.forEach(([name, v], i) => {
          const [hi, mid, lo] = RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)];
          const x = left + off + slot * i + (slot - cw - dx) / 2;
          const grow = easeOutBack((lt - 0.3 - 0.2 * i) / 1.3);
          const h = Math.max(0, Hc * v / vmax * grow);
          const hot = hotTest(p, left + off + slot * i, base - h - 90, slot, h + 140);
          const fg = c.createLinearGradient(x, 0, x + cw, 0);
          fg.addColorStop(0, lo);
          fg.addColorStop(0.35, mid);
          fg.addColorStop(0.6, hi);
          fg.addColorStop(1, mid);
          c.save();
          c.shadowColor = mid;
          c.shadowBlur = hot ? 30 : 16;
          box3d(c, x, base - h - 1, cw, h, dx, dy, fg, hi, lo);
          c.restore();
          if (h > 20) {
            const sh = (t * 0.5 + i * 0.23) % 1 * h;
            c.save();
            c.beginPath();
            c.rect(x, base - h - 1, cw, h);
            c.clip();
            const sg = c.createLinearGradient(0, base - sh - 30, 0, base - sh + 30);
            sg.addColorStop(0, "rgba(255,255,255,0)");
            sg.addColorStop(0.5, "rgba(255,255,255,0.28)");
            sg.addColorStop(1, "rgba(255,255,255,0)");
            c.fillStyle = sg;
            c.fillRect(x, base - sh - 30, cw, 60);
            c.restore();
          }
          const ap = clamp01((lt - 0.3 - 0.2 * i) / 0.5);
          c.save();
          c.globalAlpha *= ap;
          const ax = x + (cw + dx) / 2;
          const bob = Math.sin(t * 1.6 + i) * 2.5;
          const ay = base - h - 36 + bob;
          avatar(c, name, ax, ay, 20, fam, mid);
          c.save();
          c.shadowColor = "rgba(0,0,0,0.6)";
          c.shadowBlur = 4;
          c.beginPath();
          c.arc(ax + 17, ay - 15, 10, 0, Math.PI * 2);
          c.fillStyle = mid;
          c.fill();
          c.restore();
          font(c, 800, 12, fam);
          text(c, String(i + 1), ax + 17, ay - 14.5, "#0a0f24", "center");
          fitFont(c, 800, n > 4 ? 14 : 17, fam, money(v), slot - 4);
          text(c, money(v * easeOut((lt - 0.3 - 0.2 * i) / 1.3)), ax, ay - (n > 4 ? 34 : 40), "#ffffff", "center", mid, 12);
          c.restore();
          const parts = name.split(" ");
          font(c, hot ? 700 : 550, nameSize, fam);
          text(c, parts[0], x + (cw + dx) / 2, base + 34, hot ? "#ffffff" : TXT, "center");
          text(c, parts.slice(1).join(" "), x + (cw + dx) / 2, base + 52, SUB, "center");
        });
      }
      function makeParticles() {
        const out = [];
        let s = 7;
        const rnd = () => {
          s = (s * 9301 + 49297) % 233280;
          return s / 233280;
        };
        for (let i = 0; i < 70; i++) out.push({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.8, v: 0.01 + rnd() * 0.03, p: rnd() * 6.28 });
        return out;
      }
      var LITE = (() => {
        const m = /[?&]lite=([01])/.exec(location.search);
        if (m) return m[1] === "1";
        const nav = navigator;
        const ua = nav.userAgent || "";
        if (/Android|AFT|CrKey|TV/.test(ua)) return true;
        if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) return true;
        if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 2) return true;
        return false;
      })();
      var LITE_FPS = 24;
      function showFallback(msg) {
        const d = document.createElement("div");
        d.setAttribute("style", "position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:#0a1130;color:#eef2ff;font:20px Arial,sans-serif;text-align:center;");
        d.textContent = msg;
        document.body.appendChild(d);
      }
      var FAM = "Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif";
      var POLL_MS = 6e4;
      var _a, _b;
      var DATA_URL = ((_b = (_a = document.querySelector('meta[name="dashboard-data"]')) == null ? void 0 : _a.content) == null ? void 0 : _b.trim()) || "data.json";
      var MAX_PIXELS = 3840 * 2160 * 1.05;
      function start() {
        const cv = document.getElementById("dash");
        if (!cv) return;
        const ctx = cv.getContext("2d");
        if (!ctx) {
          cv.style.display = "none";
          showFallback("This display can't draw the dashboard (its browser has no canvas support). Try updating the player's system WebView or browser.");
          return;
        }
        if (LITE) {
          Object.defineProperty(ctx, "shadowBlur", { configurable: true, get: () => 0, set: () => {
          } });
          Object.defineProperty(ctx, "shadowColor", { configurable: true, get: () => "rgba(0, 0, 0, 0)", set: () => {
          } });
        }
        const c = ctx;
        const fam = FAM;
        const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const parts = LITE ? makeParticles().slice(0, 12) : makeParticles();
        let cssW = 0;
        let cssH = 0;
        let L = layoutFor(1920, 1080);
        let pointer = null;
        let tiltX = 0;
        let tiltY = 0;
        let begin = -1;
        let loaded = false;
        let online = true;
        let lastJson = "";
        const resize = (force) => {
          const vw = Math.max(300, Math.floor(document.documentElement.clientWidth || window.innerWidth));
          const vh = Math.max(200, Math.floor(window.innerHeight));
          if (!force && vw === cssW && vh === cssH && devicePixelRatio === resize.dpr) return;
          resize.dpr = devicePixelRatio;
          L = layoutFor(vw, vh);
          cssW = vw;
          cssH = L.mobile ? L.H * vw / L.W : vh;
          document.body.classList.toggle("scroll", L.mobile);
          const dpr = Math.max(0.5, Math.min(window.devicePixelRatio || 1, LITE ? 1 : 2, Math.sqrt(MAX_PIXELS / (cssW * cssH))));
          cv.style.width = cssW + "px";
          cv.style.height = cssH + "px";
          cv.width = Math.round(cssW * dpr);
          cv.height = Math.round(cssH * dpr);
        };
        let pend = 0;
        const schedule = () => {
          cancelAnimationFrame(pend);
          pend = requestAnimationFrame(() => resize());
        };
        window.addEventListener("resize", schedule);
        if (typeof ResizeObserver === "function") new ResizeObserver(schedule).observe(document.documentElement);
        cv.addEventListener("pointermove", (e) => {
          const b = cv.getBoundingClientRect();
          pointer = { x: (e.clientX - b.left) / b.width * L.W, y: (e.clientY - b.top) / b.height * L.H };
        });
        cv.addEventListener("pointerleave", () => {
          pointer = null;
        });
        const load = () => __async(null, null, function* () {
          try {
            const res = yield fetch(DATA_URL + (DATA_URL.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const txt = yield res.text();
            const d = JSON.parse(txt);
            if (!validData(d)) throw new Error("data.json has an unexpected shape");
            online = true;
            const norm = JSON.stringify(d);
            if (norm !== lastJson) {
              lastJson = norm;
              applyData(d);
              resize(true);
              if (!loaded) {
                loaded = true;
                begin = performance.now();
              }
            }
          } catch (err) {
            online = false;
            console.warn("Dashboard data refresh failed; keeping last values.", err);
          }
        });
        resize(true);
        load();
        setInterval(load, POLL_MS);
        let lastDraw = -1e9;
        const frame = (now) => {
          requestAnimationFrame(frame);
          if (LITE) {
            if (now - lastDraw < 1e3 / LITE_FPS - 4) return;
            lastDraw = now;
          }
          const sx = cv.width / L.W;
          const sy = cv.height / L.H;
          c.setTransform(sx, 0, 0, sy, 0, 0);
          const W = L.W;
          const H = L.H;
          const t = reduce ? 60 : begin < 0 ? 0 : (now - begin) / 1e3;
          const tx = pointer ? (pointer.x / W - 0.5) * 2 : 0;
          const ty = pointer ? (pointer.y / H - 0.5) * 2 : 0;
          tiltX += (tx - tiltX) * 0.06;
          tiltY += (ty - tiltY) * 0.06;
          const ex = 7 - tiltX * 7;
          const ey = 11 - tiltY * 5;
          const tb = now / 1e3;
          const bg = c.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, "#060a1c");
          bg.addColorStop(0.6, "#0a1130");
          bg.addColorStop(1, "#140a2c");
          c.fillStyle = bg;
          c.fillRect(0, 0, W, H);
          c.save();
          c.strokeStyle = "rgba(80,140,255,0.08)";
          c.lineWidth = 1;
          const vx = W / 2 + tiltX * 40;
          const vy = -H * 0.6;
          for (let i = -20; i <= 20; i++) {
            c.beginPath();
            c.moveTo(vx, vy);
            c.lineTo(W / 2 + i * (W / 12), H);
            c.stroke();
          }
          const off = (reduce ? 60 : tb) * 20 % 48;
          for (let yy = -48 + off; yy < H; yy += 48) {
            c.beginPath();
            c.moveTo(0, yy);
            c.lineTo(W, yy);
            c.stroke();
          }
          c.restore();
          const tp = reduce ? 60 : tb;
          for (const pt of parts) {
            const px = pt.x * W + Math.sin(tp * 0.4 + pt.p) * 10;
            const py = ((pt.y - tp * pt.v) % 1 + 1) % 1 * H;
            c.fillStyle = `rgba(140,200,255,${0.25 + 0.25 * Math.sin(tp * 1.5 + pt.p)})`;
            c.beginPath();
            c.arc(px, py, pt.r, 0, Math.PI * 2);
            c.fill();
          }
          if (loaded) {
            const withPanel = (r, delay, accent, body) => {
              const lt = t - delay;
              const ap = easeOut(lt / 0.8);
              if (ap <= 0) return;
              c.save();
              c.globalAlpha = ap;
              const sc = 0.94 + 0.06 * ap;
              c.translate(r.x + r.w / 2, r.y + r.h / 2 + (1 - ap) * 40);
              c.scale(sc, sc);
              c.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
              panel(c, r, ex, ey, accent);
              body(lt);
              c.restore();
            };
            withPanel(L.gauge, 0.1, EDGE, (lt) => {
              title(c, L.gauge, "Company Monthly Sales", fam, "#38e1ff");
              drawGauge(c, L.gauge, lt - 0.3, t, fam);
            });
            withPanel(L.daily, 0.25, EDGE, (lt) => {
              title(c, L.daily, "Daily Sales", fam, "#38e1ff");
              drawDaily(c, L.daily, lt - 0.3, fam, pointer);
            });
            KPIS.forEach((k, i) => {
              withPanel(L.kpi[i], 0.2 + i * 0.1, k.accent, (lt) => {
                drawKpi(c, L.kpi[i], k, lt - 0.3, t, fam, L.mobile);
              });
            });
            withPanel(L.sales, 0.5, EDGE, (lt) => {
              title(c, L.sales, "Last 5 Sales", fam, "#3ee69a");
              drawSales(c, L.sales, lt - 0.3, t, fam, pointer);
            });
            withPanel(L.opps, 0.6, "#ff4fd8", (lt) => {
              title(c, L.opps, "Last 5 Opps Created", fam, "#ff4fd8");
              drawOpps(c, L.opps, lt - 0.3, fam, pointer, ex, ey);
            });
            withPanel(L.top, 0.7, "#f2b51d", (lt) => {
              title(c, L.top, "Top 5 in Weekly Sales", fam, "#f2b51d");
              drawTop(c, L.top, lt - 0.3, t, fam, pointer);
            });
          } else {
            font(c, 600, 20, fam);
            text(c, "Loading dashboard\u2026", W / 2, H / 2, SUB, "center");
          }
          const fy = L.footer.y + L.footer.h / 2;
          const pulse = 0.5 + 0.5 * Math.sin(tp * 3);
          const dot = online ? "#3ee69a" : "#ffb547";
          c.save();
          c.shadowColor = dot;
          c.shadowBlur = 6 + pulse * 10;
          c.fillStyle = dot;
          c.beginPath();
          c.arc(L.footer.x + 26, fy, 5, 0, Math.PI * 2);
          c.fill();
          c.restore();
          font(c, 500, 14, fam);
          text(c, online ? "Connected" : "Reconnecting\u2026", L.footer.x + 40, fy, SUB, "left");
        };
        requestAnimationFrame(frame);
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
      else start();
    }
  });
  require_dash();
})();
