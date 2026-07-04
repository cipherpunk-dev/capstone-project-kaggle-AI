import React from 'react';
import { Search, Bell, LogOut, User } from 'lucide-react';

export function Header() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Force reload to clear states
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background-elevated border-b border-border-primary sticky top-0 z-10">
      
      {/* Left / Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-tertiary" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border-primary rounded-lg leading-5 bg-background-tertiary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary sm:text-sm transition-all"
            placeholder="Search across your workspace (Press '/')"
          />
        </div>
      </div>

      {/* Right / Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full ring-2 ring-background-elevated"></span>
        </button>

        <div className="w-px h-6 bg-border-primary mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary leading-tight">Admin User</p>
            <p className="text-xs text-text-tertiary leading-tight">Admin</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
