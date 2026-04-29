const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\usuario\\OneDrive - Universidad Politécnica de Cartagena\\Documentos\\Claude\\Ground_news\\ground-news-espana\\src\\components\\CorporateLanding.jsx', 'utf8');
const lines = content.split('\n');
let balance = 0;
for (let i = 0; i < lines.length; i++) {
    for (let char of lines[i]) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    // Only print if balance changes significantly or at the end of functions
    if (lines[i].includes('export default')) {
        console.log(`Line ${i + 1} (${lines[i].trim()}): balance ${balance}`);
    }
}
console.log(`Final balance: ${balance}`);
