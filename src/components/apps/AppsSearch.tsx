"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

// Debounce (300ms) antes de refletir na URL — evita um replace() de router
// a cada tecla digitada, que dispararia uma nova busca no servidor a cada
// caractere.
const DEBOUNCE_MS = 300;

export default function AppsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }

      // Volta pra primeira página — o resultado filtrado pode ter menos
      // páginas do que a página atual, deixando a lista vazia sem isso.
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);
    }, DEBOUNCE_MS);
  }

  return (
    <div className="relative w-full max-w-xs">

      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />

      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar por nome..."
        className="pl-9"
      />

    </div>
  );
}
