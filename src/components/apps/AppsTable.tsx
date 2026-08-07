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
}

export default function AppsTable({
  apps,
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
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground"
            >
              Nenhum aplicativo encontrado.
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