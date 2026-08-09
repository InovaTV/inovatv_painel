import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import BannersTable from "@/components/banners/BannersTable";
import AppsSearch from "@/components/apps/AppsSearch";
import AppsPagination from "@/components/apps/AppsPagination";

import { getBanners } from "@/services/banner.service";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function BannersPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const { banners, total, pageSize, page: currentPage } = await getBanners({
    q,
    page: page ? Number(page) : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Banners
          </h1>

          <p className="text-muted-foreground mt-2">
            Gerencie os banners de marketing da plataforma.
          </p>
        </div>

        <Link href="/banners/novo">
          <Button>
            Novo Banner
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>
            Lista de Banners
          </CardTitle>

          <AppsSearch />
        </CardHeader>

        <CardContent>
          <BannersTable banners={banners} q={q} />

          <AppsPagination
            page={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </>
  );
}
