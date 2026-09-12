const crypto = require("crypto");
const { db, safeKey } = require("../../lib/firebase");
const { json, adminAuthorized, readBody } = require("../../lib/auth");

function generateKey() {
  const b = crypto.randomBytes(10).toString("hex").toUpperCase();
  return `PANICO-${b.slice(0,5)}-${b.slice(5,10)}-${b.slice(10,15)}-${b.slice(15)}`;
}

module.exports = async (req, res) => {
  if (!adminAuthorized(req)) {
    return json(res, 401, { status: false, reason: "Unauthorized" });
  }

  try {
    const root = db().ref("panicoKeys");

    if (req.method === "GET") {
      const snap = await root.once("value");
      const value = snap.val() || {};
      const keys = Object.values(value);
      return json(res, 200, { status: true, keys });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const key = String(body.key || generateKey()).trim();
      if (!key) return json(res, 400, { status: false, reason: "key required" });

      const days = Number(body.days ?? 30);
      if (!Number.isFinite(days) || days < 0 || days > 36500) {
        return json(res, 400, { status: false, reason: "days must be between 0 and 36500" });
      }

      const record = {
        key,
        product: String(body.product || "PÂNICO CHEATS"),
        device: String(body.device || ""),
        expiresAt: days === 0 ? null : Date.now() + days * 86400000,
        revoked: false,
        cert: "panico-firebase",
        createdAt: Date.now()
      };

      const existing = await root.child(safeKey(key)).once("value");
      if (existing.exists()) {
        return json(res, 409, { status: false, reason: "Key already exists" });
      }

      await root.child(safeKey(key)).set(record);
      return json(res, 201, { status: true, key: record });
    }

    if (req.method === "DELETE") {
      const body = await readBody(req);
      const key = String(body.key || "").trim();
      if (!key) return json(res, 400, { status: false, reason: "key required" });

      await root.child(safeKey(key)).remove();
      return json(res, 200, { status: true, reason: "Key deleted" });
    }

    if (req.method === "PATCH") {
      const body = await readBody(req);
      const key = String(body.key || "").trim();
      if (!key) return json(res, 400, { status: false, reason: "key required" });

      const updates = {};
      if (body.revoked !== undefined) updates.revoked = Boolean(body.revoked);
      if (body.device !== undefined) updates.device = String(body.device);
      if (body.product !== undefined) updates.product = String(body.product);
      if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt === null ? null : Number(body.expiresAt);

      await root.child(safeKey(key)).update(updates);
      return json(res, 200, { status: true, reason: "Key updated" });
    }

    return json(res, 405, { status: false, reason: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return json(res, 500, { status: false, reason: "Server error" });
  }
};
        
