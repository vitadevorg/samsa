
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = "c:/Users/lgluc/Desktop/SAMSA FRONT/samsa-frontend/samsa-frontend/src";

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith(".js") || fullPath.endsWith(".jsx") || fullPath.endsWith(".css")) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf-8");
    
    // Remove {/* comment */}
    content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
    
    // Remove /* comment */
    content = content.replace(/\/\*[\s\S]*?\*\//g, "");
    
    // Remove line comments (not preceded by :)
    content = content.replace(/(?<!:)\/\/.*$/gm, "");
    
    // Clean up multiple empty lines
    content = content.replace(/^\s*[\r\n]/gm, "\n");
    content = content.replace(/\n{3,}/g, "\n\n");
    
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("Processed:", filePath);
}

walkDir(dir);
console.log("Done");

