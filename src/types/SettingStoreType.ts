export default interface SettingStoreType {
    showDetail: Boolean
    showSetting: Boolean
    showUserTarget: string | null
    showMessageTarget: string | null
    showSearchTarget: string | null
    showSearchMode: number
    setShowDetail(show: Boolean): void
    setShowSetting(show: Boolean): void
    setShowUserTarget(targetSerial: string | null): void
    setShowMessageTarget(targetId: string | null): void
    setShowSearchTarget(targetWord: string | null): void
    setShowSearchMode(mode: number): void
}