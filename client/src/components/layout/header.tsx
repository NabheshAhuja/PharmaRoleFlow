import { Bell, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  setMobileSidebarOpen: (open: boolean) => void;
}

export function Header({ title, setMobileSidebarOpen }: HeaderProps) {
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

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-4 text-slate-500 hover:text-primary"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>
      
      {/* Header actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 text-sm font-medium text-slate-700 hover:text-primary">
              <span>{user?.fullName?.split(' ')[0] || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-primary-100 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs text-slate-500">{user?.email}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
