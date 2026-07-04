import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articlesAPI } from '../api';

export default function ArticleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user && (user.role === 'admin' || (article && user.id === article.author_id));

  useEffect(() => {
    articlesAPI.get(id).then(data => {
      setArticle(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('确定删除这篇文章吗？')) return;
    setDeleting(true);
    try {
      await articlesAPI.delete(id);
      navigate('/articles');
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-xl text-gray-500">文章不存在</p>
        <Link to="/articles" className="text-blue-600 mt-4 inline-block">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/articles" className="hover:text-blue-600">技术分享</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{article.title}</span>
      </div>

      {/* Article */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover */}
        {article.cover_url && (
          <img src={article.cover_url} alt={article.title} className="w-full h-64 object-cover" />
        )}

        <div className="p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {article.category}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(article.created_at).toLocaleDateString('zh-CN')}
            </span>
            <span className="text-sm text-gray-400">
              作者：{article.author_name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {/* Summary */}
          {article.summary && (
            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8">
              <p className="text-gray-600 italic">{article.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-3 mt-10 pt-6 border-t border-gray-100">
              <Link to={`/articles/${article.id}/edit`} className="btn-primary text-sm">
                ✏️ 编辑
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                {deleting ? '删除中...' : '🗑️ 删除'}
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
