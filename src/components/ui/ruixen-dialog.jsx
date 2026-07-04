'use client';

import { useId, useState, useEffect, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useImageUpload } from '@/hooks/use-image-upload';

const MAX_ABOUT = 180;
const MAX_WORK = 500;
const MAX_NEED = 500;

export default function RuixenDialog({
  open,
  onOpenChange,
  profile,
  onSave,
  onQrFileChange,
  onAvatarFileChange,
  onQrRemoved,
}) {
  const id = useId();

  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [workDetails, setWorkDetails] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [skills, setSkills] = useState('');

  const {
    previewUrl: avatarPreview,
    fileName: avatarFileName,
    fileInputRef: avatarInputRef,
    handleThumbnailClick: handleAvatarClick,
    handleFileChange: handleAvatarFileChange,
  } = useImageUpload();

  const qrInputRef = useRef(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  // Track whether the existing server-side QR has been removed by the user
  const [qrRemoved, setQrRemoved] = useState(false);

  // Wrap avatar change to also capture the File
  const handleAvatarFileSelected = (event) => {
    handleAvatarFileChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    } else {
      setAvatarFile(null);
    }
  };

  // Sync form state when dialog opens
  useEffect(() => {
    if (open && profile) {
      setName(profile.name || '');
      setTitle(profile.title || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setDescription(profile.description || '');
      setWorkDetails(profile.work_details || '');
      setResourcesNeeded(profile.resources_needed || '');
      setSkills(profile.skills || '');
      setQrPreview(null);
      setQrFile(null);
      setAvatarFile(null);
      if (qrInputRef.current) qrInputRef.current.value = '';
    }
  }, [open, profile]);

  // Reset qrRemoved only when the dialog opens (so the post-save "removed" preview
  // is not wiped out by the parent refreshing the profile after a save).
  useEffect(() => {
    if (open) {
      setQrRemoved(false);
    }
  }, [open]);

  // Notify parent about QR file changes
  useEffect(() => {
    onQrFileChange?.(qrFile);
  }, [qrFile, onQrFileChange]);

  // Notify parent about QR removal (when an existing server image is removed)
  useEffect(() => {
    onQrRemoved?.(qrRemoved);
  }, [qrRemoved, onQrRemoved]);

  // Notify parent about avatar file changes
  useEffect(() => {
    onAvatarFileChange?.(avatarFile);
  }, [avatarFile, onAvatarFileChange]);

  // Revoke object URL on cleanup
  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  const profileImage = avatarPreview || profile?.avatar_url || '';
  const qrImage = (!qrRemoved && (qrPreview || profile?.wechat_qr_url)) || '';

  const handleQrClick = () => {
    qrInputRef.current?.click();
  };

  const handleQrFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
      setQrRemoved(false);
    }
  };

  const handleRemoveQr = () => {
    if (qrPreview) URL.revokeObjectURL(qrPreview);
    setQrFile(null);
    setQrPreview(null);
    setQrRemoved(true);
    if (qrInputRef.current) qrInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSave?.({
      name,
      title,
      email,
      phone,
      city,
      description,
      work_details: workDetails,
      resources_needed: resourcesNeeded,
      skills,
    });
  };

  const handleDescriptionChange = (e) => {
    const v = e.target.value;
    if (v.length <= MAX_ABOUT) setDescription(v);
  };

  const handleWorkDetailsChange = (e) => {
    const v = e.target.value;
    if (v.length <= MAX_WORK) setWorkDetails(v);
  };

  const handleResourcesNeededChange = (e) => {
    const v = e.target.value;
    if (v.length <= MAX_NEED) setResourcesNeeded(v);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border border-gray-200 max-h-[90vh]">
        {/* Gradient banner (radial pink → blue) */}
        <div
          className="px-6 py-4 h-32"
          style={{
            background:
              'radial-gradient(circle, rgba(238, 174, 202, 1) 0%, rgba(148, 187, 233, 1) 100%)',
          }}
        />

        {/* Avatar overlapping the banner */}
        <div className="-mt-14 flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg rounded-full">
              <AvatarImage src={profileImage} alt="Profile" />
              <AvatarFallback>{name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Change profile picture"
            >
              <ImagePlus size={16} />
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFileSelected}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="max-h-[55vh] overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${id}-name`}>姓名</Label>
              <Input
                id={`${id}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：张三"
                required
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${id}-title`}>职位</Label>
              <Input
                id={`${id}-title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="如：高级部署工程师"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${id}-email`}>邮箱</Label>
              <Input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${id}-phone`}>联系电话</Label>
              <Input
                id={`${id}-phone`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="如：13800138000"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${id}-city`}>城市</Label>
              <Input
                id={`${id}-city`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="如：深圳"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`${id}-skills`}>技术标签</Label>
              <Input
                id={`${id}-skills`}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="用逗号分隔，如：K8s, Docker, AI"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${id}-about`}>个人简介</Label>
            <Textarea
              id={`${id}-about`}
              value={description}
              onChange={handleDescriptionChange}
              maxLength={MAX_ABOUT}
              placeholder="简单介绍一下自己..."
            />
            <p className="text-xs text-gray-400 text-right">
              还可输入 {MAX_ABOUT - description.length} 个字符
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${id}-work`}>我的优势</Label>
            <Textarea
              id={`${id}-work`}
              value={workDetails}
              onChange={handleWorkDetailsChange}
              maxLength={MAX_WORK}
              placeholder="介绍你的核心优势、擅长领域、专业技能等..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-400 text-right">
              还可输入 {MAX_WORK - workDetails.length} 个字符
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${id}-need`}>需要的资源</Label>
            <Textarea
              id={`${id}-need`}
              value={resourcesNeeded}
              onChange={handleResourcesNeededChange}
              maxLength={MAX_NEED}
              placeholder="介绍你当前需要的资源、合作方、技术支持等..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-400 text-right">
              还可输入 {MAX_NEED - resourcesNeeded.length} 个字符
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>微信二维码</Label>
            <div className="flex items-start gap-4">
              {qrImage ? (
                <div className="relative w-28 h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={qrImage}
                    alt="微信二维码"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveQr}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label="移除二维码"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center px-2">
                  暂无<br />二维码
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={qrInputRef}
                  onChange={handleQrFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQrClick}
                >
                  <ImagePlus className="h-4 w-4 mr-1.5" />
                  {qrImage ? '更换二维码' : '上传二维码'}
                </Button>
                <p className="text-xs text-gray-400">
                  支持 JPG / PNG 格式，建议尺寸 200×200 以上
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="border-t border-gray-100 px-6 py-4 bg-white rounded-b-2xl gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">取消</Button>
          </DialogClose>
          <Button type="button" variant="default" onClick={handleSubmit}>
            保存修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
