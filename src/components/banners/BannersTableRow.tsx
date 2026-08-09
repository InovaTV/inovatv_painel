import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import ActionsMenu from "@/components/common/ActionsMenu";
import StatusToggle from "@/components/apps/StatusToggle";
import OrderControls from "@/components/apps/OrderControls";

import {
  deleteBannerAction,
  swapBannerOrderAction,
  toggleBannerStatusAction,
} from "@/app/(dashboard)/banners/actions";

import {
  BANNER_CATEGORY_LABELS,
  BANNER_ACTION_TYPE_LABELS,
  type Banner,
  type OrderedBanner,
} from "@/services/banner.service";

interface Props {
  banner: Banner;
  prev: OrderedBanner | null;
  next: OrderedBanner | null;
}

export default function BannersTableRow({
  banner,
  prev,
  next,
}: Props) {
  return (
    <TableRow>

      <TableCell className="font-medium">
        {banner.title}
      </TableCell>

      <TableCell>
        <Badge variant="outline">
          {BANNER_CATEGORY_LABELS[banner.category]}
        </Badge>
      </TableCell>

      <TableCell className="text-muted-foreground">
        {BANNER_ACTION_TYPE_LABELS[banner.action_type]}
        {banner.action_target && (
          <span className="text-muted-foreground"> · {banner.action_target}</span>
        )}
      </TableCell>

      <TableCell>
        <StatusToggle
          active={banner.is_active}
          onToggle={toggleBannerStatusAction.bind(null, banner.id)}
          errorMessage="Não foi possível atualizar o status. Tente novamente."
        />
      </TableCell>

      <TableCell>
        <OrderControls
          current={{ id: banner.id, display_order: banner.display_order }}
          prev={prev}
          next={next}
          onSwap={swapBannerOrderAction}
          errorMessage="Não foi possível reordenar. Tente novamente."
        />
      </TableCell>

      <TableCell className="text-right">

        <ActionsMenu
          editHref={`/banners/${banner.id}/editar`}
          onDelete={deleteBannerAction.bind(null, banner.id)}
          deleteConfirmMessage="Excluir este banner? Esta ação não pode ser desfeita."
          deleteErrorMessage="Não foi possível excluir o banner. Tente novamente."
        />

      </TableCell>

    </TableRow>
  );
}
