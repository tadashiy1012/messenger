import { UserType, SayType, PcStateType } from ".";

export default interface MyStoreType {
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
    findAuthorName(authorId: string): string
    findUser(userSerial: string): UserType | null
    findUserAsync(userSerial: string): Promise<UserType | null>
    findUserSay(userSerial: string): Promise<Array<SayType>>
    findSay(sayId: string): SayType | undefined
    login(email: string, password: string): Promise<Boolean>
    logout(): Promise<Boolean>
    registration(name: string, email: string, password: string): Promise<Boolean>
}