import { UserType, SayType, PcStateType } from ".";
import { ShowMode } from "../enums";

export default interface MyStoreType {
    id: string
    currentUser: UserType
    getUser: UserType | null
    updateUser(name: string, icon?: string, password?: string): Promise<Boolean>
    updateUserFollow(tgtSerial: string): Promise<Boolean>
    updateUserUnFollow(tgtSerial: string): Promise<Boolean>
    updateUserLike(tgtSay: SayType): Promise<Boolean>
    updateUserUnLike(tgtSay: SayType): Promise<Boolean>
    logged: Boolean
    setLogged(logged: Boolean): void
    addSay(say: SayType): Promise<Boolean>
    timeLine: Array<SayType>
    findAuthorIcon(authorId: string): string
    findAuthorname(authorId: string): string
    findUser(userSerial: string): UserType | null
    findUserSay(userSerial: string): Array<SayType>
    findSay(sayId: string): SayType | undefined
    login(email: string, password: string): Promise<Boolean>
    logout(): Promise<Boolean>
    registration(name: string, email: string, password: string): Promise<Boolean>
    showDetail: Boolean
    setShowDetail(show: Boolean): void
    showSetting: Boolean
    setShowSetting(show: Boolean): void
    showMode: ShowMode
    setShowMode(mode: ShowMode): void
    showUserTarget: string
    setShowUserTarget(targetSerial: string | null): void
    showMessageTarget: string
    setShowMessageTarget(targetId: string | null): void
    allClear(): Promise<Boolean>
    pcAState: PcStateType
    pcBState: PcStateType
    pcCState: PcStateType
}