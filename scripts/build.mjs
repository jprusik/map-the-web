import { readFileSync, writeFileSync, mkdirSync, cpSync } from "fs";
import { createHash } from "crypto";
import { basename, dirname, join, relative } from "path";
import { glob } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const DIST = "dist";

// --- Phase 1: Discover ---

const maps = [];

for await (const schemaFile of glob("maps/*/*.schema.json")) {
  const dir = dirname(schemaFile);
  const name = basename(dir);
  const dataFile = join(dir, `${name}.json`);
  maps.push({ name, dir, dataFile, schemaFile });
}

if (maps.length === 0) {
  console.error("No maps found.");
  process.exit(1);
}

console.log(
  `Found ${maps.length} map(s): ${maps.map((m) => m.name).join(", ")}`,
);

// --- Phase 2: Validate ---

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

let hasErrors = false;

for (const map of maps) {
  const schema = JSON.parse(readFileSync(map.schemaFile, "utf-8"));
  const data = JSON.parse(readFileSync(map.dataFile, "utf-8"));

  const validate = ajv.compile(schema);
  if (!validate(data)) {
    console.error(`Validation failed: ${map.dataFile}`);
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || "/"}: ${err.message}`);
    }
    hasErrors = true;
  } else {
    console.log(`Validated: ${map.dataFile}`);
  }

  map.data = data;
  map.schema = schema;
}

if (hasErrors) {
  console.error("Build aborted due to validation errors.");
  process.exit(1);
}

// --- Phase 3: Optimize ---

const buildId = process.env.BUILD_ID || `local-${Date.now()}`;
const gitSha = process.env.GITHUB_SHA || "unknown";

const manifest = {
  buildId,
  timestamp: new Date().toISOString(),
  gitSha,
  maps: {},
};

const checksums = [];

mkdirSync(DIST, { recursive: true });

for (const map of maps) {
  const outDir = join(DIST, "maps", map.name);
  mkdirSync(outDir, { recursive: true });

  // Minify data JSON
  const minified = JSON.stringify(map.data);
  const outDataFile = join(outDir, basename(map.dataFile));
  writeFileSync(outDataFile, minified);
  console.log(`Minified: ${outDataFile} (${minified.length} bytes)`);

  // Copy schema as-is
  const outSchemaFile = join(outDir, basename(map.schemaFile));
  cpSync(map.schemaFile, outSchemaFile);

  // Record in manifest
  manifest.maps[map.name] = {
    version: map.data.version,
    files: [relative(DIST, outDataFile), relative(DIST, outSchemaFile)],
  };

  // Compute checksums
  for (const f of [outDataFile, outSchemaFile]) {
    const hash = createHash("sha256").update(readFileSync(f)).digest("hex");
    checksums.push(`${hash}  ${relative(DIST, f)}`);
  }
}

// --- Phase 4: Emit ---

const manifestPath = join(DIST, "manifest.json");
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const checksumsPath = join(DIST, "checksums.sha256");
writeFileSync(checksumsPath, checksums.join("\n") + "\n");

// Checksum the manifest itself
const manifestHash = createHash("sha256")
  .update(readFileSync(manifestPath))
  .digest("hex");
writeFileSync(
  checksumsPath,
  readFileSync(checksumsPath, "utf-8") + `${manifestHash}  manifest.json\n`,
);

console.log(`\nBuild complete: ${buildId}`);
console.log(`  Manifest: ${manifestPath}`);
console.log(`  Checksums: ${checksumsPath}`);
