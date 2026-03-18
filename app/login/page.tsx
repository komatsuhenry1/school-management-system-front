"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Bem-vindo de volta!", { description: "Login realizado com sucesso." });
        const token = data?.data?.token;
        const user = data?.data?.user;
        const normalizedUser = user
          ? {
              ...user,
              id: user.id || user.ID,
              ID: user.ID || user.id,
            }
          : null;

        if (token) localStorage.setItem("authToken", token);
        if (normalizedUser) localStorage.setItem("authUser", JSON.stringify(normalizedUser));

        // Redirecionamento baseado na role
        if (normalizedUser?.role === "TEACHER") {
          router.push("/teacher-dashboard");
        } else if (normalizedUser?.role === "USER") {
          router.push("/student-dashboard");
        } else {
          // Fallback caso venha outra role ou não venha
          router.push("/teacher-dashboard");
        }
      } else {
        toast.error("Erro no login", { 
          description: data.message || "E-mail ou senha incorretos. Por favor, tente novamente." 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro de conexão", { 
        description: "Não foi possível conectar ao servidor. Verifique sua conexão." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-3xl">E</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Acesse sua conta</h2>
          <p className="mt-2 text-sm text-gray-500">
            Bem-vindo ao <span className="text-blue-600 font-semibold">EduAnalytics</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">E-mail Institucional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@escola.com"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-500 cursor-pointer">
                Lembrar de mim
              </label>
            </div>

            <div className="text-xs">
              <a href="#" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-200"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Cadastre-se agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
