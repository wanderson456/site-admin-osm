import { Users } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#15191b] px-5 md:px-8">

      <div>
        <p className="text-xs text-gray-500">
          CAMPEONATO ATUAL
        </p>

        <h2 className="text-lg font-semibold">
          Campeonato Brasileiro
        </h2>
      </div>

      <div className="flex items-center gap-4">

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">
            Administrador
          </p>

          <p className="text-xs text-gray-500">
            OSM Group
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-black">
          A
        </div>

      </div>

    </header>
  );
}