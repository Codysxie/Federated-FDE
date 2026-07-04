import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEditProfile } from '../context/EditProfileContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openDialog } = useEditProfile();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = (e) => {
    e.preventDefault();
    openDialog();
  };

  return (
    <nav className="sticky top-0 z-50 text-white bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-2xl">🚀</span>
            <span className="hidden sm:inline">Federated FDE</span>
            <span className="sm:hidden">FDE</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="hover:text-blue-200 transition-colors font-medium">成员展示</Link>
              <Link to="/resources" className="hover:text-blue-200 transition-colors font-medium">企业资源</Link>
              <Link to="/articles" className="hover:text-blue-200 transition-colors font-medium">技术分享</Link>
            </div>
          )}

          {/* Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-white/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span>{user.name || user.username}</span>
                </button>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-300 hover:text-yellow-200 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                    管理员
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-primary text-sm !py-1.5 !px-4">
                  退出
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-primary text-sm !py-1.5 !px-4">登录</Link>
                <Link to="/register" className="btn-primary text-sm !py-1.5 !px-4">注册</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            {user && <Link to="/" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>成员展示</Link>}
            {user && <Link to="/resources" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>企业资源</Link>}
            {user && <Link to="/articles" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>技术分享</Link>}
            {user ? (
              <>
                <button
                  type="button"
                  onClick={(e) => { setMenuOpen(false); handleAvatarClick(e); }}
                  className="text-left hover:text-blue-200 py-1"
                >
                  个人中心
                </button>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-300 py-1" onClick={() => setMenuOpen(false)}>管理后台</Link>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn-primary text-sm !py-1.5 !px-4 w-full text-center">退出登录</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>登录</Link>
                <Link to="/register" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>注册</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
