# PLAN.md - Plano de Execução do Projeto: ViralCraft Studio

## 1. Visão Geral do Planejamento
Este documento descreve o cronograma de desenvolvimento, marcos operacionais (milestones) e a lista de verificação (checklist) por fases para a criação da plataforma **ViralCraft Studio** — aplicativo de geração automatizada de carrosséis, cards estáticos, roteiros de vídeos verticais (Reels/TikTok/Kwai), **biblioteca modular de prompts** e **cronogramas semanais de conteúdo**.

---

## 2. Metodologia de Desenvolvimento
- **Abordagem:** Desenvolvimento ágil e iterativo (Sprints semanais).
- **Ferramentas de Suporte:** Assistente de código IA (Claude Code / Bolt / Lovable) para aceleração de componentes.
- **Foco Principal:** Entrega rápida de um MVP (Produto Mínimo Viável) testável em 5 a 6 semanas.

---

## 3. Cronograma e Fases de Implementação

### 📅 Fase 1: Fundação & Autenticação (Semana 1)
- [x] Configuração do repositório Git e estrutura inicial do projeto React/Next.js.
- [x] Instalação e configuração do Tailwind CSS e shadcn/ui.
- [x] Criação do projeto no Supabase (Configuração de URL, Anon Key).
- [x] Implementação das telas de Login, Cadastro e Recuperação de Senha via Supabase Auth.
- [x] Criação do painel lateral (Sidebar) e navegação principal do dashboard.

### 📅 Fase 2: Brand Kit & Configurações do Usuário (Semana 2)
- [x] Implementação da tabela `profiles` no Supabase.
- [x] Interface para gerenciamento de perfil e identidade visual:
  - Definir handle/username (ex: `@meuperfil`).
  - Seleção de paleta de cores da marca (cor primária, secundária, fundo).
  - Upload de logotipo (PNG com fundo transparente) no Supabase Storage.
- [x] Armazenamento persistente do Brand Kit no estado global da aplicação.

### 📅 Fase 3: Módulo de Cronograma Semanal Automático (Semana 3)
- [ ] Interface do Gerador de Cronograma (Grade semanal de 7 dias).
- [ ] Form: Seleção de Nicho, Objetivo da Semana (Ex: Vendas, Autoridade, Engajamento) e Frequência diária.
- [ ] Botão único "Gerar Cronograma da Semana":
  - Endpoint chamando API da OpenAI (`gpt-4o-mini`) para distribuir tipos de post (Reel, Carrossel, Card, Story).
- [ ] Visualização em formato Kanban ou Calendário Semanal (Segunda a Domingo).
- [ ] Botão de Ação Direta em cada card do cronograma: "Gerar Roteiro/Post deste item" (redireciona para o gerador preenchido).
- [ ] Funcionalidade de copiar cronograma ou exportar para CSV/PDF.

### 📅 Fase 4: Biblioteca de Prompts & Módulo de Roteiros (Semana 4)
- [x] Criação do diretório de templates de sistema `src/prompts/` com os arquivos:
  - [x] `carrossel-educacional.md` (7 a 10 slides, estrutura problema → mecanismo → ação)
  - [x] `carrossel-mitos.md` (6 a 8 slides, formato mito/verdade)
  - [x] `card-citacao.md` (1 card, frase de até 140 caracteres)
  - [x] `card-dado.md` (1 card, número em destaque + fonte obrigatória)
  - [x] `reels-educacional.md` (roteiro 30-60s, gancho de 3s obrigatório)
  - [x] `reels-mito.md` (roteiro 20-40s, abre negando uma crença comum)
- [x] Desenvolvimento da engrenagem de carregamento dinâmico e injeção de prompts no backend/edge function.
- [ ] Formulário do Gerador de Roteiros: Seleção de tipo de vídeo/prompt + entradas de usuário.
- [ ] Interface de exibição do Roteiro Gerado com opção "Copiar Roteiro" e "Salvar Roteiro".

### 📅 Fase 5: Módulo de Carrosséis, Cards Estáticos & Design System (Semana 5)
- [ ] Tela do Gerador de Carrossel/Cards com visualização dividida (Controles à esquerda, Live Preview à direita).
- [ ] Seletor de modelo de prompt (`carrossel-educacional`, `carrossel-mitos`, `card-citacao`, `card-dado`).
- [ ] Endpoint da API da OpenAI para geração do conteúdo em JSON validado pelo modelo selecionado.
- [ ] Construção dos componentes de layout React baseados no Design System (blobs orgânicos, molduras/réguas douradas, sparkles, caixa alta serifada, etc.).
- [ ] Suporte aos presets visuais (ex: Estilo Editorial / Teracota / Dark / Anis Style).
- [ ] Sincronização do Brand Kit (cores, logo e handle) nos slides do preview em tempo real.
- [ ] Permitir edição direta do texto de cada slide diretamente na tela.

### 📅 Fase 6: Motor de Exportação, Testes & Deploy (Semana 6)
- [ ] Integração da biblioteca `html-to-image` / `html2canvas` para renderização dos slides DOM em alta resolução (1080x1350px e 1080x1920px).
- [ ] Implementação do botão "Baixar Slide Atual" (PNG) e "Baixar Todos (.ZIP)".
- [ ] Testes de usabilidade e responsividade (Desktop e Mobile).
- [ ] Configuração do ambiente de Produção na Vercel / Netlify com domínio e SSL.
- [ ] Lançamento oficial do MVP.

---

## 4. Gestão de Riscos & Mitigações
| Risco | Impacto | Ação de Mitigação |
| :--- | :--- | :--- |
| Instabilidade ou atraso no retorno da API da IA | Alto | Implementar estados de carregamento (skeletons/loaders) e retry automático. |
| Texto estourando o limite do layout no card/slide | Médio | Prompts com limite estrito de caracteres (ex: 140 chars) e ajuste dinâmico de fonte (`clamp`). |
| Custo elevado da API de IA | Médio | Utilizar modelo `gpt-4o-mini` para cronogramas e carrosséis simples. |
| Quebra visual em exportações SVG/Canvas | Médio | Validar carregamento prévio de fontes web (Google Fonts) antes do disparo de renderização em PNG. |

---

## 5. Checklist de Entrega do MVP
- [x] Sistema de Login/Cadastro funcionando.
- [x] Brand Kit (handle, cores e logo) com persistência no Supabase; Design System visual (blobs, réguas, tipografia mista) segue pendente na Fase 5.
- [ ] Gerador de Cronograma Semanal em 1 clique (Segunda a Domingo).
- [x] Biblioteca de Prompts em arquivos `.md` integrados ao backend.
- [ ] Gerador de Roteiros e Carrosséis operando com base nos templates da biblioteca.
- [ ] Exportação em PNG e arquivo .ZIP operando com sucesso.
