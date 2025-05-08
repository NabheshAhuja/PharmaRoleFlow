import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema, User, UserRole, UserStatus } from "@shared/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { IndiaLocationService } from "@/lib/india-location-service";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: User;
}

// Create a schema for the user form
const userFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    // Only validate confirm password if password is provided
    if (data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type UserFormData = z.infer<typeof userFormSchema>;

export function UserForm({ open, onClose, user }: UserFormProps) {
  const { toast } = useToast();
  const isEditing = !!user;
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [region, setRegion] = useState<string>("");
  
  // India location state
  const [states, setStates] = useState<{id: string, name: string}[]>([]);
  const [cities, setCities] = useState<{id: string, name: string, state_id: string}[]>([]);
  const [selectedState, setSelectedState] = useState<string>(user?.state || "");
  const [selectedCity, setSelectedCity] = useState<string>(user?.city || "");
  const [loading, setLoading] = useState({
    states: false,
    cities: false
  });

  // Get organizations
  const { data: orgsData } = useQuery({
    queryKey: ["/api/organizations"],
    enabled: open,
  });

  useEffect(() => {
    if (orgsData) {
      setOrganizations(orgsData || []);
    }
  }, [orgsData]);

  // Initialize form with default values or user data
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          ...user,
          password: "", // Don't include password when editing
          confirmPassword: "",
        }
      : {
          username: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          email: "",
          role: UserRole.MEDICAL_REPRESENTATIVE,
          status: UserStatus.ACTIVE,
          organizationId: null,
          region: "",
          managerId: null,
        },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        ...user,
        password: "", // Don't include password when editing
        confirmPassword: "",
      });
      setRegion(user.region || "");
      setSelectedState(user.state || "");
      setSelectedCity(user.city || "");
    } else {
      form.reset({
        username: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        email: "",
        role: UserRole.MEDICAL_REPRESENTATIVE,
        status: UserStatus.ACTIVE,
        organizationId: null,
        region: "",
        managerId: null,
      });
      setRegion("");
      setSelectedState("");
      setSelectedCity("");
    }
  }, [user, form]);
  
  // Fetch Indian states when form opens
  useEffect(() => {
    if (open) {
      const fetchStates = async () => {
        setLoading(prev => ({ ...prev, states: true }));
        try {
          const statesData = await IndiaLocationService.getAllStates();
          setStates(statesData);
        } catch (error) {
          console.error("Error fetching states:", error);
          toast({
            title: "Error",
            description: "Failed to load states. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(prev => ({ ...prev, states: false }));
        }
      };
      
      fetchStates();
    }
  }, [open, toast]);
  
  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState) {
      const fetchCities = async () => {
        setLoading(prev => ({ ...prev, cities: true }));
        try {
          const citiesData = await IndiaLocationService.getCitiesByState(selectedState);
          setCities(citiesData);
        } catch (error) {
          console.error("Error fetching cities:", error);
          toast({
            title: "Error",
            description: "Failed to load cities. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(prev => ({ ...prev, cities: false }));
        }
      };
      
      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedState, toast]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const { confirmPassword, ...userData } = data;
      
      // Create the final data object with proper types
      const finalUserData: any = { ...userData };
      
      // Add location data
      if (region) {
        finalUserData.region = region;
      }
      if (selectedState) {
        finalUserData.state = selectedState;
      }
      if (selectedCity) {
        finalUserData.city = selectedCity;
      }
      
      const res = await apiRequest("POST", "/api/users", finalUserData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (!user) return null;
      
      const { confirmPassword, ...userData } = data;
      
      // Create the final data object with proper types
      const finalUserData: any = { ...userData };
      
      // Only include password if provided (handle with type safety)
      if (data.password) {
        finalUserData.password = data.password;
      }
      
      // Add location data
      if (region) {
        finalUserData.region = region;
      }
      if (selectedState) {
        finalUserData.state = selectedState;
      }
      if (selectedCity) {
        finalUserData.city = selectedCity;
      }
      
      const res = await apiRequest("PUT", `/api/users/${user.id}`, finalUserData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user's information."
              : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                        <SelectItem value={UserRole.BUSINESS_UNIT_HEAD}>Business Unit Head</SelectItem>
                        <SelectItem value={UserRole.REGIONAL_SALES_MANAGER}>Regional Sales Manager</SelectItem>
                        <SelectItem value={UserRole.AREA_SALES_MANAGER}>Area Sales Manager</SelectItem>
                        <SelectItem value={UserRole.MEDICAL_REPRESENTATIVE}>Medical Representative</SelectItem>
                        <SelectItem value={UserRole.DISTRIBUTOR_HEAD}>Distributor Head</SelectItem>
                        <SelectItem value={UserRole.DISTRIBUTOR_EXECUTIVE}>Distributor Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Region/Territory</FormLabel>
                <Input
                  placeholder="Enter region or territory"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only applicable for RSM, ASM, and MR roles
                </p>
              </FormItem>
            </div>
            
            {/* India location fields */}
            <div className="border rounded-md p-4 bg-slate-50">
              <h3 className="text-md font-medium mb-3">India Location Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={setSelectedState}
                    defaultValue={selectedState}
                    value={selectedState}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading.states ? (
                        <SelectItem value="loading" disabled>
                          Loading states...
                        </SelectItem>
                      ) : (
                        states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={setSelectedCity}
                    defaultValue={selectedCity}
                    value={selectedCity}
                    disabled={!selectedState || loading.cities}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedState ? "Select state first" : "Select city"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loading.cities ? (
                        <SelectItem value="loading" disabled>
                          Loading cities...
                        </SelectItem>
                      ) : (
                        cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>
              
              {/* Address and Pincode */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <FormLabel>Address</FormLabel>
                  <Input 
                    placeholder="Enter address" 
                    value={user?.address || ""} 
                    onChange={(e) => form.setValue("address" as any, e.target.value)}
                  />
                </div>
                
                <div>
                  <FormLabel>Pincode</FormLabel>
                  <Input 
                    placeholder="Enter pincode" 
                    value={user?.pincode || ""} 
                    onChange={(e) => form.setValue("pincode" as any, e.target.value)}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                      value={field.value}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={UserStatus.ACTIVE} />
                        </FormControl>
                        <FormLabel className="font-normal">Active</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={UserStatus.INACTIVE} />
                        </FormControl>
                        <FormLabel className="font-normal">Inactive</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={UserStatus.PENDING} />
                        </FormControl>
                        <FormLabel className="font-normal">Pending</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  isEditing ? "Update User" : "Save User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
