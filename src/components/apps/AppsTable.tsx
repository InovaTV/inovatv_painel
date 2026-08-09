import Link from "next/link";

import { SearchX, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AppsTableRow from "./AppsTableRow";

import type { App } from "@/services/app.service";

interface AppsTableProps {
  apps: App[];
  q?: string;
}

export default function AppsTable({
  apps,
  q,
}: AppsTableProps) {
  return (
    <Table>

      <TableHeader>

        <TableRow>

          <TableHead>
            Nome
          </TableHead>

          <TableHead>
            Plataforma
          </TableHead>

          <TableHead>
            Versão
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Ordem
          </TableHead>

          <TableHead className="text-right">
            Ações
          </TableHead>

        </TableRow>

      </TableHeader>

      <TableBody>

        {apps.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="p-0">
              {q ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <SearchX className="size-10 text-muted-foreground" />

                  <p className="font-medium">
                    Nenhum resultado para a busca
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Tente buscar por outro nome.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Smartphone className="size-10 text-muted-foreground" />

                  <p className="font-medium">
                    Nenhum aplicativo ainda
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Cadastre o primeiro aplicativo da plataforma.
                  </p>

                  <Button asChild className="mt-2">
                    <Link href="/apps/novo">
                      Novo Aplicativo
                    </Link>
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ) : (
          apps.map((app, index) => (
            <AppsTableRow
              key={app.id}
              app={app}
              prev={apps[index - 1] ?? null}
              next={apps[index + 1] ?? null}
            />
          ))
        )}

      </TableBody>

    </Table>
  );
}