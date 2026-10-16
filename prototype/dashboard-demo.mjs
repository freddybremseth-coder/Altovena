import { buildDemoDashboard } from "./command-dashboard.mjs";
const output = await buildDemoDashboard();
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
