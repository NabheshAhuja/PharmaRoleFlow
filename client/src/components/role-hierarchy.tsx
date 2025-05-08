import { Card, CardContent } from "@/components/ui/card";

export function RoleHierarchy() {
  return (
    <Card className="shadow-sm border border-slate-200 mb-6">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Organization Role Hierarchy</h2>
        <p className="text-sm text-slate-500 mt-1">Visual representation of user roles and their relationships</p>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-800 mb-4">Pharma Company Structure</h3>
            <div className="relative max-w-md">
              {/* Role hierarchy diagram */}
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg flex flex-col items-center">
                <div className="w-full">
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-2 bg-primary-100 border border-primary-300 rounded-md text-primary-800 text-sm font-medium">
                      Business Unit Head
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-primary-300 mx-auto"></div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-2 bg-primary-100 border border-primary-300 rounded-md text-primary-800 text-sm font-medium">
                      Regional Sales Manager
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-primary-300 mx-auto"></div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-2 bg-primary-100 border border-primary-300 rounded-md text-primary-800 text-sm font-medium">
                      Area Sales Manager
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-primary-300 mx-auto"></div>
                  
                  <div className="flex justify-center">
                    <div className="px-4 py-2 bg-primary-100 border border-primary-300 rounded-md text-primary-800 text-sm font-medium">
                      Medical Representative
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-800 mb-4">Distributor Structure</h3>
            <div className="relative max-w-md">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center">
                <div className="w-full">
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded-md text-amber-800 text-sm font-medium">
                      Distributor Head
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-amber-300 mx-auto"></div>
                  
                  <div className="flex justify-center">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded-md text-amber-800 text-sm font-medium">
                      Distributor Executive
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-800 mb-4">System Administration</h3>
            <div className="relative max-w-md">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col items-center">
                <div className="w-full">
                  <div className="flex justify-center">
                    <div className="px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-md text-indigo-800 text-sm font-medium">
                      Super Admin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
