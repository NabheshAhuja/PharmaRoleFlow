import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  change?: number;
  changePeriod?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  change,
  changePeriod = "Since last month",
}: StatsCardProps) {
  return (
    <Card className="shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mr-4",
              iconBgColor
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-semibold text-slate-800">{value}</p>
          </div>
        </div>
        
        {typeof change !== 'undefined' && (
          <div className="mt-4 flex items-center text-xs">
            <span
              className={cn(
                "flex items-center",
                change >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              <ArrowUp
                className={cn(
                  "mr-1 h-3 w-3",
                  change < 0 && "transform rotate-180"
                )}
              />
              {Math.abs(change)}%
            </span>
            <span className="text-slate-500 ml-2">{changePeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
