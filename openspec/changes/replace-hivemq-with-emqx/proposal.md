# Proposal

## Why

The ESP32 gate controller authenticates to a HiveMQ Cloud broker. We are moving the MQTT broker to EMQX Cloud Serverless, so the firmware in `esp32/gate.ino` must target the new broker endpoint to keep receiving gate commands. Without this change the device stays pointed at the retired HiveMQ host and the gate stops responding.

## What Changes

- Point the ESP32 MQTT client from the HiveMQ Cloud host to an EMQX Cloud Serverless endpoint.
- Keep the existing transport: MQTT over TLS on port 8883 using `WiFiClientSecure` + `PubSubClient`.
- Keep the existing topics (`casa/portao` subscribe; `casa/portao/status`, `casa/luz/status` publish), credentials placeholders, and gate/light behavior unchanged.
- No change to the Next.js frontend or to the external `leonardo-api` backend that publishes commands; both remain out of scope for this change.

## Capabilities

### New Capabilities
- `gate-device-mqtt`: The ESP32 gate controller's MQTT broker connectivity — which broker it connects to, how it authenticates, and how it consumes gate commands and publishes status.

### Modified Capabilities
<!-- None: no existing capability under openspec/specs/ today. -->

## Impact

- Code: `esp32/gate.ino` only.
- Configuration: the broker host constant (and, at deploy time, the EMQX username/password placeholders).
- External dependency: the broker operator must be reconfigured to publish to the same EMQX instance and topics. That backend (`leonardo-api`) is not part of this repository and is out of scope.
- No frontend, API route, or dependency changes.
