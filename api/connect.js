const { db, safeKey } = require("../lib/firebase");
const { json, readBody, first } = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return json(res, 405, { status: false, reason: "POST required" });
  }

  try {
    const body = await readBody(req);

    const key = String(first(body, [
      "key", "access_key", "accessKey", "token", "license", "license_key"
    ])).trim();

    const device = String(first(body, [
      "device", "device_id", "deviceId", "hwid", "uuid"
    ])).trim();

    const product = String(first(body, [
      "product", "app", "package", "package_name", "packageName"
    ])).trim();

    if (!key) {
      return json(res, 200, {
        status: false,
        active: false,
        reason: "Access key required"
      });
    }

    const snap = await db().ref(`panicoKeys/${safeKey(key)}`).once("value");
    const record = snap.val();

    if (!record) {
      return json(res, 200, {
        status: false,
        active: false,
        reason: "Key rejected for this device or product"
      });
    }

    if (record.revoked === true) {
      return json(res, 200, {
        status: false,
        active: false,
        reason: "Key revoked"
      });
    }

    if (record.expiresAt && Date.now() >= Number(record.expiresAt)) {
      return json(res, 200, {
        status: false,
        active: false,
        reason: "Key expired"
      });
    }

    if (record.product && product && record.product !== product) {
      return json(res, 200, {
        status: false,
        active: false,
        reason: "Key rejected for this product"
      });
    }

    if (record.device && device && record.device !== device) {
      return json(res, 200, {
        status: false,
        active: false,
        reason: "Key rejected for this device"
      });
    }

    // First successful device can become bound to that key.
    if (!record.device && device) {
      await db().ref(`panicoKeys/${safeKey(key)}/device`).set(device);
      record.device = device;
    }

    return json(res, 200, {
      status: true,
      active: true,
      authorized: 1,
      reason: "Online authentication accepted; native lease active",
      facts: {
        key: key,
        product: record.product || product || "PÂNICO CHEATS",
        expiresAt: record.expiresAt || null
      },
      cert: record.cert || "panico-firebase",
      device: record.device || device || ""
    });
  } catch (err) {
    console.error(err);
    return json(res, 500, {
      status: false,
      active: false,
      reason: "Server error"
    });
  }
};
