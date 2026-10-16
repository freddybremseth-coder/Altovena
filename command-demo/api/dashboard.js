import { buildDemoDashboard } from "../../prototype/command-dashboard.mjs";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const state = await buildDemoDashboard();
    res.setHeader("Cache-Control","no-store");
    res.setHeader("X-Robots-Tag","noindex, nofollow");
    return res.status(200).json(state);
  } catch {
    return res.status(500).json({ error: "Demo engine failure" });
  }
}
