import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Mail, Phone, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-400 mb-0.5">{label}</span>
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      <span className="font-semibold text-sm text-gray-800">{value || '—'}</span>
    </div>
  </div>
);

export default function FdeCard({ profile, isAdmin, onDelete }) {
  const skills = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const initials = profile.name?.[0] || '?';
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(profile.user_id);
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="w-full max-w-md h-full flex flex-col rounded-2xl overflow-hidden border-blue-100">
        {/* Header */}
        <CardHeader className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-gray-900">{profile.name}</h3>
                  {profile.role === 'admin' && (
                    <span className="inline-flex text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium w-fit">
                      ⭐ Admin
                    </span>
                  )}
                  {profile.hasPending && (
                    <span className="inline-flex text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium w-fit">
                      ⏳ 审核中
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{profile.city || '未知城市'}</span>
                </div>
              </div>
            </div>
            {profile.wechat_qr_url && (
              <img
                src={profile.wechat_qr_url}
                alt="微信二维码"
                className="h-16 w-16 rounded-lg object-cover shadow-sm border border-gray-100"
              />
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InfoItem label="职业" value={profile.title} icon={Briefcase} />
            <InfoItem label="联系电话" value={profile.phone} icon={Phone} />
          </div>
          <div className="mt-3">
            <InfoItem label="邮箱" value={profile.email} icon={Mail} />
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-xs text-gray-400 mb-0.5">技能标签</span>
            {skills.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md font-medium">
                    {skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="text-xs text-gray-400">+{skills.length - 3}</span>
                )}
              </div>
            ) : (
              <span className="font-semibold text-sm text-gray-400">—</span>
            )}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 flex-1 min-h-[3.5rem] flex flex-col">
            <span className="text-xs text-gray-400 mb-1">个人简介</span>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{profile.description || '—'}</p>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-5 pt-0 flex flex-col gap-2">
          <Button className="w-full" variant="default" size="default" asChild>
            <Link to={`/fde/${profile.user_id}`}>
              查看详情
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {isAdmin && (
            showConfirm ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? '删除中...' : '确认删除'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={deleting}
                  onClick={() => setShowConfirm(false)}
                >
                  取消
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                删除
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
