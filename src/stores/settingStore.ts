import { observable, action } from "mobx";

export default class SettingStore {

    @observable
    showDetail: Boolean = false;

    @observable
    showSetting: Boolean = false;

    @observable
    showUserTarget: string | null = null;

    @observable
    showMessageTarget: string | null = null;

    @action
    setShowDetail(show: Boolean) {
        this.showDetail = show;
    }

    @action
    setShowSetting(show: Boolean) {
        this.showSetting = show;
    }

    @action
    setShowUserTarget(targetSerial: string | null) {
        this.showUserTarget = targetSerial;
    }

    @action
    setShowMessageTarget(targetId: string | null) {
        this.showMessageTarget = targetId;
    }

}