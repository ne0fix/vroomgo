# Prompt para o Gemini — Implementar fluxo.md

---

Copie e cole o texto abaixo diretamente no Gemini CLI:

---

```
Você é um engenheiro sênior implementando um sistema de aluguel de veículos chamado VroomGo.

Leia COMPLETAMENTE o arquivo `fluxo.md` na raiz do projeto antes de escrever qualquer código. Ele contém o PRD completo com diagnóstico, código exato e ordem de implementação.

## Contexto do projeto

- Next.js 15 com App Router, TypeScript, Tailwind CSS, Prisma + PostgreSQL
- Autenticação: NextAuth v5 (credenciais + JWT)
- Pagamento: Mercado Pago SDK v2
- O pagamento com Mercado Pago já está implementado e funcionando
- O schema do banco já existe e está correto (sem migrations necessárias)

## Sua missão

Implementar o fluxo completo descrito no `fluxo.md`:
Cadastro → Login → Listagem real de veículos → Detalhe real → Formulário de reserva → Pagamento MP → Confirmação

## Regras obrigatórias — leia antes de começar

1. **Siga a ordem do item 9 do fluxo.md exatamente** (Etapas 1→2→3→4→5→6). Não pule etapas.

2. **Leia cada arquivo antes de modificá-lo.** Use `read_file` antes de qualquer `write_file` ou `edit_file`. Isso evita sobrescrever código que já funciona.

3. **NÃO modifique estes arquivos** (já estão corretos e funcionando):
   - `lib/mercadopago.ts`
   - `lib/auth.ts`
   - `lib/prisma.ts`
   - `services/PagamentoService.ts`
   - `components/FormularioReserva.tsx`
   - `components/BotaoPagarMP.tsx`
   - `app/api/pagamentos/` (todos os routes dentro)
   - `app/api/reservas/route.ts`
   - `app/api/auth/register/route.ts`
   - `app/reserva/[id]/page.tsx`
   - `app/meus-alugueis/page.tsx`
   - `app/checkout/` (sucesso, falhou, pendente)
   - `app/dashboard/page.tsx`
   - `middleware.ts`
   - `prisma/schema.prisma`

4. **NÃO use dados mockados** de `data/dados-veiculos.ts` ou `data/carros.ts` nas páginas de produção. Use Prisma direto.

5. **Prisma NUNCA em Client Components.** `import { prisma }` só em Server Components e API Routes.

6. **Next.js 15:** `params` e `searchParams` são Promises. Sempre usar `await params` e `await searchParams`.

7. **NÃO recriar** o componente `FormularioReserva`. Ele já existe em `components/FormularioReserva.tsx` — apenas importe e use.

8. **Imagens:** `next.config.ts` já permite `images.unsplash.com`. Use URLs do Unsplash como fallback quando `veiculo.fotos[0]` for vazio.

9. **Tipagem:** Para o `VeiculoCard`, importe `Veiculo` diretamente do Prisma: `import { Veiculo } from "@prisma/client"`. Não crie interface manual.

10. **Após implementar tudo**, execute `npm run build` e corrija qualquer erro de TypeScript antes de considerar a tarefa concluída.

## Arquivos que você vai criar/modificar (12 modificações + 1 criação)

### ETAPA 1 — Foundation (fazer primeiro, sem isso nada funciona):
- `models/dtos/ReservaDTO.ts` — corrigir schema de datas
- `services/ReservaService.ts` — adicionar verificação de disponibilidade
- `viewmodels/useReservaViewModel.ts` — corrigir bug de stale closure nos opcionais

### ETAPA 2 — Listagem real:
- `components/VeiculoCard.tsx` — usar campos Prisma reais
- `components/FiltrosBusca.tsx` — atualizar URL em vez de filtrar localmente
- `app/veiculos/page.tsx` — Server Component com query Prisma

### ETAPA 3 — Detalhe real:
- `app/veiculos/[id]/page.tsx` — Server Component + Prisma + usar FormularioReserva

### ETAPA 4 — Auth completo:
- `app/login/page.tsx` — ler e usar callbackUrl dos searchParams
- `app/cadastro/page.tsx` — ler callbackUrl + redirecionar pós-cadastro
- `components/NavbarMobile.tsx` — CRIAR este arquivo novo (Client Component)
- `components/Navbar.tsx` — converter para Server Component

### ETAPA 5 — Homepage:
- `app/page.tsx` — substituir veículos mockados por query Prisma real

### ETAPA 6 — Build:
- Executar `npm run build` e corrigir todos os erros

## Seed do banco (fazer depois de implementar)

Após implementar todos os arquivos, crie o arquivo `prisma/seed.ts` com o conteúdo do item 10 do `fluxo.md` e execute:

```bash
npx prisma db seed
```

Isso populará o banco com 6 veículos de teste (um por categoria) para que o fluxo possa ser testado.

## Critério de conclusão

A tarefa está concluída quando:
- [ ] `npm run build` passa sem erros de TypeScript
- [ ] `/veiculos` carrega dados do banco (não do arquivo mock)
- [ ] `/veiculos/{id}` carrega dados do banco e mostra `FormularioReserva`
- [ ] Criar reserva redireciona para `/reserva/{id}`
- [ ] `/reserva/{id}` mostra botão de pagamento MP
- [ ] Navbar mostra nome do usuário quando logado
- [ ] Login com `callbackUrl` redireciona corretamente após autenticar

Comece lendo o `fluxo.md` agora.
```
