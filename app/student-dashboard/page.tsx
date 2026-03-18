"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  ArrowRight, 
  Star, 
  Calendar,
  CheckCircle,
  TrendingUp,
  LayoutDashboard,
  GraduationCap,
  Award,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [studentDashboard, setStudentDashboard] = useState({
    total_activities_completed: 0,
    average_score: 0,
    subjects: [] as Array<{ subject: string; accuracy: number }>,
    activities: [] as any[],
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    const user = localStorage.getItem("authUser");
    if (user) setAuthUser(JSON.parse(user));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const [activitiesResponse, dashboardResponse] = await Promise.all([
        fetch(`${baseUrl}/api/v1/activity/active`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/v1/activity/student/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      if (activitiesResponse.ok) {
        const result = await activitiesResponse.json();
        if (result.success) setAtividades(Array.isArray(result.data) ? result.data : []);
      }

      if (dashboardResponse.ok) {
        const result = await dashboardResponse.json();
        if (result.success) {
          setStudentDashboard({
            total_activities_completed: result.data.total_activities_completed || 0,
            average_score: Number(result.data.average_score) || 0,
            subjects: result.data.subjects || [],
            activities: result.data.activities || [],
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const progressColors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-pink-500",
  ];

  const performanceByActivities = Object.values(
    studentDashboard.activities.reduce((acc, activity: any) => {
      const subject =
        activity.subject ||
        activity.exercise_subject ||
        activity.exercises?.[0]?.exercise_subject ||
        "Geral";

      const rawAccuracy =
        typeof activity.accuracy === "number"
          ? activity.accuracy
          : typeof activity.score === "number" && Number(activity.activity_value) > 0
            ? (Number(activity.score) / Number(activity.activity_value)) * 100
            : null;

      if (rawAccuracy === null) {
        return acc;
      }

      if (!acc[subject]) {
        acc[subject] = {
          subject,
          totalAccuracy: 0,
          count: 0,
        };
      }

      acc[subject].totalAccuracy += rawAccuracy;
      acc[subject].count += 1;

      return acc;
    }, {} as Record<string, { subject: string; totalAccuracy: number; count: number }>)
  ).map((item: any, index) => ({
    subject: item.subject,
    progress: Number((item.totalAccuracy / item.count).toFixed(1)) || 0,
    color: progressColors[index % progressColors.length],
  }));

  const fallbackPerformance = studentDashboard.subjects.map((item, index) => ({
    subject: item.subject,
    progress: Number(item.accuracy?.toFixed(1)) || 0,
    color: progressColors[index % progressColors.length],
  }));

  const performanceData = performanceByActivities.length > 0
    ? performanceByActivities
    : fallbackPerformance;

  const weakestSubject = performanceData.length > 0
    ? performanceData.reduce((lowest, current) =>
        current.progress < lowest.progress ? current : lowest
      )
    : { subject: "Seus estudos", progress: 0, color: "bg-blue-500" };

  const weakestApiSubject = studentDashboard.subjects.length > 0
    ? studentDashboard.subjects.reduce((lowest, current) =>
        Number(current.accuracy) < Number(lowest.accuracy) ? current : lowest
      )
    : null;

  const studyTipSubject = weakestApiSubject?.subject || weakestSubject.subject;
  const studyTip = {
    topic: "os conteúdos com menor aproveitamento",
    description: `Reserve um tempo extra para revisar ${studyTipSubject.toLowerCase()} e refazer exercícios recentes dessa matéria.`,
  };

  const bestSubject = performanceData.length > 0
    ? performanceData.reduce((highest, current) =>
        current.progress > highest.progress ? current : highest
      )
    : null;

  const stats = [
    { label: "Atividades Totais", value: atividades.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Média Geral", value: studentDashboard.average_score.toFixed(1), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Atividades Concluídas", value: studentDashboard.total_activities_completed, icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Melhor Aproveitamento", value: bestSubject ? `${bestSubject.progress.toFixed(1)}%` : "--", icon: Award, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const pendingActivitiesCount = atividades.filter((atividade) => !atividade.is_submitted).length;
  const sortedAtividades = [...atividades].sort(
    (a, b) => Number(Boolean(a.is_submitted)) - Number(Boolean(b.is_submitted))
  );

  const getActivitySubject = (atividade: any) =>
    atividade.subject ||
    atividade.exercise_subject ||
    atividade.exercises?.[0]?.exercise_subject ||
    "GERAL";

  const getSubjectBadgeClass = (subject: string) => {
    const normalizedSubject = subject.toUpperCase();

    if (normalizedSubject === "MATEMÁTICA") {
      return "bg-orange-100 text-orange-600";
    }

    if (normalizedSubject === "GEOGRAFIA") {
      return "bg-blue-100 text-blue-600";
    }

    return "bg-purple-100 text-purple-600";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden bg-blue-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-200 min-h-[420px] flex items-center justify-center">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/15 border border-white/20 backdrop-blur-xl flex items-center justify-center mb-6">
              <Loader2 size={40} className="animate-spin text-white" />
            </div>
            <h2 className="text-3xl font-black text-white">Carregando sua dashboard</h2>
            <p className="mt-3 text-blue-100 font-medium max-w-md">
              Estamos preparando suas atividades, desempenho e dicas de estudo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
      {/* SEÇÃO DE BOAS-VINDAS */}
      <section className="relative overflow-hidden bg-blue-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-200">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs font-bold uppercase tracking-widest"
            >
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              Portal do Estudante
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-white leading-tight"
            >
              Olá, {authUser?.name?.split(' ')[0] || "Estudante"}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-blue-100 text-lg max-w-md font-medium"
            >
              Você tem <span className="text-white font-bold">{pendingActivitiesCount} atividades</span> aguardando sua atenção hoje. Vamos brilhar?
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                href="/student-atividades"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Começar Atividades
                <ArrowRight size={18} strokeWidth={3} />
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="w-64 h-64 bg-white/10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-3xl">
              <GraduationCap size={120} className="text-white/90" />
            </div>
            {/* Decorações flutuantes */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-2xl rotate-12 flex items-center justify-center shadow-lg">
              <Trophy size={24} className="text-yellow-900" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-400 rounded-full border-4 border-blue-600 flex items-center justify-center">
              <CheckCircle size={32} className="text-white" />
            </div>
          </motion.div>
        </div>

        {/* Efeitos de Fundo */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none" />
      </section>

      {/* MÉTRICAS RÁPIDAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: ATIVIDADES RECENTES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Clock size={24} className="text-blue-600" />
              Recém-liberadas
            </h2>
            <Link href="/student-atividades" className="text-blue-600 text-sm font-bold hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedAtividades.slice(0, 4).map((atv, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  if (!atv.is_submitted) {
                    router.push("/student-atividades");
                  }
                }}
                className={`bg-white group p-6 rounded-3xl border shadow-sm transition-all ${
                  atv.is_submitted
                    ? "border-green-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/5"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tight ${getSubjectBadgeClass(getActivitySubject(atv))}`}>
                      {getActivitySubject(atv)}
                    </span>
                    {atv.is_submitted && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-tight text-green-700">
                        <CheckCircle size={12} />
                        Já feita
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(atv.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{atv.title}</h3>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400">{atv.activity_value} Pontos</span>
                    {atv.is_submitted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                        <Award size={14} />
                        Nota {atv.score ?? "--"}
                      </span>
                    )}
                  </div>
                  {atv.is_submitted ? (
                    <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100">
                      Concluída
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {atividades.length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">Nenhuma atividade nova disponível.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: DESEMPENHO E AVISOS */}
        <div className="space-y-8">
          {/* DESEMPENHO POR MATÉRIA */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-gray-900">Seu Progresso</h3>
            <div className="space-y-6">
              {performanceData.length > 0 ? performanceData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                    <span className="text-gray-500">{item.subject}</span>
                    <span className="text-gray-900">{item.progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Ainda não há dados suficientes para exibir seu progresso por matéria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DICA DE ESTUDO */}
          <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-blue-950 leading-tight">Dica de estudo personalizada</h3>
              <p className="text-sm text-blue-900 font-semibold">
                Você precisa estudar mais <span className="text-blue-600">{studyTip.topic}</span> em{" "}
                <span className="text-blue-600">{studyTipSubject}</span>.
              </p>
              <p className="text-sm text-blue-700 font-medium">
                {studyTip.description}
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <BookOpen size={120} />
            </div>
          </div>

          {/* LEMBRETE RÁPIDO */}
          <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <LayoutDashboard size={24} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-black text-orange-900 leading-tight">Dica do dia!</h3>
              <p className="text-sm text-orange-700 font-medium">
                Organize seu tempo e comece pelas atividades mais curtas para ganhar ritmo.
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Trophy size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
