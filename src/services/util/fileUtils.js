import fs from 'fs';
import path  from 'path';
import { contiService } from '../contiService.js';
import csvtojson from 'csvtojson'
import csv from 'csv-parser';


function getFilePath(key, fileName) {
    let result = null;
    contiService.getElencoConti().forEach(contoPath => {
        const fileInfo = path.join(contoPath, 'info.json');
        const info = JSON.parse(fs.readFileSync(fileInfo));
        if (info.key === key) {
            result = path.join(contoPath, fileName);
        }
    });
    return result;
}

async function readCsvAsJson(filePath) {
    const jsonArray = await csvtojson().fromFile(filePath);
    return jsonArray;
}

async function readCsv(filePath) {
    const promise = () => new Promise((resolve, reject) => {
        const result = [];
    
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            const importo = parseFloat(data.importo);
            if (!isNaN(importo)) {
                result.push({ ...data, importo });
            }
          })       
            .on('end',function() {
            resolve(result)
            })
            .on('error', function(err) {
            reject(err);
            });
      });
    
      const result = await promise();
      return result;
}

export const fileUtility = {
    getFilePath,
    readCsvAsJson,
    readCsv
};