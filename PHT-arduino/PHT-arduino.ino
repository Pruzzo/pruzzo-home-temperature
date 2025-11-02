#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ---------- USER CONFIG ----------
const char* WIFI_SSID     = "TP-Link_14D0";
const char* WIFI_PASSWORD = "19700434";

// Firebase Realtime Database REST endpoint (must end with .json)
const char* FIREBASE_URL  = "https://pruzzo-home-temperature-default-rtdb.europe-west1.firebasedatabase.app/temperatures.json";

#define ONE_WIRE_BUS D2
#define LED_PIN LED_BUILTIN // Usually GPIO2 on NodeMCU; active LOW

const uint8_t  SAMPLES = 5;
const uint16_t SAMPLE_DELAY_MS = 750;
const uint32_t SLEEP_SECONDS = 60 * 30;

// ---------- GLOBALS ----------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
WiFiClientSecure client;

// ---------- LED HELPERS ----------
void ledOn()    { digitalWrite(LED_PIN, LOW); }  // active LOW
void ledOff()   { digitalWrite(LED_PIN, HIGH); }
void blink(uint8_t times, uint16_t delayMs) {
  for (uint8_t i = 0; i < times; i++) {
    ledOn();  delay(delayMs);
    ledOff(); delay(delayMs);
  }
}

// ---------- WIFI ----------
bool connectWiFi(uint16_t timeout_ms = 15000) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  uint32_t start = millis();
  ledOff();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeout_ms) {
    Serial.print(".");
    blink(1, 200); // 🔵 slow blink = connecting
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected!");
    // Solid ON for a short time to show connection success
    ledOn(); delay(500); ledOff();
    return true;
  }
  return false;
}

// ---------- FIREBASE ----------
bool postTemperature(float valueC) {
  HTTPClient http;
  http.begin(client, FIREBASE_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = String("{\"value\": ") + String(valueC, 2) + ", \"timestamp\": {\".sv\": \"timestamp\"}}";

  int httpCode = http.POST(payload);
  String resp = http.getString();

  Serial.printf("HTTP %d\n", httpCode);
  Serial.println("Response: " + resp);

  // LED feedback
  if (httpCode == 200) {
    blink(2, 150); // ✅ double short blink = OK
  } else {
    blink(5, 100); // ⚠️ fast blink = error on post
  }

  http.end();
  return httpCode == 200;
}

// ---------- TEMPERATURE ----------
float averageTemperatureC(uint8_t samples, uint16_t delayMs) {
  Serial.println("Collecting temperature samples...");
  blink(3, 100); // 🟡 triple blink = start measurement

  float sum = 0.0;
  uint8_t good = 0;

  for (uint8_t i = 0; i < samples; i++) {
    sensors.requestTemperatures();
    delay(delayMs);
    float c = sensors.getTempCByIndex(0);

    if (!isnan(c) && c > -100.0 && c < 125.0 && c != 85.0) {
      sum += c;
      good++;
    } else {
      Serial.printf("Bad reading #%u: %.2f°C\n", i, c);
      blink(1, 300); // 🔴 single long blink = bad reading
    }
  }

  if (good == 0) {
    Serial.println("All measurements failed!");
    // 🔴 three long blinks = measurement error
    for (int i = 0; i < 3; i++) { ledOn(); delay(300); ledOff(); delay(300); }
    return NAN;
  }

  float avg = sum / good;
  Serial.printf("Average temp: %.2f°C from %u valid readings\n", avg, good);
  return avg;
}

// ---------- DEEP SLEEP ----------
void goToDeepSleep(uint32_t seconds) {
  uint64_t us = (uint64_t)seconds * 1000000ULL;
  Serial.printf("Going to deep sleep for %u s...\n", seconds);
  Serial.flush();
  ledOff();
  ESP.deepSleep(us);
}

// ---------- SETUP ----------
void setup() {
  pinMode(LED_PIN, OUTPUT);
  ledOff();

  Serial.begin(115200);
  delay(50);
  Serial.println("\nBoot");

  client.setInsecure();
  sensors.begin();
  sensors.setResolution(12);

  if (!connectWiFi()) {
    Serial.println("WiFi connection failed.");
    blink(10, 100); // 🔴 repeated short blink = cannot connect WiFi
    goToDeepSleep(SLEEP_SECONDS);
  }

  float avgC = averageTemperatureC(SAMPLES, SAMPLE_DELAY_MS);
  if (isnan(avgC)) {
    Serial.println("Temperature read failed (NAN). Sleeping.");
    goToDeepSleep(SLEEP_SECONDS);
  }

  bool posted = postTemperature(avgC);
  if (!posted) Serial.println("Post failed.");

  goToDeepSleep(SLEEP_SECONDS);
}

void loop() {}
