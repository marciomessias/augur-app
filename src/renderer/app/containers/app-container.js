import { connect } from "react-redux";
import { App } from "../App";
import { updateConfig } from "../actions/configuration"
import { addInfoNotification } from "../actions/notifications"
import { updateServerAttrib } from "../actions/serverStatus"
import { updateModal } from "../../common/components/modal/actions/update-modal";
import { MODAL_EDIT_UI_PORT, MODAL_WARP_SYNC } from "../../common/components/modal/constants/modal-types";

const mapStateToProps = state => {

  return {
    connections: state.configuration.networks || {},
    sslEnabled: state.configuration.sslEnabled,
    selected: (Object.values(state.configuration.networks || [])).find(network => network.selected === true),
    serverStatus: state.serverStatus,
    gethBlockInfo: state.gethBlockInfo,
    augurNodeBlockInfo: state.augurNodeBlockInfo,
    downloadModalSeen: state.configuration.downloadModalSeen || false,
  }
}

const mapDispatchToProps = dispatch => ({
  updateConfig: sslEnabled => dispatch(updateConfig(sslEnabled)),
  addInfoNotification: message => dispatch(addInfoNotification(message)),
  updateServerAttrib: obj => dispatch(updateServerAttrib(obj)),
  updateModal: data => dispatch(updateModal({ type: MODAL_EDIT_UI_PORT, ...data })),
  updateModalWarpSync: data => dispatch(updateModal({ type: MODAL_WARP_SYNC, ...data })),
});

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;
