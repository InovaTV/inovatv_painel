"use client";

import {
  Bell,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signOutAction } from "@/lib/actions/auth";
import { useSidebar } from "./SidebarProvider";

interface Props {
  email: string;
}

export default function Header({ email }: Props) {
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-card border-b px-6 flex items-center justify-between">

      <div className="flex items-center gap-4">

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 md:hidden"
          onClick={toggle}
        >
          <Menu />
        </Button>

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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />

          <Input
            className="pl-9 w-72"
            placeholder="Pesquisar..."
          />

        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative h-10 w-10"
        >

          <Bell />

          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>

        </Button>

        <Badge
          variant="secondary"
          className="h-7 bg-success/10 text-success"
        >

          <span className="size-1.5 rounded-full bg-success animate-pulse" />

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
          <Button
            type="submit"
            variant="outline"
            size="icon"
            title="Sair"
            className="h-10 w-10"
          >
            <LogOut />
          </Button>
        </form>

      </div>

    </header>
  );
}
