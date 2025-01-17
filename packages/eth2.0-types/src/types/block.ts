/* eslint-disable @typescript-eslint/interface-name-prefix */
/**
 * @module types
 */

import {BLSSignature, bytes32, Root, Slot,} from "./primitive";

import {Eth1Data} from "./misc";

import {Attestation, AttesterSlashing, Deposit, ProposerSlashing, VoluntaryExit,} from "./operations";


export interface BeaconBlockBody {
  randaoReveal: BLSSignature;
  eth1Data: Eth1Data;
  graffiti: bytes32;
  proposerSlashings: ProposerSlashing[];
  attesterSlashings: AttesterSlashing[];
  attestations: Attestation[];
  deposits: Deposit[];
  voluntaryExits: VoluntaryExit[];
}

export interface BeaconBlock {
  // Header
  slot: Slot;
  parentRoot: Root;
  stateRoot: Root;
  body: BeaconBlockBody;
  signature: BLSSignature;
}
