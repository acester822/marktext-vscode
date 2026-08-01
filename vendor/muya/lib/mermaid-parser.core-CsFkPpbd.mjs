import { _ as e, a as t, c as n, d as r, f as i, g as a, h as o, i as s, l as c, m as ee, n as l, o as te, p as ne, r as re, s as ie, t as u, u as ae, v as d, y as f } from "./chunk-NNHCCRGN-Bzs60M8X.mjs";
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-4EGX6M5U.mjs
var p, m, oe = (p = class extends u {
	constructor() {
		super(["architecture"]);
	}
}, a(p, "ArchitectureTokenBuilder"), p), se = (m = class extends l {
	runCustomConverter(e, t, n) {
		if (e.name === "ARCH_ICON") return t.replace(/[()]/g, "").trim();
		if (e.name === "ARCH_TEXT_ICON") return t.replace(/["()]/g, "");
		if (e.name === "ARCH_TITLE") {
			let e = t.replace(/^\[|]$/g, "").trim();
			return (e.startsWith("\"") && e.endsWith("\"") || e.startsWith("'") && e.endsWith("'")) && (e = e.slice(1, -1), e = e.replace(/\\"/g, "\"").replace(/\\'/g, "'")), e.trim();
		}
	}
}, a(m, "ArchitectureValueConverter"), m), h = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new oe(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new se(), "ValueConverter")
} };
function g(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), re, h);
	return r.ServiceRegistry.register(i), {
		shared: r,
		Architecture: i
	};
}
a(g, "createArchitectureServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-N66VUXT2.mjs
var _, v, ce = (_ = class extends u {
	constructor() {
		super(["eventmodeling"]);
	}
}, a(_, "EventModelingTokenBuilder"), _), y = /* @__PURE__ */ new Set(["cmd", "command"]), b = /* @__PURE__ */ new Set(["evt", "event"]), x = /* @__PURE__ */ new Set(["rmo", "readmodel"]), le = /* @__PURE__ */ new Set(["pcr", "processor"]), ue = /* @__PURE__ */ new Set(["ui"]);
function de(e) {
	let t = e.validation.EventModelingValidator, n = e.validation.ValidationRegistry;
	if (n) {
		let e = {
			EmTimeFrame: t.checkSourceFrameTypes.bind(t),
			EmResetFrame: t.checkSourceFrameTypes.bind(t)
		};
		n.register(e, t);
	}
}
a(de, "registerValidationChecks");
var fe = (v = class {
	checkSourceFrameTypes(e, t) {
		e.sourceFrames.length !== 0 && (y.has(e.modelEntityType) ? this.validateSources(e, /* @__PURE__ */ new Set([...ue, ...le]), "command", "ui or processor", t) : b.has(e.modelEntityType) ? this.validateSources(e, y, "event", "command", t) : x.has(e.modelEntityType) ? this.validateSources(e, b, "read model", "event", t) : le.has(e.modelEntityType) ? this.validateSources(e, x, "processor", "read model", t) : ue.has(e.modelEntityType) && this.validateSources(e, x, "ui", "read model", t));
	}
	validateSources(e, t, n, r, i) {
		for (let a of e.sourceFrames) {
			let o = a.ref;
			o !== void 0 && !t.has(o.modelEntityType) && i("error", `A ${n} can only receive input from a ${r}, not from '${o.modelEntityType}'.`, {
				node: e,
				property: "sourceFrames"
			});
		}
	}
}, a(v, "EventModelingValidator"), v), S = {
	parser: {
		TokenBuilder: /* @__PURE__ */ a(() => new ce(), "TokenBuilder"),
		ValueConverter: /* @__PURE__ */ a(() => new s(), "ValueConverter")
	},
	validation: { EventModelingValidator: /* @__PURE__ */ a(() => new fe(), "EventModelingValidator") }
};
function C(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), te, S);
	return r.ServiceRegistry.register(i), de(i), {
		shared: r,
		EventModel: i
	};
}
a(C, "createEventModelingServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-UIBZB4QT.mjs
var w, pe = (w = class extends u {
	constructor() {
		super(["gitGraph"]);
	}
}, a(w, "GitGraphTokenBuilder"), w), T = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new pe(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new s(), "ValueConverter")
} };
function E(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), ie, T);
	return r.ServiceRegistry.register(i), {
		shared: r,
		GitGraph: i
	};
}
a(E, "createGitGraphServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-5DO6E6H7.mjs
var D, me = (D = class extends u {
	constructor() {
		super(["info", "showInfo"]);
	}
}, a(D, "InfoTokenBuilder"), D), O = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new me(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new s(), "ValueConverter")
} };
function k(r = t) {
	let i = f(d(r), c), a = f(e({ shared: i }), n, O);
	return i.ServiceRegistry.register(a), {
		shared: i,
		Info: a
	};
}
a(k, "createInfoServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-MPE355IW.mjs
var A, he = (A = class extends u {
	constructor() {
		super(["packet"]);
	}
}, a(A, "PacketTokenBuilder"), A), j = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new he(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new s(), "ValueConverter")
} };
function M(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), ae, j);
	return r.ServiceRegistry.register(i), {
		shared: r,
		Packet: i
	};
}
a(M, "createPacketServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-MZUSXYTE.mjs
var N, P, ge = (N = class extends u {
	constructor() {
		super(["pie", "showData"]);
	}
}, a(N, "PieTokenBuilder"), N), _e = (P = class extends l {
	runCustomConverter(e, t, n) {
		if (e.name === "PIE_SECTION_LABEL") return t.replace(/"/g, "").trim();
	}
}, a(P, "PieValueConverter"), P), F = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new ge(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new _e(), "ValueConverter")
} };
function I(n = t) {
	let i = f(d(n), c), a = f(e({ shared: i }), r, F);
	return i.ServiceRegistry.register(a), {
		shared: i,
		Pie: a
	};
}
a(I, "createPieServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-FHYWG6QK.mjs
var L, ve = (L = class extends u {
	constructor() {
		super(["radar-beta"]);
	}
}, a(L, "RadarTokenBuilder"), L), R = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new ve(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new s(), "ValueConverter")
} };
function z(n = t) {
	let r = f(d(n), c), a = f(e({ shared: r }), i, R);
	return r.ServiceRegistry.register(a), {
		shared: r,
		Radar: a
	};
}
a(z, "createRadarServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-WCWK7LTN.mjs
var B, V, ye = (B = class extends l {
	runCustomConverter(e, t, n) {
		if (e.name === "INDENTATION") return (t == null ? void 0 : t.length) || 0;
		if (e.name === "STRING2") return t.substring(1, t.length - 1);
	}
}, a(B, "TreeViewValueConverter"), B), be = (V = class extends u {
	constructor() {
		super(["treeView-beta"]);
	}
}, a(V, "TreeViewTokenBuilder"), V), H = { parser: {
	TokenBuilder: /* @__PURE__ */ a(() => new be(), "TokenBuilder"),
	ValueConverter: /* @__PURE__ */ a(() => new ye(), "ValueConverter")
} };
function U(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), ne, H);
	return r.ServiceRegistry.register(i), {
		shared: r,
		TreeView: i
	};
}
a(U, "createTreeViewServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-BR22UD5L.mjs
var W, G, K, xe = (W = class extends u {
	constructor() {
		super(["treemap"]);
	}
}, a(W, "TreemapTokenBuilder"), W), Se = /classDef\s+([A-Z_a-z]\w+)(?:\s+([^\n\r;]*))?;?/, Ce = (G = class extends l {
	runCustomConverter(e, t, n) {
		if (e.name === "NUMBER2") return parseFloat(t.replace(/,/g, ""));
		if (e.name === "SEPARATOR" || e.name === "STRING2") return t.substring(1, t.length - 1);
		if (e.name === "INDENTATION") return t.length;
		if (e.name === "ClassDef") {
			if (typeof t != "string") return t;
			let e = Se.exec(t);
			if (e) return {
				$type: "ClassDefStatement",
				className: e[1],
				styleText: e[2] || void 0
			};
		}
	}
}, a(G, "TreemapValueConverter"), G);
function q(e) {
	let t = e.validation.TreemapValidator, n = e.validation.ValidationRegistry;
	if (n) {
		let e = { Treemap: t.checkSingleRoot.bind(t) };
		n.register(e, t);
	}
}
a(q, "registerValidationChecks");
var we = (K = class {
	checkSingleRoot(e, t) {
		let n;
		for (let r of e.TreemapRows) r.item && (n === void 0 && r.indent === void 0 ? n = 0 : (r.indent === void 0 || n !== void 0 && n >= parseInt(r.indent, 10)) && t("error", "Multiple root nodes are not allowed in a treemap.", {
			node: r,
			property: "item"
		}));
	}
}, a(K, "TreemapValidator"), K), J = {
	parser: {
		TokenBuilder: /* @__PURE__ */ a(() => new xe(), "TokenBuilder"),
		ValueConverter: /* @__PURE__ */ a(() => new Ce(), "ValueConverter")
	},
	validation: { TreemapValidator: /* @__PURE__ */ a(() => new we(), "TreemapValidator") }
};
function Y(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), ee, J);
	return r.ServiceRegistry.register(i), q(i), {
		shared: r,
		Treemap: i
	};
}
a(Y, "createTreemapServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/chunks/mermaid-parser.core/chunk-PUPMXCY4.mjs
var X, Te = (X = class extends l {
	runCustomConverter(e, t, n) {
		switch (e.name.toUpperCase()) {
			case "LINK_LABEL": return t.substring(1).trim();
			default: return;
		}
	}
}, a(X, "WardleyValueConverter"), X), Ee = { parser: { ValueConverter: /* @__PURE__ */ a(() => new Te(), "ValueConverter") } };
function De(n = t) {
	let r = f(d(n), c), i = f(e({ shared: r }), o, Ee);
	return r.ServiceRegistry.register(i), {
		shared: r,
		Wardley: i
	};
}
a(De, "createWardleyServices");
//#endregion
//#region ../../node_modules/.pnpm/@mermaid-js+parser@1.1.1/node_modules/@mermaid-js/parser/dist/mermaid-parser.core.mjs
var Z, Q = {}, Oe = {
	info: /* @__PURE__ */ a(async () => {
		let { createInfoServices: e } = await import("./info-J43DQDTF-DVcw2rjL.mjs");
		Q.info = e().Info.parser.LangiumParser;
	}, "info"),
	packet: /* @__PURE__ */ a(async () => {
		let { createPacketServices: e } = await import("./packet-YPE3B663-D4XRYXuo.mjs");
		Q.packet = e().Packet.parser.LangiumParser;
	}, "packet"),
	pie: /* @__PURE__ */ a(async () => {
		let { createPieServices: e } = await import("./pie-LRSECV5Y-DItNor79.mjs");
		Q.pie = e().Pie.parser.LangiumParser;
	}, "pie"),
	treeView: /* @__PURE__ */ a(async () => {
		let { createTreeViewServices: e } = await import("./treeView-BLDUP644-CQCs9zdP.mjs");
		Q.treeView = e().TreeView.parser.LangiumParser;
	}, "treeView"),
	architecture: /* @__PURE__ */ a(async () => {
		let { createArchitectureServices: e } = await import("./architecture-7EHR7CIX-DjFKVN5v.mjs");
		Q.architecture = e().Architecture.parser.LangiumParser;
	}, "architecture"),
	gitGraph: /* @__PURE__ */ a(async () => {
		let { createGitGraphServices: e } = await import("./gitGraph-WXDBUCRP-CiLj6qo2.mjs");
		Q.gitGraph = e().GitGraph.parser.LangiumParser;
	}, "gitGraph"),
	eventmodeling: /* @__PURE__ */ a(async () => {
		let { createEventModelingServices: e } = await import("./eventmodeling-FCH6USID-DhETo-8G.mjs");
		Q.eventmodeling = e().EventModel.parser.LangiumParser;
	}, "eventmodeling"),
	radar: /* @__PURE__ */ a(async () => {
		let { createRadarServices: e } = await import("./radar-GUYGQ44K-DwigJJdi.mjs");
		Q.radar = e().Radar.parser.LangiumParser;
	}, "radar"),
	treemap: /* @__PURE__ */ a(async () => {
		let { createTreemapServices: e } = await import("./treemap-LRROVOQU-D7Xetob4.mjs");
		Q.treemap = e().Treemap.parser.LangiumParser;
	}, "treemap"),
	wardley: /* @__PURE__ */ a(async () => {
		let { createWardleyServices: e } = await import("./wardley-L42UT6IY-DwpXzlpK.mjs");
		Q.wardley = e().Wardley.parser.LangiumParser;
	}, "wardley")
};
async function $(e, t) {
	let n = Oe[e];
	if (!n) throw Error(`Unknown diagram type: ${e}`);
	Q[e] || await n();
	let r = Q[e].parse(t);
	if (r.lexerErrors.length > 0 || r.parserErrors.length > 0) throw new ke(r);
	return r.value;
}
a($, "parse");
var ke = (Z = class extends Error {
	constructor(e) {
		let t = e.lexerErrors.map((e) => `Lexer error on line ${e.line !== void 0 && !isNaN(e.line) ? e.line : "?"}, column ${e.column !== void 0 && !isNaN(e.column) ? e.column : "?"}: ${e.message}`).join("\n"), n = e.parserErrors.map((e) => `Parse error on line ${e.token.startLine !== void 0 && !isNaN(e.token.startLine) ? e.token.startLine : "?"}, column ${e.token.startColumn !== void 0 && !isNaN(e.token.startColumn) ? e.token.startColumn : "?"}: ${e.message}`).join("\n");
		super(`Parsing failed: ${t} ${n}`), this.result = e;
	}
}, a(Z, "MermaidParseError"), Z);
//#endregion
export { E as _, Y as a, h as b, R as c, I as d, j as f, T as g, k as h, J as i, z as l, O as m, Ee as n, H as o, M as p, De as r, U as s, $ as t, F as u, S as v, g as x, C as y };
