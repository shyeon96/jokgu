export interface ApiResponse<T=null> {
    message?: string;
    data?: T;
}

export interface loginForm {
    username: string;
    password: string;
}

export interface SignupForm {
    username: string,
    password: string,
    name: string,
    address: string,
    account: string,
    phone: string,
}

export interface FieldsCreateForm {
    name: string,
    address?: string,
    cost?: string,
    is_indoor?: number,
    is_reservable?: number,
    url?: string,
    is_parking?: number
}

export interface Fields {
    id: number,
    name: string,
    address?: string,
    lat?: string,
    lng?: string,
    cost?: string,
    url?: string,
    isIn?: number,
    isRes?: number
    isPark?: number
}

export interface GroupList {
    gid: number,
    gname: string,
    gcode: string,
    ugrole: string,
    count: number
}

export interface GroupModal {
    gid: number,
    name: string,
    isJoin: boolean
}

export interface pendingUser {
    ugid: number,
    uid: number,
    name: string
}

export interface GroupCreateForm {
    name: string,
    description: string
}

export interface PlanCreateForm {
    date: string,
    time: string,
    fid: number,
    uid: number[]
}

export interface Plan {
    pid: number,
    planname: string
    fieldname: string,
    date: string,
    time: string,
    count: number,
    groupname: string
}

export interface PlanDetailResponse {
    planname: string,
    fieldname: string,
    address?: string,
    lat?: string,
    lng?: string,
    date: string,
    time: string,
    groupname: string
}

export interface Users {
    uid: number,
    name: string,
    team?: string,
    victory?: number
}

export interface Match {
    mid: number,
    winner: string,
    game: string,
    referee?: string,
    teamA?: Users[],
    teamB?: Users[],
    teams?: Users[],
    created_at?: string
}

export interface PlanInfo {
    pid: number,
    planname: string,
    date: string,
    time: string,
    groupname: string
}

export interface Winrate {
    gid: number,
    gname: string,
    win: number,
    lose: number
}

export interface groupRatio {
    gid: number,
    gname: string,
    count: number,
    totalCount: number
}

export interface MyPage {
    uid: number,
    name: string,
    address: string,
    account: string,
    phone: string,
    myplans: PlanInfo[],
    winrate: Winrate[],
    groupRatio: groupRatio[]
}