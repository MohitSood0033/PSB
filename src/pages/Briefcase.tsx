import React, { useEffect, useRef, useState } from 'react';
import * as Constant from '../constant/Constant'; 
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCheckbox, 
    IonCol, IonContent, IonDatetime, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonRow } from '@ionic/react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import SelectedSidebar from '../components/SelectedSidebar';
import IdleTimeout from '../components/IdleTimeout';
import { API_URL, IDLE_TIMEOUT } from '../config/config';
import Toasts from '../components/Toast';
import { Storage } from '@ionic/storage';
import MultiInputRow from '../components/MultipleInputRow';
import CryptoJS from 'crypto-js';
import SubmitButton from '../components/SubmitButton';
import { Briefcase } from '../interfaces/briefcaseResponse';
import axios from 'axios';
import { alertCircleOutline, banOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import EmpHeader from '../components/EmpHeader';
import { ofunctions } from '../constant/ofunctions';

const BriefCase: React.FC = () => {

    const [userDetails, setUserDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [icon, setIcon] = useState<string>();
    const [briefcaseResponse, setBriefcaseResponse] = useState<Briefcase | null>(null);
    const [color, setColor] = useState<string>("danger");
    const [disable, setDisable] = useState<boolean>(true);
    const [formError, setFormError] = useState<boolean>(false);
    const [file, setfile] = useState();
    const [inputs, setInputs] = useState({});
    const [inputValue, setInputValue] = useState('');
    const [encryptedData, setEncryptedData] = useState(null);

    const history = useHistory();
    const storage = new Storage();
    storage.create();

    const key = CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY);
    const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);

    useEffect(() => {
        storage.get('user_details').then((userDetail) => {
            if (userDetail != null) {
                setUserDetails(userDetail);
            }
        });

    }, []);

     // Refresh page 
    // const refreshPage = () => {
    //     setLoading(true);
    //         setTimeout(() => {
    //         sessionStorage.setItem('navigation', 'true');
    //         window.location.reload();
    //         setLoading(false);
    //     }, 2000);
    // }

    // const redirectHomePage = () => {
    //     setTimeout(() => {
    //         // Any calls to load data go here basically for refreshment
    //         // event.detail.complete();
    //         sessionStorage.setItem('navigation', 'true');
    //         history.replace(Constant.HOME_REDIRECT);
    //         setLoading(false);
    //     }, 3000);
    // }

    const generateSignature = (data, secretKey) => {
        const hash = CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString(CryptoJS.enc.Base64);
        return hash;
    };
  
    const decryptData = (encryptedData, key, iv) => {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, { iv });
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      return decryptedText;
    };

    const toggleSideBar = () => {
        setSideBarVisible(!sideBarVisible);
    };

    const [formErrors, setFormErrors] = useState({
        litreclaimError: false,
        amountclaimError: false,
        remarksError: false,
    });

    const showDetails = (message, color, icon) => {
        setResponseErrorMessage(message);
        setIcon(icon);
        setColor(color);
        setShowToast(true);
        setLoading(false);
    }

    const checkdatevalidation = (event) => {
        const selectedDate = new Date(event.target.value);   

            if (selectedDate > new Date()) {
                showDetails("Date must be a past date or today", "danger", alertCircleOutline);
            }
    }

    // API to check eligibility
    const handleChange = (event) => {
        setLoading(true);

        const fetchBriefcaseData = async () => {
            try {
                setLoading(true);
                const bill = document.getElementById('billdate')  as HTMLInputElement;
                const billDateInput = bill?.value;

                if (billDateInput == '' || billDateInput == null || billDateInput == 'undefined') {
                    showDetails("Please Select bill date !!", "danger", alertCircleOutline);
                    return;
                }

                // check for date validation
                checkdatevalidation(event);
        
                const postData = {
                    user_token: userDetails.userToken,
                    device_id: userDetails.deviceId,
                    bill_date: billDateInput.trim()
                }
                
                const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
                const hash = generateSignature(postData, key);
            
                if (userDetails != null) {
                    setUserDetails(userDetails);      
                    const response = await axios.post(
                        `${API_URL}briefcase`,
                        {
                            data: eData,
                            hash: hash
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    if (response.status === 200) {
                        setLoading(false);
                        const responseBody = response.data;
                        let responseData = decryptData(responseBody.data, key, iv );
                        const resHash = generateSignature(JSON.parse(responseData), key);
                        responseData = JSON.parse(responseData);
                        if(resHash == responseBody.hash){
                            if(!responseData.error){
                                setBriefcaseResponse(responseData);
                                setDisable(false);
                            }
                        } else {
                            showDetails(responseData?.message, "danger", banOutline);
                            // setShowToast(true);
                            // setLoading(false);
                            // setIcon(banOutline);
                            // setResponseErrorMessage(responseData.message);
                            ofunctions.redirectHomePage(history, loading);
                        }
                    } else {
                        showDetails(Constant.HASH_MISMATCH, "danger", banOutline);
                        // setShowToast(true);
                        // setLoading(false);
                        // setIcon(banOutline);
                        // setResponseErrorMessage(Constant.HASH_MISMATCH);
                        ofunctions.redirectHomePage(history, loading);
                    }
                        
                } else {
                    showDetails(Constant.USER_DETAILS_NOT_PRESENT, "danger", banOutline);
                    // setShowToast(true);
                    // setLoading(false);
                    // setIcon(banOutline);
                    // setResponseErrorMessage(Constant.USER_DETAILS_NOT_PRESENT);
                    // redirectHomePage();
                    ofunctions.redirectHomePage(history, loading);
                }
            } catch (error) {
                showDetails(error?.response?.data?.error_description, "danger", alertCircleOutline);
                // setShowToast(true);
                // setIcon(alertCircleOutline);
                // setLoading(false);
                // setResponseErrorMessage(error?.response?.data?.error_description);
                // redirectHomePage();
                ofunctions.redirectHomePage(history, loading);
            }
        };
        fetchBriefcaseData();
    };

    // API for submit button
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let formError = false;
        var fieldsToValidate = ['claimamount', 'vendorname', 'vendoradd', 'remark'];
        
        fieldsToValidate.forEach((fieldName) => {
            const input = e.currentTarget.elements.namedItem(fieldName) as HTMLInputElement;
            if (input) {
                const inputValue = input.value.trim();
        
                if (!inputValue) {
                    formError = true;
                    showDetails("Please fill all the given inputs !!", "danger", alertCircleOutline);
                    // setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: true }));
                    return;
                } else {
                    if (fieldName == 'claimamount') {
                        const regex = /^-?\d+(\.\d+)?$/;
                        if (!regex.test(inputValue)) {
                            // setResponseErrorMessage("Amount must be in integer or decimal !!");
                            // setShowToast(true);
                            // setIcon(alertCircleOutline);
                            formError = true;
                            showDetails("Amount must be in integer or decimal !!", "danger", alertCircleOutline);
                            return;
                        }
                    }
                    // Commented as discussed with rajesh sir
                    // if (fieldName == 'claimamount' && parseFloat(inputValue) > parseFloat(briefcaseResponse?.maxamount)) {
                    //     formError = true;
                    //     showDetails("Amount can not be greater than maximum reimbursement amount !!", "danger", alertCircleOutline);
                    //     return;
                    // }
                    setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: false }));
                }
            }
        });
  
        if (!formError) {
            setLoading(true);
            const billDateInput = e.currentTarget.elements.namedItem('billdate') as HTMLInputElement;
            const billDateValue = billDateInput?.value.trim();
            const claimAmountInput = e.currentTarget.elements.namedItem('claimamount') as HTMLInputElement;
            const claimAmountValue = claimAmountInput?.value.trim();
            const vendorNameInput = e.currentTarget.elements.namedItem('vendorname') as HTMLInputElement;
            const vendorNameValue = vendorNameInput?.value.trim();
            const vendorAddInput = e.currentTarget.elements.namedItem('vendoradd') as HTMLInputElement;
            const vendorAddValue = vendorAddInput?.value.trim();
            const remarkInput = e.currentTarget.elements.namedItem('remark') as HTMLInputElement;
            const remarkValue = remarkInput?.value.trim();
            const fileInput = e.currentTarget.elements.namedItem('billupload') as HTMLInputElement;

            const files = fileInput.files[0];
            if (files == null) {
                showDetails("Please upload bill", "danger", alertCircleOutline);
                return;
            }

            // check for date validation
            checkdatevalidation(e);

            const allowedTypes = ['application/pdf'];
            const minSize = 10 * 1024; // 10 KB
            const maxSize = 600 * 1024; //  600 KB

            if (!allowedTypes.includes(files.type)) {
                showDetails("Please upload a PDF file.", "danger", alertCircleOutline);
                return;
            }

            if (files.size < minSize) {
                showDetails("File size cannot be less than 10 KB.", "danger", alertCircleOutline);
                return;
            }
            
            if (files.size > maxSize) {
                showDetails("File size cannot exceed 600 KB.", "danger", alertCircleOutline);
                return;
            }

            if (parseFloat(claimAmountValue) <= 0) {
                showDetails("Amount cannot be less than or equal to 0", "danger", alertCircleOutline);
                return;
            }

            let checkbox1 = document.getElementById('check1');
            let checkbox2 = document.getElementById('check2');
            let checkbox3 = document.getElementById('check3');
            let checkbox4 = document.getElementById('check4');
            if (checkbox1.ariaChecked == 'false' || checkbox2.ariaChecked == 'false' || checkbox3.ariaChecked == 'false'
                    || checkbox4.ariaChecked == 'false') {
                
                showDetails("Please check all the declaration before submit !!", "danger", alertCircleOutline);
                return;
            }
            try {
                const postData = {
                    user_token: userDetails.userToken,
                    device_id: userDetails.deviceId,
                    bill_date: billDateValue,
                    amount_claim: claimAmountValue,
                    vendor_name: vendorNameValue,
                    vendor_add: vendorAddValue,
                    remark: remarkValue,
                    eligible_amount: briefcaseResponse?.maxamount,
                    fileuploads: fileInput.files[0],
                    filename: fileInput.files[0].name,
                    filesize: fileInput.files[0].size
                }

                const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
                const hash = generateSignature(postData, key);
                const reader = new FileReader();
                var selectedFile = fileInput.files[0];
         
                const formData = new FormData();
                formData.append('files', fileInput.files[0]);
                formData.append('eData', eData);
                formData.append('hash', hash);

                const response = await axios.post(
                    `${API_URL}briefcase-add-claim`, 
                        formData,
                    {
                        headers: {
                        // 'Content-Type': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                if (response.status === 200) {
                    setLoading(false);
                    const responseBody = response.data;
                    let responseData = decryptData(responseBody.data, key, iv );
                    const resHash      = generateSignature(JSON.parse(responseData), key);
                    responseData = JSON.parse(responseData);
                    if(resHash == responseBody.hash){
                        setFormError(false);
                        if(!responseData.error) {
                            showDetails("Briefcase claim added successfully !!", "danger", checkmarkCircleOutline);
                            // refreshPage();
                            // ofunctions.refreshPage(loading, history);
                            ofunctions.redirectToPage(history, loading, '/viewbriefcase');
                        }
                        else {
                            showDetails(responseData.message, "danger", alertCircleOutline);
                        }
                    } else{
                        showDetails(Constant.HASH_MISMATCH, "danger", banOutline);
                    }
                } else {
                    showDetails(response?.data?.message, "danger", alertCircleOutline);
                }
            } catch (error) {
                showDetails(error?.response?.data?.error_description, "danger", alertCircleOutline);
            }
        } else {
            // To show the respective error
            setShowToast(true);
            setIcon(alertCircleOutline);
        }
    };

    if (showToast) {
        setTimeout(() => {
          // To make show to set as false
          setShowToast(false);
          setColor("danger");
        }, 2000);  
    }

    return (
        <>
            <IonLoading isOpen={loading} spinner="lines-sharp" animated={true} message="Please wait..." />
            <Menu currentMenu='Briefcase'/>
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header />
                <IonContent fullscreen className="ion-padding">
                <IonCard className="psb-page-card filter-section box">
                    <IonCardHeader>
                    <IonCardTitle>Apply For Briefcase Allowance Claim</IonCardTitle>
                    </IonCardHeader>
                    <br />
                    <IonCardContent style={{fontSize: "10px"}}>
                        <form onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className="rcorners animated-box">
                                {/* <MultiInputRow numInputs={4}
                                    labels={['Enter Employee No.', 'Enter Employee Name', 'Designation', 'Bic']}
                                    names={['empno', 'empname', 'desig', 'bic']}
                                    classnames={['input-data input-center readonly', 'input-data input-center readonly',
                                        'input-data input-center readonly', 'input-data input-center readonly']}
                                    ids={['empno', 'empname', 'desig', 'bic']} 
                                    values={[userDetails?.pfCode, userDetails?.name, userDetails?.designation, userDetails?.branch]}
                                    readonlys={[true, true, true, true]}
                                /> */}
                                <EmpHeader empdetails={userDetails} />
                            </div>
                            <br />
                            <div className="rcorners animated-box">
                                <h1 style={{textAlign:"center", marginTop: "revert"}}>
                                    <u>Please Select Bill Date to claim</u>
                                </h1>
                                <IonRow>
                                    <IonCol size="12" sizeLg="6" sizeMd="6" sizeSm="12" sizeXl="6" sizeXs="12">
                                        <IonInput  type="date" label="Select Bill Date" name="billdate" id="billdate"
                                            labelPlacement="floating" fill="outline" placeholder="Enter Bill Date" 
                                            max={new Date().toISOString().slice(0, 10)}
                                            className="input-data input-center">
                                        </IonInput>
                                    </IonCol>
                                    <IonCol size="12" sizeLg="6" sizeMd="6" sizeSm="12" sizeXl="6" sizeXs="12">
                                        <IonInput label="Maximum Amount"  name= "amount" labelPlacement="floating" fill="outline"
                                            id="amount" className="input-data input-center readonly" 
                                            value={briefcaseResponse?.maxamount} readonly>
                                        </IonInput>
                                    </IonCol>
                                </IonRow>
                                <br />
                                <center>
                                    <IonButton shape="round" type="button" mode="ios" color="danger" style={{margin: "auto"}}
                                        onClick={handleChange} >Check Eligibility</IonButton>
                                </center>
                                
                            </div>
                            <br />
                            <br />
                        
                            <div className="rcorners animated-box">
                                <MultiInputRow numInputs={4}
                                    // types={['number']}
                                    labels={['Amount to be Claimed', 'Vendor Name', 'Vendor Address', 'Enter Remarks']}
                                    names={['claimamount', 'vendorname', 'vendoradd', 'remark']} 
                                    classnames={['input-data input-center', 'input-data input-center', 'input-data input-center', 
                                        'input-data input-center']}
                                    ids={['claimamount', 'vendorname', 'vendoradd', 'remark']} 
                                    disables={[disable, disable, disable, disable]}
                                    maxlengths={[5, null, null, 30]}
                                    // maxs={[99999]}
                                />
                            
                                <IonRow>
                                    <IonCol size="12" sizeLg="6" sizeMd="6" sizeSm="12" sizeXl="6" sizeXs="12">
                                        <IonItem>
                                            <IonLabel style={{width: "25%"}}><b>Attach Bill :</b></IonLabel>
                                            {/* <IonInput style={{width: "50%"}}>
                                                <input type="file" name="billupload" style={{width: "50%"}}  multiple disabled={disable} />
                                            </IonInput> */}
                                            {/* <IonInput style={{width: "50%"}} disable> */}
                                                <input type="file" name="billupload" style={{width: "100%", marginLeft:"35%"}}  multiple disabled={disable} />
                                            {/* </IonInput> */}
                                        </IonItem>
                                    </IonCol>
                                </IonRow>
                            </div>
                            <br/>
                            <br/>
                            
                            <div className="rcorners animated-box">
                                <center>
                                    <div><h1><b><u>Declarations</u></b></h1></div>
                                </center>
                                <IonItem className= "animated-box">
                                    <div className="checkbox-data">
                                    <IonCheckbox color="primary" id="check1" />
                                    </div>
                                    <IonLabel>I have read and applied as per the HO HRD.Cir No:3154 dated 24-June-2021 and any other circular issued by HO HRD from time to time.</IonLabel>
                                </IonItem>
                                <IonItem className= "animated-box">
                                    <div className="checkbox-data">
                                        <IonCheckbox color="primary" id="check2" />
                                    </div>
                                    <IonLabel>I here by Declare that my salary Account
                                        is <b>{briefcaseResponse?.accountno ? briefcaseResponse?.accountno: ' - '}</b>  and
                                        salary paying branch is <b>{userDetails?.branch} ({userDetails?.branchCode})</b>.
                                        I request you to credit the  Briefcase Reimbursement to the salary account and through salary paying branch as mentioned. </IonLabel> 
                                </IonItem>
                                <IonItem className= "animated-box">
                                    <div className="checkbox-data">
                                        <IonCheckbox color="primary" id="check3" />
                                    </div>
                                    <IonLabel>This is my full and final Briefcase Reimbursement claim and I will further not claim any Briefcase Reimbursement in future for the above period</IonLabel> 
                                </IonItem>
                                <IonItem className= "animated-box">
                                    <div className="checkbox-data">
                                        <IonCheckbox color="primary" id="check4" />
                                    </div>
                                    <IonLabel>I hereby declare that I have bought the briefcase for the office use only.</IonLabel> 
                                </IonItem>
                            </div>
                            <br/>
                            <IonRow>
                                <IonCol size="12" sizeLg="12" sizeMd="12" sizeSm="12" sizeXl="12" sizeXs="12">
                                    <div className="ion-text-center search-btn-container" >
                                        <SubmitButton name="Submit" cancelbutton={true} disables={disable} issubmit={true} />
                                    </div>
                                </IonCol>
                            </IonRow>
                        </form>
                    </IonCardContent>
                </IonCard>
                </IonContent>
            <SelectedSidebar sidebarname='applybriefcase' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
            </IonPage>
            <IdleTimeout timeout={IDLE_TIMEOUT} />
            {showToast && <Toasts messages={responseErrorMessage} showToasts={showToast} colours={color} durations={2000} icons={icon} />}
        </>
    );
}

export default BriefCase;