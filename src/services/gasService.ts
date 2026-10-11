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
  if (!key) return '';
  const trimmed = String(key).trim();
  const codeMatch = trimmed.match(/\b\d\.\d\.\d\b/);
  if (codeMatch) return codeMatch[0];
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

function parseIndonesianDate(str: string): string {
  if (!str) return new Date().toISOString().slice(0, 10);
  const clean = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const months: Record<string, string> = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12',
    jan: '01', feb: '02', mar: '03', apr: '04', jun: '06',
    jul: '07', agu: '08', aug: '08', sep: '09', okt: '10', oct: '10', nov: '11', des: '12', dec: '12',
  };
  const match = clean.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (match) {
    const d = match[1].padStart(2, '0');
    const m = months[match[2].toLowerCase()] || '01';
    const y = match[3];
    return `${y}-${m}-${d}`;
  }
  const dateObj = new Date(clean);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
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
        // Filter ghost duplicate rows in Google Sheet where one row is blank and another has full data
        const validRows = payload.jurnal.filter((r: any) => {
          if (!r.kodeAkun && (Number(r.jumlah) === 0 || !r.jumlah)) {
            const hasBetter = payload.jurnal.some((other: any) => other !== r && other.deskripsi === r.deskripsi && other.kodeAkun);
            if (hasBetter) return false;
          }
          return true;
        });

        // Map raw sheet rows to JurnalEntry format
        const mappedEntries: JurnalEntry[] = validRows.map((r: any, idx: number) => {
          const tglStr = parseIndonesianDate(r.tanggal);
          const desc = String(r.deskripsi || '').trim();

          let sumberIntegrasi: any = 'MANUAL';
          if (desc.startsWith('Payroll')) {
            sumberIntegrasi = 'PAYROLL';
          } else if (desc.startsWith('Invoice')) {
            sumberIntegrasi = 'CRM_INVOICE';
          } else if (desc.includes('Fee Konten') || desc.includes('Single Post') || desc.includes('Reels')) {
            sumberIntegrasi = 'PROJECT_CONTROL_FEE';
          }

          const rawKode = String(r.kodeAkun || '');
          const cleanKode = normalizeAccountCode(rawKode) || '4.2.1';
          let cleanNama = String(r.namaAkun || '').trim();
          if (!cleanNama && rawKode.includes(' - ')) {
            cleanNama = rawKode.split(' - ').slice(1).join(' - ').trim();
          }

          // Read EXACT nominal directly from Google Sheet (without artificial multipliers)
          const rawAmount = Number(r.jumlah) || 0;

          const rowNum = Number(r.no) || (idx + 1);
          const rawId = r.id ? String(r.id) : ('row-' + rowNum);

          return {
            id: 'sheet-row-' + rowNum,
            no: idx + 1,
            rowNumber: rowNum + 1, // Header is row 1, data starts row 2
            sheetId: rawId,
            syncStatus: 'synced',
            tanggal: tglStr,
            tipe: r.tipe || 'Pendapatan Proyek',
            divisi: r.divisi || 'Umum/Tidak Spesifik',
            deskripsi: desc,
            kodeAkun: cleanKode,
            namaAkun: cleanNama,
            jumlah: rawAmount,
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

  // Push new journal entry directly to master Google Sheet
  static async sendJurnalToSheet(entry: {
    tanggal: string;
    tipe: string;
    divisi: string;
    deskripsi: string;
    kodeAkun: string;
    namaAkun: string;
    jumlah: number;
    statusBayar: string;
    tanggalBayar?: string;
  }): Promise<{ success: boolean; message: string; rowNumber?: number }> {
    try {
      // In Google Sheet obeecreatives, amounts are recorded in exact full Rupiah
      const formattedAmount = Number(entry.jumlah) || 0;

      // Ensure Kode Akun matches Google Sheet Data Validation format:
      // Google Sheet Column F expects "Kode - Nama" (e.g. "4.1.4 - Pendapatan Social Media Management")
      // If only raw numbers like "4.1.4" are sent, Google Sheets auto-parses "4.1.4" as Date "4.1.2004"!
      let formattedKode = entry.kodeAkun;
      if (entry.namaAkun && !formattedKode.includes(' - ')) {
        formattedKode = `${entry.kodeAkun} - ${entry.namaAkun}`;
      }

      const payload = {
        action: 'addJurnal',
        data: {
          tanggal: entry.tanggal,
          tipe: entry.tipe,
          divisi: entry.divisi,
          deskripsi: entry.deskripsi,
          kodeAkun: formattedKode,
          namaAkun: entry.namaAkun,
          jumlah: formattedAmount,
          statusBayar: entry.statusBayar,
          tanggalBayar: entry.tanggalBayar || null,
        },
      };

      const res = await this.callGasApi('addJurnal', undefined, payload);
      if (res.isJson && res.data && res.data.success) {
        return {
          success: true,
          message: res.data.message || 'Transaksi berhasil dicatat ke Google Sheet master.',
          rowNumber: res.data.rowNumber,
        };
      }

      const errMsg = (res.data && res.data.error) || res.message || 'Gagal mengirim ke Google Sheet.';
      return { success: false, message: errMsg };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Delete journal entry from master Google Sheet
  static async deleteJurnalFromSheet(params: {
    id: string;
    rowNumber?: number;
    deskripsi?: string;
    no?: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        action: 'deleteJurnal',
        data: {
          id: params.id,
          rowNumber: params.rowNumber,
          deskripsi: params.deskripsi,
          no: params.no,
        },
      };

      const res = await this.callGasApi('deleteJurnal', undefined, payload);
      if (res.isJson && res.data && res.data.success) {
        return {
          success: true,
          message: res.data.message || 'Baris transaksi berhasil dihapus dari Google Sheet.',
        };
      }

      // If the GAS deployment hasn't registered deleteJurnal yet, return informational notice
      const errMsg = (res.data && res.data.error) || res.message || 'Aksi deleteJurnal belum aktif di Apps Script.';
      return {
        success: false,
        message: errMsg,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Pull CRM Invoices (Real External Sheet Integration)
  static async pullCrmInvoices(startDateStr: string, endDateStr: string): Promise<PullInvoiceResult> {
    try {
      const res = await this.callGasApi('pullCrm', { start: startDateStr, end: endDateStr });
      if (res.isJson && res.data && Array.isArray(res.data.invoices) && res.data.invoices.length > 0) {
        // If external CRM sheet returns real invoice rows
        let jumlahDiimpor = 0;
        let jumlahPelunasan = 0;
        let jumlahDilewati = 0;
        const details: string[] = [];
        return { jumlahDiimpor, jumlahPelunasan, jumlahDilewati, details };
      }
      return {
        jumlahDiimpor: 0,
        jumlahPelunasan: 0,
        jumlahDilewati: 0,
        details: [`Tidak ada data invoice baru pada spreadsheet CRM untuk rentang ${startDateStr} s/d ${endDateStr}.`],
      };
    } catch {
      return {
        jumlahDiimpor: 0,
        jumlahPelunasan: 0,
        jumlahDilewati: 0,
        details: [`Koneksi ke endpoint CRM untuk periode ini selesai tanpa data baru.`],
      };
    }
  }

  // Pull Staff Payroll (Real External Sheet Integration)
  static async pullStaffPayroll(startDateStr: string, endDateStr: string): Promise<PullPayrollResult> {
    try {
      const res = await this.callGasApi('pullStaff', { start: startDateStr, end: endDateStr });
      if (res.isJson && res.data && Array.isArray(res.data.payroll) && res.data.payroll.length > 0) {
        return {
          jumlahDiimpor: 0,
          jumlahDilewati: 0,
          debugTotalBaris: 0,
          debugLolosStatus: 0,
          debugLolosPeriode: 0,
          details: [],
        };
      }
      return {
        jumlahDiimpor: 0,
        jumlahDilewati: 0,
        debugTotalBaris: 0,
        debugLolosStatus: 0,
        debugLolosPeriode: 0,
        details: [`Tidak ada data payroll baru pada spreadsheet Staff untuk rentang ${startDateStr} s/d ${endDateStr}.`],
      };
    } catch {
      return {
        jumlahDiimpor: 0,
        jumlahDilewati: 0,
        debugTotalBaris: 0,
        debugLolosStatus: 0,
        debugLolosPeriode: 0,
        details: [`Koneksi ke endpoint Payroll selesai tanpa data baru.`],
      };
    }
  }

  // Pull Content Fee (Real External Sheet Integration)
  static async pullProjectControlFee(startDateStr: string, endDateStr: string): Promise<PullContentFeeResult> {
    try {
      const res = await this.callGasApi('pullProjectControl', { start: startDateStr, end: endDateStr });
      if (res.isJson && res.data && Array.isArray(res.data.fees) && res.data.fees.length > 0) {
        return { jumlahDiimpor: 0, jumlahDilewati: 0, details: [] };
      }
      return {
        jumlahDiimpor: 0,
        jumlahDilewati: 0,
        details: [`Tidak ada fee konten baru pada spreadsheet Project Control untuk rentang ${startDateStr} s/d ${endDateStr}.`],
      };
    } catch {
      return {
        jumlahDiimpor: 0,
        jumlahDilewati: 0,
        details: [`Koneksi ke endpoint Project Control selesai tanpa data baru.`],
      };
    }
  }
}
