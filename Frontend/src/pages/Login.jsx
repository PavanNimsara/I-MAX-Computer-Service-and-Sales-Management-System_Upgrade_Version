import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, CheckCircle, AlertCircle, Laptop, Cpu, Settings, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as Yup from 'yup';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters')
      .required('Password is required')
  });

  const validateField = async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }

    // Validate field if it has been touched
    if (touched[name]) {
      await validateField(name, value);
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setFocusedInput('');
    await validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    try {
      // Validate entire form
      await validationSchema.validate(formData, { abortEarly: false });
      
      // Clear errors if validation passes
      setErrors({});
      
      // Proceed with login
      setLoading(true);
      await login(formData.email, formData.password, rememberMe);
    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Login error from API
        console.error('Login error:', error);
        setErrors({ 
          general: error.response?.data?.message || 'Invalid email or password. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Access your service dashboard',
    'Track computer repair requests',
    'Browse latest technology products',
    'Manage your IMAX service history'
  ];

  const stats = [
    { label: 'Happy Customers', value: '15K+', icon: Users },
    { label: 'Customer Rating', value: '4.9★', icon: Star },
    { label: 'Service Locations', value: '50+', icon: Monitor }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Tech Circuit Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" className="w-full h-full">
            <defs>
              <pattern id="circuit" patternUnits="userSpaceOnUse" width="100" height="100">
                <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="20" r="3" fill="currentColor"/>
                <circle cx="80" cy="20" r="3" fill="currentColor"/>
                <circle cx="80" cy="80" r="3" fill="currentColor"/>
                <circle cx="20" cy="80" r="3" fill="currentColor"/>
                <path d="M50,20 L50,80" stroke="currentColor" strokeWidth="1"/>
                <path d="M20,50 L80,50" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>

        {/* Floating Tech Elements */}
        <div className="absolute inset-0 opacity-15">
          <Monitor className="absolute top-20 left-20 w-16 h-16 animate-pulse" />
          <Laptop className="absolute bottom-40 right-16 w-12 h-12 animate-bounce" style={{animationDelay: '1s'}} />
          <Cpu className="absolute top-1/2 right-32 w-14 h-14 animate-pulse" style={{animationDelay: '2s'}} />
          <Settings className="absolute top-1/3 left-1/2 w-10 h-10 animate-spin" style={{animationDuration: '8s'}} />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center text-white mb-20 group">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mr-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-bold block">IMAX</span>
              <span className="text-blue-100 text-sm">Computer Solutions Sri Lanka</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Welcome back to
                <span className="block text-blue-100">your tech dashboard</span>
              </h1>
              <p className="text-xl text-blue-50 leading-relaxed">
                Sign in to access your IMAX account and manage your computer service requests across Sri Lanka.
              </p>
            </div>
            
            <div className="pt-8 space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-white group">
                  <div className="p-1.5 bg-blue-400 rounded-full mr-4 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="w-4 h-4 text-blue-800" />
                  </div>
                  <span className="text-blue-50">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="pt-8 border-t border-blue-400/30">
              <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between text-blue-100 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-blue-300" />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-blue-100">
          <p className="text-sm">
            © 2025 IMAX Computer Solutions. Your trusted technology partner.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center text-blue-600 group">
              <div className="p-2 bg-blue-100 rounded-xl mr-3 group-hover:bg-blue-200 transition-all duration-300">
                <Monitor className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold block">IMAX</span>
                <span className="text-blue-600 text-xs">Computer Solutions Sri Lanka</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 sm:p-8 lg:p-10 backdrop-blur-sm">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Welcome back!
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Sign in to access your IMAX dashboard
              </p>
            </div>

            {/* Display general error (e.g., invalid credentials) */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{errors.general}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Please check your credentials and try again.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedInput === 'email' ? 'text-blue-600' : errors.email && touched.email ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={handleBlur}
                  className={`block w-full pl-12 pr-4 py-3 sm:py-4 border-2 ${
                    errors.email && touched.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                      : focusedInput === 'email' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50/30 to-blue-50/30 focus:border-blue-600' 
                        : 'border-slate-200 bg-gradient-to-r from-slate-50/50 to-slate-50/30 hover:border-slate-300 focus:border-blue-500'
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200`}
                  placeholder="Enter your email address"
                />
                <label htmlFor="email" className={`absolute -top-2.5 left-10 px-2 bg-white text-xs font-semibold ${
                  focusedInput === 'email' ? 'text-blue-600' : errors.email && touched.email ? 'text-red-500' : 'text-slate-600'
                } transition-colors duration-200`}>
                  Email Address
                </label>
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {errors.email}
                  </p>
                )}
                {/* Email format hint */}
                {focusedInput === 'email' && !errors.email && formData.email && (
                  <p className="mt-2 text-xs text-slate-500 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 text-blue-500" />
                    Email format looks good
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedInput === 'password' ? 'text-blue-600' : errors.password && touched.password ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={handleBlur}
                  className={`block w-full pl-12 pr-12 py-3 sm:py-4 border-2 ${
                    errors.password && touched.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                      : focusedInput === 'password' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50/30 to-blue-50/30 focus:border-blue-600' 
                        : 'border-slate-200 bg-gradient-to-r from-slate-50/50 to-slate-50/30 hover:border-slate-300 focus:border-blue-500'
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200`}
                  placeholder="Enter your password"
                />
                <label htmlFor="password" className={`absolute -top-2.5 left-10 px-2 bg-white text-xs font-semibold ${
                  focusedInput === 'password' ? 'text-blue-600' : errors.password && touched.password ? 'text-red-500' : 'text-slate-600'
                } transition-colors duration-200`}>
                  Password
                </label>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-md transition-colors duration-200"
                    />
                  </div>
                  <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                    Remember me for 30 days
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline decoration-blue-600/30"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center py-3 sm:py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing you in...
                  </>
                ) : (
                  <>
                    Access Your Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 hover:shadow-md group"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="group-hover:text-slate-800 transition-colors duration-200">Google</span>
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 hover:shadow-md group"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="group-hover:text-slate-800 transition-colors duration-200">GitHub</span>
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-600">
                New to IMAX?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Join our community →
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-6 text-slate-500 text-xs">
              <div className="flex items-center space-x-1">
                <Monitor className="w-3 h-3" />
                <span>Trusted by 15K+ Customers</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Secure & Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;