
export interface INGRow {
  'nume beneficiar/ordonator': string;
  'tip tranzactie': string;
  valuta: string;
  suma: string;
}

export interface RevolutRow {
  Description: string;
  Type: string;
  'Orig currency': string;
  'Orig amount': string;
  Amount: string;
}

export interface CommonRow {
  Bank: 'ING' | 'Revolut';
  From: string;
  Type: string;
  Currency: string;
  Amount: number;
}