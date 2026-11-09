# Controle de Treino (PWA)

PWA **offline-first** para executar e acompanhar um plano de musculação + cardio: registre séries, carga, RIR, descanso e cardio em tempo real, com histórico e gráficos de progressão. Todos os dados ficam no seu aparelho (IndexedDB).

## Screenshots

Adicione capturas em `docs/screenshots/` e referencie aqui:

| Dashboard | Treino ativo | Progressão |
| --- | --- | --- |
| `docs/screenshots/dashboard.png` | `docs/screenshots/active-workout.png` | `docs/screenshots/progression.png` |

## Funcionalidades

- **Dashboard**: treino do dia, resumo da semana e retomada automática de sessão em andamento.
- **Treino ativo** (tela imersiva): carga/reps/RIR por série, cronômetro de descanso com vibração, série extra, pular exercício, cardio ao final.
- **Histórico** com filtros por grupo muscular e período, e detalhe por exercício.
- **Progressão**: carga máxima e volume nas últimas 8 semanas (Recharts) + destaque de progressão dupla.
- **Ajustes**: tema claro/escuro/sistema, backup/restauração em JSON, instalação do app.

## Stack

Vite 5 · React 18 · TypeScript strict · Tailwind CSS v3 · Zustand · Dexie.js · vite-plugin-pwa (Workbox) · React Router v6 · Recharts · framer-motion · lucide-react · Vitest + Testing Library · ESLint + Prettier + Husky + lint-staged.

## Rodando localmente

```bash
npm install
npm run dev          # http://localhost:5173/workout-tracker-pwa/
npm run lint
npm run test:ci      # testes + cobertura (mín. 70% em hooks/ e services/)
npm run build && npm run preview
```

## Personalizando o plano

O plano inicial está em `src/lib/constants.ts` (`SEED_EXERCISES`) e é gravado no IndexedDB na primeira abertura. Para trocar os exercícios depois, edite o arquivo e limpe os dados do site (ou ajuste o backup JSON e importe). Os dias com cardio ficam em `CARDIO_DAYS`.

## Deploy (GitHub Pages)

1. Crie o repositório público `workout-tracker-pwa` e envie o código para a branch `main` (inclua o `package-lock.json`).
2. O workflow `.github/workflows/deploy.yml` roda `lint → test → build → deploy` e publica `dist/` na branch `gh-pages`.
3. Em **Settings → Pages**, selecione *Deploy from a branch* → `gh-pages` / `/ (root)`.
4. Acesse `https://<usuario>.github.io/workout-tracker-pwa/`.

Se o nome do repositório for outro, altere `base` em `vite.config.ts`.

## Notas técnicas

- Roteamento com `HashRouter` para que recarregar páginas internas funcione no GitHub Pages.
- Service worker via Workbox (`generateSW`): precache do app shell, `StaleWhileRevalidate` para assets e `CacheFirst` para ícones e fontes.
- `restSecActual` = segundos desde a série anterior do mesmo exercício.

## Licença

MIT — veja [LICENSE](LICENSE).
