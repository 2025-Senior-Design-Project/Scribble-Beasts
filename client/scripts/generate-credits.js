import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script (client/scripts/generate-credits.js)
const CLIENT_PACKAGE_JSON = path.resolve(__dirname, '../package.json');
// Assuming the script runs from client/ directory, or we can resolve from here.
// But wait, if I run `node scripts/generate-credits.js` from `client/`, __dirname is `client/scripts`.
// So `../package.json` is `client/package.json`.
// And `../../server/package.json` is `server/package.json`.

const SERVER_PACKAGE_JSON = path.resolve(
  __dirname,
  '../../server/package.json',
);
const OUTPUT_FILE = path.resolve(
  __dirname,
  '../src/lib/constants/npm-credits.json',
);

function getDependencies(packagePath) {
  try {
    if (fs.existsSync(packagePath)) {
      const content = fs.readFileSync(packagePath, 'utf-8');
      const json = JSON.parse(content);
      return json.dependencies || {};
    }
  } catch (e) {
    console.warn(`Could not read dependencies from ${packagePath}:`, e.message);
  }
  return {};
}

function generateCredits() {
  console.log('Generating NPM credits...');
  const clientDeps = getDependencies(CLIENT_PACKAGE_JSON);
  const serverDeps = getDependencies(SERVER_PACKAGE_JSON);

  // Merge keys
  const allDeps = { ...clientDeps, ...serverDeps };

  // Convert to array of objects
  const credits = Object.keys(allDeps)
    .sort()
    .map((name) => ({
      name,
      version: allDeps[name], // Optional: do we want to show version?
      url: `https://www.npmjs.com/package/${name}`,
    }));

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(credits, null, 2));
  console.log(`Wrote ${credits.length} packages to ${OUTPUT_FILE}`);
}

generateCredits();
