import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserTable } from "@/components/user-table";
import { UserForm } from "@/components/user-form";
import { User } from "@shared/schema";

export default function UserManagementPage() {
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

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
    <DashboardLayout title="User Management">
      <UserTable
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
      />
      
      {/* User Form Modal */}
      <UserForm
        open={userFormOpen}
        onClose={handleCloseUserForm}
        user={selectedUser}
      />
    </DashboardLayout>
  );
}
