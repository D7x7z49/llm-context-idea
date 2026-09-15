// pi-good-communication: shared data structures for the communication counter.
//
// contract: types only. this module has no runtime behavior and no imports.

// --- Exemption data ---

export type CodePointRange = readonly [start: number, end: number];

export interface ExemptionSet {
  readonly id: string;
  readonly ranges: readonly CodePointRange[];
}

// --- Measurement ---

export interface Measurement {
  readonly units: number;
}

// --- Decision ---

export type DecisionAction = "pass" | "block";

export interface CommunicationDecision {
  readonly measurement: Measurement;
  readonly action: DecisionAction;
}
