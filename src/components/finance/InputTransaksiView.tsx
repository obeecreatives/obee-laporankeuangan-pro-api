import React, { useState } from 'react';
import {
  PlusCircle,
  HelpCircle,
  CheckCircle,
  Info,
  DollarSign,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import {
  CHART_OF_ACCOUNTS,
  DIVISI_LIST,
  TIPE_TRANSAKSI,
  STATUS_BAYAR,
} from '../../data/constants';
import { StorageService } from '../../services/storageService';
import { DivisionType, TransactionType, PaymentStatus } from '../../types/finance';

interface InputTransaksiViewProps {
  onSuccess: (message: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const InputTransaksiView: React.FC<InputTransaksiViewProps> = ({
  onSuccess,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    tanggal: todayStr,
    tipe: 'Pendapatan Proyek' as TransactionType,
    divisi: 'Social Media Management' as DivisionType,
    deskripsi: '',
    kodeAkun: '4.1.4',
    jumlah: '',
    statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)' as PaymentStatus,
    tanggalBayar: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic filter for accounts based on transaction type
  const getRelevantAccounts = () => {
    switch (form.tipe) {
      case 'Pendapatan Proyek':
        return CHART_OF_ACCOUNTS.filter((a) => a.kategori === 'PENDAPATAN');
      case 'Beban':
        return CHART_OF_ACCOUNTS.filter((a) => a.kategori === 'BEBAN');
      case 'Pembayaran Hutang':
        return CHART_OF_ACCOUNTS.filter((a) => a.kategori === 'HUTANG');
      case 'Pelunasan Piutang':
        return CHART_OF_ACCOUNTS.filter((a) => a.kode === '1.1.2');
      default:
        return CHART_OF_ACCOUNTS;
    }
  };

  const handleTipeChange = (newTipe: TransactionType) => {
    let defaultKode = '4.1.4';
    if (newTipe === 'Beban') defaultKode = '5.1.1';
    else if (newTipe === 'Pembayaran Hutang') defaultKode = '2.1.1';
    else if (newTipe === 'Pelunasan Piutang') defaultKode = '1.1.2';

    setForm({
      ...form,
      tipe: newTipe,
      kodeAkun: defaultKode,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const nominal = Number(form.jumlah.replace(/[^0-9]/g, ''));

    if (!nominal || nominal <= 0) {
      setFormError('Mohon masukkan jumlah nominal yang valid (lebih dari 0).');
      return;
    }

    if (!form.deskripsi.trim()) {
      setFormError('Mohon isi deskripsi / nama klien / proyek.');
      return;
    }

    setIsSubmitting(true);

    const akun = CHART_OF_ACCOUNTS.find((a) => a.kode === form.kodeAkun);
    const namaAkun = akun ? akun.nama : form.kodeAkun;

    // Save to local storage engine
    StorageService.addJurnalEntry({
      tanggal: form.tanggal,
      tipe: form.tipe,
      divisi: form.divisi,
      deskripsi: form.deskripsi.trim(),
      kodeAkun: form.kodeAkun,
      namaAkun: namaAkun,
      jumlah: nominal,
      statusBayar: form.statusBayar,
      tanggalBayar: form.tanggalBayar || undefined,
      sumberIntegrasi: 'MANUAL',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(`Transaksi "${form.deskripsi}" senilai Rp ${nominal.toLocaleString('id-ID')} berhasil dicatat.`);
      // Reset form
      setForm({
        tanggal: todayStr,
        tipe: 'Pendapatan Proyek',
        divisi: 'Social Media Management',
        deskripsi: '',
        kodeAkun: '4.1.4',
        jumlah: '',
        statusBayar: 'Lunas (Kas Langsung Keluar/Masuk)',
        tanggalBayar: '',
      });
    }, 250);
  };

  const formatNumberInput = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return Number(raw).toLocaleString('id-ID');
  };

  const nominalNumeric = Number(form.jumlah.replace(/[^0-9]/g, '')) || 0;
  const isBelumLunas = form.statusBayar.startsWith('Belum Lunas');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#E30000]" />
            <span>Input Transaksi Jurnal Baru</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Pencatatan akuntansi akrual untuk Pendapatan, Beban, Pembayaran Hutang, atau Pelunasan Piutang.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('riwayat')}
          className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#E30000] underline"
        >
          Lihat Riwayat Jurnal →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] shadow-sm space-y-6"
        >
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold">
              {formError}
            </div>
          )}

          {/* Row 1: Tanggal & Tipe Transaksi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#DC2626]" />
                <span>Tanggal Transaksi</span>
              </label>
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-[#DC2626] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Tipe Transaksi</span>
              </label>
              <select
                value={form.tipe}
                onChange={(e) => handleTipeChange(e.target.value as TransactionType)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm sm:text-base font-semibold focus:ring-2 focus:ring-[#DC2626] outline-none"
              >
                {TIPE_TRANSAKSI.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Divisi & Kode Akun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Divisi Terkait
              </label>
              <select
                value={form.divisi}
                onChange={(e) => setForm({ ...form, divisi: e.target.value as DivisionType })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-[#DC2626] outline-none"
              >
                {DIVISI_LIST.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Kode & Nama Akun (COA)
              </label>
              <select
                value={form.kodeAkun}
                onChange={(e) => setForm({ ...form, kodeAkun: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm sm:text-base font-mono font-semibold focus:ring-2 focus:ring-[#DC2626] outline-none"
              >
                {getRelevantAccounts().map((a) => (
                  <option key={a.kode} value={a.kode}>
                    {a.kode} - {a.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Deskripsi / Client / Proyek */}
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Deskripsi / Client / Proyek</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Paket Video Komersial Brand Kopi - PT Sentosa Abadi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-[#DC2626] outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Row 4: Jumlah Nominal & Status Bayar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#DC2626]" />
                <span>Jumlah Nominal (Rp)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400 font-mono">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={form.jumlah}
                  onChange={(e) => setForm({ ...form, jumlah: formatNumberInput(e.target.value) })}
                  className="w-full pl-14 pr-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-[#DC2626] dark:text-[#EF4444] text-xl sm:text-2xl font-black font-mono focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626] outline-none tracking-tight"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Status Pembayaran
              </label>
              <select
                value={form.statusBayar}
                onChange={(e) => setForm({ ...form, statusBayar: e.target.value as PaymentStatus })}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm sm:text-base font-semibold focus:ring-2 focus:ring-[#DC2626] outline-none"
              >
                {STATUS_BAYAR.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Bayar jika Belum Lunas */}
          {isBelumLunas && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
              <label className="block text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                Perkiraan Tanggal Pelunasan / Jatuh Tempo (Opsional)
              </label>
              <input
                type="date"
                value={form.tanggalBayar}
                onChange={(e) => setForm({ ...form, tanggalBayar: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white text-sm font-medium outline-none"
              />
            </div>
          )}

          {/* Action Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-[#DC2626] hover:bg-[#B80000] text-white font-extrabold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'Menyimpan ke Jurnal...' : 'Simpan Transaksi ke Jurnal'}</span>
            </button>
          </div>
        </form>

        {/* Live Accounting Impact Inspector */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
              <Info className="w-4 h-4 text-[#E30000]" />
              <span>Simulasi Pengaruh Akuntansi</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#161B26] border border-gray-100 dark:border-gray-800 text-xs space-y-2">
              <div className="text-[11px] font-bold uppercase text-gray-400">
                Prinsip Akrual Otomatis:
              </div>

              {form.tipe === 'Pendapatan Proyek' && (
                <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-emerald-600 font-bold">•</span>
                    <span>
                      <strong>Laba Rugi:</strong> Pendapatan diakui penuh senilai{' '}
                      <strong className="text-gray-900 dark:text-white">
                        Rp {nominalNumeric.toLocaleString('id-ID')}
                      </strong>{' '}
                      (Kredit).
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Neraca:</strong>{' '}
                      {isBelumLunas ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          Masuk sebagai Piutang Usaha (1.1.2) karena belum lunas.
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Kas & Bank (1.1.1) langsung bertambah.
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {form.tipe === 'Beban' && (
                <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-red-600 font-bold">•</span>
                    <span>
                      <strong>Laba Rugi:</strong> Beban diakui sebesar{' '}
                      <strong className="text-gray-900 dark:text-white">
                        Rp {nominalNumeric.toLocaleString('id-ID')}
                      </strong>{' '}
                      (Debit).
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-purple-600 font-bold">•</span>
                    <span>
                      <strong>Neraca:</strong>{' '}
                      {isBelumLunas ? (
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          Menjadi Hutang Jasa/Gaji (2.1.x) di Neraca.
                        </span>
                      ) : (
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                          Kas & Bank (1.1.1) langsung berkurang.
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {form.tipe === 'Pelunasan Piutang' && (
                <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Laba Rugi:</strong> Tidak terpengaruh (Pendapatan sudah diakui saat invoice dibuat).
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-emerald-600 font-bold">•</span>
                    <span>
                      <strong>Neraca:</strong> Piutang Usaha (1.1.2) berkurang Rp{' '}
                      {nominalNumeric.toLocaleString('id-ID')}, Kas & Bank (1.1.1) bertambah.
                    </span>
                  </div>
                </div>
              )}

              {form.tipe === 'Pembayaran Hutang' && (
                <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Laba Rugi:</strong> Tidak terpengaruh (Beban sudah diakui saat timbul kewajiban).
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-red-600 font-bold">•</span>
                    <span>
                      <strong>Neraca:</strong> Hutang berkurang, Kas & Bank (1.1.1) berkurang.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111622] border border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-700 dark:text-gray-300">
                Penting untuk Sinkronisasi Sheet
              </div>
              <p className="mt-1">
                Setiap entri yang disimpan di web app ini akan langsung tercermin di Dashboard, Laba Rugi, dan Neraca secara lokal (0.01s), dan dapat disinkronkan ke Google Spreadsheet via panel Headless GAS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
