'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';

function PautaContent() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get('classId');

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || '');
  const [classData, setClassData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchStudent, setSearchStudent] = useState('');

  // 1. Load all classrooms
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes?all=true');
        if (res.ok) {
          const d = await res.json();
          const list = d.classrooms || [];
          setClassrooms(list);
          if (!selectedClassId && list.length > 0) {
            setSelectedClassId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    }
    fetchClasses();
  }, []);

  // 2. Load selected class details & enrollments
  useEffect(() => {
    if (!selectedClassId) return;

    async function loadClassDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/classes/${selectedClassId}`);
        if (res.ok) {
          const d = await res.json();
          setClassData(d.classroom);
          setEnrollments(d.enrollments || []);
          setMetrics(d.metrics || {});
        }
      } catch (err) {
        console.error('Error loading class details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClassDetails();
  }, [selectedClassId]);

  // Statistics calculation
  const totalEnrolled = enrollments.length;
  const approvedCount = enrollments.filter((e) => e.status === 'APROVADO').length;
  const recoveryCount = enrollments.filter((e) => e.status === 'RECUPERACAO').length;
  const failedGradeCount = enrollments.filter((e) => e.status === 'REPROVADO_NOTA').length;
  const failedAbsenceCount = enrollments.filter((e) => e.status === 'REPROVADO_FALTA').length;
  const inProgressCount = enrollments.filter((e) => e.status === 'CURSANDO').length;

  const filteredEnrollments = enrollments.filter((enr) => {
    const student = enr.studentId;
    if (!student) return false;

    if (statusFilter !== 'ALL' && enr.status !== statusFilter) {
      return false;
    }

    if (searchStudent) {
      const q = searchStudent.toLowerCase();
      const matchName = student.name?.toLowerCase().includes(q);
      const matchReg = student.registration?.toLowerCase().includes(q);
      const matchEmail = student.email?.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchEmail) return false;
    }

    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell allowedRoles={['COORDINATOR', 'TEACHER']}>
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Header - Screen only */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdeff] text-xs font-bold text-[#491ea9] mb-2 border border-[#fdd6ff]">
              <span className="material-symbols-outlined text-[16px]">grade</span>
              Secretaria Acadêmica • Ata Oficial de Resultados
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38]">
              Pauta da Turma (Notas & Faltas)
            </h1>
            <p className="text-sm text-[#494553]">
              Visualização centralizada de notas, faltas, frequências e médias com cálculo automático.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#cac3d6]/40 hover:bg-[#ffdeff] text-[#491ea9] text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Imprimir / Exportar Ata</span>
            </button>

            {selectedClassId && (
              <Link
                href={`/diario/${selectedClassId}`}
                className="btn-chromatic px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 no-underline"
              >
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                <span>Lançar / Editar no Diário</span>
              </Link>
            )}
          </div>
        </div>

        {/* Printable Header - Visible ONLY when printing */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-black">
                Curso de Idiomas Polyglot
              </h1>
              <p className="text-xs text-black">
                Secretaria Acadêmica Central • Ata Oficial de Aproveitamento Escolar & Frequência
              </p>
            </div>
            <div className="text-right text-xs text-black">
              <p><strong>Ano Letivo:</strong> 2025.1</p>
              <p><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Classroom Selector Bar */}
        <div className="print:hidden p-4 rounded-2xl bg-white border border-[#cac3d6]/30 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-[#2f0a38] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#613dc1]">meeting_room</span>
              Selecione a Turma:
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs font-bold text-[#2f0a38] outline-none cursor-pointer focus:border-[#613dc1]"
            >
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.name} ({c.enrolledCount || 0}/{c.capacity} alunos)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#494553]">
              Total de alunos listados: <strong>{filteredEnrollments.length}</strong> de {totalEnrolled}
            </span>
          </div>
        </div>

        {/* Class Information Banner */}
        {classData && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 relative overflow-hidden print:border print:shadow-none">
            <div className="print:hidden absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#cac3d6]/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold px-2.5 py-1 rounded-md bg-[#ffdeff] text-[#491ea9]">
                    {classData.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold">
                    Nível CEFR {classData.courseId?.cefrLevel}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#383d91] text-xs font-bold">
                    {classData.courseId?.language}
                  </span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38] mt-2">
                  {classData.name}
                </h2>
                <p className="text-xs text-[#494553] mt-0.5">
                  Curso: <strong>{classData.courseId?.name}</strong> ({classData.courseId?.workloadHours} horas letivas)
                </p>
              </div>

              <div className="text-xs text-[#494553] flex flex-col gap-1 sm:text-right">
                <p>
                  <strong>Professor(a) Titular:</strong> {classData.teacherId?.name || 'Não atribuído'}
                </p>
                <p>
                  <strong>Horário & Dias:</strong> {classData.scheduleDays?.join(', ')} • {classData.startTime} às {classData.endTime}
                </p>
                <p>
                  <strong>Ambiente:</strong> {classData.room} | <strong>Capacidade:</strong> {classData.capacity} vagas
                </p>
              </div>
            </div>

            {/* KPI Statistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/30 text-center">
                <span className="text-[10px] uppercase font-bold text-[#494553]">Total Alunos</span>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38] mt-0.5">{totalEnrolled}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/30 text-center">
                <span className="text-[10px] uppercase font-bold text-[#494553]">Média da Turma</span>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-[#491ea9] mt-0.5">
                  {metrics?.classAverage !== undefined ? metrics.classAverage : '—'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/30 text-center">
                <span className="text-[10px] uppercase font-bold text-[#494553]">Presença Média</span>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-[#006078] mt-0.5">
                  {metrics?.classAttendanceRate !== undefined ? `${metrics.classAttendanceRate}%` : '—'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#d1fae5]/50 border border-[#a7f3d0] text-center">
                <span className="text-[10px] uppercase font-bold text-[#059669]">Aprovados (&ge;7.0)</span>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-[#059669] mt-0.5">{approvedCount}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#fef3c7]/50 border border-[#fde68a] text-center">
                <span className="text-[10px] uppercase font-bold text-[#d97706]">Recuperação</span>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-[#d97706] mt-0.5">{recoveryCount}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#ffdad6]/50 border border-[#fca5a5] text-center">
                <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">Reprovados</span>
                <p className="font-['Space_Grotesk'] text-xl font-bold text-[#ba1a1a] mt-0.5">
                  {failedGradeCount + failedAbsenceCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Strip - Screen only */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#cac3d6]/30 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-[#2f0a38] pl-2">Situação:</span>
            {[
              { key: 'ALL', label: 'Todos os Alunos' },
              { key: 'APROVADO', label: `Aprovados (${approvedCount})` },
              { key: 'RECUPERACAO', label: `Recuperação (${recoveryCount})` },
              { key: 'REPROVADO_NOTA', label: `Reprovados p/ Nota (${failedGradeCount})` },
              { key: 'REPROVADO_FALTA', label: `Reprovados p/ Falta (${failedAbsenceCount})` },
              { key: 'CURSANDO', label: `Cursando (${inProgressCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-[#613dc1] text-white shadow-xs'
                    : 'bg-[#fff7fa] text-[#494553] hover:text-[#2f0a38] border border-[#cac3d6]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[#494553]/70 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar aluno na pauta..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/40 text-xs outline-none focus:border-[#613dc1]"
            />
          </div>
        </div>

        {/* Main Pauta Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-[#cac3d6]/30 print:border print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ffeffc] text-[#494553] text-[11px] font-bold uppercase tracking-wider border-b border-[#cac3d6]/30 print:bg-gray-100 print:text-black">
                  <th className="py-3.5 px-4">Nº</th>
                  <th className="py-3.5 px-5">Aluno & Matrícula</th>
                  <th className="py-3.5 px-3 text-center">N1</th>
                  <th className="py-3.5 px-3 text-center">N2</th>
                  <th className="py-3.5 px-3 text-center">N3</th>
                  <th className="py-3.5 px-3 text-center">Faltas (40h)</th>
                  <th className="py-3.5 px-3 text-center">Frequência</th>
                  <th className="py-3.5 px-4 text-center bg-[#fdf2f8] print:bg-gray-100">
                    Média Final (Bônus)
                  </th>
                  <th className="py-3.5 px-5 text-center">Situação Acadêmica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cac3d6]/20 text-sm print:divide-black">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#494553]">
                      Nenhum aluno encontrado na pauta com os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enr, idx) => {
                    const student = enr.studentId;
                    if (!student) return null;

                    const n1 = enr.grades?.n1;
                    const n2 = enr.grades?.n2;
                    const n3 = enr.grades?.n3;
                    const avg = enr.finalAverage;
                    const absences = enr.absences || 0;
                    const attRate = enr.attendanceRate !== undefined ? enr.attendanceRate : 100;

                    let statusBadge = {
                      label: 'Cursando',
                      bg: 'bg-[#e0e0ff] text-[#383d91]',
                    };

                    if (enr.status === 'APROVADO') {
                      statusBadge = { label: 'Aprovado', bg: 'bg-[#d1fae5] text-[#059669]' };
                    } else if (enr.status === 'RECUPERACAO') {
                      statusBadge = { label: 'Recuperação', bg: 'bg-[#fef3c7] text-[#d97706]' };
                    } else if (enr.status === 'REPROVADO_NOTA') {
                      statusBadge = { label: 'Reprovado por Nota', bg: 'bg-[#fee2e2] text-[#dc2626]' };
                    } else if (enr.status === 'REPROVADO_FALTA') {
                      statusBadge = { label: 'Reprovado por Falta', bg: 'bg-[#ffdad6] text-[#ba1a1a]' };
                    }

                    return (
                      <tr key={enr._id} className="hover:bg-[#ffeffc]/30 transition-colors">
                        <td className="py-3.5 px-4 font-['JetBrains_Mono'] text-xs text-[#494553]">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="print:hidden w-9 h-9 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 shadow-xs">
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{student.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#2f0a38] text-xs sm:text-sm">{student.name}</span>
                              <span className="font-['JetBrains_Mono'] text-[11px] text-[#494553]">
                                {student.registration}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* N1 */}
                        <td className="py-3.5 px-3 text-center font-['JetBrains_Mono'] text-xs font-semibold">
                          {n1 !== null && n1 !== undefined ? Number(n1).toFixed(1) : '—'}
                        </td>

                        {/* N2 */}
                        <td className="py-3.5 px-3 text-center font-['JetBrains_Mono'] text-xs font-semibold">
                          {n2 !== null && n2 !== undefined ? Number(n2).toFixed(1) : '—'}
                        </td>

                        {/* N3 */}
                        <td className="py-3.5 px-3 text-center font-['JetBrains_Mono'] text-xs font-semibold">
                          {n3 !== null && n3 !== undefined ? Number(n3).toFixed(1) : '—'}
                        </td>

                        {/* Faltas */}
                        <td className="py-3.5 px-3 text-center font-['JetBrains_Mono'] text-xs">
                          <span className={absences > 10 ? 'text-[#ba1a1a] font-bold' : 'text-[#2f0a38]'}>
                            {absences}
                          </span>
                        </td>

                        {/* Frequência % */}
                        <td className="py-3.5 px-3 text-center font-['JetBrains_Mono'] text-xs font-bold">
                          <span className={attRate < 75 ? 'text-[#ba1a1a]' : 'text-[#059669]'}>
                            {attRate}%
                          </span>
                        </td>

                        {/* Média Final Calculada Automaticamente */}
                        <td className="py-3.5 px-4 text-center bg-[#fdf2f8]/40 print:bg-transparent">
                          <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#491ea9] px-2 py-0.5 rounded-md bg-[#ffdeff] print:bg-transparent print:text-black">
                            {avg !== null && avg !== undefined ? Number(avg).toFixed(1) : '—'}
                          </span>
                        </td>

                        {/* Situação Final */}
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Signatures - Visible ONLY when printing */}
        <div className="hidden print:block pt-16">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-t border-black pt-2 w-3/4 mx-auto">
                <p className="font-bold">{classData?.teacherId?.name || 'Professor(a) Responsável'}</p>
                <p className="text-gray-600">Docente Titular</p>
              </div>
            </div>
            <div>
              <div className="border-t border-black pt-2 w-3/4 mx-auto">
                <p className="font-bold">Prof. Roberto Albuquerque</p>
                <p className="text-gray-600">Coordenação Pedagógica Polyglot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function PautaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fff7fa]">
          <div className="w-10 h-10 border-4 border-[#613dc1] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PautaContent />
    </Suspense>
  );
}

