"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
}

export default function AppsPagination({
  page,
  totalPages,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams);

    if (next <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(next));
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-end gap-3 pt-4">

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground tabular-nums">
        Página {page} de {totalPages}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

    </div>
  );
}
