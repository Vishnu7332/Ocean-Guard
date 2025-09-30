import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white">
        <Globe className="h-4 w-4" />
        <span className="text-sm">{languages.find(l => l.code === i18n.language)?.name || 'English'}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-40 bg-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === lang.code ? 'bg-slate-600 text-teal-400' : 'text-white'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
