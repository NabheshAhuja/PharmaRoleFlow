import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/stats-card";
import { RoleHierarchy } from "@/components/role-hierarchy";
import { ActivityLog } from "@/components/activity-log";
import { UserTable } from "@/components/user-table";
import { UserForm } from "@/components/user-form";
import { Users, Building2, Store, UserCheck, Loader2 } from "lucide-react";
import { User } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormOpen(true);
  };

  const handleCloseUserForm = () => {
    setUserFormOpen(false);
    setSelectedUser(undefined);
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsLoading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              iconColor="text-primary"
              iconBgColor="bg-primary-100"
              change={12}
            />
            <StatsCard
              title="Pharma Companies"
              value={stats?.pharmaCompanies || 0}
              icon={Building2}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
              change={5}
            />
            <StatsCard
              title="Distributors"
              value={stats?.distributors || 0}
              icon={Store}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
              change={8}
            />
            <StatsCard
              title="Active MRs"
              value={stats?.activeMRs || 0}
              icon={UserCheck}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              change={15}
            />
          </>
        )}
      </div>

      {/* User management section */}
      <UserTable
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
      />

      {/* Role hierarchy visualization */}
      <RoleHierarchy />

      {/* Recent activity */}
      <ActivityLog />

      {/* User Form Modal */}
      <UserForm
        open={userFormOpen}
        onClose={handleCloseUserForm}
        user={selectedUser}
      />
    </DashboardLayout>
  );
}
