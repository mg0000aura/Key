function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function adminAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret && req.headers["x-admin-secret"] === secret);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => {
      data += c;
      if (data.length > 1024 * 1024) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        const p = new URLSearchParams(data);
        resolve(Object.fromEntries(p.entries()));
      }
    });
    req.on("error", reject);
  });
}

function first(obj, names) {
  for (const name of names) {
    if (obj[name] !== undefined && obj[name] !== null && String(obj[name]).trim()) {
      return obj[name];
    }
  }
  return "";
}

module.exports = { json, adminAuthorized, readBody, first };
