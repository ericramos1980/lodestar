/**
 * @module network/gossip
 */

import {BeaconBlock} from "@chainsafe/eth2.0-types";
import {Gossip} from "../gossip";
import {getGossipTopic} from "../utils";
import {GossipEvent} from "../constants";
import {serialize} from "@chainsafe/ssz";
import {promisify} from "es6-promisify";
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
  await promisify<void, string, Buffer>(this.pubsub.publish.bind(this.pubsub))(
    getGossipTopic(GossipEvent.BLOCK), serialize(this.config.types.BeaconBlock, block)
  );
  this.logger.verbose(`Publishing block at slot: ${block.slot}`);
}
