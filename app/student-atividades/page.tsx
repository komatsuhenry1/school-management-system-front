"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Search,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Award
} from "lucide-react";
import { toast } from "sonner";

export default function StudentAtividadesPage() {
  const [atividades, setAtividades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    fetchAtividades();
  }, []);

  const fetchAtividades = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Falha ao carregar atividades');
      
      const result = await response.json();
      if (result.success) {
        setAtividades(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível carregar suas atividades." });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivitySubject = (atividade: any) =>
    atividade.subject ||
    atividade.exercise_subject ||
    atividade.exercises?.[0]?.exercise_subject ||
    "GERAL";

  const filteredAtividades = atividades
    .filter((atv) =>
      atv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActivitySubject(atv).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => Number(Boolean(a.is_submitted)) - Number(Boolean(b.is_submitted)));

  const getSubjectStyles = (subject: string) => {
    const normalizedSubject = subject.toUpperCase();

    if (normalizedSubject === "MATEMÁTICA") {
      return {
        accent: "bg-orange-400",
        badge: "bg-orange-50 text-orange-600",
      };
    }

    if (normalizedSubject === "GEOGRAFIA") {
      return {
        accent: "bg-blue-400",
        badge: "bg-blue-50 text-blue-600",
      };
    }

    return {
      accent: "bg-purple-400",
      badge: "bg-purple-50 text-purple-600",
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Minhas Atividades</h1>
          <p className="text-gray-500 mt-1">Acesse e realize as atividades liberadas pelos seus professores.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl flex items-center gap-2 font-semibold text-sm">
            <BookOpen size={18} />
            <span>{atividades.length} Atividades</span>
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por título ou matéria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-gray-500 font-medium">Carregando suas atividades...</p>
        </div>
      ) : filteredAtividades.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredAtividades.map((atv) => {
            const subject = getActivitySubject(atv);
            const subjectStyles = getSubjectStyles(subject);

            return (
              <div
                key={atv.id}
                className={`group bg-white border border-gray-200 rounded-3xl overflow-hidden transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 ${viewMode === 'list' ? 'flex items-center p-4' : 'flex flex-col'}`}
              >
                {/* INDICADOR DE MATÉRIA */}
                <div className={`h-2 w-full ${subjectStyles.accent} ${viewMode === 'list' ? 'hidden' : ''}`} />
                
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${subjectStyles.badge}`}>
                        {subject}
                      </span>
                      {atv.is_submitted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-green-50 text-green-700">
                          <CheckCircle size={12} />
                          Já realizada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-400 text-xs gap-1.5 font-medium">
                      <Calendar size={14} />
                      {new Date(atv.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                    {atv.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                    {atv.description || "Nenhuma descrição fornecida para esta atividade."}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Questões</span>
                        <span className="text-sm font-bold text-gray-800">{(atv.exercises || []).length}</span>
                      </div>
                      <div className="w-[1px] h-8 bg-gray-100" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Valor</span>
                        <span className="text-sm font-bold text-gray-800">{atv.activity_value} pts</span>
                      </div>
                      {atv.is_submitted && (
                        <>
                          <div className="w-[1px] h-8 bg-gray-100" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Nota</span>
                            <span className="text-sm font-bold text-green-700 inline-flex items-center gap-1">
                              <Award size={14} />
                              {atv.score ?? "--"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {atv.is_submitted ? (
                      <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-2xl text-sm font-bold border border-green-100">
                        <CheckCircle size={16} />
                        Já fez
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push(`/realizar-atividade/${atv.id}`)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 group-hover:translate-x-1"
                      >
                        Realizar
                        <ChevronRight size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            {searchTerm ? <Search size={40} /> : <AlertCircle size={40} />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade disponível'}
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchTerm 
              ? `Não encontramos resultados para "${searchTerm}". Tente buscar por outro termo.` 
              : 'Você ainda não possui atividades liberadas para realizar. Fique atento às orientações dos seus professores.'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-6 text-blue-600 font-bold hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
