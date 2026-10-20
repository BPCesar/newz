# Newz Mídia: site + área administrativa

Site institucional (Home, O que fazemos, Consultoria, Contato) com área do administrador:

- **Páginas do site:** mostrar/ocultar cada página e tirar do menu.
- **Landing pages:** botão **Criar LP**. Cole o código HTML completo, salve como rascunho (só você vê), coloque no ar com um clique. O endereço fica `seusite.com.br/lp/nome-da-lp`, para usar em anúncios. As LPs não aparecem no menu nem no Google (opcional).
- **PIs:** gerador de Pedido de Inserção com cálculo automático (bruto de tabela, desconto negociado, bruto negociado, comissão da agência, líquido do veículo, taxas, total a faturar), faturamento em 15, 30 ou qualquer número de dias após a veiculação, vencimento calculado, numeração automática (2026-0001...), status, impressão/PDF e histórico salvo.
- **CRM:** leads e clientes em quadro por etapa ou em lista. Cada card tem dados, anotações com data, links e os PIs do cliente. O formulário de contato do site cria o lead automaticamente.

## Tecnologias

| Peça | Escolha | Por quê |
|---|---|---|
| Código | GitHub | Versões e deploy automático |
| Hospedagem | Vercel (plano gratuito) | Cada `git push` publica o site |
| Framework | Next.js 15 + React + TypeScript | Site e admin no mesmo projeto |
| Banco | Postgres no Neon (gratuito, integrado à Vercel) | Guarda LPs, PIs, CRM; as tabelas são criadas sozinhas |
| Estilo | Tailwind CSS | Cores da marca já configuradas |
| Login | Sessão assinada (JWT) em cookie seguro | Sem serviço externo |

## Segurança já incluída

- Usuário e senha ficam **só nas variáveis de ambiente da Vercel**, nunca no código ou no GitHub.
- Sessão em cookie `httpOnly`, `secure` e `sameSite=strict`, válida por 12 horas.
- Bloqueio de 15 minutos após 5 senhas erradas do mesmo IP.
- Toda página e ação do admin confere a sessão no servidor (não só no navegador).
- Admin e LPs com `noindex`; admin não pode ser embutido em outro site.
- LPs rodam em "caixa de areia" (isolamento de segurança), sem acesso à sua sessão. Dá para desligar por LP se um pixel precisar de cookies.
- Formulário de contato com proteção contra robôs e limite de envios.

## Como colocar no ar (passo a passo)

### 1. GitHub
1. Crie uma conta em github.com (se ainda não tiver).
2. Clique em **New repository**, nome `newz-midia`, marque **Private** e crie.
3. Envie os arquivos desta pasta para o repositório. O jeito mais simples: na página do repositório, clique em **uploading an existing file**, arraste todo o conteúdo da pasta (menos `node_modules` e `.next`, se existirem) e clique em **Commit changes**.

### 2. Vercel
1. Entre em vercel.com com a sua conta do GitHub.
2. **Add New → Project**, escolha o repositório `newz-midia` e clique em **Import**. Não clique em Deploy ainda.

### 3. Banco de dados (Neon)
1. No projeto da Vercel, abra a aba **Storage → Create Database → Neon (Postgres)** e crie no plano gratuito, região São Paulo se disponível.
2. Conecte o banco ao projeto. A Vercel cria a variável `DATABASE_URL` sozinha.
   - Se ela aparecer com outro nome (ex.: `POSTGRES_URL`), crie `DATABASE_URL` com o mesmo valor.

### 4. Variáveis de ambiente
Em **Settings → Environment Variables**, cadastre:

| Nome | Valor |
|---|---|
| `ADMIN_USER` | `DONAVERA` |
| `ADMIN_PASSWORD` | a sua senha (recomendado: 14+ caracteres) |
| `SESSION_SECRET` | um texto aleatório com 40+ caracteres (pode gerar em 1password.com/password-generator) |

### 5. Publicar
Clique em **Deploy**. Em 1 a 2 minutos o site está no ar no endereço `newz-midia.vercel.app`.

- Admin: `seusite/admin`
- Domínio próprio: **Settings → Domains**, adicione `newzmidia.com.br` (ou o que registrar no registro.br) e siga as instruções de DNS.

## Uso no dia a dia

- **Nova LP:** Admin → Landing pages → **Criar LP** → cole o código → Salvar → **Pré-visualizar** → mude para **No ar**. Use **Duplicar** para criar variações para testes A/B de anúncios.
- **Novo PI:** Admin → PIs → **Novo PI** (ou pelo card do cliente no CRM) → preencha → Salvar → **Imprimir / PDF**. Antes, troque `[CNPJ DA AGÊNCIA]` em `src/app/admin/(painel)/pis/[id]/imprimir/page.tsx` pelo CNPJ da Newz.
- **Textos do site:** ficam em `src/app/(site)/` (um arquivo por página). Edite no GitHub e salve: a Vercel publica sozinha.
- **WhatsApp:** número em `src/lib/site.ts`.

## Rodar no computador (opcional)

```bash
npm install
cp .env.example .env.local   # preencha com os dados do Neon e do admin
npm run dev                  # http://localhost:3000
```
