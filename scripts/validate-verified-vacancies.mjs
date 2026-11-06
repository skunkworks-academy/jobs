import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const data = JSON.parse(readFileSync(new URL("../public/verified-vacancies.json", import.meta.url), "utf8"));
assert.ok(Array.isArray(data), "Verified vacancies must be an array.");
const ids = new Set();
const today = Date.now();

for (const vacancy of data) {
  const required = ["id", "title", "employer", "location", "applyUrl", "sourceUrl", "reviewedAt", "reviewedBy", "expiresAt"];
  assert.ok(vacancy && typeof vacancy === "object" && !Array.isArray(vacancy));
  for (const name of required) assert.ok(typeof vacancy[name] === "string" && vacancy[name].trim(), name + " is mandatory");
  assert.match(vacancy.id, /^[a-z0-9][a-z0-9-]{2,79}$/);
  assert.ok(!ids.has(vacancy.id), "Duplicate vacancy id: " + vacancy.id);
  ids.add(vacancy.id);
  for (const field of ["applyUrl", "sourceUrl"]) {
    const url = new URL(vacancy[field]);
    assert.equal(url.protocol, "https:", field + " must be HTTPS");
    assert.ok(url.hostname.includes(".") && !url.username && !url.password, field + " must be a public host");
  }
  for (const field of ["reviewedAt", "expiresAt"]) {
    assert.match(vacancy[field], /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isFinite(Date.parse(vacancy[field] + "T00:00:00Z")), field + " must be a date");
  }
  const age = today - Date.parse(vacancy.reviewedAt + "T00:00:00Z");
  assert.ok(age >= 0 && age <= 30 * 86400000, "Review each listing again at least every 30 days");
  assert.ok(Date.parse(vacancy.expiresAt + "T23:59:59Z") >= today, "Expired vacancy: " + vacancy.id);
}
console.log("Validated " + data.length + " verified vacancies; no third-party feed has been assumed.");
