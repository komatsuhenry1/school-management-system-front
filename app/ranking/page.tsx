"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  TrendingUp,
  Loader2,
  Crown,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type RankingStudent = {
  position: number;
  name: string;
  score: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/ranking`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Falha ao carregar ranking");

      const result = await response.json();
      if (result.success) {
        const normalizedRanking = Array.isArray(result.data)
          ? result.data
              .map((student: any, index: number) => ({
                position: Number(student.position) || index + 1,
                name: student.name || "Aluno",
                score: Number(student.score) || 0,
              }))
              .sort((a: RankingStudent, b: RankingStudent) => a.position - b.position)
              .slice(0, 5)
          : [];

        setRanking(normalizedRanking);
      } else {
        setRanking([]);
      }
    } catch (error) {
      console.error(error);
      setRanking([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0: return <Crown className="text-yellow-500" size={32} />;
      case 1: return <Medal className="text-gray-400" size={28} />;
      case 2: return <Medal className="text-orange-400" size={24} />;
      default: return <span className="text-gray-400 font-bold text-lg">{position + 1}º</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
      {/* HEADER DO RANKING */}
      <section className="text-center space-y-4 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-700 text-xs font-bold uppercase tracking-widest border border-yellow-100"
        >
          <Trophy size={14} className="fill-yellow-500 text-yellow-500" />
          Quadro de Honra
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Top 5 Estudantes
        </h1>
        <p className="text-gray-500 max-w-md mx-auto font-medium">
          Reconhecendo o esforço e a dedicação dos alunos com melhor desempenho acadêmico.
        </p>
      </section>

      {/* LISTA DO RANKING */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-500 font-medium italic">Calculando classificações...</p>
          </div>
        ) : ranking.length > 0 ? (
          ranking.map((aluno, index) => (
            <motion.div
              key={`${aluno.position}-${aluno.name}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden bg-white p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between shadow-sm hover:shadow-md ${
                index === 0 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50/30 to-white' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-6">
                {/* POSIÇÃO */}
                <div className="w-12 flex justify-center shrink-0">
                  {getRankIcon(aluno.position - 1)}
                </div>

                {/* AVATAR */}
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-white/50 font-bold text-xl">
                  {aluno.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                {/* INFO */}
                <div>
                  <h3 className={`text-xl font-bold ${index === 0 ? 'text-gray-900' : 'text-gray-800'}`}>
                    {aluno.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    {aluno.position}º lugar no ranking
                  </p>
                </div>
              </div>

              {/* SCORE */}
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pontos</p>
                <div className={`text-3xl font-black ${
                  index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-blue-600'
                }`}>
                  {aluno.score?.toFixed(1) || "0.0"}
                </div>
              </div>

              {/* Efeito de brilho para o 1º lugar */}
              {index === 0 && (
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-yellow-100/20 to-transparent pointer-events-none" />
              )}
            </motion.div>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <p className="text-base font-bold text-gray-700">Nenhum ranking disponível no momento.</p>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Assim que houver dados da turma, o top 5 aparecerá aqui.
            </p>
          </div>
        )}
      </div>

      {/* RODAPÉ DE MOTIVAÇÃO */}
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center gap-6 mt-12"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 text-white">
            <TrendingUp size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-blue-900 leading-tight">Continue evoluindo!</h4>
            <p className="text-sm text-blue-700 font-medium mt-1">
              O ranking é atualizado automaticamente. Realize suas atividades com atenção para subir no quadro de honra.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
