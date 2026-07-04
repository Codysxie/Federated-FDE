import { Building2 } from 'lucide-react';

export default function EnterpriseResources() {
  return (
    <div className="bg-slate-900 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center justify-center text-white/40">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
          <Building2 className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
        </div>
        <p className="text-lg">暂无企业资源</p>
      </div>
    </div>
  );
}
