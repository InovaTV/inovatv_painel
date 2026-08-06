import AppForm from "@/components/apps/AppForm";

export default function NovoAppPage() {
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

      <AppForm />

    </>
  );
}