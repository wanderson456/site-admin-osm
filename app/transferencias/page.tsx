"use client";

import { useEffect, useState, useMemo } from "react";

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface PollVote {
  id: string;
  pollId: string;
  managerId: string;
  managerName?: string;
  championshipChoice: string;
  maxOverallTurn1: number;
  maxOverallTurn2: number;
  maxPurchasesPerManager: number;
  tieBreakChoice?: string; // Voto de desempate se necessário
}

interface TransferRecord {
  id: string;
  pollId: string;
  managerId: string;
  managerName?: string;
  playerName: string;
  playerOverall: number;
  turn: number;
  createdAt: string;
}

export default function TransferenciasPage() {
  // Sessão do Treinador
  const [manager, setManager] = useState<Manager | null>(null);

  // Formulário de Autenticação
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Modais
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Votos da Enquete
  const [votes, setVotes] = useState<PollVote[]>([]);

  // Form de Voto
  const [championshipChoice, setChampionshipChoice] = useState("Premier League");
  const [maxOverallTurn1, setMaxOverallTurn1] = useState(85);
  const [maxOverallTurn2, setMaxOverallTurn2] = useState(90);
  const [maxPurchases, setMaxPurchases] = useState(3);
  const [selectedTieBreak, setSelectedTieBreak] = useState<string>("");
  const [submittingVote, setSubmittingVote] = useState(false);

  // Compras
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [playerOverall, setPlayerOverall] = useState(80);
  const [turn, setTurn] = useState(1);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Feedback
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Carrega a sessão guardada
  useEffect(() => {
    const savedManager = localStorage.getItem("osm_manager");
    if (savedManager) {
      try {
        const parsed = JSON.parse(savedManager);
        setManager(parsed);
      } catch {
        localStorage.removeItem("osm_manager");
      }
    }
  }, []);

  useEffect(() => {
    fetchPollData();
    fetchTransfersData();
  }, [manager]);

  const notify = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // CÁLCULO DA APURAÇÃO COM DETEÇÃO DE EMPATE E DESEMPATE
  const pollSummary = useMemo(() => {
    if (votes.length === 0) {
      return {
        winningLeague: "Pendente (Aguardando Votos)",
        leagueCounts: {},
        isTie: false,
        tiedLeagues: [] as string[],
        avgMaxTurn1: 85,
        avgMaxTurn2: 90,
        avgMaxPurchases: 3,
        totalVotes: 0,
      };
    }

    // Contagem de votos por liga
    const counts: Record<string, number> = {};
    votes.forEach((v) => {
      const league = v.championshipChoice.trim();
      counts[league] = (counts[league] || 0) + 1;
    });

    // Encontrar número máximo de votos
    let maxVotesCount = 0;
    Object.values(counts).forEach((count) => {
      if (count > maxVotesCount) maxVotesCount = count;
    });

    // Ligas que alcançaram o número máximo de votos
    const topLeagues = Object.entries(counts)
      .filter(([_, count]) => count === maxVotesCount)
      .map(([league]) => league);

    const isTie = topLeagues.length > 1;

    let finalWinner = "";

    if (isTie) {
      // Tentar resolver empate via votos de desempate (tieBreakChoice)
      const tieBreakCounts: Record<string, number> = {};
      topLeagues.forEach((l) => (tieBreakCounts[l] = 0));

      votes.forEach((v) => {
        if (v.tieBreakChoice && topLeagues.includes(v.tieBreakChoice)) {
          tieBreakCounts[v.tieBreakChoice] = (tieBreakCounts[v.tieBreakChoice] || 0) + 1;
        }
      });

      let maxTB = -1;
      Object.entries(tieBreakCounts).forEach(([league, tbVotes]) => {
        if (tbVotes > maxTB && tbVotes > 0) {
          maxTB = tbVotes;
          finalWinner = league;
        }
      });

      // Se ainda não houve desempate decidido por votos, mantemos flag de empate
      if (!finalWinner) {
        finalWinner = `Empate entre: ${topLeagues.join(" vs ")}`;
      }
    } else {
      finalWinner = topLeagues[0] || "Pendente";
    }

    // Filtrar os votos da liga vencedora ou das empatadas para calcular as médias das regras
    const relevantVotes = isTie && !finalWinner.includes("Empate")
      ? votes.filter((v) => v.championshipChoice.trim() === finalWinner || v.tieBreakChoice === finalWinner)
      : votes.filter((v) => topLeagues.includes(v.championshipChoice.trim()));

    let sumTurn1 = 0;
    let sumTurn2 = 0;
    let sumPurchases = 0;

    relevantVotes.forEach((v) => {
      sumTurn1 += v.maxOverallTurn1;
      sumTurn2 += v.maxOverallTurn2;
      sumPurchases += v.maxPurchasesPerManager;
    });

    const count = relevantVotes.length || 1;

    return {
      winningLeague: finalWinner,
      leagueCounts: counts,
      isTie: isTie && finalWinner.startsWith("Empate"),
      tiedLeagues: topLeagues,
      avgMaxTurn1: Math.round(sumTurn1 / count),
      avgMaxTurn2: Math.round(sumTurn2 / count),
      avgMaxPurchases: Math.round(sumPurchases / count),
      totalVotes: votes.length,
    };
  }, [votes]);

  // Submissão do Login / Registo
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const endpoint = authMode === "login" ? "/api/osm/login" : "/api/osm/register";
    const payload =
      authMode === "login"
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const loggedUser = data.user;
        setManager(loggedUser);
        localStorage.setItem("osm_manager", JSON.stringify(loggedUser));
        notify(data.message || "Autenticado com sucesso!", "success");
        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");
        setIsVoteModalOpen(true);
      } else {
        notify(data.error || "Erro na autenticação.", "error");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro de conexão com o servidor.";
      notify(errorMessage, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setManager(null);
    localStorage.removeItem("osm_manager");
    setIsVoteModalOpen(false);
    setIsPurchaseModalOpen(false);
    notify("Sessão encerrada.", "success");
  };

  // Buscar Votos
  const fetchPollData = async () => {
    try {
      const url = manager?.id
        ? `/api/osm/transferencias?managerId=${manager.id}`
        : "/api/osm/transferencias";
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setVotes(data.votes || []);
        if (data.myVote) {
          setChampionshipChoice(data.myVote.championshipChoice);
          setMaxOverallTurn1(data.myVote.maxOverallTurn1);
          setMaxOverallTurn2(data.myVote.maxOverallTurn2);
          setMaxPurchases(data.myVote.maxPurchasesPerManager);
          if (data.myVote.tieBreakChoice) {
            setSelectedTieBreak(data.myVote.tieBreakChoice);
          }
        }
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar enquete:", err);
    }
  };

  // Buscar Compras
  const fetchTransfersData = async () => {
    setLoadingTransfers(true);
    try {
      const res = await fetch("/api/osm/compras");
      const data = await res.json();
      if (data.success) {
        setTransfers(data.transfers || []);
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar compras:", err);
    } finally {
      setLoadingTransfers(false);
    }
  };

  // Submeter Voto (Incluindo Escolha de Desempate se Houver)
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager) return notify("Inicie sessão para poder votar.", "error");

    setSubmittingVote(true);
    try {
      const res = await fetch("/api/osm/transferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: manager.id,
          championshipChoice,
          maxOverallTurn1,
          maxOverallTurn2,
          maxPurchasesPerManager: maxPurchases,
          tieBreakChoice: pollSummary.isTie ? selectedTieBreak : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify("Voto e preferências registados com sucesso!", "success");
        setIsVoteModalOpen(false);
        fetchPollData();
      } else {
        notify(data.error || "Erro ao guardar voto.", "error");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao votar.";
      notify(errorMessage, "error");
    } finally {
      setSubmittingVote(false);
    }
  };

  // Registo de Contratação (Aplica a Regra Decidida)
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager) return notify("Inicie sessão para registar compras.", "error");

    const currentMaxOverall = turn === 1 ? pollSummary.avgMaxTurn1 : pollSummary.avgMaxTurn2;

    if (playerOverall > currentMaxOverall) {
      return notify(
        `Atenção: O Overall do jogador (${playerOverall}) excede o limite estabelecido (${currentMaxOverall} OVR para o Turno ${turn}).`,
        "error"
      );
    }

    setSubmittingTransfer(true);

    try {
      const res = await fetch("/api/osm/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: manager.id,
          playerName,
          playerOverall,
          turn,
          maxPurchases: pollSummary.avgMaxPurchases,
          maxOverall: currentMaxOverall,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify("Jogador registado com sucesso!", "success");
        setPlayerName("");
        setIsPurchaseModalOpen(false);
        fetchTransfersData();
      } else {
        notify(data.error || "Erro ao registar jogador.", "error");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao registar compra.";
      notify(errorMessage, "error");
    } finally {
      setSubmittingTransfer(false);
    }
  };

  // Eliminar Contratação
  const handleDeleteTransfer = async (id: string) => {
    try {
      const res = await fetch(`/api/osm/compras?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify("Contratação removida!", "success");
        fetchTransfersData();
      } else {
        notify(data.error || "Erro ao remover.", "error");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao eliminar.";
      notify(errorMessage, "error");
    }
  };

  // Agrupamento de Transferências por Treinador
  const transfersByManager = transfers.reduce<
    Record<string, { managerName: string; managerId: string; items: TransferRecord[] }>
  >((acc, t) => {
    const key = t.managerId || t.managerName || "desconhecido";
    if (!acc[key]) {
      acc[key] = {
        managerId: t.managerId,
        managerName: t.managerName || "Treinador Sem Nome",
        items: [],
      };
    }
    acc[key].items.push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">Liga OSM - Mercado & Plantéis</h1>
            <p className="text-sm text-slate-400">1º Votação da Liga ➔ 2º Regras de Overall & Compras</p>
          </div>

          {manager ? (
            <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700">
              <div className="text-right">
                <span className="block text-xs text-slate-400">Treinador Conectado</span>
                <span className="font-semibold text-white">{manager.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition"
              >
                Sair
              </button>
            </div>
          ) : (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full">
              Sessão não iniciada
            </span>
          )}
        </header>

        {/* PAINEL DE RESULTADO: ETAPA 1 (LIGA) & ETAPA 2 (REGRAS DE OVERALL) */}
        <section className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          
          {/* PASSO 1: DECISÃO DA LIGA / AVISO DE EMPATE */}
          <div className="border-b border-slate-800/80 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span>1️⃣</span> 1ª Etapa: Liga Escolhida
              </span>
              {pollSummary.isTie && (
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full animate-pulse font-semibold">
                  ⚠️ Empate Detetado! Vote no Desempate
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-extrabold text-white">
                Liga Definida:{" "}
                <span className={pollSummary.isTie ? "text-amber-400" : "text-emerald-400"}>
                  {pollSummary.winningLeague}
                </span>
              </h2>
              <span className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                Total de votos: <strong>{pollSummary.totalVotes}</strong>
              </span>
            </div>

            {/* Votação detalhada das Ligas */}
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(pollSummary.leagueCounts).map(([league, count]) => {
                const isTied = pollSummary.tiedLeagues.includes(league);
                return (
                  <span
                    key={league}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      isTied && pollSummary.isTie
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold"
                        : league === pollSummary.winningLeague
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-slate-950/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    {league}: <strong>{count} voto(s)</strong> {isTied && pollSummary.isTie && "(Empatada)"}
                  </span>
                );
              })}
            </div>
          </div>

          {/* PASSO 2: INFORMAÇÃO DOS LIMITES ESTABELECIDOS DE OVERALL */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>2️⃣</span> 2ª Etapa: Limites Estabelecidos de Overall & Compras
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="block text-xs text-slate-400">Limite Max OVR</span>
                  <span className="text-xs text-slate-500">Turno 1</span>
                </div>
                <strong className="text-amber-400 text-xl font-mono">{pollSummary.avgMaxTurn1} OVR</strong>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="block text-xs text-slate-400">Limite Max OVR</span>
                  <span className="text-xs text-slate-500">Turno 2</span>
                </div>
                <strong className="text-amber-400 text-xl font-mono">{pollSummary.avgMaxTurn2} OVR</strong>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="block text-xs text-slate-400">Limite por Treinador</span>
                  <span className="text-xs text-slate-500">Total de Contratações</span>
                </div>
                <strong className="text-emerald-400 text-xl font-mono">{pollSummary.avgMaxPurchases} Jogadores</strong>
              </div>
            </div>
          </div>
        </section>

        {/* FEEDBACK */}
        {message && (
          <div
            className={`p-4 rounded-xl font-medium text-sm shadow-md transition-all ${
              message.type === "success"
                ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-300"
                : "bg-red-950/80 border border-red-500/30 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* LOGIN / REGISTO */}
        {!manager ? (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-200">
                {authMode === "login" ? "Entrar na Conta" : "Criar Nova Conta"}
              </h2>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === "login"
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === "register"
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Registar
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nome do Treinador"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              )}

              <input
                type="email"
                placeholder="Endereço de E-mail"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                required
              />

              <div className={`flex gap-2 ${authMode === "login" ? "md:col-span-2" : ""}`}>
                <input
                  type="password"
                  placeholder="Palavra-passe"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2 rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap"
                >
                  {authLoading ? "A processar..." : authMode === "login" ? "Entrar" : "Registar"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          /* BARRA DE AÇÕES DO TREINADOR */
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xl">
            <div>
              <h3 className="font-bold text-slate-200">Painel do Treinador</h3>
              <p className="text-xs text-slate-400">Participe da votação ou adicione contratações ao seu plantel</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsVoteModalOpen(true)}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                📊 Votar / Desempate
              </button>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                🛒 Registar Jogador
              </button>
            </div>
          </div>
        )}

        {/* RELAÇÃO DE TREINADORES E CONTRATAÇÕES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <span>👔</span> Plantéis na Liga ({pollSummary.winningLeague})
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-amber-400">
                Turno 1: Max <strong>{pollSummary.avgMaxTurn1} OVR</strong>
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-amber-400">
                Turno 2: Max <strong>{pollSummary.avgMaxTurn2} OVR</strong>
              </span>
            </div>
          </div>

          {loadingTransfers ? (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              A carregar lista de treinadores...
            </div>
          ) : Object.keys(transfersByManager).length === 0 ? (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-sm">
              Nenhuma contratação registada até ao momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(transfersByManager).map((group) => {
                const totalPurchases = group.items.length;
                const isLimitReached = totalPurchases >= pollSummary.avgMaxPurchases;

                return (
                  <div
                    key={group.managerId || group.managerName}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="font-bold text-lg text-emerald-400">
                            {group.managerName}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {totalPurchases} de {pollSummary.avgMaxPurchases} contratações permitidas
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isLimitReached
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isLimitReached ? "Limite Atingido" : "Vagas Abertas"}
                        </span>
                      </div>

                      <ul className="divide-y divide-slate-800/60 mt-3">
                        {group.items.map((item) => (
                          <li
                            key={item.id}
                            className="py-2.5 flex items-center justify-between text-sm hover:bg-slate-800/20 px-2 rounded-lg transition"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 font-medium">{item.playerName}</span>
                              <span className="text-xs text-slate-500">(Turno {item.turn})</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded text-xs font-mono font-bold text-amber-400">
                                {item.playerOverall} OVR
                              </span>

                              {manager?.id === item.managerId && (
                                <button
                                  onClick={() => handleDeleteTransfer(item.id)}
                                  className="text-xs text-red-400 hover:text-red-300 transition"
                                  title="Remover contratação"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MODAL 1: VOTAÇÃO E DESEMPATE */}
        {isVoteModalOpen && manager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5">
              <button
                onClick={() => setIsVoteModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
              
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>📊</span> Votação de Liga & Limites de Contratação
                </h2>
                <p className="text-xs text-slate-400">Defina a sua liga e proponha os limites de overall.</p>
              </div>

              <form onSubmit={handleVoteSubmit} className="space-y-4">
                
                {/* CAMPO DE DESEMPATE (SE HOUVER EMPATE NA LIGA) */}
                {pollSummary.isTie && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                      ⚡ Desempate Necessário: Escolha entre as Mais Votadas
                    </label>
                    <p className="text-xs text-slate-300">
                      Houve um empate no topo. Por favor, selecione qual destas opções prefere para desempatar:
                    </p>
                    <select
                      value={selectedTieBreak}
                      onChange={(e) => setSelectedTieBreak(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-sm focus:outline-none text-amber-200 font-semibold"
                      required
                    >
                      <option value="">-- Selecione para Desempatar --</option>
                      {pollSummary.tiedLeagues.map((league) => (
                        <option key={league} value={league}>
                          {league}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 1º PASSO DA VOTAÇÃO GERAL */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                    1. Sua Preferência Principal de Liga
                  </label>
                  <select
                    value={championshipChoice}
                    onChange={(e) => setChampionshipChoice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                  >
                    <option value="Premier League">Premier League</option>
                    <option value="Brasileirão">Brasileirão</option>
                    <option value="La Liga">La Liga</option>
                    <option value="Serie A Italy">Serie A Italy</option>
                    <option value="Champions League">Champions League</option>
                  </select>
                </div>

                {/* 2º PASSO DA VOTAÇÃO */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    2. Sugira os Limites de Overall para a Liga
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Max OVR Turno 1</label>
                      <input
                        type="number"
                        value={maxOverallTurn1}
                        onChange={(e) => setMaxOverallTurn1(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Max OVR Turno 2</label>
                      <input
                        type="number"
                        value={maxOverallTurn2}
                        onChange={(e) => setMaxOverallTurn2(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Nº Compras</label>
                      <input
                        type="number"
                        value={maxPurchases}
                        onChange={(e) => setMaxPurchases(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingVote}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {submittingVote ? "A guardar..." : "Confirmar Voto"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: COMPRA DE JOGADOR */}
        {isPurchaseModalOpen && manager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>🛒</span> Registar Contratação ({pollSummary.winningLeague})
                </h2>
                {/* Informação explícita do limite de Overall */}
                <p className="text-xs text-amber-400 font-semibold mt-1">
                  💡 Limite Máximo Permitido: {turn === 1 ? pollSummary.avgMaxTurn1 : pollSummary.avgMaxTurn2} OVR (Turno {turn})
                </p>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Jogador</label>
                  <input
                    type="text"
                    placeholder="Ex: Erling Haaland"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Overall do Jogador</label>
                    <input
                      type="number"
                      value={playerOverall}
                      onChange={(e) => setPlayerOverall(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Turno da Compra</label>
                    <select
                      value={turn}
                      onChange={(e) => setTurn(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                    >
                      <option value={1}>Turno 1 (Max: {pollSummary.avgMaxTurn1} OVR)</option>
                      <option value={2}>Turno 2 (Max: {pollSummary.avgMaxTurn2} OVR)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingTransfer}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {submittingTransfer ? "A guardar..." : "Registar Jogador"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}