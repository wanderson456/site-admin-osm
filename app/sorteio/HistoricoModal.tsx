"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, X, Loader2 } from "lucide-react";

interface DrawRecord {
  id: string;
  leagueName: string;
  managerName: string;
  teamName: string;
  hasBonus: boolean;
  createdAt?: string;
}

interface HistoricoGrouped {
  leagueName: string;
  items: DrawRecord[];
}

interface HistoricoModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export default function HistoricoModal({ isOpen = false, onClose }: HistoricoModalProps) {
  const [groupedRecords, setGroupedRecords] = useState<HistoricoGrouped[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistorico();
    }
  }, [isOpen]);

  async function fetchHistorico() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/osm/historico");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar o histórico.");
      }

      const rawRecords: DrawRecord[] = data.data || [];

      // Agrupa os registros por Nome da Liga
      const groupedMap = rawRecords.reduce((acc, item) => {
        const key = item.leagueName || "Liga Sem Nome";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as Record<string, DrawRecord[]>);

      const groupedArray: HistoricoGrouped[] = Object.keys(groupedMap).map((league) => ({
        leagueName: league,
        items: groupedMap[league],
      }));

      setGroupedRecords(groupedArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171c1f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101416]">
          <div className="flex items-center gap-2">
            <Trophy className="text-emerald-400" size={22} />
            <h2 className="text-xl font-bold text-white">
              Histórico de Sorteios
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition rounded-lg p-1 hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
              <Loader2 className="animate-spin text-emerald-400" size={28} />
              <p className="text-sm">Buscando histórico no banco de dados...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-400 py-8">Erro: {error}</p>
          ) : groupedRecords.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Nenhum sorteio registrado até o momento.
            </p>
          ) : (
            groupedRecords.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="rounded-xl border border-white/10 bg-[#101416] overflow-hidden"
              >
                {/* Cabeçalho da Liga */}
                <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    <span className="font-bold text-white text-base">
                      {group.leagueName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {group.items.length} participante(s)
                  </span>
                </div>

                {/* Tabela da Liga (Técnico e Time na mesma linha) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#171c1f] text-gray-400 text-xs uppercase border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3">Técnico</th>
                        <th className="px-4 py-3">Time Sorteado</th>
                        <th className="px-4 py-3 text-center">Bônus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {group.items.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-white/[0.02] transition"
                        >
                          <td className="px-4 py-3.5 font-semibold text-white">
                            {record.managerName}
                          </td>
                          <td className="px-4 py-3.5 text-emerald-400 font-medium">
                            {record.teamName}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {record.hasBonus ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                                <Star size={11} className="fill-amber-400" /> Sim
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">Não</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-white/10 bg-[#101416] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}