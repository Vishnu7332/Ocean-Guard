import { useState, useEffect } from 'react';
import { Camera, MapPin, Send, Loader } from 'lucide-react';
import { supabase, HazardType, HazardSeverity } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function HazardReporting() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  
  const [formData, setFormData] = useState({
    hazardType: '' as HazardType | '',
    severity: '' as HazardSeverity | '',
    description: '',
    mediaFile: null as File | null,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          fetchLocationName(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results?.[0]) {
        setLocationName(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !user) return;

    setLoading(true);
    try {
      let mediaUrl = '';

      if (!supabase) {
        alert('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        return;
      }

      if (formData.mediaFile) {
        const fileExt = formData.mediaFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('hazard-media')
          .upload(fileName, formData.mediaFile);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('hazard-media')
            .getPublicUrl(uploadData.path);
          mediaUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from('hazard_reports').insert({
        user_id: user.id,
        hazard_type: formData.hazardType,
        severity: formData.severity,
        latitude: location.lat,
        longitude: location.lng,
        description: formData.description,
        location_name: locationName,
        media_url: mediaUrl || null,
        status: 'pending',
      });

      if (!error) {
        alert(t('reportSuccess'));
        setFormData({
          hazardType: '',
          severity: '',
          description: '',
          mediaFile: null,
        });
      }
    } catch (error: any) {
      alert(t('reportError'));
      console.error('Report submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hazardTypes: { value: HazardType; label: string }[] = [
    { value: 'tsunami', label: t('tsunami') },
    { value: 'storm_surge', label: t('stormSurge') },
    { value: 'high_waves', label: t('highWaves') },
    { value: 'coastal_flooding', label: t('coastalFlooding') },
    { value: 'cyclone', label: t('cyclone') },
    { value: 'erosion', label: t('erosion') },
  ];

  const severityLevels: { value: HazardSeverity; label: string }[] = [
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') },
    { value: 'critical', label: t('critical') },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {t('reportHazard')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {t('locationName')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {location ? locationName || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : t('locationAccess')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('hazardType')}
            </label>
            <select
              value={formData.hazardType}
              onChange={(e) => setFormData({ ...formData, hazardType: e.target.value as HazardType })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="">{t('selectHazardType')}</option>
              {hazardTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('severity')}
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as HazardSeverity })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="">{t('selectSeverity')}</option>
              {severityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={4}
              placeholder={t('describeHazard')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('uploadPhoto')}
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
              <Camera className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {formData.mediaFile ? formData.mediaFile.name : t('takePhoto')}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFormData({ ...formData, mediaFile: e.target.files?.[0] || null })}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !location}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                {t('submit')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
