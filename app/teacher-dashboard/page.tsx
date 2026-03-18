"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock3,
  GraduationCap,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

type Activity = {
  id: string;
  title: string;
  subject?: string;
  created_at?: string;
  status?: string;
  activity_value?: number;
  exercises?: Array<{ exercise_subject?: string }>;
};

type DashboardResponse = {
  metrics?: {
    class_average?: number;
    highest_score?: number;
    lowest_score?: number;
    total_submissions?: number;
  };
  hardest_questions?: Array<{
    id?: string;
    question?: string;
    subject?: string;
    error_percentage?: number | string;
    percentage?: number | string;
  }>;
  students?: Array<{ name?: string; score?: number | string }>;
};

export default function TeacherDashboardPage() {
  const [authUser, setAuthUser] = useState<{ name?: string } | null>(null);
  const [atividades, setAtividades] = useState<Activity[]>([]);
  const [selectedAtvId, setSelectedAtvId] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      setAuthUser(raw ? JSON.parse(raw) : null);
    } catch {
      setAuthUser(null);
    }
    fetchAtividades();
  }, []);

  useEffect(() => {
    if (selectedAtvId) {
      fetchDashboard(selectedAtvId);
    }
  }, [selectedAtvId]);

  const fetchAtividades = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Falha ao carregar atividades");

      const result = await response.json();
      if (result.success) {
        const orderedActivities = [...(result.data || [])].sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setAtividades(orderedActivities);
        if (orderedActivities.length > 0) {
          setSelectedAtvId(orderedActivities[0].id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro", {
        description: "Não foi possível carregar a dashboard do professor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboard = async (id: string) => {
    setIsLoadingDashboard(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/${id}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Falha ao carregar métricas");

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro", {
        description: "Não foi possível carregar os dados da atividade selecionada.",
      });
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const selectedAtividade = useMemo(
    () => atividades.find((atividade) => atividade.id === selectedAtvId) || null,
    [atividades, selectedAtvId]
  );

  const releasedActivities = atividades.filter(
    (atividade) => atividade.status?.toUpperCase() === "ACTIVE"
  ).length;

  const metrics = {
    class_average: Number(dashboardData?.metrics?.class_average) || 0,
    highest_score: Number(dashboardData?.metrics?.highest_score) || 0,
    lowest_score: Number(dashboardData?.metrics?.lowest_score) || 0,
    total_submissions: Number(dashboardData?.metrics?.total_submissions) || 0,
  };

  const studentsCount = dashboardData?.students?.length || 0;
  const submissionPercentage =
    studentsCount > 0 ? Math.round((metrics.total_submissions / studentsCount) * 100) : 0;
  const hardestQuestions = dashboardData?.hardest_questions || [];
  const mainDifficulty = hardestQuestions[0];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="min-h-[420px] rounded-[2.5rem] bg-blue-600 shadow-2xl shadow-blue-200 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 size={42} className="animate-spin mx-auto mb-4" />
            <h2 className="text-3xl font-black">Carregando dashboard do professor</h2>
            <p className="mt-2 text-blue-100 font-medium">
              Estamos preparando suas métricas e alertas da turma.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (atividades.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={38} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Nenhuma atividade encontrada</h1>
          <p className="mt-3 text-gray-500 font-medium">
            Crie sua primeira atividade para começar a acompanhar o desempenho da turma.
          </p>
          <Link
            href="/atividades"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Ir para Atividades
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-8 md:p-12 shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500 blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
              <Sparkles size={14} className="fill-yellow-400 text-yellow-400" />
              Painel do Professor
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Olá, {authUser?.name?.split(" ")[0] || "Professor"}!
            </h1>
            <p className="max-w-2xl text-lg font-medium text-blue-100">
              Acompanhe rapidamente o desempenho da sua turma e identifique os principais pontos de dificuldade.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/atividades"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Gerenciar Atividades
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/alunos"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition-colors"
              >
                Ver Alunos
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex h-56 w-56 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-3xl">
            <GraduationCap size={110} className="text-white/90" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Atividades Criadas",
            value: atividades.length,
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Atividades Liberadas",
            value: releasedActivities,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Média da Turma",
            value: metrics.class_average.toFixed(1),
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Total de Respostas",
            value: studentsCount > 0 ? `${submissionPercentage}%` : metrics.total_submissions,
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-5"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight text-gray-400">{item.label}</p>
              <p className="text-2xl font-black text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 space-y-8">
          <div className="rounded-[2rem] border border-red-100 bg-gradient-to-br from-red-50 via-orange-50 to-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle size={28} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-red-600">
                  Alerta de dificuldade da turma
                </p>
                <h2 className="mt-2 text-2xl font-black text-gray-900">
                  {mainDifficulty
                    ? "Maior ponto de atenção identificado"
                    : "Ainda não há alerta crítico disponível"}
                </h2>
                <p className="mt-3 text-sm font-medium text-gray-600">
                  {mainDifficulty
                    ? `Na atividade "${selectedAtividade?.title}", a maior dificuldade da turma está em "${mainDifficulty.question || mainDifficulty.subject || mainDifficulty.id || "uma questão"}", com ${mainDifficulty.error_percentage || mainDifficulty.percentage || 0}% de erro.`
                    : "Quando os alunos começarem a responder a atividade selecionada, esta área mostrará onde a turma está errando mais."}
                </p>
              </div>
            </div>

            {hardestQuestions.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {hardestQuestions.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item.id || item.question || index}`}
                    className="rounded-2xl border border-red-100 bg-white/80 p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                      Dificuldade {index + 1}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">
                      {item.question || item.subject || item.id || "Questão"}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-600">
                      <TrendingDown size={14} />
                      {item.error_percentage || item.percentage || 0}% de erro
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Atividade em análise</h2>
                <p className="text-sm font-medium text-gray-500">
                  Selecione uma atividade para visualizar o desempenho detalhado da turma.
                </p>
              </div>
              {isLoadingDashboard && <Loader2 size={20} className="animate-spin text-blue-600" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {atividades.slice(0, 6).map((atividade) => {
                const isActive = atividade.id === selectedAtvId;
                const isReleased = atividade.status?.toUpperCase() === "ACTIVE";

                return (
                  <button
                    key={atividade.id}
                    onClick={() => setSelectedAtvId(atividade.id)}
                    className={`text-left rounded-2xl border p-5 transition-all ${
                      isActive
                        ? "border-blue-600 ring-2 ring-blue-600/15 bg-blue-50/70"
                        : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-600">
                          {atividade.subject || atividade.exercises?.[0]?.exercise_subject || "Geral"}
                        </span>
                        {isReleased && (
                          <span className="block w-fit rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                            Liberada
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                        <CheckCircle size={16} />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 text-base font-bold text-gray-900 line-clamp-2">
                      {atividade.title}
                    </h3>
                    <p className="mt-3 text-xs font-medium text-gray-400">
                      {atividade.created_at
                        ? new Date(atividade.created_at).toLocaleDateString("pt-BR")
                        : "Sem data"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-8">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Atividade selecionada
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900">
              {selectedAtividade?.title || "Selecione uma atividade"}
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {selectedAtividade?.subject || selectedAtividade?.exercises?.[0]?.exercise_subject || "Geral"}
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Média da turma
                </p>
                <p className="mt-2 text-4xl font-black text-blue-600">
                  {metrics.class_average.toFixed(1)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Maior nota
                  </p>
                  <p className="mt-2 text-2xl font-black text-gray-900">
                    {metrics.highest_score.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Menor nota
                  </p>
                  <p className="mt-2 text-2xl font-black text-gray-900">
                    {metrics.lowest_score.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Entregas da turma
                </p>
                <p className="mt-2 text-2xl font-black text-gray-900">
                  {studentsCount > 0
                    ? `${submissionPercentage}% (${metrics.total_submissions}/${studentsCount})`
                    : metrics.total_submissions}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900">Resumo rápido</h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <Clock3 size={18} className="text-blue-600" />
                <p className="text-sm font-medium text-gray-700">
                  {atividades.length} atividades cadastradas para acompanhamento.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <Users size={18} className="text-blue-600" />
                <p className="text-sm font-medium text-gray-700">
                  {studentsCount} alunos considerados na atividade selecionada.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <AlertTriangle size={18} className="text-orange-600" />
                <p className="text-sm font-medium text-gray-700">
                  {hardestQuestions.length > 0
                    ? `${hardestQuestions.length} pontos de dificuldade identificados.`
                    : "Nenhuma dificuldade crítica identificada até o momento."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
