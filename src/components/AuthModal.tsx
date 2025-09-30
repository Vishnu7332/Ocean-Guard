import { useState } from 'react';
import { X, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const { loginWithEmail, loginWithPhone, verifyOtp, registerWithEmail } = useAuth();

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        onSuccess();
      } else {
        await registerWithEmail(email, password);
        setError('Check your email for verification link');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!showOtpInput) {
        await loginWithPhone(phone);
        setShowOtpInput(true);
        setError('OTP sent to your phone');
      } else {
        await verifyOtp(phone, otp);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? t('login') : t('register')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              authMethod === 'email' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Mail className="h-4 w-4" />
            {t('email')}
          </button>
          <button
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              authMethod === 'phone' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Phone className="h-4 w-4" />
            {t('phone')}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {authMethod === 'email' ? (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? t('loading') : isLogin ? t('signIn') : t('signUp')}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  placeholder="+91 98765 43210"
                  required
                  disabled={showOtpInput}
                />
              </div>
            </div>

            {showOtpInput && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  placeholder="123456"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? t('loading') : showOtpInput ? 'Verify OTP' : 'Send OTP'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? (
            <>
              {t('dontHaveAccount')}{' '}
              <button onClick={() => setIsLogin(false)} className="text-teal-400 hover:text-teal-300">
                {t('registerHere')}
              </button>
            </>
          ) : (
            <>
              {t('alreadyHaveAccount')}{' '}
              <button onClick={() => setIsLogin(true)} className="text-teal-400 hover:text-teal-300">
                {t('loginHere')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
