'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="landing-root">
      {/* Background Decorative Ambient Blobs */}
      <div className="ambient-glow-tertiary" style={{ top: '-8rem', left: '-8rem' }} />
      <div className="ambient-glow-primary" style={{ top: '30%', right: '-6rem' }} />

      {/* Navigation Bar */}
      <header className="landing-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ffe7fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              border: '1px solid #ffdeff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Image
              src="/Polylot.png"
              alt="Logo Polyglot"
              width={36}
              height={36}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              priority
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#491ea9', lineHeight: 1 }}>
              Polyglot<span style={{ color: '#5156ab', fontWeight: 400 }}>Hub</span>
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#494553', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>
              Curso de Idiomas • Portal Acadêmico
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/login"
            className="btn btn-secondary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
            <span>Acessar Portal</span>
          </Link>
          <Link
            href="/login"
            className="btn-chromatic"
          >
            <span>Área Restrita</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        {/* Academic Pill */}
        <div className="hero-pill">
          <span className="pulse-dot" />
          <span>Solução Corporativa Full-Stack • DevSolutions</span>
          <span>•</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>Ano Letivo 2025.1</span>
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Modernização da Gestão Acadêmica do{' '}
          <span className="text-gradient">
            Curso de Idiomas Polyglot
          </span>
        </h1>

        <p className="hero-description">
          Substituição definitiva de diários de classe físicos por um sistema centralizado em nuvem. Notas, presenças, controle de turmas e cálculo automático de médias em tempo real para coordenadores e professores.
        </p>

        {/* Action CTAs */}
        <div className="hero-ctas">
          <Link
            href="/login"
            className="btn-chromatic"
            style={{ padding: '14px 28px', fontSize: '15px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>how_to_reg</span>
            <span>Entrar no Sistema</span>
          </Link>

          <Link
            href="/diario"
            className="btn btn-secondary"
            style={{ padding: '14px 24px', fontSize: '15px', borderRadius: '0.75rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#5156ab' }}>edit_calendar</span>
            <span>Diário de Classe & Pauta</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="landing-feature-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div>
              <div className="card-icon" style={{ background: '#ffe7fe', color: '#491ea9' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>manage_accounts</span>
              </div>
              <h3>Painel da Coordenação</h3>
              <p>CRUD completo de Cursos, Turmas, Professores e Alunos com gestão de vagas e matrículas.</p>
            </div>
            <span className="card-tag" style={{ color: '#5156ab' }}>Perfil: Coordenador</span>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div>
              <div className="card-icon" style={{ background: '#e0e0ff', color: '#383d91' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>school</span>
              </div>
              <h3>Portal do Professor</h3>
              <p>Seleção de turmas sob docência com lançamento ágil de notas (N1, N2, N3) e registro de frequência.</p>
            </div>
            <span className="card-tag" style={{ color: '#5156ab' }}>Perfil: Professor</span>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div>
              <div className="card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>calculate</span>
              </div>
              <h3>Média Final Automática</h3>
              <p>Diferencial implementado: cálculo automatizado da média final e definição do status acadêmico.</p>
            </div>
            <span className="card-tag" style={{ color: '#059669' }}>Diferencial Bônus</span>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <div>
              <div className="card-icon" style={{ background: '#ffdeff', color: '#613dc1' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>description</span>
              </div>
              <h3>Pauta Oficial Centralizada</h3>
              <p>Acesso unificado pela secretaria com exportação e impressão de atas de notas e faltas.</p>
            </div>
            <span className="card-tag" style={{ color: '#491ea9' }}>Secretaria & Registro</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ color: '#2f0a38' }}>Polyglot Academic Portal</strong>
            <span>• Solução Corporativa Full-Stack</span>
          </div>
          <div>
            <span>Desenvolvido por <strong>Bárbara e Eduardo</strong> — Consultoria DevSolutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
