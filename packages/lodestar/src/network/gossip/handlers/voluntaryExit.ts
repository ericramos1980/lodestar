/**
 * @module network/gossip
 */

import {Gossip} from "../gossip";
import {getGossipTopic} from "../utils";
import {VoluntaryExit} from "@chainsafe/eth2.0-types";
import {GossipEvent} from "../constants";
import {serialize} from "@chainsafe/ssz";
import {promisify} from "es6-promisify";
import {LodestarGossipMessage} from "../interface";

export async function handleIncomingVoluntaryExit(this: Gossip, obj: LodestarGossipMessage): Promise<void> {
  try {
    const voluntaryExit = obj as VoluntaryExit;
    this.logger.verbose(
      `Received voluntary exit for validator #${voluntaryExit.validatorIndex}`
    );
    this.emit(GossipEvent.VOLUNTARY_EXIT, voluntaryExit);
  } catch (e) {
    this.logger.warn("Incoming voluntary exit error", e);
  }
}

export async function publishVoluntaryExit(this: Gossip, voluntaryExit: VoluntaryExit): Promise<void> {
  await promisify<void, string, Buffer>(this.pubsub.publish.bind(this.pubsub))(
    getGossipTopic(GossipEvent.VOLUNTARY_EXIT), serialize(this.config.types.VoluntaryExit, voluntaryExit));
  this.logger.verbose(
    `Publishing voluntary exit for validator #${voluntaryExit.validatorIndex}`
  );
}
