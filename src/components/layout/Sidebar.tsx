import Link from "next/link";

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
  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground flex flex-col">

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

            return (

              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-sidebar-accent transition"
              >

                <Icon size={18} />

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
  );
}