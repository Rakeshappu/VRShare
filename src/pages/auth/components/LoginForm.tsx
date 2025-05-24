
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FormField } from '../../../components/auth/FormField';
import { GoogleLoginButton } from '../../../components/auth/GoogleLoginButton';
import { authService } from '../../../services/auth.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, onForgotPassword }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success && response.user) {
        console.log('Login successful, user role:', response.user.role);
        toast.success('Login successful!');
        
        // Navigate based on role
        switch (response.user.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'faculty':
            navigate('/faculty/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">RS</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to access your resources</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          icon={<Mail className="h-5 w-5" />}
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <div className="relative">
          <FormField
            icon={<Lock className="h-5 w-5" />}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </motion.button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <GoogleLoginButton />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggleForm}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};
