import test from "node:test";
import assert from "node:assert/strict";
import handler from "../command-demo/api/dashboard.js";

function mockResponse() {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    body: null,
    setHeader(key, value) { headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}
test("GET serves a real isolated mission run with zero side effects", async () => {
  const res = mockResponse();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.mode, "SIMULATION_ONLY");
  assert.equal(res.body.mission.status, "completed");
  assert.equal(res.body.summary.agentsCompleted, 3);
  assert.equal(res.body.summary.externalActions, 0);
  assert.equal(res.body.ledgerVerified, true);
  assert.ok(res.body.evidence.some(e => e.type === "verification.completed"));
  assert.equal(res.headers["Cache-Control"], "no-store");
});
test("write requests are blocked", async () => {
  const res = mockResponse();
  await handler({ method: "POST" }, res);
  assert.equal(res.statusCode, 405);
});
