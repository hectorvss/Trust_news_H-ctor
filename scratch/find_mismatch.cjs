const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\usuario\\OneDrive - Universidad Politécnica de Cartagena\\Documentos\\Claude\\Ground_news\\ground-news-espana\\src\\components\\CorporateLanding.jsx', 'utf8');
const lines = content.split('\n');
let balance = 0;
for (let i = 0; i < lines.length; i++) {
    for (let char of lines[i]) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    if (balance < 0) {
        console.log(`Mismatch on line ${i + 1}: balance ${balance}`);
        break;
    }
}
console.log(`Final balance: ${balance}`);
