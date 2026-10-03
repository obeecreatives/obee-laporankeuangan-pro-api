import { ChartOfAccount, DivisionType, TransactionType, PaymentStatus, WorkspaceModule, UserProfile } from '../types/finance';

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

export const WORKSPACE_MODULES: WorkspaceModule[] = [
  // A. Core Operations
  {
    id: 'project-control',
    name: 'Project Control',
    category: 'core',
    description: 'Produksi konten, status Kanban, kalender penayangan, verifikasi materi, dan fee creator otomatis.',
    status: 'integrated',
    icon: 'KanbanSquare',
    sheetId: SPREADSHEET_IDS.PROJECT_CONTROL,
  },
  {
    id: 'crm-clients',
    name: 'CRM Clients Hub',
    category: 'core',
    description: 'Source of truth daftar klien resmi dari Spreadsheet CRM. Filter divisi Social Media Management.',
    status: 'integrated',
    icon: 'Briefcase',
    externalUrl: 'https://script.google.com/macros/s/AKfycbxVhwbra0GbiYtmjbtywZiC3yPHLuOd7uJcST4a9jbowO_MmT1PuUxWNB4a5FUyVdjcKA/exec',
    sheetId: SPREADSHEET_IDS.CRM,
  },
  {
    id: 'staff-hr',
    name: 'Database Staff & HR',
    category: 'core',
    description: 'Profil tim kreatif, role, rate card fee per konten, dan sistem presensi GPS radius kantor.',
    status: 'integrated',
    icon: 'Users',
    externalUrl: 'https://script.google.com/macros/s/AKfycbzPNl7XQg1bJsuBbBKVmmSxZE6vI_ywwHNdIXjFFME6yB2vElBRNgE904SUO-LZjxQd/exec',
    sheetId: SPREADSHEET_IDS.STAFF,
  },

  // B. Finance & Legal (Admin Only)
  {
    id: 'laporan-keuangan',
    name: 'Laporan Keuangan',
    category: 'finance',
    description: 'Buku jurnal transaksi, Laba Rugi akrual, Neraca per tanggal, dan integrasi penarikan data.',
    adminOnly: true,
    status: 'active',
    icon: 'DollarSign',
    sheetId: SPREADSHEET_IDS.LAPORAN_KEUANGAN,
  },
  {
    id: 'database-surat',
    name: 'Database Surat',
    category: 'finance',
    description: 'Penomoran surat resmi otomatis, MoU, NDA, dan arsip kontrak kerja sama agensi.',
    adminOnly: true,
    status: 'integrated',
    icon: 'FileText',
    externalUrl: 'https://script.google.com/macros/s/AKfycbyyfBize1EAdjlzMXD2pjWN3ot-UrhcGdvkyOhM9_hLLQ3Iv9ouLen8e1hOrH-OJZ3TFg/exec',
  },
  {
    id: 'documents-hub',
    name: 'Documents Hub',
    category: 'finance',
    description: 'Pusat navigasi SOP operasional, template pitch deck klien, dan brand guidelines agensi.',
    adminOnly: false,
    status: 'integrated',
    icon: 'FolderOpen',
    externalUrl: 'https://script.google.com/macros/s/AKfycbwjJZKnFPhFto2Fr0m6DGnEQSNyVeEb6Yue3C9OkNpivNm-6sPp1GJo3h5HIwylGhy9/exec',
  },

  // C. Creative & Studio Assets
  {
    id: 'equipments-hub',
    name: 'Equipments Hub',
    category: 'creative',
    description: 'Inventarisasi kamera, lensa, lighting studio, serta log peminjaman dan pengembalian alat.',
    adminOnly: true,
    status: 'integrated',
    icon: 'Camera',
    externalUrl: 'https://script.google.com/macros/s/AKfycbzxgVVBfzjH7CgY6zAW-VUczewnN5cEEpfw0CYSGS-4qjukcqvQ3EIFzNS3_3TwdNJ10g/exec',
  },
  {
    id: 'packaging-builder',
    name: 'Logo & Packaging Builder',
    category: 'creative',
    description: 'Template spesifikasi kemasan, visual mockup produk, dan generator aset grafis agensi.',
    adminOnly: false,
    status: 'external_app',
    icon: 'Package',
  },
  {
    id: 'social-audit',
    name: 'Form Audit Media Sosial',
    category: 'creative',
    description: 'Audit performa engagement rate, reach, dan visual profile calon klien sebelum pitch.',
    adminOnly: false,
    status: 'external_app',
    icon: 'Share2',
  },

  // D. People & Talent
  {
    id: 'recruitment-admin',
    name: 'Recruitment - Admin',
    category: 'people',
    description: 'Panel seleksi berkas kandidat, scoring portfolio, dan penjadwalan interview tim baru.',
    adminOnly: true,
    status: 'external_app',
    icon: 'UserCheck',
  },
  {
    id: 'recruitment-public',
    name: 'Recruitment Obeecreatives',
    category: 'people',
    description: 'Portal publik untuk pendaftaran calon tim freelance maupun full-time kreator.',
    adminOnly: false,
    status: 'external_app',
    icon: 'UserPlus',
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Lalu Mahendra',
    email: 'lalumahendra@gmail.com',
    role: 'super_admin',
    roleLabel: 'Super Admin & PM',
    divisi: 'Management',
    pin: '1234',
    telepon: '+62 812-3456-7890',
  },
  {
    id: 'usr-2',
    name: 'Obee Site Engineer',
    email: 'obeetools@gmail.com',
    role: 'project_manager',
    roleLabel: 'Site Engineer',
    divisi: 'Tech & Infrastructure',
    pin: '5678',
    telepon: '+62 813-9876-5432',
  },
  {
    id: 'usr-3',
    name: 'Rian Kreator (Talent)',
    email: 'rian.creator@obeecreatives.com',
    role: 'creator_staff',
    roleLabel: 'Creator / Staff',
    divisi: 'Social Media Management',
    pin: '1122',
    telepon: '+62 819-2233-4455',
  },
  {
    id: 'usr-4',
    name: 'Client Representative (Brand Partner)',
    email: 'partner@clientbrand.com',
    role: 'client',
    roleLabel: 'Client Partner',
    divisi: 'Client Portal',
    pin: '9999',
    telepon: '+62 811-0000-1111',
  },
];

export const SWITCH_APP_LIST = [
  {
    name: 'CRM Paket Lengkap',
    url: 'https://script.google.com/macros/s/AKfycbxVhwbra0GbiYtmjbtywZiC3yPHLuOd7uJcST4a9jbowO_MmT1PuUxWNB4a5FUyVdjcKA/exec',
    tag: 'Clients & Invoicing',
  },
  {
    name: 'Database Staff',
    url: 'https://script.google.com/macros/s/AKfycbzPNl7XQg1bJsuBbBKVmmSxZE6vI_ywwHNdIXjFFME6yB2vElBRNgE904SUO-LZjxQd/exec',
    tag: 'HR & Payroll',
  },
  {
    name: 'Equipment Hub',
    url: 'https://script.google.com/macros/s/AKfycbzxgVVBfzjH7CgY6zAW-VUczewnN5cEEpfw0CYSGS-4qjukcqvQ3EIFzNS3_3TwdNJ10g/exec',
    tag: 'Studio Inventory',
  },
  {
    name: 'Document Hub',
    url: 'https://script.google.com/macros/s/AKfycbwjJZKnFPhFto2Fr0m6DGnEQSNyVeEb6Yue3C9OkNpivNm-6sPp1GJo3h5HIwylGhy9/exec',
    tag: 'SOP & Pitch Deck',
  },
  {
    name: 'Database Surat',
    url: 'https://script.google.com/macros/s/AKfycbyyfBize1EAdjlzMXD2pjWN3ot-UrhcGdvkyOhM9_hLLQ3Iv9ouLen8e1hOrH-OJZ3TFg/exec',
    tag: 'MoU & Kontrak',
  },
];
