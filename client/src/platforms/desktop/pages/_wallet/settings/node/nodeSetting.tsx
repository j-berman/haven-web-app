import Nodes from "shared/components/_inputs/nodes";
import Header from "shared/components/_layout/header";
import Form from "shared/components/_inputs/form";
import Input from "shared/components/_inputs/input";
import {Container} from "../styles";

import DoubleFooter from "shared/components/_inputs/double_footer/index.js";
import React, {SyntheticEvent} from "react";
import {DesktopAppState} from "platforms/desktop/reducers";
import {connect} from "react-redux";
import {selectisLocalNode} from "platforms/desktop/reducers/havenNode";
import {setNodeForWallet} from "platforms/desktop/actions/walletRPC";
import {NodeLocation, NodeState} from "platforms/desktop/types";
import {selectIsWalletSyncingRemote} from "platforms/desktop/reducers/walletRPC";
import {Information} from "assets/styles/type.js";
import {createNodeOptions} from "platforms/desktop/pages/_wallet/settings/node/options";
import {ThreeState} from "shared/types/types";

export enum NodeSelectionType {
  local,
  remote,
  custom,
}

export interface NodeOption {
  name: string;
  location: NodeLocation;
  address: string;
  port: string;
  selectionType: NodeSelectionType;
}

 interface NodeSettingProps {
  isRemoteSyncing: boolean;
  localNode: boolean;
  node: NodeState;
  isConnected: ThreeState;
  isRequestingSwitch: boolean;
  nodeOptions: NodeOption[];
  setHavenNode: (
    selectedNodeOption: NodeOption,
    address: string,
    port: string
  ) => void;
}

 interface NodeSettingState {
  selectedNodeOption: NodeOption;
  address: string;
  port: string;
  connected: ThreeState;
  locked: boolean;
}

class NodeSettingComponent extends React.Component<
  NodeSettingProps,
  NodeSettingState
> {
  state = {
    address: this.props.node.address,
    connected: this.props.isConnected,
    locked: this.props.isConnected !== ThreeState.False,
    selectedNodeOption: this.props.nodeOptions.find(
      (nodeOption) => nodeOption.address === this.props.node.address
    )!,
    port: this.props.node.port,
  };

  onConnect = (e: SyntheticEvent) => {
    e.preventDefault();

    const { address, selectedNodeOption, port } = this.state;

    if (address === this.props.node.address && port === this.props.node.port) {
      return;
    }


    this.props.setHavenNode(selectedNodeOption, address, port);
  };

  selectLocation = (option: NodeOption) => {
    this.setState({
      selectedNodeOption: option,
      address: option.address,
      port: option.port,
    });
  };

  handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;

    this.setState<never>({
      [name]: value,
    });
  };

  onDisconnect = () => {
    this.setState({
      locked: false,
    });
  };

  static getDerivedStateFromProps(
    nextProps: Readonly<NodeSettingProps>,
    prevState: Readonly<NodeSettingState>
  ) {
    let newState = {};


    const isConnectedOrTryingToConnectAgain = nextProps.isConnected !== ThreeState.False && prevState.connected !== nextProps.isConnected;

    // when we are connected to a daemon or trying to connect  --> again lock
    if (isConnectedOrTryingToConnectAgain) {
      newState = { ...newState, locked: true };
    }

    if (nextProps.isConnected !== prevState.connected) {
      newState = { ...newState, connected: nextProps.isConnected };
    }

    if (isConnectedOrTryingToConnectAgain) {

      if (nextProps.node.address !== prevState.address) {
        const changes = {
          address: nextProps.node.address,
          port: nextProps.node.port
        };
        newState = {...newState, ...changes};
      }
    }

    if (isConnectedOrTryingToConnectAgain) {
      if (prevState.selectedNodeOption.address !== nextProps.node.address) {
        const changes  = {

        selectedNodeOption: nextProps.nodeOptions.find(
            (nodeOption) => nodeOption.address === nextProps.node.address
        )!,
      };
        newState = { ...newState, ...changes };
      }
    }
    return newState;
  }

  buttonLogic = () => {
    const { locked } = this.state;
    const { isConnected, isRequestingSwitch } = this.props;

    if (isConnected === ThreeState.Unset || isRequestingSwitch) {
      // Don't change this label as it's equality checked on child
      return "Loading";
    }
    else if (locked  && isConnected === ThreeState.True) {
      return "Connected";
    }
    else if (!locked) {
      return "Connect";
    }
    else {
      return "Connect";
    }
  };

  render() {
    const selectedNodeOption = this.state.selectedNodeOption;
    const { isRemoteSyncing } = this.props;
    const { locked } = this.state;

    return (
      <>
        <Header
          title="Nodes"
          description="Choose between running a local or remote node"
        />
        <Form onSubmit={this.onConnect}>
          <Nodes
            label={"Select Node"}
            placeholder="Select Node"
            name="node"
            value={this.state.selectedNodeOption.name}
            options={this.props.nodeOptions}
            onClick={this.selectLocation}
            disabled={this.state.locked}
          />
          {selectedNodeOption.selectionType === NodeSelectionType.custom && (
            <>
              <Input
                label="Node Address"
                placeholder="Enter node address"
                type="text"
                name="address"
                value={this.state.address}
                onChange={this.handleChange}
              />
              <Input
                label="Node Port"
                placeholder="Enter port number"
                type="text"
                name="port"
                value={this.state.port}
                onChange={this.handleChange}
              />
            </>
          )}

          <Container>
            <Information>
              {this.props.isConnected === ThreeState.True? 'Vault is connected to '
                  : this.props.isConnected === ThreeState.Unset? 'Vault is trying to connect to '
                      : 'Vault is not connected to '}
              <strong>{this.props.node.address}</strong>. Change
              nodes by clicking <strong>Disconnect</strong>, then select a new
              node from the dropdown, then click <strong>Connect</strong>.
            </Information>
            <DoubleFooter
              // Left section
              onClick={() => {}}
              leftLabel={"Disconnect"}
              leftDisabled={!locked}
              leftOnClick={this.onDisconnect}
              leftLoading={false}
              // Right section
              rightOnClick={this.onConnect}
              rightDisabled={locked}
              rightLoading={isRemoteSyncing}
              rightLabel={this.buttonLogic()}
            />
          </Container>
        </Form>
      </>
    );
  }
}

const mapStateToProps = (state: DesktopAppState) => ({
  node: state.havenNode,
  isRemoteSyncing: selectIsWalletSyncingRemote(state),
  isConnected: state.walletRPC.isConnectedToDaemon,
  isRequestingSwitch: state.walletRPC.isRequestingSwitch,
  localNode: selectisLocalNode(state.havenNode),
  nodeOptions: createNodeOptions(state.havenNode),
});

export const HavenNodeSetting = connect(mapStateToProps, {
  setHavenNode: setNodeForWallet,
})(NodeSettingComponent);

