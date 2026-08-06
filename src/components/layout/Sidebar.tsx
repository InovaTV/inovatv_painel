const menu = [
  "Dashboard",
  "Apps",
  "Banners",
  "Novidades",
  "Tutoriais",
  "FAQ",
  "Clientes",
  "Configurações",
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        background: "#1e293b",
        color: "#fff",
        padding: 20,
      }}
    >
      {menu.map((item) => (
        <div
          key={item}
          style={{
            padding: "14px 10px",
            borderRadius: 8,
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          {item}
        </div>
      ))}
    </aside>
  );
}