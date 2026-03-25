export type Briefcase = {
    accountno: string;
    payeebranch: string;
    payeebic: string;
    maxamount: string;
}

export interface DataItem {
    index: BigInteger;
    valuedate: string;
    remarks: string;
    eligibleamount: string;
    sanctionedamount: string;
    authremark: string;
    status: string;
    appno: string;
    appliedamount: string;
    filename: string;
}

export type BriefcaseRelatedResponse = {
    error: boolean;
    datas: DataItem[];
}