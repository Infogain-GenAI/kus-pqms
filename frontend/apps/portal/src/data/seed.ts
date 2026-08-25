import type { SourceKey, StatusKey } from '@pqms/ui-library'
import type {
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
export const CLASSIFICATION: ClassificationNode[] = [
  { id: 'sys-ee', level: 'system', code: 'EE', label: 'Electrical', issueCount: 42 },
  { id: 'sys-pt', level: 'system', code: 'PT', label: 'Powertrain', issueCount: 31 },
  { id: 'sys-su', level: 'system', code: 'SU', label: 'Suspension', issueCount: 18 },
  { id: 'sys-bd', level: 'system', code: 'BD', label: 'Body', issueCount: 12 },
  { id: 'sub-ee-cp', level: 'subSystem', code: 'EE-CP', label: 'Charge port actuator', parentId: 'sys-ee', issueCount: 9 },
  { id: 'sub-ee-inf', level: 'subSystem', code: 'EE-INF', label: 'Infotainment', parentId: 'sys-ee', issueCount: 11 },
  { id: 'sub-pt-tr', level: 'subSystem', code: 'PT-TR', label: 'Transmission', parentId: 'sys-pt', issueCount: 14 },
  { id: 'sub-su-fr', level: 'subSystem', code: 'SU-FR', label: 'Front axle', parentId: 'sys-su', issueCount: 8 },
  { id: 'cmp-cp-act', level: 'component', code: 'CP-ACT', label: 'Charge port actuator', parentId: 'sub-ee-cp', issueCount: 6 },
  { id: 'cmp-inf-hu', level: 'component', code: 'INF-HU', label: 'Head unit', parentId: 'sub-ee-inf', issueCount: 8 },
  { id: 'cmp-tr-8at', level: 'component', code: 'TR-8AT', label: '8AT', parentId: 'sub-pt-tr', issueCount: 7 },
  { id: 'cmp-fr-strut', level: 'component', code: 'FR-STRUT', label: 'Front strut', parentId: 'sub-su-fr', issueCount: 5 },
  { id: 'sym-unlatch', level: 'symptom', code: 'E-0101', label: 'Charge port fails to unlatch', parentId: 'cmp-cp-act', issueCount: 3 },
  { id: 'sym-reboot', level: 'symptom', code: 'I-0016', label: 'Spontaneous restart', parentId: 'cmp-inf-hu', issueCount: 4 },
  { id: 'sym-creak', level: 'symptom', code: 'S-0007', label: 'Creak over bumps', parentId: 'cmp-fr-strut', issueCount: 3 },
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
  mk({ id: 'IN-260008', title: 'Infotainment reboot when CarPlay connects', description: 'Head unit reboots within seconds of a phone connecting via CarPlay on a subset of units. A software update addressing a Bluetooth-handshake timing issue has been deployed and is being monitored for effectiveness.', source: 'techline', status: 'monitoring', model: 'Ioniq 5', modelYear: 2026, system: 'Infotainment', subSystem: 'Head Unit', component: 'Main Display Module', symptom: 'System reboot', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-06-10', linkedIssueIds: ['IN-260024', 'IN-260025'], extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-09-10' } }),
  mk({ id: 'BR-260009', title: 'Brake squeal on HV regenerative blend', description: 'Field reports describe a brief squeal as the system blends from regenerative to friction braking near stop. Pad material and blend-transition calibration are both under review.', source: 'fpqr', status: 'review', model: 'EV9', modelCodes: ['CV', 'SV'], modelYear: 2026, system: 'Brakes', subSystem: 'Regenerative Brake System', component: 'Blend Control Module', symptom: 'Brake squeal', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-05-28', linkedIssueIds: ['BR-260028'] }),
  mk({ id: 'CH-260010', title: 'Tire pressure sensor false low-pressure alert', description: 'TPMS occasionally flags a false low-pressure warning despite tire pressure being within spec, most often after a rapid ambient-temperature drop. Sensor calibration threshold is under review.', source: 'comeback', status: 'monitoring', model: 'Carnival', modelYear: 2026, system: 'Chassis / Suspension', subSystem: 'Tire Pressure Monitoring', component: 'TPMS Sensor', symptom: 'False alert', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-05-02', extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-09-01' } }),
  mk({ id: 'BD-260011', title: 'Sunroof drain clog causing headliner stain', description: 'A blocked sunroof drain channel has led to water backing up and staining the headliner on a small number of units. Drain routing and debris ingress are being reviewed.', source: 'warranty', status: 'open', model: 'K9', modelYear: 2025, system: 'Body / Closures', subSystem: 'Sunroof Assembly', component: 'Drain Tube', symptom: 'Water ingress', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-06-18' }),
  mk({ id: 'BD-260012', title: 'Wiper blade streak in heavy rain', description: 'GQIS reports intermittent streaking from the driver-side wiper blade during heavy rain. Isolated to a specific blade supplier lot; monitored as a trend rather than an active investigation.', source: 'gqis', status: 'outofscope', model: 'Sorento', modelCodes: ['VG', 'NQ'], modelYear: 2025, system: 'Body / Closures', subSystem: 'Wiper System', component: 'Wiper Blade', symptom: 'Streaking', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-04-15', extra: { dispositionOutcome: 'No Action', closedAt: '2026-05-02T10:00:00Z' } }),
  // ---- Parent/child cohort demo (grouped by shared symptom in the source) ----
  mk({ id: 'EE-260023', title: 'Engine vibration during idle', description: 'Customers report a noticeable vibration through the cabin while the engine idles, most apparent at stoplights. Engine mount stiffness and idle-speed calibration are both being examined.', source: 'warranty', status: 'review', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel System', symptom: 'Engine vibration', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-07-10' }),
  mk({ id: 'EE-260031', title: 'Engine vibration after warm-up', description: 'Vibration complaint similar to EE-260023 but reported specifically once the engine reaches operating temperature. Grouped with the related idle-vibration cohort for a shared root-cause review.', source: 'warranty', status: 'review', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel System', symptom: 'Engine vibration', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-07-14' }),
  mk({ id: 'EE-260044', title: 'Engine vibration during acceleration', description: 'Vibration reported under moderate acceleration rather than at idle. Part of the same engine-vibration cohort; under investigation alongside the idle and warm-up variants.', source: 'warranty', status: 'open', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel System', symptom: 'Engine vibration', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-07-19' }),
  mk({ id: 'EE-260071', title: 'Dealer-reported engine vibration', description: 'Dealer service department flagged a customer vehicle exhibiting the same engine vibration pattern seen in the linked cohort. Inspection requested to confirm mount condition.', source: 'warranty', status: 'open', model: 'K5', modelYear: 2026, system: 'Engine', subSystem: 'Fuel System', component: 'Fuel System', symptom: 'Engine vibration', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-07-28' }),
  mk({ id: 'EE-260100', title: 'Steering rack noise on lock-to-lock turns', description: 'A clicking noise from the steering rack is reported during full lock-to-lock turns, such as parking maneuvers. Rack-bushing clearance is suspected.', source: 'warranty', status: 'review', model: 'Telluride', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack', symptom: 'Steering rack noise', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-07-05' }),
  mk({ id: 'EE-260105', title: 'Steering noise on parking maneuvers', description: 'Related steering-rack noise complaint reported specifically during low-speed parking maneuvers. Grouped with the lock-to-lock noise cohort for shared investigation.', source: 'warranty', status: 'review', model: 'Telluride', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack', symptom: 'Steering rack noise', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-07-12' }),
  mk({ id: 'EE-260112', title: 'Dealer-reported steering rack noise', description: 'Dealer-reported instance of the steering rack noise seen across this cohort. Awaiting dealer inspection findings.', source: 'warranty', status: 'open', model: 'Telluride', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack', symptom: 'Steering rack noise', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-07-21' }),
  mk({ id: 'EE-260090', title: 'Steering noise', description: 'Customer describes an intermittent steering noise; details are limited pending a more thorough dealer inspection.', source: 'warranty', status: 'open', model: 'Tucson', modelYear: 2026, system: 'Steering', subSystem: 'Rack', component: 'Rack', symptom: 'Steering rack noise', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-07-28' }),
  mk({ id: 'EE-260118', title: 'Rear camera image lag on reverse', description: 'Techline reports a brief lag before the rear camera image displays after shifting into reverse. Isolated to a firmware version on the camera module; monitored for recurrence.', source: 'techline', status: 'monitoring', model: 'Sportage', modelYear: 2026, system: 'Infotainment', subSystem: 'Camera', component: 'Camera', symptom: 'Camera image lag', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-08-02', extra: { dispositionOutcome: 'Monitoring', monitoringNextReview: '2026-09-02' } }),
  // ---- Lifecycle demo rows (Recently Accessed) ----
  mk({ id: 'EE-260013', title: 'HV battery thermal early-warning trip', description: 'EWS triggered an early-warning thermal trip on the HV battery pack during DC fast charging. Cell-module temperature sensors show a localized rise that clears once charging stops; escalated pending root-cause review.', source: 'ews', status: 'escalated', model: 'EV9', modelYear: 2026, system: 'Electrical / HV', subSystem: 'High-Voltage Battery System', component: 'Cell Module', symptom: 'Thermal early-warning trip', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Seo-yeon Park', assigneeRole: 'PQM', date: '2026-07-09', isEws: true, linkedIssueIds: ['EE-260019', 'EE-260021'] }),
  mk({ id: 'PT-260014', title: 'Engine performance degradation', description: 'Techline case describes a gradual loss of engine performance accompanied by stored diagnostic codes P0301, P0420 and C1234. Awaiting engineer assignment before investigation begins.', source: 'techline', status: 'review', model: 'Sorento', modelYear: 2025, system: 'Powertrain', subSystem: '2.5 L Turbo Engine', component: 'Turbocharger', symptom: 'Performance degradation', owner: 'Arpita Chavda', ownerRole: 'SE', date: '2026-07-09', dtcCodes: ['P0301', 'P0420', 'C1234'] }),
  mk({ id: 'PT-260015', title: 'Transmission failure pattern', source: 'comeback', status: 'review', model: 'K5', modelCodes: ['VG', 'KH', 'DL'], modelYear: 2024, system: 'Powertrain', subSystem: '8-Speed Automatic Transmission', component: 'Valve-Body Solenoid', symptom: 'Transmission failure', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Lee Jun-ho', assigneeRole: 'DE', date: '2026-07-08', linkedIssueIds: ['PT-260026'] }),
  mk({ id: 'IN-260016', title: 'Infotainment system restart issue', description: 'Head unit spontaneously restarts during active use, dropping CarPlay and navigation sessions. Escalated after multiple recurrences across the same software build.', source: 'techline', status: 'escalated', model: 'Ioniq 5', modelYear: 2026, system: 'Infotainment', subSystem: 'Head Unit', component: 'Main Display Module', symptom: 'System reboot', owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-07-09', linkedIssueIds: ['IN-260024', 'IN-260025'] }),
  mk({ id: 'SU-260017', title: 'Suspension noise investigation', description: 'Warranty claims describe a recurring suspension noise from the front strut area. Awaiting engineer assignment before investigation begins.', source: 'warranty', status: 'review', model: 'Telluride', modelYear: 2025, system: 'Chassis / Suspension', subSystem: 'Front Suspension', component: 'Strut Assembly', symptom: 'Creak', owner: 'Anil Rao', ownerRole: 'SE', date: '2026-07-08' }),
  mk({ id: 'BR-260018', title: 'Brake component improvement', description: 'FPQR flagged a caliper bracket fastener under-torque condition on early MY26 build units. Root cause confirmed and closed with a published TSB and revised torque specification.', source: 'fpqr', status: 'closed', model: 'EV9', modelYear: 2026, system: 'Brakes', subSystem: 'Front Brake', component: 'Caliper Bracket', symptom: 'Fastener under-torque', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Park Soo-jin', assigneeRole: 'ASM', date: '2026-06-16', linkedIssueIds: ['BR-260028'], extra: { dispositionOutcome: 'Resolved', closedAt: '2026-07-20T10:00:00Z' } }),
  // ---- Lifecycle-stage showcase rows (one per stage) ----
  mk({
    id: 'HV-260101', title: 'Charge port door fails to unlatch on driver request', source: 'warranty', status: 'open',
    model: 'EV9', modelYear: 2026, system: 'Electrical', subSystem: 'Charge port actuator', component: 'Charge port actuator', symptom: 'Charge port fails to unlatch',
    owner: 'Arpita Chavda', ownerRole: 'SE', assignee: 'Arpita Chavda', assigneeRole: 'SE', date: '2026-07-09',
    extra: {
      description: 'Multiple field reports describe charge port door fails to unlatch on driver request on EV9 MY2026. Condition concentrated in a specific build window; teardown and warranty-pattern analysis in progress to confirm root cause and fleet exposure.',
      sourceEvidence: [
        { label: 'Warranty claims', value: '43' },
        { label: 'IPTV rate', value: '3.9 /1,000' },
        { label: 'Coverage', value: '36 mo / 36k mi' },
        { label: 'Avg repair cost', value: '$2,700' },
        { label: 'Region', value: 'KR · Domestic' },
      ],
    },
  }),
  mk({ id: 'EL-260102', title: 'Instrument cluster flicker during regenerative braking', description: 'The instrument cluster display flickers briefly whenever regenerative braking engages, most noticeable when decelerating from higher speed. Suspected voltage-ripple sensitivity in the cluster power supply during regen events.', source: 'warranty', status: 'open', model: 'Ioniq 5', modelYear: 2026, system: 'Electrical', subSystem: 'Instrument cluster', component: 'Instrument cluster', symptom: 'Instrument cluster flicker', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-06-28' }),
  mk({ id: 'PT-260103', title: 'Harsh 2–3 upshift after cold start', description: 'A noticeably harsh 2-3 upshift occurs during the first few minutes after a cold start, softening once the transmission reaches operating temperature. Valve-body replacement parts requested to confirm the fix on a validation vehicle.', source: 'comeback', status: 'review', model: 'K5', modelYear: 2025, system: 'Powertrain', subSystem: '8AT valve body', component: '8AT valve body', symptom: 'Harsh upshift', owner: 'Anil Rao', ownerRole: 'SE', assignee: 'Anil Rao', assigneeRole: 'SE', date: '2026-06-20' }),
  mk({ id: 'BR-260104', title: 'Brake booster vacuum decay after engine off', description: 'FPQR reports brake pedal firmness increasing noticeably within minutes of the engine being switched off, consistent with vacuum decay in the brake booster. Escalated and under active QIR review.', source: 'fpqr', status: 'escalated', model: 'Sportage', modelYear: 2025, system: 'Brakes', subSystem: 'Vacuum booster', component: 'Vacuum booster', symptom: 'Vacuum decay', owner: 'Jisoo Han', ownerRole: 'SE', assignee: 'Jisoo Han', assigneeRole: 'SE', date: '2026-06-14' }),
  mk({ id: 'AC-260105', title: 'Evaporator odor on HVAC startup', description: 'A musty odor is reported from the HVAC vents in the first few seconds after startup, consistent with microbial growth on a damp evaporator core. A revised after-blow calibration has been proposed and is pending field verification.', source: 'techline', status: 'review', model: 'Sorento', modelYear: 2026, system: 'HVAC', subSystem: 'Evaporator', component: 'Evaporator', symptom: 'Evaporator odor', owner: 'Mia Chen', ownerRole: 'SE', assignee: 'Mia Chen', assigneeRole: 'SE', date: '2026-06-08' }),
  mk({ id: 'BD-260106', title: 'Tailgate gas strut sag in high ambient heat', description: 'Tailgate gas struts lose enough hold force in high ambient heat that the tailgate slowly sags when left open. Root cause and countermeasure confirmed; issue closed after field-pilot verification.', source: 'warranty', status: 'closed', model: 'Telluride', modelYear: 2025, system: 'Body', subSystem: 'Tailgate strut', component: 'Tailgate strut', symptom: 'Gas strut sag', owner: 'Tom Reyes', ownerRole: 'SE', assignee: 'Tom Reyes', assigneeRole: 'SE', date: '2026-05-12', extra: { dispositionOutcome: 'Resolved', closedAt: '2026-06-30T10:00:00Z' } }),
]

// ---- Per-issue sub-collections ----
// The prototype's hero issue (HV-260101) opens with EMPTY parts / comms / activities
// and an 8-entry creation history — mirrored here.
export const PARTS: PartRequest[] = []

export const COMMENTS: Comment[] = []

export const ACTIVITIES: InvestigationActivity[] = []

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
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', category: 'Critical', title: 'Issue requires review', recordId: 'EE-260001', read: false, createdAt: '2026-07-09T08:52:00Z' },
  { id: 'n2', category: 'Critical', title: 'EWS alert needs disposition', recordId: 'CL-260003', read: false, createdAt: '2026-07-09T08:00:00Z' },
  { id: 'n3', category: 'Action Required', title: 'Investigation update pending', recordId: 'EE-260001', read: false, createdAt: '2026-07-09T07:00:00Z' },
  { id: 'n4', category: 'Warning', title: 'QIR action is overdue', recordId: 'BD-260006', read: false, createdAt: '2026-07-09T06:00:00Z' },
  { id: 'n5', category: 'Warning', title: 'Disposition approval pending', recordId: 'ST-260002', read: false, createdAt: '2026-07-09T04:00:00Z' },
  { id: 'n6', category: 'Information', title: 'TSB publication completed', recordId: 'AC-260004', read: false, createdAt: '2026-07-08T09:00:00Z' },
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
