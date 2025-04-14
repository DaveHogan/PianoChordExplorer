const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const indexPath = path.resolve(__dirname, '../src/index.html');
const placeholder = '%%VERSION%%';

try {
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version;

    if (!version) {
        throw new Error('Version not found in package.json');
    }

    // Read index.html
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // Replace placeholder
    indexHtml = indexHtml.replace(placeholder, `v${version}`);

    // Write updated index.html
    fs.writeFileSync(indexPath, indexHtml, 'utf8');

    console.log(`Successfully injected version v${version} into ${indexPath}`);

} catch (error) {
    console.error('Error injecting version:', error);
    process.exit(1);
} 