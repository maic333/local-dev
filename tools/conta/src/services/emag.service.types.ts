// Comisioane EMAG
export interface EmagDcRow {
  'ID comanda': string;
  Cantitate: string;
  'Valoare produse': string;
  'Comision Net': string;
  'Nume client': string;
  'Data comanda': string;
}

// Payouts EMAG
export interface EmagDpRow {
  'Order ID': string;
  'Payout date': string;
  'Client name': string;
  'Order date': string;
  'Payment method': string;
  'Fraction value': string;
}

// Comisioane Genius
export interface EmagDedRow {
  'ID comanda': string;
  'Order ID': string;
  'Data comanda': string;
  'Nume client': string;
  'Valoare produs': string;
  'Value of products': string;
}

// Comisioane FBE
export interface EmagDfoRow {
  'ID comanda': string;
  'Valoare': string;
}

export interface EmagPreviousOrdersRow {
  'Order ID': string;
  'Payout next': string;
}

export interface EmagOrdersInvoicesRow {
  order_number: string;
  source: string;
  shopify_id: string;
  emag_id: string;
  invoice_id: string;
}

export interface EmagRow {
  'Order ID': string;
  Invoice?: string;
  Data?: string;
  Client?: string;
  'Plata'?: string;
  Cantitate?: string;
  'Valoare Net'?: string;
  'Comision Net'?: string;
  'Comision Genius NET'?: string;
  'Comision FBE NET'?: string;
  'Valoare cu TVA'?: string;
  'Comisioane cu TVA'?: string;
  'Profit cu TVA'?: string;
  'Payout date'?: string;
  'Payout restant'?: string;
  'Payout curent'?: string;
  'Payout next'?: string;
}