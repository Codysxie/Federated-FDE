import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fdeAPI } from '../api';
import { Button } from '@/components/ui/button';
import RuixenDialog from '@/components/ui/ruixen-dialog';
import { Pencil, MapPin, Mail, Phone, ChevronRight, X, User, Briefcase, Tags, MessageCircle, HandHelping } from 'lucide-react';

// Normalize value: treat null/undefined/empty/whitespace-only as equal
const normalize = (v) => (v == null ? '' : String(v)).trim();

// Compare current profile with form values + pending files to determine if anything changed
function isProfileChanged(profile, values, hasQrFile, hasAvatarFile, hasAvatarRemoved) {
  if (!profile) return true;
  if (hasQrFile || hasAvatarFile || hasAvatarRemoved) return true;
  const fields = [
    'name', 'title', 'city', 'description', 'work_details', 'resources_needed', 'skills', 'email', 'phone',
  ];
  return fields.some((key) => normalize(profile[key]) !== normalize(values[key]));
}

export default function FdeDetail() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingQrFile, setPendingQrFile] = useState(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [qrRemoved, setQrRemoved] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const canEdit = user && (user.role === 'admin' || user.id === parseInt(userId));

  useEffect(() => {
    fdeAPI.get(userId).then((data) => {
      setProfile(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const handleQrFileChange = useCallback((file) => {
    setPendingQrFile(file);
  }, []);

  const handleAvatarFileChange = useCallback((file) => {
    setPendingAvatarFile(file);
  }, []);

  const handleSaveEdit = async (values) => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const hasQrChange = !!pendingQrFile || qrRemoved;
      const changed = isProfileChanged(profile, values, hasQrChange, !!pendingAvatarFile, avatarRemoved);
      if (!changed) {
        setSaving(false);
        return;
      }
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
      }
      if (pendingAvatarFile) {
        try {
          await fdeAPI.uploadAvatar(user.id, pendingAvatarFile);
        } catch (avatarErr) {
          console.error('头像上传失败:', avatarErr);
        }
        setPendingAvatarFile(null);
      }
      if (avatarRemoved && !pendingAvatarFile) {
        try {
          await fdeAPI.deleteAvatar(user.id);
        } catch (delErr) {
          console.error('头像删除失败:', delErr);
          setMessage('❌ 头像删除失败: ' + (delErr.message || '未知错误'));
          setSaving(false);
          return;
        }
        setAvatarRemoved(false);
      }
      // refresh profile and close dialog
      const data = await fdeAPI.get(userId);
      setProfile(data);
      setEditOpen(false);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-xl text-gray-500">成员信息不存在</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">返回列表</Link>
      </div>
    );
  }

  const skills = profile.skills
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-blue-600">成员展示</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-600">{profile.name}</span>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Gradient Banner with avatar + name + meta */}
        <div
          className="relative px-6 sm:px-8 py-6"
          style={{
            background:
              'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar — fully inside the banner so it's never cropped */}
            <div className="shrink-0 -mb-12 sm:-mb-14">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.name?.[0] || '?'}
                </div>
              )}
            </div>

            {/* Identity & contact meta */}
            <div className="flex-1 min-w-0 text-white pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow">
                  {profile.name}
                </h1>
                {profile.role === 'admin' && (
                  <span className="px-2.5 py-0.5 bg-amber-400/90 text-amber-950 rounded-full text-xs font-semibold">
                    ⭐ 管理员
                  </span>
                )}
                {profile.hasPending && (
                  <span className="px-2.5 py-0.5 bg-orange-400/90 text-orange-950 rounded-full text-xs font-semibold">
                    ⏳ 审核中
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm sm:text-base mt-1">
                {profile.title || '未设置职位'}
                {profile.city && (
                  <>
                    <span className="mx-2 text-white/40">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.city}
                    </span>
                  </>
                )}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80">
                {profile.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Edit button — vertically centered against the identity block */}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="self-center shrink-0 bg-white/20 hover:bg-white/30 text-white border-white/40 hover:text-white backdrop-blur-sm"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                编辑资料
              </Button>
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="px-6 sm:px-8 pt-16 pb-8">

          {/* Description */}
          {profile.description && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 text-blue-600">
                  <User className="h-4 w-4" />
                </span>
                个人简介
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {profile.description}
              </p>
            </div>
          )}

          {/* Work Details */}
          {profile.work_details && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-indigo-50 text-indigo-600">
                  <Briefcase className="h-4 w-4" />
                </span>
                我的优势
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {profile.work_details}
              </p>
            </div>
          )}

          {/* Resources Needed */}
          {profile.resources_needed && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-rose-50 text-rose-600">
                  <HandHelping className="h-4 w-4" />
                </span>
                需要的资源
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {profile.resources_needed}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-50 text-purple-600">
                  <Tags className="h-4 w-4" />
                </span>
                技术标签
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WeChat QR Code */}
          {profile.wechat_qr_url && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-green-50 text-green-600">
                  <MessageCircle className="h-4 w-4" />
                </span>
                微信联系
              </h2>
              <div className="flex flex-col items-center">
                <Button variant="outline" onClick={() => setShowQr(!showQr)}>
                  <Phone className="h-4 w-4 mr-1.5" />
                  {showQr ? '隐藏二维码' : '查看微信二维码'}
                </Button>
                {showQr && (
                  <div className="mt-4 bg-white p-4 rounded-xl shadow-md border border-gray-200 relative">
                    <button
                      onClick={() => setShowQr(false)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                    <img
                      src={profile.wechat_qr_url}
                      alt={`${profile.name} 微信二维码`}
                      className="w-48 h-48 object-contain mx-auto"
                    />
                    <p className="text-center text-sm text-gray-400 mt-3">
                      扫描上方二维码添加 {profile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog (ruixen style) */}
      {canEdit && (
        <RuixenDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSave={handleSaveEdit}
          onQrFileChange={handleQrFileChange}
          onAvatarFileChange={handleAvatarFileChange}
          onQrRemoved={setQrRemoved}
          onAvatarRemoved={setAvatarRemoved}
        />
      )}

      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg text-sm shadow-lg bg-white border border-gray-200">
          {message}
        </div>
      )}
    </div>
  );
}
