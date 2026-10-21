# Robson Client · Showcase Website

Landing page vitrine 100% interativa, moderna e animada para o **Robson Client** (Minecraft 1.21.1 Fabric).

---

## 🚀 Como testar localmente

Você pode abrir o site de duas formas no seu computador:

### Opção 1: Servidor Local Rápido (Recomendado para testar vídeos e áudio sem bloqueio de navegador)
Abra o terminal no projeto e execute:
```bash
python -m http.server 8080 --directory website
```
Em seguida, abra no navegador: **`http://localhost:8080`**

*(Ou se preferir Node.js: `npx serve website`)*

### Opção 2: Abrir direto
Dê dois cliques no arquivo [`website/index.html`](index.html) para abrir diretamente no seu navegador padrão (Edge, Chrome, Firefox).

---

## 🌐 Como colocar no ar 100% GRÁTIS (24/7)

### Vercel (Recomendado - Deploy Instantâneo)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Conecte sua conta do GitHub ou instale a CLI com `npm i -g vercel`.
3. Crie um novo projeto apontando para este repositório e configure o **Root Directory** como `website`.
4. Clique em **Deploy**. Seu site estará no ar em poucos segundos em um subdomínio como `robson-client.vercel.app` com SSL/HTTPS gratuito.

### GitHub Pages
1. No seu repositório no GitHub, vá em **Settings** > **Pages**.
2. Em **Build and deployment**, selecione a branch e aponte para a pasta `/website` (ou use uma branch `gh-pages`).
3. O site ficará acessível gratuitamente em `seunome.github.io/MeuClient/website`.

---

## 💎 Funcionalidades e Interatividade do Site

1. **Holograma 3D Interativo (Hero)**:
   - Responde ao movimento do mouse com perspectiva e inclinação 3D dinâmica (`rotateX`/`rotateY`).
   - Linhas de scanner holográfico e telemetria de performance em tempo real.

2. **Seletor de Temas Global (Sincronizado)**:
   - Alterna entre **Diamante**, **Ametista** e **Esmeralda**.
   - Atualiza a paleta de cores, brilhos neon e bordas do site inteiro E do menu in-game simultaneamente.

3. **Menu In-Game 100% Clicável**:
   - Interface embutida em moldura de monitor gamer.
   - Navegue pelas abas: *Menu Principal*, *Editor de HUD* e *Chat Avançado*.
   - Alterne categorias (*Visual*, *Jogador*, *HUD*, *Chat*, etc.) e teste os sliders e toggles.

4. **HUD Studio ao Vivo (Laboratório Drag & Drop)**:
   - Arraste a **Scoreboard**, **Chat**, **Boss Bar** e **FPS** livremente pela tela com o mouse.
   - Controles de opacidade, escala e grade de alinhamento.
   - Vídeo real in-game rodando ao lado com corte de CSS (sem barras do Windows).

5. **Chat Inteligente & Tradutor Nativo**:
   - Digite em português ou inglês para ver o tradutor disparar ao vivo.
   - Botões de **AutoTexts** (com os 6 atalhos) e **Símbolos** (✧, ⚒, ⚔, ★, ❤, ⚡).
   - Simulação de respostas realistas no chat.
   - Vídeo in-game em servidor gringo ao lado.

6. **Bento Grid & Mini-Game CPS**:
   - Apresentação visual da arquitetura Fabric e dos módulos visuais.
   - Botão interativo para medir seu CPS (cliques por segundo) diretamente na página!

7. **Galeria de Capturas In-Game com Lightbox**:
   - Screenshots em alta definição dos 3 temas e módulos com zoom ao clicar.

8. **Integração Discord**:
   - Botões que copiam sua tag do Discord (`@caio`) para a área de transferência com toast animado.
