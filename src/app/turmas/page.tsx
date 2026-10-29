'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function TurmasPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    language: 'Inglês',
    cefrLevel: 'B2',
    workloadHours: 60,
    material: '',
    description: '',
  });

  // Classroom Form State (Creation)
  const [classForm, setClassForm] = useState({
    code: 'ENG-2025-04',
    name: '',
    courseId: '',
    teacherId: '',
    capacity: 18,
    semester: '2025.1',
    scheduleDays: ['SEG', 'QUA'],
    startTime: '19:00',
    endTime: '20:30',
    room: 'Sala 101 - Multimídia',
    startDate: '2025-03-03',
    endDate: '2025-06-30',
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editClassForm, setEditClassForm] = useState({
    name: '',
    courseId: '',
    teacherId: '',
    capacity: 18,
    scheduleDays: ['SEG', 'QUA'],
    startTime: '19:00',
    endTime: '20:30',
    room: 'Sala 101',
    status: 'IN_PROGRESS',
  });

  const availableDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    try {
      const [coursesRes, teachersRes, classesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/teachers'),
        fetch('/api/classes?all=true'),
      ]);

      if (coursesRes.ok) {
        const c = await coursesRes.json();
        setCourses(c.courses || []);
        if (c.courses?.length > 0 && !classForm.courseId) {
          setClassForm((prev) => ({ ...prev, courseId: c.courses[0]._id }));
        }
      }
      if (teachersRes.ok) {
        const t = await teachersRes.json();
        setTeachers(t.teachers || []);
        if (t.teachers?.length > 0 && !classForm.teacherId) {
          setClassForm((prev) => ({ ...prev, teacherId: t.teachers[0]._id }));
        }
      }
      if (classesRes.ok) {
        const cl = await classesRes.json();
        setClassrooms(cl.classrooms || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDay = (day: string, isEditing: boolean = false) => {
    if (isEditing) {
      const current = editClassForm.scheduleDays;
      if (current.includes(day)) {
        if (current.length > 1) {
          setEditClassForm({ ...editClassForm, scheduleDays: current.filter((d) => d !== day) });
        }
      } else {
        setEditClassForm({ ...editClassForm, scheduleDays: [...current, day] });
      }
    } else {
      const current = classForm.scheduleDays;
      if (current.includes(day)) {
        if (current.length > 1) {
          setClassForm({ ...classForm, scheduleDays: current.filter((d) => d !== day) });
        }
      } else {
        setClassForm({ ...classForm, scheduleDays: [...current, day] });
      }
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao criar curso');
        return;
      }
      showToast('Matriz de Curso salva com sucesso!');
      setCourseForm({
        code: '',
        name: '',
        language: 'Inglês',
        cefrLevel: 'B2',
        workloadHours: 60,
        material: '',
        description: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro na requisição');
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.courseId || !classForm.teacherId) {
      alert('Selecione o Curso e o Professor responsável');
      return;
    }

    try {
      const selectedCourse = courses.find((c) => c._id === classForm.courseId);
      const payload = {
        ...classForm,
        name: classForm.name || (selectedCourse ? `Turma ${selectedCourse.name}` : `Turma ${classForm.code}`),
      };

      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao criar turma');
        return;
      }
      showToast('Turma gerada e enturmada com sucesso!');
      setClassForm((prev) => ({
        ...prev,
        code: `TUR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
      }));
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro na requisição');
    }
  };

  const handleOpenEditClass = (c: any) => {
    setEditingClass(c);
    setEditClassForm({
      name: c.name,
      courseId: c.courseId?._id || c.courseId,
      teacherId: c.teacherId?._id || c.teacherId,
      capacity: c.capacity || 18,
      scheduleDays: c.scheduleDays || ['SEG', 'QUA'],
      startTime: c.startTime || '19:00',
      endTime: c.endTime || '20:30',
      room: c.room || 'Sala 01',
      status: c.status || 'IN_PROGRESS',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    try {
      const res = await fetch(`/api/classes/${editingClass._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClassForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao editar turma');
        return;
      }
      showToast('Turma atualizada com sucesso!');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Deseja realmente remover esta turma e todos os seus vínculos?')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Turma removida com sucesso');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao remover turma');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredClassrooms = classrooms.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.courseId?.name || '').toLowerCase().includes(q) ||
      (c.teacherId?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <AppShell allowedRoles={['COORDINATOR']}>
      <div className="flex flex-col w-full pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#006078] text-white px-5 py-3 rounded-xl shadow-lg border border-[#88d0ed] flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <section className="flex flex-col gap-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdeff] w-fit shadow-xs border border-[#fdd6ff]">
            <span className="w-2 h-2 rounded-full bg-[#613dc1] animate-pulse"></span>
            <span className="text-xs font-bold text-[#491ea9] uppercase tracking-wider">
              Módulo de Coordenação Pedagógica • Ano Letivo 2025.1
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38] tracking-tight">
                Gestão de Cursos & Turmas (Oferta Letiva)
              </h1>
              <p className="text-sm text-[#494553] max-w-3xl mt-1">
                CRUD completo de Matriz Curricular (Cursos) e Turmas letivas associando cursos e professores com controle de vagas e pauta centralizada.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#form-curso"
                className="px-4 py-2 rounded-xl bg-white border border-[#cac3d6]/40 text-[#491ea9] text-xs font-bold hover:bg-[#ffeffc] transition-all no-underline shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Novo Curso</span>
              </a>
              <a
                href="#form-turma"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white text-xs font-bold hover:opacity-95 transition-all no-underline shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">group_add</span>
                <span>Nova Turma</span>
              </a>
            </div>
          </div>
        </section>

        {/* Dual Column Form Canvas */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
          {/* COLUMN 1: Cadastrar Novo Curso */}
          <div
            id="form-curso"
            className="flex flex-col rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-[#cac3d6]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1]" />

            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#cac3d6]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffe7fe] flex items-center justify-center text-[#491ea9]">
                  <span className="material-symbols-outlined text-[22px]">auto_stories</span>
                </div>
                <div>
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                    Cadastrar Novo Curso
                  </h2>
                  <span className="text-[11px] font-semibold text-[#5156ab] uppercase tracking-wider">
                    Parâmetros curriculares & nível CEFR
                  </span>
                </div>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-full bg-[#ffdeff] text-[#491ea9] font-bold">
                MATRIZ
              </span>
            </div>

            <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">
                    Código <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ING-201"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs font-bold text-[#2f0a38] uppercase outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">
                    Nome Oficial do Curso <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Francês Aplicado a Negócios"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Idioma</label>
                  <select
                    value={courseForm.language}
                    onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  >
                    <option value="Inglês">Inglês</option>
                    <option value="Espanhol">Espanhol</option>
                    <option value="Francês">Francês</option>
                    <option value="Alemão">Alemão</option>
                    <option value="Italiano">Italiano</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Nível CEFR</label>
                  <select
                    value={courseForm.cefrLevel}
                    onChange={(e) => setCourseForm({ ...courseForm, cefrLevel: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  >
                    <option value="A1">A1 - Iniciante</option>
                    <option value="A2">A2 - Básico</option>
                    <option value="B1">B1 - Intermediário</option>
                    <option value="B2">B2 - Independente</option>
                    <option value="C1">C1 - Avançado</option>
                    <option value="C2">C2 - Proficiente</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Carga Horária (h)</label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={courseForm.workloadHours}
                    onChange={(e) => setCourseForm({ ...courseForm, workloadHours: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs font-['JetBrains_Mono'] text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#2f0a38]">Material Didático Recomendado</label>
                <input
                  type="text"
                  placeholder="Ex: Cambridge Empower B2 & Textos Complementares"
                  value={courseForm.material}
                  onChange={(e) => setCourseForm({ ...courseForm, material: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#2f0a38]">Ementa Resumida & Objetivos</label>
                <textarea
                  rows={3}
                  placeholder="Objetivos pedagógicos, habilidades orais e gramaticais..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1] resize-none"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  <span>Salvar Curso na Matriz</span>
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 2: Cadastrar Nova Turma */}
          <div
            id="form-turma"
            className="flex flex-col rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-[#cac3d6]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9ea3fe] via-[#613dc1] to-[#006078]" />

            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#cac3d6]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffeffc] flex items-center justify-center text-[#613dc1]">
                  <span className="material-symbols-outlined text-[22px]">calendar_add_on</span>
                </div>
                <div>
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                    Cadastrar Nova Turma
                  </h2>
                  <span className="text-[11px] font-semibold text-[#5156ab] uppercase tracking-wider">
                    Alocação de grade, professor e limites
                  </span>
                </div>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-full bg-[#e0e0ff] text-[#383d91] font-bold">
                OFERTA
              </span>
            </div>

            <form onSubmit={handleCreateClassroom} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">
                    Código da Turma <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ENG-2025-02"
                    value={classForm.code}
                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs font-['JetBrains_Mono'] font-bold text-[#2f0a38] uppercase outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">
                    Capacidade (Vagas) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs font-['JetBrains_Mono'] text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#2f0a38]">
                  Curso Vinculado <span className="text-[#ba1a1a]">*</span>
                </label>
                <select
                  value={classForm.courseId}
                  onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.language} • CEFR {course.cefrLevel} - {course.workloadHours}h)
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#2f0a38]">
                  Professor Responsável <span className="text-[#ba1a1a]">*</span>
                </label>
                <select
                  value={classForm.teacherId}
                  onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} — {teacher.title} ({teacher.activeClassesCount || 0} turmas ativas)
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule Days with Interactive Chips */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2f0a38]">Dias das Aulas Semanais</span>
                  <span className="text-[#5156ab] font-bold">
                    {classForm.scheduleDays.length} dias selecionados
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableDays.map((day) => {
                    const isSelected = classForm.scheduleDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day, false)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-['JetBrains_Mono'] text-xs transition-all shadow-xs cursor-pointer ${
                          isSelected
                            ? 'bg-[#613dc1] text-white font-bold shadow-[0_3px_10px_rgba(97,61,193,0.3)]'
                            : 'bg-[#fff7fa] text-[#494553] border border-[#cac3d6]/50 hover:bg-[#ffdeff]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours and Room */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Horário Início</label>
                  <input
                    type="time"
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Horário Término</label>
                  <input
                    type="time"
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Sala / Ambiente</label>
                  <input
                    type="text"
                    value={classForm.room}
                    onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#88d0ed] via-[#9ea3fe] to-[#613dc1] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                  <span>Criar e Alocar Turma</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* List of Registered Turmas with Quick Actions */}
        <section className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38]">
                Turmas Cadastradas ({filteredClassrooms.length})
              </h2>
              <span className="text-xs text-[#5156ab] font-bold">Semestre Letivo 2025.1</span>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#494553]/70 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Filtrar por código, curso, prof..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#cac3d6]/40 text-xs outline-none focus:border-[#613dc1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClassrooms.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold px-2.5 py-1 rounded-md bg-[#ffdeff] text-[#491ea9]">
                      {c.code}
                    </span>
                    <span className="text-xs font-semibold text-[#006078] bg-[#b9eaff]/40 px-2 py-0.5 rounded-full">
                      {c.courseId?.language}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#2f0a38]">{c.name}</h3>
                    <p className="text-xs text-[#494553]">Prof: {c.teacherId?.name || 'A definir'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/30 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#494553]">Ocupação:</span>
                      <span className="font-bold text-[#2f0a38]">
                        {c.enrolledCount || 0} / {c.capacity} alunos ({c.occupancyRate}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#494553]">Local:</span>
                      <span className="font-medium text-[#2f0a38]">{c.room}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#494553]">Horário:</span>
                      <span className="font-medium text-[#2f0a38]">{c.scheduleDays?.join(', ')} • {c.startTime}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#cac3d6]/20 flex items-center justify-between gap-2">
                  <Link
                    href={`/pauta?classId=${c._id}`}
                    className="flex-1 py-2 rounded-xl bg-[#613dc1] text-white text-xs font-bold text-center no-underline hover:brightness-105 shadow-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">description</span>
                    <span>Ver Pauta</span>
                  </Link>

                  <button
                    onClick={() => handleOpenEditClass(c)}
                    className="p-2 rounded-xl bg-[#fff7fa] hover:bg-[#ffdeff] text-[#491ea9] border border-[#cac3d6]/40 text-xs transition-colors cursor-pointer"
                    title="Editar Turma"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClass(c._id)}
                    className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs transition-colors cursor-pointer"
                    title="Excluir Turma"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal: Editar Turma */}
        {isEditModalOpen && editingClass && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  Editar Turma ({editingClass.code})
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEditClass} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Nome da Turma</label>
                  <input
                    type="text"
                    required
                    value={editClassForm.name}
                    onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Curso</label>
                    <select
                      value={editClassForm.courseId}
                      onChange={(e) => setEditClassForm({ ...editClassForm, courseId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name} ({course.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Professor Responsável</label>
                    <select
                      value={editClassForm.teacherId}
                      onChange={(e) => setEditClassForm({ ...editClassForm, teacherId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    >
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Capacidade</label>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={editClassForm.capacity}
                      onChange={(e) => setEditClassForm({ ...editClassForm, capacity: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Horário Início</label>
                    <input
                      type="time"
                      value={editClassForm.startTime}
                      onChange={(e) => setEditClassForm({ ...editClassForm, startTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Horário Término</label>
                    <input
                      type="time"
                      value={editClassForm.endTime}
                      onChange={(e) => setEditClassForm({ ...editClassForm, endTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Sala / Ambiente</label>
                    <input
                      type="text"
                      value={editClassForm.room}
                      onChange={(e) => setEditClassForm({ ...editClassForm, room: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Status</label>
                    <select
                      value={editClassForm.status}
                      onChange={(e) => setEditClassForm({ ...editClassForm, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    >
                      <option value="OPEN">Aberta para Matrículas</option>
                      <option value="IN_PROGRESS">Em Andamento</option>
                      <option value="COMPLETED">Encerrada</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#2f0a38]">Dias Semanais</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableDays.map((day) => {
                      const isSelected = editClassForm.scheduleDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day, true)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-['JetBrains_Mono'] text-xs transition-all shadow-xs cursor-pointer ${
                            isSelected
                              ? 'bg-[#613dc1] text-white font-bold'
                              : 'bg-[#fff7fa] text-[#494553] border border-[#cac3d6]/50 hover:bg-[#ffdeff]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cac3d6]/20">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#494553] hover:bg-[#fff7fa] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#613dc1] text-white text-xs font-bold shadow-sm hover:brightness-105 cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
