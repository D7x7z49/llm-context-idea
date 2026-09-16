import { EXEMPTION_SETS } from "./ranges.js";
import type { CodePointRange, CommunicationDecision, Measurement } from "./schema.js";

// pi-good-communication: pure measurement and decision functions.
//
// contract:
//   measureUnits(text) -> measurement
//     pre:  text is an already decoded JavaScript string from a pi event.
//     post: units is a non-negative integer; empty text yields 0; the same
//           text always yields the same units.
//   decideUnits(measurement, threshold) -> decision
//     pre:  threshold is a positive integer.
//     post: action is "block" when units >= threshold, otherwise "pass".
//
// this module performs no IO, keeps no state, and never throws.

// --- Range lookup ---

export function lookupExemptionSet(codePoint: number): string | undefined {
  for (const set of EXEMPTION_SETS) {
    if (containsCodePoint(set.ranges, codePoint)) {
      return set.id;
    }
  }
  return undefined;
}

function containsCodePoint(ranges: readonly CodePointRange[], codePoint: number): boolean {
  let low = 0;
  let high = ranges.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const [start, end] = ranges[middle];
    if (codePoint < start) {
      high = middle - 1;
    } else if (codePoint > end) {
      low = middle + 1;
    } else {
      return true;
    }
  }
  return false;
}

// --- Measurement ---

export function measureUnits(text: string): Measurement {
  let units = 0;
  let currentSet: string | undefined;
  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0;
    const set = lookupExemptionSet(codePoint);
    if (set !== undefined && set === currentSet) {
      continue;
    }
    units += 1;
    currentSet = set;
  }
  return { units };
}

// --- Decision ---

export function decideUnits(measurement: Measurement, threshold: number): CommunicationDecision {
  return {
    measurement,
    action: measurement.units >= threshold ? "block" : "pass",
  };
}
