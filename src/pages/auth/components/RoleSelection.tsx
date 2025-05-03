import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../../../types/auth';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole: UserRole | null;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect, selectedRole }) => {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const roles: { id: UserRole; title: string; description: string }[] = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access study materials, assignments, and track your academic progress.',
    },
    {
      id: 'faculty',
      title: 'Faculty',
      description: 'Upload resources, manage courses, and interact with students.',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg">
            <span><img src="/uploads/cropped.png" alt="logo" className="h-16 w-16"/></span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Choose Your Role</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select the role that best describes you
        </p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRole === role.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            onClick={() => onRoleSelect(role.id)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border ${
                  selectedRole === role.id
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300 dark:border-gray-600'
                } flex items-center justify-center mr-3`}
              >
                {selectedRole === role.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">{role.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {role.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
