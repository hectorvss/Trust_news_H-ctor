const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\usuario\\OneDrive - Universidad Politécnica de Cartagena\\Documentos\\Claude\\Ground_news\\ground-news-espana\\src\\components\\CorporateLanding.jsx', 'utf8');
const lines = content.split('\n');
let balance = 0;
for (let i = 0; i < 294; i++) {
    for (let char of lines[i]) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
}
console.log(`Balance at line 294: ${balance}`);
