# Avisos de terceiros

A licença do Homework Organizer cobre o código original do projeto. Dependências,
ferramentas e materiais de terceiros mantêm seus próprios direitos e licenças.
A atribuição de copyright ao titular do projeto não substitui esses avisos.

## GitHub CLI

As distribuições incluídas em `gh_2.44.1_linux_amd64/` e
`gh_2.44.1_linux_arm64/`, assim como seus arquivos `.tar.gz`, são do GitHub CLI,
sob MIT, com copyright de GitHub Inc. Os textos originais permanecem em:

- [Licença da distribuição amd64](gh_2.44.1_linux_amd64/LICENSE)
- [Licença da distribuição arm64](gh_2.44.1_linux_arm64/LICENSE)

## Template Vite

O projeto contém arquivos derivados do template React/TypeScript do Vite.
O [Vite](https://github.com/vitejs/vite/blob/main/LICENSE) é distribuído sob MIT.
Seu aviso é reproduzido abaixo para preservar a atribuição ao upstream.

MIT License

Copyright (c) 2019-present, VoidZero Inc. and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Conversão de HEIC/HEIF

O conversor `heic-to` 1.6.7, de Hopper Gee e contribuidores, é distribuído sob
LGPL-3.0-or-later e utiliza libheif 1.23.7. Ele é carregado como um módulo
separado, apenas quando o navegador não consegue abrir uma foto HEIC/HEIF.
O código original do Homework Organizer continua sob MIT; a biblioteca mantém
sua própria licença. Modificações e substituições dessa biblioteca são permitidas
nos termos da LGPL, inclusive a engenharia reversa para depurar modificações.

- [Aviso e licença LGPL do conversor](public/licenses/heic-to-LICENSE.txt)
- [GPL versão 3, incorporada por referência na LGPL](public/licenses/GPL-3.0.txt)
- [Código-fonte exato do heic-to utilizado](https://github.com/hoppergee/heic-to/tree/78345a3fcdb4a1d70d513fce2646aeff0127f7ba)
- [Código-fonte e instruções de compilação da libheif](https://github.com/strukturag/libheif/tree/v1.23.7)

O conversor é usado sem alterações. Seus avisos de licença são distribuídos
junto ao app em `/licenses/`. Os fontes upstream incluem os scripts de compilação
para reconstruir e substituir o módulo de conversão.
