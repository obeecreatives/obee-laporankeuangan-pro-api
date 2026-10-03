export type AccountCategory = 'AKTIVA' | 'HUTANG' | 'MODAL' | 'PENDAPATAN' | 'BEBAN';

export interface ChartOfAccount {
  kode: string;
  nama: string;
  kategori: AccountCategory;
  normalBalance: 'Debit' | 'Kredit';
}

export type TransactionType =
  | 'Pendapatan Proyek'
  | 'Beban'
  | 'Pembayaran Hutang'
  | 'Pelunasan Piutang';

export type DivisionType =
  | 'Fotografi'
  | 'Desain Grafis'
  | 'Videografi'
  | 'Social Media Management'
  | 'Workshop/Pelatihan'
  | 'Umum/Tidak Spesifik';

export type PaymentStatus =
  | 'Lunas (Kas Langsung Keluar/Masuk)'
  | 'Belum Lunas (Jadi Hutang/Piutang)';

export interface JurnalEntry {
  id: string;
  no: number;
  tanggal: string; // YYYY-MM-DD
  tipe: TransactionType;
  divisi: DivisionType;
  deskripsi: string;
  kodeAkun: string;
  namaAkun: string;
  jumlah: number;
  statusBayar: PaymentStatus;
  tanggalBayar?: string;
  referensiId?: string;
  sumberIntegrasi?: 'MANUAL' | 'CRM_INVOICE' | 'PAYROLL' | 'PROJECT_CONTROL_FEE';
}

export interface ImportLogEntry {
  id: string;
  sumber: 'CRM_INVOICE' | 'PAYROLL' | 'PROJECT_CONTROL_FEE';
  idReferensi: string;
  waktuImport: string;
  statusSaatImport: string;
  jumlah: number;
}

export interface LabaRugiReport {
  periodeAwal: string;
  periodeAkhir: string;
  pendapatan: Array<{ kode: string; nama: string; jumlah: number }>;
  totalPendapatan: number;
  beban: Array<{ kode: string; nama: string; jumlah: number }>;
  totalBeban: number;
  labaRugi: number;
  marginPersen: number;
}

export interface NeracaReport {
  tanggal: string;
  aktiva: Array<{ kode: string; nama: string; jumlah: number }>;
  totalAktiva: number;
  hutang: Array<{ kode: string; nama: string; jumlah: number }>;
  totalHutang: number;
  modal: Array<{ kode: string; nama: string; jumlah: number }>;
  totalModal: number;
  totalHutangModal: number;
  selisih: number;
  isBalanced: boolean;
}

export interface FinancialDashboardSummary {
  bulanIni: string;
  totalPendapatan: number;
  totalBeban: number;
  labaRugi: number;
  totalKas: number;
  totalPiutang: number;
  totalHutang: number;
  totalModal: number;
}

export type UserRole = 'super_admin' | 'project_manager' | 'creator_staff' | 'client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  divisi: string;
  pin: string;
  telepon: string;
}

export interface WorkspaceModule {
  id: string;
  name: string;
  category: 'core' | 'finance' | 'creative' | 'people';
  description: string;
  adminOnly?: boolean;
  status: 'active' | 'integrated' | 'external_app';
  icon: string;
  externalUrl?: string;
  sheetId?: string;
}
