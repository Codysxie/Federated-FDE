import { useState, useEffect } from 'react';
import { fdeAPI, authAPI, articlesAPI } from '../api';

// Simple admin page to manage FDE profiles, reviews, articles, and users
export default function Admin() {
  const [tab, setTab] = useState('reviews');
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [expandedReview, setExpandedReview] = useState(null);
  // Inline edit state for reviews
  const [editReviewId, setEditReviewId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const fetchData = async () => {
    try {
      const [u, a, r] = await Promise.all([
        authAPI.listUsers(),
        articlesAPI.list({ limit: 100 }),
        fdeAPI.getReviews()
      ]);
      setUsers(u);
      setArticles(a.articles);
      setReviews(r.reviews);
      setReviewCount(r.count);
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await authAPI.changeRole(userId, newRole);
      setMsg(`✅ 角色已更新为 ${newRole}`);
      fetchData();
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const deleteArticle = async (id) => {
    if (!confirm('确定删除这篇文章？')) return;
    try {
      await articlesAPI.delete(id);
      setMsg('✅ 文章已删除');
      fetchData();
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const approveReview = async (id) => {
    try {
      await fdeAPI.approveReview(id);
      setMsg('✅ 审核通过，信息已生效');
      fetchData();
      setExpandedReview(null);
      setEditReviewId(null);
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const rejectReview = async (id) => {
    if (!confirm('确定驳回该审核？用户的修改将被丢弃。')) return;
    try {
      await fdeAPI.rejectReview(id);
      setMsg('✅ 已驳回审核');
      fetchData();
      setExpandedReview(null);
      setEditReviewId(null);
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const startEditReview = (review) => {
    setEditReviewId(review.id);
    setEditFields({
      name: review.profile_data.name || '',
      title: review.profile_data.title || '',
      city: review.profile_data.city || '',
      description: review.profile_data.description || '',
      work_details: review.profile_data.work_details || '',
      resources_needed: review.profile_data.resources_needed || '',
      skills: review.profile_data.skills || '',
      email: review.profile_data.email || '',
      phone: review.profile_data.phone || '',
      wechat_qr_url: review.profile_data.wechat_qr_url || ''
    });
  };

  const saveEditReview = async (id) => {
    try {
      await fdeAPI.updateReview(id, editFields);
      setMsg('✅ 审核内容已更新');
      setEditReviewId(null);
      fetchData();
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const cancelEditReview = () => {
    setEditReviewId(null);
  };

  const tabs = [
    { key: 'reviews',  label: '待审核',    icon: '⏳', badge: reviewCount },
    { key: 'fde',      label: 'FDE 成员',  icon: '👥' },
    { key: 'articles', label: '技术文章',   icon: '📝' },
    { key: 'users',    label: '用户管理',   icon: '👤' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">⚙️ 管理后台</h1>
      <p className="text-gray-500 mb-8">FDE 平台内容与用户管理</p>

      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all relative ${
              tab === t.key
                ? 'bg-white text-blue-600 border border-gray-200 border-b-transparent -mb-[2px]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === t.key ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-lg">暂无待审核信息</p>
            </div>
          ) : (
            reviews.map(review => {
              const isEditing = editReviewId === review.id;
              const pd = isEditing ? editFields : review.profile_data;
              const cur = review.current_profile || {};
              return (
              <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⏳</span>
                    <div>
                      <span className="font-bold text-gray-900">{review.username}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        提交于 {new Date(review.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <button onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                          {expandedReview === review.id ? '收起' : '查看详情'}
                        </button>
                        <button onClick={() => startEditReview(review)} className="px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                          ✏️ 编辑
                        </button>
                        <button onClick={() => rejectReview(review.id)} className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                          驳回
                        </button>
                        <button onClick={() => approveReview(review.id)} className="px-4 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium">
                          通过
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={cancelEditReview} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                          取消
                        </button>
                        <button onClick={() => { saveEditReview(review.id); }} className="px-4 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                          保存修改
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit Form or Diff View */}
                {expandedReview === review.id && (
                  <div className="p-6">
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">姓名</label>
                            <input value={pd.name} onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">职位</label>
                            <input value={pd.title} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">城市</label>
                            <input value={pd.city} onChange={e => setEditFields(f => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">邮箱</label>
                            <input value={pd.email} onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">手机号</label>
                            <input value={pd.phone} onChange={e => setEditFields(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">技术标签（逗号分隔）</label>
                          <input value={pd.skills} onChange={e => setEditFields(f => ({ ...f, skills: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">个人简介</label>
                          <textarea value={pd.description} onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">我的优势</label>
                          <textarea value={pd.work_details} onChange={e => setEditFields(f => ({ ...f, work_details: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">需要的资源</label>
                          <textarea value={pd.resources_needed} onChange={e => setEditFields(f => ({ ...f, resources_needed: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
                        </div>
                      </div>
                    ) : (
                      /* Diff View */
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">当前已生效信息</h4>
                          {cur ? (
                            <dl className="space-y-3 text-sm">
                              <div>
                                <dt className="text-gray-400 text-xs">头像</dt>
                                <dd className="mt-1">
                                  {cur.avatar_url ? (
                                    <img src={cur.avatar_url} alt="当前头像" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                                  ) : (
                                    <span className="text-gray-400">(未上传)</span>
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-gray-400 text-xs">微信二维码</dt>
                                <dd className="mt-1">
                                  {cur.wechat_qr_url ? (
                                    <img src={cur.wechat_qr_url} alt="当前微信二维码" className="w-16 h-16 rounded object-contain border border-gray-200 bg-white" />
                                  ) : (
                                    <span className="text-gray-400">(未上传)</span>
                                  )}
                                </dd>
                              </div>
                              {[['姓名',cur.name,pd.name],['职位',cur.title,pd.title],['城市',cur.city,pd.city],
                                ['邮箱',cur.email,pd.email],['手机号',cur.phone,pd.phone],
                                ['技能',cur.skills,pd.skills],
                                ['简介',cur.description,pd.description],
                                ['我的优势',cur.work_details,pd.work_details],
                                ['需要的资源',cur.resources_needed,pd.resources_needed]].map(([label,curVal,newVal]) => (
                                <div key={label}>
                                  <dt className="text-gray-400 text-xs">{label}</dt>
                                  <dd className={`text-gray-600 mt-0.5 whitespace-pre-wrap ${curVal !== newVal && curVal && newVal ? 'line-through text-red-400' : ''}`}>
                                    {curVal || '(未填写)'}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          ) : (
                            <p className="text-sm text-gray-400">新注册用户，暂无已生效信息</p>
                          )}
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <h4 className="text-xs font-bold text-green-600 uppercase mb-3">待审核修改</h4>
                          <dl className="space-y-3 text-sm">
                            <div>
                              <dt className="text-green-500 text-xs">头像</dt>
                              <dd className="mt-1">
                                {pd.avatar_url ? (
                                  <img src={pd.avatar_url} alt="待审核头像" className="w-16 h-16 rounded-full object-cover border border-green-200" />
                                ) : (
                                  <span className="text-green-400">(未上传)</span>
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-green-500 text-xs">微信二维码</dt>
                              <dd className="mt-1">
                                {pd.wechat_qr_url ? (
                                  <img src={pd.wechat_qr_url} alt="待审核微信二维码" className="w-16 h-16 rounded object-contain border border-green-200 bg-white" />
                                ) : (
                                  <span className="text-green-400">(未上传 / 已删除)</span>
                                )}
                              </dd>
                            </div>
                            {[['姓名',pd.name],['职位',pd.title],['城市',pd.city],
                              ['邮箱',pd.email],['手机号',pd.phone],
                              ['技能',pd.skills],
                              ['简介',pd.description],
                              ['我的优势',pd.work_details],
                              ['需要的资源',pd.resources_needed]].map(([label,val]) => (
                              <div key={label}>
                                <dt className="text-green-500 text-xs">{label}</dt>
                                <dd className={`text-green-800 mt-0.5 whitespace-pre-wrap ${cur[label === '姓名' ? 'name' : label] !== val ? 'font-semibold' : ''}`}>
                                  {val || '(未填写)'}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>
      )}

      {/* FDE Members */}
      {tab === 'fde' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">姓名</th>
                <th className="px-6 py-4 font-medium">城市</th>
                <th className="px-6 py-4 font-medium">职位</th>
                <th className="px-6 py-4 font-medium">联系方式</th>
                <th className="px-6 py-4 font-medium">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Articles */}
      {tab === 'articles' && (
        <div className="space-y-4">
          {articles.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a.category}</span>
                  <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <h3 className="font-bold text-gray-900 truncate">{a.title}</h3>
                {a.summary && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{a.summary}</p>}
                <p className="text-xs text-gray-400 mt-1">作者：{a.author_name}</p>
              </div>
              <button
                onClick={() => deleteArticle(a.id)}
                className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 shrink-0"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">用户名</th>
                <th className="px-6 py-4 font-medium">邮箱</th>
                <th className="px-6 py-4 font-medium">角色</th>
                <th className="px-6 py-4 font-medium">注册时间</th>
                <th className="px-6 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{u.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.created_at}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {u.role === 'admin' ? '降级为普通用户' : '升级为管理员'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
