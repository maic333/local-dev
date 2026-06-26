export interface SamedayPayoutRow {
  'Nume client / companie': string;
  Brand: string;
  Banca: string;
  IBAN: string;
  'Suma totala': string;
  'Perioada export': string;
}

export interface SamedayAggregatedPayoutRow {
  'Companie': string;
  'Suma totala': string;
  'De la': string;
  'Pana la': string;
}