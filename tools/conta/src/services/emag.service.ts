import fs from 'fs';
import path from 'path';
import { csvReader } from '../lib/csv-reader.js';
import { LAST_MONTH_PATH } from '../constants/constants.js';
import { csvWriter } from '../lib/csv-writer.js';
import { EmagDcRow, EmagDedRow, EmagDfoRow, EmagDpRow, EmagOrdersInvoicesRow, EmagPreviousOrdersRow, EmagRow } from './emag.service.types.js';
import { xlsxReader } from '../lib/xlsx-reader.js';

export const EMAG_PATH = path.join(LAST_MONTH_PATH, 'emag');

/**
 * 1. Input in last-month/emag:
 *   - dc.xlsx
 *   - ded.xlsx
 *   - dfo.xlsx
 *   - dp.xlsx (x2)
 *   - orders_invoices.csv (from baselinker)
 *   - last emag_orders.csv
 * 
 * Output:
 *   - output/emag_orders.csv
 * 
 * 2. Emag > Financiar > Facturi > Luna referinta > Factura + Desfasurator
 * 3. Emag > Financiar > Desfasuratorare > DP
 * 4. Baselinker > Orders > Filter (Order date last month) > Printouts & Exports > orders_invoices
 */
class EmagService {
  async aggregateOrders(): Promise<EmagRow[]> {
    const ordersFiles = await this.readOrdersFiles();

    let allRows: EmagRow[] = [];
    for (const ordersFile of ordersFiles) {
      for (const row of ordersFile.rows) {
        if (row['Order ID']?.trim()) {
          const existingRowIdx = allRows.findIndex(r => r['Order ID'] === row['Order ID']);
          if (existingRowIdx !== -1) {
            for (const key in row) {
              if (!!row[key as keyof EmagRow]) {
                (allRows as any)[existingRowIdx][key as keyof EmagRow] = row[key as keyof EmagRow];
              }
            }
          } else {
            allRows.push(row);
          }
        }
      }
    }

    // sort by Data (ASC), Order ID (ASC)
    allRows.sort((a, b) => {
      // if (a.Data !== b.Data) return a.Data!.localeCompare(b.Data!);
      return a['Order ID'].localeCompare(b['Order ID']);
    });

    allRows = allRows.map(row => this.calculateProfit(row));
    allRows = allRows.map(row => this.calculatePayouts(row));

    await this.writeAggregatedOrders(allRows);

    return allRows;
  }

  async writeAggregatedOrders(orders: EmagRow[]): Promise<void> {
    const headers = [
      'Order ID',
      'Invoice',
      'Data',
      'Client',
      'Plata',
      'Cantitate',
      'Valoare Net',
      'Comision Net',
      'Comision Genius NET',
      'Comision FBE NET',
      'Valoare cu TVA',
      'Comisioane cu TVA',
      'Profit cu TVA',
      'Payout date',
      'Payout restant',
      'Payout curent',
      'Payout next',
    ];
    const filePath = path.join(LAST_MONTH_PATH, 'output/emag_orders.csv');
    csvWriter.createCsvFile(orders, headers, filePath);
  }

  getNumber(value?: string): number {
    if (!value) return 0;
    return Number(value) || 0;
  }

  round(number: number): string {
    return (+number.toFixed(2)).toString();
  }

  addVat(number: number): string {
    return this.round(number + (number * 0.21));
  }

  calculateProfit(row: EmagRow): EmagRow {
    const value = this.addVat(this.getNumber(row['Valoare Net']));
    const commissions = this.addVat(this.getNumber(row['Comision Net']) + this.getNumber(row['Comision Genius NET']) + this.getNumber(row['Comision FBE NET']));

    return {
      ...row,
      'Valoare cu TVA': value,
      'Comisioane cu TVA': commissions,
      'Profit cu TVA': this.round(Number(value) + Number(commissions)),
    };
  }

  calculatePayouts(row: EmagRow): EmagRow {
    let payoutCurent = '';
    let payoutNext = '';
    if (row['Payout date']) {
      payoutCurent = row['Profit cu TVA'] ?? '';
    } else {
      payoutCurent = row['Comisioane cu TVA'] ?? '';
      payoutNext = row['Valoare cu TVA'] ?? '';
    }

    return {
      ...row,
      'Payout curent': payoutCurent,
      'Payout next': payoutNext,
    };
  }

  async readOrdersFiles(): Promise<{ fileName: string; rows: EmagRow[]; type: 'dc' | 'dp' | 'ded' | 'dfo' | 'previous' | 'invoices' }[]> {
    const orders = fs.readdirSync(EMAG_PATH).filter(file => file.endsWith('.csv') || file.endsWith('.xlsx'));
    return await Promise.all(orders.map(async order => {
      let type: 'dc' | 'dp' | 'ded' | 'dfo' | 'previous' | 'invoices';
      if (order.includes('_dc_')) {
        type = 'dc';
      } else if (order.includes('_dp_')) {
        type = 'dp';
      } else if (order.includes('_ded_')) {
        type = 'ded';
      } else if (order.includes('_dfo_')) {
        type = 'dfo';
      } else if (order.includes('emag_orders_')) {
        type = 'previous';
      } else if (order.includes('orders_invoices_')) {
        type = 'invoices';
      } else {
        throw new Error(`Invalid order file: ${order}`);
      }

      let rows: (EmagDcRow | EmagDpRow | EmagDedRow | EmagDfoRow | EmagOrdersInvoicesRow)[];
      if (order.endsWith('.csv')) {
        rows = await csvReader.parseCsv<EmagDcRow | EmagDpRow | EmagDedRow | EmagDfoRow | EmagOrdersInvoicesRow>(path.join(EMAG_PATH, order));
      } else if (order.endsWith('.xlsx')) {
        rows = await xlsxReader.parseXlsx<EmagDcRow | EmagDpRow | EmagDedRow | EmagDfoRow | EmagOrdersInvoicesRow>(path.join(EMAG_PATH, order));
      } else {
        throw new Error(`Unsupported file type: ${order}`);
      }

      let parsedRows = rows.map(row => this.parseEmagAnyRow(type, row));

      if (type === 'dfo') {
        // sum up the value of 'Comision FBE NET' for the same 'Order ID'
        let aggregatedRows: EmagRow[] = [];
        for (const row of parsedRows) {
          const existingRowIdx = aggregatedRows.findIndex(r => r['Order ID'] === row['Order ID']);
          if (existingRowIdx !== -1) {
            const currentValue = Number(aggregatedRows[existingRowIdx]['Comision FBE NET'] ?? 0);
            aggregatedRows[existingRowIdx]['Comision FBE NET'] = this.round(currentValue + Number(row['Comision FBE NET']));
          } else {
            aggregatedRows.push(row);
          }
        }
        parsedRows = aggregatedRows;
      }

      if (type === 'previous') {
        parsedRows = parsedRows.filter(row => Number(row['Payout restant']) > 0);
      }

      return {
        fileName: order,
        rows: parsedRows,
        type,
      }
    }));
  }

  private parseEmagAnyRow(type: 'dc' | 'dp' | 'ded' | 'dfo' | 'previous' | 'invoices', row: EmagDcRow | EmagDpRow | EmagDedRow | EmagDfoRow | EmagPreviousOrdersRow | EmagOrdersInvoicesRow): EmagRow {
    if (type === 'dc') {
      return this.parseEmagDcRow(row as EmagDcRow);
    } else if (type === 'dp') {
      return this.parseEmagDpRow(row as EmagDpRow);
    } else if (type === 'ded') {
      return this.parseEmagDedRow(row as EmagDedRow);
    } else if (type === 'dfo') {
      return this.parseEmagDfoRow(row as EmagDfoRow);
    } else if (type === 'previous') {
      return this.parseEmagPreviousOrdersRow(row as EmagPreviousOrdersRow);
    } else if (type === 'invoices') {
      return this.parseEmagOrdersInvoicesRow(row as EmagOrdersInvoicesRow);
    } else {
      throw new Error(`Invalid row type: ${type}`);
    }
  }

  private parseEmagDcRow(row: EmagDcRow): EmagRow {
    return {
      'Order ID': row['ID comanda']?.toString(),
      Data: row['Data comanda'],
      Client: row['Nume client'],
      Cantitate: row['Cantitate'],
      'Valoare Net': row['Valoare produse'],
      'Comision Net': row['Comision Net'] ? `-${row['Comision Net']}` : '',
    };
  }

  private parseEmagDpRow(row: EmagDpRow): EmagRow {
    return {
      'Order ID': row['Order ID']?.toString(),
      Data: row['Order date'],
      Client: row['Client name'],
      Plata: row['Payment method'],
      'Payout date': row['Payout date'],
    };
  }

  private parseEmagDedRow(row: EmagDedRow): EmagRow {
    const valueRow = row['Valoare produs'] || row['Value of products'];
    return {
      'Order ID': (row['ID comanda'] || row['Order ID'])?.toString(),
      Data: row['Data comanda'],
      Client: row['Nume client'],
      'Comision Genius NET': valueRow ? `-${valueRow}` : '',
    };
  }

  private parseEmagDfoRow(row: EmagDfoRow): EmagRow {
    return {
      'Order ID': row['ID comanda']?.toString(),
      'Comision FBE NET': row['Valoare'] ? `-${row['Valoare']}` : '',
    };
  }

  private parseEmagPreviousOrdersRow(row: EmagPreviousOrdersRow): EmagRow {
    return {
      'Order ID': row['Order ID']?.toString(),
      'Payout restant': row['Payout next'] ?? '',
    };
  }

  private parseEmagOrdersInvoicesRow(row: EmagOrdersInvoicesRow): EmagRow {
    return {
      'Order ID': row['emag_id']?.toString(),
      'Invoice': row['invoice_id']?.toString(),
    };
  }
}

const emagService = new EmagService();

export { emagService };