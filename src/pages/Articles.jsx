import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../api';

import { BookOpen } from 'lucide-react';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesAPI.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    articlesAPI.list({ category: selectedCat, page, limit: 9 }).then(data => {
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedCat, page]);

  return (
    <div className="bg-slate-900 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      {/* <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          技术分享
        </h1>
      </div> */}

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => { setSelectedCat(''); setPage(1); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCat
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCat(cat); setPage(1); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCat === cat
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
            <BookOpen className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
          </div>
          <p className="text-lg">暂无技术干货</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md card-hover border border-gray-100"
              >
                {/* Cover */}
                <div className="h-48 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 relative overflow-hidden">
                  {article.cover_url ? (
                    <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl opacity-30">
                      📝
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs bg-white/90 text-blue-600 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                    <span>{article.author_name}</span>
                    <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
              >
                上一页
              </button>
              <span className="flex items-center px-4 text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
