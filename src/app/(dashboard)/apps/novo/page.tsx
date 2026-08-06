import AppForm from "@/components/apps/AppForm";

import { getProducts } from "@/services/product.service";

export default async function NovoAppPage() {
  const products = await getProducts();

  return (
    <>
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Novo Aplicativo
        </h1>

        <p className="text-muted-foreground mt-2">
          Cadastre um novo aplicativo da plataforma.
        </p>

      </div>

      <AppForm products={products} />

    </>
  );
}
