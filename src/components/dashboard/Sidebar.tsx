import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Sparkles, label: 'AI Insights', path: '/insights' },
];

export function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r border-border bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Prioritize</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                isActive
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150",
              isActive
                ? "bg-primary/5 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2"
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150",
            collapsed ? "justify-center px-2" : "justify-start gap-3 px-3 py-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </Button>

        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
}
