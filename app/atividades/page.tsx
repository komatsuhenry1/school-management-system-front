"use client";

import { useState } from "react";
import { Plus, Check, MoreHorizontal, TrendingUp, TrendingDown, Search, Download, User } from "lucide-react";

export default function AtividadesPage() {
  const [selectedAtvId, setSelectedAtvId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const atividades = [
    { 
      id: 1, 
      subject: "GEOGRAFIA", 
      title: "Avaliação 1 - Geografia", 
      class: "7º Ano A", 
      date: "Ontem", 
      responses: "28/30", 
      average: "7.5", 
      trend: "+0.4",
      highest: "10.0",
      lowest: "4.5",
      percentage: "93%",
      details: "28/30",
      aiSuggestion: "A turma apresenta dificuldades significativas em interpretação de texto na Questão 3. Sugerimos uma revisão estratégica sobre cartografia antes da próxima avaliação.",
      wrongQuestions: [
        { id: "Q3", title: "Climas do Brasil", percentage: "70% erro" },
        { id: "Q7", title: "Relevo Continental", percentage: "45% erro" },
      ],
      students: [
        { name: "Alice Moraes", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "9.5", avatarColor: "bg-blue-100 text-blue-600" },
        { name: "Bruno Santos", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "7.0", avatarColor: "bg-orange-100 text-orange-600" },
        { name: "Carla Ribeiro", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "4.5", avatarColor: "bg-purple-100 text-purple-600" },
      ]
    },
    { 
      id: 2, 
      subject: "MATEMÁTICA", 
      title: "Simulado de Álgebra", 
      class: "8º Ano B", 
      date: "Há 3 dias", 
      responses: "15/22", 
      average: "8.2", 
      trend: "+1.2",
      highest: "9.8",
      lowest: "6.0",
      percentage: "68%",
      details: "15/22",
      aiSuggestion: "O desempenho em álgebra foi excelente, mas 62% da turma errou a Questão 5 sobre Equações. Recomenda-se um reforço focado em isolamento de variáveis.",
      wrongQuestions: [
        { id: "Q5", title: "Equações de 1º Grau", percentage: "62% erro" },
        { id: "Q2", title: "Polinômios", percentage: "50% erro" },
        { id: "Q8", title: "Fatoração", percentage: "38% erro" },
      ],
      students: [
        { name: "Diego Lima", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "9.8", avatarColor: "bg-indigo-100 text-indigo-600" },
        { name: "Elena Souza", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "8.5", avatarColor: "bg-pink-100 text-pink-600" },
        { name: "Fabio Mello", status: "PENDENTE", statusColor: "text-orange-600 bg-orange-50", grade: "-", avatarColor: "bg-zinc-100 text-zinc-600" },
      ]
    },
    { 
      id: 3, 
      subject: "HISTÓRIA", 
      title: "Revolução Industrial", 
      class: "9º Ano C", 
      date: "Há 5 dias", 
      responses: "30/30", 
      average: "6.8", 
      trend: "-0.2",
      highest: "9.0",
      lowest: "3.5",
      percentage: "100%",
      details: "30/30",
      aiSuggestion: "A Questão 10 sobre Causas Sociais teve 85% de erro. Isso indica que a base conceitual sobre o período precisa ser revisitada com exemplos práticos da época.",
      wrongQuestions: [
        { id: "Q10", title: "Causas Sociais", percentage: "85% erro" },
        { id: "Q4", title: "Impacto Ambiental", percentage: "55% erro" },
      ],
      students: [
        { name: "Gabriel Silva", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "8.0", avatarColor: "bg-green-100 text-green-600" },
        { name: "Heitor J.", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "3.5", avatarColor: "bg-yellow-100 text-yellow-600" },
        { name: "Iara Costa", status: "ENTREGUE", statusColor: "text-green-600 bg-green-50", grade: "6.5", avatarColor: "bg-red-100 text-red-600" },
      ]
    },
  ];

  const selectedAtv = atividades.find(a => a.id === selectedAtvId) || atividades[0];

  const filteredStudents = selectedAtv.students.filter(student =>
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
          <button className="text-blue-600 text-sm font-semibold hover:underline">Ver Histórico Completo</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-not-allowed min-h-[160px]">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-200">
              <Plus size={24} strokeWidth={3} />
            </div>
            <span className="text-blue-600 font-bold text-sm">Nova Atividade</span>
          </div>

          {atividades.map((atv) => {
            const isActive = selectedAtvId === atv.id;
            return (
              <div 
                key={atv.id} 
                onClick={() => setSelectedAtvId(atv.id)}
                className={`cursor-pointer bg-white border p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-lg' : 'border-gray-200 shadow-sm hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                    atv.subject === 'GEOGRAFIA' ? 'bg-blue-50 text-blue-600' : 
                    atv.subject === 'MATEMÁTICA' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {atv.subject}
                  </span>
                  {isActive ? (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  ) : (
                    <MoreHorizontal size={18} className="text-gray-400" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 leading-tight">{atv.title}</h3>
                <p className="text-xs text-gray-500 mb-6">{atv.class} • {atv.date}</p>
                
                <div className="flex justify-between border-t pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Respostas</p>
                    <p className="text-sm font-bold text-gray-800">{atv.responses}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Média</p>
                    <p className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-gray-800'}`}>{atv.average}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO: RESUMO DA ATIVIDADE */}
      <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-500">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">Resumo da Atividade</h2>
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 transition-all">
              {selectedAtv.title}
            </span>
            <span className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1 rounded-full border border-gray-100 transition-all">
              {selectedAtv.class}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 transition-all">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Média da Turma</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600 tracking-tight">{selectedAtv.average}</span>
              <div className={`flex items-center text-[10px] font-bold ${selectedAtv.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {selectedAtv.trend.startsWith('+') ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {selectedAtv.trend.replace('+', '').replace('-', '')}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Maior Nota</p>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{selectedAtv.highest}</span>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Menor Nota</p>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{selectedAtv.lowest}</span>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 transition-all">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Total de Respostas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">{selectedAtv.percentage}</span>
              <span className="text-xs text-gray-400">({selectedAtv.details})</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO MEIO: DUAS COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: STATS LATERAIS */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Questões com mais erro</h3>
            
            {/* Destaque da questão com mais erro */}
            <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Destaque Crítico</p>
              <p className="text-sm text-gray-800 leading-snug">
                A <span className="font-bold text-orange-700">{selectedAtv.wrongQuestions[0].id} ({selectedAtv.wrongQuestions[0].title})</span> é o ponto de maior atenção com {selectedAtv.wrongQuestions[0].percentage}.
              </p>
            </div>

            <div className="space-y-4">
              {selectedAtv.wrongQuestions.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">{q.id}</div>
                    <span className="text-sm font-semibold text-gray-800">{q.title}</span>
                  </div>
                  <span className="text-xs font-bold text-red-500 tracking-tight">{q.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: TABELA */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
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

            <div className="overflow-x-auto">
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
                    filteredStudents.map((aluno) => (
                      <tr key={aluno.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${aluno.avatarColor}`}>
                            {aluno.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{aluno.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${aluno.statusColor}`}>
                            {aluno.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-bold ${parseFloat(aluno.grade) < 5 ? 'text-red-500' : 'text-blue-600'}`}>
                            {aluno.grade}
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
            <button className="w-full py-4 text-xs font-bold text-blue-600 border-t border-gray-50 hover:bg-gray-50 transition-colors uppercase tracking-widest">
              Ver lista completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
