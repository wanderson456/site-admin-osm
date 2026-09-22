"use client";

import Link from "next/link";
import {
  Trophy,
  Users,
  Shuffle,
  ArrowLeftRight,
  Search,
  BarChart3,
  History,
  Settings,
  Home as HomeIcon,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: HomeIcon, href: "/" },
  { name: "Campeonatos", icon: Trophy, href: "/campeonatos" },
  { name: "Managers", icon: Users, href: "/managers" },
  { name: "Sorteio de Times", icon: Shuffle, href: "/sorteio" },
  { name: "Transferências", icon: ArrowLeftRight, href: "/transferencias" },
  { name: "Scout", icon: Search, href: "/scout" },
  { name: "Ranking", icon: BarChart3, href: "/ranking" },
  { name: "Histórico", icon: History, href: "/historico" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#171b1e] md:flex">

      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div>
          <h1 className="text-xl font-bold">
            OSM <span className="text-emerald-400">BAD BOYS</span>
          </h1>

          <p className="text-xs text-gray-500">
            Administração
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Principal
        </p>

        <div className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </div>

      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/configuracoes"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <Settings size={19} />
          Configurações
        </Link>
      </div>

    </aside>
  );
}