# Homework Organizer

## Prazos e lembretes

O app verifica os prazos ao carregar os deveres, ao voltar para a aba e enquanto
estiver aberto. Deveres não concluídos passam a `atrasado` depois da data e hora
de entrega; a atualização é salva no Firestore com uma transação que preserva
conclusões concorrentes. Os atrasados permanecem visíveis nas tarefas ativas.
Ao estender um prazo, o dever volta a `pendente`.

Com permissão de notificações, cada dever recebe um lembrete a partir do início
do dia anterior (agendado com pelo menos 24 horas de antecedência) e outro a
partir do início do dia da entrega, no fuso local. O app evita repetir o mesmo
lembrete por usuário, dever, prazo e etapa. Se o app for aberto depois do horário
agendado, o lembrete aplicável é emitido ao carregar, desde que o prazo não tenha
passado. O service worker é usado para exibir notificações em navegadores móveis.

Esses lembretes são locais: não há envio com o app fechado. Para isso, seria
necessário implementar um agendador no servidor e assinaturas de Web Push.
Deveres que vencerem com o app fechado serão atualizados no próximo carregamento.

Validação: `npx vitest run` e `yarn build`.

## Template original

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
