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
    <div className="auth-wrapper">
      {/* Chromatic Ambient Glow Elements */}
      <div className="glow-1" />
      <div className="glow-2" />

      <main className="auth-card">
        {/* Prismatic Top Indicator Strip */}
        <div className="card-top-strip" />

        <div className="auth-card-body">
          {/* Top Branding with Polylot Mascot */}
          <div className="auth-brand-row">
            <div className="brand-group">
              <div className="brand-logo-box">
                <Image
                  src="/Polylot.png"
                  alt="Logo Polyglot"
                  width={36}
                  height={36}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  priority
                />
              </div>
              <div className="brand-text">
                <span className="brand-title">
                  POLYGLOT<span>EDU</span>
                </span>
                <span className="brand-subtitle">
                  Linguistic Hub
                </span>
              </div>
            </div>

            <div className="badge-secure">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>
                verified_user
              </span>
              <span>Seguro</span>
            </div>
          </div>

          {/* Header Typography */}
          <div className="auth-title-group">
            <h1>Acesso ao Portal Acadêmico</h1>
            <p>Selecione o seu perfil institucional para prosseguir</p>
          </div>

          {/* Segmented Role Selector */}
          <div className="role-toggle-bar">
            <button
              type="button"
              onClick={() => handleRoleSelect('teacher')}
              className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">school</span>
              <span>Sou Professor</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('coordinator')}
              className={`role-btn ${role === 'coordinator' ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">manage_accounts</span>
              <span>Sou Coordenador</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error-box">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email">
                <span>E-mail Institucional</span>
                <span className="domain-tag">@polyglot.edu.br</span>
              </label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome.sobrenome@polyglot.edu.br"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="password">
                <span>Senha de Acesso</span>
                <span className="forgot-link">Esqueceu a senha?</span>
              </label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password-btn"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="form-checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Lembrar-me neste dispositivo</span>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit-auth"
            >
              <span>
                {loading
                  ? 'Autenticando...'
                  : role === 'teacher'
                  ? 'Entrar como Professor'
                  : 'Entrar como Coordenador'}
              </span>
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="quick-demo-box">
            <span className="quick-title">
              <span className="material-symbols-outlined">touch_app</span>
              Acesso Rápido para Avaliação:
            </span>
            <div className="quick-buttons">
              <button
                type="button"
                onClick={() => handleQuickLogin('coordenacao@polyglot.edu.br', 'admin123', 'coordinator')}
                className="quick-chip chip-admin"
              >
                <span className="dot" />
                Coordenador (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('maria.silva@polyglot.edu.br', 'prof123', 'teacher')}
                className="quick-chip chip-teacher-1"
              >
                <span className="dot" />
                Profª Maria Silva
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('carlos.eduardo@polyglot.edu.br', 'prof123', 'teacher')}
                className="quick-chip chip-teacher-2"
              >
                <span className="dot" />
                Prof. Carlos Eduardo
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Bar */}
        <div className="auth-card-footer">
          <span>Polyglot Idiomas</span>
          <span>Gestão Acadêmica • MVP Full-Stack</span>
        </div>
      </main>
    </div>
  );
}
