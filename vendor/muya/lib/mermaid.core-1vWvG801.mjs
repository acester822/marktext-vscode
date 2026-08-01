import { t as e } from "./purify.es-DSwrAy7H.mjs";
import { a as t, i as n, r, t as i } from "./src-6bhrijpo.mjs";
import { C as a, E as o, I as s, L as c, N as l, P as u, Q as d, S as f, T as p, V as m, W as h, X as g, Z as _, _ as v, b as y, c as b, g as x, l as S, m as C, n as w, p as T, q as ee, r as te, t as E, u as D } from "./chunk-CSCIHK7Q-Z5WIAYJZ.mjs";
import { S as ne, a as O, f as k, g as A, h as re, i as ie, o as j, v as ae, x as oe, y as se } from "./chunk-5ZQYHXKU-LWon6y9A.mjs";
import { t as ce } from "./chunk-WU5MYG2G-CWOh8Nru.mjs";
import { i as le, o as ue } from "./chunk-O5CBEL6O-DN64hWSU.mjs";
import "./chunk-BSJP7CBP-CmHmwk33.mjs";
import "./chunk-L5ZTLDWV-EfUVro68.mjs";
import "./chunk-NZK2D7GU-BP4KY081.mjs";
import "./chunk-3OPIFGDE-Al6MeL3x.mjs";
import "./chunk-KSCS5N6A-Do-wUxiw.mjs";
import { n as de } from "./chunk-LZXEDZCA-CElJAnI4.mjs";
import { n as fe, t as pe } from "./chunk-XPW4576I-oigDzoPt.mjs";
//#region ../../node_modules/.pnpm/es-toolkit@1.47.1/node_modules/es-toolkit/dist/compat/_internal/isPrototype.mjs
function me(e) {
	let t = e == null ? void 0 : e.constructor;
	return e === (typeof t == "function" ? t.prototype : Object.prototype);
}
//#endregion
//#region ../../node_modules/.pnpm/es-toolkit@1.47.1/node_modules/es-toolkit/dist/compat/predicate/isEmpty.mjs
function he(e) {
	if (e == null) return !0;
	if (oe(e)) return typeof e.splice != "function" && typeof e != "string" && !ne(e) && !ae(e) && !se(e) ? !1 : e.length === 0;
	if (typeof e == "object" || typeof e == "function") {
		if (e instanceof Map || e instanceof Set) return e.size === 0;
		let t = Object.keys(e);
		return me(e) ? t.filter((e) => e !== "constructor").length === 0 : t.length === 0;
	}
	return !0;
}
//#endregion
//#region ../../node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Enum.js
var M = "comm", ge = "rule", _e = "decl", ve = "@import", ye = "@namespace", be = "@keyframes", xe = "@layer", Se = Math.abs, N = String.fromCharCode;
function Ce(e) {
	return e.trim();
}
function we(e, t, n) {
	return e.replace(t, n);
}
function P(e, t) {
	return e.charCodeAt(t) | 0;
}
function F(e, t, n) {
	return e.slice(t, n);
}
function I(e) {
	return e.length;
}
function Te(e) {
	return e.length;
}
function L(e, t) {
	return t.push(e), e;
}
//#endregion
//#region ../../node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Tokenizer.js
var R = 1, z = 1, Ee = 0, B = 0, V = 0, H = "";
function De(e, t, n, r, i, a, o, s) {
	return {
		value: e,
		root: t,
		parent: n,
		type: r,
		props: i,
		children: a,
		line: R,
		column: z,
		length: o,
		return: "",
		siblings: s
	};
}
function Oe() {
	return V;
}
function ke() {
	return V = B > 0 ? P(H, --B) : 0, z--, V === 10 && (z = 1, R--), V;
}
function U() {
	return V = B < Ee ? P(H, B++) : 0, z++, V === 10 && (z = 1, R++), V;
}
function W() {
	return P(H, B);
}
function G() {
	return B;
}
function K(e, t) {
	return F(H, e, t);
}
function q(e) {
	switch (e) {
		case 0:
		case 9:
		case 10:
		case 13:
		case 32: return 5;
		case 33:
		case 43:
		case 44:
		case 47:
		case 62:
		case 64:
		case 126:
		case 59:
		case 123:
		case 125: return 4;
		case 58: return 3;
		case 34:
		case 39:
		case 40:
		case 91: return 2;
		case 41:
		case 93: return 1;
	}
	return 0;
}
function Ae(e) {
	return R = z = 1, Ee = I(H = e), B = 0, [];
}
function je(e) {
	return H = "", e;
}
function Me(e) {
	return Ce(K(B - 1, Fe(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function Ne(e) {
	for (; (V = W()) && V < 33;) U();
	return q(e) > 2 || q(V) > 3 ? "" : " ";
}
function Pe(e, t) {
	for (; --t && U() && !(V < 48 || V > 102 || V > 57 && V < 65 || V > 70 && V < 97););
	return K(e, G() + (t < 6 && W() == 32 && U() == 32));
}
function Fe(e) {
	for (; U();) switch (V) {
		case e: return B;
		case 34:
		case 39:
			e !== 34 && e !== 39 && Fe(V);
			break;
		case 40:
			e === 41 && Fe(e);
			break;
		case 92:
			U();
			break;
	}
	return B;
}
function Ie(e, t) {
	for (; U() && e + V !== 57 && !(e + V === 84 && W() === 47););
	return "/*" + K(t, B - 1) + "*" + N(e === 47 ? e : U());
}
function Le(e) {
	for (; !q(W());) U();
	return K(e, B);
}
//#endregion
//#region ../../node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Parser.js
function Re(e) {
	return je(J("", null, null, null, [""], e = Ae(e), 0, [0], e));
}
function J(e, t, n, r, i, a, o, s, c) {
	for (var l = 0, u = 0, d = o, f = 0, p = 0, m = 0, h = 1, g = 1, _ = 1, v = 0, y = 0, b = "", x = i, S = a, C = r, w = b; g;) switch (m = y, y = U()) {
		case 40:
			m != 108 && P(w, d - 1) == 58 ? (v++, w += "(") : w += Me(y);
			break;
		case 41:
			v--, w += ")";
			break;
		case 34:
		case 39:
		case 91:
			w += Me(y);
			break;
		case 9:
		case 10:
		case 13:
		case 32:
			if (v > 0) {
				w += N(y);
				break;
			}
			w += Ne(m);
			break;
		case 92:
			w += Pe(G() - 1, 7);
			continue;
		case 47:
			switch (W()) {
				case 42:
				case 47:
					L(Be(Ie(U(), G()), t, n, c), c), (q(m || 1) == 5 || q(W() || 1) == 5) && I(w) && F(w, -1, void 0) !== " " && (w += " ");
					break;
				default: w += "/";
			}
			break;
		case 123 * h: s[l++] = I(w) * _;
		case 125 * h:
		case 59:
		case 0:
			if (v > 0 && y) {
				w += N(y);
				break;
			}
			switch (y) {
				case 0:
				case 125: g = 0;
				case 59 + u:
					_ == -1 && (w = we(w, /\f/g, "")), p > 0 && (I(w) - d || h === 0) && L(p > 32 ? Ve(w + ";", r, n, d - 1, c) : Ve(we(w, " ", "") + ";", r, n, d - 2, c), c);
					break;
				case 59: w += ";";
				default: if (L(C = ze(w, t, n, l, u, i, s, b, x = [], S = [], d, a), a), y === 123) if (u === 0) J(w, t, C, C, x, a, d, s, S);
				else {
					switch (f) {
						case 99: if (P(w, 3) === 110) break;
						case 108: if (P(w, 2) === 97) break;
						default: u = 0;
						case 100:
						case 109:
						case 115:
					}
					u ? J(e, C, C, r && L(ze(e, C, C, 0, 0, i, s, b, i, x = [], d, S), S), i, S, d, s, r ? x : S) : J(w, C, C, C, [""], S, 0, s, S);
				}
			}
			l = u = p = 0, h = _ = 1, b = w = "", d = o;
			break;
		case 58: d = 1 + I(w), p = m;
		default:
			if (h < 1) {
				if (y == 123) --h;
				else if (y == 125 && h++ == 0 && ke() == 125) continue;
			}
			switch (w += N(y), y * h) {
				case 38:
					_ = u > 0 ? 1 : (w += "\f", -1);
					break;
				case 44:
					if (v > 0) break;
					s[l++] = (I(w) - 1) * _, _ = 1;
					break;
				case 64:
					W() === 45 && (w += Me(U())), f = W(), u = d = I(b = w += Le(G())), y++;
					break;
				case 45: m === 45 && I(w) == 2 && (h = 0);
			}
	}
	return a;
}
function ze(e, t, n, r, i, a, o, s, c, l, u, d) {
	for (var f = i - 1, p = i === 0 ? a : [""], m = Te(p), h = 0, g = 0, _ = 0; h < r; ++h) for (var v = 0, y = F(e, f + 1, f = Se(g = o[h])), b = e; v < m; ++v) (b = Ce(g > 0 ? p[v] + " " + y : we(y, /&\f/g, p[v]))) && (c[_++] = b);
	return De(e, t, n, i === 0 ? ge : s, c, l, u, d);
}
function Be(e, t, n, r) {
	return De(e, t, n, M, N(Oe()), F(e, 2, -2), 0, r);
}
function Ve(e, t, n, r, i) {
	return De(e, t, n, _e, F(e, 0, r), F(e, r + 1, -1), r, i);
}
//#endregion
//#region ../../node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Serializer.js
function He(e, t) {
	for (var n = "", r = 0; r < e.length; r++) n += t(e[r], r, e, t) || "";
	return n;
}
function Ue(e, t, n, r) {
	switch (e.type) {
		case xe: if (e.children.length) break;
		case ve:
		case ye:
		case _e: return e.return = e.return || e.value;
		case M: return "";
		case be: return e.return = e.value + "{" + He(e.children, r) + "}";
		case ge: if (!I(e.value = e.props.join(","))) return "";
	}
	return I(n = He(e.children, r)) ? e.return = e.value + "{" + n + "}" : "";
}
//#endregion
//#region ../../node_modules/.pnpm/stylis@4.4.0/node_modules/stylis/src/Middleware.js
function We(e) {
	var t = Te(e);
	return function(n, r, i, a) {
		for (var o = "", s = 0; s < t; s++) o += e[s](n, r, i, a) || "";
		return o;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/mermaid@11.15.0/node_modules/mermaid/dist/mermaid.core.mjs
var Ge, Ke = "c4", qe = {
	id: Ke,
	detector: /* @__PURE__ */ r((e) => /^\s*C4Context|C4Container|C4Component|C4Dynamic|C4Deployment/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./c4Diagram-AAUBKEIU-C1gHcnd7.mjs");
		return {
			id: Ke,
			diagram: e
		};
	}, "loader")
}, Je = "flowchart", Ye = {
	id: Je,
	detector: /* @__PURE__ */ r((e, t) => {
		var n, r;
		return (t == null || (n = t.flowchart) == null ? void 0 : n.defaultRenderer) === "dagre-wrapper" || (t == null || (r = t.flowchart) == null ? void 0 : r.defaultRenderer) === "elk" ? !1 : /^\s*graph/.test(e);
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./flowDiagram-I6XJVG4X-DMCP00T5.mjs");
		return {
			id: Je,
			diagram: e
		};
	}, "loader")
}, Xe = "flowchart-v2", Ze = {
	id: Xe,
	detector: /* @__PURE__ */ r((e, t) => {
		var n, r, i;
		return (t == null || (n = t.flowchart) == null ? void 0 : n.defaultRenderer) === "dagre-d3" ? !1 : ((t == null || (r = t.flowchart) == null ? void 0 : r.defaultRenderer) === "elk" && (t.layout = "elk"), /^\s*graph/.test(e) && (t == null || (i = t.flowchart) == null ? void 0 : i.defaultRenderer) === "dagre-wrapper" ? !0 : /^\s*flowchart/.test(e));
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./flowDiagram-I6XJVG4X-DMCP00T5.mjs");
		return {
			id: Xe,
			diagram: e
		};
	}, "loader")
}, Qe = "er", $e = {
	id: Qe,
	detector: /* @__PURE__ */ r((e) => /^\s*erDiagram/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./erDiagram-TEJ5UH35-CgwcS_qO.mjs");
		return {
			id: Qe,
			diagram: e
		};
	}, "loader")
}, et = "gitGraph", tt = {
	id: et,
	detector: /* @__PURE__ */ r((e) => /^\s*gitGraph/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./gitGraphDiagram-PVQCEYII-B-aoEmtX.mjs");
		return {
			id: et,
			diagram: e
		};
	}, "loader")
}, nt = "gantt", rt = {
	id: nt,
	detector: /* @__PURE__ */ r((e) => /^\s*gantt/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./ganttDiagram-6RSMTGT7-BaAJhYSN.mjs");
		return {
			id: nt,
			diagram: e
		};
	}, "loader")
}, it = "info", at = {
	id: it,
	detector: /* @__PURE__ */ r((e) => /^\s*info/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./infoDiagram-5YYISTIA-DUxZ_KbE.mjs");
		return {
			id: it,
			diagram: e
		};
	}, "loader")
}, ot = "pie", st = {
	id: ot,
	detector: /* @__PURE__ */ r((e) => /^\s*pie/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./pieDiagram-4H26LBE5-DFF80_7-.mjs");
		return {
			id: ot,
			diagram: e
		};
	}, "loader")
}, ct = "quadrantChart", lt = {
	id: ct,
	detector: /* @__PURE__ */ r((e) => /^\s*quadrantChart/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./quadrantDiagram-W4KKPZXB-Bc8YbzCB.mjs");
		return {
			id: ct,
			diagram: e
		};
	}, "loader")
}, ut = "xychart", dt = {
	id: ut,
	detector: /* @__PURE__ */ r((e) => /^\s*xychart(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./xychartDiagram-2RQKCTM6-BbaR14gK.mjs");
		return {
			id: ut,
			diagram: e
		};
	}, "loader")
}, ft = "requirement", pt = {
	id: ft,
	detector: /* @__PURE__ */ r((e) => /^\s*requirement(Diagram)?/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./requirementDiagram-4Y6WPE33-BNwWtpUt.mjs");
		return {
			id: ft,
			diagram: e
		};
	}, "loader")
}, mt = "sequence", ht = {
	id: mt,
	detector: /* @__PURE__ */ r((e) => /^\s*sequenceDiagram/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./sequenceDiagram-3UESZ5HK-CAIngYwS.mjs");
		return {
			id: mt,
			diagram: e
		};
	}, "loader")
}, gt = "class", _t = {
	id: gt,
	detector: /* @__PURE__ */ r((e, t) => {
		var n;
		return (t == null || (n = t.class) == null ? void 0 : n.defaultRenderer) === "dagre-wrapper" ? !1 : /^\s*classDiagram/.test(e);
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./classDiagram-4FO5ZUOK-8G2kueHg.mjs");
		return {
			id: gt,
			diagram: e
		};
	}, "loader")
}, vt = "classDiagram", yt = {
	id: vt,
	detector: /* @__PURE__ */ r((e, t) => {
		var n;
		return /^\s*classDiagram/.test(e) && (t == null || (n = t.class) == null ? void 0 : n.defaultRenderer) === "dagre-wrapper" ? !0 : /^\s*classDiagram-v2/.test(e);
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./classDiagram-v2-Q7XG4LA2-CFqstTzl.mjs");
		return {
			id: vt,
			diagram: e
		};
	}, "loader")
}, bt = "state", xt = {
	id: bt,
	detector: /* @__PURE__ */ r((e, t) => {
		var n;
		return (t == null || (n = t.state) == null ? void 0 : n.defaultRenderer) === "dagre-wrapper" ? !1 : /^\s*stateDiagram/.test(e);
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./stateDiagram-AJRCARHV-FFgIS02_.mjs");
		return {
			id: bt,
			diagram: e
		};
	}, "loader")
}, St = "stateDiagram", Ct = {
	id: St,
	detector: /* @__PURE__ */ r((e, t) => {
		var n;
		return !!(/^\s*stateDiagram-v2/.test(e) || /^\s*stateDiagram/.test(e) && (t == null || (n = t.state) == null ? void 0 : n.defaultRenderer) === "dagre-wrapper");
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./stateDiagram-v2-BHNVJYJU-DUXddQe2.mjs");
		return {
			id: St,
			diagram: e
		};
	}, "loader")
}, wt = "journey", Tt = {
	id: wt,
	detector: /* @__PURE__ */ r((e) => /^\s*journey/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./journeyDiagram-JHISSGLW-sPlbyqba.mjs");
		return {
			id: wt,
			diagram: e
		};
	}, "loader")
}, Et = { draw: /* @__PURE__ */ r((e, t, r) => {
	n.debug("rendering svg for syntax error\n");
	let i = ce(t), a = i.append("g");
	i.attr("viewBox", "0 0 2412 512"), b(i, 100, 512, !0), a.append("path").attr("class", "error-icon").attr("d", "m411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z"), a.append("path").attr("class", "error-icon").attr("d", "m459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z"), a.append("path").attr("class", "error-icon").attr("d", "m340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z"), a.append("path").attr("class", "error-icon").attr("d", "m400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z"), a.append("path").attr("class", "error-icon").attr("d", "m496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z"), a.append("path").attr("class", "error-icon").attr("d", "m436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z"), a.append("text").attr("class", "error-text").attr("x", 1440).attr("y", 250).attr("font-size", "150px").style("text-anchor", "middle").text("Syntax error in text"), a.append("text").attr("class", "error-text").attr("x", 1250).attr("y", 400).attr("font-size", "100px").style("text-anchor", "middle").text(`mermaid version ${r}`);
}, "draw") }, Dt = Et, Ot = {
	db: {},
	renderer: Et,
	parser: { parse: /* @__PURE__ */ r(() => {}, "parse") }
}, kt = "flowchart-elk", At = {
	id: kt,
	detector: /* @__PURE__ */ r((e, t = {}) => {
		var n;
		return /^\s*flowchart-elk/.test(e) || /^\s*(flowchart|graph)/.test(e) && (t == null || (n = t.flowchart) == null ? void 0 : n.defaultRenderer) === "elk" ? (t.layout = "elk", !0) : !1;
	}, "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./flowDiagram-I6XJVG4X-DMCP00T5.mjs");
		return {
			id: kt,
			diagram: e
		};
	}, "loader")
}, jt = "timeline", Mt = {
	id: jt,
	detector: /* @__PURE__ */ r((e) => /^\s*timeline/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./timeline-definition-PNZ67QCA-CzxhVGMJ.mjs");
		return {
			id: jt,
			diagram: e
		};
	}, "loader")
}, Nt = "mindmap", Pt = {
	id: Nt,
	detector: /* @__PURE__ */ r((e) => /^\s*mindmap/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./mindmap-definition-RKZ34NQL-Mb7t7wT7.mjs");
		return {
			id: Nt,
			diagram: e
		};
	}, "loader")
}, Ft = "kanban", It = {
	id: Ft,
	detector: /* @__PURE__ */ r((e) => /^\s*kanban/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./kanban-definition-UN3LZRKU-C5b6j5B3.mjs");
		return {
			id: Ft,
			diagram: e
		};
	}, "loader")
}, Lt = "sankey", Rt = {
	id: Lt,
	detector: /* @__PURE__ */ r((e) => /^\s*sankey(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./sankeyDiagram-5OEKKPKP-vHvnEB2h.mjs");
		return {
			id: Lt,
			diagram: e
		};
	}, "loader")
}, zt = "packet", Bt = {
	id: zt,
	detector: /* @__PURE__ */ r((e) => /^\s*packet(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./diagram-LMA3HP47-DaBQHlTQ.mjs");
		return {
			id: zt,
			diagram: e
		};
	}, "loader")
}, Vt = "radar", Ht = {
	id: Vt,
	detector: /* @__PURE__ */ r((e) => /^\s*radar-beta/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./diagram-2AECGRRQ-CT7X-Acd.mjs");
		return {
			id: Vt,
			diagram: e
		};
	}, "loader")
}, Ut = "block", Wt = {
	id: Ut,
	detector: /* @__PURE__ */ r((e) => /^\s*block(-beta)?/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./blockDiagram-GPEHLZMM-DGp3ZmSz.mjs");
		return {
			id: Ut,
			diagram: e
		};
	}, "loader")
}, Gt = "treeView", Kt = {
	id: Gt,
	detector: /* @__PURE__ */ r((e) => /^\s*treeView-beta/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./diagram-5GNKFQAL-dIEERbme.mjs");
		return {
			id: Gt,
			diagram: e
		};
	}, "loader")
}, qt = "architecture", Jt = {
	id: qt,
	detector: /* @__PURE__ */ r((e) => /^\s*architecture/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./architectureDiagram-3BPJPVTR-amBx_978.mjs");
		return {
			id: qt,
			diagram: e
		};
	}, "loader")
}, Yt = "eventmodeling", Xt = {
	id: Yt,
	detector: /* @__PURE__ */ r((e) => /^\s*eventmodeling/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./diagram-KO2AKTUF-DGqPBMaN.mjs");
		return {
			id: Yt,
			diagram: e
		};
	}, "loader")
}, Zt = "ishikawa", Qt = {
	id: Zt,
	detector: /* @__PURE__ */ r((e) => /^\s*ishikawa(-beta)?\b/i.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./ishikawaDiagram-YF4QCWOH-_iATrZR0.mjs");
		return {
			id: Zt,
			diagram: e
		};
	}, "loader")
}, $t = "venn", en = {
	id: $t,
	detector: /* @__PURE__ */ r((e) => /^\s*venn-beta/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./vennDiagram-CIIHVFJN-PfsPpOKC.mjs");
		return {
			id: $t,
			diagram: e
		};
	}, "loader")
}, tn = "treemap", nn = {
	id: tn,
	detector: /* @__PURE__ */ r((e) => /^\s*treemap/.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./diagram-OG6HWLK6-CSzV6hiS.mjs");
		return {
			id: tn,
			diagram: e
		};
	}, "loader")
}, rn = "wardley-beta", an = {
	id: rn,
	detector: /* @__PURE__ */ r((e) => /^\s*wardley-beta/i.test(e), "detector"),
	loader: /* @__PURE__ */ r(async () => {
		let { diagram: e } = await import("./wardleyDiagram-YWT4CUSO-Cv0nRYRt.mjs");
		return {
			id: rn,
			diagram: e
		};
	}, "loader")
}, on = !1, Y = /* @__PURE__ */ r(() => {
	on || (on = !0, l("error", Ot, (e) => e.toLowerCase().trim() === "error"), l("---", {
		db: { clear: /* @__PURE__ */ r(() => {}, "clear") },
		styles: {},
		renderer: { draw: /* @__PURE__ */ r(() => {}, "draw") },
		parser: { parse: /* @__PURE__ */ r(() => {
			throw Error("Diagrams beginning with --- are not valid. If you were trying to use a YAML front-matter, please ensure that you've correctly opened and closed the YAML front-matter with un-indented `---` blocks");
		}, "parse") },
		init: /* @__PURE__ */ r(() => null, "init")
	}, (e) => e.toLowerCase().trimStart().startsWith("---")), u(At, Pt, Jt), u(qe, It, yt, _t, $e, rt, at, st, pt, ht, Ze, Ye, Mt, tt, Ct, xt, Tt, lt, Rt, Bt, dt, Wt, Xt, Kt, Ht, Qt, nn, en, an));
}, "addDiagrams"), sn = /* @__PURE__ */ r(async () => {
	n.debug("Loading registered diagrams");
	let e = (await Promise.allSettled(Object.entries(C).map(async ([e, { detector: t, loader: r }]) => {
		if (r) try {
			f(e);
		} catch {
			try {
				let { diagram: e, id: n } = await r();
				l(n, e, t);
			} catch (t) {
				throw n.error(`Failed to load external diagram with key ${e}. Removing from detectors.`), delete C[e], t;
			}
		}
	}))).filter((e) => e.status === "rejected");
	if (e.length > 0) {
		n.error(`Failed to load ${e.length} external diagrams`);
		for (let t of e) n.error(t);
		throw Error(`Failed to load ${e.length} external diagrams`);
	}
}, "loadRegisteredDiagrams"), cn = "graphics-document document";
function ln(e, t) {
	e.attr("role", cn), t !== "" && e.attr("aria-roledescription", t);
}
r(ln, "setA11yDiagramInfo");
function un(e, t, n, r) {
	if (e.insert !== void 0) {
		if (n) {
			let t = `chart-desc-${r}`;
			e.attr("aria-describedby", t), e.insert("desc", ":first-child").attr("id", t).text(n);
		}
		if (t) {
			let n = `chart-title-${r}`;
			e.attr("aria-labelledby", n), e.insert("title", ":first-child").attr("id", n).text(t);
		}
	}
}
r(un, "addSVGa11yTitleDescription");
var dn = (Ge = class e {
	constructor(e, t, n, r, i) {
		this.type = e, this.text = t, this.db = n, this.parser = r, this.renderer = i;
	}
	static async fromText(t, n = {}) {
		var r;
		let i = y(), o = T(t, i);
		t = j(t) + "\n";
		try {
			f(o);
		} catch {
			let e = a(o);
			if (!e) throw new E(`Diagram ${o} not found.`);
			let { id: t, diagram: n } = await e();
			l(t, n);
		}
		let { db: s, parser: c, renderer: u, init: d } = f(o);
		if (c.parser && (c.parser.yy = s), (r = s.clear) == null || r.call(s), d == null || d(i), n.title) {
			var p;
			(p = s.setDiagramTitle) == null || p.call(s, n.title);
		}
		return await c.parse(t), new e(o, t, s, c, u);
	}
	async render(e, t) {
		await this.renderer.draw(this.text, e, t, this);
	}
	getParser() {
		return this.parser;
	}
	getType() {
		return this.type;
	}
}, r(Ge, "Diagram"), Ge), fn = [], pn = /* @__PURE__ */ r(() => {
	fn.forEach((e) => {
		e();
	}), fn = [];
}, "attachFunctions"), mn = /* @__PURE__ */ r((e) => e.replace(/^\s*%%(?!{)[^\n]+\n?/gm, "").trimStart(), "cleanupComments");
function hn(e) {
	var t;
	let n = e.match(v);
	if (!n) return {
		text: e,
		metadata: {}
	};
	let r = (t = fe(n[1], { schema: pe })) == null ? {} : t;
	r = typeof r == "object" && !Array.isArray(r) ? r : {};
	let i = {};
	return r.displayMode && (i.displayMode = r.displayMode.toString()), r.title && (i.title = r.title.toString()), r.config && (i.config = r.config), {
		text: e.slice(n[0].length),
		metadata: i
	};
}
r(hn, "extractFrontMatter");
var gn = /* @__PURE__ */ r((e) => e.replace(/\r\n?/g, "\n").replace(/<(\w+)([^>]*)>/g, (e, t, n) => "<" + t + n.replace(/="([^"]*)"/g, "='$1'") + ">"), "cleanupText"), _n = /* @__PURE__ */ r((e) => {
	let { text: t, metadata: n } = hn(e), { displayMode: r, title: i, config: a = {} } = n;
	return r && (a.gantt || (a.gantt = {}), a.gantt.displayMode = r), {
		title: i,
		config: a,
		text: t
	};
}, "processFrontmatter"), vn = /* @__PURE__ */ r((e) => {
	var t;
	let n = (t = A.detectInit(e)) == null ? {} : t, r = A.detectDirective(e, "wrap");
	return Array.isArray(r) ? n.wrap = r.some(({ type: e }) => e === "wrap") : (r == null ? void 0 : r.type) === "wrap" && (n.wrap = !0), {
		text: re(e),
		directive: n
	};
}, "processDirectives");
function yn(e) {
	let t = _n(gn(e)), n = vn(t.text), r = ie(t.config, n.directive);
	return e = mn(n.text), {
		code: e,
		title: t.title,
		config: r
	};
}
r(yn, "preprocessDiagram");
function bn(e) {
	let t = new TextEncoder().encode(e), n = Array.from(t, (e) => String.fromCodePoint(e)).join("");
	return btoa(n);
}
r(bn, "toBase64");
var xn = 5e4, Sn = "graph TB;a[Maximum text size in diagram exceeded];style a fill:#faa", Cn = "sandbox", wn = "loose", Tn = "http://www.w3.org/2000/svg", En = "http://www.w3.org/1999/xlink", Dn = "http://www.w3.org/1999/xhtml", On = "100%", kn = "100%", An = "border:0;margin:0;", jn = "margin:0", Mn = "allow-top-navigation-by-user-activation allow-popups", Nn = "The \"iframe\" tag is not supported by your browser.", Pn = ["foreignobject"], Fn = ["dominant-baseline"];
function In(e) {
	var t;
	let n = yn(e);
	return s(), w((t = n.config) == null ? {} : t), n;
}
r(In, "processAndSetConfigs");
async function Ln(e, t) {
	Y();
	try {
		let { code: t, config: n } = In(e);
		return {
			diagramType: (await Yn(t)).type,
			config: n
		};
	} catch (e) {
		if (t != null && t.suppressErrors) return !1;
		throw e;
	}
}
r(Ln, "parse");
var Rn = /* @__PURE__ */ r((e, t, n = []) => `.${e} ${t} ${c(`{ ${n.join(" !important; ")} !important; }`)}`, "cssImportantStyles"), zn = /* @__PURE__ */ r((e, t = /* @__PURE__ */ new Map()) => {
	let n = new CSSStyleSheet();
	if (e.fontFamily !== void 0 && n.insertRule(`:root { --mermaid-font-family: ${e.fontFamily}}`, n.cssRules.length), e.altFontFamily !== void 0 && n.insertRule(`:root { --mermaid-alt-font-family: ${e.altFontFamily}}`, n.cssRules.length), t instanceof Map) {
		let r = p(e) ? ["> *", "span"] : [
			"rect",
			"polygon",
			"ellipse",
			"circle",
			"path"
		];
		t.forEach((e) => {
			he(e.styles) || r.forEach((t) => {
				n.insertRule(Rn(e.id, t, e.styles), n.cssRules.length);
			}), he(e.textStyles) || n.insertRule(Rn(e.id, "tspan", ((e == null ? void 0 : e.textStyles) || []).map((e) => e.replace("color", "fill"))), n.cssRules.length);
		});
	}
	let r = "";
	if (e.themeCSS !== void 0) if (typeof n.replaceSync == "function") {
		let t = new CSSStyleSheet();
		t.replaceSync(e.themeCSS), r = S(t) + "\n";
	} else r += `${e.themeCSS}
`;
	return r + S(n);
}, "createCssStyles"), Bn = /* @__PURE__ */ r((e, t) => He(Re(`${e}{${t}}`), We([/* @__PURE__ */ r(function(t, r, i, a) {
	if (t.type === "rule" && Array.isArray(t.props)) {
		if (t.parent && t.parent.type === "@keyframes") return;
		t.props = t.props.map((t) => t.startsWith(e) ? t : `${e} ${t}`);
	} else t.type.startsWith("@") && ([
		"@media",
		"@supports",
		"@layer",
		"@scope",
		"@container",
		"@starting-style",
		"@keyframes"
	].includes(t.type) || (n.warn(`Removing unsupported at-rule ${t.type} from CSS`), t.type = M));
}, "addNamespace"), Ue])), "compileCSS"), Vn = /* @__PURE__ */ r((e, t, n, r) => Bn(r, g(t, zn(e, n), {
	...e.themeVariables,
	theme: e.theme,
	look: e.look
}, r)), "createUserStyles"), Hn = /* @__PURE__ */ r((e = "", t, n) => {
	let r = e;
	return !n && !t && (r = r.replace(/marker-end="url\([\d+./:=?A-Za-z-]*?#/g, "marker-end=\"url(#")), r = O(r), r = r.replace(/<br>/g, "<br/>"), r;
}, "cleanUpSvgCode"), Un = /* @__PURE__ */ r((e = "", t) => {
	var n;
	return `<iframe style="width:${On};height:${!(t == null || (n = t.viewBox) == null || (n = n.baseVal) == null) && n.height ? t.viewBox.baseVal.height + "px" : kn};${An}" src="data:text/html;charset=UTF-8;base64,${bn(`<body style="${jn}">${e}</body>`)}" sandbox="${Mn}">
  ${Nn}
</iframe>`;
}, "putIntoIFrame"), Wn = /* @__PURE__ */ r((e, t, n, r, i) => {
	let a = e.append("div");
	a.attr("id", n), r && a.attr("style", r);
	let o = a.append("svg").attr("id", t).attr("width", "100%").attr("xmlns", Tn);
	return i && o.attr("xmlns:xlink", i), o.append("g"), e;
}, "appendDivSvgG");
function Gn(e, t) {
	return e.append("iframe").attr("id", t).attr("style", "width: 100%; height: 100%;").attr("sandbox", "");
}
r(Gn, "sandboxedIframe");
var Kn = /* @__PURE__ */ r((e, t, n, r) => {
	var i, a, o;
	(i = e.getElementById(t)) == null || i.remove(), (a = e.getElementById(n)) == null || a.remove(), (o = e.getElementById(r)) == null || o.remove();
}, "removeExistingElements"), qn = /* @__PURE__ */ r(async function(t, a, o) {
	var s, c, l, u, d, f, p;
	Y();
	let m = In(a);
	a = m.code;
	let h = y();
	n.debug(h), a.length > ((s = h == null ? void 0 : h.maxTextSize) == null ? xn : s) && (a = Sn);
	let g = `#${t}`, _ = "i" + t, v = "#" + _, b = "d" + t, S = "#" + b, C = /* @__PURE__ */ r(() => {
		let e = i(T ? v : S).node();
		e && "remove" in e && e.remove();
	}, "removeTempElements"), w = i(document.body), T = h.securityLevel === Cn, ee = h.securityLevel === wn, te = h.fontFamily;
	o === void 0 ? (Kn(document, t, b, _), T ? (w = i(Gn(i(document.body), _).nodes()[0].contentDocument.body), w.node().style.margin = "0") : w = i("body"), Wn(w, t, b)) : (o && (o.innerHTML = ""), T ? (w = i(Gn(i(o), _).nodes()[0].contentDocument.body), w.node().style.margin = "0") : w = i(o), Wn(w, t, b, `font-family: ${te}`, En));
	let E, D;
	try {
		E = await dn.fromText(a, { title: m.title });
	} catch (e) {
		if (h.suppressErrorRendering) throw C(), e;
		E = await dn.fromText("error"), D = e;
	}
	let ne = w.select(S).node(), O = E.type, k = ne.firstChild, A = k.firstChild, re = Vn(h, O, (c = (l = E.renderer).getClasses) == null ? void 0 : c.call(l, a, E), g), ie = document.createElement("style");
	ie.innerHTML = re, k.insertBefore(ie, A);
	try {
		await E.renderer.draw(a, t, "11.15.0", E);
	} catch (e) {
		throw h.suppressErrorRendering ? C() : Dt.draw(a, t, "11.15.0"), e;
	}
	Xn(O, w.select(`${S} svg`), (u = (d = E.db).getAccTitle) == null ? void 0 : u.call(d), (f = (p = E.db).getAccDescription) == null ? void 0 : f.call(p)), w.select(`[id="${t}"]`).selectAll("foreignobject > *").attr("xmlns", Dn);
	let j = w.select(S).node().innerHTML;
	if (n.debug("config.arrowMarkerAbsolute", h.arrowMarkerAbsolute), j = Hn(j, T, x(h.arrowMarkerAbsolute)), T) {
		let e = w.select(S + " svg").node();
		j = Un(j, e);
	} else ee || (j = e.sanitize(j, {
		ADD_TAGS: Pn,
		ADD_ATTR: Fn,
		HTML_INTEGRATION_POINTS: { foreignobject: !0 }
	}));
	if (pn(), D) throw D;
	return C(), {
		diagramType: O,
		svg: j,
		bindFunctions: E.db.bindFunctions
	};
}, "render");
function Jn(e = {}) {
	var n;
	let r = te({}, e);
	r != null && r.fontFamily && !((n = r.themeVariables) != null && n.fontFamily) && (r.themeVariables || (r.themeVariables = {}), r.themeVariables.fontFamily = r.fontFamily), m(r), r != null && r.theme && r.theme in _ ? r.themeVariables = _[r.theme].getThemeVariables(r.themeVariables) : r && (r.themeVariables = _.default.getThemeVariables(r.themeVariables)), t((typeof r == "object" ? ee(r) : o()).logLevel), Y();
}
r(Jn, "initialize");
var Yn = /* @__PURE__ */ r((e, t = {}) => {
	let { code: n } = yn(e);
	return dn.fromText(n, t);
}, "getDiagramFromText");
function Xn(e, t, n, r) {
	ln(t, e), un(t, n, r, t.attr("id"));
}
r(Xn, "addA11yInfo");
var X = Object.freeze({
	render: qn,
	parse: Ln,
	getDiagramFromText: Yn,
	initialize: Jn,
	getConfig: y,
	setConfig: h,
	getSiteConfig: o,
	updateSiteConfig: d,
	reset: /* @__PURE__ */ r(() => {
		s();
	}, "reset"),
	globalReset: /* @__PURE__ */ r(() => {
		s(D);
	}, "globalReset"),
	defaultConfig: D
});
t(y().logLevel), s(y());
var Zn = /* @__PURE__ */ r((e, t, r) => {
	n.warn(e), k(e) ? (r && r(e.str, e.hash), t.push({
		...e,
		message: e.str,
		error: e
	})) : (r && r(e), e instanceof Error && t.push({
		str: e.message,
		message: e.message,
		hash: e.name,
		error: e
	}));
}, "handleError"), Qn = /* @__PURE__ */ r(async function(e = { querySelector: ".mermaid" }) {
	try {
		await $n(e);
	} catch (t) {
		if (k(t) && n.error(t.str), $.parseError && $.parseError(t), !e.suppressErrors) throw n.error("Use the suppressErrors option to suppress these errors"), t;
	}
}, "run"), $n = /* @__PURE__ */ r(async function({ postRenderCallback: e, querySelector: t, nodes: r } = { querySelector: ".mermaid" }) {
	let i = X.getConfig();
	n.debug(`${e ? "" : "No "}Callback function found`);
	let a;
	if (r) a = r;
	else if (t) a = document.querySelectorAll(t);
	else throw Error("Nodes and querySelector are both undefined");
	n.debug(`Found ${a.length} diagrams`), (i == null ? void 0 : i.startOnLoad) !== void 0 && (n.debug("Start On Load: " + (i == null ? void 0 : i.startOnLoad)), X.updateSiteConfig({ startOnLoad: i == null ? void 0 : i.startOnLoad }));
	let o = new A.InitIDGenerator(i.deterministicIds, i.deterministicIDSeed), s, c = [];
	for (let t of Array.from(a)) {
		if (n.info("Rendering diagram: " + t.id), t.getAttribute("data-processed")) continue;
		t.setAttribute("data-processed", "true");
		let r = `mermaid-${o.next()}`;
		s = t.innerHTML, s = ue(A.entityDecode(s)).trim().replace(/<br\s*\/?>/gi, "<br/>");
		let i = A.detectInit(s);
		i && n.debug("Detected early reinit: ", i);
		try {
			let { svg: n, bindFunctions: i } = await sr(r, s, t);
			t.innerHTML = n, e && await e(r), i && i(t);
		} catch (e) {
			Zn(e, c, $.parseError);
		}
	}
	if (c.length > 0) throw c[0];
}, "runThrowsErrors"), er = /* @__PURE__ */ r(function(e) {
	X.initialize(e);
}, "initialize"), tr = /* @__PURE__ */ r(async function(e, t, r) {
	n.warn("mermaid.init is deprecated. Please use run instead."), e && er(e);
	let i = {
		postRenderCallback: r,
		querySelector: ".mermaid"
	};
	typeof t == "string" ? i.querySelector = t : t && (t instanceof HTMLElement ? i.nodes = [t] : i.nodes = t), await Qn(i);
}, "init"), nr = /* @__PURE__ */ r(async (e, { lazyLoad: t = !0 } = {}) => {
	Y(), u(...e), t === !1 && await sn();
}, "registerExternalDiagrams"), rr = /* @__PURE__ */ r(function() {
	if ($.startOnLoad) {
		let { startOnLoad: e } = X.getConfig();
		e && $.run().catch((e) => n.error("Mermaid failed to initialize", e));
	}
}, "contentLoaded");
typeof document < "u" && window.addEventListener("load", rr, !1);
var ir = /* @__PURE__ */ r(function(e) {
	$.parseError = e;
}, "setParseErrorHandler"), Z = [], Q = !1, ar = /* @__PURE__ */ r(async () => {
	if (!Q) {
		for (Q = !0; Z.length > 0;) {
			let e = Z.shift();
			if (e) try {
				await e();
			} catch (e) {
				n.error("Error executing queue", e);
			}
		}
		Q = !1;
	}
}, "executeQueue"), or = /* @__PURE__ */ r(async (e, t) => new Promise((i, a) => {
	let o = /* @__PURE__ */ r(() => new Promise((r, o) => {
		X.parse(e, t).then((e) => {
			r(e), i(e);
		}, (e) => {
			var t;
			n.error("Error parsing", e), (t = $.parseError) == null || t.call($, e), o(e), a(e);
		});
	}), "performCall");
	Z.push(o), ar().catch(a);
}), "parse"), sr = /* @__PURE__ */ r((e, t, i) => new Promise((a, o) => {
	let s = /* @__PURE__ */ r(() => new Promise((r, s) => {
		X.render(e, t, i).then((e) => {
			r(e), a(e);
		}, (e) => {
			var t;
			n.error("Error parsing", e), (t = $.parseError) == null || t.call($, e), s(e), o(e);
		});
	}), "performCall");
	Z.push(s), ar().catch(o);
}), "render"), $ = {
	startOnLoad: !0,
	mermaidAPI: X,
	parse: or,
	render: sr,
	init: tr,
	run: Qn,
	registerExternalDiagrams: nr,
	registerLayoutLoaders: de,
	initialize: er,
	parseError: void 0,
	contentLoaded: rr,
	setParseErrorHandler: ir,
	detectType: T,
	registerIconPacks: le,
	getRegisteredDiagramsMetadata: /* @__PURE__ */ r(() => Object.keys(C).map((e) => ({ id: e })), "getRegisteredDiagramsMetadata")
}, cr = $;
//#endregion
export { cr as default };
