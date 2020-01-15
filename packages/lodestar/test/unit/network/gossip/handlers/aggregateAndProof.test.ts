import {describe, it, beforeEach, afterEach} from "mocha";
import sinon from "sinon";
import {Gossip} from "../../../../../src/network/gossip/gossip";
import {handleIncomingAggregateAndProof} from "../../../../../src/network/gossip/handlers/aggregateAndProof";
import {AggregateAndProof} from "@chainsafe/eth2.0-types";
import {generateEmptyAttestation} from "../../../../utils/attestation";
import {expect} from "chai";
import {WinstonLogger} from "../../../../../src/logger";
import {GossipEvent} from "../../../../../src/network/gossip/constants";
import {config} from "@chainsafe/eth2.0-config/lib/presets/minimal";

describe("gossip handlers - aggregate and proof", function () {

  const sandbox = sinon.createSandbox();

  let gossipStub: any;

  beforeEach(function () {
    gossipStub = sandbox.createStubInstance(Gossip);
    gossipStub.logger = sandbox.createStubInstance(WinstonLogger);
    gossipStub.config = config;
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("handle valid message", async function () {
    const aggregate: AggregateAndProof = {
      aggregatorIndex: 0,
      selectionProof: Buffer.alloc(0),
      aggregate: generateEmptyAttestation()
    };
    await handleIncomingAggregateAndProof.bind(gossipStub)(aggregate);
    expect(gossipStub.emit.withArgs(GossipEvent.AGGREGATE_AND_PROOF, aggregate).calledOnce).to.be.true;
  });
    
});