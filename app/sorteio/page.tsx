"use client";

import { useState, useEffect } from "react";
import HistoricoModal from "./HistoricoModal";
import {
  Shuffle,
  Users,
  RotateCcw,
  Plus,
  Trash2,
  Star,
  Loader2,
  Trophy,
  History,
  Save,
} from "lucide-react";

interface Manager {
  id: string;
  name: string;
  hasBonus: boolean;
}

interface OsmLeague {
  id: number | string;
  name: string;
}

interface OsmTeam {
  id: number | string;
  name: string;
  squad_value?: number;
}

interface DrawResult {
  manager: string;
  team: string;
  hasBonus: boolean;
}

export default function SorteioPage() {
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);

  // 1. Estado dos Técnicos / Managers
  const [managers, setManagers] = useState<Manager[]>([
    { id: "1", name: "Manager A", hasBonus: false },
    { id: "2", name: "Manager B", hasBonus: false },
  ]);
  const [newManagerName, setNewManagerName] = useState("");

  // 2. Estado das Ligas e do Campeonato Selecionado
  const [leagues, setLeagues] = useState<OsmLeague[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");

  // 3. Estado dos Times da Liga
  const [teams, setTeams] = useState<OsmTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // 4. Estado do Resultado do Sorteio e Salvamento
  const [result, setResult] = useState<DrawResult[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  // Carregar do localStorage após a montagem no cliente (Evita erro de Hydration)
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("osm_sorteio_result");
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch (e) {
        setResult([]);
      }
    }
  }, []);

  // Salvar no localStorage sempre que o resultado do sorteio mudar
  useEffect(() => {
    if (!isClient) return;
    if (result.length > 0) {
      localStorage.setItem("osm_sorteio_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("osm_sorteio_result");
    }
  }, [result, isClient]);

  // Carregar Ligas ao abrir a página
  useEffect(() => {
    async function fetchLeagues() {
      setLoadingLeagues(true);
      try {
        const res = await fetch("/api/osm/listar-campeonatos");
        if (res.ok) {
          const data = await res.json();
          const leagueList = Array.isArray(data) ? data : data.leagues || [];
          setLeagues(
            leagueList.map((l: any) => ({
              id: l.id || l.league_id,
              name: l.name || l.league_name,
            }))
          );
        }
      } catch (err) {
        console.error("Erro ao buscar ligas:", err);
      } finally {
        setLoadingLeagues(false);
      }
    }
    fetchLeagues();
  }, []);

  // Adicionar Técnico
  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerName.trim()) return;

    setManagers([
      ...managers,
      {
        id: Date.now().toString(),
        name: newManagerName.trim(),
        hasBonus: false,
      },
    ]);
    setNewManagerName("");
  };

  // Alternar Bônus do Técnico
  const handleToggleBonus = (id: string) => {
    setManagers(
      managers.map((m) => (m.id === id ? { ...m, hasBonus: !m.hasBonus } : m))
    );
  };

  // Remover Técnico
  const handleRemoveManager = (id: string) => {
    setManagers(managers.filter((m) => m.id !== id));
  };

  // Buscar Times ao selecionar a Liga
  const handleSelectLeague = async (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    if (!leagueId) {
      setTeams([]);
      return;
    }

    setLoadingTeams(true);
    setResult([]); // Limpa o resultado anterior ao trocar de liga

    try {
      const res = await fetch(`/api/osm/teams?league_id=${leagueId}`);
      if (!res.ok) throw new Error("Erro ao buscar times");

      const data = await res.json();
      const rawTeams = Array.isArray(data) ? data : data.teams || [];

      const extractedTeams: OsmTeam[] = rawTeams.map((item: any, idx: number) => ({
        id: item.id || item.team_id || idx,
        name: item.name || item.team_name || `Time ${idx + 1}`,
        squad_value: Number(item.squad_value || item.value || 0),
      }));

      setTeams(extractedTeams);
    } catch (err) {
      console.error("Erro ao carregar times:", err);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Algoritmo de Embaralhamento
  const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Realizar Sorteio Ponderado por Bônus
  const realizarSorteio = () => {
    if (managers.length === 0 || teams.length === 0) return;

    // Ordena os times do mais valioso para o menos valioso
    const sortedTeams = [...teams].sort(
      (a, b) => (b.squad_value || 0) - (a.squad_value || 0)
    );

    // Separa e embaralha técnicos com e sem bônus
    const bonusManagers = shuffle(managers.filter((m) => m.hasBonus));
    const regularManagers = shuffle(managers.filter((m) => !m.hasBonus));

    // Técnicos com bônus ganham os melhores times do topo da lista ordenada
    const topTeams = sortedTeams.slice(0, bonusManagers.length);
    const shuffledTopTeams = shuffle(topTeams);

    // O restante dos times vai para os técnicos sem bônus
    const remainingTeams = shuffle(sortedTeams.slice(bonusManagers.length));

    const drawResults: DrawResult[] = [];

    // Atribui os melhores times para quem tem bônus
    bonusManagers.forEach((manager, idx) => {
      drawResults.push({
        manager: manager.name,
        team: shuffledTopTeams[idx]?.name || "Sem time disponível",
        hasBonus: true,
      });
    });

    // Atribui os times restantes para os demais técnicos
    regularManagers.forEach((manager, idx) => {
      drawResults.push({
        manager: manager.name,
        team: remainingTeams[idx]?.name || "Sem time disponível",
        hasBonus: false,
      });
    });

    setResult(drawResults);
  };

  // Salvar Sorteio no Banco
  const handleSaveSorteio = async () => {
    if (result.length === 0) return;

    const selectedLeague = leagues.find((l) => String(l.id) === String(selectedLeagueId));
    const leagueName = selectedLeague ? selectedLeague.name : "Liga Desconhecida";

    setSavingResult(true);
    try {
      const res = await fetch("/api/osm/salvar-sorteio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: result,
          leagueName: leagueName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Sorteio salvo no banco de dados com sucesso!");
      } else {
        alert("Erro ao salvar: " + (data.error || "Erro desconhecido"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao salvar o sorteio.");
    } finally {
      setSavingResult(false);
    }
  };

  return (
    <div className="p-5 md:p-8">
      {/* CABEÇALHO */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-500">OSM BAD BOYS</p>
          <h1 className="text-3xl font-bold text-white">Sorteio de Times</h1>
          <p className="mt-2 text-sm text-gray-500">
            Cadastre os técnicos, escolha o campeonato do OSM Helper e realize o sorteio com prioridade de bônus.
          </p>
        </div>

        <button
          onClick={() => setIsHistoricoOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#171c1f] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition self-start sm:self-auto"
        >
          <History size={16} />
          <span>Ver Histórico</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* COLUNA 1: CADASTRO DE TÉCNICOS */}
        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
          <div className="mb-4 flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <Users className="text-emerald-400" size={20} />
              <span className="text-white">Técnicos ({managers.length})</span>
            </div>
          </div>

          <form onSubmit={handleAddManager} className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Nome do técnico..."
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              <Plus size={16} />
            </button>
          </form>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {managers.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">
                Nenhum técnico cadastrado.
              </p>
            ) : (
              managers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-[#101416] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-white">{m.name}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBonus(m.id)}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition ${
                        m.hasBonus
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-white/5 text-gray-500 hover:text-gray-300"
                      }`}
                      title="Ativar bônus para pegar elencos melhores"
                    >
                      <Star size={13} className={m.hasBonus ? "fill-amber-400" : ""} />
                      {m.hasBonus ? "Bônus" : "Sem Bônus"}
                    </button>

                    <button
                      onClick={() => handleRemoveManager(m.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2: ESCOLHER LIGA E BOTÃO DE SORTEIO */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#171c1f] p-5 justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <Trophy className="text-emerald-400" size={20} />
              <span className="text-white">Campeonato OSM</span>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-xs text-gray-400">
                Selecione a Liga
              </label>
              <select
                value={selectedLeagueId}
                onChange={(e) => handleSelectLeague(e.target.value)}
                disabled={loadingLeagues}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {loadingLeagues ? "Carregando ligas..." : "Escolha um campeonato..."}
                </option>
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              {teams.length > 0 && (
                <p className="mt-2 text-xs text-emerald-400">
                  {teams.length} times carregados para este campeonato.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center border-t border-white/10 pt-6">
            <button
              onClick={realizarSorteio}
              disabled={managers.length === 0 || teams.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3.5 font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/10"
            >
              <Shuffle size={18} />
              Realizar Sorteio
            </button>

            {result.length > 0 && (
              <button
                onClick={() => {
                  setResult([]);
                  localStorage.removeItem("osm_sorteio_result");
                }}
                className="mt-3 flex items-center gap-2 text-xs text-gray-500 hover:text-white"
              >
                <RotateCcw size={14} />
                Limpar sorteio
              </button>
            )}
          </div>
        </div>

        {/* COLUNA 3: LISTA DE TIMES DA LIGA SELECIONADA */}
        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
          <div className="mb-4 flex items-center justify-between font-semibold">
            <span className="text-white text-sm">Times do Campeonato</span>
            <span className="text-xs text-gray-500">{teams.length} equipes</span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {loadingTeams ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs">Carregando times do OSM...</span>
              </div>
            ) : teams.length === 0 ? (
              <p className="text-xs text-gray-500 py-12 text-center">
                Selecione uma liga ao lado para carregar os clubes.
              </p>
            ) : (
              teams.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="flex items-center justify-between rounded-lg bg-[#101416] px-3 py-2 text-sm text-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 w-5">#{idx + 1}</span>
                    <span className="font-medium">{t.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* EXIBIÇÃO DOS RESULTADOS DO SORTEIO */}
      {result.length > 0 && (
        <div className="mt-8 rounded-xl border border-emerald-500/30 bg-[#171c1f]">
          <div className="border-b border-white/10 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-lg text-white">
                Resultado do Sorteio
              </h2>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {result.length} pareamentos definidos
              </span>
            </div>

            <button
              onClick={handleSaveSorteio}
              disabled={savingResult}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {savingResult ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              <span>{savingResult ? "Salvando..." : "Salvar Sorteio no Banco"}</span>
            </button>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
            {result.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-[#101416] p-4 border border-white/5 relative overflow-hidden"
              >
                {item.hasBonus && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    <Star size={10} className="fill-amber-400" /> BÔNUS
                  </span>
                )}

                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Técnico
                </p>
                <p className="font-semibold text-white text-base">
                  {item.manager}
                </p>

                <p className="mt-3 text-xs uppercase tracking-wider text-gray-400">
                  Time Sorteado
                </p>
                <p className="font-bold text-emerald-400 text-lg">
                  {item.team}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO COM A PROP isOpen PASSADA */}
      <HistoricoModal
        isOpen={isHistoricoOpen}
        onClose={() => setIsHistoricoOpen(false)}
      />
    </div>
  );
}