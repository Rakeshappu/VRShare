
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { FormField } from '../../../components/auth/FormField';
import { GoogleLoginButton } from '../../../components/auth/GoogleLoginButton';

interface LoginFormProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, onForgotPassword }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        
        // Handle different user states
        if (!result.user.isEmailVerified) {
          navigate('/verify-email', { 
            state: { 
              email: formData.email,
              message: 'Please verify your email to continue'
            }
          });
          return;
        }
        
        if (result.user.role === 'admin' && !result.user.isAdminVerified) {
          navigate('/admin-approval-pending');
          return;
        }
        
        // Navigate based on role
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'faculty':
            navigate('/faculty/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          icon={<Mail className="h-5 w-5" />}
          placeholder="Enter your email"
          required
        />

        <div className="relative">
          <FormField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            icon={<Lock className="h-5 w-5" />}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </>
          )}
        </button>

        <GoogleLoginButton onClick={() => {}} />

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
          </span>
          <button
            type="button"
            onClick={onToggleForm}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign up
          </button>
        </div>
      </form>
    </motion.div>
  );
};
