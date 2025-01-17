import {Attestation, BeaconState, CommitteeIndex, Epoch} from "@chainsafe/eth2.0-types";
import {IBeaconConfig} from "@chainsafe/eth2.0-config";
import {OperationsModule} from "./abstract";
import {computeEpochAtSlot, computeStartSlotAtEpoch,} from "@chainsafe/eth2.0-state-transition";
import {BulkRepository} from "../../db/api/beacon/repository";
import {getBitCount} from "../../util/bit";

export class AttestationOperations extends OperationsModule<Attestation> {
  private readonly config: IBeaconConfig;

  public constructor(db: BulkRepository<Attestation>, {config}: {config: IBeaconConfig}) {
    super(db);
    this.config = config;
  }

  public async getCommiteeAttestations(epoch: Epoch, committeeIndex: CommitteeIndex): Promise<Attestation[]> {
    const attestations = await this.getAll();
    return attestations.filter((attestation) => {
      return attestation.data.index === committeeIndex
          && computeEpochAtSlot(this.config, attestation.data.slot) === epoch
          //filter out aggregated attestations
          && getBitCount(attestation.aggregationBits) === 1;
    });
  }

  public async removeOld(state: BeaconState): Promise<void> {
    const finalizedEpochStartSlot = computeStartSlotAtEpoch(this.config, state.finalizedCheckpoint.epoch);
    const attestations: Attestation[] = await this.getAll();
    await this.remove(attestations.filter((a) => {
      return finalizedEpochStartSlot <= a.data.slot;
    }));
  }
}
