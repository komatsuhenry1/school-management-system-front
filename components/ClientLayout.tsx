"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!isAuthPage && <Header />}
      <main className={`${isAuthPage ? "" : "pt-24"} pb-12 px-8 min-h-screen`}>
        {children}
      </main>
    </>
  );
}
