import { notFound } from "next/navigation";

import BannerForm from "@/components/banners/BannerForm";

import { getBanner } from "@/services/banner.service";
import { getAllApps } from "@/services/app.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarBannerPage({ params }: Props) {
  const { id } = await params;

  const banner = await getBanner(id).catch(() => null);

  if (!banner) {
    notFound();
  }

  const apps = await getAllApps();

  return (
    <>
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Editar Banner
        </h1>

        <p className="text-muted-foreground mt-2">
          Atualize as informações de &quot;{banner.title}&quot;.
        </p>

      </div>

      <BannerForm
        banner={banner}
        apps={apps}
      />

    </>
  );
}
