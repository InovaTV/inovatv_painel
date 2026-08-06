import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import PlatformBadge from "@/components/common/PlatformBadge";
import ActionsMenu from "@/components/common/ActionsMenu";
import StatusBadge from "./StatusBadge";

import type { App } from "@/services/app.service";

interface Props {
  app: App;
}

export default function AppsTableRow({
  app,
}: Props) {
  return (
    <TableRow>

      <TableCell className="font-medium">
        {app.name}
      </TableCell>

      <TableCell>
        <PlatformBadge
          platform={app.platform}
        />
      </TableCell>

      <TableCell className="font-medium">
        v{app.version}
      </TableCell>

      <TableCell>
        <StatusBadge
          active={app.is_active}
        />
      </TableCell>

      <TableCell>
        {app.display_order}
      </TableCell>

      <TableCell className="text-right">

        <ActionsMenu
          id={app.id}
        />

      </TableCell>

    </TableRow>
  );
}