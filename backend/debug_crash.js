const fs = require('fs');
const path = require('path');

function testDir(dirName) {
    const fullPath = path.join(__dirname, dirName);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${dirName}, does not exist`);
        return;
    }
    const files = fs.readdirSync(fullPath);
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                console.log(`Loading ${dirName}/${file}...`);
                require(path.join(fullPath, file));
                console.log(`OK: ${file}`);
            } catch (e) {
                console.error(`FAIL: ${file}`);
                console.error(e.message);
                // process.exit(1); // Don't exit, find all errors
            }
        }
    }
}

try {
    console.log('Starting Debug Scan...');
    testDir('util');
    testDir('middleware');
    testDir('services');
    testDir('models'); // Also models
    testDir('routes');
    console.log('Scan Complete.');
} catch (e) {
    console.error('Script Error:', e);
}
