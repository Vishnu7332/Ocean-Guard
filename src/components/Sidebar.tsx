import { X, LayoutDashboard, MapPin, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
}

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange, userRole }: SidebarProps) {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard'), roles: ['citizen', 'official', 'analyst'] },
    { id: 'reporting', icon: AlertTriangle, label: t('reportHazard'), roles: ['citizen', 'official', 'analyst'] },
    { id: 'map', icon: MapPin, label: t('map'), roles: ['citizen', 'official', 'analyst'] },
    { id: 'analytics', icon: BarChart3, label: t('analytics'), roles: ['official', 'analyst'] },
    { id: 'users', icon: Users, label: t('users'), roles: ['official', 'analyst'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-teal-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
