import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: number;
  userId: number;
  action: string;
  description: string;
  timestamp: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
  };
}

export function ActivityLog() {
  // Fetch activities
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities?limit=4"],
  });

  // Get appropriate icon for activity type
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "REGISTER":
      case "CREATE_USER":
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          </div>
        );
      case "UPDATE_USER":
        return (
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </div>
        );
      case "DELETE_USER":
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="10.9" x2="7.1" y1="10.9" y2="7.1" stroke="currentColor" strokeWidth="2" />
              <line x1="10.9" x2="7.1" y1="7.1" y2="10.9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        );
      case "LOGIN":
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          </div>
        );
      case "LOGOUT":
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-600"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </div>
        );
      case "CREATE_ORGANIZATION":
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
              <path d="M8 6h.01" />
              <path d="M16 6h.01" />
              <path d="M12 6h.01" />
              <path d="M12 10h.01" />
              <path d="M12 14h.01" />
              <path d="M16 10h.01" />
              <path d="M16 14h.01" />
              <path d="M8 10h.01" />
              <path d="M8 14h.01" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        );
    }
  };

  // Format time since activity
  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const highlightUsernames = (description: string) => {
    // A simple approach to highlight usernames in the description
    const parts = description.split(/(User \w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("User ")) {
        return (
          <span key={index} className="text-primary-700">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card className="shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
          <Button variant="link" className="text-primary-700 text-sm font-medium hover:text-primary-800">
            View All
          </Button>
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activities && activities.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {activities.map((activity) => (
              <li key={activity.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-start">
                  {getActivityIcon(activity.action)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">
                        {highlightUsernames(activity.description)}
                      </p>
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {formatTimeSince(activity.timestamp)}
                      </span>
                    </div>
                    {activity.user && (
                      <p className="text-xs text-slate-500 mt-1">
                        By <span className="font-medium">{activity.user.fullName}</span>
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-10 text-center text-slate-500">No recent activity</div>
        )}
      </div>
    </Card>
  );
}
