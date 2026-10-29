'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function CursosPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [filterLang, setFilterLang] = useState('all');
  const [filterCefr, setFilterCefr] = useState('all');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    language: 'Inglês',
    cefrLevel: 'B2',
    workloadHours: 60,
    material: '',
    description: '',
  });

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      language: 'Inglês',
      cefrLevel: 'B2',
      workloadHours: 60,
      material: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      language: course.language,
      cefrLevel: course.cefrLevel,
      workloadHours: course.workloadHours,
      material: course.material || '',
      description: course.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar curso');
        return;
      }

      setIsModalOpen(false);
      loadCourses();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este curso?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao excluir');
        return;
      }
      loadCourses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = courses.filter((c) => {
    if (filterLang !== 'all' && c.language !== filterLang) return false;
    if (filterCefr !== 'all' && c.cefrLevel !== filterCefr) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdeff] text-xs font-bold text-[#491ea9] mb-2 border border-[#fdd6ff]">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              Matriz Curricular CEFR
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#2f0a38]">
              Catálogo de Cursos de Idiomas
            </h1>
            <p className="text-sm text-[#494553]">
              Gestão de programas acadêmicos, níveis europeus de proficiência e ementas.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn-chromatic px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Novo Curso</span>
          </button>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white border border-[#cac3d6]/30 shadow-xs">
          <span className="text-xs font-bold text-[#2f0a38] pl-2">Filtrar por:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none"
          >
            <option value="all">Todos os Idiomas</option>
            <option value="Inglês">Inglês</option>
            <option value="Espanhol">Espanhol</option>
            <option value="Francês">Francês</option>
            <option value="Alemão">Alemão</option>
            <option value="Italiano">Italiano</option>
          </select>

          <select
            value={filterCefr}
            onChange={(e) => setFilterCefr(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs text-[#2f0a38] outline-none"
          >
            <option value="all">Todos os Níveis CEFR</option>
            <option value="A1">A1 - Iniciante</option>
            <option value="A2">A2 - Básico</option>
            <option value="B1">B1 - Intermediário</option>
            <option value="B2">B2 - Independente</option>
            <option value="C1">C1 - Avançado</option>
            <option value="C2">C2 - Proficiente</option>
          </select>

          <span className="ml-auto text-xs text-[#494553] pr-2">
            Mostrando <strong>{filtered.length}</strong> cursos
          </span>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course._id}
              className="rounded-2xl bg-white p-6 shadow-sm border border-[#cac3d6]/30 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#88d0ed] to-[#613dc1]" />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold px-2.5 py-1 rounded-md bg-[#ffdeff] text-[#491ea9]">
                    {course.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#059669] text-xs font-bold">
                    CEFR {course.cefrLevel}
                  </span>
                </div>

                <div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#2f0a38]">{course.name}</h3>
                  <span className="text-xs font-semibold text-[#5156ab]">{course.language}</span>
                </div>

                <p className="text-xs text-[#494553] line-clamp-3 leading-relaxed">
                  {course.description || 'Sem descrição cadastrada.'}
                </p>

                <div className="p-3 rounded-xl bg-[#ffeffc] border border-[#ffdeff] flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#494553]">
                    <span>Carga Horária:</span>
                    <strong className="text-[#2f0a38]">{course.workloadHours} horas letivas</strong>
                  </div>
                  {course.material && (
                    <div className="text-[11px] text-[#494553] truncate">
                      <strong>Material:</strong> {course.material}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#cac3d6]/20 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(course)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#fff7fa] hover:bg-[#ffdeff] text-[#491ea9] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(course._id)}
                  className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                  title="Excluir Curso"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Creating / Editing */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#cac3d6]/40 p-6 sm:p-8 overflow-hidden relative">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#cac3d6]/20">
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#2f0a38]">
                  {editingCourse ? 'Editar Curso' : 'Cadastrar Novo Curso'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#494553] hover:text-[#2f0a38] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Código *</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingCourse}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="ENG-201"
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs font-bold uppercase outline-none focus:border-[#613dc1]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Nome do Curso *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Francês Aplicado a Negócios"
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Idioma</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    >
                      <option value="Inglês">Inglês</option>
                      <option value="Espanhol">Espanhol</option>
                      <option value="Francês">Francês</option>
                      <option value="Alemão">Alemão</option>
                      <option value="Italiano">Italiano</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#2f0a38]">Nível CEFR</label>
                    <select
                      value={formData.cefrLevel}
                      onChange={(e) => setFormData({ ...formData, cefrLevel: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
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
                    <label className="text-xs font-semibold text-[#2f0a38]">Carga (horas)</label>
                    <input
                      type="number"
                      min={10}
                      max={240}
                      value={formData.workloadHours}
                      onChange={(e) => setFormData({ ...formData, workloadHours: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Material Didático</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="Livros, apostilas, plataformas de áudio..."
                    className="w-full h-10 px-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#2f0a38]">Ementa Resumida</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva as competências linguísticas..."
                    className="w-full p-3 rounded-xl bg-[#fff7fa] border border-[#cac3d6]/50 text-xs outline-none focus:border-[#613dc1] resize-none"
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
                    {editingCourse ? 'Salvar Alterações' : 'Cadastrar Curso'}
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
