import StatCard from "./StatCard";

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mt-8">

      <StatCard
        title="Apps"
        value={2}
      />

      <StatCard
        title="Banners"
        value={0}
      />

      <StatCard
        title="Novidades"
        value={0}
      />

      <StatCard
        title="Tutoriais"
        value={0}
      />

      <StatCard
        title="FAQ"
        value={0}
      />

    </div>
  );
}