#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include "time.h"

// CONFIGURAÇÕES DE REDE 
const char* ssid = "";
const char* password = "";

// CONFIG BACKEND
const char* serverName = "http://172.24.178.47:3000/api/sensor"; // IP da rede
const char* roomUrl   = "http://172.24.178.47:3000/api/sensor/room"; // IP da rede

// CONFIG NTP 
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -3 * 3600;
const int daylightOffset_sec = 0;

// PINOS 
const int ledPin = 2;
const int pirPin = 19;
const int buzzerPin = 5;

// VARIÁVEIS 
bool ledState = false;
bool silentMode = false;
String currentRoom = "Sala 01";
unsigned long lastBuzzTime = 0;
int buzzerFreq = 2000;
int buzzerDuration = 500;
int buzzerCooldown = 2000;

int motionState = LOW;
int lastMotionState = LOW;

WebServer server(4000);

// FUNÇÕES AUXILIARES 
bool waitForTime(int timeout_ms = 10000) {
  struct tm timeinfo;
  int waited = 0;
  while (waited < timeout_ms) {
    if (getLocalTime(&timeinfo)) return true;
    delay(500);
    waited += 500;
  }
  return false;
}

String getTimestampISO() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "";
  char buf[30];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S.000Z", &timeinfo);
  return String(buf);
}

String fetchRoomFromServer() {
  if (WiFi.status() != WL_CONNECTED) return currentRoom;
  HTTPClient http;
  http.begin(roomUrl);
  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    int i = payload.indexOf("\"room\"");
    if (i >= 0) {
      int colon = payload.indexOf(":", i);
      int q1 = payload.indexOf("\"", colon);
      int q2 = payload.indexOf("\"", q1 + 1);
      if (q1 >= 0 && q2 > q1) {
        String r = payload.substring(q1 + 1, q2);
        http.end();
        return r;
      }
    }
  }
  http.end();
  return currentRoom;
}

// BUZZER 
void tocarBuzzer() {
  if (!silentMode) {
    Serial.println("🎵 Tocando buzzer passivo...");
    tone(buzzerPin, buzzerFreq, buzzerDuration);
  } else {
    Serial.println("🔕 Modo silencioso ativo — buzzer desligado.");
  }
}

// ATUALIZAR MODO SILENCIOSO 
void updateSilentMode(bool state) {
  silentMode = state;
  if (silentMode) {
    noTone(buzzerPin);
  }
  Serial.print("Modo silencioso: ");
  Serial.println(silentMode ? "Ativado" : "Desativado");
}

// ENVIO DE DADOS 
void sendSensorData(bool motion, const String &ts, const String &roomToSend) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Wi-Fi desconectado, não foi possível enviar.");
    return;
  }

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String body = "{";
  body += "\"motion\": ";
  body += motion ? "true" : "false";
  body += ", \"timestamps\": \"" + ts + "\"";
  body += ", \"room\": \"" + roomToSend + "\"";
  body += "}";

  Serial.print("📡 Enviando para servidor: ");
  Serial.println(body);

  int code = http.POST(body);
  Serial.print("HTTP code: ");
  Serial.println(code);

  if (code > 0) {
    String resp = http.getString();
    Serial.println("Resposta: " + resp);
  } else {
    Serial.println("❌ Erro HTTP POST");
  }
  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(ledPin, OUTPUT);
  pinMode(pirPin, INPUT_PULLDOWN);
  pinMode(buzzerPin, OUTPUT);
  noTone(buzzerPin);

  Serial.println("🔧 Testando buzzer...");
  tone(buzzerPin, 1000, 500);
  delay(1000);

  // CONEXÃO WI-FI 
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Conectado!");
  Serial.println(WiFi.localIP());

  // CONFIGURA NTP 
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  waitForTime();

  // BUSCA SALA ATUAL 
  currentRoom = fetchRoomFromServer();
  Serial.println("🏠 Sala atual: " + currentRoom);

  // ROTAS DO SERVIDOR LOCAL 
  server.on("/api/sensor/silent", HTTP_POST, []() {
    if (server.hasArg("silent")) {
      String silentParam = server.arg("silent");
      bool silent = (silentParam == "true");
      updateSilentMode(silent);
      server.send(200, "application/json", "{\"status\":\"ok\"}");
      Serial.println(silent ? "🔕 Buzzer silenciado via API" : "🔔 Buzzer ativado via API");
    } else {
      server.send(400, "application/json", "{\"error\":\"param missing\"}");
    }
  });
  server.begin();
  Serial.println("🌐 Servidor local iniciado na porta 3000");
}

// LOOP PRINCIPAL 
unsigned long lastSendMillis = 0;
const unsigned long minInterval = 800;

void loop() {
  server.handleClient();
  motionState = digitalRead(pirPin);

  // INICIA DETECÇÃO
  if (motionState == HIGH && lastMotionState == LOW) {
    digitalWrite(ledPin, HIGH);
    ledState = true;
    unsigned long currentMillis = millis();

    Serial.println("Movimento detectado!");
    tocarBuzzer();

    if (currentMillis - lastBuzzTime >= buzzerCooldown) {
      lastBuzzTime = currentMillis;
    }

    String ts = getTimestampISO();
    currentRoom = fetchRoomFromServer();
    if (millis() - lastSendMillis > minInterval) {
      sendSensorData(true, ts, currentRoom);
      lastSendMillis = millis();
    }
  }

  // ENCERRA DETECÇÃO
  else if (motionState == LOW && lastMotionState == HIGH) {
    delay(500); // espera pra confirmar
    if (digitalRead(pirPin) == LOW) {
      digitalWrite(ledPin, LOW);
      ledState = false;

      Serial.println("✅ Movimento encerrado.");
      String ts = getTimestampISO();
      currentRoom = fetchRoomFromServer();
      if (millis() - lastSendMillis > minInterval) {
        sendSensorData(false, ts, currentRoom);
        lastSendMillis = millis();
      }
    }
  }

  lastMotionState = motionState;
  delay(100);
}
