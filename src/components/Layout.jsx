import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import RuixenDialog from '@/components/ui/ruixen-dialog';
import { fdeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { EditProfileProvider, useEditProfile } from '../context/EditProfileContext';

// Normalize value: treat null/undefined/empty/whitespace-only as equal
const normalize = (v) => (v == null ? '' : String(v)).trim();

// Compare current profile with form values + pending files to determine if anything changed
function isProfileChanged(profile, values, hasQrFile, hasAvatarFile) {
  if (!profile) return true;
  if (hasQrFile || hasAvatarFile) return true;
  const fields = [
    'name', 'title', 'city', 'description', 'work_details', 'resources_needed', 'skills', 'email', 'phone',
  ];
  return fields.some((key) => normalize(profile[key]) !== normalize(values[key]));
}

function GlobalEditProfileDialog() {
  const { user, checkAuth } = useAuth();
  const { open, setOpen, closeDialog } = useEditProfile();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingQrFile, setPendingQrFile] = useState(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [qrRemoved, setQrRemoved] = useState(false);
  const qrFileInputRef = useRef(null);

  // Load profile when dialog opens
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    fdeAPI.get(user.id).then((data) => {
      if (!cancelled) setProfile(data);
    }).catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [open, user]);

  // Reset pending files when closing
  useEffect(() => {
    if (!open) {
      setPendingQrFile(null);
      setPendingAvatarFile(null);
      setQrRemoved(false);
      if (qrFileInputRef.current) qrFileInputRef.current.value = '';
    }
  }, [open]);

  const handleSave = async (values) => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const hasQrChange = !!pendingQrFile || qrRemoved;
      const changed = isProfileChanged(profile, values, hasQrChange, !!pendingAvatarFile);
      if (!changed) {
        setSaving(false);
        return;
      }
      // Build update body; include wechat_qr_url only if a change is needed
      const updateBody = {
        name: values.name,
        title: values.title,
        city: values.city,
        description: values.description,
        work_details: values.work_details,
        resources_needed: values.resources_needed,
        skills: values.skills,
        email: values.email,
        phone: values.phone,
      };
      if (qrRemoved && !pendingQrFile) {
        updateBody.wechat_qr_url = '';
      }
      const result = await fdeAPI.update(user.id, updateBody);
      if (pendingQrFile) {
        try {
          await fdeAPI.uploadQrCode(user.id, pendingQrFile);
        } catch (qrErr) {
          console.error('二维码上传失败:', qrErr);
        }
        setPendingQrFile(null);
        if (qrFileInputRef.current) qrFileInputRef.current.value = '';
      }
      if (pendingAvatarFile) {
        try {
          await fdeAPI.uploadAvatar(user.id, pendingAvatarFile);
        } catch (avatarErr) {
          console.error('头像上传失败:', avatarErr);
        }
        setPendingAvatarFile(null);
      }
      await checkAuth();
      const data = await fdeAPI.get(user.id);
      setProfile(data);
      const isAdmin = user.role === 'admin';
      if (!isAdmin && result.reviewed === false) {
        setMessage('✅ 信息已提交审核，等待管理员确认后生效');
      } else {
        setMessage('✅ 信息更新成功');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <RuixenDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        onSave={handleSave}
        onQrFileChange={setPendingQrFile}
        onAvatarFileChange={setPendingAvatarFile}
        onQrRemoved={setQrRemoved}
      />
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg text-sm shadow-lg bg-white border border-gray-200">
          {message}
        </div>
      )}
    </>
  );
}

export default function Layout() {
  return (
    <EditProfileProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-900">
          <Outlet />
        </main>
        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 Federated FDE · Technical Service Platform</p>
          </div>
        </footer>
        <GlobalEditProfileDialog />
      </div>
    </EditProfileProvider>
  );
}
