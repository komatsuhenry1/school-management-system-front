"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit2, 
  Users, 
  UserCheck, 
  Clock,
  Check,
  Loader2,
  Phone,
  IdCard
} from "lucide-react";
import { toast } from "sonner";

type Aluno = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  avatarColor: string;
};

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-orange-100 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-indigo-100 text-indigo-600",
  "bg-pink-100 text-pink-600",
];

const getOnlyDigits = (value: string) => value.replace(/\D/g, "");

const formatPhone = (value: string) => {
  const digits = getOnlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (value: string) => {
  const digits = getOnlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const normalizeStatus = (value?: string) => {
  const normalizedValue = (value || "").toUpperCase();
  return normalizedValue === "INACTIVE" ? "INACTIVE" : "ACTIVE";
};

const escapeCsvValue = (value: string | number) => {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
};

export default function AlunosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    status: "ACTIVE",
  });
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const resetStudentForm = () => {
    setStudentForm({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      status: "ACTIVE",
    });
    setSelectedStudent(null);
  };

  const fetchAlunos = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar alunos");
      }

      const result = await response.json();
      const users = Array.isArray(result.data) ? result.data : [];

      const mappedAlunos = users
        .filter((user: any) => user.role === "USER")
        .map((user: any, index: number) => ({
          id: user.ID,
          name: user.name || "Usuário",
          email: user.email || "",
          phone: user.phone || "",
          cpf: user.cpf || "",
          role: user.role || "USER",
          createdAt: user.CreatedAt || "",
          updatedAt: user.UpdatedAt || "",
          status: normalizeStatus(user.status),
          avatarColor: avatarColors[index % avatarColors.length],
        }));

      setAlunos(mappedAlunos);
    } catch (error) {
      console.error(error);
      toast.error("Erro", {
        description: "Não foi possível carregar a lista de alunos.",
      });
      setAlunos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [baseUrl]);

  const filteredAlunos = alunos.filter(aluno =>
    aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Total de Alunos", value: alunos.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Alunos Ativos", value: alunos.filter((a) => a.status === "ACTIVE").length, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { title: "Com CPF", value: alunos.filter((a) => Boolean(a.cpf)).length, icon: IdCard, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Cadastros Hoje", value: alunos.filter((a) => a.createdAt && new Date(a.createdAt).toDateString() === new Date().toDateString()).length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const handleRemoveStudent = async (id: string) => {
    setDeletingStudentId(id);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir aluno");
      }

      setAlunos((prev) => prev.filter((aluno) => aluno.id !== id));
      toast.success("Aluno removido", {
        description: "O aluno foi excluído com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro", {
        description: "Não foi possível excluir o aluno.",
      });
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleStartEdit = (aluno: Aluno) => {
    setSelectedStudent(aluno);
    setStudentForm({
      name: aluno.name || "",
      email: aluno.email || "",
      phone: formatPhone(aluno.phone || ""),
      cpf: formatCpf(aluno.cpf || ""),
      status: normalizeStatus(aluno.status),
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    resetStudentForm();
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = studentForm.name.trim();
    const trimmedEmail = studentForm.email.trim();
    const trimmedPhone = getOnlyDigits(studentForm.phone);
    const trimmedCpf = getOnlyDigits(studentForm.cpf);
    const trimmedStatus = normalizeStatus(studentForm.status);

    if (!trimmedName || !trimmedEmail) {
      toast.warning("Campos obrigatórios", {
        description: "Preencha nome e e-mail do aluno.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && selectedStudent) {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${baseUrl}/api/v1/user/${selectedStudent.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            cpf: trimmedCpf,
            status: trimmedStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar aluno");
        }

        const result = await response.json();
        const updatedData = result.data;

        const updatedStudent: Aluno = {
          ...selectedStudent,
          name: updatedData?.name || trimmedName,
          email: updatedData?.email || trimmedEmail,
          phone: updatedData?.phone || trimmedPhone,
          cpf: updatedData?.cpf || trimmedCpf,
          status: normalizeStatus(updatedData?.status || trimmedStatus),
          updatedAt: updatedData?.UpdatedAt || new Date().toISOString(),
        };

        setAlunos((prev) =>
          prev.map((aluno) => (aluno.id === selectedStudent.id ? updatedStudent : aluno))
        );

        setSelectedStudent(updatedStudent);
        resetStudentForm();
        setIsEditing(false);
        toast.success("Sucesso!", {
          description: "Dados do aluno atualizados com sucesso.",
        });
        return;
      }

      const createResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: "Password1@",
          name: trimmedName,
          cpf: "00000000000",
          phone: "00000000000",
        }),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createResult?.message || "Falha ao cadastrar aluno");
      }

      await fetchAlunos();
      resetStudentForm();
      setIsCreating(false);
      toast.success("Sucesso!", {
        description: "Aluno cadastrado com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro", {
        description: isEditing
          ? "Não foi possível salvar as alterações do aluno."
          : "Não foi possível cadastrar o aluno.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    resetStudentForm();
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleDownloadStudents = () => {
    if (filteredAlunos.length === 0) {
      toast.info("Nenhum aluno para exportar", {
        description: "Não há alunos disponíveis com o filtro atual.",
      });
      return;
    }

    const headers = ["Nome", "E-mail", "Telefone", "CPF", "Data de cadastro", "Status"];
    const rows = filteredAlunos.map((aluno) => [
      aluno.name,
      aluno.email,
      aluno.phone ? formatPhone(aluno.phone) : "-",
      aluno.cpf ? formatCpf(aluno.cpf) : "-",
      aluno.createdAt ? new Date(aluno.createdAt).toLocaleDateString("pt-BR") : "-",
        aluno.status,
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateLabel = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `alunos-${dateLabel}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Lista exportada", {
      description: "O arquivo CSV dos alunos foi baixado com sucesso.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* SEÇÃO: RESUMO (STATS) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* SEÇÃO DINÂMICA: FORMULÁRIO OU LISTA */}
      {isCreating || isEditing ? (
        <section className="bg-white border border-blue-100 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-8 border-b pb-6 border-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h2>
              <p className="text-sm text-gray-500">Preencha as informações básicas do estudante.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCancelForm}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStudent}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Salvando..." : isEditing ? 'Salvar Alterações' : 'Cadastrar Aluno'}
              </button>
            </div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome Completo</label>
              <input 
                type="text" 
                placeholder="Ex: João Silva" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                value={studentForm.name}
                onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">E-mail</label>
              <input 
                type="email" 
                placeholder="exemplo@escola.com" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                value={studentForm.email}
                onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {isEditing && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                    value={studentForm.phone}
                    onChange={(e) =>
                      setStudentForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))
                    }
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">CPF</label>
                  <input
                    type="text"
                    placeholder="123.456.789-00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
                    value={studentForm.cpf}
                    onChange={(e) =>
                      setStudentForm((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }))
                    }
                    maxLength={14}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm appearance-none"
                    value={studentForm.status}
                    onChange={(e) =>
                      setStudentForm((prev) => ({ ...prev, status: normalizeStatus(e.target.value) }))
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </>
            )}
          </form>
        </section>
      ) : (
        <section className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[78vh]">
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gerenciar Alunos</h2>
              <p className="text-sm text-gray-500">Visualize e edite as informações de todos os estudantes cadastrados.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou e-mail..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>
              <button
                onClick={handleDownloadStudents}
                disabled={isLoading || filteredAlunos.length === 0}
                className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Baixar lista de alunos"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={handleStartCreate}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Plus size={18} strokeWidth={3} /> Novo Aluno
              </button>
            </div>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aluno</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cadastro</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                        <p className="text-gray-400 text-sm">Carregando alunos...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAlunos.length > 0 ? (
                  filteredAlunos.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${aluno.avatarColor} shadow-sm`}>
                            {aluno.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{aluno.name}</p>
                            <p className="text-xs text-gray-400">{aluno.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-semibold text-gray-600">
                          {aluno.phone ? formatPhone(aluno.phone) : "-"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-gray-500">
                          {aluno.cpf ? formatCpf(aluno.cpf) : "-"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-gray-500">
                          {aluno.createdAt ? new Date(aluno.createdAt).toLocaleDateString("pt-BR") : "-"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          aluno.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {aluno.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleStartEdit(aluno)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar aluno"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleRemoveStudent(aluno.id)}
                            disabled={deletingStudentId === aluno.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Excluir aluno"
                          >
                            {deletingStudentId === aluno.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                          <Search size={32} />
                        </div>
                        <p className="text-gray-400 text-sm">Nenhum aluno encontrado para "{searchTerm}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </section>
      )}
    </div>
  );
}
