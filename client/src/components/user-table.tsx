import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, UserStatus } from "@shared/schema";
import { Eye, Pencil, Trash2, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { UserForm } from "./user-form";
import { Loader2 } from "lucide-react";

interface UserTableProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

export function UserTable({ onCreateUser, onEditUser }: UserTableProps) {
  const { toast } = useToast();
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [orgFilter, setOrgFilter] = useState("All Companies");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Fetch users
  const { data: users, isLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/users"],
  });
  
  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ["/api/organizations"],
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Filter users
  const filteredUsers = users
    ? users.filter((user) => {
        // Role filter
        if (roleFilter !== "All Roles" && user.role !== roleFilter) {
          return false;
        }
        
        // Organization filter
        if (
          orgFilter !== "All Companies" &&
          user.organizationId !== parseInt(orgFilter)
        ) {
          return false;
        }
        
        // Status filter
        if (
          statusFilter !== "Status: All" &&
          user.status !== statusFilter.replace("Status: ", "").toUpperCase()
        ) {
          return false;
        }
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            user.fullName?.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
    : [];

  // Pagination
  const totalPages = Math.ceil((filteredUsers?.length || 0) / usersPerPage);
  const currentUsers = filteredUsers?.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    } else if (nameParts.length === 1) {
      return `${nameParts[0][0]}${nameParts[0][1] || ""}`;
    }
    return "U";
  };

  // Get organization name
  const getOrganizationName = (orgId: number | null) => {
    if (!orgId) return "N/A";
    const org = organizations?.find((o) => o.id === orgId);
    return org?.name || "Unknown";
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "bg-green-100";
    let textColor = "text-green-800";
    let dotColor = "bg-green-600";
    
    if (status === "INACTIVE") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      dotColor = "bg-red-600";
    } else if (status === "PENDING") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      dotColor = "bg-yellow-600";
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dotColor}`}></span>
        {status === "ACTIVE" ? "Active" : status === "INACTIVE" ? "Inactive" : "Pending"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200 mb-6">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">User Management</h2>
          <Button onClick={onCreateUser}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-user-plus mr-1 h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            Add New User
          </Button>
        </div>
        
        {/* Filters and search */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select onValueChange={setRoleFilter} value={roleFilter}>
              <SelectTrigger className="bg-slate-50 border border-slate-300 h-9 w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Roles">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="BUSINESS_UNIT_HEAD">Business Unit Head</SelectItem>
                <SelectItem value="REGIONAL_SALES_MANAGER">Regional Sales Manager</SelectItem>
                <SelectItem value="AREA_SALES_MANAGER">Area Sales Manager</SelectItem>
                <SelectItem value="MEDICAL_REPRESENTATIVE">Medical Representative</SelectItem>
                <SelectItem value="DISTRIBUTOR_HEAD">Distributor Head</SelectItem>
                <SelectItem value="DISTRIBUTOR_EXECUTIVE">Distributor Executive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={setOrgFilter} value={orgFilter}>
              <SelectTrigger className="bg-slate-50 border border-slate-300 h-9 w-[150px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Companies">All Companies</SelectItem>
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="bg-slate-50 border border-slate-300 h-9 w-[150px]">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Status: All">Status: All</SelectItem>
                <SelectItem value="Status: ACTIVE">Active</SelectItem>
                <SelectItem value="Status: INACTIVE">Inactive</SelectItem>
                <SelectItem value="Status: PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-700 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* User table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>User</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Role</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Organization</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Status</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {currentUsers && currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary">
                          {getUserInitials(user.fullName || user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-800">{user.fullName}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700">
                      {user.role.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {user.region || "Global"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700">
                      {getOrganizationName(user.organizationId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-600 hover:text-primary-800 h-8 w-8"
                        onClick={() => onEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-600 hover:text-slate-800 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-800 h-8 w-8"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No users found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing <span className="font-medium">{filteredUsers.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0}</span> to{" "}
          <span className="font-medium">
            {Math.min(currentPage * usersPerPage, filteredUsers.length)}
          </span>{" "}
          of <span className="font-medium">{filteredUsers.length}</span> users
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
            <ChevronDown className="h-4 w-4 ml-1 -rotate-90" />
          </Button>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteUserId !== null) {
                  deleteUserMutation.mutate(deleteUserId);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
