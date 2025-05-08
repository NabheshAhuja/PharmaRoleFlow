import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Settings,
  ShieldCheck,
  FileText,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ isMobileSidebarOpen, setMobileSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [initials, setInitials] = useState("--");

  useEffect(() => {
    if (user?.fullName) {
      const nameParts = user.fullName.split(" ");
      if (nameParts.length > 1) {
        setInitials(`${nameParts[0][0]}${nameParts[1][0]}`);
      } else if (nameParts.length === 1) {
        setInitials(`${nameParts[0][0]}${nameParts[0][1] || ""}`);
      }
    }
  }, [user?.fullName]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeMobileSidebar = () => {
    if (setMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", current: location === "/" },
    { icon: Users, label: "User Management", href: "/users", current: location === "/users" },
    { icon: Building2, label: "Companies", href: "/companies", current: location === "/companies" },
    { icon: Store, label: "Distributors", href: "/distributors", current: location === "/distributors" },
    { icon: Settings, label: "Settings", href: "/settings", current: location === "/settings" }
  ];

  const adminLinks = [
    { icon: ShieldCheck, label: "Roles & Permissions", href: "/roles", current: location === "/roles" },
    { icon: FileText, label: "Audit Logs", href: "/audit", current: location === "/audit" },
    { icon: Database, label: "System Status", href: "/system", current: location === "/system" }
  ];

  const sidebarClass = cn(
    "bg-white w-64 h-full border-r border-slate-200 fixed inset-y-0 left-0 z-20 flex flex-col",
    "transition-transform duration-300 ease-in-out transform",
    {
      "-translate-x-full md:translate-x-0": !isMobileSidebarOpen
    }
  );

  return (
    <aside className={sidebarClass}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground text-lg font-bold">P</span>
          </div>
          <span className="text-xl font-semibold text-slate-800">PharmaDist</span>
        </div>
      </div>
      
      {/* User info */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary font-medium">{initials}</span>
          </div>
          <div>
            <p className="font-medium text-sm text-slate-800">{user?.fullName || "User"}</p>
            <p className="text-xs text-slate-500">{user?.role.replace(/_/g, " ") || "Role"}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-4">
          <ul className="space-y-1 px-3">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md font-medium",
                    link.current 
                      ? "bg-primary-50 text-primary border-l-2 border-primary" 
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  <link.icon className={cn("mr-2 h-4 w-4", link.current ? "text-primary" : "text-slate-500")} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {user?.role === "SUPER_ADMIN" && (
            <>
              <div className="pt-4 mt-4 px-3">
                <span className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Administration
                </span>
                <ul className="mt-1 space-y-1">
                  {adminLinks.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        onClick={closeMobileSidebar}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md font-medium",
                          link.current 
                            ? "bg-primary-50 text-primary border-l-2 border-primary" 
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        )}
                      >
                        <link.icon className={cn("mr-2 h-4 w-4", link.current ? "text-primary" : "text-slate-500")} />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </nav>
      </ScrollArea>
      
      {/* Logout button */}
      <div className="p-4 border-t border-slate-200">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}
