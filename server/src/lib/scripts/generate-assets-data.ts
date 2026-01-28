import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust paths based on where this script is located: server/src/lib/scripts/
// We need to go up to project root: ../../../..
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const CLIENT_PUBLIC_LIVE2D = path.resolve(PROJECT_ROOT, 'client/public/live2d');
const CLIENT_MANIFEST_OUT = path.resolve(
  PROJECT_ROOT,
  'client/src/lib/constants/asset-manifest.json',
);
const SERVER_DURATIONS_OUT = path.resolve(
  PROJECT_ROOT,
  'server/src/lib/constants/durations.json',
);

console.log(`Scanning assets in: ${CLIENT_PUBLIC_LIVE2D}`);

// Ensure output dirs exist
fs.mkdirSync(path.dirname(CLIENT_MANIFEST_OUT), { recursive: true });
fs.mkdirSync(path.dirname(SERVER_DURATIONS_OUT), { recursive: true });

// Mock data if directory doesn't exist
if (!fs.existsSync(CLIENT_PUBLIC_LIVE2D)) {
  console.warn(
    `Directory not found: ${CLIENT_PUBLIC_LIVE2D}. Creating empty for valid setup.`,
  );
  fs.mkdirSync(CLIENT_PUBLIC_LIVE2D, { recursive: true });
}

interface Durations {
  [key: string]: number;
}

const manifest = { models: [] as string[] };
const durations: Durations = {};

try {
  const dirs = fs
    .readdirSync(CLIENT_PUBLIC_LIVE2D)
    .filter((f) =>
      fs.statSync(path.join(CLIENT_PUBLIC_LIVE2D, f)).isDirectory(),
    );

  for (const dir of dirs) {
    const dirPath = path.join(CLIENT_PUBLIC_LIVE2D, dir);
    const files = fs.readdirSync(dirPath);

    // Find model3.json for manifest
    const modelFile = files.find((f) => f.endsWith('.model3.json'));
    if (modelFile) {
      // client/public is the root for fetch, so path is "live2d/..."
      const relativePath = `live2d/${dir}/${modelFile}`;
      manifest.models.push(relativePath);

      // Calculate duration from motion3.json files
      let totalDuration = 0;
      const motionFiles = files.filter((f) => f.endsWith('.motion3.json'));

      for (const mFile of motionFiles) {
        try {
          const content = JSON.parse(
            fs.readFileSync(path.join(dirPath, mFile), 'utf-8'),
          );
          // Cubism Motion3 format: Meta.Duration (in seconds)
          if (content.Meta && typeof content.Meta.Duration === 'number') {
            totalDuration += content.Meta.Duration;
          }
        } catch (e) {
          console.error(`Error reading motion file ${mFile}`, e);
        }
      }

      // Fallback if no motion files or duration is 0
      if (totalDuration === 0) {
        // If there are no motions, maybe it's just idle?
        // For intro rounds, we probably want a fixed fallback if it's missing.
        totalDuration = 10;
      }

      // Add buffer (user requested)
      totalDuration += 2;

      durations[dir] = totalDuration;
      console.log(`Found model '${dir}' with duration ${totalDuration}s`);
    }
  }
} catch (e) {
  console.error('Error scanning directories', e);
}

fs.writeFileSync(CLIENT_MANIFEST_OUT, JSON.stringify(manifest, null, 2));
console.log(`Wrote manifest to ${CLIENT_MANIFEST_OUT}`);

fs.writeFileSync(SERVER_DURATIONS_OUT, JSON.stringify(durations, null, 2));
console.log(`Wrote durations to ${SERVER_DURATIONS_OUT}`);
