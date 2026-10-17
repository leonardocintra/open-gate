# Design

## Context

See `proposal.md` for motivation. The firmware in `esp32/gate.ino` currently uses `WiFiClientSecure` + `PubSubClient` against a HiveMQ Cloud host on port 8883, with `setInsecure()` and placeholder credentials. The frontend and the external publisher (`leonardo-api`) are out of scope; the broker operator must be reconfigured separately to publish into the same EMQX instance and topics.

EMQX Cloud Serverless exposes a per-deployment hostname (for example `<id>.ala.<region>.emqxsl.com`) and an MQTT/TLS listener on 8883, with username/password client authentication.

## Goals / Non-Goals

**Goals:**
- Repoint the ESP32 to EMQX Cloud Serverless over MQTT/TLS on 8883.
- Keep the command/status topics and gate/light behavior identical.

**Non-Goals:**
- Changing the frontend, `leonardo-api`, or the topic contract.
- Adding new device features or restructuring the sketch.

## Decisions

- **Keep `PubSubClient` + `WiFiClientSecure`.** EMQX Cloud Serverless speaks standard MQTT over TLS on 8883; no firmware library change is needed. Alternative: switching libraries (e.g. `ESP-MQTT`) adds risk for no behavioral gain.
- **Keep `setInsecure()`.** Matches the current approach and avoids embedding a CA bundle; trade-off is no server-certificate validation (see risks). Alternative: pin the EMQX Cloud CA — safer but more code and a cert that can rotate.
- **Change only the broker host constant.** The port (8883), credentials variables, and topic strings stay; at deploy the username/password are set to the EMQX credentials. Alternative: introduce a separate `mqtt_host` config block — unnecessary churn for a single value.
- **Use the EMQX Cloud Serverless TLS hostname as a placeholder** so the deployment step is a clear single edit.

## Risks / Trade-offs

- [The device points at EMQX while the publisher still targets HiveMQ] → Broker operator migration is a deploy prerequisite; the change is only complete when both sides share the EMQX instance.
- [`setInsecure()` accepts any server certificate] → Same exposure as before; acceptable for this change, revisit with CA pinning if the threat model changes.
- [Hardcoded placeholder credentials in the sketch] → Pre-existing pattern; credentials are filled at flash time and not committed.
- [EMQX Serverless connection/throughput limits] → Single low-volume device; limits are not expected to bind.
