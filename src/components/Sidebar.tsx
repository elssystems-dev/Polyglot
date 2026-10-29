'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Visão Geral', href: '/dashboard', icon: 'dashboard' },
    { label: 'Turmas', href: '/turmas', icon: 'groups' },
    { label: 'Cursos', href: '/cursos', icon: 'auto_stories' },
    { label: 'Professores', href: '/professores', icon: 'school' },
    { label: 'Alunos', href: '/alunos', icon: 'person_search' },
    { label: 'Diário & Pauta', href: '/diario', icon: 'edit_calendar' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#ffffff] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-r border-[#cac3d6]/30 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Top Brand with Polylot Mascot */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#cac3d6]/20 bg-white">
            <Link href="/dashboard" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-xl bg-[#ffe7fe] flex items-center justify-center p-1 shadow-sm overflow-hidden flex-shrink-0">
                <Image
                  src="/Polylot.png"
                  alt="Polyglot Mascot"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-[18px] font-bold text-[#2f0a38] tracking-tight leading-none">
                  Polyglot
                </span>
                <span className="text-[10px] font-semibold text-[#5156ab] tracking-widest uppercase mt-0.5">
                  Idiomas • Acadêmico
                </span>
              </div>
            </Link>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 text-[#494553] hover:text-[#2f0a38]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-3">
            <div className="px-3 py-1 text-[#494553] text-[11px] font-semibold uppercase tracking-wider">
              Navegação Principal
            </div>
          </div>

          <nav className="px-3 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-[#613dc1] text-white font-semibold shadow-[0_4px_14px_rgba(97,61,193,0.28)]'
                      : 'text-[#494553] hover:bg-[#ffdeff]/40 hover:text-[#2f0a38]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status & User Logout */}
        <div className="p-4 flex flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-[#ffeffc] border border-[#ffdeff] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5156ab] animate-pulse"></span>
              <span className="text-[11px] text-[#5156ab] uppercase tracking-wider font-bold">
                Status do Sistema
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#2f0a38] leading-tight">Semestre 2025.1</span>
                <span className="text-xs text-[#494553]">Letivo Vigente</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded-full bg-[#fdd6ff] text-[#2f0a38] font-bold">
                ATIVO
              </span>
            </div>
          </div>

          {user && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Encerrar Sessão
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
