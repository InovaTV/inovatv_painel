"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Download,
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
  downloadHref?: string;
}

export default function ActionsMenu({
  id,
  downloadHref,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Excluir este aplicativo? Esta ação não pode ser desfeita."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAppAction(id);
      router.refresh();
    } catch {
      window.alert("Não foi possível excluir o aplicativo. Tente novamente.");
    }
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

        <DropdownMenuItem asChild>

          <Link href={`/apps/${id}/editar`}>

            <Pencil className="mr-2 h-4 w-4" />

            Editar

          </Link>

        </DropdownMenuItem>

        {downloadHref && (

          <DropdownMenuItem asChild>

            <a href={downloadHref}>

              <Download className="mr-2 h-4 w-4" />

              Baixar APK

            </a>

          </DropdownMenuItem>

        )}

        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDelete}
        >

          <Trash2 className="mr-2 h-4 w-4" />

          Excluir

        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>
  );
}
