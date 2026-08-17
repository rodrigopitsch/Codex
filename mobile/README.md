# Sala 13 — Android e iPhone

Este diretório transforma a Sala de Jogos web em aplicativo nativo usando Capacitor 8, sem remover nem alterar a versão web.

## O que entra no app

- Todos os HTML/JS/CSS atuais da raiz do repositório.
- Arquivo 13 e suas partes em `a13v3/`.
- Funcionamento local/offline: os jogos são empacotados dentro do app.
- Feedback háptico nativo em botões compatíveis.
- Integração da barra de status.
- Tratamento do botão Voltar físico no Android.
- Ícone e splash gerados a partir de `mobile/assets/logo.svg`.

## Identidade provisória

- Nome: **Sala 13**
- App ID / Bundle ID: `com.rodrigopitsch.sala13`
- Versão inicial: `1.0.0`

Podemos trocar nome e identidade antes de publicar nas lojas.

## Preparar localmente

Requer Node.js 22+.

```bash
npm install
npm run mobile:prepare
```

### Android

```bash
npx cap add android
npx cap sync android
npm run mobile:assets
npx cap open android
```

O projeto abre no Android Studio. Para publicar, gere um Android App Bundle (AAB) assinado.

### iPhone / iOS

Em um Mac com Xcode compatível:

```bash
npx cap add ios
npx cap sync ios
npm run mobile:assets
npx cap open ios
```

Para instalar em iPhone físico e publicar na App Store é necessário configurar assinatura Apple (Team/Developer Account) no Xcode.

## Build automático no GitHub

O workflow `.github/workflows/mobile.yml` cria automaticamente:

- **Android debug APK** instalável para teste.
- **iOS Simulator .app** para validação de build sem certificado Apple.

A versão de iPhone físico/App Store depende da assinatura Apple e por isso não pode ser gerada como um IPA distribuível sem as credenciais/certificados da conta do desenvolvedor.

## Atualização dos jogos

Não existe uma segunda cópia manual dos jogos. `mobile/prepare.mjs` coleta os arquivos atuais da aplicação web, monta `www/` e injeta a bridge nativa. Assim, uma melhoria feita em Arquivo 13, Caçada, Ludo etc. entra no próximo build mobile após sincronização.

## Monetização

AdMob / anúncios recompensados e compras dentro do app ficam para a próxima etapa. Primeiro validamos estabilidade, controles, áudio, saves e navegação nas duas plataformas; depois adicionamos monetização com os IDs reais das contas de anúncio/loja.
