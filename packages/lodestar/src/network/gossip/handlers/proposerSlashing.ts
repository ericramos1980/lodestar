/**
 * @module network/gossip
 */

import {ProposerSlashing} from "@chainsafe/eth2.0-types";
import {getGossipTopic} from "../utils";
import {Gossip} from "../gossip";
import {GossipEvent} from "../constants";
import {serialize} from "@chainsafe/ssz";
import {LodestarGossipMessage} from "../interface";

export async function handleIncomingProposerSlashing(this: Gossip, obj: LodestarGossipMessage): Promise<void> {
  try {
    const proposerSlashing = obj as ProposerSlashing;
    this.logger.verbose(
      `Received slashing for proposer #${proposerSlashing.proposerIndex}`
    );
    this.emit(GossipEvent.PROPOSER_SLASHING, proposerSlashing);
  } catch (e) {
    this.logger.warn("Incoming proposer slashing error", e);
  }
}

export async function publishProposerSlashing(this: Gossip, proposerSlashing: ProposerSlashing): Promise<void> {
  // TODO: wait for an upcoming integration with new libp2p
  try {
    await this.pubsub.publish(
      getGossipTopic(GossipEvent.PROPOSER_SLASHING),
      serialize(this.config.types.ProposerSlashing, proposerSlashing)
    );
  } catch (err) {
    console.error("!!!!!!!!!!!!! publishProposerSlashing", err);
  }
  this.logger.verbose(
    `Publishing proposer slashing for validator #${proposerSlashing.proposerIndex}`
  );
}
