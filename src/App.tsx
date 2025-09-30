import { useState, useEffect } from 'react';
import { Anchor } from 'lucide-react';
import Dashboard from './components/Dashboard';
import HazardReporting from './components/HazardReporting';
import HazardMap from './components/HazardMap';
import SocialAnalytics from './components/SocialAnalytics';
import UserManagement from './components/UserManagement';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useAuth } from './hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  const isDemoMode = !supabase;

  useEffect(() => {
    if (!isDemoMode && !user && !loading) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [user, loading, isDemoMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-teal-400 font-medium">Loading OceanGuard...</p>
        </div>
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-teal-500/20 p-4 rounded-full">
                <Anchor className="h-12 w-12 text-teal-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('appName')}
            </h1>
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              {t('tagline')}
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
            >
              {t('getStarted')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'reporting':
        return <HazardReporting />;
      case 'map':
        return <HazardMap />;
      case 'analytics':
        return <SocialAnalytics />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {isDemoMode && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm">
          Demo Mode: Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable full functionality.
        </div>
      )}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={user?.role || 'citizen'}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;