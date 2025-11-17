------------------ SOBRE O PROJETO ------------------
-

O HareTwin é um sistema completo de monitoramento de ambientes baseado em IoT, Computação em Borda e Digital Twin, integrando: 
  ESP32 com sensor PIR e buzzer (monitoramento físico), 
  Backend Node.js/Express (processamento, API REST, autenticação e controle), 
  Frontend React (interface do usuário)
  Banco NoSQL MongoDB (persistência)
  
O sistema detecta movimento em tempo real, registra atividades, permite seleção de ambiente monitorado e oferece controle remoto do buzzer (modo silencioso) via interface Web.

------------------ COMPONENTES PRINCIPAIS ------------------
-

ESP32:
  Detecta movimento (sensor PIR)
  Ativa buzzer (1000 Hz ou silencioso)
  Envia eventos ao backend
  Recebe comando de modo silencioso
  Atualiza sala monitorada
  Expõe endpoint local: /api/sensor/silent

Backend (Node.js + Express):
  Centraliza a comunicação entre ESP32 e front-end
  Expõe APIs REST
  Gerencia autenticação JWT
  Controla o estado global do buzzer
  Persiste dados no MongoDB

Frontend (React):
  Interface de monitoramento
  Gráfico de atividades por ambiente
  Histórico detalhado
  Login, Registro, Esqueceu a senha, Reset de senha
  Controle remoto: ativar/silenciar buzzer
  Polling a cada 2,5 segundos

------------------ INSTALAÇÃO DEPENDÊNCIAS ------------------
-
(executar no terminal)

Backend:
  cd backend
  npm install

Dependências Principais:
  1. express
  2. mongoose
  3. jsonwebtoken
  4. bcryptjs
  5. cors
  6. dotenv
  7. node-fetch
  8. nodemailer

Frontend:
  cd frontend
  npm install

Dependências Principais:
  1. react
  2. react-dom
  3. react-router-dom
  4. react-icons
  5. react-toastify
  6. vite
  7. axios
  8. recharts


------------------ .ENV ------------------
-
(OBS: Necessário que a aplicação e a controladora estejam rodando na mesma rede)

Backend: 
  DB_USER = <DB_USER>
  DB_PASS = <DB_PASSWORD>
  SECRET =  UGHIKH845IUGT7u6t67576tg12jhguyYUT876
  PORT = 3000
  AUTH_EMAIL = twinhareunisa@gmail.com
  AUTH_PASS = dtwt exun jord lcxz 

Frontend:
  VITE_API_URL: http://<IP_ESP32>:3000

ESP32:
  const char* ssid = <"NOME_REDE">;
  const char* password = <"SENHA_REDE">;

------------------ COMO RODAR ------------------
-
(OBS: Os testes foram feitos utilizando Arduino IDE para microcontroladora ESP32 e VS Code para aplicação)

Backend:
  cd backend
  npm start

Frontend:
  cd frontend
  npm run dev


1. Abra o código no Arduino IDE
2. Ajuste SSID, senha Wi-Fi e IPs do backend
3. Compile e envie

------------------ API REST ------------------
-

🧩 Autenticação
-

A) POST /api/auth/register: Registra um novo usuário.

Body JSON
{
  "name": "Exemplo",
  "email": "exemplo@email.com",
  "password": "123456" (OBS: Mínimo de 4 caracteres)
}

1. Retorno:
  201 Created
2. Envia e-mail de verificação
3. Salva no banco

---

B) POST /api/auth/login: Realiza login e retorna token JWT.

Body JSON
{
  "email": "email@exemplo.com",
  "password": "123456"
}

1. Retorno:
  token
  dados do usuário

---

C) POST /api/auth/forgot-password: Envia link de redefinição de senha para o e-mail.

Body JSON
{
  "email": "email@exemplo.com"
}

---

D) POST /api/auth/reset-password: Atualiza a senha usando token enviado por e-mail.

Body JSON
{
  "token": "<token>",
  "password": "novasenha"
}

---

🛰 Sensor (ESP32)
-

E) POST /api/sensor: Recebe atividade do ESP32.

Body JSON
{
  "motion": true,
  "timestamps": "2025-11-10T20:28:08.000Z",
  "room": "Sala 01",
  "duration": 0
}

1. Retorno
  201 Created.
   
---

F) GET /api/sensor/active: Retorna lista ordenada de atividades recentes.

---

G) GET /api/sensor: Ping para verificar se ESP está online.

---

H) GET /api/sensor/room: Retorna sala atual definida.

Exemplo:
{ 
  "room": "Laboratório 1" 
}

---

I) POST /api/sensor/room: Define sala monitorada.

Body JSON
{ 
"room": "Sala de Aula" 
}

---

🔔 Buzzer
-

J) GET /api/buzzer: Retorna estado do buzzer.

1. Retorno:
  {
    "enabled": true
  }

---

K) POST /api/buzzer: Atualiza o estado e envia comando ao ESP32.

Body JSON
{ 
  "enabled": false
}

Isto dispara: POST http://<ESP_IP>:3000/api/sensor/silent?silent=true

------------------ FLUXO DO SISTEMA ------------------
-

Fluxo de detecção
-
  1. PIR detecta movimento
  2. ESP32 toca buzzer (se não estiver silencioso)
  3. ESP32 envia POST /api/sensor
  4. Backend salva no MongoDB
  5. Front-end consulta /active a cada 2.5s
  6. Interface exibe alerta e atualiza gráfico

Fluxo do modo silencioso
-
1. Usuário ativa/desativa no painel
2. Front envia POST /api/buzzer
3. Backend envia comando ao ESP32
4. ESP32 atualiza variável silentMode
5. Buzzer toca a 1000 Hz ou 0 Hz

Fluxo de autenticação
-
  1. Usuário cria conta
  2. Recebe e-mail de verificação
  3. Faz login → recebe JWT
  4. Front salva token no localStorage
  5. Todas as rotas protegidas exigem o token

------------------ CHECKLIST ------------------
-

✔ ESP32 conectado ao Wi-Fi
✔ IP colocado no .env
✔ Backend online
✔ Front-end acessando API
✔ Buzzer responde no modo silencioso
✔ Gráfico atualiza a cada 2.5s
✔ Histórico funcionando
✔ CRUD de autenticação funcionando

------------------ LICENÇA ------------------
-

Projeto acadêmico. Uso liberado para fins educacionais.
