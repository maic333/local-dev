import { createWriteStream } from 'fs';
import { stringify } from 'csv-stringify';

class CsvWriter {
  createCsvFile<T>(data: T[], headers: string[], filePath: string): void {
    const writable = createWriteStream(filePath);

    const stringifier = stringify({
      header: true,
      columns: headers,
    });

    data.forEach((row) => stringifier.write(row));
    stringifier.end();

    stringifier.pipe(writable);
  }
}

const csvWriter = new CsvWriter();

export { csvWriter };