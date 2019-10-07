import settingStore from '../src/stores/settingStore';

describe('settingStore', () => {
    test('settingStoreが正常に機能すること', () => {
        expect(settingStore).not.toBeNull();
        expect(settingStore.showDetail).toBeFalsy();
        expect(settingStore.showSetting).toBeFalsy();
        expect(settingStore.showUserTarget).toBeNull();
        expect(settingStore.showMessageTarget).toBeNull();
        settingStore.setShowDetail(true);
        expect(settingStore.showDetail).toBeTruthy();
        settingStore.setShowSetting(true);
        expect(settingStore.showSetting).toBeTruthy();
        settingStore.setShowUserTarget('hogehoge');
        expect(settingStore.showUserTarget).toBe('hogehoge');
        settingStore.setShowMessageTarget('fugafuga');
        expect(settingStore.showMessageTarget).toBe('fugafuga');
    });
});