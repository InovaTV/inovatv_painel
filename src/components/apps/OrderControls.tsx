"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

import { swapAppOrderAction } from "@/app/(dashboard)/apps/actions";

import type { OrderedApp } from "@/services/app.service";

interface Props {
  current: OrderedApp;
  prev: OrderedApp | null;
  next: OrderedApp | null;
}

export default function OrderControls({
  current,
  prev,
  next,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMove(neighbor: OrderedApp | null) {
    if (!neighbor) return;

    startTransition(async () => {
      try {
        await swapAppOrderAction(current, neighbor);
        router.refresh();
      } catch {
        window.alert("Não foi possível reordenar. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={!prev || isPending}
        onClick={() => handleMove(prev)}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <span className="w-4 text-center text-sm tabular-nums">
        {current.display_order}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={!next || isPending}
        onClick={() => handleMove(next)}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>

    </div>
  );
}
