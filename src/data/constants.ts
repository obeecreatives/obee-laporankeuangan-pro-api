import { ChartOfAccount, DivisionType, TransactionType, PaymentStatus } from '../types/finance';

export const DEFAULT_GAS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxbBbXvA-anDn5ceglmzHBOWDetcWPkGqcW4EJTrs8N4r1HfH5oABADj_kvUL-jaXPI/exec';

export const SPREADSHEET_IDS = {
  LAPORAN_KEUANGAN: '1PpNpFOmflyDja0C4mlhDsoTGX6x7bcDa_80cTjXQiCM',
  CRM: '1i8wT9sFuDLDEl7pXfGsrCYqYP5wEigaMCnwttqvXY5U',
  STAFF: '1dzGWpbHcSMBhpV_mivTTg0DCyllWT1Ymhe-GD7I-AOE',
  PROJECT_CONTROL: '1el1tK4NGhoslMWECWzIo-7nBAEox6KZ-2TjlJ6WLIV8',
};

export const CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // Aktiva
  { kode: '1.1.1', nama: 'Kas dan Bank', kategori: 'AKTIVA', normalBalance: 'Debit' },
  { kode: '1.1.2', nama: 'Piutang Usaha', kategori: 'AKTIVA', normalBalance: 'Debit' },
  { kode: '1.2.1', nama: 'Peralatan', kategori: 'AKTIVA', normalBalance: 'Debit' },
  { kode: '1.2.2', nama: 'Akumulasi Penyusutan', kategori: 'AKTIVA', normalBalance: 'Kredit' },

  // Hutang
  { kode: '2.1.1', nama: 'Hutang Jasa (Fee Freelancer/Tim)', kategori: 'HUTANG', normalBalance: 'Kredit' },
  { kode: '2.1.2', nama: 'Hutang Usaha (Vendor/Supplier)', kategori: 'HUTANG', normalBalance: 'Kredit' },
  { kode: '2.1.3', nama: 'Hutang Pajak', kategori: 'HUTANG', normalBalance: 'Kredit' },
  { kode: '2.1.4', nama: 'Hutang Gaji Karyawan (Belum Dibayar)', kategori: 'HUTANG', normalBalance: 'Kredit' },

  // Modal
  { kode: '3.1.1', nama: 'Modal Disetor', kategori: 'MODAL', normalBalance: 'Kredit' },
  { kode: '3.2.1', nama: 'Laba Ditahan', kategori: 'MODAL', normalBalance: 'Kredit' },

  // Pendapatan
  { kode: '4.1.1', nama: 'Pendapatan Fotografi', kategori: 'PENDAPATAN', normalBalance: 'Kredit' },
  { kode: '4.1.2', nama: 'Pendapatan Desain Grafis', kategori: 'PENDAPATAN', normalBalance: 'Kredit' },
  { kode: '4.1.3', nama: 'Pendapatan Videografi', kategori: 'PENDAPATAN', normalBalance: 'Kredit' },
  { kode: '4.1.4', nama: 'Pendapatan Social Media Management', kategori: 'PENDAPATAN', normalBalance: 'Kredit' },
  { kode: '4.1.5', nama: 'Pendapatan Workshop/Pelatihan', kategori: 'PENDAPATAN', normalBalance: 'Kredit' },
  { kode: '4.2.1', nama: 'Pendapatan Lain-lain', kategori: 'PENDAPATAN', normalBalance: 'Kredit' },

  // Beban
  { kode: '5.1.1', nama: 'Beban Fee Freelancer/Tim (Cost of Services)', kategori: 'BEBAN', normalBalance: 'Debit' },
  { kode: '5.2.1', nama: 'Beban Gaji Staff', kategori: 'BEBAN', normalBalance: 'Debit' },
  { kode: '5.2.2', nama: 'Beban Produksi/Operasional Proyek', kategori: 'BEBAN', normalBalance: 'Debit' },
  { kode: '5.2.3', nama: 'Beban Sewa Studio/Kantor', kategori: 'BEBAN', normalBalance: 'Debit' },
  { kode: '5.2.4', nama: 'Beban Listrik, Internet & Utilitas', kategori: 'BEBAN', normalBalance: 'Debit' },
  { kode: '5.2.5', nama: 'Beban Marketing/Iklan', kategori: 'BEBAN', normalBalance: 'Debit' },
  { kode: '5.2.6', nama: 'Beban Administrasi Lainnya', kategori: 'BEBAN', normalBalance: 'Debit' },
];

export const DIVISI_LIST: DivisionType[] = [
  'Fotografi',
  'Desain Grafis',
  'Videografi',
  'Social Media Management',
  'Workshop/Pelatihan',
  'Umum/Tidak Spesifik',
];

export const TIPE_TRANSAKSI: TransactionType[] = [
  'Pendapatan Proyek',
  'Beban',
  'Pembayaran Hutang',
  'Pelunasan Piutang',
];

export const STATUS_BAYAR: PaymentStatus[] = [
  'Lunas (Kas Langsung Keluar/Masuk)',
  'Belum Lunas (Jadi Hutang/Piutang)',
];

export const BEBAN_TO_HUTANG_MAP: Record<string, string> = {
  '5.1.1': '2.1.1', // Beban Fee Freelancer -> Hutang Jasa
  '5.2.1': '2.1.4', // Beban Gaji Staff -> Hutang Gaji Karyawan
};

export const INITIAL_SALDO_AWAL: Record<string, number> = {
  '1.1.1': 0, // Kas dan Bank
  '1.1.2': 0, // Piutang Usaha
  '1.2.1': 0, // Peralatan
  '1.2.2': 0, // Akumulasi Penyusutan (Kredit)
  '2.1.1': 0, // Hutang Jasa Freelancer
  '2.1.2': 0, // Hutang Usaha
  '2.1.3': 0,
  '2.1.4': 0,
  '3.1.1': 0, // Modal Disetor
  '3.2.1': 0, // Laba Ditahan
};
