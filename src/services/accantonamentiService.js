import fs from 'fs';
import dotenv from 'dotenv';

const fileAccantonamenti = process.env.ACCANTONAMENTI_PATH;

dotenv.config();

function getAccantonamenti() {
    const raw = fs.readFileSync(fileAccantonamenti);
    return JSON.parse(raw);
}

export const accantonamentiService = {
    getAccantonamenti
};