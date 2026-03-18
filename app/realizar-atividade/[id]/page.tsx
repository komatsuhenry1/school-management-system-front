"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Timer,
  Award,
  Loader2,
  AlertTriangle,
  Volume2,
  Square
} from "lucide-react";
import { toast } from "sonner";

export default function RealizarAtividadePage() {
  const { id } = useParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const stopSpeakingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Limpa a fala ao sair da página
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleStopSpeaking = () => {
    stopSpeakingRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (!currentQuestion) return;

    handleStopSpeaking();
    stopSpeakingRef.current = false;

    // Criamos uma fila de frases com "pausas naturais" usando pontuação
    const parts = [
      `Questão número ${currentQuestionIndex + 1},,,,,`, // Vírgulas geram pausas curtas
      `${currentQuestion.question}.....`, // Pontos geram pausas longas e queda de tom
      `Por favor, escolha uma das alternativas a seguir:`
    ];

    currentQuestion.alternatives.forEach((alt: any, idx: number) => {
      const letter = alt.letter || String.fromCharCode(65 + idx);
      parts.push(`Opção ${letter}: ${alt.value}.....`);
    });

    let currentPartIndex = 0;

    const speakNextPart = () => {
      if (stopSpeakingRef.current || currentPartIndex >= parts.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(parts[currentPartIndex]);
      utterance.lang = 'pt-BR';
      
      const voices = window.speechSynthesis.getVoices();
      
      // BUSCA AGRESSIVA POR VOZES HUMANAS
      // No Chrome/Edge, as vozes do Google e Microsoft são processadas por IA e soam muito melhor
      const bestVoice = 
        voices.find(v => v.name.includes('Google') && v.lang.includes('BR')) || 
        voices.find(v => v.name.includes('Microsoft') && v.lang.includes('BR')) ||
        voices.find(v => v.name.toLowerCase().includes('neural') && v.lang.startsWith('pt')) ||
        voices.find(v => v.lang.startsWith('pt-BR')) ||
        voices.find(v => v.lang.startsWith('pt'));

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Ajustes finos de "humanização"
      utterance.rate = 0.88; // Velocidade levemente reduzida para evitar o tom metálico
      utterance.pitch = 1.05; // Tom levemente mais agudo costuma soar menos robótico
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      
      utterance.onend = () => {
        if (!stopSpeakingRef.current) {
          currentPartIndex++;
          // Pausa controlada de 600ms entre blocos para o aluno processar a pergunta
          timeoutRef.current = setTimeout(speakNextPart, 600);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextPart();
  };

  useEffect(() => {
    if (id) fetchAtividadeDetalhes();
  }, [id]);

  const fetchAtividadeDetalhes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      // Buscamos os detalhes da atividade (que contém os exercícios)
      const response = await fetch(`${baseUrl}/api/v1/activity/${id}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Falha ao carregar detalhes');
      
      const result = await response.json();
      if (result.success) {
        setAtividade(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro", { description: "Não foi possível carregar as questões." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAlternative = (questionId: number, alternativeValue: string) => {
    setRespostas(prev => ({
      ...prev,
      [questionId]: alternativeValue
    }));
  };

  const handleSubmit = async () => {
    const totalQuestions = atividade?.exercises?.length || 0;
    const answeredCount = Object.keys(respostas).length;

    if (answeredCount < totalQuestions) {
      toast.warning("Questões pendentes", { 
        description: `Você respondeu ${answeredCount} de ${totalQuestions} questões. Finalizar assim mesmo?`,
        action: {
          label: "Finalizar",
          onClick: () => sendAnswers()
        }
      });
      return;
    }

    sendAnswers();
  };

  const sendAnswers = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        answers: Object.entries(respostas).map(([exId, ans]) => ({
          exercise_id: exId,
          student_answer: ans
        }))
      };

      const response = await fetch(`${baseUrl}/api/v1/activity/submit/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success("Atividade Finalizada!", { 
          description: "Suas respostas foram enviadas com sucesso." 
        });
        router.push("/student-atividades");
      } else {
        throw new Error(result.message || "Erro ao enviar respostas");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Erro no envio", { description: error.message || "Não foi possível salvar suas respostas." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Preparando sua avaliação...</p>
      </div>
    );
  }

  const currentQuestion = atividade?.exercises?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (atividade?.exercises?.length || 0) - 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* BARRA DE PROGRESSO E HEADER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              <ChevronLeft size={20} /> Sair
            </button>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
              <Award size={16} />
              {atividade?.title}
            </div>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-sm bg-orange-50 px-4 py-1.5 rounded-full">
              <Timer size={16} />
              <span>Em andamento</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / atividade?.exercises?.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
            <span>Questão {currentQuestionIndex + 1} de {atividade?.exercises?.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / atividade?.exercises?.length) * 100)}% concluído</span>
          </div>
        </div>

        {/* QUESTÃO ATUAL */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-tighter mb-4 inline-block">
                Questão {currentQuestionIndex + 1}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {currentQuestion?.question}
              </h2>
              {currentQuestion?.exercise_subject && (
                <p className="text-blue-600 text-sm font-semibold mt-3">Materia: {currentQuestion.exercise_subject}</p>
              )}
            </div>
            
            {isSpeaking ? (
              <button 
                onClick={handleStopSpeaking}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-2xl border border-red-100 transition-all group shrink-0"
                title="Parar leitura"
              >
                <Square size={20} className="fill-red-600 group-active:scale-90 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Parar</span>
              </button>
            ) : (
              <button 
                onClick={handleSpeak}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-3 rounded-2xl border border-blue-100 transition-all group shrink-0"
                title="Ouvir questão e alternativas"
              >
                <Volume2 size={24} className="group-active:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Ouvir</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(currentQuestion?.alternatives || []).map((alt: any, idx: number) => {
              const isSelected = respostas[currentQuestion.id] === alt.value;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAlternative(currentQuestion.id, alt.value)}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/5' 
                      : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                    isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    {alt.letter || String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-base font-semibold flex-1 ${isSelected ? 'text-blue-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {alt.value}
                  </span>
                  {isSelected && <CheckCircle className="text-blue-600" size={24} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* NAVEGAÇÃO DA PROVA */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              handleStopSpeaking();
              setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white hover:text-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={20} strokeWidth={3} /> Anterior
          </button>

          {isLastQuestion ? (
            <button
              onClick={() => {
                handleStopSpeaking();
                handleSubmit();
              }}
              disabled={isSubmitting}
              className="flex items-center gap-3 px-10 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Finalizar Prova <CheckCircle size={20} /></>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                handleStopSpeaking();
                setCurrentQuestionIndex(prev => prev + 1);
              }}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 group"
            >
              Próxima Questão
              <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        <div className="mt-12 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            Suas respostas são salvas automaticamente. Certifique-se de revisar todas as questões antes de clicar em <strong>Finalizar Prova</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
