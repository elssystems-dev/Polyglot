import { connectToDatabase } from './mongodb';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Classroom } from '../models/Classroom';
import { Student } from '../models/Student';
import { Enrollment, calculateAcademicStatus } from '../models/Enrollment';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { hashPassword } from './auth';

export async function seedDatabase(forceReset: boolean = false) {
  await connectToDatabase();

  const userCount = await User.countDocuments();
  if (userCount > 0 && !forceReset) {
    return { message: 'Database already has records. Use forceReset to reseed.' };
  }

  if (forceReset) {
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Classroom.deleteMany({}),
      Student.deleteMany({}),
      Enrollment.deleteMany({}),
      AttendanceRecord.deleteMany({}),
    ]);
    console.log('Database collections cleared for fresh seed.');
  }

  // 1. Create Users (Coordinator & Teachers)
  const passwordHashAdmin = hashPassword('admin123');
  const passwordHashProf = hashPassword('prof123');

  const coord = await User.create({
    name: 'Prof. Roberto Albuquerque',
    email: 'coordenacao@polyglot.edu.br',
    password: passwordHashAdmin,
    role: 'COORDINATOR',
    title: 'Coordenador Pedagógico Geral',
    specialties: ['Gestão Escolar', 'Linguística Aplicada', 'Políticas CEFR'],
    phone: '(19) 99823-1100',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE',
  });

  const teacherMaria = await User.create({
    name: 'Profª Maria Silva',
    email: 'maria.silva@polyglot.edu.br',
    password: passwordHashProf,
    role: 'TEACHER',
    title: 'Profª Doutora em Linguística',
    specialties: ['Inglês Avançado C2', 'Preparatórios Cambridge', 'Redação Acadêmica'],
    phone: '(19) 99877-2233',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE',
  });

  const teacherCarlos = await User.create({
    name: 'Prof. Carlos Eduardo',
    email: 'carlos.eduardo@polyglot.edu.br',
    password: passwordHashProf,
    role: 'TEACHER',
    title: 'Mestre em Estudos Ingleses',
    specialties: ['Inglês C2', 'Fonética', 'Business English'],
    phone: '(19) 99122-3344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE',
  });

  const teacherMariana = await User.create({
    name: 'Profª Mariana Ortega',
    email: 'mariana.ortega@polyglot.edu.br',
    password: passwordHashProf,
    role: 'TEACHER',
    title: 'Especialista em Línguas Ibéricas',
    specialties: ['Espanhol C2', 'Literatura Hispânica', 'DELE'],
    phone: '(19) 98833-4455',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE',
  });

  const teacherJean = await User.create({
    name: 'Prof. Jean-Luc Moreau',
    email: 'jean.luc@polyglot.edu.br',
    password: passwordHashProf,
    role: 'TEACHER',
    title: 'Especialista em Francês Língua Estrangeira',
    specialties: ['Francês C2', 'Negócios Internacionais', 'DELF/DALF'],
    phone: '(19) 97744-5566',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE',
  });

  const teacherKatja = await User.create({
    name: 'Profª Katja Schmidt',
    email: 'katja.schmidt@polyglot.edu.br',
    password: passwordHashProf,
    role: 'TEACHER',
    title: 'Licenciada em Letras Germânicas',
    specialties: ['Alemão C2', 'Goethe-Zertifikat', 'Conversação'],
    phone: '(19) 96655-6677',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE',
  });

  // 2. Create Courses
  const courseIngAdv = await Course.create({
    code: 'ING-ADV-B2',
    name: 'Inglês Avançado B2',
    language: 'Inglês',
    cefrLevel: 'B2',
    workloadHours: 80,
    material: 'Cambridge English Empower B2 Upper Intermediate & Cambridge Academic Papers',
    description: 'Foco no aprimoramento da fluência comunicativa, redação ensaística e argumentação crítica para contextos acadêmicos e profissionais.',
    status: 'ACTIVE',
  });

  const courseIngInst = await Course.create({
    code: 'ING-INST-A1',
    name: 'Inglês Instrumental A1',
    language: 'Inglês',
    cefrLevel: 'A1',
    workloadHours: 60,
    material: 'Oxford English File Beginner (4th Edition)',
    description: 'Bases fundamentais para conversação diária, leitura de termos técnicos e estruturas gramaticais introdutórias.',
    status: 'ACTIVE',
  });

  const courseEspConv = await Course.create({
    code: 'ESP-CONV-B1',
    name: 'Espanhol Conversação B1',
    language: 'Espanhol',
    cefrLevel: 'B1',
    workloadHours: 45,
    material: 'Aula Internacional Plus 3 (Difusión)',
    description: 'Imersão conversacional para fluência em debates, viagens, negociações e interações socioculturais.',
    status: 'ACTIVE',
  });

  const courseEspBas = await Course.create({
    code: 'ESP-BAS-A2',
    name: 'Espanhol Básico A2',
    language: 'Espanhol',
    cefrLevel: 'A2',
    workloadHours: 60,
    material: 'Gramática de Uso del Español A1-A2 (SM-ELE)',
    description: 'Estruturação da fala e audição com foco em situações cotidianas e vocabulário latino-americano e peninsular.',
    status: 'ACTIVE',
  });

  const courseFraProf = await Course.create({
    code: 'FRA-PROF-C1',
    name: 'Francês Proficiência C1',
    language: 'Francês',
    cefrLevel: 'C1',
    workloadHours: 80,
    material: 'Alter Ego+ 4 / DALF C1 100% Réussite (Didier)',
    description: 'Nível avançado com ênfase em diplomacia, redação de teses, negócios bilaterais e oratória culta.',
    status: 'ACTIVE',
  });

  const courseFraBas = await Course.create({
    code: 'FRA-BAS-A1',
    name: 'Francês Básico A1',
    language: 'Francês',
    cefrLevel: 'A1',
    workloadHours: 60,
    material: 'Édito A1 (Didier)',
    description: 'Primeiros passos na língua francesa: fonética, cumprimentos, pedidos, noções de turismo e cultura francófona.',
    status: 'ACTIVE',
  });

  const courseAleInic = await Course.create({
    code: 'ALE-INIC-A1',
    name: 'Alemão Iniciante A1',
    language: 'Alemão',
    cefrLevel: 'A1',
    workloadHours: 60,
    material: 'Netzwerk neu A1 (Klett)',
    description: 'Introdução estruturada à língua alemã com exercícios interativos e ênfase na prática oral rápida.',
    status: 'ACTIVE',
  });

  // 3. Create Classrooms
  const classEngB2 = await Classroom.create({
    code: 'ENG-2025-01',
    name: 'Turma Inglês Avançado B2 • Noturno',
    courseId: courseIngAdv._id,
    teacherId: teacherMaria._id,
    capacity: 18,
    semester: '2025.1',
    scheduleDays: ['SEG', 'QUA'],
    startTime: '19:00',
    endTime: '20:30',
    room: 'Pavilhão B • Sala 04',
    startDate: '2025-03-03',
    endDate: '2025-06-30',
    status: 'IN_PROGRESS',
  });

  const classFraA1 = await Classroom.create({
    code: 'FRA-2025-01',
    name: 'Turma Francês Básico A1 • Tarde',
    courseId: courseFraBas._id,
    teacherId: teacherJean._id,
    capacity: 15,
    semester: '2025.1',
    scheduleDays: ['TER', 'QUI'],
    startTime: '18:30',
    endTime: '20:00',
    room: 'Pavilhão A • Sala 02',
    startDate: '2025-03-04',
    endDate: '2025-06-28',
    status: 'IN_PROGRESS',
  });

  const classEspB1 = await Classroom.create({
    code: 'ESP-2025-01',
    name: 'Turma Espanhol Conversação B1 • Vespertino',
    courseId: courseEspConv._id,
    teacherId: teacherMariana._id,
    capacity: 15,
    semester: '2025.1',
    scheduleDays: ['SEX'],
    startTime: '14:00',
    endTime: '17:00',
    room: 'Laboratório Multimídia 01',
    startDate: '2025-03-07',
    endDate: '2025-06-27',
    status: 'IN_PROGRESS',
  });

  const classAleA1 = await Classroom.create({
    code: 'ALE-2025-01',
    name: 'Turma Alemão Iniciante A1 • Noturno',
    courseId: courseAleInic._id,
    teacherId: teacherKatja._id,
    capacity: 16,
    semester: '2025.1',
    scheduleDays: ['SEX'],
    startTime: '14:00',
    endTime: '17:30',
    room: 'Pavilhão C • Sala 208',
    startDate: '2025-03-07',
    endDate: '2025-06-27',
    status: 'IN_PROGRESS',
  });

  const classEngCarlos = await Classroom.create({
    code: 'ENG-2025-02',
    name: 'Turma Inglês Instrumental A1 • Manhã',
    courseId: courseIngInst._id,
    teacherId: teacherCarlos._id,
    capacity: 20,
    semester: '2025.1',
    scheduleDays: ['TER', 'QUI'],
    startTime: '08:30',
    endTime: '10:00',
    room: 'Pavilhão B • Sala 01',
    startDate: '2025-03-04',
    endDate: '2025-06-28',
    status: 'IN_PROGRESS',
  });

  // Also assign a secondary classroom to Profª Maria to match the Stitch screen (Maria teaching 2 active classes)
  const classEngB2Extra = await Classroom.create({
    code: 'ENG-2025-03',
    name: 'Turma Inglês Preparatório IELTS • Sábados',
    courseId: courseIngAdv._id,
    teacherId: teacherMaria._id,
    capacity: 15,
    semester: '2025.1',
    scheduleDays: ['SÁB'],
    startTime: '08:30',
    endTime: '11:45',
    room: 'Auditório Executivo 02',
    startDate: '2025-03-08',
    endDate: '2025-06-28',
    status: 'IN_PROGRESS',
  });

  // 4. Create Students
  const studentsData = [
    { registration: '2025-ENG-089', name: 'Beatriz Ramos', email: 'beatriz.ramos@aluno.polyglot.edu.br', phone: '(19) 99111-2233', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-092', name: 'Lucas Farias', email: 'lucas.farias@aluno.polyglot.edu.br', phone: '(19) 99222-3344', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-104', name: 'Camila Rocha', email: 'camila.rocha@aluno.polyglot.edu.br', phone: '(19) 99333-4455', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-118', name: 'Gabriel Monteiro', email: 'gabriel.monteiro@aluno.polyglot.edu.br', phone: '(19) 99444-5566', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-125', name: 'Mariana Silveira', email: 'mariana.silveira@aluno.polyglot.edu.br', phone: '(19) 99555-6677', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-133', name: 'Thiago Mendes', email: 'thiago.mendes@aluno.polyglot.edu.br', phone: '(19) 99666-7788', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-141', name: 'Juliana Costa', email: 'juliana.costa@aluno.polyglot.edu.br', phone: '(19) 99777-8899', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-150', name: 'Rodrigo Lima', email: 'rodrigo.lima@aluno.polyglot.edu.br', phone: '(19) 99888-9900', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-162', name: 'Larissa Pires', email: 'larissa.pires@aluno.polyglot.edu.br', phone: '(19) 99999-0011', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
    { registration: '2025-ENG-177', name: 'Enzo Fernandes', email: 'enzo.fernandes@aluno.polyglot.edu.br', phone: '(19) 98888-1122', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200' },
  ];

  const createdStudents = await Student.insertMany(studentsData);

  // 5. Enroll Students into classEngB2 with sample grades & absences to demonstrate automatic calculation
  const sampleEnrollments = [
    { studentIndex: 0, grades: { n1: 9.5, n2: 9.0, n3: 10.0 }, absences: 1 },
    { studentIndex: 1, grades: { n1: 8.5, n2: 8.0, n3: 8.5 }, absences: 2 },
    { studentIndex: 2, grades: { n1: 5.5, n2: 6.0, n3: 5.0 }, absences: 6 },
    { studentIndex: 3, grades: { n1: 7.0, n2: 7.5, n3: 8.0 }, absences: 3 },
    { studentIndex: 4, grades: { n1: 10.0, n2: 9.5, n3: 10.0 }, absences: 0 },
    { studentIndex: 5, grades: { n1: 4.0, n2: 4.5, n3: 5.0 }, absences: 8 },
    { studentIndex: 6, grades: { n1: 8.0, n2: 8.5, n3: null }, absences: 2 },
    { studentIndex: 7, grades: { n1: 7.5, n2: 7.0, n3: null }, absences: 4 },
    { studentIndex: 8, grades: { n1: 9.0, n2: 9.0, n3: 9.5 }, absences: 1 },
    { studentIndex: 9, grades: { n1: 7.0, n2: 8.0, n3: 7.5 }, absences: 12 }, // Reprovado por falta (>25% de 40 aulas)
  ];

  for (const item of sampleEnrollments) {
    const student = createdStudents[item.studentIndex];
    const calc = calculateAcademicStatus(item.grades, item.absences, 40);
    await Enrollment.create({
      studentId: student._id,
      classroomId: classEngB2._id,
      grades: item.grades,
      absences: item.absences,
      totalClasses: 40,
      finalAverage: calc.finalAverage,
      attendanceRate: calc.attendanceRate,
      status: calc.status,
      notes: 'Matrícula regular confirmada no semestre 2025.1',
    });
  }

  // Also enroll a few students in other classes
  for (let i = 0; i < 5; i++) {
    const student = createdStudents[i];
    const calc = calculateAcademicStatus({ n1: 8.0, n2: null, n3: null }, 1, 40);
    await Enrollment.create({
      studentId: student._id,
      classroomId: classFraA1._id,
      grades: { n1: 8.0, n2: null, n3: null },
      absences: 1,
      totalClasses: 40,
      finalAverage: calc.finalAverage,
      attendanceRate: calc.attendanceRate,
      status: calc.status,
    });
  }

  for (let i = 3; i < 8; i++) {
    const student = createdStudents[i];
    const calc = calculateAcademicStatus({ n1: 8.5, n2: 9.0, n3: null }, 0, 40);
    await Enrollment.create({
      studentId: student._id,
      classroomId: classEspB1._id,
      grades: { n1: 8.5, n2: 9.0, n3: null },
      absences: 0,
      totalClasses: 40,
      finalAverage: calc.finalAverage,
      attendanceRate: calc.attendanceRate,
      status: calc.status,
    });
  }

  // 6. Attendance Record for today's session in ENG-2025-01
  const todayStr = new Date().toISOString().split('T')[0];
  await AttendanceRecord.create({
    classroomId: classEngB2._id,
    date: todayStr,
    sessionNumber: 24,
    topic: 'Unidade 6 — Advanced Inversion & Rhetorical Emphatics',
    registeredBy: teacherMaria._id,
    records: [
      { studentId: createdStudents[0]._id, status: 'PRESENT', arrivalTime: '18:55' },
      { studentId: createdStudents[1]._id, status: 'PRESENT', arrivalTime: '19:02' },
      { studentId: createdStudents[2]._id, status: 'ABSENT', arrivalTime: '' },
      { studentId: createdStudents[3]._id, status: 'JUSTIFIED', arrivalTime: '', justification: 'Atestado Médico Protocolo 883' },
      { studentId: createdStudents[4]._id, status: 'PRESENT', arrivalTime: '18:50' },
      { studentId: createdStudents[5]._id, status: 'PRESENT', arrivalTime: '19:00' },
      { studentId: createdStudents[6]._id, status: 'PRESENT', arrivalTime: '18:58' },
      { studentId: createdStudents[7]._id, status: 'PRESENT', arrivalTime: '19:05' },
      { studentId: createdStudents[8]._id, status: 'PRESENT', arrivalTime: '18:52' },
      { studentId: createdStudents[9]._id, status: 'ABSENT', arrivalTime: '' },
    ],
  });

  return {
    success: true,
    message: 'Base de dados Polyglot semeada com sucesso!',
    summary: {
      users: 6,
      courses: 7,
      classrooms: 6,
      students: 10,
      enrollments: sampleEnrollments.length + 10,
    },
    credentials: {
      coordinator: { email: 'coordenacao@polyglot.edu.br', password: 'admin123' },
      teachers: [
        { name: 'Profª Maria Silva', email: 'maria.silva@polyglot.edu.br', password: 'prof123' },
        { name: 'Prof. Carlos Eduardo', email: 'carlos.eduardo@polyglot.edu.br', password: 'prof123' },
        { name: 'Profª Mariana Ortega', email: 'mariana.ortega@polyglot.edu.br', password: 'prof123' },
      ],
    },
  };
}

if (typeof require !== 'undefined' && require.main === module) {
  seedDatabase(true)
    .then((res) => {
      console.log('Seed concluído com sucesso!');
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Falha ao executar seed:', err);
      process.exit(1);
    });
}
