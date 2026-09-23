
"use client";

import Link from "next/link";
import {
  Trophy,
  Shuffle,
  ArrowLeftRight,
  BarChart3,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Campeonatos",
    description:
      "Consulte os campeonatos disponíveis e acesse suas equipes e informações.",
    icon: Trophy,
    href: "/campeonatos",
  },
  {
    title: "Sorteio de Times",
    description:
      "Organize o sorteio das equipes para os participantes de forma simples e organizada.",
    icon: Shuffle,
    href: "/sorteio",
  },
  
  {
    title: "Transferências",
    description:
      "Acompanhe e organize as movimentações de jogadores entre as equipes.",
    icon: ArrowLeftRight,
    href: "/transferencias",
  },
  {
    title: "Scout",
    description:
      "Pesquise jogadores e consulte informações para auxiliar na montagem dos elencos.",
    icon: Search,
    href: "/scout",
  },
];

export default function Home() {
  return (
    <div className="min-h-full p-5 md:p-8">
      {/* HERO */}
      <section className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#171c1f]">
        {/* Efeito visual */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative p-7 md:p-10">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Trophy size={25} />
          </div>

          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
              <Sparkles size={16} />
              <span>OSM Group Admin</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Administração de campeonatos do OSM
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
              Uma ferramenta para facilitar a organização dos seus campeonatos
              no Online Soccer Manager. Centralize sorteios, rankings,
              transferências, Scout e informações dos campeonatos em um único
              lugar.
            </p>

            <div className="mt-7">
              <Link
                href="/campeonatos"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Ver Campeonatos
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Funcionalidades
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Tudo o que você precisa para organizar seu grupo
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Acesse rapidamente as principais ferramentas do sistema.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-xl border border-white/10 bg-[#171c1f] p-5 transition hover:border-emerald-500/30 hover:bg-[#1a2023]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500/15">
                    <Icon size={20} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-emerald-400"
                  />
                </div>

                <h3 className="mt-5 font-semibold">{feature.title}</h3>

                <p className="mt-2 text-sm leading-5 text-gray-500">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SOBRE O SISTEMA */}
      <section className="mt-8 rounded-xl border border-white/10 bg-[#171c1f] p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-semibold">Organize seu campeonato de forma simples</h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              O OSM Group Admin foi desenvolvido para reunir em um só lugar
              ferramentas que ajudam na administração das competições,
              facilitando o acesso às equipes, jogadores, sorteios,
              classificações e movimentações do campeonato.
            </p>
          </div>

          <Link
            href="/campeonatos"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-emerald-500/30 hover:text-emerald-400"
          >
            Explorar Campeonatos
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

