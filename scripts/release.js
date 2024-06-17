import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

function determineNewVersion(currentVersion, releaseType = "patch") {
  const versionParts = currentVersion.split(".").map(Number);

  if (releaseType === "major") {
    versionParts[0] += 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
  } else if (releaseType === "minor") {
    versionParts[1] += 1;
    versionParts[2] = 0;
  } else if (releaseType === "patch") {
    versionParts[2] += 1;
  }

  return versionParts.join(".");
}

const packageJsonPath = "package.json";
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const currentVersion = packageJson.version;

const releaseType = process.argv[2];
if (!["major", "minor", "patch"].includes(releaseType)) {
  console.error("Invalid release type. Use \"major\", \"minor\", or \"patch\".");
  process.exit(1);
}

const newVersion = determineNewVersion(currentVersion, releaseType);

console.log(`Current version: ${currentVersion}`);
console.log(`New version: ${newVersion}`);

// Update package.json with the new version
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Commit the new version and create a new tag
execSync("git config --global user.name \"release-bot\"");
execSync("git config --global user.email \"release-bot@users.noreply.github.com\"");
execSync("git add package.json");
execSync(`git commit -m "Update version to ${newVersion}"`);
execSync(`git tag v${newVersion}`);
execSync("git push --follow-tags");

// Publish to npm
execSync("npm publish", {
  env: {
    ...process.env,
    NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN
  }
});
