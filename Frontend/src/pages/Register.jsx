import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, CheckCircle, Laptop, Cpu, Wifi, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as Yup from 'yup';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .required('Name is required'),
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must not exceed 50 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    terms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
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

    // Validate field if it has been touched
    if (touched[name]) {
      await validateField(name, value);
    }

    // Also validate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
      try {
        await validationSchema.validateAt('confirmPassword', { 
          password: value, 
          confirmPassword: formData.confirmPassword 
        });
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: error.message
        }));
      }
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
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true
    });

    try {
      // Validate entire form
      const validationData = {
        ...formData,
        terms: agreedToTerms
      };
      
      await validationSchema.validate(validationData, { abortEarly: false });
      
      // Clear errors if validation passes
      setErrors({});
      
      // Proceed with registration
      setLoading(true);
      await register(formData.name, formData.email, formData.password);
    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Registration error
        console.error('Registration error:', error);
        setErrors({ submit: error.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength++;
    if (formData.password.length >= 12) strength++;
    
    // Character variety checks
    if (formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/)) strength++;
    if (formData.password.match(/[0-9]/)) strength++;
    if (formData.password.match(/[^a-zA-Z0-9]/)) strength++;
    
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = () => {
    const strength = passwordStrength();
    switch(strength) {
      case 0: return 'Very weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-400';
    return 'bg-blue-500';
  };

  const features = [
    'Access to expert computer repair services',
    'Browse and purchase latest technology',
    'Track your service requests and orders',
    '24/7 technical support and consultation'
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
          <Wifi className="absolute bottom-60 left-1/3 w-8 h-8 animate-pulse" style={{animationDelay: '3s'}} />
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
                Join Sri Lanka's
                <span className="block text-blue-100">leading tech platform</span>
              </h1>
              <p className="text-xl text-blue-50 leading-relaxed">
                Connect with thousands of satisfied customers who trust IMAX for their computer and technology needs across Sri Lanka.
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

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-blue-400/30">
              <div className="grid grid-cols-2 gap-4 text-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15,000+</div>
                  <div className="text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm">Service Locations</div>
                </div>
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

      {/* Right Side - Register Form */}
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
                Join IMAX
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Create your account and access professional computer services
              </p>
            </div>

            {/* Display general submit error */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start">
                <div className="flex-shrink-0 mr-2 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                </div>
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedInput === 'name' ? 'text-blue-600' : errors.name && touched.name ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={handleBlur}
                  className={`block w-full pl-12 pr-4 py-3 sm:py-4 border-2 ${
                    errors.name && touched.name 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                      : focusedInput === 'name' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50/30 to-blue-50/30 focus:border-blue-600' 
                        : 'border-slate-200 bg-gradient-to-r from-slate-50/50 to-slate-50/30 hover:border-slate-300 focus:border-blue-500'
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200`}
                  placeholder="Enter your full name"
                />
                <label htmlFor="name" className={`absolute -top-2.5 left-10 px-2 bg-white text-xs font-semibold ${
                  focusedInput === 'name' ? 'text-blue-600' : errors.name && touched.name ? 'text-red-500' : 'text-slate-600'
                } transition-colors duration-200`}>
                  Full Name
                </label>
                {errors.name && touched.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

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
                  autoComplete="new-password"
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
                  placeholder="Create a strong password"
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
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength()
                              ? getPasswordStrengthColor()
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${
                      passwordStrength() <= 1 ? 'text-red-500' : 
                      passwordStrength() === 2 ? 'text-yellow-600' : 
                      'text-blue-600'
                    }`}>
                      Password strength: {getPasswordStrengthText()}
                    </p>
                  </div>
                )}
                
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-start">
                    <svg className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span>{errors.password}</span>
                  </p>
                )}

                {/* Password Requirements Info */}
                {focusedInput === 'password' && !errors.password && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700 font-semibold mb-2">Password requirements:</p>
                    <ul className="text-xs space-y-1">
                      <li className={`flex items-center ${formData.password.length >= 8 ? 'text-blue-600' : 'text-slate-500'}`}>
                        <CheckCircle className={`w-3 h-3 mr-2 ${formData.password.length >= 8 ? 'text-blue-500' : 'text-slate-300'}`} />
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-blue-600' : 'text-slate-500'}`}>
                        <CheckCircle className={`w-3 h-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-blue-500' : 'text-slate-300'}`} />
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-blue-600' : 'text-slate-500'}`}>
                        <CheckCircle className={`w-3 h-3 mr-2 ${/[a-z]/.test(formData.password) ? 'text-blue-500' : 'text-slate-300'}`} />
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-blue-600' : 'text-slate-500'}`}>
                        <CheckCircle className={`w-3 h-3 mr-2 ${/\d/.test(formData.password) ? 'text-blue-500' : 'text-slate-300'}`} />
                        One number
                      </li>
                      <li className={`flex items-center ${/[@$!%*?&]/.test(formData.password) ? 'text-blue-600' : 'text-slate-500'}`}>
                        <CheckCircle className={`w-3 h-3 mr-2 ${/[@$!%*?&]/.test(formData.password) ? 'text-blue-500' : 'text-slate-300'}`} />
                        One special character (@$!%*?&)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedInput === 'confirmPassword' ? 'text-blue-600' : errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-slate-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={handleBlur}
                  className={`block w-full pl-12 pr-12 py-3 sm:py-4 border-2 ${
                    errors.confirmPassword && touched.confirmPassword 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                      : focusedInput === 'confirmPassword' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50/30 to-blue-50/30 focus:border-blue-600' 
                        : 'border-slate-200 bg-gradient-to-r from-slate-50/50 to-slate-50/30 hover:border-slate-300 focus:border-blue-500'
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200`}
                  placeholder="Confirm your password"
                />
                <label htmlFor="confirmPassword" className={`absolute -top-2.5 left-10 px-2 bg-white text-xs font-semibold ${
                  focusedInput === 'confirmPassword' ? 'text-blue-600' : errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-slate-600'
                } transition-colors duration-200`}>
                  Confirm Password
                </label>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
                {/* Password Match Indicator */}
                {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-2 text-sm text-blue-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Passwords match perfectly
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="pt-2">
                <div className="flex items-start">
                  <div className="relative">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked && errors.terms) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.terms;
                            return newErrors;
                          });
                        }
                      }}
                      className={`h-5 w-5 mt-0.5 ${
                        errors.terms && touched.terms ? 'border-red-500 text-red-500' : 'text-blue-600'
                      } focus:ring-blue-500 border-slate-300 rounded-md transition-colors duration-200`}
                    />
                  </div>
                  <label htmlFor="terms" className="ml-3 block text-sm text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-blue-600/30 hover:decoration-blue-700 transition-colors duration-200">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-blue-600/30 hover:decoration-blue-700 transition-colors duration-200">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.terms && touched.terms && (
                  <p className="mt-2 text-sm text-red-600 flex items-center ml-8">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {errors.terms}
                  </p>
                )}
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
                    Creating your account...
                  </>
                ) : (
                  <>
                    Join IMAX Community
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

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;