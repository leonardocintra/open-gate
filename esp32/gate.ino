#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// ======== Config WiFi =========
const char* ssid = "NOME_DA_REDE";
const char* password = "SENHA_DA_REDE";

// IP fixo
IPAddress local_IP(192,168,15,50);  
IPAddress gateway(192,168,15,1);  
IPAddress subnet(255,255,255,0);  
IPAddress primaryDNS(8,8,8,8);  
IPAddress secondaryDNS(8,8,4,4);  

// ======== Config MQTT =========
const char* mqtt_server = "servidor.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "username_mqtt";
const char* mqtt_password = "SENHA_MQTT";

// ======== Cliente MQTT =========
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ======== Pinos =========
const int relePortao = 25;   // D25 -> Rele do portão
const int releLuz    = 32;   // D32 -> Rele da luz

// Controle de tempo da luz
bool luzAtiva = false;
unsigned long tempoLuz = 0;

// Controle de atraso do acendimento da luz
bool aguardarLuz = false;
unsigned long tempoAcionamentoPortao = 0;

void acendeLuz() {
  digitalWrite(releLuz, LOW);   // Liga luz (active LOW)
  luzAtiva = true;
  tempoLuz = millis();
  client.publish("casa/luz/status", "luz_ligada");
  Serial.println("💡 Luz acesa!");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  msg.toLowerCase();
  msg.trim();

  Serial.print("Mensagem recebida: ");
  Serial.println(msg);

  // ===== Abrir Portão =====
  if (msg == "abrir") {
    Serial.println("Atuando portão...");
    digitalWrite(relePortao, LOW);   // Pulso 1s
    delay(1000);
    digitalWrite(relePortao, HIGH);
    Serial.println("Portão acionado!");
    client.publish("casa/portao/status", "portao_acionado");

    // Marca para acender luz daqui 5 segundos
    aguardarLuz = true;
    tempoAcionamentoPortao = millis();
  }

  // ===== Fechar Portão =====
  if (msg == "fechar") {
    Serial.println("Fechando portão...");
    digitalWrite(relePortao, LOW);   // Pulso 1s
    delay(1000);
    digitalWrite(relePortao, HIGH);
    Serial.println("Portão fechado!");
    client.publish("casa/portao/status", "portao_fechado");

    // Marca para acender luz daqui 5 segundos
    aguardarLuz = true;
    tempoAcionamentoPortao = millis();
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando MQTT...");
    String clientId = "ESP32Portao-";
    clientId += String(random(0xffff), HEX);

    if(client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println(" Conectado!");
      client.subscribe("casa/portao"); // Tópico de comandos
      Serial.println("Inscrito no tópico: casa/portao");
    } else {
      Serial.print(" Falha, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(relePortao, OUTPUT);
  pinMode(releLuz, OUTPUT);

  digitalWrite(relePortao, HIGH); // Inicia desligado
  digitalWrite(releLuz, HIGH);    // Inicia desligado

  Serial.begin(115200);
  delay(1000);

  Serial.println("=== ESP32 Controle Portão e Luz ===");

  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Falha ao configurar IP fixo");
  }

  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());

  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setBufferSize(256);

  Serial.println("Setup concluído!");
}

void loop() {
  if(!client.connected()){
    reconnect();
  }
  client.loop();

  // Acende a luz 5 segundos após o portão ter sido acionado
  if (aguardarLuz && (millis() - tempoAcionamentoPortao >= 5000)) {
    acendeLuz();
    aguardarLuz = false;
  }

  // Desliga a luz após 2 minutos
  if (luzAtiva && (millis() - tempoLuz >= 120000)) { // 120000 ms = 2 min
    digitalWrite(releLuz, HIGH); // Desliga relé
    luzAtiva = false;
    Serial.println("💤 Luz apagada automaticamente após 2 min");
    client.publish("casa/luz/status", "luz_apagada");
  }

  // Heartbeat
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 30000) {
    if(client.connected()) {
      Serial.println("MQTT: Conectado e funcionando");
    }
    lastHeartbeat = millis();
  }
}
