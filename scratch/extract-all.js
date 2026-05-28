const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = '/home/krystian/Projects/ps-map';
const pluginRoot = '/home/krystian/.understand-anything/repo/understand-anything-plugin';
const tmpDir = path.join(projectRoot, '.understand-anything', 'tmp');

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

console.log('Loading batches.json...');
const batchesFile = path.join(projectRoot, '.understand-anything', 'intermediate', 'batches.json');
const batchesData = JSON.parse(fs.readFileSync(batchesFile, 'utf8'));
const batches = batchesData.batches;

console.log(`Starting structural extraction for ${batches.length} batches...`);

for (const batch of batches) {
  const idx = batch.batchIndex;
  console.log(`Processing batch ${idx}/${batches.length} (files: ${batch.files.length})...`);

  const inputPath = path.join(tmpDir, `ua-file-analyzer-input-${idx}.json`);
  const outputPath = path.join(tmpDir, `ua-file-extract-results-${idx}.json`);

  const inputContent = {
    projectRoot: projectRoot,
    batchFiles: batch.files,
    batchImportData: batch.batchImportData
  };

  fs.writeFileSync(inputPath, JSON.stringify(inputContent, null, 2));

  try {
    const cmd = `node ${path.join(pluginRoot, 'skills', 'understand', 'extract-structure.mjs')} ${inputPath} ${outputPath}`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error extracting structure for batch ${idx}:`, err.message);
  }
}

console.log('All structural extractions completed.');
