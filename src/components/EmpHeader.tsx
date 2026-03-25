import React from "react";
import MultiInputRow from "./MultipleInputRow";

interface empheaderinterface {
    empdetails : any;
}
const EmpHeader: React.FC<empheaderinterface> = ({empdetails}) => {

    return (<>
        <MultiInputRow numInputs={4}
            labels={['Employee No.', 'Employee Name', 'Designation', 'Branch']}
            names={['empno', 'empname', 'desig', 'branch']}
            classnames={['input-data input-center readonly', 'input-data input-center readonly',
                'input-data input-center readonly', 'input-data input-center readonly']}
            ids={['empno', 'empname', 'desig', 'branch']} 
            values={[empdetails?.pfCode, empdetails?.name, empdetails?.designation, empdetails?.branch]}
            readonlys={[true, true, true, true]}
        />
    </>);
}

export default EmpHeader;