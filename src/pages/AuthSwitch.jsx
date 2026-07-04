import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Rocket } from 'lucide-react';

export default function AuthSwitch() {
  const location = useLocation();
  const isRegisterPath = location.pathname === '/register';
  const [isSignUp, setIsSignUp] = useState(isRegisterPath);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync with route path changes (e.g. from navbar links)
  useEffect(() => {
    setIsSignUp(location.pathname === '/register');
  }, [location.pathname]);

  useEffect(() => {
    const container = document.querySelector('.auth-container');
    if (!container) return;
    if (isSignUp) container.classList.add('sign-up-mode');
    else container.classList.remove('sign-up-mode');
  }, [isSignUp]);

  const handleToggle = (mode) => {
    setError('');
    setIsSignUp(mode);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(signInUsername, signInPassword);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (signUpPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }
    setLoading(true);
    try {
      await register(signUpUsername, signUpPassword, signUpEmail);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          min-height: 550px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 2rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .auth-form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-form.sign-in-form {
          z-index: 2;
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .auth-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #3b82f6 0%, #6366f1 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .auth-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        /* Mobile responsiveness */
        @media (max-width: 870px) {
          .auth-container {
            min-height: 800px;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .auth-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="auth-container bg-slate-800/90 backdrop-blur-sm">
          <div className="forms-container">
            <div className="signin-signup">
              {/* --- Sign In Form --- */}
              <form className="auth-form sign-in-form" onSubmit={handleSignIn}>
                <h2 className="text-3xl font-bold text-white mb-2">会员登录</h2>
                {error && (
                  <div className="w-full max-w-[380px] bg-red-900/30 border border-red-700/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-2">
                    {error}
                  </div>
                )}
                <div className="w-full max-w-[380px] bg-slate-700/60 rounded-full h-[50px] grid grid-cols-[15%_85%] px-2 my-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <span className="flex items-center justify-center text-white/50">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={signInUsername}
                    onChange={(e) => { setSignInUsername(e.target.value); setError(''); }}
                    className="bg-transparent outline-none border-none text-white placeholder:text-white/30 text-sm w-full"
                    placeholder="用户名"
                    required
                  />
                </div>
                <div className="w-full max-w-[380px] bg-slate-700/60 rounded-full h-[50px] grid grid-cols-[15%_85%] px-2 my-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <span className="flex items-center justify-center text-white/50">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => { setSignInPassword(e.target.value); setError(''); }}
                    className="bg-transparent outline-none border-none text-white placeholder:text-white/30 text-sm w-full"
                    placeholder="密码"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[150px] h-[49px] rounded-full bg-blue-600 text-white font-semibold text-sm uppercase tracking-wider cursor-pointer transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 mt-2.5 mb-2.5 border-none outline-none"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
                <p className="text-sm text-white/30 mt-1">
                  还没有账号？{' '}
                  <Link
                    to="/register"
                    onClick={(e) => { e.preventDefault(); handleToggle(true); }}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    立即注册
                  </Link>
                </p>
              </form>

              {/* --- Sign Up Form --- */}
              <form className="auth-form sign-up-form" onSubmit={handleSignUp}>
                <h2 className="text-3xl font-bold text-white mb-2">注册加入</h2>
                {error && (
                  <div className="w-full max-w-[380px] bg-red-900/30 border border-red-700/30 text-red-300 px-4 py-2.5 rounded-lg text-sm mb-2">
                    {error}
                  </div>
                )}
                <div className="w-full max-w-[380px] bg-slate-700/60 rounded-full h-[50px] grid grid-cols-[15%_85%] px-2 my-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <span className="flex items-center justify-center text-white/50">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={signUpUsername}
                    onChange={(e) => { setSignUpUsername(e.target.value); setError(''); }}
                    className="bg-transparent outline-none border-none text-white placeholder:text-white/30 text-sm w-full"
                    placeholder="用户名"
                    required
                  />
                </div>
                <div className="w-full max-w-[380px] bg-slate-700/60 rounded-full h-[50px] grid grid-cols-[15%_85%] px-2 my-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <span className="flex items-center justify-center text-white/50">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => { setSignUpEmail(e.target.value); setError(''); }}
                    className="bg-transparent outline-none border-none text-white placeholder:text-white/30 text-sm w-full"
                    placeholder="邮箱（选填）"
                  />
                </div>
                <div className="w-full max-w-[380px] bg-slate-700/60 rounded-full h-[50px] grid grid-cols-[15%_85%] px-2 my-2.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <span className="flex items-center justify-center text-white/50">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => { setSignUpPassword(e.target.value); setError(''); }}
                    className="bg-transparent outline-none border-none text-white placeholder:text-white/30 text-sm w-full"
                    placeholder="至少6位密码"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[150px] h-[49px] rounded-full bg-blue-600 text-white font-semibold text-sm uppercase tracking-wider cursor-pointer transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 mt-2.5 mb-2.5 border-none outline-none"
                >
                  {loading ? '注册中...' : '注册'}
                </button>
                <p className="text-sm text-white/30 mt-1">
                  已有账号？{' '}
                  <Link
                    to="/login"
                    onClick={(e) => { e.preventDefault(); handleToggle(false); }}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    立即登录
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="panels-container">
            {/* Left Panel */}
            <div className="panel left-panel">
              <div className="content">
                <div className="text-5xl mb-3"><Rocket size={48} className="mx-auto" /></div>
                <h3 className="text-2xl font-bold mb-3">新来的朋友？</h3>
                <p className="text-base opacity-90 leading-relaxed px-2">
                  加入 Federated FDE，一起探索 FDE 最新落地实践与行业洞察。
                </p>
                <button
                  className="mt-4 bg-transparent border-2 border-white text-white rounded-full w-[140px] h-[44px] font-semibold text-sm uppercase tracking-wider cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-0.5"
                  onClick={() => handleToggle(true)}
                >
                  注册
                </button>
              </div>
            </div>

            {/* Right Panel */}
            <div className="panel right-panel">
              <div className="content">
                <div className="text-5xl mb-3"><Rocket size={48} className="mx-auto" /></div>
                <h3 className="text-2xl font-bold mb-3">已是会员？</h3>
                <p className="text-base opacity-90 leading-relaxed px-2">
                  欢迎回到 Federated FDE！登录继续探索更多精彩内容。
                </p>
                <button
                  className="mt-4 bg-transparent border-2 border-white text-white rounded-full w-[140px] h-[44px] font-semibold text-sm uppercase tracking-wider cursor-pointer transition-all hover:bg-white/10 hover:-translate-y-0.5"
                  onClick={() => handleToggle(false)}
                >
                  登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
