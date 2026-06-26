import fs from 'fs';
import * as XLSX from 'xlsx';

class XlsxReader {
  async parseXlsx<T>(filePath: string): Promise<T[]> {
    const fileBuffer = fs.readFileSync(filePath);

    // 1. Parse workbook
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // 2. Luăm prima foaie
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 3. Transformăm în JSON (array de obiecte)
    const data = XLSX.utils.sheet_to_json<T>(sheet, { defval: null });

    return data;
  }

}

const xlsxReader = new XlsxReader();

export { xlsxReader };