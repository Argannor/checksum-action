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
  const data = fs.readFileSync(filePath);
  const sha1 = generateChecksum(data, "sha1");
  const sha256 = generateChecksum(data, "sha256");
  return {
    file: filePath,
    sha1: sha1,
    sha256: sha256
  };
}

function formatFileName(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1];
}

async function run() {
  try {
    // `who-to-greet` input defined in action metadata file
    const patterns = core.getInput('glob').split(' ');
    const globber = await glob.create(patterns.join('\n'));
    const results = [];
    for await (const filePath of globber.globGenerator()) {
        const fileInfo = calculateHashForFile(filePath);
        results.push(fileInfo);
    }
    const output = results
        .map(checksums => `- ${formatFileName(checksums.file)}
  - SHA-1: ${checksums.sha1}
  - SHA-256: ${checksums.sha256}`)
        .join('\n');
    core.setOutput('checksums', output);
  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
