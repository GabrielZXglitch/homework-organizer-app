# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Estudantes (crianças e jovens) que precisam gerenciar suas lições de casa diárias de forma engajadora.

## Product Purpose
Organizar as lições de casa do usuário, permitindo o acompanhamento de tarefas através de um formato de rotina gamificada, em que a comprovação da tarefa é feita através do envio de uma foto.

## Positioning
Diferencia-se de simples "to-do lists" garantindo que a tarefa realmente foi concluída, validando a foto enviada por meio de IA (Groq).

## Operating Context
O estudante utiliza o app em casa ou no colégio após o fim das aulas, precisando consultar suas pendências e usar a câmera para capturar o dever de casa (ou material escolar) assim que o terminar.

## Capabilities and Constraints
- PWA (Progressive Web App) para acesso ágil via dispositivos móveis.
- O fluxo de conclusão obrigatoriamente depende da mecânica de anexar/tirar foto.
- Validação em backend serverless com Vercel usando API da Groq Vision.
- Stack fixada: React + Vite + Tailwind + Vercel.

## Brand Commitments
Foco em gamificação, celebração das conquistas (confetti) e estímulo visual.

## Evidence on Hand
Sistema de validação via API route `api/verify-photo.ts` já implementado e funcional. Contextos e fluxos base já existem em React.

## Product Principles
1. O processo de adicionar e marcar um dever como pronto deve ser rápido e gratificante.
2. A câmera e a IA são os fiéis depositários da verdade; o estudante deve se sentir desafiado a provar que fez a lição.
3. O app deve passar a sensação de vitória (gamificação) a cada conclusão.

## Accessibility & Inclusion
Interfaces e botões devem possuir bom contraste e *tap targets* adequados para jovens utilizando o app por interfaces touch (Mobile Web PWA).
