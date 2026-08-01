import e from "./assets/fonts/a79f1c3119cd700d.woff2";
import t from "./assets/fonts/ec17d132645b2c86.woff2";
import n from "./assets/fonts/55fac25845c12663.woff2";
import r from "./assets/fonts/d42a5579b0283025.woff2";
import i from "./assets/fonts/d3c882a649b3f4fa.woff2";
import a from "./assets/fonts/c3fb5ac22fd413f2.woff2";
import o from "./assets/fonts/6f2bb1dff24614a5.woff2";
import s from "./assets/fonts/8916142bec8821e7.woff2";
import c from "./assets/fonts/0462f03bdf9d9e26.woff2";
import l from "./assets/fonts/572d331f69425f62.woff2";
import u from "./assets/fonts/f28c23acad0b6d75.woff2";
import d from "./assets/fonts/8c5b5494b63adb73.woff2";
import f from "./assets/fonts/3b1e59b3ba055bda.woff2";
import p from "./assets/fonts/ba21ed5f8468b2b7.woff2";
import m from "./assets/fonts/03e9641d6f9e9223.woff2";
import h from "./assets/fonts/eae34984b3dc1874.woff2";
import g from "./assets/fonts/5916a24fa3ab2b17.woff2";
import _ from "./assets/fonts/b4230e7e83f57db8.woff2";
import v from "./assets/fonts/10d95fd3a2a3c8c5.woff2";
import y from "./assets/fonts/a8709e36220dee77.woff2";
//#region src/utils/embedKatexFonts.ts
var b = {
	"KaTeX_AMS|normal|normal": e,
	"KaTeX_Caligraphic|bold|normal": t,
	"KaTeX_Caligraphic|normal|normal": n,
	"KaTeX_Fraktur|bold|normal": r,
	"KaTeX_Fraktur|normal|normal": i,
	"KaTeX_Main|bold|normal": a,
	"KaTeX_Main|bold|italic": o,
	"KaTeX_Main|normal|italic": s,
	"KaTeX_Main|normal|normal": c,
	"KaTeX_Math|bold|italic": l,
	"KaTeX_Math|normal|italic": u,
	"KaTeX_SansSerif|bold|normal": d,
	"KaTeX_SansSerif|normal|italic": f,
	"KaTeX_SansSerif|normal|normal": p,
	"KaTeX_Script|normal|normal": m,
	"KaTeX_Size1|normal|normal": h,
	"KaTeX_Size2|normal|normal": g,
	"KaTeX_Size3|normal|normal": _,
	"KaTeX_Size4|normal|normal": v,
	"KaTeX_Typewriter|normal|normal": y
}, x = /@font-face\s*\{[^}]*\}/g, S = /font-family:([^;]+);/, C = /font-weight:([^;]+);/, w = /font-style:([^;]+);/, T = /src:[^;]*;/, E = /^["']|["']$/g;
function D(e, t, n) {
	var r, i;
	return (r = (i = e.match(t)) == null || (i = i[1]) == null ? void 0 : i.trim().replace(E, "")) == null ? n : r;
}
function O(e) {
	return e.replace(x, (e) => {
		let t = D(e, S, "");
		if (!t) return e;
		let n = b[`${t}|${D(e, C, "normal").toLowerCase()}|${D(e, w, "normal").toLowerCase()}`];
		return n ? e.replace(T, `src: url(${n}) format("woff2");`) : e;
	});
}
//#endregion
export { O as embedKatexFonts };
