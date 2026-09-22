"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, ArrowUpDown, RefreshCw } from "lucide-react";

interface Player {
  id: number;
  name: string;
  full_name?: string;
  position: number | string;
  specific_position?: number;
  stat_ovr: number;
  age: number;
  nationality_name?: string;
  nationality_code?: string;
  league_name?: string;
  team_name?: string;
  base_value?: number;
}

export default function ScoutPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Filtros
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [nationality, setNationality] = useState("");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  // Paginação e Ordenação
  const [offset, setOffset] = useState(0);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (name.trim()) params.append("name", name.trim());
      if (position) params.append("position", position);
      if (nationality) params.append("nationality", nationality);
      if (ageMin) params.append("ageMin", ageMin);
      if (ageMax) params.append("ageMax", ageMax);
      if (ratingMin) params.append("ratingMin", ratingMin);
      if (ratingMax) params.append("ratingMax", ratingMax);

      params.append("show_special", "0");
      params.append("offset", offset.toString());
      params.append("sortColumn", "stat_ovr");
      params.append("sortOrder", sortOrder);
      params.append("in_form", "0");

      const response = await fetch(`/api/osm/scout?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Erro ao buscar dados do olheiro (Status HTTP ${response.status})`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setPlayers(data);
      } else if (data && Array.isArray(data.players)) {
        setPlayers(data.players);
      } else {
        setPlayers([]);
      }
    } catch (err: unknown) {
      console.error("[Erro Scout Page]:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao carregar os jogadores.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, position, nationality, ageMin, ageMax, ratingMin, ratingMax, offset, sortOrder]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchPlayers();
  };

  const handleResetFilters = () => {
    setName("");
    setPosition("");
    setNationality("");
    setRatingMin("");
    setRatingMax("");
    setAgeMin("");
    setAgeMax("");
    setOffset(0);
  };

  return (
    <div className="p-5 md:p-8">
      {/* CABEÇALHO */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">Busca Avançada</p>
        <h1 className="text-3xl font-bold">Olheiro (Scout)</h1>
      </div>

      {/* PAINEL DE FILTROS */}
      <form
        onSubmit={handleSearchSubmit}
        className="mb-8 rounded-xl border border-white/10 bg-[#171c1f] p-5"
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Filter size={18} />
            <h2 className="font-semibold text-white">Filtros de Busca</h2>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <RefreshCw size={13} />
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* NOME */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Nome do Jogador
            </label>
            <input
              type="text"
              placeholder="Ex: Mbappé, Haaland..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* POSIÇÃO */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Posição
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Todas</option>
              <option value="1">Ataque (ATT)</option>
              <option value="2">Meio-Campo (MID)</option>
              <option value="3">Defesa (DEF)</option>
              <option value="4">Goleiro (POR / GK)</option>
            </select>
          </div>

          {/* NACIONALIDADE */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Nacionalidade
            </label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Todas</option>
              <option value="Spanish">Espanha (Spanish)</option>
              <option value="Brazilian">Brasil (Brazilian)</option>
              <option value="Argentinian">Argentina (Argentinian)</option>
              <option value="French">França (French)</option>
              <option value="Portuguese">Portugal (Portuguese)</option>
              <option value="English">Inglaterra (English)</option>

              <option value="German">Alemanha (German)</option>
              <option value="Italian">Itália (Italian)</option>
              <option value="Dutch">Holanda (Dutch)</option>
              <option value="Belgian">Bélgica (Belgian)</option>
              <option value="Uruguayan">Uruguai (Uruguayan)</option>
              <option value="Colombian">Colômbia (Colombian)</option>
            </select>
          </div>

          {/* OVERALL */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Overall (Mín / Máx)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={ratingMin}
                onChange={(e) => setRatingMin(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={ratingMax}
                onChange={(e) => setRatingMax(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* IDADE */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">
              Idade (Mín / Máx)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Filtrar Jogadores
          </button>
        </div>
      </form>

      {/* ERRO */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <span className="font-semibold">Atenção:</span> {error}
        </div>
      )}

      {/* TABELA DE JOGADORES */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171c1f]">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Resultados Encontrados ({players.length})
          </p>

          <button
            onClick={() => {
              setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC");
              setOffset(0);
            }}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
          >
            <ArrowUpDown size={14} />
            Ordenar por Overall ({sortOrder})
          </button>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center gap-3 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            <span>Buscando no olheiro...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum jogador encontrado com estes filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-[#101416] text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-3">Jogador</th>
                  <th className="px-5 py-3">Time / Liga</th>
                  <th className="px-5 py-3">Idade</th>
                  <th className="px-5 py-3">Nacionalidade</th>
                  <th className="px-5 py-3 text-right">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.map((player) => (
                  <tr
                    key={player.id}
                    className="transition hover:bg-white/5"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {player.name}
                      {player.full_name && player.full_name !== player.name && (
                        <span className="block text-xs text-gray-500 font-normal">
                          {player.full_name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      <div>{player.team_name || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {player.league_name || ""}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {player.age ? `${player.age} anos` : "N/A"}
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {player.nationality_name || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-block rounded-lg bg-emerald-500/15 px-3 py-1 font-bold text-emerald-400">
                        {player.stat_ovr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINAÇÃO */}
        <div className="flex items-center justify-between border-t border-white/10 p-4">
          <button
            onClick={() => setOffset((prev) => Math.max(0, prev - 50))}
            disabled={offset === 0 || loading}
            className="rounded-lg border border-white/10 bg-[#101416] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Página Anterior
          </button>

          <span className="text-xs text-gray-500">
            Mostrando a partir do item {offset + 1}
          </span>

          <button
            onClick={() => setOffset((prev) => prev + 50)}
            disabled={players.length < 50 || loading}
            className="rounded-lg border border-white/10 bg-[#101416] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Próxima Página
          </button>
        </div>
      </div>
    </div>
  );
}