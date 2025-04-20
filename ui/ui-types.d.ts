import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ContainerPS } from 'types';
import { EndpointType, ImageType, LogObject, NetworkAndContainer, NetworkContainerType, PromDataSource } from 'types';

// declare module '*.module.scss';


// =============================================
// Reducers
// =============================================

export interface ConfigurationState {
  global: any;
  scrapeConfigs: any[];
}

export interface CheckboxState {
  name: string;
  value: boolean;
}

// ==============================================
// CONTAINER TYPES
// ==============================================
// Stopped containers have a Names key and running containers have a Name key
// ! Names and Networks had optional parameters `?`, possibly unnecessary so removed
export interface ContainerType {
  ID: string;
  metrics?: stats;
  Names?: string;
  Image?: string;
  RunningFor?: string;
  Networks: string[];
}

// for networkReducer's initial state
export interface NetworkContainerListType {
  networkName: string;
  containers: NetworkAttachedContainersInfo[];
}

// Relates to above interfaces containers property
// TODO: changed container name and IP to optional to debug test. Need to review.
export interface NetworkAttachedContainersInfo {
  containerName?: string;
  containerIP?: string;
}

// for networkReducer's action
export interface NetworkStateType {
  networkContainerList: NetworkAndContainer[];
}

export interface StoppedListType extends ContainerType {
  Img: string;
  Created: string;
  name: string;
}

// export interface RunningListType {
//   Names?: string;
//   ID: string;
//   Image: string;
//   RunningFor: string;
// }

export interface ContainerStateType {
  runningList: ContainerPS[];
  stoppedList: ContainerPS[];
  networkList: string[];
  errorModalOn: boolean;
}

// for container's being run
export interface ContainerObj extends ContainerType {
  Container: string;
}

// for container's being stopped
export interface StoppedContainerObj extends ContainerType {
  Command: string;
  CreatedAt: string;
  Labels: string;
  LocalVolumes: string;
  Mounts: string;
  Ports: string;
  Size: string;
  State: string;
  Status: string;
  ModalOpen?: boolean;
}

export interface containersList {
  runningList: ContainerPS[];
  stoppedList: ContainerPS[];
}

export interface stats {
  BlockIO: string;
  CPUPerc: string;
  Container: string;
  ID: string;
  MemPerc: string;
  MemUsage: string;
  Name: string;
  NetIO: string;
  PIDs: string;
}

// ==============================================
// IMAGE TYPES
// ==============================================
export interface ImageObj {
  reps: string;
  tag: string;
  imgid: string;
  size: string;
}

export interface ImagesStateType {
	imagesList: ImageType[];
	timeStamp: string;
	isSaved: boolean;
  totalVul: number;
}

// Type for vulnerability object - reducer inside action argument
export interface VulnerabilityPayload {
  vulnerabilityObj: object;
  scanName: string;
}

// Type for top3 object - reducer inside action argument
export interface Top3Payload {
  top3Obj: object;
  scanName: string;
}

export interface EverythingPayload {
  everything: EverythingObj;
  scanName: string;
}

export interface timePayload {
	timeStamp: string;
}

export interface savePayload {
  isSaved: boolean;
}

export interface totalVulPayload {
	totalVul: number;
}

// Type of the scanned image vulnerabilities object - ImageCard.tsx
export interface ScanObject {
  Critical?: number | string;
  High?: number | string;
  Medium?: number | string;
  Low?: number | string;
  Negligible?: number | string;
  Unknown?: number | string;
}

// Type of top 3 package in dropdown - ImageCard.tsx
export interface Top3Obj {
  critical?: [string, number][];
  high?: [string, number][];
  medium?: [string, number][];
  low?: [string, number][];
  negligible?: [string, number][];
  unknown?: [string, number][];
}

export interface EverythingObj {
  critical: GrypeScan[];
  high: GrypeScan[];
  medium: GrypeScan[];
  low: GrypeScan[];
  negligible: GrypeScan[];
  unknown: GrypeScan[];
}

// Type received from server after calling to '/scan'
export interface ScanReturn {
  vulnerabilites: ScanObject;
  everything: GrypeScan[];
  timeStamp: string;
  saved: boolean;
}

export interface ModifiedObject {
	Everything: EverythingObj;
}

export interface MongoData {
  userIP: string;
  imagesList: [];
  timeStamp: string;
}

// ==============================================
// LOGS TYPES
// ==============================================


export interface ProcessLogsSelectorProps {
  containerList?: ContainerType[];
  handleCheck?: (name: string) => void;
  btnIdList?: CheckboxState
  status?: string;
}

// export interface ProcessLogsSelectorProps {
//   containerList: ContainerType[];
//   handleCheck: (name: string) => void;
//   btnIdList: { Names?: boolean }[];
// }

export interface stdType {
  containerName: string;
  logMsg: string;
  timestamp: string;
}

export interface ContainerLogsType {
  stdout: LogObject[];
  stderr: LogObject[];
}

export interface LogsStateType {
  containerLogs: {[key:string]: LogObject[]};
  searchWord: string;
}

export type CSVDataType = [boolean, string, string, string, string][]; 
export type CSVSlicedType = [string, string, string, string];  // Adjusted type for sliced data

export type OptionsObj = {
  containerNames: string[],
  start: string | null = null,
  stop: string | null = null,
  offset: number;
};


// ==============================================
// VOLUME TYPES
// ==============================================
export interface VolumeContainerObj {
  Names: string;
  State?: string;
  Status?: string;
}

export interface VolumeObj {
  volName: string;
  containers: ContainerPS[];
}

export interface VolumeNameObj {
  Name: string;
}

export interface VolumeStateType {
  volumes: VolumeNameObj[];
  volumeContainersList: VolumeObj[];
}

// ==============================================
// MISC. TYPES
// ==============================================
export interface NetworkObj {
  CreatedAt: string;
  Driver: string;
  ID: string;
  IPv6: string;
  Internal: string;
  Labels: string;
  Name: string;
  Scope: string;
}

export interface composeStacksDockerObject {
  Name: string[];
  FilePath: string;
  YmlFileName: string;
}

export interface notificationList {
  phoneNumber: string[];
  memoryNotificationList: any[];
  cpuNotificationList: any[];
  stoppedNotificationList: any[];
}

export interface AlertStateType {
  alertList: (string | null)[];
  promptList:
    | [
        prompt: string | null,
        handleAccept: (() => void) | null,
        handleDeny: (() => void) | null,
      ]
    | null[];
}

export interface PruneStateType {
  prunePromptList:
    | [
        prompt: string | null,
        handleSystemPrune: (() => void) | null,
        handleNetworkPrune: (() => void) | null,
        handleDeny: (() => void) | null,
      ]
    | null[];
}

export interface notificationStateType {
  phoneNumber: string;
  memoryNotificationList: Set<any>;
  cpuNotificationList: Set<any>;
  stoppedNotificationList: Set<any>;
}

export interface RowsDataType {
  container: string;
  type: string;
  time: string;
  message: string;
  id: number;
}

export interface ToggleDisplayProps {
  container: ContainerType;
}

export interface DataFromBackend {
  hash?: string;
  error?: string;
}Record<string, boolean>;

export interface ContainersCardsProps {
  containerList?: ContainerType[];
  metrics?: stats;
  stopContainer: (container: ContainerType) => void;
  runContainer: (container: ContainerType) => void;
  removeContainer: (container: ContainerType) => void;
  connectToNetwork?: (network: string, container: string) => void;
  disconnectFromNetwork?: (network: string, container: string) => void;
  container?: ContainerType;
  bashContainer: (container: any) => void;
  status: string;
  key?: string | number;
  filters: Record<string, boolean>;
}

export interface NetworkModal {
  Names: string;
}

export interface ConnectOrDisconnectProps {
  container: ContainerType;
  networkName: string;
  connectToNetwork: (networkName: string, containerName: string) => void;
  disconnectFromNetwork: (networkName: string, containerName: string) => void;
}

export interface NetworkListModalProps {
  Names: string;
  container: ContainerType;
  isOpen: boolean;
  connectToNetwork: (network: string, container: string) => void;
  disconnectFromNetwork: (network: string, container: string) => void;
  closeNetworkList: () => void;
  networkContainerList: NetworkContainerListType[];
}

export interface NotFoundProps {
  session: boolean | undefined;
}

export interface ContainerNetworkObject {
  Name: string;
  Id: string;
  CreatedAt: string;
  Labels: Record<string, string>;
  FilePath?: string;
  YmlFileName?: string;
}

export interface MetricsQuery {
  id: number;
  container_id: string;
  container_name: string;
  cpu_pct: string;
  memory_pct: string;
  memory_usage: string;
  net_io: string;
  block_io: string;
  pid: string;
  created_at: Date;
}
export interface CsvObjElement {
  container: string;
  type: string;
  time: string;
  message: string;
}