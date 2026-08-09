"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface OrderedItem {
  id: string;
  display_order: number;
}

interface Props {
  current: OrderedItem;
  prev: OrderedItem | null;
  next: OrderedItem | null;
  onSwap: (a: OrderedItem, b: OrderedItem) => Promise<void>;
  errorMessage: string;
}

export default function OrderControls({
  current,
  prev,
  next,
  onSwap,
  errorMessage,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMove(neighbor: OrderedItem | null) {
    if (!neighbor) return;

    startTransition(async () => {
      try {
        await onSwap(current, neighbor);
        router.refresh();
      } catch {
        window.alert(errorMessage);
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
