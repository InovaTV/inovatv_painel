import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Props {
  active: boolean;
}

export default function StatusBadge({
  active,
}: Props) {
  if (active) {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white flex w-fit items-center gap-1">

        <CheckCircle2 className="h-3.5 w-3.5" />

        Ativo

      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className="flex w-fit items-center gap-1"
    >

      <XCircle className="h-3.5 w-3.5" />

      Inativo

    </Badge>
  );
}