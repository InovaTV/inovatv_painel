import Link from "next/link";

import { Image as ImageIcon, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import BannersTableRow from "./BannersTableRow";

import type { Banner } from "@/services/banner.service";

interface BannersTableProps {
  banners: Banner[];
  q?: string;
}

export default function BannersTable({
  banners,
  q,
}: BannersTableProps) {
  return (
    <Table>

      <TableHeader>

        <TableRow>

          <TableHead>
            Título
          </TableHead>

          <TableHead>
            Categoria
          </TableHead>

          <TableHead>
            Ação
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

        {banners.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="p-0">
              {q ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <SearchX className="size-10 text-muted-foreground" />

                  <p className="font-medium">
                    Nenhum resultado para a busca
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Tente buscar por outro título.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <ImageIcon className="size-10 text-muted-foreground" />

                  <p className="font-medium">
                    Nenhum banner ainda
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Cadastre o primeiro banner de marketing.
                  </p>

                  <Button asChild className="mt-2">
                    <Link href="/banners/novo">
                      Novo Banner
                    </Link>
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ) : (
          banners.map((banner, index) => (
            <BannersTableRow
              key={banner.id}
              banner={banner}
              prev={banners[index - 1] ?? null}
              next={banners[index + 1] ?? null}
            />
          ))
        )}

      </TableBody>

    </Table>
  );
}
