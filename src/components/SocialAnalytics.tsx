import { useState, useEffect } from 'react';
import { TrendingUp, MessageCircle, BarChart } from 'lucide-react';
import { supabase, SocialAnalytics as Analytics } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function SocialAnalytics() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<Analytics[]>([]);

  useEffect(() => {
    if (!supabase) return;

    fetchAnalytics();

    const subscription = supabase
      .channel('social_analytics_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_analytics' }, () => {
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAnalytics = async () => {
    if (!supabase) return;

    const { data } = await supabase
      .from('social_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setAnalytics(data as Analytics[]);
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.5) return 'text-green-600 dark:text-green-400';
    if (score >= 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 0.5) return 'Positive';
    if (score >= 0) return 'Neutral';
    return 'Negative';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('analytics')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-lg">
              <MessageCircle className="h-6 w-6 text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('socialMentions')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.reduce((sum, a) => sum + a.mention_count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('trendingTopics')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('sentimentAnalysis')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.length > 0 
                  ? (analytics.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / analytics.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('trendingTopics')}</h2>
        
        {analytics.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No social analytics data available
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.keyword}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Mentions</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.mention_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sentiment</p>
                    <p className={`text-lg font-bold ${getSentimentColor(item.sentiment_score || 0)}`}>
                      {getSentimentLabel(item.sentiment_score || 0)}
                    </p>
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
