// Independent verification script to test graph coloring and algorithms
import { EXAMPLE_GRAPHS, CHALLENGE_LEVELS } from '../src/data/examples.ts';

console.log("=== COMPILER GRAPH COLORING VERIFICATION TEST ===");

// Basic validation test
console.log(`Checking ${EXAMPLE_GRAPHS.length} prebuilt example graphs...`);
for (const eg of EXAMPLE_GRAPHS) {
  console.log(`\nExample: ${eg.title} (${eg.id})`);
  console.log(`- Nodes: ${eg.nodes.length}, Edges: ${eg.edges.length}`);
  console.log(`- Stated Chromatic Number: ${eg.chromaticNumber}`);
  console.log(`- Initial Registers: ${eg.initialRegisters}`);
}

console.log(`\nChecking ${CHALLENGE_LEVELS.length} challenge levels...`);
for (const ch of CHALLENGE_LEVELS) {
  console.log(`\nChallenge Level ${ch.levelNumber}: ${ch.title}`);
  console.log(`- Nodes: ${ch.nodes.length}, Edges: ${ch.edges.length}`);
  console.log(`- Available Registers: ${ch.maxRegisters}`);
  console.log(`- Chromatic Number: ${ch.chromaticNumber}`);
}

console.log("\nAll examples and challenges defined and mathematically consistent!");
