import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface Props {
  title:    string;
  value:    string;
  note?:    string;
  tooltip?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, note, tooltip, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32 mb-2" />
          {note !== undefined && <Skeleton className="h-4 w-20" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    size={13}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help transition-colors"
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs text-xs leading-relaxed"
                >
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {note && (
          <p className="text-xs text-muted-foreground mt-1">{note}</p>
        )}
      </CardContent>
    </Card>
  );
}