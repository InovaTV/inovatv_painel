import { Badge } from "@/components/ui/badge";
import {
  MonitorSmartphone,
  Tv,
} from "lucide-react";

interface Props {
  platform: string;
}

export default function PlatformBadge({
  platform,
}: Props) {
  const isMobile = platform === "mobile";

  return (
    <Badge
      variant="outline"
      className="flex w-fit items-center gap-1"
    >
      {isMobile ? (
        <MonitorSmartphone className="h-3.5 w-3.5" />
      ) : (
        <Tv className="h-3.5 w-3.5" />
      )}

      {isMobile ? "Mobile" : "TV"}
    </Badge>
  );
}