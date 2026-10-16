import { CommandReadService, AccessError } from "../../prototype/command-read-service.mjs";
import { makeSupabaseCommandReadDependencies } from "../../prototype/command-supabase-rest-adapter.mjs";

/**
 * Read-only draft Vercel route. Not deployed or configured for real customers.
 * Uses caller's token + publishable key, never service_role privileges.
 * Requires a separate reviewed Command Supabase environment.
 */
export function createPersistentMissionsHandler({
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method_not_allowed" });
    }
    const url = env.COMMAND_SUPABASE_URL;
    const key = env.COMMAND_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return res.status(503).json({ error: "persistent_storage_not_configured" });
    }

    const authorization = req.headers?.authorization;
    const token = typeof authorization === "string" &&
      /^Bearer ([A-Za-z0-9._~-]{1,8192})$/.exec(authorization)?.[1];
    if (!token) return res.status(401).json({ error: "authentication_required" });

    const tenantId = req.query?.tenantId;
    const requestedLimit = req.query?.limit;
    if (Array.isArray(tenantId) || Array.isArray(requestedLimit)) {
      return res.status(400).json({ error: "invalid_query" });
    }
    const limit = requestedLimit === undefined ? 20 : Number(requestedLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "invalid_limit" });
    }

    try {
      const service = new CommandReadService(
        makeSupabaseCommandReadDependencies({
          projectUrl: url,
          publishableKey: key,
          fetchImpl
        })
      );
      const items = await service.listMissions({
        accessToken: token, tenantId, limit
      });
      return res.status(200).json({
        mode: "PERSISTENT_READ_ONLY",
        missions: items,
        count: items.length
      });
    } catch (error) {
      if (error instanceof AccessError) {
        return res.status(error.status).json({ error: error.code });
      }
      // Avoid sending upstream provider messages, tokens or SQL details.
      return res.status(502).json({ error: "command_provider_unavailable" });
    }
  };
}
export default createPersistentMissionsHandler();
