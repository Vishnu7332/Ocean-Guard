import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase, HazardReport } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 13.0827,
  lng: 80.2707,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function HazardMap() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    if (!supabase) return;

    fetchReports();

    const subscription = supabase
      .channel('hazard_map_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hazard_reports' }, () => {
        fetchReports();
      })
      .subscribe();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchReports = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('hazard_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data && !error) {
      setReports(data as HazardReport[]);
    }
  };

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-96 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <div className="text-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">
              Google Maps API key not configured
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('map')}</h2>
      
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          options={{
            styles: [
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#0e4c92' }],
              },
            ],
          }}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={{ lat: report.latitude, lng: report.longitude }}
              onClick={() => setSelectedReport(report)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: getMarkerColor(report.severity),
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            />
          ))}

          {selectedReport && (
            <InfoWindow
              position={{ lat: selectedReport.latitude, lng: selectedReport.longitude }}
              onCloseClick={() => setSelectedReport(null)}
            >
              <div className="p-2 max-w-sm">
                <h3 className="font-bold text-lg mb-2 capitalize">
                  {selectedReport.hazard_type.replace('_', ' ')}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{selectedReport.description}</p>
                <p className="text-sm">
                  <span className="font-medium">Severity:</span>{' '}
                  <span className={`capitalize ${
                    selectedReport.severity === 'critical' ? 'text-red-600' :
                    selectedReport.severity === 'high' ? 'text-orange-600' :
                    selectedReport.severity === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {selectedReport.severity}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
