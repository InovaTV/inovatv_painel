import {
  Bell,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { signOutAction } from "@/lib/actions/auth";

interface Props {
  email: string;
}

export default function Header({ email }: Props) {
  return (
    <header className="h-16 bg-card border-b px-6 flex items-center justify-between">

      <div className="flex items-center gap-4">

        <button className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition">
          <Menu size={20} />
        </button>

        <div>

          <h1 className="text-xl font-bold">
            InovaTV Painel
          </h1>

          <p className="text-xs text-muted-foreground">
            Administração Central
          </p>

        </div>

      </div>

      <div className="flex items-center gap-4">

        <div className="relative">

          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={16}
          />

          <input
            className="pl-9 pr-4 h-10 w-72 rounded-lg border outline-none focus:ring-2 focus:ring-ring"
            placeholder="Pesquisar..."
          />

        </div>

        <button className="relative h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent">

          <Bell size={18} />

          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>

        </button>

        <Badge
          variant="secondary"
          className="h-7"
        >
          Online
        </Badge>

        <div className="text-right">

          <div className="font-semibold">
            {email}
          </div>

          <div className="text-xs text-muted-foreground">
            Administrador
          </div>

        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            title="Sair"
            className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition"
          >
            <LogOut size={18} />
          </button>
        </form>

      </div>

    </header>
  );
}
