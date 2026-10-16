/**
 * Command read-only authorization boundary (review-only).
 * Caller MUST supply a real provider-backed verifySession implementation.
 * Do NOT pass client JWT decode or request-supplied userId as verified identity.
 * Membership MUST be checked against an authoritative source on each request.
 * This module intentionally does not provide a database client or network access.
 */
function validUUID(x) {
  return typeof x === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
}
export class AccessError extends Error {
  constructor(status, code) { super(code); this.name = "AccessError"; this.status = status; this.code = code; }
}
export class CommandReadService {
  constructor({ verifySession, isActiveMember, repositoryFactory }) {
    if (![verifySession, isActiveMember, repositoryFactory].every(x => typeof x === "function")) {
      throw new TypeError("Missing trusted service dependency");
    }
    this.verifySession = verifySession;
    this.isActiveMember = isActiveMember;
    this.repositoryFactory = repositoryFactory;
  }
  async withMembership({ accessToken, tenantId }, action) {
    if (!validUUID(tenantId)) throw new AccessError(400, "invalid_tenant");
    if (typeof accessToken !== "string" || !accessToken) {
      throw new AccessError(401, "authentication_required");
    }

    // The implementation MUST cryptographically verify the session with
    // the provider. A mere parsed or decoded JWT must never be accepted.
    let identity;
    try { identity = await this.verifySession(accessToken); }
    catch { throw new AccessError(401, "invalid_session"); }
    if (!identity || !validUUID(identity.userId)) {
      throw new AccessError(401, "invalid_session");
    }

    // Do not rely on role values supplied by the request or editable JWT
    // user_metadata. Membership revocation must take effect on next request.
    const active = await this.isActiveMember({
      userId: identity.userId, tenantId, accessToken
    });
    if (active !== true) throw new AccessError(403, "access_denied");

    // The factory MUST create a tenant-scoped client with RLS enforced,
    // never a browser-exposed service_role or unrestricted admin client.
    const repo = await this.repositoryFactory({ tenantId, userId: identity.userId, accessToken });
    return action(repo);
  }
  async listMissions({ accessToken, tenantId, limit = 20 }) {
    return this.withMembership({ accessToken, tenantId },
      repo => repo.listMissions({ limit }));
  }
  async getMission({ accessToken, tenantId, missionId }) {
    if (!validUUID(missionId)) throw new AccessError(400,"invalid_mission");
    return this.withMembership({ accessToken, tenantId },
      repo => repo.getMission(missionId));
  }
}
