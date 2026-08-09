"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import StatusBadge from "./StatusBadge";

interface Props {
  active: boolean;
  onToggle: (value: boolean) => Promise<void>;
  errorMessage: string;
}

export default function StatusToggle({
  active,
  onToggle,
  errorMessage,
}: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(active);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    setChecked(value);

    startTransition(async () => {
      try {
        await onToggle(value);
        router.refresh();
      } catch {
        setChecked(!value);
        window.alert(errorMessage);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">

      <Switch
        checked={checked}
        disabled={isPending}
        onCheckedChange={handleChange}
      />

      <StatusBadge
        active={checked}
      />

    </div>
  );
}
