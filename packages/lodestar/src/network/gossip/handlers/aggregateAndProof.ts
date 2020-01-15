/**
 * @module network/gossip
 */

import {Gossip} from "../gossip";
import {getGossipTopic} from "../utils";
import {GossipEvent} from "../constants";
import {AggregateAndProof} from "@chainsafe/eth2.0-types";
import {toHex} from "@chainsafe/eth2.0-utils";
import {serialize} from "@chainsafe/ssz";
import {promisify} from "es6-promisify";
import {LodestarGossipMessage} from "../interface";

export async function handleIncomingAggregateAndProof(this: Gossip, obj: LodestarGossipMessage): Promise<void> {
  try {
    const aggregateAndProof = obj as AggregateAndProof;
    this.logger.verbose(
      `Received AggregateAndProof from validator #${aggregateAndProof.aggregatorIndex}`+
        ` for target ${toHex(aggregateAndProof.aggregate.data.target.root)}`
    );
    this.emit(GossipEvent.AGGREGATE_AND_PROOF, aggregateAndProof);
  } catch (e) {
    this.logger.warn("Incoming aggregate and proof error", e);
  }
}

export async function publishAggregatedAttestation(this: Gossip, aggregateAndProof: AggregateAndProof): Promise<void> {
  await Promise.all([
    promisify<void, string, Buffer>(this.pubsub.publish.bind(this.pubsub))(
      getGossipTopic(GossipEvent.AGGREGATE_AND_PROOF),
      serialize(this.config.types.AggregateAndProof, aggregateAndProof)
    ),
    //to be backward compatible
    promisify<void, string, Buffer>(this.pubsub.publish.bind(this.pubsub))(
      getGossipTopic(GossipEvent.ATTESTATION), serialize(this.config.types.Attestation, aggregateAndProof.aggregate)
    )
  ]);
  this.logger.verbose(
    `Publishing AggregateAndProof for validator #${aggregateAndProof.aggregatorIndex}`
        + ` for target ${toHex(aggregateAndProof.aggregate.data.target.root)}`
  );
}
