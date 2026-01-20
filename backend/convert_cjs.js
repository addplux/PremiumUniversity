const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'routes'),
    path.join(__dirname, 'models'),
    path.join(__dirname, 'utils') // Just in case
];

function convertFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace imports
    content = content.replace(/import (\w+) from ['"](.+)['"];/g, "const $1 = require('$2');");
    content = content.replace(/import \{ (.+) \} from ['"](.+)['"];/g, "const { $1 } = require('$2');");

    // Replace export default
    content = content.replace(/export default (\w+);/g, "module.exports = $1;");

    // Replace named exports
    // content = content.replace(/export const (\w+) =/g, "exports.$1 ="); // This might be tricky if mixed, but let's see if we need it. 
    // Most files seem to import { X } but export logic might be different. 
    // Let's stick to the common patterns seen in grep.

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Converted: ${filePath}`);
    }
}

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            if (file.endsWith('.js')) {
                convertFile(path.join(dir, file));
            }
        });
    }
});

console.log('Conversion complete.');
