import { LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  value: number | string;
  icon: LucideIcon;
};

export default function StatCard({ title, value, icon: Icon }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>

        <CardAction>
          <Icon className="size-5 text-muted-foreground" />
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="text-4xl font-bold tabular-nums">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}