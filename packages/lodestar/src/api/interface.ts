/**
 * @module api
 */
import {IBeaconConfig} from "@chainsafe/eth2.0-config";
import {IBeaconChain} from "../chain";
import {IBeaconDb} from "../db/api";
import {IEth1Notifier} from "../eth1";
import {IApiOptions} from "./options";
import {ApiNamespace} from "./index";
import {ILogger} from  "@chainsafe/eth2.0-utils/lib/logger";
import {Sync} from "../sync";
import {OpPool} from "../opPool";
import {INetwork} from "../network";

export interface IApiModules {
  config: IBeaconConfig;
  logger: ILogger;
  chain: IBeaconChain;
  opPool: OpPool;
  sync: Sync;
  network: INetwork;
  db: IBeaconDb;
  eth1: IEth1Notifier;
}

export interface IApiConstructor {

  new(opts: Partial<IApiOptions>, modules: IApiModules): IApi;

}

export interface IApi {

  /**
     * Name space for API commands
     */
  namespace: ApiNamespace;

}
