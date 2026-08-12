# CAF — Cadastro do Atleta de Futevôlei

Identificação digital oficial de atletas de futevôlei para organizadores de torneios.

## Status: Etapa 1 — Fundação e arquitetura

Este commit contém só a fundação do projeto: estrutura de pastas, roteamento
(Next.js App Router) e a arquitetura de design tokens. Nenhuma tela tem lógica
real ainda — cada rota mostra um placeholder indicando em qual etapa futura
ela será implementada.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (configuração via `app/globals.css`, sem `tailwind.config.js`)
- Supabase (auth, banco, storage) — entra na Etapa 2
- PWA offline-first (Service Worker + IndexedDB) — entra na Etapa 8

## Estrutura

