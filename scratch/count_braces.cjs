const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\usuario\\OneDrive - Universidad Politécnica de Cartagena\\Documentos\\Claude\\Ground_news\\ground-news-espana\\src\\components\\CorporateLanding.jsx', 'utf8');
let openBraces = 0;
let closeBraces = 0;
for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') openBraces++;
    if (content[i] === '}') closeBraces++;
}
console.log(`Open: ${openBraces}, Close: ${closeBraces}`);
