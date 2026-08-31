import type { SourceKey, StatusKey } from '@pqms/ui-library'
import type {
  ActivityType,
  AppNotification,
  AuditEntry,
  ClassificationNode,
  Comment,
  InvestigationActivity,
  Issue,
  IssuePriority,
  PartRequest,
  User,
} from './types'

// ---- Users (the three modeled roles + Administrator) ----
export const USERS: User[] = [
  { id: 'u-se', name: 'Arpita Chavda', role: 'SE', roleLabel: 'Service Engineer', cap: 'read', email: 'arpita.chavda@kia.com', initials: 'AC' },
  { id: 'u-asm', name: 'Park Soo-jin', role: 'ASM', roleLabel: 'After-Sales Manager', cap: 'override', email: 'soojin.park@kia.com', initials: 'PS' },
  { id: 'u-pqm', name: 'Seo-yeon Park', role: 'PQM', roleLabel: 'Product Quality Manager', cap: 'override', email: 'seoyeon.park@kia.com', initials: 'SP' },
  { id: 'u-admin', name: 'Min-jun Oh', role: 'ADMIN', roleLabel: 'Administrator', cap: 'admin', email: 'minjun.oh@kia.com', initials: 'MO' },
]

// ---- Classification taxonomy (System → Sub-system → Component → Symptom) ----
/**
 * The classification taxonomy — a faithful port of the design's `classTree()`:
 * 10 systems, 25 sub-systems, 35 components, 43 symptoms.
 *
 * WE PREVIOUSLY CARRIED FOUR SYSTEMS. Half the seed's issues were filed against
 * labels that did not exist in it, which is why classification-driven features
 * (issue-group suggestions especially) could not reach most of the data.
 *
 * ⚠️ THE DESIGN HAS A FIFTH LEVEL AND IT IS DELIBERATELY NOT PORTED. Each symptom
 * holds an array of detail strings ("12V battery depleted after >=4h park") — the
 * design's `symptomDetail`, which it computes and never renders anywhere. There is
 * no consumer to model it for.
 *
 * `issueCount` is COMPUTED from the seed rather than invented, so the numbers are
 * true of this dataset. Nothing renders it today.
 *
 * ⚠️ `SYSTEM_CODE_LIST` IS NOT THIS. That is a separate nine-entry list of QIR
 * identifier codes (AC, AU, BE, BO, CH, EE, EM, OT, PT) used by `genQirId`. It is
 * not a taxonomy and does not map onto these ten systems.
 */
export const CLASSIFICATION: ClassificationNode[] = [
  { id: 'sys-electrical-hv', level: 'system', code: 'S01', label: 'Electrical / HV', issueCount: 6 },
  { id: 'sys-electrical-hv--integrated-charging-contro', level: 'subSystem', code: 'S01-01', label: 'Integrated Charging Control Unit (ICCU)', parentId: 'sys-electrical-hv', issueCount: 3 },
  { id: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter', level: 'component', code: 'S01-01-01', label: '12V DC-DC Converter', parentId: 'sys-electrical-hv--integrated-charging-contro', issueCount: 3 },
  { id: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter--no-start-after-cold-soak', level: 'symptom', code: 'S01-01-01-01', label: 'No-start after cold soak', parentId: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter', issueCount: 0 },
  { id: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter--intermittent-12v-discharge', level: 'symptom', code: 'S01-01-01-02', label: 'Intermittent 12V discharge', parentId: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter', issueCount: 0 },
  { id: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter--12v-battery-discharge', level: 'symptom', code: 'S01-01-01-03', label: '12V battery discharge', parentId: 'sys-electrical-hv--integrated-charging-contro--12v-dc-dc-converter', issueCount: 3 },
  { id: 'sys-electrical-hv--integrated-charging-contro--onboard-charger-obc', level: 'component', code: 'S01-01-02', label: 'Onboard Charger (OBC)', parentId: 'sys-electrical-hv--integrated-charging-contro', issueCount: 0 },
  { id: 'sys-electrical-hv--integrated-charging-contro--onboard-charger-obc--ac-charging-interruption', level: 'symptom', code: 'S01-01-02-01', label: 'AC charging interruption', parentId: 'sys-electrical-hv--integrated-charging-contro--onboard-charger-obc', issueCount: 0 },
  { id: 'sys-electrical-hv--integrated-charging-contro--onboard-charger-obc--charge-port-no-communicati', level: 'symptom', code: 'S01-01-02-02', label: 'Charge port no communication', parentId: 'sys-electrical-hv--integrated-charging-contro--onboard-charger-obc', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery', level: 'subSystem', code: 'S01-02', label: 'High Voltage Battery', parentId: 'sys-electrical-hv', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery--cell-module', level: 'component', code: 'S01-02-01', label: 'Cell Module', parentId: 'sys-electrical-hv--high-voltage-battery', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery--cell-module--thermal-early-warning-trip', level: 'symptom', code: 'S01-02-01-01', label: 'Thermal early-warning trip', parentId: 'sys-electrical-hv--high-voltage-battery--cell-module', issueCount: 1 },
  { id: 'sys-electrical-hv--high-voltage-battery--cell-module--rapid-soc-drop', level: 'symptom', code: 'S01-02-01-02', label: 'Rapid SOC drop', parentId: 'sys-electrical-hv--high-voltage-battery--cell-module', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery--bms-control-module', level: 'component', code: 'S01-02-02', label: 'BMS Control Module', parentId: 'sys-electrical-hv--high-voltage-battery', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery--bms-control-module--cell-imbalance-fault', level: 'symptom', code: 'S01-02-02-01', label: 'Cell imbalance fault', parentId: 'sys-electrical-hv--high-voltage-battery--bms-control-module', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery--bms-control-module--hv-isolation-fault', level: 'symptom', code: 'S01-02-02-02', label: 'HV isolation fault', parentId: 'sys-electrical-hv--high-voltage-battery--bms-control-module', issueCount: 0 },
  { id: 'sys-electrical-hv--high-voltage-battery-syste', level: 'subSystem', code: 'S01-03', label: 'High-Voltage Battery System', parentId: 'sys-electrical-hv', issueCount: 1 },
  { id: 'sys-electrical-hv--high-voltage-battery-syste--cell-module', level: 'component', code: 'S01-03-01', label: 'Cell Module', parentId: 'sys-electrical-hv--high-voltage-battery-syste', issueCount: 1 },
  { id: 'sys-electrical-hv--high-voltage-battery-syste--cell-module--thermal-early-warning-trip', level: 'symptom', code: 'S01-03-01-01', label: 'Thermal early-warning trip', parentId: 'sys-electrical-hv--high-voltage-battery-syste--cell-module', issueCount: 1 },
  { id: 'sys-steering', level: 'system', code: 'S02', label: 'Steering', issueCount: 5 },
  { id: 'sys-steering--steering-column', level: 'subSystem', code: 'S02-01', label: 'Steering Column', parentId: 'sys-steering', issueCount: 1 },
  { id: 'sys-steering--steering-column--intermediate-shaft', level: 'component', code: 'S02-01-01', label: 'Intermediate Shaft', parentId: 'sys-steering--steering-column', issueCount: 1 },
  { id: 'sys-steering--steering-column--intermediate-shaft--free-play-knock', level: 'symptom', code: 'S02-01-01-01', label: 'Free play / knock', parentId: 'sys-steering--steering-column--intermediate-shaft', issueCount: 1 },
  { id: 'sys-steering--rack', level: 'subSystem', code: 'S02-02', label: 'Rack', parentId: 'sys-steering', issueCount: 4 },
  { id: 'sys-steering--rack--rack-housing', level: 'component', code: 'S02-02-01', label: 'Rack Housing', parentId: 'sys-steering--rack', issueCount: 0 },
  { id: 'sys-steering--rack--rack-housing--steering-noise', level: 'symptom', code: 'S02-02-01-01', label: 'Steering noise', parentId: 'sys-steering--rack--rack-housing', issueCount: 0 },
  { id: 'sys-powertrain', level: 'system', code: 'S03', label: 'Powertrain', issueCount: 4 },
  { id: 'sys-powertrain--automatic-transmission', level: 'subSystem', code: 'S03-01', label: 'Automatic Transmission', parentId: 'sys-powertrain', issueCount: 0 },
  { id: 'sys-powertrain--automatic-transmission--valve-body', level: 'component', code: 'S03-01-01', label: 'Valve Body', parentId: 'sys-powertrain--automatic-transmission', issueCount: 0 },
  { id: 'sys-powertrain--automatic-transmission--valve-body--cold-start-shift-slip', level: 'symptom', code: 'S03-01-01-01', label: 'Cold-start shift slip', parentId: 'sys-powertrain--automatic-transmission--valve-body', issueCount: 1 },
  { id: 'sys-powertrain--automatic-transmission--valve-body--harsh-downshift', level: 'symptom', code: 'S03-01-01-02', label: 'Harsh downshift', parentId: 'sys-powertrain--automatic-transmission--valve-body', issueCount: 0 },
  { id: 'sys-powertrain--automatic-transmission--torque-converter', level: 'component', code: 'S03-01-02', label: 'Torque Converter', parentId: 'sys-powertrain--automatic-transmission', issueCount: 0 },
  { id: 'sys-powertrain--automatic-transmission--torque-converter--lock-up-shudder', level: 'symptom', code: 'S03-01-02-01', label: 'Lock-up shudder', parentId: 'sys-powertrain--automatic-transmission--torque-converter', issueCount: 0 },
  { id: 'sys-powertrain--2-5t-gasoline-engine', level: 'subSystem', code: 'S03-02', label: '2.5T Gasoline Engine', parentId: 'sys-powertrain', issueCount: 0 },
  { id: 'sys-powertrain--2-5t-gasoline-engine--turbocharger', level: 'component', code: 'S03-02-01', label: 'Turbocharger', parentId: 'sys-powertrain--2-5t-gasoline-engine', issueCount: 0 },
  { id: 'sys-powertrain--2-5t-gasoline-engine--turbocharger--performance-degradation', level: 'symptom', code: 'S03-02-01-01', label: 'Performance degradation', parentId: 'sys-powertrain--2-5t-gasoline-engine--turbocharger', issueCount: 1 },
  { id: 'sys-powertrain--2-5t-gasoline-engine--fuel-system', level: 'component', code: 'S03-02-02', label: 'Fuel System', parentId: 'sys-powertrain--2-5t-gasoline-engine', issueCount: 0 },
  { id: 'sys-powertrain--2-5t-gasoline-engine--fuel-system--cold-start-rough-idle', level: 'symptom', code: 'S03-02-02-01', label: 'Cold-start rough idle', parentId: 'sys-powertrain--2-5t-gasoline-engine--fuel-system', issueCount: 0 },
  { id: 'sys-powertrain--6-speed-automatic-transmis', level: 'subSystem', code: 'S03-03', label: '6-Speed Automatic Transmission', parentId: 'sys-powertrain', issueCount: 1 },
  { id: 'sys-powertrain--6-speed-automatic-transmis--valve-body', level: 'component', code: 'S03-03-01', label: 'Valve Body', parentId: 'sys-powertrain--6-speed-automatic-transmis', issueCount: 1 },
  { id: 'sys-powertrain--6-speed-automatic-transmis--valve-body--cold-start-shift-slip', level: 'symptom', code: 'S03-03-01-01', label: 'Cold-start shift slip', parentId: 'sys-powertrain--6-speed-automatic-transmis--valve-body', issueCount: 1 },
  { id: 'sys-powertrain--8-speed-automatic-transmis', level: 'subSystem', code: 'S03-04', label: '8-Speed Automatic Transmission', parentId: 'sys-powertrain', issueCount: 1 },
  { id: 'sys-powertrain--8-speed-automatic-transmis--valve-body-solenoid', level: 'component', code: 'S03-04-01', label: 'Valve-Body Solenoid', parentId: 'sys-powertrain--8-speed-automatic-transmis', issueCount: 1 },
  { id: 'sys-powertrain--8-speed-automatic-transmis--valve-body-solenoid--transmission-failure', level: 'symptom', code: 'S03-04-01-01', label: 'Transmission failure', parentId: 'sys-powertrain--8-speed-automatic-transmis--valve-body-solenoid', issueCount: 1 },
  { id: 'sys-powertrain--2-5-l-turbo-engine', level: 'subSystem', code: 'S03-05', label: '2.5 L Turbo Engine', parentId: 'sys-powertrain', issueCount: 1 },
  { id: 'sys-powertrain--2-5-l-turbo-engine--turbocharger', level: 'component', code: 'S03-05-01', label: 'Turbocharger', parentId: 'sys-powertrain--2-5-l-turbo-engine', issueCount: 1 },
  { id: 'sys-powertrain--2-5-l-turbo-engine--turbocharger--performance-degradation', level: 'symptom', code: 'S03-05-01-01', label: 'Performance degradation', parentId: 'sys-powertrain--2-5-l-turbo-engine--turbocharger', issueCount: 1 },
  { id: 'sys-engine', level: 'system', code: 'S04', label: 'Engine', issueCount: 4 },
  { id: 'sys-engine--fuel-system', level: 'subSystem', code: 'S04-01', label: 'Fuel System', parentId: 'sys-engine', issueCount: 4 },
  { id: 'sys-engine--fuel-system--fuel-injector', level: 'component', code: 'S04-01-01', label: 'Fuel Injector', parentId: 'sys-engine--fuel-system', issueCount: 0 },
  { id: 'sys-engine--fuel-system--fuel-injector--engine-vibration', level: 'symptom', code: 'S04-01-01-01', label: 'Engine vibration', parentId: 'sys-engine--fuel-system--fuel-injector', issueCount: 4 },
  { id: 'sys-cooling-hv-pack', level: 'system', code: 'S05', label: 'Cooling / HV Pack', issueCount: 1 },
  { id: 'sys-cooling-hv-pack--coolant-circuit', level: 'subSystem', code: 'S05-01', label: 'Coolant Circuit', parentId: 'sys-cooling-hv-pack', issueCount: 0 },
  { id: 'sys-cooling-hv-pack--coolant-circuit--coolant-hose', level: 'component', code: 'S05-01-01', label: 'Coolant Hose', parentId: 'sys-cooling-hv-pack--coolant-circuit', issueCount: 0 },
  { id: 'sys-cooling-hv-pack--coolant-circuit--coolant-hose--coolant-seepage', level: 'symptom', code: 'S05-01-01-01', label: 'Coolant seepage', parentId: 'sys-cooling-hv-pack--coolant-circuit--coolant-hose', issueCount: 1 },
  { id: 'sys-cooling-hv-pack--coolant-circuit--coolant-hose--hose-cracking', level: 'symptom', code: 'S05-01-01-02', label: 'Hose cracking', parentId: 'sys-cooling-hv-pack--coolant-circuit--coolant-hose', issueCount: 0 },
  { id: 'sys-cooling-hv-pack--coolant-circuit--coolant-pump', level: 'component', code: 'S05-01-02', label: 'Coolant Pump', parentId: 'sys-cooling-hv-pack--coolant-circuit', issueCount: 0 },
  { id: 'sys-cooling-hv-pack--coolant-circuit--coolant-pump--pump-noise', level: 'symptom', code: 'S05-01-02-01', label: 'Pump noise', parentId: 'sys-cooling-hv-pack--coolant-circuit--coolant-pump', issueCount: 0 },
  { id: 'sys-cooling-hv-pack--hv-pack-coolant-circuit', level: 'subSystem', code: 'S05-02', label: 'HV Pack Coolant Circuit', parentId: 'sys-cooling-hv-pack', issueCount: 1 },
  { id: 'sys-cooling-hv-pack--hv-pack-coolant-circuit--coolant-hose', level: 'component', code: 'S05-02-01', label: 'Coolant Hose', parentId: 'sys-cooling-hv-pack--hv-pack-coolant-circuit', issueCount: 1 },
  { id: 'sys-cooling-hv-pack--hv-pack-coolant-circuit--coolant-hose--coolant-seepage', level: 'symptom', code: 'S05-02-01-01', label: 'Coolant seepage', parentId: 'sys-cooling-hv-pack--hv-pack-coolant-circuit--coolant-hose', issueCount: 1 },
  { id: 'sys-brakes', level: 'system', code: 'S06', label: 'Brakes', issueCount: 3 },
  { id: 'sys-brakes--regenerative-brake-system', level: 'subSystem', code: 'S06-01', label: 'Regenerative Brake System', parentId: 'sys-brakes', issueCount: 1 },
  { id: 'sys-brakes--regenerative-brake-system--regen-blend-module', level: 'component', code: 'S06-01-01', label: 'Regen Blend Module', parentId: 'sys-brakes--regenerative-brake-system', issueCount: 0 },
  { id: 'sys-brakes--regenerative-brake-system--regen-blend-module--brake-squeal-on-regen-blen', level: 'symptom', code: 'S06-01-01-01', label: 'Brake squeal on regen blend', parentId: 'sys-brakes--regenerative-brake-system--regen-blend-module', issueCount: 0 },
  { id: 'sys-brakes--regenerative-brake-system--caliper', level: 'component', code: 'S06-01-02', label: 'Caliper', parentId: 'sys-brakes--regenerative-brake-system', issueCount: 0 },
  { id: 'sys-brakes--regenerative-brake-system--caliper--caliper-drag', level: 'symptom', code: 'S06-01-02-01', label: 'Caliper drag', parentId: 'sys-brakes--regenerative-brake-system--caliper', issueCount: 0 },
  { id: 'sys-brakes--regenerative-brake-system--blend-control-module', level: 'component', code: 'S06-01-03', label: 'Blend Control Module', parentId: 'sys-brakes--regenerative-brake-system', issueCount: 1 },
  { id: 'sys-brakes--regenerative-brake-system--blend-control-module--brake-squeal', level: 'symptom', code: 'S06-01-03-01', label: 'Brake squeal', parentId: 'sys-brakes--regenerative-brake-system--blend-control-module', issueCount: 1 },
  { id: 'sys-brakes--front-brake', level: 'subSystem', code: 'S06-02', label: 'Front Brake', parentId: 'sys-brakes', issueCount: 1 },
  { id: 'sys-brakes--front-brake--caliper-bracket', level: 'component', code: 'S06-02-01', label: 'Caliper Bracket', parentId: 'sys-brakes--front-brake', issueCount: 1 },
  { id: 'sys-brakes--front-brake--caliper-bracket--fastener-under-torque', level: 'symptom', code: 'S06-02-01-01', label: 'Fastener under-torque', parentId: 'sys-brakes--front-brake--caliper-bracket', issueCount: 1 },
  { id: 'sys-body-closures', level: 'system', code: 'S07', label: 'Body / Closures', issueCount: 4 },
  { id: 'sys-body-closures--door-system', level: 'subSystem', code: 'S07-01', label: 'Door System', parentId: 'sys-body-closures', issueCount: 0 },
  { id: 'sys-body-closures--door-system--door-latch', level: 'component', code: 'S07-01-01', label: 'Door Latch', parentId: 'sys-body-closures--door-system', issueCount: 0 },
  { id: 'sys-body-closures--door-system--door-latch--latch-stiffness-in-sub-zer', level: 'symptom', code: 'S07-01-01-01', label: 'Latch stiffness in sub-zero', parentId: 'sys-body-closures--door-system--door-latch', issueCount: 0 },
  { id: 'sys-body-closures--sunroof-assembly', level: 'subSystem', code: 'S07-02', label: 'Sunroof Assembly', parentId: 'sys-body-closures', issueCount: 1 },
  { id: 'sys-body-closures--sunroof-assembly--drain-channel', level: 'component', code: 'S07-02-01', label: 'Drain Channel', parentId: 'sys-body-closures--sunroof-assembly', issueCount: 0 },
  { id: 'sys-body-closures--sunroof-assembly--drain-channel--sunroof-drain-clog', level: 'symptom', code: 'S07-02-01-01', label: 'Sunroof drain clog', parentId: 'sys-body-closures--sunroof-assembly--drain-channel', issueCount: 0 },
  { id: 'sys-body-closures--sunroof-assembly--drain-tube', level: 'component', code: 'S07-02-02', label: 'Drain Tube', parentId: 'sys-body-closures--sunroof-assembly', issueCount: 1 },
  { id: 'sys-body-closures--sunroof-assembly--drain-tube--water-ingress', level: 'symptom', code: 'S07-02-02-01', label: 'Water ingress', parentId: 'sys-body-closures--sunroof-assembly--drain-tube', issueCount: 1 },
  { id: 'sys-body-closures--door-latch-assembly', level: 'subSystem', code: 'S07-03', label: 'Door Latch Assembly', parentId: 'sys-body-closures', issueCount: 1 },
  { id: 'sys-body-closures--door-latch-assembly--latch-actuator', level: 'component', code: 'S07-03-01', label: 'Latch Actuator', parentId: 'sys-body-closures--door-latch-assembly', issueCount: 1 },
  { id: 'sys-body-closures--door-latch-assembly--latch-actuator--latch-stiffness', level: 'symptom', code: 'S07-03-01-01', label: 'Latch stiffness', parentId: 'sys-body-closures--door-latch-assembly--latch-actuator', issueCount: 1 },
  { id: 'sys-body-closures--wiper-system', level: 'subSystem', code: 'S07-04', label: 'Wiper System', parentId: 'sys-body-closures', issueCount: 1 },
  { id: 'sys-body-closures--wiper-system--wiper-blade', level: 'component', code: 'S07-04-01', label: 'Wiper Blade', parentId: 'sys-body-closures--wiper-system', issueCount: 1 },
  { id: 'sys-body-closures--wiper-system--wiper-blade--streaking', level: 'symptom', code: 'S07-04-01-01', label: 'Streaking', parentId: 'sys-body-closures--wiper-system--wiper-blade', issueCount: 1 },
  { id: 'sys-infotainment', level: 'system', code: 'S08', label: 'Infotainment', issueCount: 3 },
  { id: 'sys-infotainment--head-unit', level: 'subSystem', code: 'S08-01', label: 'Head Unit', parentId: 'sys-infotainment', issueCount: 2 },
  { id: 'sys-infotainment--head-unit--main-display-module', level: 'component', code: 'S08-01-01', label: 'Main Display Module', parentId: 'sys-infotainment--head-unit', issueCount: 2 },
  { id: 'sys-infotainment--head-unit--main-display-module--system-reboot-on-carplay-c', level: 'symptom', code: 'S08-01-01-01', label: 'System reboot on CarPlay connect', parentId: 'sys-infotainment--head-unit--main-display-module', issueCount: 0 },
  { id: 'sys-infotainment--head-unit--main-display-module--system-reboot', level: 'symptom', code: 'S08-01-01-02', label: 'System reboot', parentId: 'sys-infotainment--head-unit--main-display-module', issueCount: 2 },
  { id: 'sys-infotainment--head-unit--connectivity-module', level: 'component', code: 'S08-01-02', label: 'Connectivity Module', parentId: 'sys-infotainment--head-unit', issueCount: 0 },
  { id: 'sys-infotainment--head-unit--connectivity-module--lost-communication', level: 'symptom', code: 'S08-01-02-01', label: 'Lost communication', parentId: 'sys-infotainment--head-unit--connectivity-module', issueCount: 0 },
  { id: 'sys-hvac', level: 'system', code: 'S09', label: 'HVAC', issueCount: 2 },
  { id: 'sys-hvac--blower-system', level: 'subSystem', code: 'S09-01', label: 'Blower System', parentId: 'sys-hvac', issueCount: 0 },
  { id: 'sys-hvac--blower-system--blower-motor', level: 'component', code: 'S09-01-01', label: 'Blower Motor', parentId: 'sys-hvac--blower-system', issueCount: 0 },
  { id: 'sys-hvac--blower-system--blower-motor--fan-noise-above-2k-rpm', level: 'symptom', code: 'S09-01-01-01', label: 'Fan noise above 2k RPM', parentId: 'sys-hvac--blower-system--blower-motor', issueCount: 0 },
  { id: 'sys-hvac--blower-assembly', level: 'subSystem', code: 'S09-02', label: 'Blower Assembly', parentId: 'sys-hvac', issueCount: 1 },
  { id: 'sys-hvac--blower-assembly--blower-motor', level: 'component', code: 'S09-02-01', label: 'Blower Motor', parentId: 'sys-hvac--blower-assembly', issueCount: 1 },
  { id: 'sys-hvac--blower-assembly--blower-motor--bearing-noise', level: 'symptom', code: 'S09-02-01-01', label: 'Bearing noise', parentId: 'sys-hvac--blower-assembly--blower-motor', issueCount: 1 },
  { id: 'sys-chassis-suspension', level: 'system', code: 'S10', label: 'Chassis / Suspension', issueCount: 3 },
  { id: 'sys-chassis-suspension--front-suspension', level: 'subSystem', code: 'S10-01', label: 'Front Suspension', parentId: 'sys-chassis-suspension', issueCount: 2 },
  { id: 'sys-chassis-suspension--front-suspension--front-strut', level: 'component', code: 'S10-01-01', label: 'Front Strut', parentId: 'sys-chassis-suspension--front-suspension', issueCount: 0 },
  { id: 'sys-chassis-suspension--front-suspension--front-strut--creak-on-articulation', level: 'symptom', code: 'S10-01-01-01', label: 'Creak on articulation', parentId: 'sys-chassis-suspension--front-suspension--front-strut', issueCount: 0 },
  { id: 'sys-chassis-suspension--front-suspension--strut-assembly', level: 'component', code: 'S10-01-02', label: 'Strut Assembly', parentId: 'sys-chassis-suspension--front-suspension', issueCount: 2 },
  { id: 'sys-chassis-suspension--front-suspension--strut-assembly--creak', level: 'symptom', code: 'S10-01-02-01', label: 'Creak', parentId: 'sys-chassis-suspension--front-suspension--strut-assembly', issueCount: 2 },
  { id: 'sys-chassis-suspension--tpms', level: 'subSystem', code: 'S10-02', label: 'TPMS', parentId: 'sys-chassis-suspension', issueCount: 0 },
  { id: 'sys-chassis-suspension--tpms--pressure-sensor', level: 'component', code: 'S10-02-01', label: 'Pressure Sensor', parentId: 'sys-chassis-suspension--tpms', issueCount: 0 },
  { id: 'sys-chassis-suspension--tpms--pressure-sensor--false-low-pressure-alert', level: 'symptom', code: 'S10-02-01-01', label: 'False low-pressure alert', parentId: 'sys-chassis-suspension--tpms--pressure-sensor', issueCount: 0 },
  { id: 'sys-chassis-suspension--tire-pressure-monitoring', level: 'subSystem', code: 'S10-03', label: 'Tire Pressure Monitoring', parentId: 'sys-chassis-suspension', issueCount: 1 },
  { id: 'sys-chassis-suspension--tire-pressure-monitoring--tpms-sensor', level: 'component', code: 'S10-03-01', label: 'TPMS Sensor', parentId: 'sys-chassis-suspension--tire-pressure-monitoring', issueCount: 1 },
  { id: 'sys-chassis-suspension--tire-pressure-monitoring--tpms-sensor--false-alert', level: 'symptom', code: 'S10-03-01-01', label: 'False alert', parentId: 'sys-chassis-suspension--tire-pressure-monitoring--tpms-sensor', issueCount: 1 },
]


// ---- Issues — sourced from the V4-V5 export's own application logic ----
// (frontend/scripts/extract-dc-source.mjs's successor: the real seedIssues() → _seedIssuesNorm()
// → ovClassify() pipeline was evaluated directly against the .dc.html source so every id, title,
// model/year, owner/assignee, raw status and system/sub-system/component/symptom below is the
// author's own literal value, not an inferred or DOM-scraped approximation. Statuses are the raw
// prototype keys verbatim — topissue (Top Issue) and outofscope (NASO) included, per the 2026-08-23
// directive to match the prototype's status vocabulary everywhere.)

// Model → Model Code, verbatim from the export's MODEL_CODE map ("Values drawn only from
// MC_MASTER (the New Issue > Model Code dropdown) — no invented codes"). The list's Model Code
// column shows these literal codes (or "N Models"), never the model name.
const MODEL_CODE: Record<string, string> = {
  'EV6': 'CV', 'EV9': 'SV', 'Tucson': 'BD', 'Sportage': 'NQ', 'Sorento': 'VG', 'Carnival': 'KA',
  'K5': 'DL', 'K9': 'KH', 'Seltos': 'GH', 'Telluride': 'LQ', 'Ioniq 5': 'YD', 'Ioniq5': 'YD',
  'Niro': 'TD', 'Soul': 'HM', 'Elantra': 'CK', 'Sonata': 'VG', 'Palisade': 'KA', 'Santa Fe': 'BD',
  'Stinger': 'CK',
}

interface Row {
  id: string
  title: string
  description?: string
  source: SourceKey
  /** Additional origin channels beyond `source` — omit for single-source issues. */
  sources?: SourceKey[]
  status: StatusKey
  model: string
  /** All affected codes in MC_MASTER order (the export's ISSUE_MULTI rows) — omit for single-model issues. */
  modelCodes?: string[]
  modelYear: number
  system: string
  subSystem: string
  component: string
  symptom: string
  owner: string
  ownerRole: string
  assignee?: string
  assigneeRole?: string
  date: string // YYYY-MM-DD (reportedDate)
  dtcCodes?: string[]
  linkedIssueIds?: string[]
  /** Issue-group key = the parent's own id. See `Issue['groupId']`. */
  groupId?: string
  isEws?: boolean
  extra?: Partial<Issue>
}

function mk(r: Row): Issue {
  const code = MODEL_CODE[r.model]
  if (!code) throw new Error(`seed: model "${r.model}" (${r.id}) has no MODEL_CODE mapping`)
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? `${r.title}. Under ${r.status === 'review' ? 'active investigation' : 'assessment'} via the ${r.source} channel.`,
    source: r.source,
    sources: r.sources,
    status: r.status,
    model: r.model,
    modelCode: r.modelCodes?.[0] ?? code,
    modelCodes: r.modelCodes,
    modelYear: r.modelYear,
    system: r.system,
    subSystem: r.subSystem,
    component: r.component,
    symptom: r.symptom,
    owner: r.owner,
    ownerRole: r.ownerRole,
    assignee: r.assignee || undefined,
    assigneeRole: r.assigneeRole || undefined,
    dtcCodes: r.dtcCodes,
    linkedIssueIds: r.linkedIssueIds,
    groupId: r.groupId,
    isEws: r.isEws,
    reportedDate: r.date,
    createdAt: `${r.date}T09:00:00Z`,
    updatedAt: `${r.date}T09:00:00Z`,
    ...r.extra,
  }
}

export const ISSUES: Issue[] = [
  mk({ id: 'EE-260001', title: 'Intermittent ICCU fault triggering 12V battery discharge on EV6 GT-Line', source: 'warranty', status: 'review', model: 'EV6', modelCodes: ['CV', 'SV'], modelYear: 2024, system: 'Electrical / HV', subSystem: 'Integrated Charging Control Unit (ICCU)', component: '12V DC-DC Converter', symptom: '12V battery discharge', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-06-11', linkedIssueIds: ['EE-260019', 'EE-260020', 'EE-260021', 'CL-260023', 'CL-260022'] }),
  mk({ id: 'ST-260002', title: 'Steering column recall scope', description: 'Steering column tilt-lock bolt found under-torqued on a sample of early-build units, allowing column play under load. Scope assessment underway to confirm affected VIN range ahead of a recall decision.', source: 'fpqr', status: 'topissue', model: 'Tucson', modelCodes: ['VG', 'BD', 'NQ'], modelYear: 2026, system: 'Steering', subSystem: 'Steering Column', component: 'Intermediate Shaft', symptom: 'Free play / knock', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Park Soo-jin', assigneeRole: 'ASM', date: '2026-06-17' }),
  mk({ id: 'CL-260003', title: 'EWS alert — coolant hose cracking, EV pack', description: 'EWS flagged an early-warning pattern of coolant hose cracking at the HV battery pack connection point, with several units showing visible coolant seepage. Escalated given the safety implications of coolant loss near the HV pack.', source: 'ews', status: 'escalated', model: 'EV6', modelCodes: ['CV', 'SV'], modelYear: 2024, system: 'Cooling / HV Pack', subSystem: 'HV Pack Coolant Circuit', component: 'Coolant Hose', symptom: 'Coolant seepage', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Seo-yeon Park', assigneeRole: 'PQM', date: '2026-06-16', isEws: true, linkedIssueIds: ['CL-260022', 'CL-260023', 'CL-260029'] }),
  mk({ id: 'AC-260004', title: 'HVAC fan noise above 2k RPM blower speed', description: 'Techline reports a whining blower noise once fan speed exceeds roughly 2,000 RPM. Noise is repeatable on affected units and is being traced to blower-motor bearing wear.', source: 'techline', status: 'review', model: 'Sorento', modelCodes: ['VG', 'KA'], modelYear: 2026, system: 'HVAC', subSystem: 'Blower Assembly', component: 'Blower Motor', symptom: 'Bearing noise', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-06-03' }),
  mk({ id: 'PT-260005', title: '6AT slip at cold start, intermittent', description: 'Intermittent slip felt during the first shift after a cold start, most pronounced below 0°C ambient. Comeback pattern points to valve-body fluid pressure lag during warm-up.', source: 'comeback', status: 'review', model: 'K5', modelCodes: ['KH', 'DL'], modelYear: 2025, system: 'Powertrain', subSystem: '6-Speed Automatic Transmission', component: 'Valve Body', symptom: 'Cold-start shift slip', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Park Soo-jin', assigneeRole: 'ASM', date: '2026-06-15', linkedIssueIds: ['PT-260026'] }),
  mk({ id: 'BD-260006', title: 'Door latch stiffness in sub-zero conditions', description: 'Customers report the driver door latch requiring excessive force to close in sub-zero temperatures. Grease specification on the latch mechanism is suspected to stiffen at low temperature.', source: 'warranty', status: 'open', model: 'Sportage', modelCodes: ['GH', 'NQ'], modelYear: 2025, system: 'Body / Closures', subSystem: 'Door Latch Assembly', component: 'Latch Actuator', symptom: 'Latch stiffness', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-05-19', linkedIssueIds: ['BD-260027'] }),
  mk({ id: 'SU-260007', title: 'Front strut creak on low-speed articulation', description: 'Weibull analysis of warranty claims shows a rising creak complaint at the front strut during low-speed articulation, such as parking-lot maneuvers. Suspected strut-mount bushing wear.', source: 'weibull', status: 'review', model: 'Telluride', modelYear: 2025, system: 'Chassis / Suspension', subSystem: 'Front Suspension', component: 'Strut Assembly', symptom: 'Creak', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-06-18' }),
  mk({ id: 'IN-260008', title: 'Infotainment reboot when CarPlay connects', description: 'Head unit reboots within seconds of a phone connecting via CarPlay on a subset of units. A software update addressing a Bluetooth-handshake timing issue has been deployed and is being monitored for effectiveness.', source: 'techline', sources: ['techline', 'warranty'], status: 'monitoring', model: 'Ioniq 5', modelYear: 2026, system: 'Infotainment', subSystem: 'Head Unit', component: 'Main Display Module', symptom: 'System reboot', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-06-10', linkedIssueIds: ['IN-260024', 'IN-260025'], extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-09-10' } }),
  mk({ id: 'BR-260009', title: 'Brake squeal on HV regenerative blend', description: 'Field reports describe a brief squeal as the system blends from regenerative to friction braking near stop. Pad material and blend-transition calibration are both under review.', source: 'fpqr', status: 'review', model: 'EV9', modelCodes: ['CV', 'SV'], modelYear: 2026, system: 'Brakes', subSystem: 'Regenerative Brake System', component: 'Blend Control Module', symptom: 'Brake squeal', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-05-28', linkedIssueIds: ['BR-260028'] }),
  mk({ id: 'CH-260010', title: 'Tire pressure sensor false low-pressure alert', description: 'TPMS occasionally flags a false low-pressure warning despite tire pressure being within spec, most often after a rapid ambient-temperature drop. Sensor calibration threshold is under review.', source: 'comeback', status: 'monitoring', model: 'Carnival', modelYear: 2026, system: 'Chassis / Suspension', subSystem: 'Tire Pressure Monitoring', component: 'TPMS Sensor', symptom: 'False alert', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-05-02', extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-09-01' } }),
  mk({ id: 'BD-260011', title: 'Sunroof drain clog causing headliner stain', description: 'A blocked sunroof drain channel has led to water backing up and staining the headliner on a small number of units. Drain routing and debris ingress are being reviewed.', source: 'warranty', status: 'open', model: 'K9', modelYear: 2025, system: 'Body / Closures', subSystem: 'Sunroof Assembly', component: 'Drain Tube', symptom: 'Water ingress', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-06-18' }),
  mk({ id: 'BD-260012', title: 'Wiper blade streak in heavy rain', description: 'GQIS reports intermittent streaking from the driver-side wiper blade during heavy rain. Isolated to a specific blade supplier lot; monitored as a trend rather than an active investigation.', source: 'gqis', status: 'outofscope', model: 'Sorento', modelCodes: ['VG', 'NQ'], modelYear: 2025, system: 'Body / Closures', subSystem: 'Wiper System', component: 'Wiper Blade', symptom: 'Streaking', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-04-15', extra: { dispositionOutcome: 'No Action', closedAt: '2026-05-02T10:00:00Z' } }),
  // ---- Parent/child cohort demo (grouped by shared symptom in the source) ----
  mk({ id: 'EE-260023', title: 'Engine vibration during idle', description: 'Customers report a noticeable vibration through the cabin while the engine idles, most apparent at stoplights. Engine mount stiffness and idle-speed calibration are both being examined.', source: 'warranty', status: 'review', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel Injector', symptom: 'Engine vibration', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-07-10', groupId: 'EE-260023' }),
  mk({ id: 'EE-260031', title: 'Engine vibration after warm-up', description: 'Vibration complaint similar to EE-260023 but reported specifically once the engine reaches operating temperature. Grouped with the related idle-vibration cohort for a shared root-cause review.', source: 'warranty', status: 'review', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel Injector', symptom: 'Engine vibration', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-07-14', groupId: 'EE-260023' }),
  mk({ id: 'EE-260044', title: 'Engine vibration during acceleration', description: 'Vibration reported under moderate acceleration rather than at idle. Part of the same engine-vibration cohort; under investigation alongside the idle and warm-up variants.', source: 'warranty', status: 'open', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel Injector', symptom: 'Engine vibration', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-07-19', groupId: 'EE-260023' }),
  mk({ id: 'EE-260071', title: 'Dealer-reported engine vibration', description: 'Dealer service department flagged a customer vehicle exhibiting the same engine vibration pattern seen in the linked cohort. Inspection requested to confirm mount condition.', source: 'warranty', status: 'open', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel Injector', symptom: 'Engine vibration', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-07-28', groupId: 'EE-260023' }),
  mk({ id: 'EE-260100', title: 'Steering rack noise on lock-to-lock turns', description: 'A clicking noise from the steering rack is reported during full lock-to-lock turns, such as parking maneuvers. Rack-bushing clearance is suspected.', source: 'warranty', status: 'review', model: 'Telluride', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack Housing', symptom: 'Steering noise', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-07-05', groupId: 'EE-260100' }),
  mk({ id: 'EE-260105', title: 'Steering noise on parking maneuvers', description: 'Related steering-rack noise complaint reported specifically during low-speed parking maneuvers. Grouped with the lock-to-lock noise cohort for shared investigation.', source: 'warranty', status: 'review', model: 'Telluride', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack Housing', symptom: 'Steering noise', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-07-12', groupId: 'EE-260100' }),
  mk({ id: 'EE-260112', title: 'Dealer-reported steering rack noise', description: 'Dealer-reported instance of the steering rack noise seen across this cohort. Awaiting dealer inspection findings.', source: 'warranty', status: 'open', model: 'Telluride', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack Housing', symptom: 'Steering noise', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-07-21', groupId: 'EE-260100' }),
  mk({ id: 'EE-260090', title: 'Steering noise', description: 'Customer describes an intermittent steering noise; details are limited pending a more thorough dealer inspection.', source: 'warranty', status: 'open', model: 'Tucson', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack Housing', symptom: 'Steering noise', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-07-28' }),
  mk({ id: 'EE-260118', title: 'Head unit reboots when CarPlay connects', description: 'The centre display restarts as a phone completes its CarPlay handshake, returning to the home screen after roughly twenty seconds. Display-module firmware and USB power delivery are both being examined.', source: 'techline', status: 'monitoring', model: 'Sportage', modelYear: 2026, system: 'Infotainment', subSystem: 'Head Unit', component: 'Main Display Module', symptom: 'System reboot on CarPlay connect', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-08-02', extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-09-02' } }),
  // ---- Lifecycle demo rows (Recently Accessed) ----
  mk({ id: 'EE-260013', title: 'HV battery thermal early-warning trip', description: 'EWS triggered an early-warning thermal trip on the HV battery pack during DC fast charging. Cell-module temperature sensors show a localized rise that clears once charging stops; escalated pending root-cause review.', source: 'ews', status: 'escalated', model: 'EV9', modelYear: 2026, system: 'Electrical / HV', subSystem: 'High-Voltage Battery System', component: 'Cell Module', symptom: 'Thermal early-warning trip', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Seo-yeon Park', assigneeRole: 'PQM', date: '2026-07-09', isEws: true, linkedIssueIds: ['EE-260019', 'EE-260021'] }),
  mk({ id: 'PT-260014', title: 'Engine performance degradation', description: 'Techline case describes a gradual loss of engine performance accompanied by stored diagnostic codes P0301, P0420 and C1234. Awaiting engineer assignment before investigation begins.', source: 'techline', status: 'review', model: 'Sorento', modelYear: 2025, system: 'Powertrain', subSystem: '2.5 L Turbo Engine', component: 'Turbocharger', symptom: 'Performance degradation', owner: 'Arpita Chavda', ownerRole: 'SE', date: '2026-07-09', dtcCodes: ['P0301', 'P0420', 'C1234'] }),
  mk({ id: 'PT-260015', title: 'Transmission failure pattern', source: 'comeback', status: 'review', model: 'K5', modelCodes: ['VG', 'KH', 'DL'], modelYear: 2024, system: 'Powertrain', subSystem: '8-Speed Automatic Transmission', component: 'Valve-Body Solenoid', symptom: 'Transmission failure', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Lee Jun-ho', assigneeRole: 'DE', date: '2026-07-08', linkedIssueIds: ['PT-260026'] }),
  mk({ id: 'IN-260016', title: 'Infotainment system restart issue', description: 'Head unit spontaneously restarts during active use, dropping CarPlay and navigation sessions. Escalated after multiple recurrences across the same software build.', source: 'techline', status: 'escalated', model: 'Ioniq 5', modelYear: 2026, system: 'Infotainment', subSystem: 'Head Unit', component: 'Main Display Module', symptom: 'System reboot', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-07-09', linkedIssueIds: ['IN-260024', 'IN-260025'] }),
  mk({ id: 'SU-260017', title: 'Suspension noise investigation', description: 'Warranty claims describe a recurring suspension noise from the front strut area. Awaiting engineer assignment before investigation begins.', source: 'warranty', status: 'review', model: 'Telluride', modelYear: 2025, system: 'Chassis / Suspension', subSystem: 'Front Suspension', component: 'Strut Assembly', symptom: 'Creak', owner: 'Anil Rao', ownerRole: 'SE', date: '2026-07-08' }),
  mk({ id: 'BR-260018', title: 'Brake component improvement', description: 'FPQR flagged a caliper bracket fastener under-torque condition on early MY26 build units. Root cause confirmed and closed with a published TSB and revised torque specification.', source: 'fpqr', status: 'closed', model: 'EV9', modelYear: 2026, system: 'Brakes', subSystem: 'Front Brake', component: 'Caliper Bracket', symptom: 'Fastener under-torque', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Park Soo-jin', assigneeRole: 'ASM', date: '2026-06-16', linkedIssueIds: ['BR-260028'], extra: { dispositionOutcome: 'Resolved', closedAt: '2026-07-20T10:00:00Z' } }),
  // ---- Lifecycle-stage showcase rows (one per stage) ----
  mk({
    id: 'HV-260101', title: 'Charge port reports no communication with EVSE', source: 'warranty', sources: ['warranty', 'fpqr'], status: 'open',
    model: 'EV9', modelYear: 2026, system: 'Electrical / HV', subSystem: 'Integrated Charging Control Unit (ICCU)', component: 'Onboard Charger (OBC)', symptom: 'Charge port no communication',
    owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-07-09',
    extra: {
      description: 'The vehicle fails to complete a handshake with the charging station: the port locks and unlocks repeatedly and no session starts. OBC communication logs and charge-port lock cycling are both being examined.',
      sourceEvidence: [
        { label: 'Warranty claims', value: '43' },
        { label: 'IPTV rate', value: '3.9 /1,000' },
        { label: 'Coverage', value: '36 mo / 36k mi' },
        { label: 'Avg repair cost', value: '$2,700' },
        { label: 'Region', value: 'KR · Domestic' },
      ],
    },
  }),
  mk({ id: 'EL-260102', title: 'Intermittent 12V discharge during regenerative braking', description: 'Owners report a 12V drain that appears only in cold conditions and leaves no DTC. Parasitic draw is measured at several times baseline while the DC-DC converter is under regenerative load.', source: 'warranty', status: 'open', model: 'Ioniq 5', modelYear: 2026, system: 'Electrical / HV', subSystem: 'Integrated Charging Control Unit (ICCU)', component: '12V DC-DC Converter', symptom: 'Intermittent 12V discharge', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-06-28' }),
  mk({ id: 'PT-260103', title: 'Harsh 3-2 downshift after cold start', description: 'A pronounced clunk accompanies the 3-2 downshift for the first few minutes after a cold start, and shift shock is reported under braking. Valve-body solenoid timing is being reviewed.', source: 'comeback', status: 'review', model: 'K5', modelYear: 2025, system: 'Powertrain', subSystem: 'Automatic Transmission', component: 'Valve Body', symptom: 'Harsh downshift', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-06-20' }),
  mk({ id: 'BR-260104', title: 'Brake squeal during regenerative blending', description: 'An audible squeal occurs as the system blends from regenerative to friction braking at low speed. The blend module calibration and pad coupling are both under assessment.', source: 'fpqr', status: 'escalated', model: 'Sportage', modelYear: 2025, system: 'Brakes', subSystem: 'Regenerative Brake System', component: 'Regen Blend Module', symptom: 'Brake squeal on regen blend', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-06-14' }),
  mk({ id: 'AC-260105', title: 'Blower fan noise above 2,000 RPM', description: 'Cabin fan noise rises sharply once the blower passes roughly 2,000 RPM, reported most often on the highest two settings. Motor bearing wear and impeller balance are being examined.', source: 'techline', status: 'review', model: 'Sorento', modelYear: 2026, system: 'HVAC', subSystem: 'Blower System', component: 'Blower Motor', symptom: 'Fan noise above 2k RPM', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-06-08' }),
  mk({ id: 'BD-260106', title: 'Door latch stiffness in sub-zero conditions', description: 'The driver door latch requires noticeably more force to release after an overnight soak below freezing, easing once the cabin warms. Latch lubrication and tolerance stack are under review.', source: 'warranty', status: 'closed', model: 'Telluride', modelYear: 2025, system: 'Body / Closures', subSystem: 'Door System', component: 'Door Latch', symptom: 'Latch stiffness in sub-zero', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-05-12', extra: { dispositionOutcome: 'Resolved', closedAt: '2026-06-30T10:00:00Z' } }),
  // ---- Correlation cohort for EE-260001 (same system/component/model code/symptom) ----
  mk({ id: 'EE-260130', title: 'Intermittent 12V battery discharge on EV6 in cold climates', description: 'Dealer-reported 12V battery discharge on EV6 units in sub-zero climates, matching the pattern seen on the linked ICCU cohort. Under active investigation.', source: 'warranty', status: 'open', model: 'EV6', modelYear: 2024, system: 'Electrical / HV', subSystem: 'Integrated Charging Control Unit (ICCU)', component: '12V DC-DC Converter', symptom: '12V battery discharge', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-07-25' }),
  mk({ id: 'EE-260131', title: 'ICCU fault code recurs after software update', description: 'ICCU fault code and 12V battery discharge symptom recurred on a subset of EV6 units after the latest software update. Monitored for recurrence rate before further action.', source: 'techline', status: 'monitoring', model: 'EV6', modelYear: 2024, system: 'Electrical / HV', subSystem: 'Integrated Charging Control Unit (ICCU)', component: '12V DC-DC Converter', symptom: '12V battery discharge', owner: 'Anil Rao', ownerRole: 'SE', date: '2026-07-30', extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-10-30' } }),
]

// ---- Per-issue sub-collections ----
// The prototype's hero issue (HV-260101) opens with EMPTY parts / comms / activities
// and an 8-entry creation history — mirrored here.
export const PARTS: PartRequest[] = []

export const COMMENTS: Comment[] = []

/**
 * Investigation activities.
 *
 * ─── ⚠️ HV-260101 STAYS EMPTY, AND THAT IS THE RECORDED DECISION ─────────────
 *
 * The note above this block says the prototype's hero issue "opens with EMPTY
 * parts / comms / activities and an 8-entry creation history". That is still
 * true and still mirrored: nothing below targets HV-260101. Seeding it would
 * contradict the design, and the workspace's own opening state is what that
 * decision protects.
 *
 * ─── WHY THE ARRAY IS NO LONGER EMPTY FOR EVERYONE ELSE ──────────────────────
 *
 * It was `[]`, so `activitiesFor()` returned nothing for every one of the 35
 * issues — which meant `ExistingIssueModal`'s "Investigation summary" and
 * "Actions taken" rendered their empty states ALWAYS, and the populated branch
 * was dead code no test or screen could reach. A new test proved the history
 * LIST was never exercised; this is the same gap one layer over.
 *
 * ─── EVERY STRING BELOW IS THE PROTOTYPE'S OWN ──────────────────────────────
 *
 * Taken verbatim from `_classifiedIssuesBase()`, whose records carry an
 * `investigation` paragraph and an `actions[]` array. Only the seven issues that
 * exist in BOTH that list and ours are seeded — no text is invented to fill the
 * others, because a plausible-sounding fabrication in seed data is
 * indistinguishable from real requirements once it is on screen.
 *
 * The two cohorts here are the same ones `assertIssueGroups` pins: EE-260023
 * (+031, +044, +071) and EE-260100 (+105, +112).
 *
 * ⚠️ ORDER IS LOAD-BEARING. `activitiesFor()` does not sort — it filters in array
 * order — and `ExistingIssueModal` reads `activities[0].summary` as the
 * investigation summary. So each issue's investigation entry MUST come first.
 * `assertActivities()` enforces that rather than leaving it to whoever edits
 * this next.
 */
const ACT_AUTHOR: Record<string, string> = {
  'EE-260023': 'Mia Chen',
  'EE-260031': 'Mia Chen',
  'EE-260044': 'Anil Rao',
  'EE-260071': 'Anil Rao',
  'EE-260100': 'Jisoo Han',
  'EE-260105': 'Jisoo Han',
  'EE-260112': 'Tom Reyes',
}

/** `investigation` first, then one entry per `actions[]` string. */
const ACT_SOURCE: { issueId: string; investigation: string; actions: [string, ActivityType][] }[] = [
  {
    issueId: 'EE-260023',
    investigation: 'Cohort review in progress; linked issues under the same group are being reviewed together.',
    actions: [['Cohort export requested', 'Data Analysis']],
  },
  {
    issueId: 'EE-260031',
    investigation: 'Linked to EE-260023 for combined review.',
    actions: [
      ['Investigation activity added', 'Note'],
      ['Linked to EE-260023', 'Note'],
    ],
  },
  {
    issueId: 'EE-260044',
    investigation: 'Linked to EE-260023 for combined review.',
    actions: [['Linked to EE-260023', 'Note']],
  },
  {
    issueId: 'EE-260071',
    investigation: 'Linked to EE-260023 for combined review.',
    actions: [['Linked to EE-260023', 'Note']],
  },
  {
    issueId: 'EE-260100',
    investigation: 'Cohort review in progress; linked issues under the same group are being reviewed together.',
    actions: [['Cohort export requested', 'Data Analysis']],
  },
  {
    issueId: 'EE-260105',
    investigation: 'Linked to EE-260100 for combined review.',
    actions: [['Linked to EE-260100', 'Note']],
  },
  {
    issueId: 'EE-260112',
    investigation: 'Linked to EE-260100 for combined review.',
    actions: [['Linked to EE-260100', 'Note']],
  },
]

export const ACTIVITIES: InvestigationActivity[] = ACT_SOURCE.flatMap((src, gi) => {
  const author = ACT_AUTHOR[src.issueId] ?? 'N-PQMS'
  // Deterministic, and always AFTER the anchor date so an activity never
  // predates the issue it belongs to — `assertActivities` checks that.
  const at = (n: number) => `2026-08-0${gi + 1}T${String(9 + n).padStart(2, '0')}:15:00Z`
  return [
    {
      id: `ia-${src.issueId}-0`,
      issueId: src.issueId,
      type: 'Data Analysis' as ActivityType,
      summary: src.investigation,
      author,
      authorRole: 'SE',
      createdAt: at(0),
    },
    ...src.actions.map(([summary, type], k) => ({
      id: `ia-${src.issueId}-${k + 1}`,
      issueId: src.issueId,
      type,
      summary,
      author,
      authorRole: 'SE',
      createdAt: at(k + 1),
    })),
  ]
})

const HV = 'HV-260101'
const T = (hm: string) => `2026-07-09T${hm}:00Z`
export const AUDIT: AuditEntry[] = [
  { id: 'au-8', issueId: HV, actor: 'Arpita Chavda', actorRole: 'SE', action: 'Initial owner assigned', detail: 'Lifecycle', timestamp: T('08:58') },
  { id: 'au-7', issueId: HV, actor: 'N-PQMS', actorRole: 'System', action: 'Owner assigned', detail: 'Assignment', timestamp: T('08:56') },
  { id: 'au-6', issueId: HV, actor: 'N-PQMS', actorRole: 'System', action: 'Status initialized', detail: 'Status', timestamp: T('08:54') },
  { id: 'au-5', issueId: HV, actor: 'Arpita Chavda', actorRole: 'SE', action: 'Classification selected', detail: 'Classification', timestamp: T('08:52') },
  { id: 'au-4', issueId: HV, actor: 'Arpita Chavda', actorRole: 'SE', action: 'Initial field values saved', detail: 'Field values', timestamp: T('08:50') },
  { id: 'au-3', issueId: HV, actor: 'N-PQMS', actorRole: 'System', action: 'Issue ID generated', detail: 'Identifier', timestamp: T('08:47') },
  { id: 'au-2', issueId: HV, actor: 'N-PQMS', actorRole: 'System', action: 'Issue record created', detail: 'Record created', timestamp: T('08:46') },
  { id: 'au-1', issueId: HV, actor: 'Arpita Chavda', actorRole: 'SE', action: 'Issue created', detail: 'Lifecycle', timestamp: T('08:45') },
]

// The prototype's NOTIFS() entries verbatim — 6 unread, matching the bell badge. The source
// stores relative times ('8 min ago' … 'Yesterday') that fmtStamp() renders as MDY dates
// against _todayBase(); here they are the equivalent absolute instants before NOW.
//
// `recordType` ADDED 2026-08-30. Every row is explicit about what it points at,
// because the router now asks. Vue's fixtures do the same and for the same
// reason — before this, every notification was assumed to be an issue.
//
// n7 is NEW and is the only row that is not from the prototype's NOTIFS(). It
// exists because `notificationTarget`'s `qir` branch was otherwise unreachable
// from the running app: a branch no seed can exercise is a branch nobody sees
// break. It is READ, so the bell badge still shows 6 unread and every count
// pinned elsewhere is unchanged.
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', category: 'Critical', title: 'Issue requires review', recordId: 'EE-260001', recordType: 'issue', read: false, createdAt: '2026-07-09T08:52:00Z' },
  { id: 'n2', category: 'Critical', title: 'EWS alert needs disposition', recordId: 'CL-260003', recordType: 'issue', read: false, createdAt: '2026-07-09T08:00:00Z' },
  { id: 'n3', category: 'Action Required', title: 'Investigation update pending', recordId: 'EE-260001', recordType: 'issue', read: false, createdAt: '2026-07-09T07:00:00Z' },
  { id: 'n4', category: 'Warning', title: 'QIR action is overdue', recordId: 'BD-260006', recordType: 'issue', read: false, createdAt: '2026-07-09T06:00:00Z' },
  { id: 'n5', category: 'Warning', title: 'Disposition approval pending', recordId: 'ST-260002', recordType: 'issue', read: false, createdAt: '2026-07-09T04:00:00Z' },
  { id: 'n6', category: 'Information', title: 'TSB publication completed', recordId: 'AC-260004', recordType: 'issue', read: false, createdAt: '2026-07-08T09:00:00Z' },
  { id: 'n7', category: 'Action Required', title: 'A QIR you raised was escalated', recordId: 'QIR-26014', recordType: 'qir', read: true, createdAt: '2026-07-08T07:30:00Z' },
]

/** Issue Priority seed — the four issues the V4-V5 prototype ships pre-scored
 *  (`seedPriorityById()`). Every other issue starts unscored, which is what blocks
 *  QIR creation until a user works the matrix. `selIdx` is derived on read for these
 *  seeds, since each seeded points value maps to exactly one option. */
export const PRIORITIES: Record<string, IssuePriority> = {
  'BR-260104': { scores: { li_techline: 3, li_warrOcc: 3, cv_social: 3, mod_importance: 3, mod_wildcard: 3 }, selIdx: {}, manualFinal: null, scored: true },
  'EE-260001': { scores: { li_fpqr: 3, cv_care: 2, mod_durability: 3, mod_repairCost: 2 }, selIdx: {}, manualFinal: null, scored: true },
  'PT-260103': { scores: { li_techline: 2, cv_jdp: 2, mod_importance: 2, mod_repairability: 2 }, selIdx: {}, manualFinal: null, scored: true },
  'AC-260004': { scores: { li_fpqr: 2, mod_importance: 1, mod_repairCost: 1 }, selIdx: {}, manualFinal: null, scored: true },
}
