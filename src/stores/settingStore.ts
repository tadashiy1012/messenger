import { observable, action } from "mobx";

class SettingStore {

    @observable
    showDetail: Boolean = false;

    @observable
    showSetting: Boolean = false;

    @observable
    showUserTarget: string | null = null;

    @observable
    showMessageTarget: string | null = null;

    @observable
    showSearchTarget: string | null = null;

    @observable
    showSearchMode: number = 0;

    @observable
    showDebugMenu: Boolean = true;

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

    @action
    setShowSearchTarget(targetWord: string | null) {
        this.showSearchTarget = targetWord;
    }

    @action
    setShowSearchMode(mode: number) {
        this.showSearchMode = mode;
    }

}

export default new SettingStore();