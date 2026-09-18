import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const context = vm.createContext({
  window: {},
  console,
  localStorage: {
    getItem(){ return null; },
    setItem(){},
    removeItem(){}
  }
});

for (const file of ["database.js","engine.js"]) {
  vm.runInContext(fs.readFileSync(file,"utf8"), context, { filename:file });
}

assert.ok(context.window.SOFTWARE_DATABASE, "database non esposto");
assert.ok(Array.isArray(context.window.SOFTWARE_DATABASE), "database non è un array");
assert.ok(context.window.SOFTWARE_DATABASE.length >= 20, "catalogo troppo piccolo");

const E = context.window.ProjectXEngine;
assert.ok(E, "ProjectXEngine non esposto");
assert.equal(typeof E.analyzeAnswers, "function", "analyzeAnswers mancante");

const answers = {
  businessType: "Artigiano",
  teamSize: "2–5",
  budget: "50–100 €/mese",
  painPoint: "Perdo troppo tempo con i preventivi e i follow-up",
  goals: ["Automazione", "Vendite"],
  tech: "Base",
  automation: "Semplice",
  existingTools: []
};

const r1 = E.analyzeAnswers(answers);
const r2 = E.analyzeAnswers(answers);

assert.ok(r1 && r1.primaryTool, "primaryTool mancante");
assert.ok(Array.isArray(r1.rankedTools) && r1.rankedTools.length > 0, "ranking vuoto");
assert.equal(r1.primaryTool.id, r2.primaryTool.id, "motore non deterministico sullo stesso input");
assert.equal(Number(r1.primaryTool.compatibility), Number(r2.primaryTool.compatibility), "compatibilità non stabile");
assert.ok(Number.isFinite(Number(r1.primaryTool.businessScore)), "businessScore non numerico");
assert.ok(Array.isArray(r1.stack), "stack mancante");

console.log("PROJECT-X engine smoke test: OK");
console.log("Primary:", r1.primaryTool.name);
console.log("Compatibility:", r1.primaryTool.compatibility);
console.log("Stack:", r1.stack.map(x => x.name).join(" + "));
