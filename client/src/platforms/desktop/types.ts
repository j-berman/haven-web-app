declare global {
  interface Window {
    havenProcess: any;
  }
}

export enum NodeLocation {
  Local = "Local",
  Remote = "Remote",
  None = "None",
}

export interface BasicNode {

  address?: string;
  port?: string;
  location: NodeLocation
  default?: boolean;
}

export interface SelectedNode extends BasicNode {
  appIsConnected: boolean;
}

export interface LocalNode {
  isRunning: boolean;
  isMining: boolean;
  connections: { in: number; out: number };
}



export interface DesktopConfig {
  theme: string;
  selectedNode: Partial<BasicNode>;
}

