import fs from 'fs';
import path from 'path';
import { csvReader } from '../lib/csv-reader.js';
import { LAST_MONTH_PATH } from '../constants/constants.js';
import { CommonRow, INGRow, RevolutRow } from './statement.service.types.js';
import { csvWriter } from '../lib/csv-writer.js';

export const STATEMENTS_PATH = path.join(LAST_MONTH_PATH, 'statements');

/**
 * Add in last-month/statements:
 *   - account-statement.csv <- all accounts aggregated from Revolut
 *   - ING_RON.csv
 *   - ING_EUR.csv
 * 
 * Output:
 *   - last-month/output/aggregated_statements.csv
 */
class StatementService {
  async aggregateStatements(): Promise<CommonRow[]> {
    const statements = await this.readStatements();
    const allRows = statements.flatMap(statement => statement.rows);

    // group by Bank, From, Type, Currency and Amount sign (positive or negative) and sum the Amount
    const groupedRows = allRows.reduce<Record<string, { row: CommonRow; amount: number }>>((acc, row) => {
      const key = `${row.Bank}-${row.From}-${row.Type}-${row.Currency}-${row.Amount > 0 ? 'positive' : 'negative'}`;
      acc[key] = { row, amount: (acc[key]?.amount || 0) + Number(row.Amount) };
      return acc;
    }, {} as Record<string, { row: CommonRow; amount: number }>);

    const result = Object.values(groupedRows).map(({ row, amount }) => {
      return { ...row, Amount: amount };
    });

    // sort by Bank (ASC), Currency (ASC), From (ASC), Type (ASC), Amount (DESC)
    result.sort((a, b) => {
      if (a.Bank !== b.Bank) return a.Bank.localeCompare(b.Bank);
      if (a.Currency !== b.Currency) return a.Currency.localeCompare(b.Currency);
      if (a.From !== b.From) return a.From.localeCompare(b.From);
      if (a.Type !== b.Type) return a.Type.localeCompare(b.Type);
      return b.Amount - a.Amount;
    });

    await this.writeAggregatedStatements(result);

    return result;
  }

  async writeAggregatedStatements(statements: CommonRow[]): Promise<void> {
    const headers = ['Bank', 'From', 'Type', 'Currency', 'Amount'];
    const filePath = path.join(LAST_MONTH_PATH, 'output/aggregated_statements.csv');
    csvWriter.createCsvFile(statements, headers, filePath);
  }

  async readStatements(): Promise<{ fileName: string; rows: any[] }[]> {
    const statements = fs.readdirSync(STATEMENTS_PATH).filter(file => file.endsWith('.csv'));
    return await Promise.all(statements.map(statement => {
      const isING = statement.includes('ING');
      const delimiter = isING ? ';' : ',';
      return csvReader.parseCsv<INGRow | RevolutRow>(path.join(STATEMENTS_PATH, statement), delimiter).then(rows => {
        return {
          fileName: statement,
          rows: rows.map(row => isING ? this.parseINGRow(row as INGRow) : this.parseRevolutRow(row as RevolutRow)),
        };
      });
    }));
  }

  private parseINGRow(row: INGRow): CommonRow {
    return {
      Bank: 'ING',
      From: row['nume beneficiar/ordonator'],
      Type: row['tip tranzactie'],
      Currency: row.valuta,
      Amount: Number(row.suma.replace(',', '.')),
    };
  }

  private parseRevolutRow(row: RevolutRow): CommonRow {
    const amountSign = row.Type === 'EXCHANGE' ? 1 : Number(row.Amount) >= 0 ? 1 : -1;
    return {
      Bank: 'Revolut',
      From: this.sanitizeFrom(row.Description),
      Type: row.Type,
      Currency: row['Orig currency'],
      Amount: Number(row['Orig amount']) * amountSign,
    };
  }

  private sanitizeFrom(from: string): string {
    // 'Facebk *f8sqm7zrb2' => "Facebook ads"
    if (from.startsWith('Facebk *')) {
      return 'Facebook ads';
    }
    return from;
  }
}

const statementService = new StatementService();

export { statementService };