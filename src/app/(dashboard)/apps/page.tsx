import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AppsTable from "@/components/apps/AppsTable";

import { getApps } from "@/services/app.service";

export default async function AppsPage() {
  const apps = await getApps();

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
        <CardHeader>
          <CardTitle>
            Lista de Aplicativos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <AppsTable apps={apps} />
        </CardContent>
      </Card>
    </>
  );
}