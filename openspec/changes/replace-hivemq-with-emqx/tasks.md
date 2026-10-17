# Tasks

## 1. Repoint the ESP32 broker configuration

- [x] 1.1 In `esp32/gate.ino`, replace the HiveMQ host in `mqtt_server` with the EMQX Cloud Serverless hostname placeholder (e.g. `SEU_DEPLOY.emqxsl.com`), keeping `mqtt_port` at 8883. Verify by reading the file: no `hivemq` string remains and the port is 8883.
- [x] 1.2 Keep `mqtt_user` / `mqtt_password` as placeholders for the EMQX credentials and confirm the `WiFiClientSecure` + `setInsecure()` + `PubSubClient` transport block is unchanged. Verify by reading the client setup in `setup()`.
- [x] 1.3 Confirm the command topic (`casa/portao`) and status topics (`casa/portao/status`, `casa/luz/status`) are unchanged. Verify by searching the file for each topic string.

## 2. Verify the firmware still builds and behaves

- [x] 2.1 Compile `esp32/gate.ino` for the ESP32 target (Arduino IDE or `arduino-cli` if available) and confirm it builds without errors. If no toolchain is available, record that and fall back to a source-level review. (No `arduino-cli`/PlatformIO in this environment; source-level review: the only change is the `mqtt_server` string literal, which is valid C++.)
- [x] 2.2 Verify the connection logic: on flash with real EMQX credentials, the serial log reports a successful MQTT connection and subscribes to `casa/portao`. If flashing is not possible in this environment, document the manual step. (No device/toolchain here; manual step documented under Workflow follow-up.)
- [x] 2.3 Confirm no other files in the repository reference HiveMQ or were changed. Verify with a repository-wide search and `git diff --stat`. (Only `esp32/gate.ino` changed; remaining `hivemq` mentions are in this change's planning artifacts.)

## Workflow follow-up

- Manual flash/verify step (no toolchain/device in this environment): in `esp32/gate.ino`, set `ssid`/`password` and `mqtt_user`/`mqtt_password`, replace the `SEU_DEPLOY` placeholder in `mqtt_server` with the real EMQX Cloud Serverless host, then flash the ESP32. Expected serial output: `Conectado!` followed by `Inscrito no tópico: casa/portao`.
- Ensure the `leonardo-api` publisher (external repo) is reconfigured to the same EMQX instance and topics before relying on the gate end-to-end.
- Archive the change after review.
