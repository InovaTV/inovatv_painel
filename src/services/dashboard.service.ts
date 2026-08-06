import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
          I
        </div>

        <div>
          <h1 className="text-xl font-bold leading-none">
            InovaTV Painel
          </h1>

          <p className="text-sm text-muted-foreground">
            Administração Central
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary">
          Online
        </Badge>

        <div className="text-right">
          <div className="font-medium">
            José Antônio
          </div>

          <div className="text-xs text-muted-foreground">
            Administrador
          </div>
        </div>
      </div>
    </header>
  );
}