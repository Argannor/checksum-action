const core = require('@actions/core');
const glob = require('@actions/glob');
const crypto = require('crypto');
const fs = require('fs');

function generateChecksum(str, algorithm) {
  return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest('hex');
}

function calculateHashForFile(filePath) {
  fs.readFile(filePath, (err, data) => {
    const sha1 = generateChecksum(data, "sha1");
    const sha256 = generateChecksum(data, "sha256");
    core.setOutput(filePath + "-sha1", sha1);
    core.setOutput(filePath + "-sha256", sha256);
  });
}

async function run() {
  try {
    // `who-to-greet` input defined in action metadata file
    const pattern = core.getInput('glob');
    const globber = await glob.create(pattern);
    for await (const filePath of globber.globGenerator()) {
        calculateHashForFile(filePath);
    }
  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
