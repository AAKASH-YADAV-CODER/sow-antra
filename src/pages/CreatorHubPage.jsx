import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Store, ArrowRight } from 'lucide-react';

const CreatorHubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-purple-500">Creator Access Enabled</p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">Welcome to Creator Hub</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Your account is approved. Publish designs for admin review and grow your template catalog.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <button
              onClick={() => navigate('/creators/dashboard')}
              className="text-left p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 transition-all"
            >
              <LayoutDashboard className="text-purple-600" size={20} />
              <h2 className="mt-3 text-sm font-black text-gray-900">Creator Dashboard</h2>
              <p className="mt-1 text-xs font-medium text-gray-500">Track submissions and approval status.</p>
            </button>

            <button
              onClick={() => window.open('/main?isCreatorMode=true', '_blank')}
              className="text-left p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 transition-all"
            >
              <UploadCloud className="text-purple-600" size={20} />
              <h2 className="mt-3 text-sm font-black text-gray-900">Create & Publish</h2>
              <p className="mt-1 text-xs font-medium text-gray-500">Design and send templates for admin approval.</p>
            </button>

            <button
              onClick={() => navigate('/creators')}
              className="text-left p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 transition-all"
            >
              <Store className="text-purple-600" size={20} />
              <h2 className="mt-3 text-sm font-black text-gray-900">Marketplace</h2>
              <p className="mt-1 text-xs font-medium text-gray-500">View approved templates and discover trends.</p>
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/creators/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black transition-colors"
            >
              Open Creator Workspace
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorHubPage;
