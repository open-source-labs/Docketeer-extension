export interface ContainerPS {
  ID: string;
  Command?: string;
  CreatedAt?: string;
  Image?: string;
  Labels?: string[];
  LocalVolumes?: string;
  Mounts?: string;
  Names?: string;
  Networks?: string[];
  Ports?: string[];
  RunningFor?: string;
  Size?: string;
  State?: string; //tells if running
  Status?: string;
}

export interface LogObject {
  timeStamp: string;
  logMsg: string;
  containerName: string;
}

export interface VolumeType{
  Availability?: string;
  Driver?: string;
  Group?: string;
  Labels?: string;
  Links?: string;
  Mountpoint?: string;
  Name: string;
  Scope?: string;
  Size?: string;
  Status?: string;
}

export interface NetworkType{
  CreatedAt?: string;
  Driver: string;
  ID: string;
  IPv6?: string;
  Internal?: string;
  Labels?: string;
  Name: string;
  Scope?: string;
}

export interface NetworkContainerType extends ContainerPS{
  Name: string;
  EndpointID: string;
  MacAddress: string;
  IPv4Address: string;
  IPv6Address: string;
  containerName?: string;
  containerIP?: string;
}

export interface NetworkInspect{
  Name: string;
  Id: string;
  Created?: string;
  Scope?: string;
  Driver?: string;
  EnableIPv6?: boolean;
  IPAM?: {
    Driver?: string;
    Options: object;
    Config?: { Subnet?: string, Gateway?: string }[];
  }
  Internal?: boolean;
  Attachable?: boolean;
  Ingress?: boolean;
  ConfigFrom?: { Network?: string };
  ConfigOnly?: boolean;
  Containers: {
    [key: string]: NetworkContainerType;
  }
  Options?: object;
  Labels?: object;
}

export interface ImageType{
  Containers?: string;
  CreatedAt?: string;
  CreatedSince?: string;
  Digest?: string;
  ID: string;
  Repository: string;
  SharedSize?: string;
  ScanName?: string;
  Size: string;
  Tag: string;
  UniqueSize?: string;
  VirtualSize?: string;
  Vulnerabilities?: object;
}

export interface ImageCardProps {
  imgObj: ImageType,
  key: number,
  runImageAlert: (Image: ImageType) => void,
  removeImageAlert: (Image: ImageType) => void,
}

export interface NetworkAndContainer{
  networkName: string;
  containers: NetworkContainerType[];
}

export interface PromDataSource {
  id?: number;
  type_of?: string;
  type_of_id: number;
  url: string;
  endpoint: string;
  ssh_key?: string;
  match?: string;
  jobname: string;
}

export interface EndpointType {
  id: number;
  type_of: string;
}

export interface Metric {
  metricName: string;
  metricQuery: string;
}

export interface MetricsEntry{
  date?: string;
  diskSpace?: string;
  swap?: string;
  CPU_usage?: string;
  available_Memory?: string;
  memory?: string;
}

export interface MetricsDB{
  'Date': string;
  'Disk Space': string;
  'Memory': string;
  'Swap': string;
  'CPU Usage': string;
  'Available Memory': string;
}

export interface metricData {
  status: string;
  data: object;
}