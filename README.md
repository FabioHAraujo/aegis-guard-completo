# AegisGuard

**Segurança Pessoal Inteligente — Mobile e Web**

O AegisGuard é um aplicativo completo de segurança pessoal, com rastreamento em tempo real, alertas de emergência, gravação de áudio com transcrição e comunicação automatizada com contatos de confiança. Ele foi desenvolvido com foco em usabilidade, confiabilidade e integração com tecnologias modernas de IA e automação.

## 📱 Funcionalidades

- **Rastreamento em Tempo Real**  
  Compartilha a rota do usuário com atualização a cada 2 segundos, exibida em mapas.

- **Painel Web Seguro**  
  Geração de link temporário com token para que contatos possam acompanhar a movimentação em tempo real pelo navegador.

- **Contatos de Confiança**  
  Cadastro, gerenciamento e sincronização de contatos com suporte a código DDI.

- **Botão de Pânico**  
  Aciona alertas automáticos por WhatsApp ou e-mail, com localização atual do usuário.

- **Gravação e Transcrição de Áudio**  
  Grava até 10 segundos de áudio, envia para o backend seguro, converte e transcreve automaticamente via IA.

- **Histórico de Rotas**  
  Visualização de trajetos anteriores com data e mapa desenhado.

## ⚙️ Backend - Geração de Link de Rastreamento e APIs

O backend é responsável por gerar links temporários para que contatos de confiança possam acompanhar a localização do usuário em tempo real via navegador.

- **Servidor Express.js** com CORS habilitado para aceitar requisições do frontend.
- Gera um **JWT temporário** (válido por 2 horas) contendo o `userId` para autenticação do link de rastreamento.
- Endpoint `/activate-tracking` recebe o `userId` e um token de ativação predefinido para gerar o link de rastreamento com JWT, que é enviado via WhatsApp ou e-mail pelo frontend.
- Endpoint `/map-data` protegido por JWT que retorna os dados de localização do usuário no dia atual consultando a tabela `locations_users` do Supabase.
- Utiliza a **service_role key** do Supabase para acessar dados de localização mesmo com RLS habilitado, garantindo segurança e controle.

### Como funciona

1. O app solicita a ativação do rastreamento enviando o `userId` e o token secreto para `/activate-tracking`.
2. O backend valida o token e gera um JWT temporário com validade de 2 horas.
3. O frontend recebe o link com o token e o envia para contatos por WhatsApp ou e-mail.
4. O contato acessa o link, que consulta `/map-data` passando o JWT no header de autorização.
5. O backend valida o JWT, consulta o histórico do usuário e retorna os dados para serem exibidos no mapa.

### Variáveis de ambiente usadas

- `SUPABASE_URL` — URL do seu projeto Supabase  
- `SUPABASE_SERVICE_ROLE_KEY` — chave secreta para acesso privilegiado  
- `TRACKING_ACTIVATION_TOKEN` — token predefinido para ativação do rastreamento  
- `JWT_SECRET` — segredo para assinar e validar JWTs  
- `FRONTEND_URL` — URL do frontend para montar o link de rastreamento  

## 🛠️ Tecnologias

- **Mobile:** React Native  
- **Web:** Next.js + ShadCN  
- **Backend Tracking:** Express.js  
- **Auth & Storage:** Supabase  
- **Automação:** n8n  
- **IA:** GPT (respostas automáticas), Whisper (transcrição)  
- **Conversão de Áudio:** Uvicorn + FFmpeg  
- **Mapas:** Google Maps API  
- **Mensageria:** RabbitMQ

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/FabioHAraujo/aegis-guard-completo.git
cd aegis-guard-completo

# Instale as dependências do app mobile
cd mobile
npm install

# Instale as dependências da interface web
cd ../web
npm install

# Instale as dependências do backend
cd ../back-maps
npm install

```

## 🚀 Execução

### Mobile (React Native)

```bash
# Navegue até a pasta mobile
cd mobile

# Inicie o app em ambiente de desenvolvimento
npx expo start
```

### Web (Next.js)

```bash
# Navegue até a pasta web
cd web

# Inicie o frontend web
npm run build
npm run start
```

### Backend (Express.js)

```bash
# Navegue até a pasta back-maps
cd back-maps

# Inicie o backend
npm install
npm run start
```

> ⚠️ Certifique-se de configurar corretamente as variáveis `.env` com as chaves da Supabase, APIs e URLs do backend.

## 📌 Próximos Passos

- Suporte para iOS
- Integração com dispositivos wearables
- Suporte a múltiplos idiomas
- Plano premium com recursos adicionais
- Melhorias na interface de usuário
- Implementação de notificações push
- Testes automatizados e cobertura de código
- Otimização de performance e escalabilidade
- Integração com serviços de emergência locais
- Implementação de autenticação biométrica
- publicação dos fluxos do n8n para automação de processos
- Melhoria na segurança e criptografia de dados

## 🔒 Licença

Este projeto é de uso educacional e experimental. Para uso comercial, entre em contato com o autor.

---

Desenvolvido por **Fábio Henrique Araújo**  
[GitHub: FabioHAraujo](https://github.com/FabioHAraujo)