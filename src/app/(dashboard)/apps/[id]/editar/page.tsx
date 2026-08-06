import { notFound } from "next/navigation";

import AppForm from "@/components/apps/AppForm";

import { getApp } from "@/services/app.service";
import { getProducts } from "@/services/product.service";
import { storage } from "@/lib/storage/provider";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarAppPage({ params }: Props) {
  const { id } = await params;

  const app = await getApp(id).catch(() => null);

  if (!app) {
    notFound();
  }

  const [products, apkStat] = await Promise.all([
    getProducts(),
    app.storage_path ? storage.stat(app.storage_path) : Promise.resolve(null),
  ]);

  return (
    <>
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Editar Aplicativo
        </h1>

        <p className="text-muted-foreground mt-2">
          Atualize as informações de &quot;{app.name}&quot;.
        </p>

      </div>

      <AppForm app={app} products={products} apkStat={apkStat} />

    </>
  );
}
