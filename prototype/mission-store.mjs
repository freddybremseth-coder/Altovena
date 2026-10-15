import { randomUUID } from "node:crypto";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/** Development-only JSON persistence; single-process writer; NOT suitable for concurrent servers. */
export class LocalMissionStore {
  constructor(path) { this.path = path; }
  async read() {
    try {
      const raw = JSON.parse(await readFile(this.path, "utf8"));
      if (raw.schemaVersion !== 1 || !Array.isArray(raw.missions)) throw Error("Unsupported store schema");
      return raw;
    } catch (e) {
      if (e.code === "ENOENT") return { schemaVersion: 1, missions: [] };
      throw e;
    }
  }
  async save(mission) {
    if (!mission || !mission.id || !mission.tenantId) throw Error("Invalid mission");
    const data = await this.read();
    const i = data.missions.findIndex(x => x.id === mission.id && x.tenantId === mission.tenantId);
    if (i < 0 && data.missions.some(x => x.id === mission.id)) throw Error("Tenant collision");
    if (i < 0) data.missions.push(structuredClone(mission));
    else data.missions[i] = structuredClone(mission);
    await mkdir(dirname(this.path), {recursive:true});
    const tmp = this.path + "." + randomUUID() + ".tmp";
    await writeFile(tmp, JSON.stringify(data, null, 2), {mode:0o600});
    await rename(tmp, this.path);
    return structuredClone(mission);
  }
  async find(tenantId, missionId) {
    if (!tenantId || !missionId) throw Error("Tenant and mission required");
    const data = await this.read();
    return structuredClone(data.missions.find(x => x.tenantId === tenantId && x.id === missionId) ?? null);
  }
  async list(tenantId) {
    if (!tenantId) throw Error("Tenant required");
    return (await this.read()).missions.filter(x => x.tenantId === tenantId).map(x=>structuredClone(x));
  }
}
