import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Users,
  Copy,
  Check,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/finance';
import { INITIAL_USERS } from '../../data/constants';

interface PinModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCurrentUser: (user: UserProfile) => void;
  onSuccess: (message: string) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateCurrentUser,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'changePin' | 'forceReset' | 'switchRole'>('profile');

  // Change PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Force reset state (PM/Admin only)
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_USERS);
  const [selectedStaffId, setSelectedStaffId] = useState(usersList[2].id);
  const [forcedNewPin, setForcedNewPin] = useState('4488');
  const [waCopied, setWaCopied] = useState(false);

  const isRoleAdmin = currentUser.role === 'super_admin' || currentUser.role === 'project_manager';

  // Handle self PIN change
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (oldPin !== currentUser.pin) {
      setPinError('PIN lama yang Anda masukkan salah.');
      return;
    }
    if (newPin.length < 4 || newPin.length > 8) {
      setPinError('PIN baru harus terdiri dari 4 hingga 8 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    const updatedUser = { ...currentUser, pin: newPin };
    onUpdateCurrentUser(updatedUser);
    onSuccess('PIN keamanan akun Anda berhasil diperbarui!');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setActiveTab('profile');
  };

  // Generate random 4 digit PIN
  const handleGenerateRandomPin = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setForcedNewPin(random);
  };

  // Apply forced reset
  const handleApplyForceReset = () => {
    const targetStaff = usersList.find((u) => u.id === selectedStaffId);
    if (!targetStaff) return;

    setUsersList(
      usersList.map((u) => (u.id === selectedStaffId ? { ...u, pin: forcedNewPin } : u))
    );
    onSuccess(`PIN baru (${forcedNewPin}) berhasil diterapkan untuk ${targetStaff.name}.`);
  };

  // Copy WhatsApp format message (PDF guide page 2 Section D)
  const handleCopyWaMessage = () => {
    const targetStaff = usersList.find((u) => u.id === selectedStaffId);
    if (!targetStaff) return;

    const message = `Halo ${targetStaff.name},\n\nPIN keamanan akun Workspace Obeecreatives Anda telah di-reset oleh Project Manager menjadi: *${forcedNewPin}*.\n\nSilakan buka aplikasi dan segera lakukan penggantian PIN mandiri pada menu Profil & Keamanan PIN.\n\nTerima kasih,\nTim Obeecreatives.`;
    navigator.clipboard.writeText(message);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2500);
    onSuccess('Format notifikasi WhatsApp resmi berhasil disalin ke clipboard.');
  };

  // Switch demo user
  const handleSwitchUser = (user: UserProfile) => {
    onUpdateCurrentUser(user);
    onSuccess(`Beralih akun ke: ${user.name} (${user.roleLabel})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="max-w-lg w-full bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E30000] dark:bg-red-950 dark:text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Profil & Keamanan Akun Staf
              </h3>
              <div className="text-[10px] text-gray-400">Proteksi PIN 4-8 Digit & RBAC</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-[#161B26] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#1F2636] text-gray-900 dark:text-white shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('changePin')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'changePin'
                ? 'bg-white dark:bg-[#1F2636] text-gray-900 dark:text-white shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ganti PIN
          </button>
          {isRoleAdmin && (
            <button
              onClick={() => setActiveTab('forceReset')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTab === 'forceReset'
                  ? 'bg-white dark:bg-[#1F2636] text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Reset Paksa
            </button>
          )}
          <button
            onClick={() => setActiveTab('switchRole')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'switchRole'
                ? 'bg-white dark:bg-[#1F2636] text-[#E30000] shadow-xs font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Switch User
          </button>
        </div>

        {/* Tab 1: Current Profile Info */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#161B26] border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E30000] to-black text-white flex items-center justify-center text-xl font-bold shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                  {currentUser.email}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-[#E30000] dark:bg-red-950 dark:text-red-400 font-bold">
                    {currentUser.roleLabel}
                  </span>
                  <span className="text-[10px] text-gray-400">{currentUser.divisi}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Status Keamanan PIN:</span>
                <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Aktif (••••)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Kontak WhatsApp:</span>
                <span className="font-mono">{currentUser.telepon}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ganti PIN Mandiri */}
        {activeTab === 'changePin' && (
          <form onSubmit={handleChangePin} className="space-y-3.5 text-xs">
            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold">
                {pinError}
              </div>
            )}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                PIN Lama Anda
              </label>
              <input
                type="password"
                required
                maxLength={8}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN saat ini"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161B26] text-gray-900 dark:text-white font-mono text-center tracking-widest text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                  PIN Baru (4-8 Digit)
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN baru"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161B26] text-gray-900 dark:text-white font-mono text-center tracking-widest text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                  Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Ulangi PIN baru"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161B26] text-gray-900 dark:text-white font-mono text-center tracking-widest text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#E30000] hover:bg-[#B80000] text-white font-bold transition shadow-sm mt-2"
            >
              Simpan PIN Baru
            </button>
          </form>
        )}

        {/* Tab 3: Reset Paksa PIN (PM & Site Engineer only) */}
        {activeTab === 'forceReset' && isRoleAdmin && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
              <strong>Fitur Reset Paksa PIN (Buku Panduan Hal. 2 Bagian D):</strong>
              <p className="mt-0.5">
                Gunakan fitur ini jika anggota tim atau kreator lupa PIN dan terkunci dari sistem.
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                Pilih Akun Staf / Kreator
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161B26] text-gray-900 dark:text-white font-medium"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.roleLabel} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                PIN Baru Ditetapkan
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={forcedNewPin}
                  onChange={(e) => setForcedNewPin(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161B26] text-gray-900 dark:text-white font-mono text-center tracking-widest text-base font-bold"
                />
                <button
                  type="button"
                  onClick={handleGenerateRandomPin}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Acak 4 Digit</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyForceReset}
                className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 text-white font-bold transition"
              >
                Terapkan PIN Baru
              </button>
              <button
                type="button"
                onClick={handleCopyWaMessage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold transition"
              >
                {waCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>Salin Notifikasi WA</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Switch User Demo Mode */}
        {activeTab === 'switchRole' && (
          <div className="space-y-2 text-xs">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Pilih peran akun di bawah ini untuk mensimulasikan hak akses Role-Based Access Control (RBAC):
            </p>
            {usersList.map((user) => {
              const isCurrent = currentUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    isCurrent
                      ? 'border-[#E30000] bg-red-50/50 dark:bg-red-950/30'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-gray-500">{user.email}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isCurrent
                        ? 'bg-[#E30000] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {user.roleLabel}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
