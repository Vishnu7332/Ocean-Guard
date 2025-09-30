import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('users')}</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg text-center">
        <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          User Management
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          User management features available for officials and analysts
        </p>
      </div>
    </div>
  );
}
