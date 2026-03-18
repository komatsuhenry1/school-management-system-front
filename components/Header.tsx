"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

type AuthUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const loadAuthUser = () => {
    try {
      const raw = localStorage.getItem("authUser");
      setAuthUser(raw ? (JSON.parse(raw) as AuthUser) : null);
    } catch {
      setAuthUser(null);
    }
  };

  const navItems = useMemo(
    () =>
      authUser?.role === "TEACHER"
        ? [
            { name: "Dashboard", href: "/teacher-dashboard" },
            { name: "Atividades", href: "/atividades" },
            { name: "Alunos", href: "/alunos" },
            { name: "Ranking", href: "/ranking" },
          ]
        : [
            { name: "Dashboard", href: "/student-dashboard" },
            { name: "Atividades", href: "/student-atividades" },
            { name: "Ranking", href: "/ranking" },
          ],
    [authUser?.role]
  );

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsProfileMenuOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    loadAuthUser();

    const handleStorageChange = () => {
      loadAuthUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-user-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-user-updated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeItem = navItems.find((item) => item.href === pathname);
      const activeElement = activeItem ? itemRefs.current[activeItem.href] : null;

      if (!activeElement || !navRef.current) {
        setIndicatorStyle((prev) =>
          prev.opacity === 0 ? prev : { ...prev, opacity: 0 }
        );
        return;
      }

      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeElement.getBoundingClientRect();

      const nextStyle = {
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        opacity: 1,
      };

      setIndicatorStyle((prev) =>
        prev.left === nextStyle.left &&
        prev.width === nextStyle.width &&
        prev.opacity === nextStyle.opacity
          ? prev
          : nextStyle
      );
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [pathname, navItems]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-xl tracking-tight">EduAnalytics</span>
        </div>
        
        <div className="h-6 w-[1px] bg-gray-200 mx-2" />
        
        <nav ref={navRef} className="relative flex items-center gap-2 ml-4">
          <motion.div
            className="absolute bottom-[-16px] h-[3px] bg-blue-600 rounded-t-full"
            animate={indicatorStyle}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 34,
            }}
          />
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(element) => {
                  itemRefs.current[item.href] = element;
                }}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-gray-50 group ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="relative z-10">{item.name}</span>

                {!isActive && (
                  <div className="absolute bottom-[-16px] left-0 right-0 h-[3px] bg-transparent transition-colors group-hover:bg-gray-100 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center">
        <div ref={profileMenuRef} className="relative border-l border-gray-200 pl-6">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-gray-50"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {authUser?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">{authUser?.email || ""}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 overflow-hidden shadow-sm">
              <User size={24} className="text-orange-600" />
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                isProfileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              

              <div className="pt-2">
                <Link
                  href="/configuracoes"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    pathname === "/configuracoes"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Settings size={18} />
                  Configurações
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition-all hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
