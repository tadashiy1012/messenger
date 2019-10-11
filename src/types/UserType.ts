export default interface UserType {
    name: string
    serial: string
    email: string
    password: string
    clientId: string
    icon: string
    profile: string
    update: number
    follow: string[]
    follower: string[]
    like: string[]
    notify: [string, Boolean][]
};