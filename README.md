# 🌐 Polyglot Academic Portal — Sistema de Gestão Acadêmica

> **Situação de Aprendizagem: Desenvolvimento de Soluções Corporativas Full-Stack**  
> **Consultoria de Tecnologia:** DevSolutions  
> **Briefing 10:** Pequeno Sistema de Gestão Acadêmica  
> **Cliente Fictício:** Curso de Idiomas Polyglot  
> **Equipe de Desenvolvimento:** Bárbara e Eduardo  

---

## 📖 1. Visão Geral do Projeto

O **Polyglot Academic Portal** é uma plataforma corporativa Full-Stack desenvolvida sob medida para o **Curso de Idiomas Polyglot**. 

### 📌 O Problema de Negócio
Anteriormente, o controle de notas, presenças e registros pedagógicos do curso era realizado exclusivamente em **diários de classe físicos em papel** pelos professores. Essa prática descentralizada causava atrasos críticos na consolidação das informações pela secretaria, risco de extravio de notas, inconsistências de cálculo manual de médias e ausência de uma visão unificada para a coordenação pedagógica.

### 💡 A Solução Proposta
Uma plataforma centralizada, segura e responsiva baseada em **Next.js (App Router)** e **MongoDB/Mongoose**, com controle de acesso baseado em papéis (**RBAC**) via **JWT e Bcrypt**, proporcionando:
1. **Substituição definitiva dos diários físicos** por um diário digital de presença e frequências em tempo real.
2. **Lançamento rápido de notas e faltas** pelos professores para as suas respectivas turmas.
3. **Pauta oficial consolidada** acessível instantaneamente pela secretaria e coordenação com suporte para exportação e impressão de atas oficiais.
4. **Cálculo automático de médias e definição da situação acadêmica** do aluno com base nos critérios institucionais.

---

## 🎯 2. Público-Alvo e Matriz de Permissões (RBAC)

O sistema conta com dois perfis de acesso estritamente segregados:

| Perfil | Escopo de Acesso | Funcionalidades Principais |
| :--- | :--- | :--- |
| **Coordenador (Gestor)** | Visão Institucional Completa | • **CRUD de Cursos** (Matriz curricular e níveis CEFR)<br>• **CRUD de Turmas** (associação de curso, professor, horários e limites de vagas)<br>• **CRUD de Professores** (titulações e especialidades)<br>• **CRUD de Alunos** (geração automática de matrícula institucional)<br>• **Matrícula de alunos em turmas** com controle de capacidade máxima<br>• **Pauta da Turma** centralizada com todas as notas e faltas |
| **Professor (Docente)** | Painel do Professor | • Visualização das turmas sob sua responsabilidade<br>• **Lançamento de Notas (N1, N2 e N3)**<br>• **Lançamento de Faltas**<br>• Registro de chamada diária por sessão (presenças, ausências e justificativas)<br>• Cálculo em tempo real de médias e assiduidade |

---

## ✅ 3. Requisitos Atendidos (MVP & Diferencial)

### 3.1. Requisitos Essenciais (MVP)
- [x] **CRUD para Cursos**: Cadastro, listagem, edição e exclusão de cursos com parâmetros de idioma (Inglês, Espanhol, Francês, Alemão, Italiano), nível de proficiência europeu (**CEFR A1, A2, B1, B2, C1, C2**), carga horária e ementa.
- [x] **CRUD para Turmas**: Cadastro, listagem, edição e exclusão de turmas associando obrigatoriamente um **Curso** e um **Professor Titular**, com definição de semestre letivo, dias da semana, horários, sala e limite de vagas.
- [x] **CRUD para Alunos**: Cadastro, busca em tempo real, edição e exclusão de estudantes com geração padronizada de matrícula institucional (ex: `2025-ALU-001`), CPF, e-mail e telefone.
- [x] **Funcionalidade de Matrícula**: Mecanismo para enturmar alunos em turmas letivas com validação de capacidade máxima e bloqueio automático de matrículas duplicadas.
- [x] **Lançamento de Notas e Faltas pelo Professor**: O professor autenticado acessa diretamente suas turmas no Diário de Classe para lançamento de N1, N2, N3 e número de faltas.
- [x] **Pauta da Turma para o Coordenador**: Página dedicada (`/pauta`) onde a coordenação pode filtrar qualquer turma letiva e inspecionar a ata completa com todas as notas, faltas, frequências percentuais e status final de aprovação, pronta para impressão.

### 3.2. ⭐ Diferencial Sugerido (Bônus 100% Implementado)
- [x] **Cálculo Automático da Média Final e Situação Acadêmica**:
  A média final ponderada/aritmética é calculada de forma reativa no frontend e persistida no backend pelo hook `pre('save')` do Mongoose:
  $$\text{Média Final} = \frac{\sum \text{Notas Válidas}}{N}$$
  $$\text{Frequência} = \frac{40 - \text{Faltas}}{40} \times 100\%$$

  **Regras de Negócio Institucionais da Polyglot:**
  - **Aprovado:** Média Final $\ge 7.0$ e Frequência $\ge 75\%$
  - **Recuperação:** Média Final entre $5.0$ e $6.9$ e Frequência $\ge 75\%$
  - **Reprovado por Nota:** Média Final $< 5.0$ e Frequência $\ge 75\%$
  - **Reprovado por Falta:** Frequência $< 75\%$ (mais de 10 faltas em 40 aulas letivas)
  - **Cursando:** Semestre em andamento aguardando o lançamento das avaliações

---

## 🛠️ 4. Tecnologias Utilizadas

- **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions e Route Handlers)
- **Linguagem:** [TypeScript 5](https://www.typescriptlang.org/) (Tipagem estrita e segura)
- **Biblioteca de Interface:** [React 19](https://react.dev/)
- **Banco de Dados:** [MongoDB](https://www.mongodb.com/) com modelagem [Mongoose](https://mongoosejs.com/)
- **Autenticação & Segurança:** [JSON Web Token (jsonwebtoken)](https://jwt.io/) e [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Estilização & Design:** Vanilla CSS, SCSS modular (`src/styles/`) e Tailwind CSS v4 com paleta cromática exclusiva (*Deep Violet, Amethyst, Electric Cyan e Soft Rose*)
- **Ícones & Tipografia:** Google Material Symbols, Space Grotesk e JetBrains Mono

---

## 🚀 5. Como Executar o Projeto Localmente

### 5.1. Pré-requisitos
- **Node.js** v20.x ou superior
- **npm** (ou yarn / pnpm)
- Instância do **MongoDB** em execução localmente (`mongodb://127.0.0.1:27017/polyglot`) ou string de conexão do [MongoDB Atlas](https://www.mongodb.com/atlas).

### 5.2. Instalação Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/Polyglot.git
   cd Polyglot
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie ou edite o arquivo `.env.local` na raiz do projeto (um modelo está disponível em `.env.example`):
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/polyglot
   JWT_SECRET=polyglot_academic_jwt_secret_token_devsolutions_2025
   NODE_ENV=development
   ```

4. **Popule a Base de Dados (Seed Automático):**
   Execute o script de semeadura com dados realistas (cursos de Inglês, Francês, Espanhol e Alemão, professores, turmas, alunos e notas de exemplo):
   ```bash
   npm run seed
   ```
   *(Alternativamente, faça uma requisição POST ou acesse `http://localhost:3000/api/seed?force=true` com o servidor ativo).*

5. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse no Navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

---

## 🔑 6. Credenciais de Teste para Avaliação

O script de seed pré-cadastra usuários para teste imediato com as seguintes credenciais:

### 👤 Perfil Coordenador Geral (Acesso Total)
- **E-mail:** `coordenacao@polyglot.edu.br`
- **Senha:** `admin123`
- *Páginas disponíveis:* `/dashboard`, `/cursos`, `/turmas`, `/professores`, `/alunos`, `/pauta`, `/diario`.

### 👨‍🏫 Perfil Professor (Corpo Docente)
- **Profª Maria Silva** (Inglês Avançado B2):
  - **E-mail:** `maria.silva@polyglot.edu.br`
  - **Senha:** `prof123`
- **Prof. Carlos Eduardo** (Inglês Instrumental A1):
  - **E-mail:** `carlos.eduardo@polyglot.edu.br`
  - **Senha:** `prof123`
- **Profª Mariana Ortega** (Espanhol B1):
  - **E-mail:** `mariana.ortega@polyglot.edu.br`
  - **Senha:** `prof123`
- **Prof. Jean-Luc Moreau** (Francês Básico A1):
  - **E-mail:** `jean.luc@polyglot.edu.br`
  - **Senha:** `prof123`

---

## 📁 7. Estrutura de Pastas e Rotas

```
Polyglot/
├── public/                 # Favicon, mascote e assets visuais
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing Page do portal com atalhos de acesso
│   │   ├── login/          # Tela de login com chaveamento rápido de papéis
│   │   ├── dashboard/      # Visão analítica para Coordenação e Docência
│   │   ├── cursos/         # CRUD de Cursos e Matriz Curricular CEFR
│   │   ├── turmas/         # CRUD de Turmas e Oferta Letiva
│   │   ├── professores/    # Gestão de Professores e Especialidades
│   │   ├── alunos/         # CRUD de Alunos e Matrículas
│   │   ├── pauta/          # Página Oficial da Pauta de Notas & Faltas
│   │   ├── diario/         # Diário de Classe Digital do Professor
│   │   └── api/            # API RESTful Segura:
│   │       ├── auth/       # Login, Logout, Verificação (/me)
│   │       ├── courses/    # Endpoints de Cursos (GET, POST, PUT, DELETE)
│   │       ├── classes/    # Endpoints de Turmas (GET, POST, PUT, DELETE)
│   │       ├── teachers/   # Endpoints de Docentes (GET, POST, PUT, DELETE)
│   │       ├── students/   # Endpoints de Alunos (GET, POST, PUT, DELETE)
│   │       ├── enrollments/# Matrícula, Lançamento de Notas/Faltas e Médias
│   │       ├── attendance/ # Registro diário de presenças e justificativas
│   │       ├── stats/      # Agregações estatísticas do semestre
│   │       └── seed/       # Endpoint de semeadura do banco de dados
│   ├── components/         # Componentes modulares (Sidebar, Header, AppShell, ClassDiaryView)
│   ├── context/            # AuthContext (Estado global do usuário e token)
│   ├── lib/                # Conexão MongoDB, Utilitários JWT/Bcrypt e Seed
│   ├── models/             # Schemas Mongoose (User, Student, Course, Classroom, Enrollment, AttendanceRecord)
│   └── styles/             # SCSS mixins, variáveis e estilos globais
├── package.json
└── tsconfig.json
```

---

## 🧪 8. Validação e Qualidade de Código

Para verificar a integridade dos tipos e realizar o build de produção:
```bash
# Verificação estática de tipos TypeScript
npx tsc --noEmit

# Compilação e empacotamento otimizado de produção
npm run build
```

---

*Desenvolvido com excelência por **Bárbara e Eduardo** — Consultoria DevSolutions © 2025/2026.*
