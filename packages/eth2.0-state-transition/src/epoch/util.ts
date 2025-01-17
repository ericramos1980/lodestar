/**
 * @module chain/stateTransition/epoch/util
 */

import assert from "assert";

import {
  BeaconState,
  Epoch,
  Gwei,
  PendingAttestation,
  ValidatorIndex,
} from "@chainsafe/eth2.0-types";
import {IBeaconConfig} from "@chainsafe/eth2.0-config";

import {
  getAttestingIndices,
  getBlockRoot,
  getBlockRootAtSlot,
  getCurrentEpoch,
  getPreviousEpoch,
  getTotalBalance
} from "../util";


export function getMatchingSourceAttestations(
  config: IBeaconConfig,
  state: BeaconState,
  epoch: Epoch
): PendingAttestation[] {
  const currentEpoch = getCurrentEpoch(config, state);
  assert(epoch === currentEpoch || epoch === getPreviousEpoch(config, state));
  return epoch === currentEpoch
    ? state.currentEpochAttestations
    : state.previousEpochAttestations;
}

export function getMatchingTargetAttestations(
  config: IBeaconConfig,
  state: BeaconState,
  epoch: Epoch
): PendingAttestation[] {
  const blockRoot = getBlockRoot(config, state, epoch);
  return getMatchingSourceAttestations(config, state, epoch)
    .filter((a) => a.data.target.root.equals(blockRoot));
}

export function getMatchingHeadAttestations(
  config: IBeaconConfig,
  state: BeaconState,
  epoch: Epoch
): PendingAttestation[] {
  return getMatchingSourceAttestations(config, state, epoch)
    .filter((a) => a.data.beaconBlockRoot
      .equals(getBlockRootAtSlot(config, state, a.data.slot)));
}

export function getUnslashedAttestingIndices(
  config: IBeaconConfig,
  state: BeaconState,
  attestations: PendingAttestation[]
): ValidatorIndex[] {
  const output: Set<ValidatorIndex> = new Set();
  attestations.forEach((a) =>
    getAttestingIndices(config, state, a.data, a.aggregationBits).forEach((index) =>
      output.add(index)));
  return Array.from(output).filter((index) => !state.validators[index].slashed).sort();
}

export function getAttestingBalance(
  config: IBeaconConfig,
  state: BeaconState,
  attestations: PendingAttestation[]
): Gwei {
  return getTotalBalance(state, getUnslashedAttestingIndices(config, state, attestations));
}
