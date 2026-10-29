'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

interface ClassDiaryViewProps {
  initialClassId?: string;
}

export default function ClassDiaryView({ initialClassId }: ClassDiaryViewProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || '');
  const [classData, setClassData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'roster' | 'grades'>('daily');
  const [viewMode, setViewMode] = useState<'teacher' | 'coordinator'>('teacher');
  const [loading, setLoading] = useState(true);
  const [savingGrades, setSavingGrades] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Daily attendance state for today
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [classTopic, setClassTopic] = useState('Unidade 6 — Advanced Inversion & Rhetorical Emphatics');
  const [dailyStatusMap, setDailyStatusMap] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED'; arrivalTime?: string; justification?: string }>>({});

  // Editable grades state map: enrollmentId -> { n1, n2, n3, absences }
  const [gradesDraft, setGradesDraft] = useState<Record<string, { n1: string; n2: string; n3: string; absences: number }>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Load available classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch('/api/classes?all=true');
        if (res.ok) {
          const data = await res.json();
          const list = data.classrooms || [];
          setClassrooms(list);

          if (user?.role === 'TEACHER') {
            const myClasses = list.filter((c: any) => (c.teacherId?._id || c.teacherId) === user.id);
            if (myClasses.length > 0) {
              if (!selectedClassId || !myClasses.some((c: any) => c._id === selectedClassId)) {
                setSelectedClassId(myClasses[0]._id);
              }
            } else if (list.length > 0 && !selectedClassId) {
              setSelectedClassId(list[0]._id);
            }
          } else if (!selectedClassId && list.length > 0) {
            setSelectedClassId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading classes:', err);
      }
    }
    loadClasses();
  }, [user]);

  // 2. Load class details, enrollments, attendance whenever selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) return;

    async function loadClassDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/classes/${selectedClassId}`);
        if (res.ok) {
          const data = await res.json();
          setClassData(data.classroom);
          setEnrollments(data.enrollments || []);
          setAttendanceRecords(data.attendanceHistory || []);
          setMetrics(data.metrics || {});

          // Initialize editable grades draft
          const draft: Record<string, { n1: string; n2: string; n3: string; absences: number }> = {};
          data.enrollments?.forEach((e: any) => {
            draft[e._id] = {
              n1: e.grades?.n1 !== null && e.grades?.n1 !== undefined ? String(e.grades.n1) : '',
              n2: e.grades?.n2 !== null && e.grades?.n2 !== undefined ? String(e.grades.n2) : '',
              n3: e.grades?.n3 !== null && e.grades?.n3 !== undefined ? String(e.grades.n3) : '',
              absences: e.absences || 0,
            };
          });
          setGradesDraft(draft);

          // Initialize daily attendance
          const existingSession = data.attendanceHistory?.find((s: any) => s.date === attendanceDate);
          const attMap: Record<string, any> = {};

          if (existingSession && existingSession.records) {
            setClassTopic(existingSession.topic || classTopic);
            existingSession.records.forEach((rec: any) => {
              const sId = rec.studentId?._id || rec.studentId;
              attMap[sId] = {
                status: rec.status,
                arrivalTime: rec.arrivalTime || '',
                justification: rec.justification || '',
              };
            });
          } else {
            // Default: all present
            data.enrollments?.forEach((e: any) => {
              const sId = e.studentId?._id || e.studentId;
              attMap[sId] = {
                status: 'PRESENT',
                arrivalTime: '19:00',
                justification: '',
              };
            });
          }
          setDailyStatusMap(attMap);
        }
      } catch (err) {
        console.error('Error loading class details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadClassDetails();
  }, [selectedClassId, attendanceDate]);

  // Set default viewMode based on user role
  useEffect(() => {
    if (user?.role === 'COORDINATOR') {
      setViewMode('coordinator');
    } else {
      setViewMode('teacher');
    }
  }, [user]);

  // Tab 1: Attendance handlers
  const handleMarkAllPresent = () => {
    const updated = { ...dailyStatusMap };
    enrollments.forEach((e) => {
      const sId = e.studentId?._id || e.studentId;
      updated[sId] = {
        status: 'PRESENT',
        arrivalTime: '19:00',
        justification: '',
      };
    });
    setDailyStatusMap(updated);
    showToast('Todos os alunos marcados como Presentes');
  };

  const handleToggleStudentAttendance = (studentId: string) => {
    const current = dailyStatusMap[studentId]?.status || 'PRESENT';
    let nextStatus: 'PRESENT' | 'ABSENT' | 'JUSTIFIED' = 'ABSENT';
    if (current === 'PRESENT') nextStatus = 'ABSENT';
    else if (current === 'ABSENT') nextStatus = 'JUSTIFIED';
    else nextStatus = 'PRESENT';

    setDailyStatusMap({
      ...dailyStatusMap,
      [studentId]: {
        ...dailyStatusMap[studentId],
        status: nextStatus,
        arrivalTime: nextStatus === 'PRESENT' ? '19:00' : '',
        justification: nextStatus === 'JUSTIFIED' ? 'Atestado / Justificativa informada' : '',
      },
    });
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = enrollments.map((e) => {
        const sId = e.studentId?._id || e.studentId;
        const entry = dailyStatusMap[sId] || { status: 'PRESENT' };
        return {
          studentId: sId,
          status: entry.status,
          arrivalTime: entry.arrivalTime || '',
          justification: entry.justification || '',
        };
      });

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId: selectedClassId,
          date: attendanceDate,
          sessionNumber: 24,
          topic: classTopic,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar chamada');
        return;
      }

      showToast('Chamada diária e frequências salvas no Diário de Classe!');
      // Reload class details to update absence counters in enrollments
      const classRes = await fetch(`/api/classes/${selectedClassId}`);
      if (classRes.ok) {
        const cData = await classRes.json();
        setEnrollments(cData.enrollments || []);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Tab 3: Grade calculation & save handlers
  const handleGradeChange = (enrollmentId: string, field: 'n1' | 'n2' | 'n3', value: string) => {
    setGradesDraft((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  const handleAbsencesChange = (enrollmentId: string, value: number) => {
    setGradesDraft((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        absences: Math.max(0, value),
      },
    }));
  };

  // Live average calculation for preview in input table
  const computeLiveAverage = (n1Str: string, n2Str: string, n3Str: string) => {
    const list: number[] = [];
    if (n1Str !== '' && !isNaN(Number(n1Str))) list.push(Number(n1Str));
    if (n2Str !== '' && !isNaN(Number(n2Str))) list.push(Number(n2Str));
    if (n3Str !== '' && !isNaN(Number(n3Str))) list.push(Number(n3Str));

    if (list.length === 0) return null;
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    return Math.round(avg * 10) / 10;
  };

  const computeLiveStatus = (avg: number | null, absences: number, totalClasses = 40) => {
    const attendanceRate = Math.round(((totalClasses - absences) / totalClasses) * 100);
    if (attendanceRate < 75) {
      return { status: 'REPROVADO_FALTA', label: 'Reprovado por Falta', class: 'status-reprovado' };
    }
    if (avg === null) {
      return { status: 'CURSANDO', label: 'Cursando', class: 'bg-[#e0e0ff] text-[#383d91]' };
    }
    if (avg >= 7.0) {
      return { status: 'APROVADO', label: 'Aprovado', class: 'status-aprovado' };
    }
    if (avg >= 5.0) {
      return { status: 'RECUPERACAO', label: 'Recuperação', class: 'status-recuperacao' };
    }
    return { status: 'REPROVADO_NOTA', label: 'Reprovado por Nota', class: 'status-reprovado' };
  };

  const handleSaveAllGrades = async () => {
    setSavingGrades(true);
    try {
      // Update each enrollment in parallel
      const promises = enrollments.map((e) => {
        const draft = gradesDraft[e._id];
        if (!draft) return Promise.resolve();

        const n1 = draft.n1 === '' ? null : Number(draft.n1);
        const n2 = draft.n2 === '' ? null : Number(draft.n2);
        const n3 = draft.n3 === '' ? null : Number(draft.n3);

        return fetch(`/api/enrollments/${e._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grades: { n1, n2, n3 },
            absences: draft.absences,
            totalClasses: 40,
          }),
        });
      });

      await Promise.all(promises);
      showToast('Pauta acadêmica e cálculo de médias salvos com sucesso!');

      // Reload fresh data
      const res = await fetch(`/api/classes/${selectedClassId}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments || []);
        setMetrics(data.metrics || {});
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar notas');
    } finally {
      setSavingGrades(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#006078] text-white px-5 py-3 rounded-xl shadow-lg border border-[#88d0ed] flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Sub-Header / Breadcrumbs & Role Context Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[#cac3d6]/30 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/turmas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-xs hover:bg-[#ffdeff] transition-all text-[#5156ab] text-xs font-semibold no-underline border border-[#cac3d6]/30"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Turmas</span>
            </Link>

            <span className="text-[#cac3d6]">/</span>

            {/* Class Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 px-3 pr-8 rounded-full bg-[#ffeffc] border border-[#ffdeff] text-xs font-bold text-[#2f0a38] outline-none cursor-pointer"
              >
                {(user?.role === 'TEACHER'
                  ? classrooms.filter((c: any) => (c.teacherId?._id || c.teacherId) === user.id)
                  : classrooms
                ).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedClassId && (
              <Link
                href={`/pauta?classId=${selectedClassId}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-xs hover:bg-[#ffdeff] transition-all text-[#491ea9] text-xs font-semibold no-underline border border-[#cac3d6]/30"
              >
                <span className="material-symbols-outlined text-[15px]">description</span>
                <span>Pauta Oficial</span>
              </Link>
            )}
          </div>

          {/* Role Switch Toggle (Modo Professor / Modo Coordenador) */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-xs border border-[#cac3d6]/30">
            <span className="text-[11px] font-bold text-[#494553] uppercase tracking-wider pl-2 pr-1">
              Visão Atual:
            </span>
            <button
              type="button"
              onClick={() => setViewMode('teacher')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'teacher'
                  ? 'bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white shadow-xs'
                  : 'text-[#494553] hover:text-[#2f0a38]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Modo Professor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('coordinator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'coordinator'
                  ? 'bg-[#cffafe] text-[#0e7490] border border-[#a5f3fc] shadow-xs'
                  : 'text-[#494553] hover:text-[#2f0a38]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Modo Coordenador</span>
            </button>
          </div>
        </div>

        {/* Hero Class Header & Analytical Overview */}
        {classData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Class Info Card */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1]" />

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[#2f0a38]">
                      {classData.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdeff] text-[#491ea9] font-['JetBrains_Mono'] text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#613dc1] animate-pulse"></span>
                      ATIVO • {classData.semester}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ffeffc] font-['JetBrains_Mono'] text-xs text-[#5156ab] font-bold">
                    Código: {classData.code}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#494553] mb-6 max-w-2xl leading-relaxed">
                  {classData.courseId?.description ||
                    'Programa acadêmico de línguas com preparação estruturada para conversação, escrita ensaística e avaliações periódicas chanceladas pelo CEFR.'}
                </p>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#ffeffc] border border-[#ffdeff]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#5156ab] uppercase tracking-wider">Curso Vinculado</span>
                    <span className="font-bold text-xs text-[#2f0a38] mt-1 truncate">{classData.courseId?.name}</span>
                    <span className="text-[11px] text-[#494553]">Nível CEFR {classData.courseId?.cefrLevel}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#5156ab] uppercase tracking-wider">Docente Titular</span>
                    <span className="font-bold text-xs text-[#2f0a38] mt-1 truncate">{classData.teacherId?.name}</span>
                    <span className="text-[11px] text-[#494553] truncate">{classData.teacherId?.title || 'Docente'}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#5156ab] uppercase tracking-wider">Horário & Sala</span>
                    <span className="font-bold text-xs text-[#2f0a38] mt-1">
                      {classData.scheduleDays?.join('/')} • {classData.startTime}
                    </span>
                    <span className="text-[11px] text-[#494553] truncate">{classData.room}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#5156ab] uppercase tracking-wider">Ocupação</span>
                    <span className="font-bold text-xs text-[#2f0a38] mt-1">
                      {metrics?.totalEnrolled || 0} / {classData.capacity} Alunos
                    </span>
                    <div className="w-full bg-[#ffdeff] rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#88d0ed] to-[#613dc1] h-full rounded-full"
                        style={{ width: `${Math.min(100, metrics?.occupancyRate || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Session Indicator */}
              <div className="mt-6 pt-4 border-t border-[#cac3d6]/20 flex flex-wrap items-center justify-between text-xs text-[#494553]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#006078]">calendar_clock</span>
                  <span>Data da Sessão: {attendanceDate}</span>
                </div>
                <span className="font-['JetBrains_Mono'] px-2.5 py-0.5 rounded-full bg-[#e0e0ff] text-[#383d91] font-bold">
                  Sessão nº 24 de 40
                </span>
              </div>
            </div>

            {/* Quick Metric Highlight Cards */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Card 1: Frequência */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#cac3d6]/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#5156ab] uppercase tracking-wider">
                    Frequência Acumulada
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38]">
                      {metrics?.classAttendanceRate || 94.2}%
                    </span>
                    <span className="text-[10px] font-bold text-[#059669] bg-[#d1fae5] px-2 py-0.5 rounded-full">
                      Meta {'>'} 75%
                    </span>
                  </div>
                  <span className="text-xs text-[#494553] mt-1">Excelente índice de assiduidade</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#d1fae5] flex items-center justify-center text-[#059669]">
                  <span className="material-symbols-outlined text-[26px]">verified</span>
                </div>
              </div>

              {/* Card 2: Média Geral da Turma */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#cac3d6]/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#5156ab] uppercase tracking-wider">
                    Média da Turma
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#2f0a38]">
                      {metrics?.classAverage || '8.2'}
                    </span>
                    <span className="text-xs text-[#494553]">/ 10.0</span>
                  </div>
                  <span className="text-xs text-[#494553] mt-1">
                    {enrollments.filter((e) => (e.finalAverage || 0) >= 7.0).length} alunos acima da média
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#ffe7fe] flex items-center justify-center text-[#613dc1]">
                  <span className="material-symbols-outlined text-[26px]">grade</span>
                </div>
              </div>

              {/* Card 3: Progresso */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#cac3d6]/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#5156ab] uppercase tracking-wider">
                    Aulas Ministradas
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#2f0a38]">24 / 40</span>
                    <span className="text-xs text-[#494553]">Aulas</span>
                  </div>
                  <div className="w-32 bg-[#ffdeff] rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-[#613dc1] h-full rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#491ea9] bg-[#ffdeff] px-2.5 py-1 rounded-full">
                  60%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Primary Tab Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cac3d6]/30 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white shadow-[0_4px_14px_rgba(97,61,193,0.28)]'
                  : 'text-[#494553] hover:text-[#2f0a38] hover:bg-[#ffeffc]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>1. Chamada Diária (Hoje)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'grades'
                  ? 'bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white shadow-[0_4px_14px_rgba(97,61,193,0.28)]'
                  : 'text-[#494553] hover:text-[#2f0a38] hover:bg-[#ffeffc]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              <span>2. Pauta de Notas & Médias (Cálculo Automático)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white shadow-[0_4px_14px_rgba(97,61,193,0.28)]'
                  : 'text-[#494553] hover:text-[#2f0a38] hover:bg-[#ffeffc]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">groups</span>
              <span>3. Lista Geral de Alunos ({enrollments.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffeffc] border border-[#ffdeff]">
            <span className="w-2 h-2 rounded-full bg-[#613dc1] animate-ping"></span>
            <span className="text-xs font-bold text-[#2f0a38]">Pauta Aberta para Edição</span>
          </div>
        </div>

        {/* TAB 1: CHAMADA DIÁRIA */}
        {activeTab === 'daily' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#cac3d6]/30 overflow-hidden flex flex-col">
            <div className="p-6 bg-[#ffeffc]/50 border-b border-[#cac3d6]/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                    Diário de Presença do Dia
                  </span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-white border border-[#cac3d6]/40 text-xs text-[#2f0a38] font-bold"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#494553] whitespace-nowrap">Tópico da Aula:</span>
                  <input
                    type="text"
                    value={classTopic}
                    onChange={(e) => setClassTopic(e.target.value)}
                    placeholder="Conteúdo programático ministrado hoje..."
                    className="w-full h-8 px-2.5 rounded-lg bg-white border border-[#cac3d6]/40 text-xs text-[#2f0a38] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-4 py-2 rounded-xl bg-white border border-[#cac3d6]/40 hover:bg-[#ffdeff] text-[#2f0a38] text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#491ea9]">done_all</span>
                  <span>Marcar Todos Presentes</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="btn-chromatic px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{savingAttendance ? 'Salvando...' : 'Salvar Chamada'}</span>
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#ffeffc] text-[#494553] text-[11px] font-bold uppercase tracking-wider border-b border-[#cac3d6]/30">
                    <th className="py-3.5 px-6">Aluno & Matrícula</th>
                    <th className="py-3.5 px-4">Status de Presença</th>
                    <th className="py-3.5 px-4">Horário / Justificativa</th>
                    <th className="py-3.5 px-4 text-center">Frequência Acumulada</th>
                    <th className="py-3.5 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cac3d6]/20 text-sm">
                  {enrollments.map((enr) => {
                    const student = enr.studentId;
                    if (!student) return null;
                    const entry = dailyStatusMap[student._id] || { status: 'PRESENT' };
                    const isPresent = entry.status === 'PRESENT';
                    const isAbsent = entry.status === 'ABSENT';
                    const isJustified = entry.status === 'JUSTIFIED';

                    return (
                      <tr
                        key={enr._id}
                        className={`transition-colors ${
                          isAbsent ? 'bg-[#ffdad6]/20 hover:bg-[#ffdad6]/30' : 'hover:bg-[#ffeffc]/40'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 shadow-xs">
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{student.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#2f0a38]">{student.name}</span>
                              <span className="font-['JetBrains_Mono'] text-[11px] text-[#494553]">
                                {student.registration}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {isPresent && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                              Presente
                            </span>
                          )}
                          {isAbsent && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                              Falta Registrada
                            </span>
                          )}
                          {isJustified && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] text-[#d97706] text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#d97706]"></span>
                              Falta Justificada
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-xs">
                          {isPresent && (
                            <span className="font-['JetBrains_Mono'] text-[#2f0a38] font-semibold">
                              19:00 (Pontual)
                            </span>
                          )}
                          {isAbsent && (
                            <span className="text-[#ba1a1a] font-medium italic">Ausente sem justificativa</span>
                          )}
                          {isJustified && (
                            <span className="text-[#d97706] font-medium">{entry.justification || 'Atestado'}</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`font-['JetBrains_Mono'] font-bold text-xs ${
                              (enr.attendanceRate || 100) < 75 ? 'text-[#ba1a1a]' : 'text-[#2f0a38]'
                            }`}
                          >
                            {enr.attendanceRate || 100}%
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentAttendance(student._id)}
                            className="px-3.5 py-1.5 rounded-full bg-white border border-[#cac3d6]/40 hover:bg-[#ffdeff] text-[#491ea9] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                          >
                            Alterar Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAUTA DE NOTAS & MÉDIAS AUTOMÁTICAS (BÔNUS E CRITÉRIO PRINCIPAL) */}
        {activeTab === 'grades' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#cac3d6]/30 overflow-hidden flex flex-col space-y-4">
            <div className="p-6 bg-[#ffeffc]/50 border-b border-[#cac3d6]/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  Pauta Consolidada de Notas & Faltas
                </h2>
                <p className="text-xs text-[#494553]">
                  Lançamento de notas (N1, N2, N3) e faltas com <strong>cálculo automático de média</strong> e situação acadêmica.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAllGrades}
                  disabled={savingGrades}
                  className="btn-chromatic px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{savingGrades ? 'Salvando...' : 'Salvar Notas e Pauta'}</span>
                </button>
              </div>
            </div>

            {/* Criteria Info Banner */}
            <div className="mx-6 p-4 rounded-xl bg-[#ffeffc] border border-[#ffdeff] text-xs text-[#494553] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#613dc1] text-[20px]">info</span>
                <span>
                  <strong>Critérios de Aprovação:</strong> Média final &ge; 7.0 e Assiduidade &ge; 75%. Média entre 5.0 e 6.9 &rarr; Recuperação. Faltas &gt; 25% (10 faltas de 40 aulas) &rarr; Reprovado por Falta.
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] font-bold text-[#613dc1]">
                Semestre 2025.1
              </span>
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#ffeffc] text-[#494553] text-[11px] font-bold uppercase tracking-wider border-b border-[#cac3d6]/30">
                    <th className="py-3.5 px-4">Aluno</th>
                    <th className="py-3.5 px-3 text-center">Nota 1 (N1)</th>
                    <th className="py-3.5 px-3 text-center">Nota 2 (N2)</th>
                    <th className="py-3.5 px-3 text-center">Nota 3 (N3)</th>
                    <th className="py-3.5 px-3 text-center">Faltas</th>
                    <th className="py-3.5 px-3 text-center">Frequência</th>
                    <th className="py-3.5 px-4 text-center">Média Final (Bônus)</th>
                    <th className="py-3.5 px-4 text-center">Situação Acadêmica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cac3d6]/20 text-sm">
                  {enrollments.map((enr) => {
                    const student = enr.studentId;
                    if (!student) return null;
                    const draft = gradesDraft[enr._id] || { n1: '', n2: '', n3: '', absences: 0 };
                    const liveAvg = computeLiveAverage(draft.n1, draft.n2, draft.n3);
                    const liveStatus = computeLiveStatus(liveAvg, draft.absences, 40);

                    return (
                      <tr key={enr._id} className="hover:bg-[#ffeffc]/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#2f0a38] text-xs sm:text-sm">{student.name}</span>
                            <span className="font-['JetBrains_Mono'] text-[11px] text-[#494553]">
                              {student.registration}
                            </span>
                          </div>
                        </td>

                        {/* N1 input */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={draft.n1}
                            onChange={(e) => handleGradeChange(enr._id, 'n1', e.target.value)}
                            placeholder="—"
                            className="w-16 h-9 text-center font-['JetBrains_Mono'] font-bold text-xs bg-[#fff7fa] border border-[#cac3d6]/50 rounded-lg outline-none focus:bg-white focus:border-[#613dc1]"
                          />
                        </td>

                        {/* N2 input */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={draft.n2}
                            onChange={(e) => handleGradeChange(enr._id, 'n2', e.target.value)}
                            placeholder="—"
                            className="w-16 h-9 text-center font-['JetBrains_Mono'] font-bold text-xs bg-[#fff7fa] border border-[#cac3d6]/50 rounded-lg outline-none focus:bg-white focus:border-[#613dc1]"
                          />
                        </td>

                        {/* N3 input */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={draft.n3}
                            onChange={(e) => handleGradeChange(enr._id, 'n3', e.target.value)}
                            placeholder="—"
                            className="w-16 h-9 text-center font-['JetBrains_Mono'] font-bold text-xs bg-[#fff7fa] border border-[#cac3d6]/50 rounded-lg outline-none focus:bg-white focus:border-[#613dc1]"
                          />
                        </td>

                        {/* Faltas input */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={draft.absences}
                            onChange={(e) => handleAbsencesChange(enr._id, Number(e.target.value))}
                            className="w-16 h-9 text-center font-['JetBrains_Mono'] font-bold text-xs bg-[#fff7fa] border border-[#cac3d6]/50 rounded-lg outline-none focus:bg-white focus:border-[#613dc1]"
                          />
                        </td>

                        {/* Frequência calculada */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`font-['JetBrains_Mono'] text-xs font-bold ${
                              (40 - draft.absences) / 40 < 0.75 ? 'text-[#ba1a1a]' : 'text-[#2f0a38]'
                            }`}
                          >
                            {Math.round(((40 - draft.absences) / 40) * 100)}%
                          </span>
                        </td>

                        {/* Automated Final Average Cell */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-block px-3 py-1 rounded-lg bg-[#ffeffc] border border-[#ffdeff]">
                            <span className="font-['JetBrains_Mono'] font-bold text-sm text-[#491ea9]">
                              {liveAvg !== null ? liveAvg.toFixed(1) : '—'}
                            </span>
                          </div>
                        </td>

                        {/* Automated Academic Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${liveStatus.class}`}>
                            {liveStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LISTA GERAL DE ALUNOS */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#cac3d6]/30 overflow-hidden flex flex-col">
            <div className="p-6 bg-[#ffeffc]/50 border-b border-[#cac3d6]/20 flex items-center justify-between">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  Alunos Matriculados nesta Turma ({enrollments.length})
                </h2>
                <p className="text-xs text-[#494553]">
                  Relação oficial de acadêmicos cadastrados na turma {classData?.code}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#ffeffc] text-[#494553] text-[11px] font-bold uppercase tracking-wider border-b border-[#cac3d6]/30">
                    <th className="py-3.5 px-6">Aluno</th>
                    <th className="py-3.5 px-4">Matrícula</th>
                    <th className="py-3.5 px-4">E-mail Institucional</th>
                    <th className="py-3.5 px-4">Telefone</th>
                    <th className="py-3.5 px-4">Data da Matrícula</th>
                    <th className="py-3.5 px-6 text-center">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cac3d6]/20 text-sm">
                  {enrollments.map((enr) => {
                    const student = enr.studentId;
                    if (!student) return null;
                    return (
                      <tr key={enr._id} className="hover:bg-[#ffeffc]/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 shadow-xs">
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{student.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="font-semibold text-[#2f0a38]">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-['JetBrains_Mono'] text-xs font-bold text-[#491ea9]">
                          {student.registration}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#5156ab] font-medium">{student.email}</td>
                        <td className="py-4 px-4 text-xs text-[#494553]">{student.phone || '—'}</td>
                        <td className="py-4 px-4 text-xs text-[#494553]">
                          {new Date(enr.enrollmentDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold">
                            Regular
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
