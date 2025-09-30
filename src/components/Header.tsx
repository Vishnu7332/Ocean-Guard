import { Menu, Anchor, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
  user: any;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white hover:text-teal-400 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <Anchor className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{t('tagline')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.email || user?.phone || 'User'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || 'citizen'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            title={t('logout')}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
