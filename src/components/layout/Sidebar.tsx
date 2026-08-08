"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Smartphone,
  Image,
  Newspaper,
  BookOpen,
  CircleHelp,
  Users,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

const menu = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Apps",
    href: "/apps",
    icon: Smartphone,
  },
  {
    title: "Banners",
    href: "/banners",
    icon: Image,
  },
  {
    title: "Novidades",
    href: "/novidades",
    icon: Newspaper,
  },
  {
    title: "Tutoriais",
    href: "/tutoriais",
    icon: BookOpen,
  },
  {
    title: "FAQ",
    href: "/faq",
    icon: CircleHelp,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >

        <div className="h-20 flex items-center justify-center border-b border-sidebar-border">

          <div className="text-center">

            <div className="text-2xl font-bold text-sidebar-primary-foreground">
              InovaTV
            </div>

            <div className="text-xs text-sidebar-foreground/55">
              Painel Administrativo
            </div>

          </div>

        </div>

        <nav className="flex-1 px-4 py-6">

          <div className="text-xs uppercase text-sidebar-foreground/55 mb-4 tracking-widest">
            Navegação
          </div>

          <div className="space-y-2">

            {menu.map((item) => {

              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (

                <Link
                  key={item.title}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-l-2 px-4 py-3 transition",
                    isActive
                      ? "border-l-primary bg-sidebar-accent"
                      : "border-l-transparent hover:bg-sidebar-accent"
                  )}
                >

                  <Icon className="size-5" />

                  <span>
                    {item.title}
                  </span>

                </Link>

              );

            })}

          </div>

        </nav>

        <div className="border-t border-sidebar-border p-5">

          <div className="text-sm text-sidebar-foreground/75">

            InovaTV Platform

          </div>

          <div className="text-xs text-sidebar-foreground/40 mt-1">

            Versão 1.0.0

          </div>

        </div>

      </aside>
    </>
  );
}
