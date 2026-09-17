# PRD.md - Documento de Requisitos do Produto (Product Requirement Document)

## 1. Visão Geral do Produto
- **Nome do Produto:** ViralCraft Studio
- **Descrição:** Aplicação web SaaS para criadores de conteúdo, agências e gestores de redes sociais. O app automatiza o planejamento e a produção de conteúdo através de um gerador de cronograma semanal, uma biblioteca modular de prompts (.md) de alta conversão, criador de roteiros para vídeos verticais (Reels, TikTok, Kwai) e editor visual de carrosséis e cards estáticos com exportação em imagem pronta para publicar.

---

## 2. Problema e Oportunidade
- **Problema:** Criadores e profissionais de marketing gastam em média de 2 a 4 horas por dia para decidir o que postar durante a semana, estruturar roteiros dinâmicos e formatar posts carrossel em softwares complexos de design.
- **Oportunidade:** Simplificar e acelerar todo o planejamento e criação para menos de 5 minutos, unindo inteligência artificial orientada por prompts modulares em Markdown com templates visuais dinâmicos em código.

---

## 3. Personas e Tipos de Usuários
1. **Criador de Conteúdo Solo / Infoprodutor:**
   - Necessita de consistência semanal, planejamento claro e roteiros práticos de gravar.
   - Valoriza a rapidez, clareza e simplicidade.
2. **Gestor de Mídias Sociais / Agência:**
   - Gerencia múltiplos clientes.
   - Necessita gerar planos semanais de postagens rápidos e aplicar identidades visuais distintas (Brand Kit) para cada cliente.

---

## 4. Arquitetura do Sistema e Stack Tecnológica
- **Frontend Framework:** React / Next.js (TypeScript)
- **Estilização e Componentes:** Tailwind CSS + shadcn/ui
- **Autenticação e Banco de Dados:** Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **Inteligência Artificial:** OpenAI API (`gpt-4o` / `gpt-4o-mini`) com Structured Outputs (JSON Schema)
- **Biblioteca de Prompts:** Arquivos Markdown em `src/prompts/` carregados dinamicamente
- **Processamento Visual:** `html-to-image` / `html2canvas` + `JSZip`
- **Hospedagem:** Vercel

---

## 5. Requisitos Funcionais (Especificações do Sistema)

### RF-01: Autenticação e Perfis de Usuário
- Cadastro e login via E-mail/Senha e Google OAuth via Supabase Auth.
- Gerenciamento de sessão e proteção de rotas privadas no frontend.

### RF-02: Gestão de Brand Kit (Identidade Visual)
- O usuário pode configurar:
  - Handle/Usuário da rede social (ex: `@meunegocio`).
  - Cor primária (Hexadecimal, ex: `#FF5733`).
  - Cor secundária (Hexadecimal).
  - Cor de fundo padrão dos slides.
  - Upload de logotipo transparente (PNG/SVG).

### RF-03: Módulo de Cronograma Semanal Automático (1-Click Content Planner)
- **Entradas do Usuário:**
  - Tema central / Nicho do perfil.
  - Objetivo principal da semana (Ex: Ganhar Seguidores, Vender Produto, Gerar Autoridade, Engajamento).
- **Saída Esperada da IA (JSON - Matriz Semanal de 7 Dias):**
  - Para cada dia (Segunda a Domingo):
    - `day`: Dia da semana.
    - `format`: Formato sugerido ('Reel', 'Carrossel', 'Card Estático', 'Stories').
    - `topic_title`: Título/Tema do conteúdo.
    - `goal`: Objetivo específico do post.
    - `angle`: Gancho/Ângulo da abordagem.
- **Integração Nível App:** Botão "Criar Conteúdo" ao lado de cada item do cronograma que abre direto o gerador de Roteiro ou Carrossel pré-preenchido com aquele tema.
- **Exportação:** Copiar cronograma em texto formatado ou exportar para CSV.

### RF-04: Módulo de Roteiros para Vídeos Verticais
- **Entradas do Usuário:**
  - Modelo de Roteiro escolhido (ex: `reels-educacional`, `reels-mito`).
  - Tema central ou palavra-chave.
  - Nicho de mercado.
  - Tom de voz e Duração estimada (15s, 30s, 60s).
- **Saída Esperada da IA (JSON):**
  - `title`: Título do roteiro.
  - `hook`: Gancho inicial (0-3s) obrigatório.
  - `body`: Array de etapas do vídeo com falas e indicações de corte B-roll.
  - `cta`: Chamada para ação final.
- **Funcionalidades da UI:** Botão de copiar texto formatado e salvar no histórico.

### RF-05: Módulo de Carrosséis & Cards Estáticos
- **Entradas do Usuário:**
  - Modelo visual/conteúdo escolhido (`carrossel-educacional`, `carrossel-mitos`, `card-citacao`, `card-dado`).
  - Tema do conteúdo.
- **Saída Esperada da IA (JSON):**
  - Array de slides contendo: `slide_number`, `headline`, `body_text`, `type` ('cover', 'content', 'cta').
- **Editor e Preview Live:**
  - Painel lateral com opções de personalização.
  - Visualização em tempo real dos slides formatados com Brand Kit e regras do Design System.
  - Permissão de edição do texto diretamente na tela do slide/card.
  - Alternância entre estilos visuais/presets (Editorial, Dark Mode, Corporate, Neumorphic, Anis).

### RF-06: Exportação e Download
- Exportação dos carrosséis nas dimensões padrão do Instagram (1080x1350px ou 1080x1920px).
- Download individual por slide no formato PNG.
- Download empacotado de todos os slides da publicação em um arquivo único `.ZIP`.

### RF-07: Biblioteca de Prompts e System Templates (Arquivos .md)
O sistema deve gerenciar uma pasta interna (`src/prompts/`) com modelos de instruções em Markdown que servem como *System Prompts* para a IA. Cada modelo impõe regras estritas de formato e tamanho:

| Arquivo | Gera | Observação |
|---|---|---|
| `carrossel-educacional.md` | 7 a 10 slides | Estrutura: problema → mecanismo → ação |
| `carrossel-mitos.md` | 6 a 8 slides | Um mito por slide, formato mito/verdade |
| `card-citacao.md` | 1 card | Frase de até 140 caracteres |
| `card-dado.md` | 1 card | Número em destaque + fonte obrigatória |
| `reels-educacional.md` | Roteiro 30-60s | Gancho de 3s obrigatório |
| `reels-mito.md` | Roteiro 20-40s | Abre negando uma crença comum |

---

## 6. Modelo do Banco de Dados (Supabase PostgreSQL)

```sql
-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Perfis de Usuários & Brand Kit
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle VARCHAR(50),
  primary_color VARCHAR(7) DEFAULT '#663B1A',
  secondary_color VARCHAR(7) DEFAULT '#DCD1EF',
  background_color VARCHAR(7) DEFAULT '#EDEAE6',
  accent_color VARCHAR(7) DEFAULT '#C29F58',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cronogramas Semanais
CREATE TABLE weekly_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  niche VARCHAR(100) NOT NULL,
  weekly_goal VARCHAR(100),
  schedule_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Roteiros Gerados
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_template VARCHAR(50) NOT NULL,
  topic TEXT NOT NULL,
  niche VARCHAR(100),
  tone VARCHAR(50),
  duration VARCHAR(20),
  script_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Carrosséis e Cards Gerados
CREATE TABLE carousels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_template VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  theme_style VARCHAR(50) DEFAULT 'anis_editorial',
  slides_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. Requisitos Não Funcionais (RNF)
- **Desempenho:** A geração de cronograma semanal e posts deve ser concluída em até 6 segundos.
- **Qualidade de Renderização:** Imagens geradas em alta resolução (mínimo de 300 DPI equivalente, sem distorção ou serrilhado).
- **Usabilidade:** Design responsivo, moderno, com suporte nativo a Dark Mode e alinhado aos padrões do shadcn/ui.
- **Segurança:** As chaves de API da OpenAI devem estar protegidas no backend/Edge Functions e nunca expostas no código client-side.

---

## 8. Referências Visuais & Design System (Preset Base: Anis Editorial)
Inspirado na identidade visual autoral de alta conversão analisada a partir do feed `@anis_terapeuta`:

### 8.1 Paleta de Cores
| Cor | Hex | Papel |
|---|---|---|
| Lilás | `#DCD1EF` | Assinatura da marca — blobs, blocos de fundo, faixas |
| Greige | `#EDEAE6` | Fundo-base dos cards de texto |
| Marrom | `#663B1A` | Única cor de texto de peso |
| Dourado | `#C29F58` | Só detalhe — fios, molduras, réguas, sparkle |

### 8.2 Regras de Tipografia (Três Registros)
1. **Serifada Display:** Para a frase-manifesto (corpo grande, entrelinha apertada, caixa mista).
2. **Sans-serif:** Tamanho menor para o subtexto de apoio e explicações.
3. **Serifada em Caixa Alta:** Com tracking (espaçamento) largo para manifestos curtos de até duas linhas.

### 8.3 Repertório de Elementos Visuais SVG / Componentes React
- **Blob orgânico lilás** (`#DCD1EF`)
- **Régua dourada vertical** (`#C29F58`)
- **Fio dourado horizontal** (`#C29F58`)
- **Moldura dourada deslocada**
- **Retângulo marrom sólido** (`#663B1A`) como âncora lateral
- **Sparkle de quatro pontas** no canto inferior direito
- **Arcos finos dourados** no topo
- **Círculos concêntricos** para cards de manifesto
