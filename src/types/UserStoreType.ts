import { UserType, SayType, PcStateType } from ".";

export default interface UserStoreType {
    currentUser: UserType
    logged: Boolean
    setLogged(logged: Boolean): void
    login(email: string, password: string): Promise<Boolean>
    logout(): Promise<Boolean>
    registration(name: string, email: string, password: string): Promise<Boolean>
    getUser: UserType | null
    updateUser(name: string, icon?: string, password?: string): Promise<Boolean>
    updateUserProfile(prof: string): Promise<Boolean>
    updateUserFollow(tgtSerial: string): Promise<Boolean>
    updateUserUnFollow(tgtSerial: string): Promise<Boolean>
    updateUserLike(tgtSay: SayType): Promise<Boolean>
    updateUserUnLike(tgtSay: SayType): Promise<Boolean>
}