import fs from 'fs';
import { parse } from 'csv-parse';

class CsvReader {
  parseCsv<T>(filePath: string, delimiter: string = ','): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];

      fs.createReadStream(filePath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter,
          })
        )
        .on('data', (row) => {
          records.push(row);
        })
        .on('end', () => {
          resolve(records);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

}

const csvReader = new CsvReader();

export { csvReader };