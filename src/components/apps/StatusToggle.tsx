"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import StatusBadge from "./StatusBadge";

import { toggleAppStatusAction } from "@/app/(dashboard)/apps/actions";

interface Props {
  id: string;
  active: boolean;
}

export default function StatusToggle({
  id,
  active,
}: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(active);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    setChecked(value);

    startTransition(async () => {
      try {
        await toggleAppStatusAction(id, value);
        router.refresh();
      } catch {
        setChecked(!value);
        window.alert("Não foi possível atualizar o status. Tente novamente.");
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
