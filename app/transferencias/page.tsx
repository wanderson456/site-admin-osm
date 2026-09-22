"use client";

import { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  ShieldAlert,
  Sliders,
  Users,
  CheckCircle2,
  Trophy,
  Plus,
  Trash2,
  Vote,
  RefreshCw,
  Sparkles,
  History,
  UserCheck,
  Check,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

interface OsmLeague {
  id: number | string;
  name: string;
}

interface ManagerRule {
  id: string;
  managerName: string;
  transfersUsed: number;
  maxOverSigned: number;
  maxTrainingOver: number;
}

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: string;
  turn: "1º Turno" | "2º Turno";
  title: string;
  options: PollOption[];
  votes: Record<string, string>; // { "Nome do Técnico": "ID da Opção Votada" }
  active: boolean;
  date: string;
}

export default function TransferenciasPage() {
  const [leagues, setLeagues] = useState<OsmLeague[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");

  const [currentTurn, setCurrentTurn] = useState<"1º Turno" | "2º Turno">("1º Turno");

  const [globalRules, setGlobalRules] = useState({
    maxTransfers: 5,
    maxOverSignLimit: 85,
    maxTrainingLimit: 95,
  });

  const [turn2Rules, setTurn2Rules] = useState({
    extraTransfers: 3,
    extraOverSign: 5,
    extraTraining: 3,
  });

  const [managers, setManagers] = useState<ManagerRule[]>([]);
  const [newManagerName, setNewManagerName] = useState("");

  // Sistema de Enquetes e Votações
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("Aprovar limite extra, Rejeitar limite extra");

  // Sessão do Usuário Logado ("admin" ou o nome exato do técnico cadastrado)
  const [loggedInUser, setLoggedInUser] = useState<string>("admin");

  const [isClient, setIsClient] = useState(false);

  // Carregar dados salvos
  useEffect(() => {
    setIsClient(true);
    const savedLeague = localStorage.getItem("osm_trans_league");
    const savedRules = localStorage.getItem("osm_trans_rules");
    const savedTurn2 = localStorage.getItem("osm_trans_turn2");
    const savedManagers = localStorage.getItem("osm_trans_managers");
    const savedTurn = localStorage.getItem("osm_trans_turn");
    const savedPolls = localStorage.getItem("osm_trans_polls");
    const savedSession = localStorage.getItem("osm_trans_session");

    if (savedLeague) setSelectedLeagueId(savedLeague);
    if (savedRules) { try { setGlobalRules(JSON.parse(savedRules)); } catch (e) {} }
    if (savedTurn2) { try { setTurn2Rules(JSON.parse(savedTurn2)); } catch (e) {} }
    if (savedManagers) { try { setManagers(JSON.parse(savedManagers)); } catch (e) {} }
    if (savedTurn) setCurrentTurn(savedTurn as any);
    if (savedPolls) { try { setPolls(JSON.parse(savedPolls)); } catch (e) {} }
    if (savedSession) setLoggedInUser(savedSession);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("osm_trans_league", selectedLeagueId);
    localStorage.setItem("osm_trans_rules", JSON.stringify(globalRules));
    localStorage.setItem("osm_trans_turn2", JSON.stringify(turn2Rules));
    localStorage.setItem("osm_trans_managers", JSON.stringify(managers));
    localStorage.setItem("osm_trans_turn", currentTurn);
    localStorage.setItem("osm_trans_polls", JSON.stringify(polls));
    localStorage.setItem("osm_trans_session", loggedInUser);
  }, [selectedLeagueId, globalRules, turn2Rules, managers, currentTurn, polls, loggedInUser, isClient]);

  // Buscar Ligas
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

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerName.trim()) return;

    const activeMaxOverSign = currentTurn === "2º Turno" ? globalRules.maxOverSignLimit + turn2Rules.extraOverSign : globalRules.maxOverSignLimit;
    const activeMaxTraining = currentTurn === "2º Turno" ? globalRules.maxTrainingLimit + turn2Rules.extraTraining : globalRules.maxTrainingLimit;

    const newItem: ManagerRule = {
      id: Date.now().toString(),
      managerName: newManagerName.trim(),
      transfersUsed: 0,
      maxOverSigned: activeMaxOverSign,
      maxTrainingOver: activeMaxTraining,
    };

    setManagers([...managers, newItem]);
    setNewManagerName("");
  };

  const handleRemoveManager = (id: string) => {
    setManagers(managers.filter((m) => m.id !== id));
  };

  const handleUpdateManagerField = (id: string, field: keyof ManagerRule, value: number) => {
    setManagers(
      managers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitle.trim()) return;

    const optionsArray = newPollOptions
      .split(",")
      .map((opt, index) => ({ id: `opt_${index + 1}`, text: opt.trim() }))
      .filter((opt) => opt.text.length > 0);

    const newPoll: Poll = {
      id: Date.now().toString(),
      turn: currentTurn,
      title: newPollTitle.trim(),
      options: optionsArray,
      votes: {},
      active: true,
      date: new Date().toLocaleDateString("pt-BR"),
    };

    setPolls([newPoll, ...polls]);
    setNewPollTitle("");
  };

  const handleVote = (pollId: string, optionId: string) => {
    if (loggedInUser === "admin") return;

    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId) {
          return {
            ...poll,
            votes: {
              ...poll.votes,
              [loggedInUser]: optionId,
            },
          };
        }
        return poll;
      })
    );
  };

  const handleToggleTurn = () => {
    const nextTurn = currentTurn === "1º Turno" ? "2º Turno" : "1º Turno";
    setCurrentTurn(nextTurn);

    if (nextTurn === "2º Turno") {
      setManagers(
        managers.map((m) => ({
          ...m,
          maxOverSigned: globalRules.maxOverSignLimit + turn2Rules.extraOverSign,
          maxTrainingOver: globalRules.maxTrainingLimit + turn2Rules.extraTraining,
        }))
      );
    }
  };

  const effectiveMaxTransfers = currentTurn === "2º Turno" ? globalRules.maxTransfers + turn2Rules.extraTransfers : globalRules.maxTransfers;
  const effectiveMaxOverSign = currentTurn === "2º Turno" ? globalRules.maxOverSignLimit + turn2Rules.extraOverSign : globalRules.maxOverSignLimit;
  const effectiveMaxTraining = currentTurn === "2º Turno" ? globalRules.maxTrainingLimit + turn2Rules.extraTraining : globalRules.maxTrainingLimit;

  // Dados do técnico logado
  const currentManagerData = managers.find((m) => m.managerName === loggedInUser);

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      {/* CABEÇALHO COM LOGIN RESTRITO AOS TÉCNICOS CADASTRADOS */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-emerald-400 font-medium">OSM BAD BOYS</p>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="text-emerald-400" /> Votação & Controle de Transferências
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {loggedInUser === "admin" 
              ? "Modo Administrador: Gerencie limites, turnos e cadastre os participantes."
              : `Olá, ${loggedInUser}! Alimente suas contratações e vote nas enquetes ativas.`}
          </p>
        </div>

        {/* LOGIN DE TÉCNICOS CADASTRADOS */}
        <div className="flex items-center gap-3 bg-[#171c1f] border border-white/10 p-3 rounded-xl shadow-lg">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <UserCheck size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-400">Acessar como:</span>
            <select
              value={loggedInUser}
              onChange={(e) => setLoggedInUser(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#101416] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="admin">⚙️ Administrador Geral</option>
              {managers.length === 0 ? (
                <option disabled value="">Nenhum técnico cadastrado ainda</option>
              ) : (
                managers.map((m) => (
                  <option key={m.id} value={m.managerName}>👤 Técnico: {m.managerName}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* SE O USUÁRIO FOR UM TÉCNICO CADASTRADO */}
      {loggedInUser !== "admin" && currentManagerData ? (
        <div className="space-y-6">
          {/* CARD INDIVIDUAL DO TÉCNICO PARA ALIMENTAR CONTRATAÇÕES */}
          <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-[#171c1f] to-[#101416] p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Meu Painel de Treinador</span>
                <h2 className="text-2xl font-bold text-white mt-1">{currentManagerData.managerName}</h2>
              </div>
              <div className="bg-[#101416] border border-white/10 px-4 py-2 rounded-xl text-center">
                <span className="text-[11px] text-gray-400 block">Fase Atual</span>
                <span className="text-sm font-bold text-white">{currentTurn}</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* CARD DE ALIMENTAR CONTRATAÇÕES */}
              <div className="rounded-xl border border-white/10 bg-[#101416] p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Suas Transferências Feitas</span>
                  <div className="flex items-center gap-3 my-2">
                    <button
                      onClick={() => {
                        const newVal = Math.max(0, currentManagerData.transfersUsed - 1);
                        handleUpdateManagerField(currentManagerData.id, "transfersUsed", newVal);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                    >
                      <MinusCircle size={18} />
                    </button>
                    <span className="text-3xl font-bold text-emerald-400">{currentManagerData.transfersUsed}</span>
                    <button
                      onClick={() => {
                        const newVal = currentManagerData.transfersUsed + 1;
                        handleUpdateManagerField(currentManagerData.id, "transfersUsed", newVal);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">Limite Máximo: {effectiveMaxTransfers} contratações</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#101416] p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Teto OVER Contratação</span>
                  <p className="text-2xl font-bold text-white mt-2">{currentManagerData.maxOverSigned}</p>
                </div>
                <span className="text-xs text-emerald-400 mt-2">Liberado pelo regulamento</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#101416] p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Teto OVER Treinamento</span>
                  <p className="text-2xl font-bold text-white mt-2">{currentManagerData.maxTrainingOver}</p>
                </div>
                <span className="text-xs text-emerald-400 mt-2">Liberado pelo regulamento</span>
              </div>
            </div>
          </div>

          {/* ENQUETES ATIVAS PARA VOTAR */}
          <div className="rounded-xl border border-white/10 bg-[#171c1f] p-6">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Vote className="text-emerald-400" /> Enquetes Abertas para Votação ({currentTurn})
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Clique na opção de sua preferência para registrar seu voto no campeonato.
            </p>

            {polls.filter((p) => p.active && p.turn === currentTurn).length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm bg-[#101416] rounded-lg">
                Nenhuma enquete aberta no momento para o {currentTurn}.
              </div>
            ) : (
              <div className="space-y-6">
                {polls
                  .filter((p) => p.active && p.turn === currentTurn)
                  .map((poll) => {
                    const myVote = poll.votes[loggedInUser];

                    return (
                      <div key={poll.id} className="rounded-lg bg-[#101416] p-5 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                            {poll.turn} • Aberta em {poll.date}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white text-base mb-4">{poll.title}</h3>

                        <div className="grid gap-2 md:grid-cols-2">
                          {poll.options.map((opt) => {
                            const isSelected = myVote === opt.id;
                            const totalVotesForOpt = Object.values(poll.votes).filter((v) => v === opt.id).length;

                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleVote(poll.id, opt.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition ${
                                  isSelected
                                    ? "bg-emerald-500/20 border-emerald-500 text-white font-semibold"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {isSelected && <Check size={16} className="text-emerald-400" />}
                                  {opt.text}
                                </span>
                                <span className="text-xs text-gray-500 bg-[#101416] px-2 py-1 rounded">
                                  {totalVotesForOpt} votos
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ) : loggedInUser !== "admin" && !currentManagerData ? (
        /* CASO O TÉCNICO TENHA SIDO EXCLUÍDO MAS AINDA ESTEJA SELECIONADO */
        <div className="p-12 text-center bg-[#171c1f] border border-white/10 rounded-xl">
          <p className="text-red-400 font-medium text-base mb-2">Este técnico não está mais cadastrado no campeonato.</p>
          <button
            onClick={() => setLoggedInUser("admin")}
            className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400"
          >
            Voltar para o Administrador
          </button>
        </div>
      ) : (
        /* VISÃO DO ADMINISTRADOR COMPLETA */
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Trophy className="text-emerald-400" size={20} />
                  <span>Campeonato Ativo</span>
                </div>
                <button
                  onClick={handleToggleTurn}
                  className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-500/30 transition flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Alternar Turno ({currentTurn})
                </button>
              </div>
              <label className="mb-1 block text-xs text-gray-400">Selecione a Liga</label>
              <select
                value={selectedLeagueId}
                onChange={(e) => setSelectedLeagueId(e.target.value)}
                disabled={loadingLeagues}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">{loadingLeagues ? "Carregando ligas..." : "Escolha o campeonato..."}</option>
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2 font-semibold text-white">
                <Sliders className="text-emerald-400" size={20} />
                <span>Configuração de Limites (Base + Bônus 2º Turno)</span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Transações (Base / 2º Turno)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={globalRules.maxTransfers}
                      onChange={(e) => setGlobalRules({ ...globalRules, maxTransfers: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white"
                    />
                    <span className="text-gray-500">+</span>
                    <input
                      type="number"
                      value={turn2Rules.extraTransfers}
                      onChange={(e) => setTurn2Rules({ ...turn2Rules, extraTransfers: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-400">Teto Contratação (Base / Extra)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={globalRules.maxOverSignLimit}
                      onChange={(e) => setGlobalRules({ ...globalRules, maxOverSignLimit: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white"
                    />
                    <span className="text-gray-500">+</span>
                    <input
                      type="number"
                      value={turn2Rules.extraOverSign}
                      onChange={(e) => setTurn2Rules({ ...turn2Rules, extraOverSign: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-400">Teto Treino (Base / Extra)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={globalRules.maxTrainingLimit}
                      onChange={(e) => setGlobalRules({ ...globalRules, maxTrainingLimit: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white"
                    />
                    <span className="text-gray-500">+</span>
                    <input
                      type="number"
                      value={turn2Rules.extraTraining}
                      onChange={(e) => setTurn2Rules({ ...turn2Rules, extraTraining: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-white">
                <Vote className="text-emerald-400" size={20} />
                <span>Criar Nova Enquete ({currentTurn})</span>
              </div>
              <form onSubmit={handleCreatePoll} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Pergunta da Enquete</label>
                  <input
                    type="text"
                    placeholder="Ex: Aumentar +2 transferências no 2º turno?"
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Opções de Voto (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={newPollOptions}
                    onChange={(e) => setNewPollOptions(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                >
                  <Sparkles size={16} /> Publicar Enquete
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-white">
                <History className="text-emerald-400" size={20} />
                <span>Resultados Parciais das Enquetes</span>
              </div>

              {polls.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-center text-gray-500 text-sm">
                  Nenhuma enquete criada ainda.
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {polls.map((poll) => (
                    <div key={poll.id} className="p-3 rounded-lg bg-[#101416] border border-white/5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-emerald-400">{poll.title}</span>
                        <button
                          onClick={() => setPolls(polls.filter((p) => p.id !== poll.id))}
                          className="text-red-400 hover:underline"
                        >
                          Excluir
                        </button>
                      </div>
                      <p className="text-gray-400 mb-2">Total de votos computados: {Object.keys(poll.votes).length}</p>
                      <div className="flex flex-wrap gap-2">
                        {poll.options.map((opt) => {
                          const count = Object.values(poll.votes).filter((v) => v === opt.id).length;
                          return (
                            <span key={opt.id} className="bg-white/5 px-2 py-1 rounded text-gray-300">
                              {opt.text}: <strong className="text-emerald-400">{count}</strong>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold text-white">
              <Users className="text-emerald-400" size={20} />
              <span>Cadastrar Técnicos do Campeonato</span>
            </div>
            <form onSubmit={handleAddManager} className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Nome do treinador..."
                value={newManagerName}
                onChange={(e) => setNewManagerName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101416] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
              >
                <Plus size={16} /> Adicionar
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#171c1f] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-lg text-white">Painel Geral de Limites ({currentTurn})</h2>
              <span className="text-xs text-gray-400">{managers.length} treinadores</span>
            </div>

            {managers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                Nenhum treinador cadastrado ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#101416] text-xs uppercase tracking-wider text-gray-400">
                      <th className="p-4">Treinador</th>
                      <th className="p-4">Transferências Realizadas</th>
                      <th className="p-4">Teto OVER Contratação</th>
                      <th className="p-4">Teto OVER Treino</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {managers.map((m) => {
                      const hasExceededTransfers = m.transfersUsed > effectiveMaxTransfers;
                      const hasExceededSign = m.maxOverSigned > effectiveMaxOverSign;
                      const hasExceededTraining = m.maxTrainingOver > effectiveMaxTraining;
                      const isViolation = hasExceededTransfers || hasExceededSign || hasExceededTraining;

                      return (
                        <tr key={m.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-4 font-semibold text-white">{m.managerName}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={m.transfersUsed}
                                onChange={(e) => handleUpdateManagerField(m.id, "transfersUsed", Number(e.target.value))}
                                className={`w-20 rounded-lg border bg-[#101416] px-2.5 py-1.5 text-sm text-white ${
                                  hasExceededTransfers ? "border-red-500 text-red-400" : "border-white/10"
                                }`}
                              />
                              <span className="text-xs text-gray-500">/ {effectiveMaxTransfers}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={m.maxOverSigned}
                              onChange={(e) => handleUpdateManagerField(m.id, "maxOverSigned", Number(e.target.value))}
                              className="w-24 rounded-lg border border-white/10 bg-[#101416] px-2.5 py-1.5 text-sm text-white"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={m.maxTrainingOver}
                              onChange={(e) => handleUpdateManagerField(m.id, "maxTrainingOver", Number(e.target.value))}
                              className="w-24 rounded-lg border border-white/10 bg-[#101416] px-2.5 py-1.5 text-sm text-white"
                            />
                          </td>
                          <td className="p-4 text-center">
                            {isViolation ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/30">
                                <ShieldAlert size={13} /> Infração
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 size={13} /> Regular
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleRemoveManager(m.id)}
                              className="text-gray-500 hover:text-red-400 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}