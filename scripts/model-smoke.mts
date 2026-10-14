// Send one short prompt through core/model.ts and print the reply, to check ANTHROPIC_API_KEY
// and the adapter before anything is built on them.
//   npm run model:smoke           (the curation model)
//   npm run model:smoke -- gate   (the gate model)

import { complete, modelFor, type ModelUse } from "../core/model.ts";
import { readPrompt } from "../core/prompts.ts";

const use: ModelUse = process.argv[2] === "gate" ? "gate" : "curate";
console.log(`Asking ${modelFor(use)} (${use})...`);
const reply = await complete({ system: readPrompt("smoke.md"), prompt: "quark", maxTokens: 2000, use });
console.log(reply);
