"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Loader2,
  Mail,
  MoonStar,
  Pencil,
  Phone,
  Save,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

type AuthUser = {
  id?: string;
  ID?: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  role?: string;
};

type Preferences = {
  emailNotifications: boolean;
  soundEffects: boolean;
  compactMode: boolean;
};

const defaultPreferences: Preferences = {
  emailNotifications: true,
  soundEffects: true,
  compactMode: false,
};

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
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export default function ConfiguracoesPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const rawUser = localStorage.getItem("authUser");
        const parsedUser = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
        const rawPreferences = localStorage.getItem("appPreferences");
        const parsedPreferences = rawPreferences
          ? { ...defaultPreferences, ...(JSON.parse(rawPreferences) as Partial<Preferences>) }
          : defaultPreferences;

        setAuthUser(parsedUser);
        setDisplayName(parsedUser?.name || "");
        setPhone(formatPhone(parsedUser?.phone || ""));
        setCpf(formatCpf(parsedUser?.cpf || ""));
        setPreferences(parsedPreferences);

        const token = localStorage.getItem("authToken");
        const userId = parsedUser?.id || parsedUser?.ID;

        if (!token || !userId) {
          return;
        }

        setIsFetchingUser(true);

        const response = await fetch(`${baseUrl}/api/v1/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar dados do usuário");
        }

        const result = await response.json();

        if (result.success && result.data) {
          const nextUser: AuthUser = {
            id: result.data.ID,
            ID: result.data.ID,
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            cpf: result.data.cpf,
            role: result.data.role,
          };

          setAuthUser(nextUser);
          setDisplayName(result.data.name || "");
          setPhone(formatPhone(result.data.phone || ""));
          setCpf(formatCpf(result.data.cpf || ""));
          localStorage.setItem("authUser", JSON.stringify(nextUser));
          window.dispatchEvent(new Event("auth-user-updated"));
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar usuário", {
          description: "Não foi possível buscar os dados atualizados da conta.",
        });
      } finally {
        setIsFetchingUser(false);
        setIsLoaded(true);
      }
    };

    loadUserData();
  }, []);

  const roleLabel = useMemo(() => {
    if (authUser?.role === "TEACHER") return "Professor";
    if (authUser?.role === "USER") return "Estudante";
    if (authUser?.role === "STUDENT") return "Estudante";
    return authUser?.role || "Usuário";
  }, [authUser?.role]);

  const initials = useMemo(() => {
    return (displayName || authUser?.name || "Usuário")
      .split(" ")
      .filter(Boolean)
      .map((namePart) => namePart[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [authUser?.name, displayName]);

  const handlePreferenceChange = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveAccount = async () => {
    const trimmedName = displayName.trim();
    const trimmedPhone = getOnlyDigits(phone);
    const trimmedCpf = getOnlyDigits(cpf);

    if (!trimmedName) {
      toast.warning("Nome obrigatório", {
        description: "Informe um nome para identificar a conta conectada.",
      });
      return;
    }

    setIsSaving(true);

    try {
      let nextUser: AuthUser = {
        ...authUser,
        name: trimmedName,
        phone: trimmedPhone,
        cpf: trimmedCpf,
      };

      const token = localStorage.getItem("authToken");
      const userId = authUser?.id || authUser?.ID;

      if (isEditingAccount && !userId) {
        toast.error("ID do usuário não encontrado", {
          description: "Faça login novamente para carregar a identificação da sua conta.",
        });
        return;
      }

      if (isEditingAccount && token && userId) {
        const response = await fetch(`${baseUrl}/api/v1/user/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
            phone: trimmedPhone,
            cpf: trimmedCpf,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar usuário");
        }

        const result = await response.json();

        if (result.success && result.data) {
          nextUser = {
            ...nextUser,
            id: result.data.ID || userId,
            ID: result.data.ID || userId,
            name: result.data.name || trimmedName,
            email: result.data.email || authUser?.email,
            phone: result.data.phone || trimmedPhone,
            cpf: result.data.cpf || trimmedCpf,
            role: result.data.role || authUser?.role,
          };
        }
      }

      localStorage.setItem("authUser", JSON.stringify(nextUser));
      setAuthUser(nextUser);
      setDisplayName(nextUser.name || "");
      setPhone(formatPhone(nextUser.phone || ""));
      setCpf(formatCpf(nextUser.cpf || ""));
      setIsEditingAccount(false);
      window.dispatchEvent(new Event("auth-user-updated"));

      toast.success("Configurações salvas", {
        description: "Sua conta conectada foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar", {
        description: "Não foi possível atualizar os dados da conta.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem("appPreferences", JSON.stringify(preferences));
    toast.success("Preferências salvas", {
      description: "Suas preferências locais foram atualizadas.",
    });
  };

  const handleCancelEdit = () => {
    setDisplayName(authUser?.name || "");
    setPhone(formatPhone(authUser?.phone || ""));
    setCpf(formatCpf(authUser?.cpf || ""));
    setIsEditingAccount(false);
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.setItem("appPreferences", JSON.stringify(defaultPreferences));
    toast.success("Preferências restauradas", {
      description: "As preferências voltaram para o padrão.",
    });
  };

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-[2.5rem] bg-blue-600 p-10 text-white shadow-2xl shadow-blue-200">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
              <Settings size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black">Carregando configurações</h1>
              <p className="mt-1 text-blue-100 font-medium">
                Estamos preparando as informações da sua conta conectada.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-8 md:p-12 shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
              <Shield size={14} />
              Conta conectada
            </span>
            <h1 className="text-4xl font-black text-white leading-tight">
              Configure seu perfil e preferências
            </h1>
            <p className="max-w-2xl text-lg font-medium text-blue-100">
              Ajuste como sua conta aparece no sistema e personalize a sua experiência.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600 shadow-sm">
              <span className="text-xl font-black">{initials}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{displayName || authUser?.name || "Usuário"}</p>
              <p className="text-sm font-medium text-blue-100">{authUser?.email || "Sem e-mail cadastrado"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <User size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-gray-900">Dados da conta</h2>
              <p className="text-xs font-medium text-gray-500">
                Esses dados representam a conta conectada neste navegador.
              </p>
            </div>
            {isFetchingUser && <Loader2 size={18} className="animate-spin text-blue-600" />}
            <button
              type="button"
              onClick={() =>
                isEditingAccount ? handleCancelEdit() : setIsEditingAccount(true)
              }
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                isEditingAccount
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              {isEditingAccount ? <X size={14} /> : <Pencil size={14} />}
              {isEditingAccount ? "Cancelar" : "Editar dados"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Nome de exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Digite como deseja aparecer"
                disabled={!isEditingAccount}
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition-all ${
                  isEditingAccount
                    ? "border-gray-200 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    : "border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                E-mail
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                <Mail size={16} className="text-gray-400" />
                <span>{authUser?.email || "Sem e-mail disponível"}</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Perfil
              </label>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700">
                {roleLabel}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Telefone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  placeholder="Digite seu telefone"
                  maxLength={16}
                  disabled={!isEditingAccount}
                  className={`w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 outline-none transition-all ${
                    isEditingAccount
                      ? "border-gray-200 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      : "border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                placeholder="Digite seu CPF"
                maxLength={14}
                disabled={!isEditingAccount}
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition-all ${
                  isEditingAccount
                    ? "border-gray-200 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    : "border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {isEditingAccount && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveAccount}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? "Salvando..." : "Salvar edição"}
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-8">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900">Resumo da conta</h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <CheckCircle2 size={18} className="text-green-600" />
                <p className="text-sm font-medium text-gray-700">Sessão autenticada neste navegador.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <Shield size={18} className="text-blue-600" />
                <p className="text-sm font-medium text-gray-700">Perfil atual: {roleLabel}.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <Mail size={18} className="text-orange-600" />
                <p className="text-sm font-medium text-gray-700 break-all">
                  {authUser?.email || "Sem e-mail cadastrado na sessão."}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <Phone size={18} className="text-purple-600" />
                <p className="text-sm font-medium text-gray-700">
                  {authUser?.phone ? formatPhone(authUser.phone) : "Telefone ainda não informado."}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                <User size={18} className="text-gray-600" />
                <p className="text-sm font-medium text-gray-700">
                  {authUser?.cpf ? formatCpf(authUser.cpf) : "CPF ainda não informado."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Preferências locais</h2>
            <p className="text-sm font-medium text-gray-500">
              Essas opções ficam salvas neste navegador para sua conta conectada.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              key: "emailNotifications" as const,
              title: "Notificações por e-mail",
              description: "Receber lembretes e atualizações quando disponíveis.",
              icon: Bell,
            },
            {
              key: "soundEffects" as const,
              title: "Efeitos sonoros",
              description: "Ativar retornos sonoros em interações futuras.",
              icon: Mail,
            },
            {
              key: "compactMode" as const,
              title: "Modo compacto",
              description: "Reduzir espaçamentos para visualizar mais conteúdo.",
              icon: MoonStar,
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handlePreferenceChange(item.key)}
              className={`rounded-3xl border p-6 text-left transition-all ${
                preferences[item.key]
                  ? "border-blue-200 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <item.icon size={22} />
                </div>
                <div
                  className={`h-7 w-12 rounded-full p-1 transition-all ${
                    preferences[item.key] ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white transition-transform ${
                      preferences[item.key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
              <h3 className="mt-5 text-lg font-black text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm font-medium text-gray-500">{item.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            <Save size={16} />
            Salvar preferências
          </button>
          <button
            type="button"
            onClick={handleResetPreferences}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Restaurar preferências
          </button>
        </div>
      </section>
    </div>
  );
}
