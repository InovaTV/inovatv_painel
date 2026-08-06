import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import DashboardCards from "@/components/dashboard/DashboardCards";

export default function Home() {
  return (
    <>
      <Header />

      <div className="flex bg-slate-100 min-h-[calc(100vh-64px)]">
        <Sidebar />

        <main className="flex-1 p-8">

          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="text-muted-foreground mt-2">
            Bem-vindo ao Painel Administrativo da InovaTV.
          </p>

          <DashboardCards />

        </main>

      </div>
    </>
  );
}