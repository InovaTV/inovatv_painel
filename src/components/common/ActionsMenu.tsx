"use client";

import { useRouter } from "next/navigation";

import {
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { deleteAppAction } from "@/app/(dashboard)/apps/actions";

interface Props {
  id: string;
}

export default function ActionsMenu({
  id,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Excluir este aplicativo? Esta ação não pode ser desfeita."
    );

    if (!confirmed) {
      return;
    }

    await deleteAppAction(id);

    router.refresh();
  }

  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">

        <DropdownMenuItem
          disabled
          title="Edição ainda não implementada"
        >

          <Pencil className="mr-2 h-4 w-4" />

          Editar

        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600"
          onClick={handleDelete}
        >

          <Trash2 className="mr-2 h-4 w-4" />

          Excluir

        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>
  );
}
