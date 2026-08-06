import {
  Table,
  TableBody,
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

        {apps.map((app) => (
          <AppsTableRow
            key={app.id}
            app={app}
          />
        ))}

      </TableBody>

    </Table>
  );
}