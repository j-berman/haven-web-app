import { webWalletConnection } from "platforms/web/nodes";
import { havendProxy } from "shared/core/proxy";
import { DAEMON_CONECTION_CREATED } from "./types";
import { getNodeForWallet } from "./wallet";

export const connectAppToDaemon = () => {
  return (dispatch: any, getState: any) => {

    const node = getNodeForWallet(getState);
    if (node) {
    havendProxy.createDaemonConnection(node);
    dispatch({ type: DAEMON_CONECTION_CREATED });
    }

  };
};
