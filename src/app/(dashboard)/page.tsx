import DashboardCards from "@/components/dashboard/DashboardCards";

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-3xl font-bold">
        Dashboard
      </h2>

      <p className="text-muted-foreground mt-2">
        Bem-vindo ao Painel Administrativo da InovaTV.
      </p>

      <DashboardCards />
    </>
  );
}
