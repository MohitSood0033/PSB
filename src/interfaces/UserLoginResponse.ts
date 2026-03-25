export type UserDetails ={
    pfCode : string;
    name:string;
    designation: string;
    scale:string;
    branchCode:string;
    branch:string;
    zonalCode:string;
    zone:string;
    deviceId:string;
    userToken:string;
}

export type UserLoginResponse = {
    error: boolean;
    message:string;
    userDetails : UserDetails;
}