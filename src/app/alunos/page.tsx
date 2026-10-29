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

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Forms
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });

  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    classroomId: '',
    notes: '',
  });

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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao cadastrar aluno');
        return;
      }
      setIsStudentModalOpen(false);
      setStudentForm({ name: '', email: '', phone: '', cpf: '' });
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
      setIsEnrollModalOpen(false);
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdeff] text-xs font-bold text-[#491ea9] mb-2 border border-[#fdd6ff]">
              <span className="material-symbols-outlined text-[16px]">person_search</span>
              Secretaria & Registros
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38]">
              Gestão de Alunos & Matrículas
            </h1>
            <p className="text-sm text-[#494553]">
              Cadastro de alunos, matrículas em turmas e controle de vagas acadêmicas.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              onClick={() => setIsStudentModalOpen(true)}
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

        {/* Students Table */}
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
                  <th className="py-3.5 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cac3d6]/20 text-sm">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#494553]">
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
                          <div className="flex flex-wrap gap-1">
                            {studentEnrollments.length === 0 ? (
                              <span className="text-xs text-[#7a7585] italic">Não enturmado</span>
                            ) : (
                              studentEnrollments.map((enr: any) => (
                                <Link
                                  key={enr._id}
                                  href={`/diario/${enr.classroomId?._id || enr.classroomId}`}
                                  className="px-2 py-0.5 rounded-full bg-[#e0e0ff] text-[#383d91] text-[10px] font-bold hover:bg-[#613dc1] hover:text-white transition-colors no-underline"
                                >
                                  {enr.classroomId?.code || 'Turma'}
                                </Link>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setEnrollForm({ ...enrollForm, studentId: s._id });
                              setIsEnrollModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/40 hover:bg-[#ffdeff] text-[#491ea9] text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            <span>Enturmar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Cadastrar Novo Aluno */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  Cadastrar Novo Aluno
                </h2>
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
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
                    Salvar Aluno
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
