import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import stripJsonComments from "strip-json-comments";
import { readFileSync, existsSync } from "fs";
import { basename, dirname, join } from "path";
import { glob } from "node:fs/promises";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

let files = process.argv.slice(2);

if (files.length === 0) {
  const matches = glob("maps/**/*.jsonc");
  for await (const match of matches) {
    files.push(match);
  }
}

if (files.length === 0) {
  console.log("No map files to validate.");
  process.exit(0);
}

let hasErrors = false;

for (const file of files) {
  const dir = dirname(file);
  const name = basename(file, ".jsonc");
  const schemaPath = join(dir, `${name}.schema.json`);

  if (!existsSync(schemaPath)) {
    console.error(`No schema found for ${file} (expected ${schemaPath})`);
    hasErrors = true;
    continue;
  }

  const data = JSON.parse(stripJsonComments(readFileSync(file, "utf-8")));
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

  const validate = ajv.compile(schema);
  if (!validate(data)) {
    console.error(`Validation failed: ${file}`);
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || "/"}: ${err.message}`);
    }
    hasErrors = true;
  } else {
    console.log(`Valid: ${file}`);
  }
}

if (hasErrors) process.exit(1);
