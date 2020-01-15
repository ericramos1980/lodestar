/**
 * @module network/gossip
 */

import {Gossip, GossipHandlerFn} from "../gossip";
import {getAttestationSubnet, getAttestationSubnetTopic, getGossipTopic} from "../utils";
import {Attestation} from "@chainsafe/eth2.0-types";
import {toHex} from "@chainsafe/eth2.0-utils";
import {GossipEvent} from "../constants";
import {hashTreeRoot, serialize} from "@chainsafe/ssz";
import {promisify} from "es6-promisify";
import {LodestarGossipMessage} from "../interface";

export async function handleIncomingAttestation(this: Gossip, obj: LodestarGossipMessage): Promise<void> {
  try {
    const attestation = obj as Attestation;
    this.logger.verbose(
      `Received attestation for block ${toHex(attestation.data.beaconBlockRoot)}`
        +` (${attestation.data.source.epoch}, ${attestation.data.target.epoch})`
    );
    this.emit(GossipEvent.ATTESTATION, attestation);
  } catch (e) {
    this.logger.warn("Incoming attestation error", e);
  }
}

export function getCommitteeAttestationHandler(subnet: number): GossipHandlerFn {
  return function handleIncomingCommitteeAttestation(this: Gossip, obj: LodestarGossipMessage): void {
    try {
      const attestation = obj as Attestation;
      this.logger.verbose(
        `Received committee attestation for block ${toHex(attestation.data.beaconBlockRoot)}`
          +`subnet: ${subnet}, (${attestation.data.source.epoch}, ${attestation.data.target.epoch})`
      );
      this.emit(GossipEvent.ATTESTATION_SUBNET, {attestation, subnet});
    } catch (e) {
      this.logger.warn("Incoming committee attestation error", e);
    }
  };
}

export async function publishCommiteeAttestation(this: Gossip, attestation: Attestation): Promise<void> {
  const subnet = getAttestationSubnet(attestation);
  await promisify<void, string, Buffer>(this.pubsub.publish.bind(this.pubsub))(
    getAttestationSubnetTopic(attestation), serialize(this.config.types.Attestation, attestation));
  //backward compatible
  await promisify<void, string, Buffer>(this.pubsub.publish.bind(this.pubsub))(
    getGossipTopic(GossipEvent.ATTESTATION), serialize(this.config.types.Attestation, attestation)
  );
  this.logger.verbose(
    `Publishing attestation ${toHex(hashTreeRoot(this.config.types.Attestation, attestation))} for subnet ${subnet}`
  );
}
