import { notFound } from "next/navigation";

import BannerForm from "@/components/banners/BannerForm";

import { getBanner } from "@/services/banner.service";
import { getAllApps } from "@/services/app.service";
import { storage } from "@/lib/storage/provider";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarBannerPage({ params }: Props) {
  const { id } = await params;

  const banner = await getBanner(id).catch(() => null);

  if (!banner) {
    notFound();
  }

  const [apps, imageStat] = await Promise.all([
    getAllApps(),
    banner.image_path ? storage.stat(banner.image_path) : Promise.resolve(null),
  ]);

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
        imageStat={imageStat}
        imageUrl={banner.image_path ? storage.getPublicUrl(banner.image_path) : null}
      />

    </>
  );
}
