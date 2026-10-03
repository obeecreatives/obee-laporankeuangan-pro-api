import {
  JurnalEntry,
  ImportLogEntry,
  LabaRugiReport,
  NeracaReport,
  FinancialDashboardSummary,
} from '../types/finance';
import {
  CHART_OF_ACCOUNTS,
  INITIAL_SALDO_AWAL,
  BEBAN_TO_HUTANG_MAP,
  DEFAULT_GAS_ENDPOINT,
} from '../data/constants';

const STORAGE_KEYS = {
  JURNAL: 'obee_finance_jurnal_entries_v2',
  IMPORT_LOG: 'obee_finance_import_log_v2',
  GAS_ENDPOINT: 'obee_finance_gas_endpoint_v2',
  SALDO_AWAL: 'obee_finance_saldo_awal_v2',
};

// Real verified transactions from live Google Spreadsheet
const SEED_JURNAL_ENTRIES: JurnalEntry[] = [
  {
    id: 'tx-real-1',
    no: 1,
    tanggal: '2026-08-01',
    tipe: 'Beban',
    divisi: 'Umum/Tidak Spesifik',
    deskripsi: 'Payroll STF-1785295519572 (periode s/d 31 Aug)',
    kodeAkun: '5.2.1',
    namaAkun: 'Beban Gaji Staff',
    jumlah: 1320000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    referensiId: 'STF-1785295519572',
    sumberIntegrasi: 'PAYROLL',
  },
  {
    id: 'tx-real-2',
    no: 2,
    tanggal: '2026-08-01',
    tipe: 'Beban',
    divisi: 'Umum/Tidak Spesifik',
    deskripsi: 'Payroll STF-1785307520278 (periode s/d 31 Aug)',
    kodeAkun: '5.2.1',
    namaAkun: 'Beban Gaji Staff',
    jumlah: 990000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    referensiId: 'STF-1785307520278',
    sumberIntegrasi: 'PAYROLL',
  },
  {
    id: 'tx-real-3',
    no: 3,
    tanggal: '2026-08-01',
    tipe: 'Beban',
    divisi: 'Umum/Tidak Spesifik',
    deskripsi: 'Payroll STF-1785374645853 (periode s/d 31 Aug)',
    kodeAkun: '5.2.1',
    namaAkun: 'Beban Gaji Staff',
    jumlah: 400000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    referensiId: 'STF-1785374645853',
    sumberIntegrasi: 'PAYROLL',
  },
  {
    id: 'tx-real-4',
    no: 4,
    tanggal: '2026-07-30',
    tipe: 'Pendapatan Proyek',
    divisi: 'Social Media Management',
    deskripsi: 'Paket Sosial Media IPL & KSI',
    kodeAkun: '4.1.4',
    namaAkun: 'Pendapatan Social Media Management',
    jumlah: 3000000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    sumberIntegrasi: 'MANUAL',
  },
  {
    id: 'tx-real-5',
    no: 5,
    tanggal: '2026-07-30',
    tipe: 'Beban',
    divisi: 'Social Media Management',
    deskripsi: 'Fee Konten Single Post - Inovasi Pangan Lestari (Adissa Rifdah Aulia)',
    kodeAkun: '5.1.1',
    namaAkun: 'Beban Fee Freelancer/Tim (Cost of Services)',
    jumlah: 10000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    sumberIntegrasi: 'PROJECT_CONTROL_FEE',
  },
  {
    id: 'tx-real-6',
    no: 6,
    tanggal: '2026-07-30',
    tipe: 'Beban',
    divisi: 'Social Media Management',
    deskripsi: 'Fee Konten Reels / TikTok - Keripik Sayur (Aldrien Andriansyah )',
    kodeAkun: '5.1.1',
    namaAkun: 'Beban Fee Freelancer/Tim (Cost of Services)',
    jumlah: 12500,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    sumberIntegrasi: 'PROJECT_CONTROL_FEE',
  },
  {
    id: 'tx-real-7',
    no: 7,
    tanggal: '2026-07-01',
    tipe: 'Beban',
    divisi: 'Umum/Tidak Spesifik',
    deskripsi: 'Payroll STF-1785303827045 (periode s/d 31 Jul)',
    kodeAkun: '5.2.1',
    namaAkun: 'Beban Gaji Staff',
    jumlah: 1000000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    referensiId: 'STF-1785303827045',
    sumberIntegrasi: 'PAYROLL',
  },
  {
    id: 'tx-real-8',
    no: 8,
    tanggal: '2026-06-24',
    tipe: 'Pendapatan Proyek',
    divisi: 'Umum/Tidak Spesifik',
    deskripsi: 'Invoice 703/INV/BKR/OC/VI/2026 - PT. BATU KARANG',
    kodeAkun: '4.2.1',
    namaAkun: 'Pendapatan Lain-lain',
    jumlah: 2000000,
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
    referensiId: 'CRM-INV-703',
    sumberIntegrasi: 'CRM_INVOICE',
  },
];

const SEED_IMPORT_LOG: ImportLogEntry[] = [
  {
    id: 'log-1',
    sumber: 'CRM_INVOICE',
    idReferensi: 'CRM-INV-089',
    waktuImport: '2026-09-02T10:15:00.000Z',
    statusSaatImport: 'Lunas',
    jumlah: 18500000,
  },
  {
    id: 'log-2',
    sumber: 'CRM_INVOICE',
    idReferensi: 'CRM-INV-090',
    waktuImport: '2026-09-04T11:20:00.000Z',
    statusSaatImport: 'Belum Dibayar',
    jumlah: 12000000,
  },
  {
    id: 'log-3',
    sumber: 'PROJECT_CONTROL_FEE',
    idReferensi: 'PC-CNT-4401',
    waktuImport: '2026-09-08T14:45:00.000Z',
    statusSaatImport: 'Approved / RtP',
    jumlah: 1750000,
  },
  {
    id: 'log-4',
    sumber: 'PAYROLL',
    idReferensi: 'PAY-2026-09',
    waktuImport: '2026-09-28T16:00:00.000Z',
    statusSaatImport: 'Lunas',
    jumlah: 16500000,
  },
];

export class StorageService {
  // Get all journal entries
  static getJurnalEntries(): JurnalEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.JURNAL);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(SEED_JURNAL_ENTRIES));
        return SEED_JURNAL_ENTRIES;
      }
      const parsed: JurnalEntry[] = JSON.parse(raw);
      // Auto-upgrade if old demo dummy entries are detected
      if (parsed.some((e) => e.id === 'tx-101' || e.id === 'tx-102')) {
        localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(SEED_JURNAL_ENTRIES));
        return SEED_JURNAL_ENTRIES;
      }
      return parsed;
    } catch {
      return SEED_JURNAL_ENTRIES;
    }
  }

  // Save entries
  static saveJurnalEntries(entries: JurnalEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(entries));
  }

  // Add a single new entry
  static addJurnalEntry(entry: Omit<JurnalEntry, 'id' | 'no'>): JurnalEntry {
    const entries = this.getJurnalEntries();
    const maxNo = entries.reduce((max, e) => Math.max(max, e.no || 0), 0);
    const newEntry: JurnalEntry = {
      ...entry,
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      no: maxNo + 1,
    };
    entries.unshift(newEntry);
    this.saveJurnalEntries(entries);
    return newEntry;
  }

  // Delete an entry
  static deleteJurnalEntry(id: string): void {
    const entries = this.getJurnalEntries().filter((e) => e.id !== id);
    this.saveJurnalEntries(entries);
  }

  // Get import log
  static getImportLog(): ImportLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.IMPORT_LOG);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.IMPORT_LOG, JSON.stringify(SEED_IMPORT_LOG));
        return SEED_IMPORT_LOG;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_IMPORT_LOG;
    }
  }

  static addImportLog(log: Omit<ImportLogEntry, 'id' | 'waktuImport'>): void {
    const logs = this.getImportLog();
    const newLog: ImportLogEntry = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      waktuImport: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.IMPORT_LOG, JSON.stringify(logs));
  }

  // GAS Endpoint URL
  static getGasEndpoint(): string {
    return localStorage.getItem(STORAGE_KEYS.GAS_ENDPOINT) || DEFAULT_GAS_ENDPOINT;
  }

  static setGasEndpoint(url: string): void {
    localStorage.setItem(STORAGE_KEYS.GAS_ENDPOINT, url);
  }

  // Saldo Awal
  static getSaldoAwal(): Record<string, number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SALDO_AWAL);
      if (!raw) return INITIAL_SALDO_AWAL;
      return JSON.parse(raw);
    } catch {
      return INITIAL_SALDO_AWAL;
    }
  }

  static setSaldoAwal(saldo: Record<string, number>): void {
    localStorage.setItem(STORAGE_KEYS.SALDO_AWAL, JSON.stringify(saldo));
  }

  // Reset to initial seed
  static resetToSeedData(): void {
    localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(SEED_JURNAL_ENTRIES));
    localStorage.setItem(STORAGE_KEYS.IMPORT_LOG, JSON.stringify(SEED_IMPORT_LOG));
    localStorage.setItem(STORAGE_KEYS.SALDO_AWAL, JSON.stringify(INITIAL_SALDO_AWAL));
  }

  // ====== FINANCIAL ENGINE (Exact Accrual & Balance Logic) ======

  // Generate Laba Rugi (Income Statement)
  static generateLabaRugi(startDateStr: string, endDateStr: string): LabaRugiReport {
    const entries = this.getJurnalEntries();
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T23:59:59.999');

    const filtered = entries.filter((e) => {
      const d = new Date(e.tanggal + 'T00:00:00');
      return d >= start && d <= end;
    });

    const pendapatanByAkun: Record<string, number> = {};
    const bebanByAkun: Record<string, number> = {};

    filtered.forEach((r) => {
      const akun = CHART_OF_ACCOUNTS.find((a) => a.kode === r.kodeAkun);
      const kategori = akun ? akun.kategori : null;

      if (kategori === 'PENDAPATAN' && r.tipe === 'Pendapatan Proyek') {
        pendapatanByAkun[r.kodeAkun] = (pendapatanByAkun[r.kodeAkun] || 0) + Number(r.jumlah);
      } else if (kategori === 'BEBAN' && r.tipe === 'Beban') {
        // Accrual basis: recognized in full regardless of statusBayar
        bebanByAkun[r.kodeAkun] = (bebanByAkun[r.kodeAkun] || 0) + Number(r.jumlah);
      }
      // "Pembayaran Hutang" & "Pelunasan Piutang" intentionally NOT included in P&L
    });

    const pendapatan = Object.keys(pendapatanByAkun)
      .sort()
      .map((kode) => {
        const akun = CHART_OF_ACCOUNTS.find((a) => a.kode === kode);
        return { kode, nama: akun ? akun.nama : '', jumlah: pendapatanByAkun[kode] };
      });

    const beban = Object.keys(bebanByAkun)
      .sort()
      .map((kode) => {
        const akun = CHART_OF_ACCOUNTS.find((a) => a.kode === kode);
        return { kode, nama: akun ? akun.nama : '', jumlah: bebanByAkun[kode] };
      });

    const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.jumlah, 0);
    const totalBeban = beban.reduce((sum, item) => sum + item.jumlah, 0);
    const labaRugi = totalPendapatan - totalBeban;
    const marginPersen = totalPendapatan > 0 ? (labaRugi / totalPendapatan) * 100 : 0;

    return {
      periodeAwal: startDateStr,
      periodeAkhir: endDateStr,
      pendapatan,
      totalPendapatan,
      beban,
      totalBeban,
      labaRugi,
      marginPersen,
    };
  }

  // Generate Neraca (Balance Sheet)
  static generateNeraca(asOfDateStr: string): NeracaReport {
    const entries = this.getJurnalEntries();
    const asOfDate = new Date(asOfDateStr + 'T23:59:59.999');

    const filtered = entries.filter((e) => {
      const d = new Date(e.tanggal + 'T00:00:00');
      return d <= asOfDate;
    });

    const saldoAwal = this.getSaldoAwal();
    const saldo: Record<string, number> = {};
    CHART_OF_ACCOUNTS.forEach((a) => {
      saldo[a.kode] = Number(saldoAwal[a.kode] || 0);
    });

    let labaBerjalan = 0;

    filtered.forEach((r) => {
      const akun = CHART_OF_ACCOUNTS.find((a) => a.kode === r.kodeAkun);
      const kategori = akun ? akun.kategori : null;
      const isBelumLunas = r.statusBayar.startsWith('Belum Lunas');

      if (r.tipe === 'Pendapatan Proyek' && kategori === 'PENDAPATAN') {
        labaBerjalan += Number(r.jumlah);
        if (isBelumLunas) {
          saldo['1.1.2'] = (saldo['1.1.2'] || 0) + Number(r.jumlah); // Piutang Usaha
        } else {
          saldo['1.1.1'] = (saldo['1.1.1'] || 0) + Number(r.jumlah); // Kas & Bank bertambah
        }
      } else if (r.tipe === 'Beban' && kategori === 'BEBAN') {
        labaBerjalan -= Number(r.jumlah);
        const hutangKode = BEBAN_TO_HUTANG_MAP[r.kodeAkun];
        if (hutangKode && isBelumLunas) {
          saldo[hutangKode] = (saldo[hutangKode] || 0) + Number(r.jumlah); // Hutang bertambah
        } else {
          saldo['1.1.1'] = (saldo['1.1.1'] || 0) - Number(r.jumlah); // Kas langsung berkurang
        }
      } else if (r.tipe === 'Pembayaran Hutang' && kategori === 'HUTANG') {
        saldo[r.kodeAkun] = (saldo[r.kodeAkun] || 0) - Number(r.jumlah);
        saldo['1.1.1'] = (saldo['1.1.1'] || 0) - Number(r.jumlah);
      } else if (r.tipe === 'Pelunasan Piutang') {
        saldo['1.1.2'] = (saldo['1.1.2'] || 0) - Number(r.jumlah); // Piutang berkurang
        saldo['1.1.1'] = (saldo['1.1.1'] || 0) + Number(r.jumlah); // Kas bertambah
        // Tidak mempengaruhi labaBerjalan karena pendapatan sudah diakui di awal
      }
    });

    // Laba Ditahan bertambah/berkurang dengan laba berjalan
    saldo['3.2.1'] = (saldo['3.2.1'] || 0) + labaBerjalan;

    // Aktiva list
    let totalAktiva = 0;
    const aktiva = CHART_OF_ACCOUNTS.filter((a) => a.kategori === 'AKTIVA').map((a) => {
      const val = saldo[a.kode] || 0;
      if (a.kode === '1.2.2') {
        // Akumulasi penyusutan adalah contra-asset
        totalAktiva -= val;
      } else {
        totalAktiva += val;
      }
      return { kode: a.kode, nama: a.nama, jumlah: val };
    });

    // Hutang list
    let totalHutang = 0;
    const hutang = CHART_OF_ACCOUNTS.filter((a) => a.kategori === 'HUTANG').map((a) => {
      const val = saldo[a.kode] || 0;
      totalHutang += val;
      return { kode: a.kode, nama: a.nama, jumlah: val };
    });

    // Modal list
    let totalModal = 0;
    const modal = CHART_OF_ACCOUNTS.filter((a) => a.kategori === 'MODAL').map((a) => {
      const val = saldo[a.kode] || 0;
      totalModal += val;
      return { kode: a.kode, nama: a.nama, jumlah: val };
    });

    const totalHutangModal = totalHutang + totalModal;
    const selisih = totalAktiva - totalHutangModal;

    return {
      tanggal: asOfDateStr,
      aktiva,
      totalAktiva,
      hutang,
      totalHutang,
      modal,
      totalModal,
      totalHutangModal,
      selisih,
      isBalanced: Math.abs(selisih) < 1,
    };
  }

  // Dashboard summary metrics
  static getDashboardSummary(): FinancialDashboardSummary {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    const todayStr = now.toISOString().slice(0, 10);

    const labaRugi = this.generateLabaRugi(startOfMonth, endOfMonth);
    const neraca = this.generateNeraca(todayStr);

    const kas = neraca.aktiva.find((a) => a.kode === '1.1.1')?.jumlah || 0;
    const piutang = neraca.aktiva.find((a) => a.kode === '1.1.2')?.jumlah || 0;

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    return {
      bulanIni: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      totalPendapatan: labaRugi.totalPendapatan,
      totalBeban: labaRugi.totalBeban,
      labaRugi: labaRugi.labaRugi,
      totalKas: kas,
      totalPiutang: piutang,
      totalHutang: neraca.totalHutang,
      totalModal: neraca.totalModal,
    };
  }
}
