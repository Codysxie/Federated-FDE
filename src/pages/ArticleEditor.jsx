import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesAPI } from '../api';

export default function ArticleEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('技术分享');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If editing, load article
  // Simplified: just create mode for now
  // In production, we'd load the article for editing

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('标题和内容不能为空');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const article = await articlesAPI.create({ title, summary, content, category });
      navigate(`/articles/${article.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEdit ? '✏️ 编辑文章' : '📝 发布技术文章'}
      </h1>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">标题 *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="请输入文章标题" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option>技术分享</option>
            <option>部署实践</option>
            <option>AI & LLM</option>
            <option>云原生</option>
            <option>DevOps</option>
            <option>前沿动态</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">摘要</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="简要概括文章内容..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">内容 *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={15} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" placeholder="支持纯文本输入，段落换行即可自动分段..." required />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline text-sm">
            取消
          </button>
          <button type="submit" disabled={submitting} className="btn-primary text-sm">
            {submitting ? '发布中...' : (isEdit ? '💾 更新' : '📤 发布文章')}
          </button>
        </div>
      </form>
    </div>
  );
}
