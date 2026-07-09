import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  title: string;
  value: string;
  note?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, note, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
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
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
      </CardContent>
    </Card>
  );
}