'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function AlunosPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Forms
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    status: 'ACTIVE',
  });

  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    classroomId: '',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    try {
      const [stuRes, clsRes, enrRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/classes?all=true'),
        fetch('/api/enrollments'),
      ]);

      if (stuRes.ok) {
        const d = await stuRes.json();
        setStudents(d.students || []);
        if (d.students?.length > 0 && !enrollForm.studentId) {
          setEnrollForm((prev) => ({ ...prev, studentId: d.students[0]._id }));
        }
      }
      if (clsRes.ok) {
        const d = await clsRes.json();
        setClassrooms(d.classrooms || []);
        if (d.classrooms?.length > 0 && !enrollForm.classroomId) {
          setEnrollForm((prev) => ({ ...prev, classroomId: d.classrooms[0]._id }));
        }
      }
      if (enrRes.ok) {
        const d = await enrRes.json();
        setEnrollments(d.enrollments || []);
      }
    } catch (err) {
      console.error('Error loading students data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateStudent = () => {
    setEditingStudent(null);
    setStudentForm({ name: '', email: '', phone: '', cpf: '', status: 'ACTIVE' });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: any) => {
    setEditingStudent(s);
    setStudentForm({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      cpf: s.cpf || '',
      status: s.status || 'ACTIVE',
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStudent ? `/api/students/${editingStudent._id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar aluno');
        return;
      }
      showToast(editingStudent ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
      setIsStudentModalOpen(false);
      setStudentForm({ name: '', email: '', phone: '', cpf: '', status: 'ACTIVE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o aluno "${name}" e todas as suas matrículas?`)) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao excluir aluno');
        return;
      }
      showToast('Aluno removido com sucesso!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.studentId || !enrollForm.classroomId) {
      alert('Selecione o aluno e a turma');
      return;
    }

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao matricular aluno');
        return;
      }
      showToast('Aluno matriculado com sucesso na turma!');
      setIsEnrollModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const handleUnenroll = async (enrollmentId: string, className: string) => {
    if (!confirm(`Deseja realmente desmatricular o aluno da turma "${className}"?`)) return;
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao desmatricular');
        return;
      }
      showToast('Matrícula desfeita com sucesso!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.registration.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell allowedRoles={['COORDINATOR']}>
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#006078] text-white px-5 py-3 rounded-xl shadow-lg border border-[#88d0ed] flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdeff] text-xs font-bold text-[#491ea9] mb-2 border border-[#fdd6ff]">
              <span className="material-symbols-outlined text-[16px]">person_search</span>
              Secretaria & Registros Acadêmicos
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38]">
              Gestão de Alunos & Matrículas
            </h1>
            <p className="text-sm text-[#494553]">
              CRUD completo de alunos, matrículas em turmas e controle de vagas da Polyglot.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              onClick={handleOpenCreateStudent}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#cac3d6]/40 text-[#491ea9] text-xs font-bold hover:bg-[#ffeffc] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Novo Aluno</span>
            </button>
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="btn-chromatic px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Matricular em Turma</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#cac3d6]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#494553]">Total de Alunos</span>
              <p className="font-['Space_Grotesk'] text-2xl font-bold text-[#2f0a38] mt-0.5">{students.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ffdeff] flex items-center justify-center text-[#491ea9]">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#cac3d6]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#494553]">Matrículas Ativas</span>
              <p className="font-['Space_Grotesk'] text-2xl font-bold text-[#2f0a38] mt-0.5">{enrollments.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#e0e0ff] flex items-center justify-center text-[#383d91]">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#cac3d6]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#494553]">Turmas Ofertadas</span>
              <p className="font-['Space_Grotesk'] text-2xl font-bold text-[#2f0a38] mt-0.5">{classrooms.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#d1fae5] flex items-center justify-center text-[#059669]">
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[#494553]/70 text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do aluno, e-mail institucional ou matrícula..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-[#cac3d6]/40 text-xs sm:text-sm text-[#2f0a38] outline-none focus:border-[#613dc1] focus:ring-2 focus:ring-[#613dc1]/20 shadow-xs"
          />
        </div>

        {/* Students Table with Full CRUD Actions */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-[#cac3d6]/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ffeffc] text-[#494553] text-[11px] font-bold uppercase tracking-wider border-b border-[#cac3d6]/30">
                  <th className="py-3.5 px-6">Aluno</th>
                  <th className="py-3.5 px-4">Matrícula</th>
                  <th className="py-3.5 px-4">E-mail Institucional</th>
                  <th className="py-3.5 px-4">Telefone</th>
                  <th className="py-3.5 px-4">Turmas Matriculadas</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Ações (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cac3d6]/20 text-sm">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#494553]">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const studentEnrollments = enrollments.filter(
                      (e) => e.studentId?._id === s._id || e.studentId === s._id
                    );
                    return (
                      <tr key={s._id} className="hover:bg-[#ffeffc]/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 shadow-xs">
                              {s.avatar ? (
                                <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{s.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#2f0a38]">{s.name}</span>
                              <span className="text-[11px] text-[#494553]">CPF: {s.cpf || 'Não informado'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded-md bg-[#ffdeff] text-[#491ea9] font-bold">
                            {s.registration}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-[#5156ab] font-medium">{s.email}</td>
                        <td className="py-4 px-4 text-xs text-[#494553]">{s.phone || '—'}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {studentEnrollments.length === 0 ? (
                              <span className="text-xs text-[#7a7585] italic">Não enturmado</span>
                            ) : (
                              studentEnrollments.map((enr: any) => (
                                <div key={enr._id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e0e0ff] text-[#383d91] text-[10px] font-bold">
                                  <Link
                                    href={`/diario/${enr.classroomId?._id || enr.classroomId}`}
                                    className="hover:underline no-underline text-[#383d91]"
                                    title="Acessar Diário da Turma"
                                  >
                                    {enr.classroomId?.code || 'Turma'}
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleUnenroll(enr._id, enr.classroomId?.name || enr.classroomId?.code || 'Turma')}
                                    className="hover:text-[#ba1a1a] cursor-pointer"
                                    title="Desmatricular da Turma"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              s.status === 'ACTIVE'
                                ? 'bg-[#d1fae5] text-[#059669]'
                                : s.status === 'GRADUATED'
                                ? 'bg-[#cffafe] text-[#0891b2]'
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                            }`}
                          >
                            {s.status === 'ACTIVE' ? 'Ativo' : s.status === 'GRADUATED' ? 'Formado' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEnrollForm({ ...enrollForm, studentId: s._id });
                                setIsEnrollModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#fff7fa] border border-[#cac3d6]/40 hover:bg-[#ffdeff] text-[#491ea9] text-xs font-semibold cursor-pointer shadow-xs"
                              title="Matricular em Turma"
                            >
                              <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                              <span>Enturmar</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditStudent(s)}
                              className="p-1.5 rounded-lg text-[#5156ab] hover:bg-[#ffdeff] cursor-pointer"
                              title="Editar Aluno"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteStudent(s._id, s.name)}
                              className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 cursor-pointer"
                              title="Excluir Aluno"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Cadastrar / Editar Aluno */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  {editingStudent ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
                </h2>
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beatriz Ramos"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">E-mail Institucional *</label>
                  <input
                    type="email"
                    required
                    placeholder="beatriz.ramos@aluno.polyglot.edu.br"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Telefone</label>
                    <input
                      type="text"
                      placeholder="(19) 99111-2233"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">CPF</label>
                    <input
                      type="text"
                      placeholder="123.456.789-00"
                      value={studentForm.cpf}
                      onChange={(e) => setStudentForm({ ...studentForm, cpf: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                    />
                  </div>
                </div>

                {editingStudent && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Situação Cadastral</label>
                    <select
                      value={studentForm.status}
                      onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                    >
                      <option value="ACTIVE">Ativo</option>
                      <option value="INACTIVE">Inativo</option>
                      <option value="GRADUATED">Formado / Concluinte</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cac3d6]/20">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#494553] hover:bg-[#fff7fa] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#613dc1] text-white text-xs font-bold shadow-sm hover:brightness-105 cursor-pointer"
                  >
                    {editingStudent ? 'Salvar Alterações' : 'Salvar Aluno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Matricular em Turma */}
        {isEnrollModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  Matricular Aluno em Turma
                </h2>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleEnrollStudent} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Selecione o Aluno *</label>
                  <select
                    value={enrollForm.studentId}
                    onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  >
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.registration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Selecione a Turma Letiva *</label>
                  <select
                    value={enrollForm.classroomId}
                    onChange={(e) => setEnrollForm({ ...enrollForm, classroomId: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  >
                    {classrooms.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} — {c.name} ({c.enrolledCount || 0}/{c.capacity} vagas)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Observações Pedagógicas</label>
                  <textarea
                    rows={2}
                    placeholder="Bolsista, transferência de horário, etc..."
                    value={enrollForm.notes}
                    onChange={(e) => setEnrollForm({ ...enrollForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cac3d6]/20">
                  <button
                    type="button"
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#494553] hover:bg-[#fff7fa] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#613dc1] text-white text-xs font-bold shadow-sm hover:brightness-105 cursor-pointer"
                  >
                    Confirmar Matrícula
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
