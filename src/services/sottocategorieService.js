import fs from 'fs';


const fileSottocategorie = process.env.SOTTOCATEGORIE_PATH;

function getSottocategorie() {
    const raw = fs.readFileSync(fileSottocategorie);
    return JSON.parse(raw);
}

export const sottocategorieService = {
    getSottocategorie
};