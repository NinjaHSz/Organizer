# PLAN: Notifications Fix (Background & PWA)

Este plano visa resolver a falha nas notificações automáticas, garantindo que elas funcionem mesmo com o aplicativo fechado, utilizando recursos modernos de Service Workers e PWA.

## User Review Required

> [!IMPORTANT]
> A execução de notificações com o **aplicativo fechado** em dispositivos mobile depende do suporte do navegador ao `Periodic Background Sync` ou de o app estar "instalado" como PWA. Browsers de desktop podem pausar timers de abas inativas para economizar energia.

> [!WARNING]
> Mudanças no `sw.js` exigem que o usuário feche todas as abas do app e o reabra para que a nova versão seja ativada.

## Proposed Changes

### 🔧 Arquitetura de Notificações (@mobile-developer)

A lógica atual está presa ao `app-engine.js` e ao `notifications.js` (que rodam na aba/thread principal). Quando você fecha o app, o `setInterval` morre.

- **Passo 1:** Transformar o `sw.js` em um motor inteligente.
- **Passo 2:** Sincronizar o estado das tarefas e horários com o Service Worker (usando `IndexedDB` ou `MessageChannel`).
- **Passo 3:** O Service Worker deve gerenciar seus próprios timers de alarme.

### 💄 Experiência do Usuário (@frontend-specialist)

- Adicionar um painel de "Status de Conectividade PWA" nos ajustes.
- Criar um fluxo de "Reativação de Alertas" caso o Service Worker se perca.

## Perguntas Estratégicas (Socratic Gate)

1. **Plataforma Principal:** Onde o erro é mais crítico? Android, iOS ou Chrome Desktop?
2. **Setup Técnico:** O sistema está rodando em HTTPS ou Localhost?
3. **Instalação PWA:** O app está instalado (ícone na tela inicial) quando você testa?

## Cronograma de Execução

1. **Análise de Logs:** Verificar erros no Console (F12) específicos do Service Worker.
2. **Refatoração do SW:** Mover a lógica de tempo do JS principal para o `sw.js`.
3. **Teste de Persistência:** Validar com o app minimizado e fechado.
