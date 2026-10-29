'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<'teacher' | 'coordinator'>('teacher');
  const [email, setEmail] = useState('maria.silva@polyglot.edu.br');
  const [password, setPassword] = useState('prof123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (newRole: 'teacher' | 'coordinator') => {
    setRole(newRole);
    if (newRole === 'coordinator') {
      setEmail('coordenacao@polyglot.edu.br');
      setPassword('admin123');
    } else {
      setEmail('maria.silva@polyglot.edu.br');
      setPassword('prof123');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string, quickRole: 'teacher' | 'coordinator') => {
    setRole(quickRole);
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-[#fff7fa] text-[#2f0a38] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Chromatic Ambient Glow Elements */}
      <div className="absolute -top-24 -left-20 w-80 h-80 bg-gradient-to-br from-[#88d0ed]/25 via-[#9ea3fe]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tr from-[#cebdff]/30 via-[#fdd6ff]/25 to-transparent rounded-full blur-3xl pointer-events-none" />

      <main className="w-full max-w-md mx-auto relative z-10">
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#613dc1]/5 border border-[#cac3d6]/40 overflow-hidden transition-all duration-300">
          {/* Prismatic Top Indicator Strip */}
          <div className="w-full h-1.5 bg-gradient-to-r from-[#b9eaff] via-[#9ea3fe] to-[#613dc1]" />

          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {/* Top Branding with Polylot Mascot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#ffe7fe] flex items-center justify-center p-1 shadow-sm overflow-hidden border border-[#ffdeff]">
                  <Image
                    src="/Polylot.png"
                    alt="Logo Polyglot"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[17px] tracking-wider text-[#491ea9] font-bold">
                    POLYGLOT<span className="text-[#5156ab] font-normal">EDU</span>
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#494553]">
                    Linguistic Hub
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffeffc] text-[#00475a] shadow-sm border border-[#ffdeff]">
                <span className="material-symbols-outlined text-[14px] text-[#00475a]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <span className="text-[11px] font-semibold text-[#00475a] tracking-wide uppercase">
                  Seguro
                </span>
              </div>
            </div>

            {/* Header Typography */}
            <div className="flex flex-col gap-1">
              <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[#2f0a38] tracking-tight">
                Acesso ao Portal Acadêmico
              </h1>
              <p className="text-sm text-[#494553]">
                Selecione o seu perfil institucional para prosseguir
              </p>
            </div>

            {/* Segmented Role Selector */}
            <div className="p-1 rounded-xl bg-[#ffeffc] flex items-center gap-1 border border-[#ffdeff]">
              <button
                type="button"
                onClick={() => handleRoleSelect('teacher')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  role === 'teacher'
                    ? 'bg-white text-[#491ea9] shadow-sm border border-[#cac3d6]/30'
                    : 'text-[#494553] hover:text-[#2f0a38]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>Sou Professor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('coordinator')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  role === 'coordinator'
                    ? 'bg-white text-[#491ea9] shadow-sm border border-[#cac3d6]/30'
                    : 'text-[#494553] hover:text-[#2f0a38]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                <span>Sou Coordenador</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-medium flex items-center gap-2 border border-[#ba1a1a]/20">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#2f0a38] flex items-center justify-between" htmlFor="email">
                  <span>E-mail Institucional</span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#5156ab]">@polyglot.edu.br</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#494553]/70 text-[20px] pointer-events-none">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome.sobrenome@polyglot.edu.br"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#ffeffc]/60 text-[#2f0a38] placeholder:text-[#494553]/50 text-sm outline-none border border-[#ffdeff] focus:bg-white focus:border-[#613dc1] focus:ring-2 focus:ring-[#613dc1]/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#2f0a38]" htmlFor="password">
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-[#491ea9] hover:underline cursor-pointer">
                    Esqueceu a senha?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#494553]/70 text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#ffeffc]/60 text-[#2f0a38] placeholder:text-[#494553]/50 text-sm outline-none border border-[#ffdeff] focus:bg-white focus:border-[#613dc1] focus:ring-2 focus:ring-[#613dc1]/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#494553]/70 hover:text-[#2f0a38] transition-colors p-1 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#613dc1] accent-[#613dc1] cursor-pointer"
                  />
                  <span className="text-xs text-[#494553]">Lembrar-me neste dispositivo</span>
                </label>
              </div>

              {/* Primary Action Button with Radiant Chromatic Gradient */}
              <button
                type="submit"
                disabled={loading}
                className="relative group mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white font-semibold text-sm shadow-lg shadow-[#613dc1]/25 hover:shadow-xl hover:shadow-[#613dc1]/35 active:scale-[0.99] transition-all duration-200 overflow-hidden flex items-center justify-center gap-2 disabled:opacity-75"
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-white/70 via-white/40 to-transparent" />
                <span>
                  {loading
                    ? 'Autenticando...'
                    : role === 'teacher'
                    ? 'Entrar como Professor'
                    : 'Entrar como Coordenador'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-white transition-transform duration-200 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="p-3.5 rounded-xl bg-[#ffeffc]/50 border border-[#ffdeff] flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#5156ab] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                Acesso Rápido para Avaliação:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('coordenacao@polyglot.edu.br', 'admin123', 'coordinator')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#ffdeff] hover:border-[#613dc1] text-[11px] font-semibold text-[#0e7490] hover:bg-[#cffafe]/40 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0e7490]"></span>
                  Coordenador (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('maria.silva@polyglot.edu.br', 'prof123', 'teacher')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#ffdeff] hover:border-[#613dc1] text-[11px] font-semibold text-[#059669] hover:bg-[#d1fae5]/40 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                  Profª Maria Silva
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('carlos.eduardo@polyglot.edu.br', 'prof123', 'teacher')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#ffdeff] hover:border-[#613dc1] text-[11px] font-semibold text-[#5156ab] hover:bg-[#e0e0ff]/40 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5156ab]"></span>
                  Prof. Carlos Eduardo
                </button>
              </div>
            </div>
          </div>

          {/* Micro Subtle Bottom Bar */}
          <div className="py-3 px-6 bg-[#ffe7fe]/40 border-t border-[#cac3d6]/20 flex items-center justify-between text-[#494553] font-['JetBrains_Mono'] text-[11px]">
            <span className="tracking-tight">Polyglot Idiomas</span>
            <span className="text-[#7a7585]">Gestão Acadêmica • MVP Full-Stack</span>
          </div>
        </div>
      </main>
    </div>
  );
}
