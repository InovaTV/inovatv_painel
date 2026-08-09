import BannerForm from "@/components/banners/BannerForm";

import { getAllApps } from "@/services/app.service";

export default async function NovoBannerPage() {
  const apps = await getAllApps();

  return (
    <>
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Novo Banner
        </h1>

        <p className="text-muted-foreground mt-2">
          Cadastre um novo banner de marketing.
        </p>

      </div>

      <BannerForm apps={apps} />

    </>
  );
}
