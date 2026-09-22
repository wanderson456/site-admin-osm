import Link from "next/link";

interface OSMPlayer {
  id?: number;
  player_id?: number;
  name?: string;
  full_name?: string;
  position?: number | string;
  specific_position?: number | string;
  position_name?: string;
  role?: string;
  main_rating?: number;
  rating?: number;
  stat_att?: number;
  stat_def?: number;
  stat_ovr?: number;
  age?: number;
  nationality_name?: string;
  base_value?: number;
  value?: number;
  team_name?: string;
  [key: string]: any;
}

/**
 * Formata o valor monetário bruto para o formato compacto do OSM (ex: € 8.2M, € 500K)
 */
function formatCurrency(val: number | string | undefined): string {
  if (val === undefined || val === null || val === "") return "N/A";

  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "N/A";

  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    const cleanFormatted = formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted;
    return `€ ${cleanFormatted}M`;
  }

  if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(0);
    return `€ ${formatted}K`;
  }

  return `€ ${num}`;
}

/**
 * Identifica a categoria do setor (1: GOL, 2: DEF, 3: MEI, 4: ATA)
 */
function getPlayerCategory(player: OSMPlayer): number {
  const rawPos = player.position ?? player.specific_position;
  const att = Number(player.stat_att ?? 0);
  const def = Number(player.stat_def ?? 0);

  if (typeof rawPos === "string") {
    const p = rawPos.toUpperCase();
    if (p.includes("GOL") || p.includes("GK") || p === "G") return 1;
    if (p.includes("DEF") || p.includes("CB") || p.includes("LB") || p.includes("RB") || p === "D") return 2;
    if (p.includes("MID") || p.includes("MEI") || p.includes("CAM") || p.includes("CDM") || p === "M") return 3;
    if (p.includes("ATT") || p.includes("ATA") || p.includes("FW") || p.includes("ST") || p === "A") return 4;
  }

  if (att === 0 && def > 0) return 1;
  if (def > att + 10) return 2;
  if (Math.abs(att - def) <= 10) return 3;
  if (att > def) return 4;

  return 3;
}

/**
 * Retorna a sigla exata da Posição Específica do jogador
 */
function getSpecificPosition(player: OSMPlayer, category: number): string {
  // 1. Se houver campo de texto explícito na API do OSM
  const directSpec = player.specific_position || player.position_name || player.role;
  if (typeof directSpec === "string" && directSpec.trim() !== "" && isNaN(Number(directSpec))) {
    return directSpec.toUpperCase();
  }

  const att = Number(player.stat_att ?? 0);
  const def = Number(player.stat_def ?? 0);

  // 2. Mapeamento preciso por estatísticas de Ataque e Defesa no OSM
  switch (category) {
    case 1:
      return "GOL";
    case 2:
      // Zagueiro: Defesa alta e Ataque baixo (<= 20)
      if (att <= 20) return "ZAG";
      // Lateral: Apoia o ataque no OSM (> 20 de ataque)
      return "LAT";
    case 3:
      // Volante: Defesa maior que o ataque
      if (def > att) return "VOL";
      // Meia Ofensivo (CAM/MEI): Ataque maior que defesa
      if (att > def) return "CAM";
      // Meia Central (MC): Equilibrado
      return "MC";
    case 4:
      // Ponta (PE/PD): Atacante com participação na defesa (>= 20)
      if (def >= 20) return "PONTA";
      // Centroavante (ST/CA): Ataque muito alto e defesa nula
      return "ST";
    default:
      return "LIN";
  }
}

function parsePositionStyle(category: number) {
  switch (category) {
    case 1:
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case 2:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case 3:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case 4:
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

async function getPlayers(teamId: string, leagueId: string) {
  try {
    const url = `https://osmhelper.com/api/fetch_players.php?team_id=${teamId}&league_id=${leagueId}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { players: [], error: `Erro HTTP ${res.status} da API externa.` };
    }

    const data = await res.json();

    if (Array.isArray(data)) return { players: data as OSMPlayer[], error: null };
    if (data?.players && Array.isArray(data.players)) return { players: data.players as OSMPlayer[], error: null };
    if (data?.data && Array.isArray(data.data)) return { players: data.data as OSMPlayer[], error: null };

    return { players: [], error: "Formato de dados não reconhecido pela API." };
  } catch (err: any) {
    return { players: [], error: err?.message || "Erro de conexão com a API." };
  }
}

export default async function TeamPlayersPage(props: {
  params: Promise<Record<string, string | undefined>>;
}) {
  const rawParams = (await props.params) || {};

  const leagueId =
    rawParams.leagueId ||
    rawParams.league_id ||
    rawParams.league ||
    Object.values(rawParams)[0] ||
    "";

  const teamId =
    rawParams.teamId ||
    rawParams.team_id ||
    rawParams.team ||
    Object.values(rawParams)[1] ||
    "";

  if (!leagueId || !teamId) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 border border-red-500/30 rounded-xl bg-red-950/20 text-white space-y-4">
        <h2 className="text-xl font-bold text-red-400">Falha ao identificar os parâmetros da rota</h2>
        <p className="text-sm text-gray-300">
          O Next.js não encontrou os identificadores na URL.
        </p>
        <div className="p-4 bg-black/50 rounded border border-white/10 font-mono text-xs space-y-1">
          <p className="text-gray-400">// Parâmetros detectados na rota:</p>
          <pre>{JSON.stringify(rawParams, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const { players, error } = await getPlayers(teamId, leagueId);
  const teamName = players[0]?.team_name || "Elenco do Time";

  const sections = [
    { title: "Goleiros", code: 1, color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
    { title: "Defensores", code: 2, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
    { title: "Meio-Campistas", code: 3, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    { title: "Atacantes", code: 4, color: "text-red-400 border-red-500/30 bg-red-500/10" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      <Link
        href={`/campeonatos/${leagueId}`}
        className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        ← Voltar para os times
      </Link>

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{teamName}</h1>
          <p className="text-xs text-gray-500 mt-1">
            Liga ID: <span className="text-emerald-400 font-mono">{leagueId}</span> | Time ID: <span className="text-emerald-400 font-mono">{teamId}</span>
          </p>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          Total: {players.length} Jogadores
        </span>
      </div>

      {error ? (
        <div className="p-8 border border-red-500/20 rounded-xl bg-red-500/5 text-red-400 text-center">
          <p className="font-bold">Falha ao carregar jogadores</p>
          <p className="text-xs mt-1 text-red-300/80">{error}</p>
        </div>
      ) : players.length === 0 ? (
        <div className="p-12 text-center border border-white/10 rounded-xl bg-[#171b1e] text-gray-400">
          Nenhum jogador encontrado para este time nesta liga.
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => {
            const groupPlayers = players
              .filter((p) => getPlayerCategory(p) === section.code)
              .sort((a, b) => {
                const ovrA = a.main_rating ?? a.rating ?? 0;
                const ovrB = b.main_rating ?? b.rating ?? 0;
                return ovrB - ovrA;
              });

            if (groupPlayers.length === 0) return null;

            return (
              <section key={section.code} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className={`text-lg font-bold px-3 py-1 rounded-lg border ${section.color}`}>
                    {section.title}
                  </h2>
                  <span className="text-xs font-medium text-gray-400">
                    ({groupPlayers.length})
                  </span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupPlayers.map((player, index) => {
                    const playerId = player.id || player.player_id || index;
                    const playerName = player.full_name || player.name || `Jogador ${index + 1}`;
                    const rating = player.main_rating ?? player.rating ?? "N/A";
                    const category = getPlayerCategory(player);
                    const styleColor = parsePositionStyle(category);
                    const specificPos = getSpecificPosition(player, category);
                    const value = player.base_value ?? player.value;

                    return (
                      <div
                        key={playerId}
                        className="p-4 border border-white/10 rounded-xl bg-[#171b1e] hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-base text-white leading-tight">
                              {playerName}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {player.nationality_name ? `🌍 ${player.nationality_name}` : ""}
                              {player.age ? ` • ${player.age} anos` : ""}
                            </p>
                          </div>
                          
                          {/* Badge principal com a Posição Específica (ex: ZAG, LAT, VOL, CAM, ST) */}
                          <span
                            className={`shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-md border tracking-wider uppercase ${styleColor}`}
                          >
                            {specificPos}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-white/10 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Força Geral (OVR):</span>
                            <span className="font-extrabold text-white text-sm bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {rating}
                            </span>
                          </div>

                          {(player.stat_att !== undefined || player.stat_def !== undefined) && (
                            <div className="flex justify-between items-center text-gray-400">
                              <span>Ataque / Defesa:</span>
                              <span className="font-medium text-gray-200">
                                {player.stat_att ?? 0} / {player.stat_def ?? 0}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-400">Valor de Mercado:</span>
                            <span className="font-semibold text-emerald-400">
                              {formatCurrency(value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}