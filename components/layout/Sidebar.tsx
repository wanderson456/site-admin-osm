"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Shuffle,
  ArrowLeftRight,
  Search,
} from "lucide-react";

const menu = [
  { name: "Campeonatos", icon: Trophy, href: "/campeonatos" },
  { name: "Sorteio de Times", icon: Shuffle, href: "/sorteio" },
  { name: "Transferências", icon: ArrowLeftRight, href: "/transferencias" },
  { name: "Olheiro", icon: Search, href: "/scout" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* 1. SIDEBAR PARA DESKTOP (Exibida apenas em telas md:) */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#171b1e] md:flex">
        <nav className="flex-1 p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Principal
          </p>

          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* 2. NAVEGAÇÃO INFERIOR PARA MOBILE (Oculta em telas md:) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#171b1e]/95 p-2 backdrop-blur-lg md:hidden">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition ${
                isActive
                  ? "text-emerald-400 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}