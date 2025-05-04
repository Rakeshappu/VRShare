
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { FormField } from '../../../components/auth/FormField';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Share2, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful');
      // Login redirects are handled by the AuthProvider
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Share2 className="h-10 w-10 text-indigo-600" />
            <span className="ml-2 text-3xl font-bold text-indigo-600">VersatileShare</span>
          </motion.div>
          
          <h2 className="text-2xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </motion.div>

        {error && (
          <motion.div 
            variants={itemVariants}
            className="rounded-md bg-red-50 p-4"
          >
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </motion.div>
        )}

        <motion.form 
          variants={itemVariants} 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
        >
          <div className="rounded-md shadow-sm space-y-4">
            <motion.div variants={itemVariants}>
              <FormField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="absolute right-3 inset-y-0 flex items-center">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  Sign in
                </>
              )}
            </button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex justify-between items-center pt-2"
          >
            <Link 
              to="/auth/role"
              className="flex items-center font-medium text-gray-600 hover:text-gray-500 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Role Selection</span>
            </Link>
            
            <Link 
              to="/auth/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors text-sm"
            >
              Create an account
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};
