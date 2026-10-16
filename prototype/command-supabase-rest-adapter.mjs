/**
 * Altovena Command v0.3: Supabase Auth + read-only PostgREST adapter.
 * Provider-backed verification: GET /auth/v1/user with the supplied Bearer
 * token. Every REST call also uses that token so Supabase RLS is enforced.
 *
 * Requires an explicitly configured separate Command Supabase project,
 * review-only invoker views, and publishable key (NEVER a service_role key).
 * No network requests until a service method is invoked.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const safeId = (value) => typeof value === "string" && UUID.test(value);
const fail = (message) => { throw new TypeError(message); };

export function makeSupabaseCommandReadDependencies({
  projectUrl, publishableKey, fetchImpl = globalThis.fetch,
  timeoutMs = 5000
}) {
  if (typeof projectUrl !== "string") fail("A project URL is required");
  const base = new URL(projectUrl);
  if (base.protocol !== "https:" || base.username || base.password ||
      base.pathname !== "/" || base.search || base.hash ||
      !/^[a-z0-9-]+\.supabase\.co$/.test(base.hostname)) {
    fail("A dedicated HTTPS Supabase project URL is required");
  }
  if (typeof publishableKey !== "string" ||
      !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
    fail("A Supabase publishable key is required (not an admin key)");
  }
  if (typeof fetchImpl !== "function") fail("fetch required");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 30000) {
    fail("Invalid request timeout");
  }

  async function request(path, accessToken, params = null) {
    if (typeof accessToken !== "string" || !accessToken ||
        accessToken.length > 8192) fail("Invalid access token");
    const url = new URL(path, base);
    if (params) for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const response = await fetchImpl(url.href, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        apikey: publishableKey,
        Authorization: "Bearer " + accessToken,
        Accept: "application/json",
        "Cache-Control": "no-store"
      }
    });
    if (!response.ok) {
      if (path === "/auth/v1/user" && [400,401,403].includes(response.status)) return null;
      throw new Error("Command identity/data provider unavailable");
    }
    return response.json();
  }

  async function readView(view, token, params) {
    const rows = await request("/rest/v1/" + view, token, params);
    if (!Array.isArray(rows)) throw new Error("Unexpected Supabase response");
    return rows;
  }

  return {
    verifySession: async (accessToken) => {
      const user = await request("/auth/v1/user", accessToken);
      return user && safeId(user.id) ? { userId: user.id } : null;
    },
    isActiveMember: async ({ userId, tenantId, accessToken }) => {
      if (!safeId(userId) || !safeId(tenantId)) return false;
      const rows = await readView("command_memberships_read", accessToken, {
        select: "tenant_id,user_id,active",
        tenant_id: "eq." + tenantId,
        user_id: "eq." + userId,
        active: "eq.true",
        limit: "1"
      });
      return rows.some(row => row.tenant_id === tenantId &&
        row.user_id === userId && row.active === true);
    },
    repositoryFactory: async ({ tenantId, accessToken }) => {
      if (!safeId(tenantId)) fail("Invalid tenant");
      return {
        listMissions: async ({ limit = 20 } = {}) => {
          if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            fail("Invalid list limit");
          }
          const rows = await readView("command_missions_read", accessToken, {
            select: "id,tenant_id,goal,state,version,created_at,updated_at",
            tenant_id: "eq." + tenantId,
            order: "updated_at.desc,id.desc",
            limit: String(limit)
          });
          return rows.filter(row => row.tenant_id === tenantId);
        },
        getMission: async (missionId) => {
          if (!safeId(missionId)) fail("Invalid mission ID");
          const rows = await readView("command_missions_read", accessToken, {
            select: "id,tenant_id,goal,state,version,created_at,updated_at",
            tenant_id: "eq." + tenantId,
            id: "eq." + missionId,
            limit: "1"
          });
          return rows.find(row => row.tenant_id === tenantId &&
            row.id === missionId) ?? null;
        }
      };
    }
  };
}
