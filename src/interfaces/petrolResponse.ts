export type Monthdata ={
    fulldet : string;
}

export type PetrolResponse = {
    error: boolean;
    datas: string[];
    accountno: string;
    payeebranch: string;
    payeebic: string;
    dbac: string;
    debitamount: string;
    vehicletype: string;
    claimtype: string;
    appno: string;
    accno: string;
}

export interface DataItem {
    index: BigInteger;
    month: string;
    year: string;
    status: string;
    eligibleamount: string;
    appliedamount: string;
    sanctionedamount: string;
    authremark: string;
    appno: String;
}

export type PetrolRelatedResponse = {
    error: boolean;
    // datas: string[];
    datas: DataItem[];
}