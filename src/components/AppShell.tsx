'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppShellProps {
  children: React.ReactNode;
  allowedRoles?: ('COORDINATOR' | 'TEACHER')[];
}

export default function AppShell({ children, allowedRoles }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7fa] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#ffe7fe] flex items-center justify-center animate-bounce shadow-md">
          <img src="/Polylot.png" alt="Carregando..." className="w-8 h-8 object-contain" />
        </div>
        <p className="text-sm font-semibold text-[#613dc1] animate-pulse">
          Carregando portal Polyglot...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#fff7fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h2 className="text-xl font-bold text-[#2f0a38] mb-2">Acesso Restrito</h2>
        <p className="text-sm text-[#494553] max-w-md mb-6">
          Seu perfil ({user.role === 'TEACHER' ? 'Professor' : 'Coordenador'}) não tem permissão para acessar esta seção.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-chromatic px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7fa] text-[#2f0a38]">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <Header onOpenMobile={() => setMobileOpen(true)} />
      <div className="lg:pl-72 pt-16 min-h-screen flex flex-col">
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
