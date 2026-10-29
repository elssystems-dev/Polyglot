'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onOpenMobile?: () => void;
}

export default function Header({ onOpenMobile }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#fff7fa]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#cac3d6]/30 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#2f0a38] hover:bg-[#ffeffc]"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}

        <div className="px-3 py-1 rounded-full bg-[#ffdeff] flex items-center gap-2 border border-[#fdd6ff]">
          <span className="material-symbols-outlined text-[#5156ab] text-[16px]">school</span>
          <span className="text-xs font-semibold text-[#2f0a38]">
            Polyglot Central Acadêmica
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Role Indicator Badge */}
        {user?.role === 'COORDINATOR' ? (
          <div className="px-3 py-1 rounded-full bg-[#cffafe] text-[#0e7490] border border-[#a5f3fc] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Coordenação</span>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bg-[#d1fae5] text-[#059669] border border-[#a7f3d0] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Docência</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button
          type="button"
          aria-label="Notificações"
          className="w-9 h-9 rounded-full bg-white hover:bg-[#ffdeff] flex items-center justify-center text-[#494553] hover:text-[#2f0a38] relative transition-colors shadow-sm border border-[#cac3d6]/30"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
        </button>

        {/* User Profile Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-1 sm:pl-2">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-[#2f0a38] leading-tight truncate max-w-[150px]">
                {user.name}
              </span>
              <span className="text-[11px] text-[#494553] truncate max-w-[150px]">
                {user.title || (user.role === 'COORDINATOR' ? 'Coordenação Geral' : 'Docente')}
              </span>
            </div>

            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-[#613dc1] flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border-2 border-white cursor-pointer">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0)}</span>
                )}
              </div>

              {/* Dropdown Menu on hover/click */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#cac3d6]/40 p-1.5 hidden group-hover:block transition-all z-50">
                <div className="px-3 py-2 border-b border-[#cac3d6]/20">
                  <p className="text-xs font-bold text-[#2f0a38] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#494553] truncate">{user.email}</p>
                </div>
                <Link
                  href="/login"
                  className="w-full text-left px-3 py-2 text-xs text-[#5156ab] hover:bg-[#ffeffc] rounded-lg flex items-center gap-2 mt-1"
                >
                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  Trocar de Perfil
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg flex items-center gap-2 mt-1"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sair do Sistema
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
