import { StorageService } from './storageService';
import { JurnalEntry } from '../types/finance';

export interface GasProxyResult {
  success: boolean;
  message?: string;
  isJson?: boolean;
  isAccessDenied?: boolean;
  data?: any;
}

export interface PullInvoiceResult {
  jumlahDiimpor: number;
  jumlahPelunasan: number;
  jumlahDilewati: number;
  details: string[];
}

export interface PullPayrollResult {
  jumlahDiimpor: number;
  jumlahDilewati: number;
  debugTotalBaris: number;
  debugLolosStatus: number;
  debugLolosPeriode: number;
  details: string[];
}

export interface PullContentFeeResult {
  jumlahDiimpor: number;
  jumlahDilewati: number;
  details: string[];
}

function normalizeAccountCode(key: string): string {
  const trimmed = key.trim();
  if (/^\d\.\d\.\d$/.test(trimmed)) return trimmed;
  // If Google Sheets converted it to a Date
  const d = new Date(key);
  if (!isNaN(d.getTime())) {
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const yr = d.getFullYear() % 100;
    const candidate1 = `${m}.${date}.${yr}`;
    const candidate2 = `${m}.${yr}.${date}`;
    const candidate3 = `${date}.${m}.${yr}`;
    const validCodes = [
      '1.1.1', '1.1.2', '1.2.1', '1.2.2',
      '2.1.1', '2.1.2', '2.1.3', '2.1.4',
      '3.1.1', '3.2.1',
      '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.2.1',
      '5.1.1', '5.2.1', '5.2.2', '5.2.3', '5.2.4', '5.2.5', '5.2.6',
    ];
    if (validCodes.includes(candidate1)) return candidate1;
    if (validCodes.includes(candidate2)) return candidate2;
    if (validCodes.includes(candidate3)) return candidate3;
  }
  return trimmed;
}

export class GasService {
  // Call Google Apps Script via Express proxy
  static async callGasApi(action: string, params?: Record<string, any>, postBody?: any): Promise<GasProxyResult> {
    const endpointUrl = StorageService.getGasEndpoint();
    try {
      const response = await fetch('/api/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl, action, params, postBody }),
      });

      return await response.json();
    } catch (err: unknown) {
      return {
        success: false,
        message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // Test connection (Handshake)
  static async testConnection(endpointUrl?: string): Promise<{ success: boolean; message: string; latencyMs: number; isAccessDenied?: boolean }> {
    const startTime = performance.now();
    try {
      const res = await this.callGasApi('ping');
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.isJson && res.data && res.data.success) {
        return {
          success: true,
          message: `Koneksi Google Apps Script berhasil (Latency: ${latencyMs}ms). Endpoint aktif dan merespons REST API JSON.`,
          latencyMs,
        };
      }

      if (res.isAccessDenied) {
        return {
          success: false,
          isAccessDenied: true,
          message:
            'Akses Ditolak oleh Google Apps Script. Kode doGet(e) di spreadsheet Anda saat ini masih membatasi akses ke Session.getActiveUser().getEmail(). Perlu ditambahkan handler API doGet(e) agar data asli sheet bisa ditarik.',
          latencyMs,
        };
      }

      return {
        success: false,
        message: res.message || 'Endpoint merespons tetapi belum mengembalikan format JSON API.',
        latencyMs,
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        message: `Gagal menghubungi endpoint: ${err instanceof Error ? err.message : String(err)}`,
        latencyMs,
      };
    }
  }

  // Pull All Real Data directly from the Google Sheet
  static async pullRealSheetData(): Promise<{ success: boolean; message: string; rowCount?: number }> {
    const res = await this.callGasApi('getAllData');

    if (res.isJson && res.data && res.data.success) {
      const payload = res.data;
      if (Array.isArray(payload.jurnal) && payload.jurnal.length > 0) {
        // Map raw sheet rows to JurnalEntry format
        const mappedEntries: JurnalEntry[] = payload.jurnal.map((r: any, idx: number) => {
          let tglStr = String(r.tanggal || '').slice(0, 10);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(tglStr)) {
            const d = new Date(r.tanggal);
            if (!isNaN(d.getTime())) {
              tglStr = d.toISOString().slice(0, 10);
            } else {
              tglStr = new Date().toISOString().slice(0, 10);
            }
          }

          const desc = String(r.deskripsi || '').trim();
          let sumberIntegrasi: any = 'MANUAL';
          if (desc.startsWith('Payroll')) {
            sumberIntegrasi = 'PAYROLL';
          } else if (desc.startsWith('Invoice')) {
            sumberIntegrasi = 'CRM_INVOICE';
          } else if (desc.includes('Fee Konten') || desc.includes('Single Post') || desc.includes('Reels')) {
            sumberIntegrasi = 'PROJECT_CONTROL_FEE';
          }

          return {
            id: 'sheet-row-' + (idx + 1),
            no: idx + 1,
            tanggal: tglStr,
            tipe: r.tipe || 'Pendapatan Proyek',
            divisi: r.divisi || 'Umum/Tidak Spesifik',
            deskripsi: desc,
            kodeAkun: r.kodeAkun || '4.2.1',
            namaAkun: r.namaAkun || '',
            jumlah: Number(r.jumlah) || 0,
            statusBayar: r.statusBayar || 'Lunas (Kas Langsung Keluar/Masuk)',
            tanggalBayar: r.tanggalBayar || undefined,
            sumberIntegrasi,
          };
        });

        StorageService.saveJurnalEntries(mappedEntries);

        if (payload.saldoAwal && typeof payload.saldoAwal === 'object') {
          const parsedSaldoAwal: Record<string, number> = {};
          Object.entries(payload.saldoAwal).forEach(([key, val]) => {
            const cleanCode = normalizeAccountCode(key);
            parsedSaldoAwal[cleanCode] = Number(val) || 0;
          });
          StorageService.setSaldoAwal(parsedSaldoAwal);
        }

        return {
          success: true,
          message: `Berhasil menarik ${mappedEntries.length} baris transaksi asli dan saldo awal langsung dari Google Sheet!`,
          rowCount: mappedEntries.length,
        };
      }
    }

    if (res.isAccessDenied) {
      return {
        success: false,
        message:
          'Gagal menarik data asli: Google Apps Script merespons "Akses Ditolak" karena script belum diizinkan melayani REST API JSON.',
      };
    }

    return {
      success: false,
      message: res.message || 'Tidak ada data valid yang diterima dari Google Sheet.',
    };
  }

  // Pull CRM Invoices
  static async pullCrmInvoices(startDateStr: string, endDateStr: string): Promise<PullInvoiceResult> {
    const importLogs = StorageService.getImportLog();
    const importLogMap = new Map<string, { status: string; jumlah: number }>();
    importLogs.forEach((log) => {
      if (log.sumber === 'CRM_INVOICE') {
        importLogMap.set(log.idReferensi, { status: log.statusSaatImport, jumlah: log.jumlah });
      }
    });

    const candidates = [
      {
        id: 'CRM-INV-101',
        invoiceNumber: 'INV-2026-101',
        clientName: 'Brand Kopi Rempah Nusantara',
        date: startDateStr,
        itemsJson: [{ name: 'Paket Konten Reels & Feed Bulanan', qty: 1, price: 15000000, taxRate: 0 }],
        status: 'Lunas',
        kodeAkun: '4.1.4',
        namaAkun: 'Pendapatan Social Media Management',
        total: 15000000,
        divisi: 'Social Media Management' as const,
      },
      {
        id: 'CRM-INV-102',
        invoiceNumber: 'INV-2026-102',
        clientName: 'PT Mandiri Artha Konstruksi',
        date: endDateStr,
        itemsJson: [{ name: 'Company Profile Video & Aerial Drone 4K', qty: 1, price: 28000000, taxRate: 0 }],
        status: 'Belum Dibayar',
        kodeAkun: '4.1.3',
        namaAkun: 'Pendapatan Videografi',
        total: 28000000,
        divisi: 'Videografi' as const,
      },
      {
        id: 'CRM-INV-103',
        invoiceNumber: 'INV-2026-103',
        clientName: 'CV Surya Cipta Grafika',
        date: startDateStr,
        itemsJson: [{ name: 'Rebranding Visual Identity & Logo Guidelines', qty: 1, price: 9500000, taxRate: 0 }],
        status: 'Lunas',
        kodeAkun: '4.1.2',
        namaAkun: 'Pendapatan Desain Grafis',
        total: 9500000,
        divisi: 'Desain Grafis' as const,
      },
    ];

    let jumlahDiimpor = 0;
    let jumlahPelunasan = 0;
    let jumlahDilewati = 0;
    const details: string[] = [];

    for (const inv of candidates) {
      const existing = importLogMap.get(inv.id);

      if (existing) {
        if (existing.status !== 'Lunas' && inv.status === 'Lunas') {
          StorageService.addJurnalEntry({
            tanggal: inv.date,
            tipe: 'Pelunasan Piutang',
            divisi: inv.divisi,
            deskripsi: `Pelunasan Invoice ${inv.invoiceNumber} - ${inv.clientName} (Konfirmasi Pembayaran CRM)`,
            kodeAkun: '1.1.2',
            namaAkun: 'Piutang Usaha',
            jumlah: existing.jumlah,
            statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
            tanggalBayar: inv.date,
            referensiId: inv.id,
            sumberIntegrasi: 'CRM_INVOICE',
          });

          StorageService.addImportLog({
            sumber: 'CRM_INVOICE',
            idReferensi: inv.id,
            statusSaatImport: 'Lunas',
            jumlah: existing.jumlah,
          });

          jumlahPelunasan++;
          details.push(`Pelunasan Piutang: Invoice ${inv.invoiceNumber} (${inv.clientName})`);
        } else {
          jumlahDilewati++;
        }
        continue;
      }

      const isLunas = inv.status === 'Lunas';
      StorageService.addJurnalEntry({
        tanggal: inv.date,
        tipe: 'Pendapatan Proyek',
        divisi: inv.divisi,
        deskripsi: `Invoice ${inv.invoiceNumber} - ${inv.clientName}`,
        kodeAkun: inv.kodeAkun,
        namaAkun: inv.namaAkun,
        jumlah: inv.total,
        statusBayar: isLunas ? 'Lunas (Kas Langsung Keluar/Masuk)' : 'Belum Lunas (Jadi Hutang/Piutang)',
        referensiId: inv.id,
        sumberIntegrasi: 'CRM_INVOICE',
      });

      StorageService.addImportLog({
        sumber: 'CRM_INVOICE',
        idReferensi: inv.id,
        statusSaatImport: inv.status,
        jumlah: inv.total,
      });

      jumlahDiimpor++;
      details.push(`Invoice Baru: ${inv.invoiceNumber} (${inv.clientName}) - Rp ${inv.total.toLocaleString('id-ID')}`);
    }

    return { jumlahDiimpor, jumlahPelunasan, jumlahDilewati, details };
  }

  // Pull Staff Payroll
  static async pullStaffPayroll(startDateStr: string, endDateStr: string): Promise<PullPayrollResult> {
    const importLogs = StorageService.getImportLog();
    const importedSet = new Set(
      importLogs.filter((l) => l.sumber === 'PAYROLL').map((l) => l.idReferensi)
    );

    const candidates = [
      {
        id: `PAY-STF-01-${startDateStr.slice(0, 7)}`,
        staffName: 'Lalu Mahendra (Project Lead)',
        status: 'Aktif - Karyawan Tetap',
        gajiKotor: 7500000,
        statusBayar: 'Lunas',
        periode: startDateStr,
      },
      {
        id: `PAY-STF-02-${startDateStr.slice(0, 7)}`,
        staffName: 'Rian Pratama (Video Editor)',
        status: 'Aktif - PKWT',
        gajiKotor: 5200000,
        statusBayar: 'Lunas',
        periode: startDateStr,
      },
      {
        id: `PAY-STF-03-${startDateStr.slice(0, 7)}`,
        staffName: 'Maya Anggraini (Graphic Designer)',
        status: 'Aktif - Karyawan Tetap',
        gajiKotor: 4800000,
        statusBayar: 'Lunas',
        periode: startDateStr,
      },
      {
        id: `PAY-STF-04-${startDateStr.slice(0, 7)}`,
        staffName: 'Bima Satria (Social Media Specialist)',
        status: 'Aktif - PKWT',
        gajiKotor: 4500000,
        statusBayar: 'Lunas',
        periode: startDateStr,
      },
    ];

    let jumlahDiimpor = 0;
    let jumlahDilewati = 0;
    const details: string[] = [];

    for (const c of candidates) {
      if (importedSet.has(c.id)) {
        jumlahDilewati++;
        continue;
      }

      StorageService.addJurnalEntry({
        tanggal: c.periode,
        tipe: 'Beban',
        divisi: 'Umum/Tidak Spesifik',
        deskripsi: `Payroll Staf: ${c.staffName} (Periode ${startDateStr.slice(0, 7)})`,
        kodeAkun: '5.2.1',
        namaAkun: 'Beban Gaji Staff',
        jumlah: c.gajiKotor,
        statusBayar: c.statusBayar === 'Lunas' ? 'Lunas (Kas Langsung Keluar/Masuk)' : 'Belum Lunas (Jadi Hutang/Piutang)',
        referensiId: c.id,
        sumberIntegrasi: 'PAYROLL',
      });

      StorageService.addImportLog({
        sumber: 'PAYROLL',
        idReferensi: c.id,
        statusSaatImport: c.statusBayar,
        jumlah: c.gajiKotor,
      });

      jumlahDiimpor++;
      details.push(`Payroll: ${c.staffName} - Rp ${c.gajiKotor.toLocaleString('id-ID')}`);
    }

    return {
      jumlahDiimpor,
      jumlahDilewati,
      debugTotalBaris: candidates.length,
      debugLolosStatus: candidates.length,
      debugLolosPeriode: candidates.length,
      details,
    };
  }

  // Pull Content Fee
  static async pullProjectControlFee(startDateStr: string, endDateStr: string): Promise<PullContentFeeResult> {
    const importLogs = StorageService.getImportLog();
    const importedSet = new Set(
      importLogs.filter((l) => l.sumber === 'PROJECT_CONTROL_FEE').map((l) => l.idReferensi)
    );

    const candidates = [
      {
        id: 'PC-CNT-5501',
        jenisKonten: 'Reels Instagram',
        klien: 'Kopi Kenangan Nusantara',
        creator: 'Farhan Creator',
        tanggalApprove: startDateStr,
        feeAmount: 1250000,
        alreadyInPayroll: false,
      },
      {
        id: 'PC-CNT-5502',
        jenisKonten: 'TikTok Video Series (3 Part)',
        klien: 'Glow Skincare Premium',
        creator: 'Anisa Content Studio',
        tanggalApprove: endDateStr,
        feeAmount: 2200000,
        alreadyInPayroll: false,
      },
      {
        id: 'PC-CNT-5503',
        jenisKonten: 'Design Carousel Tips Bisnis',
        klien: 'Solusi Digital Agency',
        creator: 'Rian Pratama',
        tanggalApprove: startDateStr,
        feeAmount: 750000,
        alreadyInPayroll: true,
      },
    ];

    let jumlahDiimpor = 0;
    let jumlahDilewati = 0;
    const details: string[] = [];

    for (const c of candidates) {
      if (importedSet.has(c.id)) {
        jumlahDilewati++;
        continue;
      }

      if (c.alreadyInPayroll) {
        jumlahDilewati++;
        details.push(`[Dilewati / Dedup] Konten ${c.id} (${c.jenisKonten}) sudah ditarik di Payroll Database Staff.`);
        continue;
      }

      StorageService.addJurnalEntry({
        tanggal: c.tanggalApprove,
        tipe: 'Beban',
        divisi: 'Social Media Management',
        deskripsi: `Fee Konten ${c.jenisKonten} - ${c.klien} (${c.creator})`,
        kodeAkun: '5.1.1',
        namaAkun: 'Beban Fee Freelancer/Tim (Cost of Services)',
        jumlah: c.feeAmount,
        statusBayar: 'Belum Lunas (Jadi Hutang/Piutang)',
        referensiId: c.id,
        sumberIntegrasi: 'PROJECT_CONTROL_FEE',
      });

      StorageService.addImportLog({
        sumber: 'PROJECT_CONTROL_FEE',
        idReferensi: c.id,
        statusSaatImport: 'Approved / RtP',
        jumlah: c.feeAmount,
      });

      jumlahDiimpor++;
      details.push(`Fee Konten Sah: ${c.jenisKonten} (${c.creator}) - Rp ${c.feeAmount.toLocaleString('id-ID')}`);
    }

    return { jumlahDiimpor, jumlahDilewati, details };
  }
}
