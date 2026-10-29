'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [langFilter, setLangFilter] = useState('all');
  const [docLangFilter, setDocLangFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, classesRes, teachersRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/classes'),
          fetch('/api/teachers'),
        ]);

        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData.stats);
        }
        if (classesRes.ok) {
          const cData = await classesRes.json();
          setClassrooms(cData.classrooms || []);
        }
        if (teachersRes.ok) {
          const tData = await teachersRes.json();
          setTeachers(tData.teachers || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Filter classrooms by language
  const filteredClasses = classrooms.filter((c) => {
    if (langFilter === 'all') return true;
    const l = (c.courseId?.language || '').toLowerCase();
    if (langFilter === 'ing') return l.includes('ing');
    if (langFilter === 'esp') return l.includes('esp');
    if (langFilter === 'fra') return l.includes('fra');
    if (langFilter === 'ale') return l.includes('ale');
    return true;
  });

  // Filter teachers by language specialty
  const filteredTeachers = teachers.filter((t) => {
    if (docLangFilter === 'all') return true;
    const specs = (t.specialties || []).join(' ').toLowerCase();
    if (docLangFilter === 'ing') return specs.includes('ing');
    if (docLangFilter === 'esp') return specs.includes('esp');
    if (docLangFilter === 'fra') return specs.includes('fra');
    if (docLangFilter === 'ale') return specs.includes('ale');
    return true;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#613dc1] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-[#494553]">Sincronizando índices acadêmicos...</p>
        </div>
      </AppShell>
    );
  }

  // =========================================================================
  // VIEW 1: COORDINATOR DASHBOARD (Modo Claro do Coordenador)
  // =========================================================================
  if (user?.role === 'COORDINATOR') {
    return (
      <AppShell>
        <div className="flex flex-col w-full pb-16 space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-[#cac3d6]/30">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#e0e0ff]/30 blur-3xl pointer-events-none" />
            <div className="absolute right-40 top-1/2 h-44 w-44 rounded-full bg-[#b9eaff]/30 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#ffdeff] px-3 py-1 border border-[#fdd6ff]">
                  <span className="h-2 w-2 rounded-full bg-[#491ea9] animate-pulse"></span>
                  <span className="text-[11px] font-bold text-[#491ea9] uppercase tracking-wider">
                    Supervisão Pedagógica • Semestre {stats?.semester || '2025.1'}
                  </span>
                </div>
                <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38] tracking-tight">
                  Painel da Coordenação Acadêmica
                </h1>
                <p className="text-sm sm:text-base text-[#494553]">
                  Olá, <span className="font-bold text-[#491ea9]">{user.name}</span>. Todos os índices pedagógicos, frequências e alocações de turmas estão sincronizados.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl bg-[#ffeffc] px-4 py-2 text-[#2f0a38] text-xs font-semibold flex items-center gap-2 border border-[#ffdeff]">
                  <span className="material-symbols-outlined text-[#5156ab] text-[18px]">campaign</span>
                  <span>Postagem de Notas:</span>
                  <span className="rounded-full bg-[#9ea3fe]/40 px-2 py-0.5 text-[#313589] font-bold">Aberta</span>
                </div>

                <Link
                  href="/turmas"
                  className="rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] px-5 py-2.5 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 no-underline"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Nova Turma</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Card 1: Turmas */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b9eaff] via-[#9ea3fe] to-[#613dc1]" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Turmas Letivas</span>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38] mt-1">{stats?.totalClassrooms || classrooms.length}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#ffdeff] flex items-center justify-center text-[#491ea9]">
                  <span className="material-symbols-outlined text-[24px]">view_agenda</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#cac3d6]/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#494553]">Taxa de Operação</span>
                  <span className="font-['JetBrains_Mono'] text-[#491ea9] font-bold">100% ativas</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#ffdeff] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00475a] to-[#491ea9] w-full" />
                </div>
              </div>
            </div>

            {/* Card 2: Professores */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b9eaff] via-[#9ea3fe] to-[#613dc1]" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Professores</span>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38] mt-1">{stats?.totalTeachers || teachers.length}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#e0e0ff] flex items-center justify-center text-[#5156ab]">
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#cac3d6]/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#494553]">Especializações</span>
                  <span className="font-['JetBrains_Mono'] text-[#5156ab] font-bold">4 Idiomas</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#e0e0ff] overflow-hidden">
                  <div className="h-full rounded-full bg-[#5156ab] w-4/5" />
                </div>
              </div>
            </div>

            {/* Card 3: Alunos Matriculados */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b9eaff] via-[#9ea3fe] to-[#613dc1]" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Alunos Registrados</span>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38] mt-1">{stats?.totalStudents || 0}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#b9eaff]/40 flex items-center justify-center text-[#00475a]">
                  <span className="material-symbols-outlined text-[24px]">group</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#cac3d6]/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#494553]">Assiduidade Média</span>
                  <span className="font-['JetBrains_Mono'] text-[#006078] font-bold">{stats?.avgAttendance || 94.8}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#b9eaff]/40 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#88d0ed] to-[#00475a]" style={{ width: `${stats?.avgAttendance || 94.8}%` }} />
                </div>
              </div>
            </div>

            {/* Card 4: Cursos Ativos */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b9eaff] via-[#9ea3fe] to-[#613dc1]" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Cursos Ofertados</span>
                  <p className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38] mt-1">{stats?.totalCourses || 0}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#ffe7fe] flex items-center justify-center text-[#613dc1]">
                  <span className="material-symbols-outlined text-[24px]">language</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#cac3d6]/20 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#494553]">Quadro Europeu</span>
                  <span className="font-['JetBrains_Mono'] text-[#613dc1] font-bold">Níveis A1 a C2</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#ffe7fe] overflow-hidden">
                  <div className="h-full rounded-full bg-[#613dc1] w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#ffdeff] flex items-center justify-center text-[#491ea9]">
                  <span className="material-symbols-outlined text-[22px]">flash_on</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2f0a38]">Ações Rápidas de Gestão Acadêmica</h2>
                  <p className="text-xs text-[#494553]">Cadastros imediatos para a matriz curricular e enturmações</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/cursos"
                  className="px-4 py-2 rounded-xl bg-white border border-[#cac3d6]/40 hover:border-[#613dc1] text-xs font-semibold text-[#2f0a38] hover:bg-[#ffeffc] transition-all flex items-center gap-1.5 shadow-xs no-underline"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#491ea9]">add_circle</span>
                  <span>+ Cadastrar Curso</span>
                </Link>

                <Link
                  href="/turmas"
                  className="px-4 py-2 rounded-xl bg-white border border-[#cac3d6]/40 hover:border-[#613dc1] text-xs font-semibold text-[#2f0a38] hover:bg-[#ffeffc] transition-all flex items-center gap-1.5 shadow-xs no-underline"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#5156ab]">group_add</span>
                  <span>+ Cadastrar Turma</span>
                </Link>

                <Link
                  href="/professores"
                  className="px-4 py-2 rounded-xl bg-white border border-[#cac3d6]/40 hover:border-[#613dc1] text-xs font-semibold text-[#2f0a38] hover:bg-[#ffeffc] transition-all flex items-center gap-1.5 shadow-xs no-underline"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00475a]">person_add</span>
                  <span>+ Cadastrar Professor</span>
                </Link>

                <Link
                  href="/alunos"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 no-underline"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>+ Matricular Aluno</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Gestão de Turmas */}
          <section className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38]">
                  Gestão Geral de Turmas
                </h2>
                <p className="text-xs text-[#494553]">
                  {filteredClasses.length} turmas em oferta no semestre letivo {stats?.semester}
                </p>
              </div>

              {/* Language Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#ffdeff] border border-[#fdd6ff]">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'ing', label: 'Inglês' },
                  { key: 'esp', label: 'Espanhol' },
                  { key: 'fra', label: 'Francês' },
                  { key: 'ale', label: 'Alemão' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setLangFilter(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      langFilter === item.key
                        ? 'bg-white text-[#491ea9] shadow-xs'
                        : 'text-[#494553] hover:text-[#2f0a38]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turmas Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-[#cac3d6]/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#ffeffc] text-[#494553] text-[11px] font-bold uppercase tracking-wider border-b border-[#cac3d6]/30">
                      <th className="py-3.5 px-5">Código</th>
                      <th className="py-3.5 px-5">Curso / Nível</th>
                      <th className="py-3.5 px-5">Professor Responsável</th>
                      <th className="py-3.5 px-5">Ocupação / Vagas</th>
                      <th className="py-3.5 px-5">Sala & Horário</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cac3d6]/20 text-sm">
                    {filteredClasses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#494553] text-sm">
                          Nenhuma turma encontrada para o filtro selecionado.
                        </td>
                      </tr>
                    ) : (
                      filteredClasses.map((item) => (
                        <tr key={item._id} className="hover:bg-[#ffeffc]/40 transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-md bg-[#ffdeff] text-[#491ea9] font-bold">
                              {item.code}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#2f0a38]">{item.name}</span>
                              <span className="text-xs text-[#494553]">
                                {item.courseId?.language} • CEFR {item.courseId?.cefrLevel}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
                                {item.teacherId?.avatar ? (
                                  <img src={item.teacherId.avatar} alt={item.teacherId.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{item.teacherId?.name?.charAt(0) || 'P'}</span>
                                )}
                              </div>
                              <span className="font-medium text-[#2f0a38] text-xs">
                                {item.teacherId?.name || 'Não atribuído'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-1 w-36">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#2f0a38]">{item.enrolledCount} / {item.capacity}</span>
                                <span className="font-['JetBrains_Mono'] text-[#491ea9]">{item.occupancyRate}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[#ffdeff] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#5156ab] to-[#613dc1]"
                                  style={{ width: `${Math.min(100, item.occupancyRate)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs text-[#494553]">
                            <p className="font-semibold text-[#2f0a38]">{item.room}</p>
                            <p>{item.scheduleDays?.join(', ')} • {item.startTime} - {item.endTime}</p>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                              Confirmada
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <Link
                              href={`/diario/${item._id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#cac3d6]/40 hover:border-[#613dc1] hover:bg-[#ffeffc] text-[#491ea9] text-xs font-semibold shadow-xs no-underline transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>Ver Pauta</span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section: Corpo Docente */}
          <section className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38]">
                  Corpo Docente Ativo
                </h2>
                <p className="text-xs text-[#494553]">
                  {filteredTeachers.length} professores homologados no corpo acadêmico
                </p>
              </div>

              {/* Docente Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#ffdeff] border border-[#fdd6ff]">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'ing', label: 'Inglês' },
                  { key: 'esp', label: 'Espanhol' },
                  { key: 'fra', label: 'Francês' },
                  { key: 'ale', label: 'Alemão' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setDocLangFilter(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      docLangFilter === item.key
                        ? 'bg-white text-[#491ea9] shadow-xs'
                        : 'text-[#494553] hover:text-[#2f0a38]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTeachers.map((t) => (
                <div
                  key={t._id}
                  className="rounded-2xl bg-white p-5 shadow-sm border border-[#cac3d6]/30 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm flex-shrink-0">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{t.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-sm text-[#2f0a38] truncate">{t.name}</h3>
                        <span className="text-[11px] text-[#5156ab] truncate">{t.email}</span>
                        <span className="text-[10px] text-[#494553] truncate">{t.title}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {(t.specialties || []).map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-[#ffdeff] text-[#491ea9] text-[10px] font-semibold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#cac3d6]/20 flex items-center justify-between text-xs">
                    <span className="text-[#494553]">Turmas Ativas:</span>
                    <span className="font-['JetBrains_Mono'] px-2 py-0.5 rounded-full bg-[#e0e0ff] text-[#5156ab] font-bold">
                      {t.activeClassesCount} {t.activeClassesCount === 1 ? 'Turma' : 'Turmas'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  // =========================================================================
  // VIEW 2: TEACHER DASHBOARD (Painel do Professor - Modo Claro)
  // =========================================================================
  return (
    <AppShell>
      <div className="flex flex-col w-full pb-16 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-[#cac3d6]/30">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#88d0ed]/30 via-[#9ea3fe]/20 to-[#613dc1]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ffdeff] text-[#491ea9] text-xs font-bold tracking-wide uppercase">
                  Portal Docente
                </span>
                <span className="font-['JetBrains_Mono'] text-xs text-[#494553] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006078] animate-pulse"></span>
                  Semestre 2025.1
                </span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38] tracking-tight mt-1">
                Olá, {user?.name}
              </h1>
              <p className="text-sm text-[#494553] flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-[18px] text-[#5156ab]">calendar_today</span>
                Acesso aos diários de classe, pautas avaliativas e lançamento de faltas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/diario"
                className="btn-chromatic px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:brightness-105 transition-all flex items-center gap-2 no-underline"
              >
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                <span>Acessar Diário de Classe</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Teacher Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Metric 1: Horário do Dia */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b9eaff] via-[#9ea3fe] to-[#613dc1]" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Suas Turmas</span>
                <p className="font-semibold text-base text-[#2f0a38] mt-1">Turmas sob Docência</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ffdeff] flex items-center justify-center text-[#491ea9]">
                <span className="material-symbols-outlined text-[22px]">schedule</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <div className="flex items-baseline gap-2">
                <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38]">
                  {classrooms.length}
                </span>
                <span className="text-xs text-[#494553]">turmas ativas</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#383d91] font-bold">
                Semestre 2025.1
              </span>
            </div>
          </div>

          {/* Metric 2: Alunos sob Docência */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9ea3fe] via-[#613dc1] to-[#b9eaff]" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Total de Alunos</span>
                <p className="font-semibold text-base text-[#2f0a38] mt-1">Alunos Matriculados</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#e0e0ff] flex items-center justify-center text-[#5156ab]">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <div className="flex items-baseline gap-2">
                <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38]">
                  {classrooms.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}
                </span>
                <span className="text-xs text-[#494553]">estudantes</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-full bg-[#ffdeff] text-[#491ea9] font-bold">
                Regularizados
              </span>
            </div>
          </div>

          {/* Metric 3: Frequência */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#613dc1] via-[#b9eaff] to-[#9ea3fe]" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider">Frequência Global</span>
                <p className="font-semibold text-base text-[#2f0a38] mt-1">Média de Assiduidade</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#b9eaff]/40 flex items-center justify-center text-[#00475a]">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <div className="flex items-baseline gap-2">
                <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38]">
                  {stats?.teacherStats?.avgAttendance || stats?.avgAttendance || 95.2}%
                </span>
                <span className="text-xs text-[#494553]">presença</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#059669] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> Meta {'>'} 85%
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal Turmas Gallery */}
        <section className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-7 rounded-full bg-[#613dc1]" />
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38]">
                Docente em <span className="text-[#613dc1]">({classrooms.length} Turmas Ativas)</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classrooms.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#ffdeff] text-[#491ea9] text-xs font-bold uppercase">
                      CEFR {c.courseId?.cefrLevel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
                      Em andamento
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">{c.name}</h3>
                    <p className="text-xs text-[#494553] mt-0.5">Código: {c.code}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#ffeffc] border border-[#ffdeff] flex flex-col gap-2 mt-1 text-xs">
                    <div className="flex items-center gap-2 text-[#494553]">
                      <span className="material-symbols-outlined text-[18px] text-[#5156ab]">schedule</span>
                      <span>{c.scheduleDays?.join(', ')} • {c.startTime} – {c.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#494553]">
                      <span className="material-symbols-outlined text-[18px] text-[#5156ab]">location_on</span>
                      <span>{c.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#494553]">
                      <span className="material-symbols-outlined text-[18px] text-[#5156ab]">groups</span>
                      <span>
                        <strong className="text-[#2f0a38]">{c.enrolledCount || 0}</strong> alunos matriculados (Capacidade: {c.capacity})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#cac3d6]/20 flex items-center gap-2">
                  <Link
                    href={`/diario/${c._id}`}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(97,61,193,0.28)] hover:brightness-105 no-underline transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                    <span>Diário de Classe & Pauta</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fast Action & Quick Links Banner */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ffe7fe] flex items-center justify-center text-[#613dc1]">
              <span className="material-symbols-outlined text-[28px]">fact_check</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2f0a38]">Lançamento Oficial de Notas e Presenças</h3>
              <p className="text-xs text-[#494553]">Selecione qualquer uma de suas turmas para registrar chamadas ou lançar notas com cálculo automático de média.</p>
            </div>
          </div>
          <Link
            href="/diario"
            className="px-5 py-2.5 rounded-xl bg-[#613dc1] text-white text-xs font-bold no-underline hover:brightness-105 transition-all shadow-sm"
          >
            Abrir Pauta Geral
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
