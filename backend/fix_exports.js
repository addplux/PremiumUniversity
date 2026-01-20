const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'models'),
    path.join(__dirname, 'utils')
];

function fixExports(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Pattern 1: export default mongoose.model(...)
    content = content.replace(/export default mongoose\.model/g, 'module.exports = mongoose.model');

    // Pattern 2: export default { ... }
    content = content.replace(/export default \{/g, 'module.exports = {');

    // Pattern 3: Generic fallback for any remaining export default something;
    // Be careful not to match if already replaced
    if (content.includes('export default')) {
        content = content.replace(/export default (.*)/g, 'module.exports = $1');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed exports in: ${filePath}`);
    }
}

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            if (file.endsWith('.js')) {
                fixExports(path.join(dir, file));
            }
        });
    }
});
console.log('Export fix complete.');
