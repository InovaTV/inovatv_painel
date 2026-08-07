import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import PlatformBadge from "@/components/common/PlatformBadge";
import ActionsMenu from "@/components/common/ActionsMenu";
import StatusToggle from "./StatusToggle";
import OrderControls from "./OrderControls";

import type { App, OrderedApp } from "@/services/app.service";

interface Props {
  app: App;
  prev: OrderedApp | null;
  next: OrderedApp | null;
}

export default function AppsTableRow({
  app,
  prev,
  next,
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
        <StatusToggle
          id={app.id}
          active={app.is_active}
        />
      </TableCell>

      <TableCell>
        <OrderControls
          current={{ id: app.id, display_order: app.display_order }}
          prev={prev}
          next={next}
        />
      </TableCell>

      <TableCell className="text-right">

        <ActionsMenu
          id={app.id}
          downloadHref={app.storage_path ? `/api/apps/${app.id}/download` : undefined}
        />

      </TableCell>

    </TableRow>
  );
}