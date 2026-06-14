const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath);
        } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let updatedContent = content;
            
            // Reemplazar ocurrencias de 'http://localhost:3000' por la variable de entorno
            if (updatedContent.includes("'http://localhost:3000")) {
                updatedContent = updatedContent.replace(/'http:\/\/localhost:3000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:3000') + '");
            }
            if (updatedContent.includes("\`http://localhost:3000")) {
                updatedContent = updatedContent.replace(/\`http:\/\/localhost:3000/g, "\`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}");
            }
            if (updatedContent.includes('"http://localhost:3000')) {
                updatedContent = updatedContent.replace(/"http:\/\/localhost:3000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:3000') + \"");
            }

            if (content !== updatedContent) {
                fs.writeFileSync(dirPath, updatedContent, 'utf8');
                console.log('Updated:', dirPath);
            }
        }
    });
}

walkDir(directoryPath);
console.log('Reemplazo completado.');
