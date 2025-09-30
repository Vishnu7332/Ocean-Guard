import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase, HazardReport } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    critical: 0,
  });

  useEffect(() => {
    if (!supabase) return;
    
    fetchReports();
    fetchStats();

    const subscription = supabase
      .channel('dashboard_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hazard_reports' }, () => {
        fetchReports();
        fetchStats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchReports = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('hazard_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setReports(data as HazardReport[]);
  };

  const fetchStats = async () => {
    if (!supabase) return;
    const { count: total } = await supabase
      .from('hazard_reports')
      .select('*', { count: 'exact', head: true });

    const { count: pending } = await supabase
      .from('hazard_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: verified } = await supabase
      .from('hazard_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified');

    const { count: critical } = await supabase
      .from('hazard_reports')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical');

    setStats({
      total: total || 0,
      pending: pending || 0,
      verified: verified || 0,
      critical: critical || 0,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('totalReports')}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('activeAlerts')}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.pending}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Verified</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.verified}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Critical</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.critical}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('recentReports')}</h2>
        
        {reports.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">{t('noReports')}</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                      {report.hazard_type.replace('_', ' ')}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{report.location_name}</span>
                    <span>{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
