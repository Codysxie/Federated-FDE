import { Users, FileText, Briefcase, Search, X } from 'lucide-react';
import { SpotlightCard } from '../components/ui/spotlight-card';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fdeAPI } from '../api';
import CityFilter from '../components/CityFilter';
import FdeCard from '../components/FdeCard';
import { StarfieldCanvas } from '../components/ui/hyperdrive-hero';
import CometHero from '../components/ui/comet-hero';

function OrbitField({ profiles = [] }) {
  const [count, setCount] = useState(0);
  const target = profiles.length;

  useEffect(() => {
    setCount(0);
    const timer = setTimeout(() => {
      const start = Date.now();
      const duration = 2000;
      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1200);
    return () => clearTimeout(timer);
  }, [target]);

  const orbitAvatarUrls = profiles.slice(0, 9).map(p => p.avatar_url).filter(Boolean);

  const orbits = [
    {
      diameter: 353,
      duration: 30,
      direction: 'left',
      avatars: [
        { angle: 270, radius: 176.5, size: 58, glow: 'purple', borderRadius: 20, delay: 0.6, idx: 0 },
      ],
    },
    {
      diameter: 501,
      duration: 40,
      direction: 'right',
      avatars: [
        { angle: 60, radius: 250.5, size: 58, glow: 'yellow', borderRadius: '50%', delay: 0.8, idx: 1 },
        { angle: 180, radius: 250.5, size: 78, glow: 'pink', borderRadius: '50%', delay: 1.0, idx: 2 },
        { angle: 300, radius: 250.5, size: 58, glow: 'blue', borderRadius: 20, delay: 1.2, idx: 3 },
      ],
    },
    {
      diameter: 649,
      duration: 50,
      direction: 'right',
      avatars: [
        { angle: 130, radius: 324.5, size: 88, glow: 'pink', borderRadius: '50%', delay: 1.4, idx: 4 },
      ],
    },
    {
      diameter: 797,
      duration: 60,
      direction: 'left',
      avatars: [
        { angle: 30, radius: 398.5, size: 58, glow: 'purple', borderRadius: '50%', delay: 1.6, idx: 5 },
        { angle: 95, radius: 398.5, size: 88, glow: 'orange', borderRadius: 24, delay: 1.8, idx: 6 },
        { angle: 220, radius: 398.5, size: 88, glow: 'pink', borderRadius: 24, delay: 2.0, idx: 7 },
        { angle: 320, radius: 398.5, size: 58, glow: 'purple', borderRadius: '50%', delay: 2.2, idx: 8 },
      ],
    },
  ];

  const glows = {
    purple: '0 0 20px rgba(160, 104, 255, 0.55), 0 0 40px rgba(160, 104, 255, 0.25)',
    yellow: '0 0 20px rgba(255, 200, 80, 0.55), 0 0 40px rgba(255, 200, 80, 0.25)',
    pink: '0 0 20px rgba(255, 120, 180, 0.55), 0 0 40px rgba(255, 120, 180, 0.25)',
    blue: '0 0 20px rgba(80, 150, 255, 0.55), 0 0 40px rgba(80, 150, 255, 0.25)',
    orange: '0 0 20px rgba(255, 160, 80, 0.55), 0 0 40px rgba(255, 160, 80, 0.25)',
  };

  const DEFAULT_AVATAR = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#A068FF" opacity="0.3"/><circle cx="50" cy="38" r="16" fill="#A068FF" opacity="0.8"/><ellipse cx="50" cy="80" rx="28" ry="18" fill="#A068FF" opacity="0.8"/></svg>');

  return (
    <div className="orbit-wrapper">
      <div className="orbit-visual">
        {orbits.map((orbit, i) => (
          <div
            key={i}
            className={`orbit-ring orbit-${i + 1} orbit-${orbit.direction}`}
            style={{ width: orbit.diameter, height: orbit.diameter }}
          >
            {orbit.avatars.map((avatar, j) => (
              <div
                key={j}
                className="orbit-avatar"
                style={{
                  transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translate(${avatar.radius}px) rotate(${-avatar.angle}deg)`,
                }}
              >
                <div className="orbit-avatar-inner" style={{ animationDelay: `${avatar.delay}s` }}>
                  <img
                    src={orbitAvatarUrls[avatar.idx] || DEFAULT_AVATAR}
                    alt=""
                    className="orbit-avatar-img"
                    style={{
                      width: avatar.size,
                      height: avatar.size,
                      borderRadius: avatar.borderRadius,
                      boxShadow: glows[avatar.glow],
                      animation: `counter-spin-${orbit.direction === 'left' ? 'right' : 'left'} ${orbit.duration}s linear infinite`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="orbit-center">
          <div className="orbit-count">{target >= 1000 ? Math.floor(count / 1000) + 'k+' : count}</div>
          <div className="orbit-label">Specialists</div>
        </div>
      </div>
    </div>
  );
}

const orbitStyles = `
  .orbit-wrapper {
    width: 580px;
    height: 580px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    animation: orbit-scale-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  .orbit-visual {
    position: relative;
    width: 720px;
    height: 720px;
    transform: scale(0.805);
  }

  @media (max-width: 1280px) {
    .orbit-wrapper { width: 520px; height: 520px; }
    .orbit-visual { transform: scale(0.72); }
  }
  @media (max-width: 1024px) {
    .orbit-wrapper { width: 420px; height: 420px; }
    .orbit-visual { transform: scale(0.58); }
  }
  @media (max-width: 768px) {
    .orbit-wrapper { width: 300px; height: 300px; }
    .orbit-visual { transform: scale(0.42); }
  }
  @media (max-width: 480px) {
    .orbit-wrapper { width: 200px; height: 200px; }
    .orbit-visual { transform: scale(0.28); }
  }

  .orbit-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: transparent;
    border: 1px solid rgba(217, 161, 255, 0.35);
    box-shadow:
      0 0 16px rgba(160, 104, 255, 0.25),
      0 0 32px rgba(160, 104, 255, 0.15),
      inset 0 0 12px rgba(217, 161, 255, 0.08);
  }

  .orbit-1 { opacity: 0.85; }
  .orbit-2 { opacity: 0.92; }
  .orbit-3 { opacity: 0.97; }
  .orbit-4 { opacity: 1; }

  .orbit-left { animation: spin-left 30s linear infinite; }
  .orbit-right { animation: spin-right 40s linear infinite; }

  .orbit-1 { animation-duration: 30s; }
  .orbit-2 { animation-duration: 40s; }
  .orbit-3 { animation-duration: 50s; }
  .orbit-4 { animation-duration: 60s; }

  .orbit-avatar {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .orbit-avatar-inner {
    animation: avatar-fly-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .orbit-avatar-img {
    object-fit: cover;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
  }

  .orbit-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    animation: center-fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 1.2s both;
    font-family: 'Urbanist', sans-serif;
  }

  .orbit-count {
    font-size: 64px;
    font-weight: 500;
    color: #ffffff;
    line-height: 1;
  }

  .orbit-label {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-top: 4px;
  }

  @keyframes spin-left {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(-360deg); }
  }

  @keyframes spin-right {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes counter-spin-left {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }

  @keyframes counter-spin-right {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes avatar-fly-in {
    0% { transform: scale(0.3) rotate(-180deg); filter: blur(4px); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); filter: blur(0); opacity: 1; }
  }

  @keyframes orbit-scale-in {
    0% { transform: scale(0.705); opacity: 0; }
    100% { transform: scale(0.805); opacity: 1; }
  }

  @keyframes center-fade-in {
    0% { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
    100% { opacity: 1; transform: translate(-50%, -50%); }
  }
`;

export default function Home() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCity = searchParams.get('city') || '';

  // Client-side keyword filtering
  const filteredProfiles = useMemo(() => {
    if (!searchKeyword.trim()) return profiles;
    const keyword = searchKeyword.trim().toLowerCase();
    return profiles.filter((p) => {
      const searchableFields = [
        p.name, p.title, p.city, p.description,
        p.work_details, p.resources_needed, p.skills,
        p.email, p.phone,
      ];
      return searchableFields.some((field) => {
        return field && String(field).toLowerCase().includes(keyword);
      });
    });
  }, [profiles, searchKeyword]);

  useEffect(() => {
    fdeAPI.cities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fdeAPI.list(selectedCity).then(data => {
      setProfiles(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedCity]);

  const handleCityChange = (city) => {
    if (city) setSearchParams({ city });
    else setSearchParams({});
  };

  const handleDeleteProfile = async (userId) => {
    await fdeAPI.delete(userId);
    setProfiles(prev => prev.filter(p => p.user_id !== userId));
  };

  // Not logged in - show landing page
  if (!user) {
    return (
      <div className="relative h-[calc(100vh-4rem-4.5rem)] flex flex-col items-center justify-center overflow-hidden px-4 bg-slate-900">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <StarfieldCanvas />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-100 z-[5]">
          <div className="w-[150vh] h-[150vh]">
            <CometHero />
          </div>
        </div>

        <div className="relative z-10 text-center">
          <div className="text-8xl mb-8 animate-float">🚀</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Federated FDE
          </h1>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">
            告别信息孤岛，高效匹配企业资源，让每位优秀的 FDE 被看见
            <br />
            <span className="text-blue-400 font-semibold">注册成为会员</span>，探索更多精彩内容
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl text-left">
            <SpotlightCard className="p-6 h-full flex flex-col gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700">
                <Users className="text-white h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">成员展示</h3>
                <p className="text-sm text-neutral-400">
                  清晰展示每位 FDE 成员核心价值与需求
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6 h-full flex flex-col gap-4" spotlightColor="rgba(168, 85, 247, 0.25)">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-900/20 border border-purple-800/50">
                <Briefcase className="text-purple-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">企业资源</h3>
                <p className="text-sm text-neutral-400">
                  汇聚各行业 AI 转型真实需求与项目资源
                </p>
              </div>
            </SpotlightCard>
            
            <SpotlightCard className="p-6 h-full flex flex-col gap-4" spotlightColor="rgba(14, 165, 233, 0.25)">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-sky-900/20 border border-sky-800/50">
                <FileText className="text-sky-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">技术分享</h3>
                <p className="text-sm text-neutral-400">
                  持续输出 FDE 最新落地实践与技术干货
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show FDE cards with Hero cover
  return (
    <>
      {/* Full-screen Hero Cover */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-row items-center justify-center gap-6 sm:gap-10 lg:gap-16 overflow-hidden bg-slate-900 px-8 sm:px-16 lg:px-28 xl:px-40">
        <style>{orbitStyles}</style>

        {/* Hero content */}
        <div className="relative z-10 text-left max-w-[42%] sm:max-w-[45%] lg:max-w-[40%] shrink-0">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium tracking-[0.3em] sm:tracking-[0.4em] text-white/70 uppercase mb-4 sm:mb-6 lg:mb-8 animate-fade-in-up">
            Intelligence
          </p>

          <div className="flex flex-row items-start justify-start gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-6 flex-wrap">
            <span className="inline-flex items-center justify-center border-[2px] sm:border-[3px] border-white rounded-full px-3 sm:px-5 py-1 sm:py-1.5 text-lg sm:text-xl md:text-2xl font-black text-white tracking-wide animate-scale-in shrink-0" style={{ animationDelay: '0.1s' }}>
              FDE
            </span>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              前沿部署工程师
            </h1>
          </div>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/55 font-normal leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            汇聚全国优质 FDE · 让每位成员都能被看见
          </p>

        </div>

        <OrbitField profiles={profiles} />

        {/* Bottom fade-to-black gradient for smooth transition */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-900 to-transparent z-[1]" />

        {/* Scroll indicator */}
        <button
          onClick={() => document.getElementById('team-members')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50 hover:text-white/80 transition-colors animate-bounce z-10 cursor-pointer"
        >
          <span className="text-xs font-medium tracking-wider mb-2">向下滚动</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* Cards section — dark background */}
      <div className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* TEAM MEMBERS divider */}
          <div id="team-members" className="flex items-center gap-4 mb-8 pt-8">
            <div className="flex-1 h-px bg-white/20" />
            <h2 className="text-white/80 text-sm font-semibold tracking-[0.3em] uppercase whitespace-nowrap">TEAM MEMBERS</h2>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* City Filter + Search */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <CityFilter cities={cities} selected={selectedCity} onChange={handleCityChange} />
            </div>
            <div className="relative w-full sm:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">
                {searchKeyword
                  ? `没有找到与"${searchKeyword}"相关的成员`
                  : selectedCity
                    ? `${selectedCity} 暂无 FDE 成员`
                    : '暂无 FDE 成员信息'}
              </p>
            </div>
          ) : (
            <>
              {searchKeyword && (
                <p className="text-sm text-white/50 mb-4">
                  搜索 "{searchKeyword}"，找到 {filteredProfiles.length} 个结果
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProfiles.map(profile => (
                  <FdeCard key={profile.user_id} profile={profile} isAdmin={user.role === 'admin'} onDelete={handleDeleteProfile} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
