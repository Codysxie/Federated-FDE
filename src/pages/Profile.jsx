import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fdeAPI, authAPI } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Profile() {
  const { user } = useAuth();
  const [pendingReview, setPendingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      setLoading(false);
      return;
    }
    fdeAPI.getMyPending().then((pending) => {
      if (pending?.hasPending && pending.review) {
        setPendingReview(pending.review);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    try {
      await authAPI.changePassword({ oldPassword: oldPw, newPassword: newPw });
      setPwMsg('✅ 密码修改成功');
      setOldPw('');
      setNewPw('');
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwMsg('❌ ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">🔒 个人中心</h1>

      {!isAdmin && pendingReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">有资料待审核</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                您的资料修改已提交，正在等待管理员审核。
                审核期间您当前的已通过信息将继续对外显示。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔒 修改密码</h2>
        {pwMsg && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${pwMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {pwMsg}
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="old-password">原密码</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPw}
              onChange={e => setOldPw(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">新密码</Label>
            <Input
              id="new-password"
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="outline">确认修改</Button>
        </form>
      </div>
    </div>
  );
}
