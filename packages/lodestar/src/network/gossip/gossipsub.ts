// @ts-ignore
import Gossipsub from "libp2p-gossipsub";
import {IGossipMessage, IGossipMessageValidator, LodestarGossipMessage} from "./interface";
import {getGossipTopic, deserializeGossipMessage} from "./utils";
import {GossipEvent} from "./constants";
import {BeaconBlock, Attestation, AggregateAndProof, AttesterSlashing, ProposerSlashing, 
  VoluntaryExit} from "@chainsafe/eth2.0-types";
import {IBeaconConfig} from "@chainsafe/eth2.0-config";
// @ts-ignore
import {utils} from "libp2p-pubsub";

/**
 * This validates messages in Gossipsub and emit the transformed messages.
 * We don't want to double deserialize messages for performance benefit.
 */
export class LodestarGossipsub extends Gossipsub {
  private transformedMessages: Map<string, LodestarGossipMessage>;
  private config: IBeaconConfig;
  private validator: IGossipMessageValidator;
  // @ts-ignore
  constructor (config: IBeaconConfig, validator: IGossipMessageValidator, peerInfo, registrar, options = {}) {
    super(peerInfo, registrar, options);
    this.transformedMessages = new Map();
    this.config = config;
    this.validator = validator;
  }

  public async validate(rawMessage: IGossipMessage): Promise<boolean> {
    const message: IGossipMessage = utils.normalizeInRpcMessage(rawMessage);
    if (!message.topicIDs) {
      return false;
    }
    let transformeObj: LodestarGossipMessage;
    let isValidBlock = true, isValidAttestation = true, isValidAggregateAndProof = true, 
      isValidAttesterSlashing = true, isValidProposerSlashing = true, isValidVoluntaryExit = true;
    if (message.topicIDs.includes(getGossipTopic(GossipEvent.BLOCK, "ssz"))) {
      const block = deserializeGossipMessage<BeaconBlock>(message, this.config.types.BeaconBlock);
      isValidBlock = await this.validator.isValidIncomingBlock(block);
      transformeObj = block;
    }
    if (message.topicIDs.includes(getGossipTopic(GossipEvent.ATTESTATION, "ssz"))) {
      const attestation = deserializeGossipMessage<Attestation>(message, this.config.types.Attestation);
      isValidAttestation = await this.validator.isValidIncomingUnaggregatedAttestation(attestation);
      transformeObj = attestation;
    }
    if (message.topicIDs.includes(getGossipTopic(GossipEvent.AGGREGATE_AND_PROOF, "ssz"))) {
      const aggregateAndProof = deserializeGossipMessage<AggregateAndProof>(message, 
        this.config.types.AggregateAndProof);
      isValidAggregateAndProof = await this.validator.isValidIncomingAggregateAndProof(aggregateAndProof);
      transformeObj = aggregateAndProof;
    }
    if (message.topicIDs.includes(getGossipTopic(GossipEvent.ATTESTER_SLASHING, "ssz"))) {
      const attesterSlashing = deserializeGossipMessage<AttesterSlashing>(message, this.config.types.AttesterSlashing);
      isValidAttesterSlashing = await this.validator.isValidIncomingAttesterSlashing(attesterSlashing);
      transformeObj = attesterSlashing;
    }
    if (message.topicIDs.includes(getGossipTopic(GossipEvent.PROPOSER_SLASHING, "ssz"))) {
      const proposerSlashing = deserializeGossipMessage<ProposerSlashing>(message, this.config.types.ProposerSlashing);
      isValidProposerSlashing = await this.validator.isValidIncomingProposerSlashing(proposerSlashing);
      transformeObj = proposerSlashing;
    }
    if (message.topicIDs.includes(getGossipTopic(GossipEvent.VOLUNTARY_EXIT, "ssz"))) {
      const voluntaryExit = deserializeGossipMessage<VoluntaryExit>(message, this.config.types.VoluntaryExit);
      isValidVoluntaryExit = await this.validator.isValidIncomingVoluntaryExit(voluntaryExit);
      transformeObj = voluntaryExit;
    }

    const isValid = isValidBlock && isValidAttestation && isValidAggregateAndProof && isValidAttesterSlashing &&
      isValidProposerSlashing && isValidVoluntaryExit;
    if (isValid && transformeObj) {
      this.transformedMessages.set(this.getKey(message), transformeObj);
    }
    return isValid;
  }

  public _emitMessage(topics: string[], message: IGossipMessage): void {
    const subscribedTopics = super.getTopics();
    topics.forEach((topic) => {
      if (subscribedTopics.has(topic)) {
        const transformedMessage = this.transformedMessages.get(this.getKey(message));
        if (transformedMessage) {
          super.emit(topic, transformedMessage);
          this.transformedMessages.delete(this.getKey(message));
        }
      }
    });
  }

  private getKey(message: IGossipMessage): string {
    const key = Buffer.concat([message.from, message.seqno]);
    return key.toString("hex");
  }

}