import Link from "next/link";
import { LayoutDashboard, Car, Users, Receipt } from "lucide-react";

export function AdminSidebar() {
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Frota", href: "/frota", icon: Car },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Financeiro", href: "/financeiro", icon: Receipt },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 space-y-4">
      <div className="text-xl font-bold text-gray-900 mb-8 pl-2">Admin Panel</div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
