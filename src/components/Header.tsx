import React from "react";
import { AppTitle, Status } from "./parts";
import { inject, observer } from "mobx-react";
import { SettingStoreType, ConnStateStoreType } from "../types";

interface HeaderProps {
    setting?: SettingStoreType
    conn?: ConnStateStoreType
}

@inject('setting', 'conn')
@observer
export default class Header extends React.Component<HeaderProps> {
    render() {
        const {setting, conn} = this.props;
        return <React.Fragment>
            <AppTitle conn={conn} setting={setting} />
            <Status conn={conn} showDetail={setting!.showDetail} />
        </React.Fragment>
    }
}