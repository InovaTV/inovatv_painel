import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import PlatformBadge from "@/components/common/PlatformBadge";
import ActionsMenu from "@/components/common/ActionsMenu";
import StatusToggle from "./StatusToggle";
import OrderControls from "./OrderControls";

import { deleteAppAction, swapAppOrderAction, toggleAppStatusAction } from "@/app/(dashboard)/apps/actions";

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

      <TableCell className="font-medium tabular-nums">
        v{app.version}
      </TableCell>

      <TableCell>
        <StatusToggle
          active={app.is_active}
          onToggle={toggleAppStatusAction.bind(null, app.id)}
          errorMessage="Não foi possível atualizar o status. Tente novamente."
        />
      </TableCell>

      <TableCell>
        <OrderControls
          current={{ id: app.id, display_order: app.display_order }}
          prev={prev}
          next={next}
          onSwap={swapAppOrderAction}
          errorMessage="Não foi possível reordenar. Tente novamente."
        />
      </TableCell>

      <TableCell className="text-right">

        <ActionsMenu
          editHref={`/apps/${app.id}/editar`}
          onDelete={deleteAppAction.bind(null, app.id)}
          deleteConfirmMessage="Excluir este aplicativo? Esta ação não pode ser desfeita."
          deleteErrorMessage="Não foi possível excluir o aplicativo. Tente novamente."
          downloadHref={app.storage_path ? `/api/apps/${app.id}/download` : undefined}
        />

      </TableCell>

    </TableRow>
  );
}