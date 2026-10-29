'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function ProfessoresPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: 'Professor(a) de Idiomas',
    specialties: '',
    phone: '',
    password: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

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

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      title: 'Professor(a) de Idiomas',
      specialties: '',
      phone: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      email: t.email,
      title: t.title || 'Professor(a) de Idiomas',
      specialties: Array.isArray(t.specialties) ? t.specialties.join(', ') : '',
      phone: t.phone || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher._id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar docente');
        return;
      }

      showToast(editingTeacher ? 'Dados do professor atualizados com sucesso!' : 'Professor cadastrado com sucesso!');
      setIsModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o(a) docente "${name}"?`)) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao excluir professor');
        return;
      }
      showToast('Professor removido com sucesso!');
      loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

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
            onClick={handleOpenCreate}
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
                <span className="font-['JetBrains_Mono'] px-3 py-1 rounded-full bg-[#e0e0ff] text-[#383d91] text-xs font-bold">
                  {t.activeClassesCount || 0} {t.activeClassesCount === 1 ? 'Turma Ativa' : 'Turmas Ativas'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg text-[#5156ab] hover:bg-[#ffdeff] cursor-pointer"
                    title="Editar Professor"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(t._id, t.name)}
                    className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 cursor-pointer"
                    title="Excluir Professor"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Cadastrar / Editar Professor */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">
                  {editingTeacher ? 'Editar Professor' : 'Cadastrar Novo Professor'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  <label className="text-xs font-semibold text-[#2f0a38]">
                    Senha de Acesso {editingTeacher ? '(deixe em branco para manter)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingTeacher}
                    placeholder={editingTeacher ? 'Manter senha atual' : 'Senha temporária (ex: prof123)'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    {editingTeacher ? 'Salvar Alterações' : 'Salvar Professor'}
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
