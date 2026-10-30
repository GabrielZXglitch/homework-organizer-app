# Credenciais e configuração

A verificação de deveres usa **Groq**, não Grok, via
`https://api.groq.com/openai/v1/chat/completions`. A credencial ativa é
`GROQ_API_KEY`, usada apenas pela função de servidor `api/verify-photo.ts`.
Não coloque essa chave em variáveis com prefixo `VITE_`: elas podem ser
incorporadas ao JavaScript público pelo Vite.

O Gemini foi usado anteriormente. O código atual não o consulta; o SDK
`@google/generative-ai` e a configuração local antiga foram removidos.
Bibliotecas Google usadas pelo Firebase não são parte dessa integração antiga.

## Configuração sem valores no Git

Copie `.env.example` para um arquivo local ignorado e preencha as variáveis.
Para compilar e publicar, configure as seis variáveis `VITE_FIREBASE_*` no
ambiente correspondente da Vercel. São as configurações públicas do aplicativo
web Firebase; não substituem as regras do Firestore nem representam uma chave
de conta de serviço. Não exclua essas configurações ao remover chaves de IA.

`GROQ_API_KEY` deve estar disponível no servidor na Vercel. Para testar a função
localmente, use o ambiente de funções da Vercel; o servidor Vite sozinho não
executa `/api/verify-photo`.

O arquivo `.env.production` foi retirado do versionamento, mas pode permanecer
localmente, ignorado. Isso não o apaga de commits antigos. As seis variáveis
públicas do Firebase foram preservadas na Vercel em Production, Preview e
Development, sem alterar a chave ativa da Groq ou iniciar um deploy.

## Ações manuais após a exposição histórica

- **Groq:** considere comprometidas as chaves que apareceram em `.env` como
  `VITE_GROQ_API_KEY`. Não foi testado se continuam válidas. Se a chave ativa
  `GROQ_API_KEY` for uma delas, crie uma nova e substitua-a nos ambientes
  Production, Preview e Development da Vercel. Publique e teste uma foto com a
  nova chave antes de revogar a anterior, para reduzir interrupções. Se forem
  diferentes, revogue as antigas expostas sem apagar a chave ativa.
- **Gemini/Google AI:** revise e revogue as chaves históricas associadas a
  `VITE_GEMINI_API_KEY`. Essa integração não é mais necessária. Remova também a
  variável antiga da Vercel. Não confunda essas chaves com a configuração
  Firebase. Não foi verificado se as antigas credenciais ainda são válidas.
- **Firebase:** a chave web em `VITE_FIREBASE_API_KEY` é pública por definição.
  Revise as restrições de API compatíveis com Firebase, os domínios de
  autenticação autorizados e as regras do Firestore. Ela não exige rotação só
  por estar no cliente. Se tiver acesso a APIs privadas/pagas indevidas, restrinja
  ou substitua a chave com um rollout que mantenha Authentication e Firestore.
- **Variável `API_KEY` na Vercel:** o código atual não a referencia. Identifique
  no painel sua origem e eventuais consumidores externos antes de excluí-la ou
  revogar sua credencial; seu nome genérico não permite concluir o provedor.

Não registre tokens, cabeçalhos Authorization, imagens em base64 ou respostas
brutas dos provedores. A função registra somente mensagens fixas e, quando
necessário, o status HTTP numérico da Groq.

A auditoria de 30/10/2026 encontrou dois alertas no `.env.production` então
versionado e seis ocorrências no histórico de 66 commits. Os valores não foram
incluídos neste documento nem nos relatórios compartilhados. Nenhuma credencial
foi validada com chamadas autenticadas ao provedor.

Reescrever o histórico exige coordenação com os colaboradores e não substitui a
revogação. Nenhuma reescrita, push ou publicação foi feita nesta correção.
