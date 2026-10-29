'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function ProfessoresPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: 'Professor(a) de Idiomas',
    specialties: '',
    phone: '',
  });

  const loadTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao cadastrar docente');
        return;
      }

      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        title: 'Professor(a) de Idiomas',
        specialties: '',
        phone: '',
      });
      loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  return (
    <AppShell allowedRoles={['COORDINATOR']}>
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdeff] text-xs font-bold text-[#491ea9] mb-2 border border-[#fdd6ff]">
              <span className="material-symbols-outlined text-[16px]">school</span>
              Corpo Docente & Especialistas
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38]">
              Quadro de Professores
            </h1>
            <p className="text-sm text-[#494553]">
              Gestão dos docentes homologados, especialidades linguísticas e turmas sob responsabilidade.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-chromatic px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Novo Professor</span>
          </button>
        </div>

        {/* Teachers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div
              key={t._id}
              className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9ea3fe] via-[#613dc1] to-[#00475a]" />

              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#613dc1] text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm flex-shrink-0">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{t.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-base text-[#2f0a38] truncate">{t.name}</h3>
                    <span className="text-xs text-[#5156ab] truncate">{t.email}</span>
                    <span className="text-[11px] text-[#494553] font-medium mt-0.5">{t.title}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(t.specialties || []).map((spec: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#ffdeff] text-[#491ea9] text-xs font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {t.phone && (
                  <div className="mt-3 text-xs text-[#494553] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#5156ab]">call</span>
                    <span>{t.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#cac3d6]/20 flex items-center justify-between">
                <span className="text-xs text-[#494553]">Alocações Letivas:</span>
                <span className="font-['JetBrains_Mono'] px-3 py-1 rounded-full bg-[#e0e0ff] text-[#383d91] text-xs font-bold">
                  {t.activeClassesCount || 0} {t.activeClassesCount === 1 ? 'Turma Ativa' : 'Turmas Ativas'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Cadastrar Novo Professor */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  Cadastrar Novo Professor
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateTeacher} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Profª Dra. Helena Brandt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">E-mail Institucional *</label>
                  <input
                    type="email"
                    required
                    placeholder="helena.brandt@polyglot.edu.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Titulação Acadêmica</label>
                  <input
                    type="text"
                    placeholder="Ex: Doutora em Letras, Mestre em Linguística"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Especialidades (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: Alemão C2, Goethe-Zertifikat, Fonética"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Telefone de Contato</label>
                  <input
                    type="text"
                    placeholder="(19) 99888-7766"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#cac3d6]/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#494553] hover:bg-[#fff7fa] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#613dc1] text-white text-xs font-bold shadow-sm hover:brightness-105 cursor-pointer"
                  >
                    Salvar Professor
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
