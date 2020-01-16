/**
 * @module network/gossip
 */

import {BeaconBlock} from "@chainsafe/eth2.0-types";
import {Gossip} from "../gossip";
import {getGossipTopic} from "../utils";
import {GossipEvent} from "../constants";
import {serialize} from "@chainsafe/ssz";
import {LodestarGossipMessage} from "../interface";

export async function handleIncomingBlock(this: Gossip, obj: LodestarGossipMessage): Promise<void> {
  try {
    const block = obj as BeaconBlock;
    this.logger.verbose(`Incoming block at slot: ${block.slot}`);
    this.emit(GossipEvent.BLOCK, block);
  } catch (e) {
    this.logger.warn("Incoming block error", e);
  }
}

export async function publishBlock(this: Gossip, block: BeaconBlock): Promise<void> {
  // TODO: wait for an upcoming integration with new libp2p
  try {
    await this.pubsub.publish(
      getGossipTopic(GossipEvent.BLOCK), serialize(this.config.types.BeaconBlock, block)
    );
  } catch (err) {
    console.error("!!!!!!!!!!!!! publishBlock", err);
  }
  this.logger.verbose(`Publishing block at slot: ${block.slot}`);
}
