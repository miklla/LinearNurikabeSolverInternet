const Module = require("./hello_world.wasm.js");
const { performance } = require("perf_hooks");

Module["onRuntimeInitialized"] = onRuntimeInitialized;
function onRuntimeInitialized() {
  const t0 = performance.now();
  const getHelloMessage = Module.cwrap("getHelloMessage", "string", []);
  const result = getHelloMessage();
  const t1 = performance.now();

  console.log(`Result : "${result}"`);
  console.log("Run time " + (t1 - t0) + " milliseconds.");
}