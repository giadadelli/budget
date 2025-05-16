import fs from 'fs';
import path  from 'path';
import { contiService } from '../contiService.js';
import csvtojson from 'csvtojson'
import csv from 'csv-parser';


function compare(a, b) {
    const dateA = Date.parse(a);
    const dateB = Date.parse(b);
    if (dateA < dateB) {
        return 1;
    }
    if (dateA > dateB) {
        return -1;
    }
        return 0;
      
}

export const dateUtility = {
    compare
};