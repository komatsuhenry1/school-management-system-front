"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Check, MoreHorizontal, TrendingUp, TrendingDown, Search, Download, User, Trash2, Edit2, Rocket, EyeOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function AtividadesPage() {
  const [selectedAtvId, setSelectedAtvId] = useState<string | number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isActivitySelectorOpen, setIsActivitySelectorOpen] = useState(false);
  const [atividadesApi, setAtividadesApi] = useState<any[]>([]);
  const [atvDashboardData, setAtvDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const questionsEndRef = useRef<HTMLDivElement>(null);
  const creationSectionRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Efeito para carregar as atividades da API
  useEffect(() => {
    fetchAtividades();
  }, []);

  // Efeito para carregar o dashboard da atividade selecionada
  useEffect(() => {
    if (selectedAtvId && selectedAtvId !== 1 && typeof selectedAtvId === 'string') {
      fetchAtvDashboard(selectedAtvId);
    } else {
      setAtvDashboardData(null);
    }
  }, [selectedAtvId]);

  useEffect(() => {
    if (isStudentModalOpen || isActivitySelectorOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isStudentModalOpen, isActivitySelectorOpen]);

  const fetchAtvDashboard = async (id: string) => {
    setIsLoadingDashboard(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/${id}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Falha ao carregar métricas');
      const result = await response.json();
      if (result.success) {
        setAtvDashboardData(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível carregar as métricas desta atividade." });
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchAtividades = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Falha ao carregar atividades');
      const result = await response.json();
      if (result.success) {
        const activities = Array.isArray(result.data) ? result.data : [];
        setAtividadesApi(activities);
        if (activities.length > 0 && selectedAtvId === 1) {
          setSelectedAtvId(activities[0].id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível carregar a lista de atividades." });
    } finally {
      setIsLoading(false);
    }
  };

  // Estados para o formulário de criação
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    subject: "",
    points: "10",
    questions: [
      { id: 1, text: "", points: "1.0", exercise_subject: "", alternatives: ["", ""], correctIndex: 0 }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para o formulário de edição
  const [editActivity, setEditActivity] = useState({
    id: 0,
    title: "",
    description: "",
    subject: "",
    points: "",
    questions: [] as any[]
  });

  // Efeito para scroll automático ao abrir criação/edição
  useEffect(() => {
    if (isCreating || isEditing) {
      setTimeout(() => {
        creationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isCreating, isEditing]);

  // Efeito para scroll automático ao adicionar questão
  useEffect(() => {
    if ((isCreating || isEditing) && (isEditing ? editActivity.questions.length : newActivity.questions.length) > 1) {
      questionsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [newActivity.questions.length, editActivity.questions.length, isCreating, isEditing]);

  const handleAddQuestion = () => {
    if (isEditing) {
      setEditActivity(prev => ({
        ...prev,
        questions: [
          ...prev.questions,
          { id: Date.now(), text: "", points: "1.0", exercise_subject: "", alternatives: ["", ""], correctIndex: 0 }
        ]
      }));
    } else {
      setNewActivity(prev => ({
        ...prev,
        questions: [
          ...prev.questions,
          { id: Date.now(), text: "", points: "1.0", exercise_subject: "", alternatives: ["", ""], correctIndex: 0 }
        ]
      }));
    }
  };

  const handleRemoveQuestion = (qId: number) => {
    if (isEditing) {
      if (editActivity.questions.length > 1) {
        setEditActivity({
          ...editActivity,
          questions: editActivity.questions.filter((q: any) => q.id !== qId)
        });
      }
    } else {
      if (newActivity.questions.length > 1) {
        setNewActivity({
          ...newActivity,
          questions: newActivity.questions.filter((q: any) => q.id !== qId)
        });
      }
    }
  };

  const handleAddAlternative = (qId: number) => {
    if (isEditing) {
      setEditActivity(prev => ({
        ...prev,
        questions: prev.questions.map((q: any) => {
          if (q.id === qId && q.alternatives.length < 5) {
            return { ...q, alternatives: [...q.alternatives, ""] };
          }
          return q;
        })
      }));
    } else {
      setNewActivity(prev => ({
        ...prev,
        questions: prev.questions.map((q: any) => {
          if (q.id === qId && q.alternatives.length < 5) {
            return { ...q, alternatives: [...q.alternatives, ""] };
          }
          return q;
        })
      }));
    }
  };

  const updateQuestion = (qId: number, field: string, value: any) => {
    if (isEditing) {
      setEditActivity(prev => ({
        ...prev,
        questions: prev.questions.map((q: any) => 
          q.id === qId ? { ...q, [field]: value } : q
        )
      }));
    } else {
      setNewActivity(prev => ({
        ...prev,
        questions: prev.questions.map((q: any) => 
          q.id === qId ? { ...q, [field]: value } : q
        )
      }));
    }
  };

  const updateAlternative = (qId: number, altIndex: number, value: string) => {
    if (isEditing) {
      setEditActivity(prev => ({
        ...prev,
        questions: prev.questions.map((q: any) => {
          if (q.id === qId) {
            const newAlts = [...q.alternatives];
            newAlts[altIndex] = value;
            return { ...q, alternatives: newAlts };
          }
          return q;
        })
      }));
    } else {
      setNewActivity(prev => ({
        ...prev,
        questions: prev.questions.map((q: any) => {
          if (q.id === qId) {
            const newAlts = [...q.alternatives];
            newAlts[altIndex] = value;
            return { ...q, alternatives: newAlts };
          }
          return q;
        })
      }));
    }
  };

  const handleStartEdit = () => {
    if (!selectedAtv) {
      toast.warning("Nenhuma atividade selecionada", {
        description: "Selecione uma atividade para editar."
      });
      return;
    }

    setEditActivity({
      id: selectedAtv.id,
      title: selectedAtv.title,
      description: selectedAtv.description || "",
      subject: selectedAtv.subject || (selectedAtv.exercises?.[0]?.exercise_subject) || "",
      points: selectedAtv.activity_value?.toString() || "10",
      questions: (selectedAtv.exercises || []).map((ex: any) => ({
        id: ex.id,
        text: ex.question,
        points: ex.exercise_value?.toString() || "1.0",
        exercise_subject: ex.exercise_subject,
        alternatives: (ex.alternatives || []).map((alt: any) => alt.value),
        correctIndex: (ex.alternatives || []).findIndex((alt: any) => alt.value === ex.answer)
      }))
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveActivity = async () => {
    if (!newActivity.title || !newActivity.description || !newActivity.subject) {
      toast.warning("Campos obrigatórios", {
        description: "Por favor, preencha o título, a descrição e a matéria da atividade."
      });
      return;
    }

    const activityPoints = Number(parseFloat(newActivity.points).toFixed(2));
    const questionsPoints = Number(
      newActivity.questions
        .reduce((total, question) => total + (parseFloat(question.points) || 0), 0)
        .toFixed(2)
    );

    if (questionsPoints !== activityPoints) {
      toast.warning("Pontuação inconsistente", {
        description: `A soma dos pontos das questões (${questionsPoints}) deve ser exatamente igual ao valor da atividade (${activityPoints}).`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: newActivity.title,
        description: newActivity.description,
        subject: newActivity.subject,
        activity_value: parseFloat(newActivity.points),
        exercises: newActivity.questions.map((q, index) => ({
          exercise_number: index + 1,
          exercise_subject: q.exercise_subject || newActivity.subject,
          question: q.text,
          answer: q.alternatives[q.correctIndex],
          exercise_value: parseFloat(q.points),
          alternatives: q.alternatives.map((alt, altIndex) => ({
            letter: String.fromCharCode(65 + altIndex),
            value: alt
          }))
        }))
      };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Falha ao salvar');
      toast.success("Sucesso!", { description: "Atividade criada com sucesso." });
      setIsCreating(false);
      fetchAtividades(); // Recarregar lista
      setNewActivity({ title: "", description: "", subject: "GEOGRAFIA", points: "10", questions: [{ id: 1, text: "", points: "1.0", exercise_subject: "", alternatives: ["", ""], correctIndex: 0 }] });
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível salvar." });
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateActivity = async () => {
    if (!editActivity.title || !editActivity.description || !editActivity.subject) {
      toast.warning("Campos obrigatórios", { description: "Preencha título, descrição e matéria." });
      return;
    }

    const activityPoints = Number(parseFloat(editActivity.points).toFixed(2));
    const questionsPoints = Number(
      editActivity.questions
        .reduce((total, question) => total + (parseFloat(question.points) || 0), 0)
        .toFixed(2)
    );

    if (questionsPoints !== activityPoints) {
      toast.warning("Pontuação inconsistente", {
        description: `A soma dos pontos das questões (${questionsPoints}) deve ser exatamente igual ao valor da atividade (${activityPoints}).`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: editActivity.title,
        description: editActivity.description,
        subject: editActivity.subject,
        activity_value: parseFloat(editActivity.points),
        exercises: editActivity.questions.map((q, index) => ({
          exercise_number: index + 1,
          exercise_subject: q.exercise_subject || editActivity.subject,
          question: q.text,
          answer: q.alternatives[q.correctIndex],
          exercise_value: parseFloat(q.points),
          alternatives: q.alternatives.map((alt: string, altIndex: number) => ({
            letter: String.fromCharCode(65 + altIndex),
            value: alt
          }))
        }))
      };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/${editActivity.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Falha ao atualizar');
      toast.success("Sucesso!", { description: "Atividade atualizada com sucesso." });
      setIsEditing(false);
      fetchAtividades(); // Recarregar lista
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível atualizar." });
    } finally { setIsSubmitting(false); }
  };

  const handleReleaseActivity = async (id: number | string) => {
    setIsReleasing(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/${id}/release`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Falha ao liberar atividade');
      
      toast.success("Atividade Liberada!", { 
        description: "Os alunos já podem visualizar e realizar esta atividade." 
      });
      fetchAtividades();
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível liberar a atividade no momento." });
    } finally {
      setIsReleasing(false);
    }
  };

  const handleHideActivity = async (id: number | string) => {
    setIsReleasing(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/activity/${id}/release`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Falha ao ocultar atividade');
      
      toast.info("Atividade Ocultada", { 
        description: "Os alunos não podem mais visualizar esta atividade." 
      });
      fetchAtividades();
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível ocultar a atividade no momento." });
    } finally {
      setIsReleasing(false);
    }
  };

  const displayAtividades = atividadesApi.map(atv => ({
    ...atv,
    subject: atv.subject || (atv.exercises?.[0]?.exercise_subject?.toUpperCase()) || "GERAL",
    date: atv.date || new Date(atv.created_at).toLocaleDateString(),
    responses: atv.responses || `${atv.exercises?.length || 0} Questões`,
    average: atv.activity_value?.toString() || "0",
    trend: "+0.0",
    highest: "0.0",
    lowest: "0.0",
    percentage: "0%",
    details: `${atv.exercises?.length || 0} questões`,
  }));

  const selectedAtv = displayAtividades.find(a => a.id === selectedAtvId) || displayAtividades[0] || null;

  // Mesclar dados básicos com dados do dashboard
  const metrics = atvDashboardData?.metrics ? {
    class_average: atvDashboardData.metrics.class_average,
    highest_score: atvDashboardData.metrics.highest_score,
    lowest_score: atvDashboardData.metrics.lowest_score,
    total_submissions: atvDashboardData.metrics.total_submissions
  } : {
    class_average: selectedAtv?.average || 0,
    highest_score: selectedAtv?.highest || 0,
    lowest_score: selectedAtv?.lowest || 0,
    total_submissions: selectedAtv?.responses || "0"
  };

  const totalStudentsCount = atvDashboardData?.students?.length || 0;
  const submissionPercentage = totalStudentsCount > 0 
    ? Math.round((Number(metrics.total_submissions) / totalStudentsCount) * 100) 
    : 0;

  const hardestQuestions = atvDashboardData 
    ? (atvDashboardData.hardest_questions || []) 
    : [];

  const studentsList = (atvDashboardData 
    ? (atvDashboardData.students || []) 
    : [])
    .sort((a: any, b: any) => {
      const submittedA = a.submitted ? 1 : 0;
      const submittedB = b.submitted ? 1 : 0;

      if (submittedB !== submittedA) {
        return submittedB - submittedA;
      }

      return (Number(b.score) || 0) - (Number(a.score) || 0);
    });

  const filteredStudents = studentsList.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const desempenhoPorMateria = [
    { subject: "Geografia", percentage: 75, color: "bg-blue-600" },
    { subject: "Matemática", percentage: 80, color: "bg-blue-600" },
    { subject: "Português", percentage: 60, color: "bg-blue-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* SEÇÃO: SUAS ATIVIDADES */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-gray-600 font-bold uppercase text-xs tracking-widest">Suas Atividades</h2>
          <button 
            onClick={() => setIsActivitySelectorOpen(true)}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            Ver Histórico Completo
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => { setIsCreating(!isCreating); setIsEditing(false); }}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer min-h-[160px] ${
              isCreating ? 'border-orange-400 bg-orange-50/50' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-lg transition-colors ${
              isCreating ? 'bg-orange-500 shadow-orange-200' : 'bg-blue-600 shadow-blue-200'
            }`}>
              {isCreating ? <MoreHorizontal size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={3} />}
            </div>
            <span className={`font-bold text-sm ${isCreating ? 'text-orange-600' : 'text-blue-600'}`}>
              {isCreating ? 'Cancelar' : 'Nova Atividade'}
            </span>
          </div>

          {isLoading ? (
            <div className="md:col-span-3 flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : displayAtividades.map((atv) => {
            const isActive = selectedAtvId === atv.id;
            const isReleased = atv.status?.toUpperCase() === 'ACTIVE';
            return (
              <div 
                key={atv.id} 
                onClick={() => { setSelectedAtvId(atv.id); setIsCreating(false); setIsEditing(false); }}
                className={`cursor-pointer bg-white border p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-lg' : 'border-gray-200 shadow-sm hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded w-fit ${
                      atv.subject === 'GEOGRAFIA' ? 'bg-blue-50 text-blue-600' : 
                      atv.subject === 'MATEMÁTICA' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {atv.subject}
                    </span>
                    {isReleased && (
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit uppercase">
                        Liberada
                      </span>
                    )}
                  </div>
                  {isActive ? (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  ) : (
                    <MoreHorizontal size={18} className="text-gray-400" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 leading-tight">{atv.title}</h3>
                <p className="text-xs text-gray-500 mb-6">{atv.date}</p>
                
                <div className="flex justify-between border-t pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Respostas</p>
                    <p className="text-sm font-bold text-gray-800">{atv.responses}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Valor</p>
                    <p className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-gray-800'}`}>{atv.average}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO DINÂMICA: CRIAÇÃO, EDIÇÃO OU RESUMO */}
      {(isCreating || isEditing) ? (
        <section 
          ref={creationSectionRef}
          className={`bg-white border ${isEditing ? 'border-blue-100' : 'border-orange-100'} rounded-3xl p-8 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}
        >
          <div className="flex justify-between items-center mb-8 border-b pb-6 border-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Atividade' : 'Criar Nova Atividade'}</h2>
              <p className="text-sm text-gray-500">{isEditing ? 'Atualize os dados da sua avaliação.' : 'Configure os detalhes e as questões da sua nova avaliação.'}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setIsCreating(false); setIsEditing(false); }}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={isEditing ? handleUpdateActivity : handleSaveActivity}
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {isSubmitting ? "Salvando..." : (isEditing ? "Atualizar Atividade" : "Salvar Atividade")}
              </button>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Título da Atividade</label>
                <input 
                  type="text" 
                  placeholder="Ex: Avaliação Bimestral de História" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                  value={isEditing ? editActivity.title : newActivity.title}
                  onChange={(e) => {
                    if (isEditing) setEditActivity({...editActivity, title: e.target.value});
                    else setNewActivity({...newActivity, title: e.target.value});
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Matéria</label>
                <input 
                  type="text" 
                  placeholder="Ex: Matemática, História..." 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                  value={isEditing ? editActivity.subject : newActivity.subject}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (isEditing) setEditActivity({...editActivity, subject: val});
                    else setNewActivity({...newActivity, subject: val});
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pontos</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                  value={isEditing ? editActivity.points : newActivity.points}
                  onChange={(e) => {
                    if (isEditing) setEditActivity({...editActivity, points: e.target.value});
                    else setNewActivity({...newActivity, points: e.target.value});
                  }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descrição da Atividade</label>
              <textarea 
                placeholder="Descreva o objetivo desta atividade..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm resize-none"
                value={isEditing ? editActivity.description : newActivity.description}
                onChange={(e) => {
                  if (isEditing) setEditActivity({...editActivity, description: e.target.value});
                  else setNewActivity({...newActivity, description: e.target.value});
                }}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Questões da Atividade
                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">{(isEditing ? editActivity.questions : newActivity.questions).length}</span>
              </h3>
              <button 
                onClick={handleAddQuestion}
                className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={18} /> Adicionar Questão
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {(isEditing ? editActivity.questions : newActivity.questions).map((q: any, qIndex: number) => (
                <div 
                  key={q.id} 
                  ref={qIndex === (isEditing ? editActivity.questions.length : newActivity.questions.length) - 1 ? questionsEndRef : null}
                  className="bg-white border border-gray-200 rounded-2xl p-6 relative animate-in zoom-in-95 duration-300 group shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs">Q{qIndex + 1}</span>
                      {(isEditing ? editActivity.questions : newActivity.questions).length > 1 && (
                        <button 
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover questão"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Conteúdo (ex: Cartografia)" 
                        value={q.exercise_subject}
                        onChange={(e) => updateQuestion(q.id, 'exercise_subject', e.target.value)}
                        className="flex-1 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <input 
                        type="number" 
                        placeholder="Pontos" 
                        value={q.points}
                        onChange={(e) => updateQuestion(q.id, 'points', e.target.value)}
                        className="w-20 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  
                  <textarea 
                    placeholder="Digite o enunciado da questão..."
                    rows={2}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm mb-6 resize-none"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  />

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Alternativas</p>
                    {q.alternatives.map((alt: string, aIndex: number) => (
                      <div key={aIndex} className="flex gap-3 items-center group/alt">
                        <button 
                          onClick={() => updateQuestion(q.id, 'correctIndex', aIndex)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            q.correctIndex === aIndex ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {q.correctIndex === aIndex && <Check size={12} strokeWidth={4} />}
                        </button>
                        <input 
                          type="text" 
                          placeholder={`Alternativa ${String.fromCharCode(65 + aIndex)}...`}
                          className={`flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all focus:outline-none ${
                            q.correctIndex === aIndex ? 'ring-1 ring-green-100 border-green-300' : 'focus:ring-1 focus:ring-blue-600'
                          }`}
                          value={alt}
                          onChange={(e) => updateAlternative(q.id, aIndex, e.target.value)}
                        />
                      </div>
                    ))}
                    {q.alternatives.length < 5 && (
                      <button 
                        onClick={() => handleAddAlternative(q.id)}
                        className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-500 transition-all"
                      >
                        + Adicionar Alternativa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : !selectedAtv ? (
        <section className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900">Nenhuma atividade encontrada</h2>
          <p className="text-sm text-gray-500 mt-2">
            Crie uma nova atividade para começar a acompanhar métricas e desempenho da turma.
          </p>
        </section>
      ) : (
        <>
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-500 relative">
            {isLoadingDashboard && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            )}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Resumo da Atividade</h2>
              <div className="flex gap-2">
                {selectedAtv.status?.toUpperCase() !== 'ACTIVE' ? (
                  <button 
                    onClick={() => handleReleaseActivity(selectedAtv.id)}
                    disabled={isReleasing}
                    className="flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-green-700 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReleasing ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />}
                    Liberar
                  </button>
                ) : (
                  <button 
                    onClick={() => handleHideActivity(selectedAtv.id)}
                    disabled={isReleasing}
                    className="flex items-center gap-2 bg-gray-600 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReleasing ? <Loader2 size={12} className="animate-spin" /> : <EyeOff size={12} />}
                    Ocultar
                  </button>
                )}
                <button 
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={12} /> Editar Atividade
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 transition-all">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Média da Turma</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600 tracking-tight">{metrics.class_average}</span>
                  <div className={`flex items-center text-[10px] font-bold ${selectedAtv.trend?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedAtv.trend?.startsWith('+') ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                    {selectedAtv.trend?.replace('+', '').replace('-', '') || '0.0'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Maior Nota</p>
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{metrics.highest_score}</span>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Menor Nota</p>
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{metrics.lowest_score}</span>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Total de Respostas</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 tracking-tight">
                    {atvDashboardData ? `${submissionPercentage}%` : selectedAtv.percentage}
                  </span>
                  {atvDashboardData && (
                    <span className="text-xs text-gray-400">
                      ({metrics.total_submissions}/{totalStudentsCount})
                    </span>
                  )}
                  {!atvDashboardData && <span className="text-xs text-gray-400">({selectedAtv.details})</span>}
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO MEIO: DUAS COLUNAS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 relative">
            {isLoadingDashboard && (
              <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
              </div>
            )}
            {/* COLUNA ESQUERDA: STATS LATERAIS */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">Questões com mais erro</h3>
                
                {/* Destaque da questão com mais erro */}
                {hardestQuestions.length > 0 && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Destaque Crítico</p>
                    <p className="text-sm text-gray-800 leading-snug">
                      A questão <span className="font-bold text-orange-700">"{hardestQuestions[0].question || hardestQuestions[0].id}"</span> é o ponto de maior atenção com {hardestQuestions[0].error_percentage || hardestQuestions[0].percentage}%.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {hardestQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-50 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">{q.id || `Q${idx+1}`}</div>
                        <span className="text-sm font-semibold text-gray-800 line-clamp-1">{q.question || q.subject || q.title || "Geral"}</span>
                      </div>
                      <span className="text-xs font-bold text-red-500 tracking-tight">{q.error_percentage || q.percentage}% erro</span>
                    </div>
                  ))}
                  {hardestQuestions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum dado de erro disponível.</p>
                  )}
                </div>
              </div>
            </div>

          {/* COLUNA DIREITA: TABELA */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <h3 className="font-bold text-gray-800">Lista de Alunos</h3>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar aluno..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aluno</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Nota</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.slice(0, 5).map((aluno: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${aluno.avatarColor || "bg-gray-100 text-gray-600"}`}>
                              {aluno.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{aluno.name}</span>
                          </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${aluno.submitted ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"}`}>
                                {aluno.submitted ? "ENTREGUE" : "PENDENTE"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-sm font-bold ${parseFloat(aluno.score) < 5 ? 'text-red-500' : 'text-blue-600'}`}>
                                {aluno.score}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                            Nenhum aluno encontrado com "{searchTerm}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={() => setIsStudentModalOpen(true)}
                  className="w-full py-4 text-xs font-bold text-blue-600 border-t border-gray-50 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                >
                  Ver lista completa
                </button>
              </div>
            </div>
          </div>

          {/* MODAL: LISTA COMPLETA DE ALUNOS */}
          {isStudentModalOpen && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsStudentModalOpen(false)}
            >
              <div 
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* CABEÇALHO DO MODAL */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Lista Completa de Alunos</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedAtv.title} • {studentsList.length} estudantes</p>
                  </div>
                  <button 
                    onClick={() => setIsStudentModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* CORPO DO MODAL COM SCROLL */}
                <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-50">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aluno</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {studentsList.map((aluno: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${aluno.avatarColor || "bg-gray-100 text-gray-600"} shadow-sm`}>
                              {aluno.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{aluno.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Fundamental II</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                              aluno.submitted ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"
                            }`}>
                              {aluno.submitted ? "ENTREGUE" : "PENDENTE"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-base font-bold ${parseFloat(aluno.score) < 5 ? 'text-red-500' : 'text-blue-600'}`}>
                              {aluno.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RODAPÉ DO MODAL */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => setIsStudentModalOpen(false)}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Fechar Lista
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: SELETOR DE ATIVIDADES (HISTÓRICO COMPLETO) */}
          {isActivitySelectorOpen && (
            <div 
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsActivitySelectorOpen(false)}
            >
              <div 
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* CABEÇALHO */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Todas as Atividades</h3>
                    <p className="text-sm text-gray-500 mt-1">Selecione uma atividade para ver detalhes e métricas de desempenho.</p>
                  </div>
                  <button 
                    onClick={() => setIsActivitySelectorOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* CORPO DO MODAL COM LISTA */}
                <div className="max-h-[60vh] overflow-y-auto p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayAtividades.map((atv) => {
                      const isActive = selectedAtvId === atv.id;
                      const isReleased = atv.status?.toUpperCase() === 'ACTIVE';
                      return (
                        <div 
                          key={atv.id} 
                          onClick={() => { 
                            setSelectedAtvId(atv.id); 
                            setIsActivitySelectorOpen(false); 
                            setIsCreating(false); 
                            setIsEditing(false); 
                          }}
                          className={`cursor-pointer group relative bg-white border p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                            isActive ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-lg' : 'border-gray-200 shadow-sm hover:border-blue-300'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded w-fit ${
                                atv.subject === 'GEOGRAFIA' ? 'bg-blue-50 text-blue-600' : 
                                atv.subject === 'MATEMÁTICA' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                              }`}>
                                {atv.subject}
                              </span>
                              {isReleased && (
                                <span className="text-[8px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit uppercase">
                                  Liberada
                                </span>
                              )}
                            </div>
                            {isActive && <Check size={16} className="text-blue-600" strokeWidth={3} />}
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2">{atv.title}</h3>
                          <p className="text-[10px] text-gray-500 mb-4">{atv.date}</p>
                          
                          <div className="flex justify-between border-t border-gray-50 pt-3">
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Valor</p>
                              <p className="text-xs font-bold text-gray-800">{atv.average} pts</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Respostas</p>
                              <p className="text-xs font-bold text-gray-800">{atv.responses}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RODAPÉ */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">{displayAtividades.length} atividades encontradas</span>
                  <button 
                    onClick={() => setIsActivitySelectorOpen(false)}
                    className="px-8 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Fechar Histórico
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
