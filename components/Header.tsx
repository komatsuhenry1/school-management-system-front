"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Atividades", href: "/atividades" },
    { name: "Alunos", href: "/alunos" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-xl tracking-tight">EduAnalytics</span>
        </div>
        
        <div className="h-6 w-[1px] bg-gray-200 mx-2" />
        
        <nav className="flex items-center gap-2 ml-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-gray-50 group ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute bottom-[-16px] left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30
                    }}
                  />
                )}
                
                {!isActive && (
                  <div className="absolute bottom-[-16px] left-0 right-0 h-[3px] bg-transparent transition-colors group-hover:bg-gray-100 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">Prof. Ricardo Silva</p>
            <p className="text-xs text-gray-500">Fundamental II</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 overflow-hidden shadow-sm">
            <User size={24} className="text-orange-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
