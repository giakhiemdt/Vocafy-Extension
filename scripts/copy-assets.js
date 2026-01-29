const fs = require("fs/promises");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
const envPath = path.join(root, ".env");

const loadEnvFile = async () => {
  try {
    const content = await fs.readFile(envPath, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) return;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const copyFileIfExists = async (from, to) => {
  try {
    await fs.copyFile(from, to);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const copyDirIfExists = async (from, to) => {
  try {
    await fs.mkdir(to, { recursive: true });
    const entries = await fs.readdir(from, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = path.join(from, entry.name);
        const destPath = path.join(to, entry.name);
        if (entry.isDirectory()) {
          await copyDirIfExists(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      })
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const run = async () => {
  await loadEnvFile();
  await fs.mkdir(distDir, { recursive: true });
  const manifestPath = path.join(srcDir, "manifest.json");
  const manifestRaw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw);
  if (process.env.VITE_OAUTH_CLIENT_ID) {
    manifest.oauth2 = manifest.oauth2 || {};
    manifest.oauth2.client_id = process.env.VITE_OAUTH_CLIENT_ID;
  }
  await fs.writeFile(
    path.join(distDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  await copyFileIfExists(path.join(srcDir, "background.js"), path.join(distDir, "background.js"));
  await copyFileIfExists(path.join(srcDir, "content.js"), path.join(distDir, "content.js"));
  await copyDirIfExists(path.join(srcDir, "icons"), path.join(distDir, "icons"));
};

run().catch((error) => {
  console.error("Copy assets failed:", error);
  process.exit(1);
});
