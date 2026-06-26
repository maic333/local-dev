import fs from 'fs';
import path from 'path';
import { LAST_MONTH_PATH } from '../constants/constants.js';
import { csvWriter } from '../lib/csv-writer.js';
import { xlsxReader } from '../lib/xlsx-reader.js';
import { SamedayAggregatedPayoutRow, SamedayPayoutRow } from './sameday.service.types.js';
import dayjs from 'dayjs';

export const SAMEDAY_PATH = path.join(LAST_MONTH_PATH, 'sameday');

/**
 * 1. Input:
 *  Sameday > Rambursuri nationale
 * 
 * 2. Add to GDrive:
 *  Sameday > Expedieri > Filter (Rambursul a fost transferat) + Data Livrare (Luna trecuta 1 - 31)
 */
class SamedayService {
  async aggregatePayouts(): Promise<SamedayAggregatedPayoutRow[]> {
    const payoutsFiles = await this.readPayoutsFiles();

    let allRows: SamedayAggregatedPayoutRow[] = [];
    for (const payoutFile of payoutsFiles) {
      for (const row of payoutFile.rows) {
        allRows.push(this.parseSamedayPayoutRow(row));
      }
    }

    // sort by De la (ASC), Pana la (ASC)
    allRows.sort((a, b) => {
      if (a['De la'] !== b['De la']) return a['De la'].localeCompare(b['De la']);
      return a['Pana la'].localeCompare(b['Pana la']);
    });

    await this.writeAggregatedPayouts(allRows);

    return allRows;
  }

  async writeAggregatedPayouts(payouts: SamedayAggregatedPayoutRow[]): Promise<void> {
    const headers = [
      'Companie',
      'Suma totala',
      'De la',
      'Pana la',
    ];
    const filePath = path.join(LAST_MONTH_PATH, 'output/sameday_payouts.csv');
    csvWriter.createCsvFile(payouts, headers, filePath);
  }

  async readPayoutsFiles(): Promise<{ fileName: string; rows: SamedayPayoutRow[] }[]> {
    const payoutFiles = fs.readdirSync(SAMEDAY_PATH).filter(file => file.includes('cod-ledger') && file.endsWith('.xlsx'));
    return await Promise.all(payoutFiles.map(async payoutFile => {
      let rows: SamedayPayoutRow[];
      rows = await xlsxReader.parseXlsx<SamedayPayoutRow>(path.join(SAMEDAY_PATH, payoutFile));
      return {
        fileName: payoutFile,
        rows,
      }
    }));
  }

  private parseSamedayPayoutRow(row: SamedayPayoutRow): SamedayAggregatedPayoutRow {
    const [startDate, endDate] = row['Perioada export'].split(' - ');
    return {
      'Companie': row['Nume client / companie'],
      'Suma totala': row['Suma totala'],
      'De la': dayjs(startDate).format('YYYY-MM-DD'),
      'Pana la': dayjs(endDate).format('YYYY-MM-DD'),
    };
  }

}

const samedayService = new SamedayService();

export { samedayService };