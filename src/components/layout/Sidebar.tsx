import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import {
  LayoutDashboard,
  Users,
  File,
  Settings,
  LogOut,
  Book,
  GraduationCap,
  User,
  Bell,
  HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Notification } from '../../types/auth';
import { formatDistanceToNow } from 'date-fns';

interface NavLink {
  path: string;
  icon: React.ReactNode;
  label: string;
}

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: notifications, isLoading: notificationsLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications(),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to load notifications');
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const studentLinks: NavLink[] = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/study-materials', icon: <Book size={20} />, label: 'Study Materials' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
    { path: '/help', icon: <HelpCircle size={20} />, label: 'Help' },
  ];

  const facultyLinks: NavLink[] = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/resources', icon: <File size={20} />, label: 'Resources' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
    { path: '/help', icon: <HelpCircle size={20} />, label: 'Help' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/eligible-usns', icon: <GraduationCap size={20} />, label: 'Eligible USNs' },
    { path: '/admin/resources', icon: <File size={20} />, label: 'Resources' },
  ];

  const getLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'student':
        return studentLinks;
      case 'faculty':
        return facultyLinks;
      case 'admin':
        return adminLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex flex-col h-screen w-64 bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <span className="text-lg font-semibold">VersatileShare</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4">
        <ul>
          {links.map((link) => (
            <li key={link.path} className="mb-2">
              <Button
                variant="ghost"
                className={`w-full justify-start ${location.pathname === link.path ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                onClick={() => navigate(link.path)}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu onOpenChange={(open) => open ? setIsDropdownOpen(true) : setIsDropdownOpen(false)}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center w-full justify-between">
              <div className="flex items-center">
                {user?.avatar ? (
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Skeleton className="w-8 h-8 mr-2 rounded-full" />
                )}
                <span className="text-sm font-medium">{user?.fullName || 'Loading...'}</span>
              </div>
              <Settings size={16} className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
