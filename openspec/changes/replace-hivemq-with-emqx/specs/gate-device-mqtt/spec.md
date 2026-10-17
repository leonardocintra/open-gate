# Spec Delta

## Purpose

Defines how the ESP32 gate controller connects to its MQTT broker, authenticates, subscribes to gate commands, and reports status, so the physical gate stays controllable through the broker the system currently runs.

## ADDED Requirements

### Requirement: Broker endpoint
The ESP32 firmware SHALL connect to the EMQX Cloud Serverless broker configured in `esp32/gate.ino`. The broker host MUST NOT reference a HiveMQ hostname.

#### Scenario: Connecting to EMQX
- **WHEN** the ESP32 has network connectivity and initializes the MQTT client
- **THEN** it attempts the connection against the configured EMQX Cloud Serverless endpoint

#### Scenario: No HiveMQ reference remains
- **WHEN** the firmware source is inspected
- **THEN** no HiveMQ hostname is present in the broker configuration

### Requirement: Secure transport
The ESP32 SHALL reach the broker over MQTT with TLS on port 8883.

#### Scenario: TLS port
- **WHEN** the ESP32 establishes the MQTT connection
- **THEN** it uses the TLS-enabled port 8883

### Requirement: Broker authentication
The ESP32 SHALL authenticate to the broker using the configured username and password.

#### Scenario: Authenticated session
- **WHEN** the ESP32 connects with valid credentials
- **THEN** the broker accepts the session and the client reports a connected state

#### Scenario: Rejected credentials
- **WHEN** the broker rejects the credentials
- **THEN** the ESP32 logs the failure and retries the connection after a delay

### Requirement: Gate command subscription
The ESP32 SHALL subscribe to the `casa/portao` command topic and act on the `abrir` and `fechar` commands, preserving the existing gate pulse behavior.

#### Scenario: Open command received
- **WHEN** the message `abrir` is published to `casa/portao`
- **THEN** the ESP32 pulses the gate relay and publishes the gate status

#### Scenario: Close command received
- **WHEN** the message `fechar` is published to `casa/portao`
- **THEN** the ESP32 pulses the gate relay and publishes the gate status

### Requirement: Status publication
The ESP32 SHALL publish status updates to `casa/portao/status` and `casa/luz/status` over the same broker connection.

#### Scenario: Gate actuation status
- **WHEN** the gate is actuated
- **THEN** the ESP32 publishes a status message to `casa/portao/status`

#### Scenario: Light status
- **WHEN** the light turns on or off
- **THEN** the ESP32 publishes a status message to `casa/luz/status`

### Requirement: Automatic reconnection
The ESP32 SHALL reconnect to the broker when the connection is lost, with the same endpoint, transport, credentials, and topics.

#### Scenario: Connection dropped
- **WHEN** the MQTT connection drops
- **THEN** the ESP32 retries the connection and restores the command subscription on success
