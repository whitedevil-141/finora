// @ts-nocheck
import { useEffect, useState } from 'react';
import { Check, Camera, Settings, Bell, Shield, Trash2, LogOut, Pencil } from 'lucide-react';
import { Toggle, SettingsRow } from '../components/Shared';

const ProfileView = ({
  userAvatar,
  onAvatarChange,
  onAvatarRemove,
  faceId,
  onToggleFaceId,
  notifications,
  onToggleNotifications,
  onDeleteData,
  userName,
  userEmail,
  onLogout,
  onNameUpdate,
  isOnline,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName || '');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (!isEditingName) {
      setNameDraft(userName || '');
    }
  }, [userName, isEditingName]);

  const displayName = (userName || userEmail || 'User').trim();
  const avatarInitial = displayName ? displayName[0].toUpperCase() : 'U';
  const canEditName = typeof onNameUpdate === 'function' && isOnline;
  const canChangeAvatar = typeof onAvatarChange === 'function' && isOnline;
  const canRemoveAvatar = Boolean(userAvatar) && typeof onAvatarRemove === 'function' && isOnline;

  const handleNameSave = async () => {
    if (!isOnline) return;
    const nextName = nameDraft.trim();
    if (!nextName) return;
    if (!onNameUpdate) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    const didSave = await onNameUpdate(nextName);
    setIsSavingName(false);
    if (didSave !== false) setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setNameDraft(userName || '');
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 pb-20">
      <div className="stagger-item flex flex-col gap-1" style={{ animationDelay: '0ms' }}>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Profile</h2>
        <p className="text-sm font-medium text-zinc-500">Manage account.</p>
      </div>
      <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div
            className={`relative group inline-block ${canChangeAvatar ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            onClick={canChangeAvatar ? onAvatarChange : undefined}
            aria-disabled={!canChangeAvatar}
          >
            <div className="w-24 h-24 rounded-[1.5rem] shadow-xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-zinc-600 dark:text-zinc-200">{avatarInitial}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{displayName || 'User'}</h3>
                <p className="text-sm font-medium text-zinc-500">{userEmail || ''}</p>
              </div>
              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  disabled={!canEditName}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pencil size={14} className="text-zinc-500 dark:text-zinc-300" />
                  Edit Name
                </button>
              )}
            </div>
            {isEditingName && (
              <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-3">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  disabled={!isOnline}
                  placeholder="New name"
                  className="w-full px-4 py-3 md:py-3.5 bg-zinc-100 dark:bg-zinc-800/60 border-2 border-transparent rounded-2xl text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleNameSave}
                    disabled={!isOnline || isSavingName || !nameDraft.trim()}
                    className="flex-1 px-4 py-3 rounded-2xl bg-violet-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleNameCancel}
                    className="flex-1 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 text-sm font-bold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden w-full grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onAvatarChange}
            disabled={!canChangeAvatar}
            className="w-full py-3 rounded-2xl bg-violet-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change Avatar
          </button>
          <button
            type="button"
            onClick={onAvatarRemove}
            disabled={!canRemoveAvatar}
            className="w-full py-3 rounded-2xl bg-rose-600 text-white text-sm font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Avatar
          </button>
        </div>
      </div>
      <div className="space-y-6">
        <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-4 shadow-sm">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 pt-2 pb-4">Preferences</h4>
          <SettingsRow icon={Settings} label="Currency" value="BDT (৳)" />
          <div className="flex items-center justify-between p-4 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Bell size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">Push Notifications</span>
            </div>
            <Toggle active={notifications} onChange={onToggleNotifications} />
          </div>
        </div>
        <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-4 shadow-sm">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 pt-2 pb-4">Security</h4>
          <div className="flex items-center justify-between p-4 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Shield size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">App Lock</span>
            </div>
            <Toggle active={faceId} onChange={onToggleFaceId} />
          </div>
          <SettingsRow icon={Trash2} label="Delete All Data" onClick={onDeleteData} isDanger />
        </div>
        {onLogout && (
          <div className="stagger-item bg-white dark:bg-zinc-900/60 rounded-[2rem] p-4 shadow-sm">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 pt-2 pb-4">Account</h4>
            <SettingsRow icon={LogOut} label="Sign Out" onClick={onLogout} isDanger />
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfileView;