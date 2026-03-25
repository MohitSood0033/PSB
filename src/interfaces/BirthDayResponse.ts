export type Records ={
    empno : string;
    designation: string;
    scale:string;
    bic:string;
    branch_Name:string;
    name:string;
}
  
export type BirthDayResponse = {
    error: boolean;
    records : Records[];
}