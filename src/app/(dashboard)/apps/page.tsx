import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AppsTable from "@/components/apps/AppsTable";
import AppsSearch from "@/components/apps/AppsSearch";
import AppsPagination from "@/components/apps/AppsPagination";

import { getApps } from "@/services/app.service";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AppsPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const { apps, total, pageSize, page: currentPage } = await getApps({
    q,
    page: page ? Number(page) : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Aplicativos
          </h1>

          <p className="text-muted-foreground mt-2">
            Gerencie todos os aplicativos disponíveis.
          </p>
        </div>

        <Link href="/apps/novo">
          <Button>
            Novo Aplicativo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>
            Lista de Aplicativos
          </CardTitle>

          <AppsSearch />
        </CardHeader>

        <CardContent>
          <AppsTable apps={apps} q={q} />

          <AppsPagination
            page={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </>
  );
}