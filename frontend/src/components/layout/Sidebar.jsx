import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Activity, BookOpen, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Overview', href: '/admin-dashboard', icon: LayoutDashboard },
  { name: 'Sessions', href: '/admin-dashboard/sessions', icon: Activity },
  { name: 'Projects', href: '/admin-dashboard/projects', icon: BookOpen },
  { name: 'Targets', href: '/admin-dashboard/targets', icon: Target },
];

export function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside 
      className={cn(
        "flex flex-col bg-background-elevated border-r border-border-primary transition-all duration-300 ease-in-out relative z-20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-center border-b border-border-primary">
        <div className="flex items-center gap-2 px-3 w-full">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
             <Activity className="w-6 h-6 text-accent-primary" />
          </div>
          {!collapsed && <span className="font-bold text-xl text-text-primary whitespace-nowrap overflow-hidden">Defender</span>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden px-3">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group relative",
                isActive 
                  ? "bg-accent-primary/10 text-accent-primary before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-2/3 before:bg-accent-primary before:rounded-r-md" 
                  : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
              )
            }
            title={collapsed ? item.name : undefined}
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", !collapsed && "mr-1")} />
            {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-border-primary flex flex-col gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg bg-background-tertiary hover:bg-border-primary text-text-secondary transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
