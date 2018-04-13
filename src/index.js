import React from "react";
import RootSiblings from "react-native-root-siblings";
import {BackHandler} from "react-native";
import SendLocationView from "./SendLocation";

function showSendLocation(key, onSelect) {
    const _this = {};
    _this.sibling = new RootSiblings(<SendLocationView onClose={() => _this.sibling.destroy()} onSelect={(info) => {
        _this.sibling.destroy();
        onSelect(info);
    }} apiKey={key}/>);
    _this.listner = BackHandler.addEventListener("hardwareBackPress", () => {
        _this.sibling.destroy();
        _this.listner.remove();
        return true;
    });
    return _this.sibling;
}

export {
    SendLocationView,
    showSendLocation
}