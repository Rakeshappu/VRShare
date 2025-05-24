
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <AnimatedLogo className="mx-auto h-16 w-16 mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            EduVault
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your Digital Learning Companion
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          {showForgotPassword ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your email to receive reset instructions
              </p>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Back to login
              </button>
            </div>
          ) : isLogin ? (
            <LoginForm 
              onToggleForm={toggleForm}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <SignupForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
