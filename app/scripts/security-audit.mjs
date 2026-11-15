import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";
import { log } from "node:console";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const readEntity = async (name) => JSON.parse(await read(`../base44/entities/${name}.jsonc`));

const privateEntities = ["Farm", "Scenario", "ClimateSnapshot", "UserCrop"];
for (const name of privateEntities) {
  const schema = await readEntity(name);
  assert.equal(schema.rls?.read?.created_by_id, "{{user.id}}", `${name}: read must be creator-only`);
  assert.equal(schema.rls?.update?.created_by_id, "{{user.id}}", `${name}: update must be creator-only`);
  assert.equal(schema.rls?.delete?.created_by_id, "{{user.id}}", `${name}: delete must be creator-only`);
  for (const operation of ["read", "update", "delete"]) {
    assert.equal(JSON.stringify(schema.rls[operation]).includes('"role":"admin"'), false, `${name}: admin bypass found in ${operation}`);
  }
  const createRule = JSON.stringify(schema.rls?.create || {});
  assert.match(createRule, /"role":"user"/, `${name}: signed-in user creation should be allowed`);
  assert.match(createRule, /"role":"admin"/, `${name}: admin creation should be allowed`);
}

const crop = await readEntity("Crop");
assert.equal(crop.rls?.read, undefined, "Crop master catalogue should remain readable to the public");
for (const operation of ["create", "update", "delete"]) {
  assert.deepEqual(crop.rls?.[operation]?.user_condition, { role: "admin" }, `Crop: ${operation} must be admin-only`);
}

const userCrop = await readEntity("UserCrop");
assert.ok(userCrop.properties?.master_crop_id, "UserCrop must support a master-crop override link");

const data = await read("../src/lib/data.js");
assert.match(data, /function activeFarmStorageKey\(userId\)/, "Active farm key helper missing");
assert.match(data, /\$\{ACTIVE_FARM_KEY\}:\$\{userId\}/, "Active farm storage key must be account-specific");
assert.match(data, /base44\.entities\.Crop\.list/, "Shared master catalogue must be loaded");
assert.match(data, /base44\.entities\.UserCrop\.list/, "Private crop records must be loaded");
assert.match(data, /overrides\.get\(master\.id\)/, "Personal crop overrides must merge by master crop id");

const cropDialog = await read("../src/components/crops/CropDialog.jsx");
assert.match(cropDialog, /base44\.entities\.UserCrop\.create/, "Crop creation must write to UserCrop");
assert.match(cropDialog, /base44\.entities\.UserCrop\.update/, "Crop customisation must update UserCrop");
assert.doesNotMatch(cropDialog, /base44\.entities\.Crop\.(create|update|delete)/, "Crop dialog must not mutate shared Crop records");

const layout = await read("../src/components/Layout.jsx");
assert.match(layout, /t\("Active farm"\)/, "Sidebar must label the active farm");
assert.match(layout, /t\("Project pilot region"\)/, "Sidebar must separately label the project pilot region");
assert.match(layout, /t\("Harohalli, Karnataka, India"\)/, "Sidebar pilot region label missing");

const serverFns = await read("../src/lib/server-fns.js");
for (const name of ["translateInterfaceBatch", "loadClimateSnapshot", "explainScenario"]) {
  const start = serverFns.indexOf(`export const ${name} = createServerFn`);
  assert.notEqual(start, -1, `${name}: server function not found`);
  const next = serverFns.indexOf("export const ", start + 1);
  const block = serverFns.slice(start, next === -1 ? undefined : next);
  assert.match(block, /\.middleware\(\[requireUser\]\)/, `${name}: requireUser middleware missing`);
}
const demoStart = serverFns.indexOf("export const explainDemoScenario = createServerFn");
assert.notEqual(demoStart, -1, "Public demo explanation endpoint missing");
const demoBlock = serverFns.slice(demoStart);
assert.match(demoBlock, /DEMO_SCENARIO_IDS/, "Public demo endpoint must restrict scenario IDs");
assert.doesNotMatch(demoBlock, /InvokeLLM|asServiceRole/, "Public demo endpoint must not call paid LLM/service role");

log("PASS: Farm, Scenario, ClimateSnapshot and UserCrop are creator-only for read/update/delete.");
log("PASS: Crop master catalogue remains public-read and admin-write.");
log("PASS: UserCrop overrides are merged with master records without mutating the master.");
log("PASS: Active-farm selection is namespaced by user ID.");
log("PASS: Sidebar distinguishes active farm from the Harohalli pilot region.");
log("PASS: Private server functions require authentication; public demo endpoint is fixed-ID and deterministic.");

const rateLimit = await read("../src/lib/rate-limit.server.js");
assert.match(rateLimit, /cf-connecting-ip/, "Public rate limits must use the edge-provided client IP");
assert.match(rateLimit, /MAX_BUCKETS/, "Rate-limit storage must have a memory bound");
for (const scope of ["translate", "climate-fetch", "scenario-advisor", "public-demo-location", "public-demo-advisor"]) {
  assert.match(serverFns, new RegExp('scope: "' + scope + '"'), scope + ": rate limit missing");
}
log("PASS: Authenticated and public expensive server functions have bounded rate limits.");

const startConfig = await read("../src/start.js");
const headers = await read("../src/lib/security-headers.js");
assert.match(startConfig, /securityHeadersRequestMiddleware/, "Security headers middleware must be registered globally");
for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "Content-Security-Policy-Report-Only"]) {
  assert.ok(headers.includes(header), "Security response header missing: " + header);
}
log("PASS: App responses add browser security headers and a report-only CSP.");

assert.match(serverFns, /isValidDateKey/, "Custom climate dates must be real calendar dates");
assert.match(serverFns, /Latitude and longitude must be provided together/, "Public advisor coordinates must be paired");
log("PASS: Server input validation rejects invalid calendar dates and partial coordinate pairs.");

log("NOTE: Static checks do not replace live cross-account API penetration tests or an edge-level distributed rate limiter.");