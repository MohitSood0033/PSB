import React, { useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonSelect, IonSelectOption,
  IonRow, IonCol, IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast, IonLoading, 
  IonInput, IonCheckbox,
  RefresherEventDetail,
  IonButton,
  IonIcon,
  isPlatform} from '@ionic/react';
import '../css/Petrol.css';
import { Storage } from '@ionic/storage';
import Menu from '../components/Menu';
import Header from '../components/Header';
import axios from 'axios';
import { API_URL, IDLE_TIMEOUT } from '../config/config';
import { useHistory } from 'react-router-dom';
import IdleTimeout from '../components/IdleTimeout';
import CryptoJS from 'crypto-js';
import SubmitButton from '../components/SubmitButton';
import MultiInputRow from '../components/MultipleInputRow';
import SelectedSidebar from '../components/SelectedSidebar';
import { PetrolResponse } from '../interfaces/petrolResponse';
import Toasts from '../components/Toast';
import { alertCircleOutline, banOutline, checkmarkCircleOutline, informationCircleOutline } from 'ionicons/icons';
import * as Constant from '../constant/Constant'; 
import EmpHeader from '../components/EmpHeader';
import { ofunctions } from '../constant/ofunctions';

const Petrol: React.FC = () => {

    const [userDetails, setUserDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);  
    const [loading, setLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [icon, setIcon] = useState<string>();
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState<string>(null);
    const history = useHistory();
    const key = CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY);
    const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);
    const [petrolResponse, setPetrolResponse] = useState<PetrolResponse | null>(null);
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedPetrolDetails, setSelectedPetrolDetails] = useState<any | null>(null);
    const [formError, setFormError] = useState<boolean>(false);
    const [disable, setDisable] = useState<boolean>(true);
    const [btndisable, setBtnDisable] = useState<boolean>(true);
    const [ltrdisable, setLtrDisable] = useState<boolean>(true);
    const [inputs, setInputs] = useState({});
    const [color, setColor] = useState<string>("danger");

    const storage = new Storage();
    storage.create();

    var isAndroid = isPlatform('android');
    var isMobile = isPlatform('mobile');

    useEffect(() => {
      // Get today's date
      const today = new Date();
      const dates = today.getDate()+'-' + (today.getMonth()+1) + '-'+today.getFullYear();
      setCurrentDate(dates);
      
      storage.get('user_details').then((userDetails) => {
        if (userDetails != null) {
            setUserDetails(userDetails);
        }
      });

      const fetchPetrolData = async () => {
        try {
            setLoading(true);
            const userDetails = await storage.get(Constant.USER_DETAILS);
      
            const postData = {
                user_token: userDetails.userToken,
                device_id: userDetails.deviceId
            }
              
            const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
            const hash = generateSignature(postData, key);
        
            if (userDetails != null) {
                  setUserDetails(userDetails);      
                  const response = await axios.post(
                      `${API_URL}petrol`,
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
                            setPetrolResponse(responseData);
                          }
                      } else {
                          setShowToast(true);
                          setLoading(false);
                          setIcon(banOutline);
                          setResponseErrorMessage(responseData.message);
                      }
                  } else {
                      setShowToast(true);
                      setLoading(false);
                      setIcon(banOutline);
                      setResponseErrorMessage(Constant.HASH_MISMATCH);
                      // redirectHomePage();
                      ofunctions.redirectHomePage(history, loading);
                  }
                    
            } else {
                setShowToast(true);
                setLoading(false);
                setIcon(banOutline);
                setResponseErrorMessage(Constant.USER_DETAILS_NOT_PRESENT);
                // redirectHomePage();
                ofunctions.redirectHomePage(history, loading);
            }
          } catch (error) {
              setShowToast(true);
              setIcon(alertCircleOutline);
              setLoading(false);
              setResponseErrorMessage(error?.response?.data?.error_description);
              ofunctions.redirectHomePage(history, loading);
          }
      };

      // refreshPageAtStrating();
      fetchPetrolData();
  }, []);

  const showDetails = (message, color, icon) => {
    setResponseErrorMessage(message);
    setIcon(icon);
    setColor(color);
    setShowToast(true);
    setLoading(false);
  }

  // const redirectHomePage = () => {
  //   setTimeout(() => {
  //       // Any calls to load data go here basically for refreshment
  //       // event.detail.complete();
  //       sessionStorage.setItem('navigation', 'true');
  //       history.replace(Constant.HOME_REDIRECT);
  //       setLoading(false);
  //     }, 3000);
  // }

  if (showToast) {
    setTimeout(() => {
      // To make show to set as false
      setShowToast(false);
    }, 3000);
    
  }

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

  const handleChange = (event) => {
      event.preventDefault();
      setLoading(true);
      setSelectedValue(event.detail.value);

      const petroldatadetails = async () => {
        try {
          const postData = {
            monthyear : event.detail.value,
            user_token: userDetails.userToken,
            device_id: userDetails.deviceId
          }

          const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
          const hash = generateSignature(postData, key);

          if (userDetails != null) {
            setUserDetails(userDetails);      
            const response = await axios.post(
                `${API_URL}petrol-details`,
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
                      setDisable(false);
                      setBtnDisable(false);
                      setSelectedPetrolDetails(responseData.petroldataDetails);
                      if (responseData.petroldataDetails?.availment != Constant.DECLARATION_BASIS) {
                            setLtrDisable(false);
                      }
                    }
                } else {
                    showDetails(responseData?.message, "danger", banOutline);
                    // setShowToast(true);
                    // setLoading(false);
                    // setIcon(banOutline);
                    // setResponseErrorMessage(responseData.message);
                  }
                }
                else{
                    // setShowToast(true);
                    // setLoading(false);
                    // setIcon(banOutline);
                    // setResponseErrorMessage(Constant.HASH_MISMATCH);
                    showDetails(Constant.HASH_MISMATCH, "danger", banOutline);
                }
                
            } else {
                // setResponseErrorMessage("Error occured");
                // setShowToast(true);
                // setLoading(false);
                // setIcon(banOutline);
                showDetails("Error occured", "danger", banOutline);
            }
        }  catch (error) {
            // setResponseErrorMessage(error);
            // setShowToast(true);
            // setLoading(false);
            // setIcon(banOutline);
            showDetails(error?.response?.data?.error_description, "danger", banOutline);
        }
    }

    petroldatadetails();
  };

  const [formErrors, setFormErrors] = useState({
    litreclaimError: false,
    amountclaimError: false,
    remarksError: false,
  });

  // Function call on submit button
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // If sessionstorage is not present then logout
      if (sessionStorage.getItem('user_details') === null) {
          storage.clear();
      }

      let formError = false;
      var fieldsToValidate;
      if (!ltrdisable) {
        fieldsToValidate = ['litre', 'amount', 'remarks'];
      } else {
        fieldsToValidate = ['amount', 'remarks'];
      }
      
      fieldsToValidate.forEach((fieldName) => {
        const input = e.currentTarget.elements.namedItem(fieldName) as HTMLInputElement;
        if (input) {
          const inputValue = input.value.trim();
    
          if (!inputValue) {
            formError = true;
            setResponseErrorMessage("Please fill all the given inputs !!");
            setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: true }));
          } else {
            if (fieldName == 'amount') {
              const regex = /^-?\d+(\.\d+)?$/;
              if (!regex.test(inputValue)) {
                  // setResponseErrorMessage("Amount must be in integer or decimal !!");
                  // setShowToast(true);
                  // setIcon(alertCircleOutline);
                  formError = true;
                  showDetails("Amount must be in integer or decimal !!", "danger", alertCircleOutline);
                  return;
              }
              // Removed according to discussion with kamal sir, rahul sir and karan sir
              // if (parseFloat(inputValue) > parseFloat(selectedPetrolDetails?.finalpetrolallow)) {
              //     formError = true;
              //     // setResponseErrorMessage("Amount can not be greater than maximum reimbursement amount !!");
              //     // setShowToast(true);
              //     // setIcon(alertCircleOutline);
              //     showDetails("Amount can not be greater than maximum reimbursement amount !!", "danger", alertCircleOutline);
              //     return;
              // }

              if (inputValue == '0' || Number(inputValue) < 0) {
                  formError = true;
                  // setResponseErrorMessage("Amount can not be 0 !!");
                  // setShowToast(true);
                  // setIcon(alertCircleOutline);
                  showDetails("Amount can not be 0 or negative !!", "danger", alertCircleOutline);
                  return;
              }
            }
            setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: false }));
          }
        }
      });
    
      if (!formError) {
        setLoading(true);
        const litreInput = e.currentTarget.elements.namedItem('litre') as HTMLInputElement;
        const litreValue = litreInput?.value.trim();
        const amountInput = e.currentTarget.elements.namedItem('amount') as HTMLInputElement;
        const amountValue = amountInput?.value.trim();
        const remarkInput = e.currentTarget.elements.namedItem('remarks') as HTMLInputElement;
        const remarkValue = remarkInput?.value.trim();

        let checkbox1 = document.getElementById('check1');
      let checkbox2 = document.getElementById('check2');
      if (checkbox1.ariaChecked == 'false' || checkbox2.ariaChecked == 'false') {
          // setResponseErrorMessage("Please check both the declaration before submit !!");
          // setShowToast(true);
          // setIcon(alertCircleOutline);
          // setLoading(false);
          showDetails("Please check both the declaration before submit !!", "danger", alertCircleOutline);
          // formError = true;
          return;
      }
        try {
          const postData = {
            user_token: userDetails.userToken,
            device_id: userDetails.deviceId,
            pfCode: userDetails?.pfCode,
            monthyear: selectedValue,
            litre: litreValue,
            remark: remarkValue,
            claim_type: selectedPetrolDetails?.claimtype,
            veh_type: selectedPetrolDetails?.vehicletype,
            pet_rate: selectedPetrolDetails?.petrol,
            totcharge: amountValue,
            eligible_litre: selectedPetrolDetails?.finallitreval,
            eligible_amt: selectedPetrolDetails?.finalpetrolallow,
            leave_days: selectedPetrolDetails?.leave,
            appno_data: selectedPetrolDetails?.appno,
            acno: petrolResponse?.accountno
          }

          // const postData = inputs;
          
          const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
          const hash = generateSignature(postData, key);

          const response = await axios.post(
            `${API_URL}petrol-add-claim`,
            {
              data: eData,
              hash:hash
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          if (response.status === 200) {
              const responseBody = response.data;
              let responseData = decryptData(responseBody.data, key, iv );
              const resHash      = generateSignature(JSON.parse(responseData), key);
              responseData = JSON.parse(responseData);
              if(resHash == responseBody.hash){
                setFormError(false);
                if(!responseData.error) {
                    showDetails("Petrol claim added successfully !!", "success", checkmarkCircleOutline);
                    // ofunctions.refreshPage(loading, history);
                    ofunctions.redirectToPage(history, loading, '/viewpetrol');
                }
                else {
                    showDetails(responseData?.message, "danger", alertCircleOutline);
                    setFormError(true);
                }
            } else{
                showDetails(responseData?.message, "danger", banOutline);
                setFormError(true);
            }
            
          } else {
              showDetails(response?.data?.message, "danger", banOutline);
              setFormError(true);
          }
        } 
        catch (error) {
            showDetails(error?.response?.data?.error_description, "danger", alertCircleOutline);
            setFormError(true);
        }
      } else {
        // To show the respective error
          setShowToast(true);
          setLoading(false);
          setIcon(alertCircleOutline);
          // showDetails(responseErrorMessage ? responseErrorMessage : "Error in saving data !!", "danger", alertCircleOutline);
      }
  };

  return (
    <>
      <IonLoading isOpen={loading} spinner="lines-sharp" animated={true} message="Please wait..." />
      <Menu currentMenu='petrol'/>
      <IonPage className="psb-pages platform-specific-page" id="main-content">
        <Header/>
        <IonContent fullscreen className="ion-padding">
          <IonCard className="psb-page-card filter-section box">
            <IonCardHeader>
              <IonCardTitle>Apply For Petrol Allowance Claim</IonCardTitle>
            </IonCardHeader>
            <br />
            <IonCardContent style={{fontSize: "10px"}}>
            <form onSubmit={handleSubmit}>
                <div className="rcorners animated-box">
                  <EmpHeader empdetails={userDetails} />
                </div>
                <br />
                <div className="rcorners animated-box"  id="month-year">
                    {/* <MultiInputRow numInputs={3}
                      placeholders={['Enter Emp No. Here...', 'Enter Emp Name Here...', '']}
                      labels={['Enter Employee No.', 'Enter Employee Name', 'Current Date']}
                      names={['empno', 'empname', 'date']} 
                      classnames={['input-data input-center readonly', 'input-data input-center readonly', 'input-data input-center readonly']}
                      ids={['empno', 'empname', 'date']} 
                      values={[userDetails?.pfCode, userDetails?.name, currentDate]}
                      readonlys={[true, true, true]}
                    /> */}
                    <IonRow>
                      {/* <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                          <IonInput label="Employee No." labelPlacement="floating" fill="outline" 
                              placeholder="Enter Emp No. Here..."  className="input-data input-center readonly"
                              name = "empno" value={userDetails?.pfCode} readonly>
                          </IonInput>
                      </IonCol>
                      <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                          <IonInput label="Employee Name" labelPlacement="floating" fill="outline" 
                              placeholder="Enter Emp Name Here..."  className="input-data input-center readonly" 
                              name = "empname" value={userDetails?.name} readonly>
                          </IonInput>
                      </IonCol> */}
                      
                      {/*
                        <IonCol size="12" sizeLg="6" sizeMd="6" sizeSm="12" sizeXl="6" sizeXs="12">
                            <IonSelect label="Select Month and Year" labelPlacement="floating" fill="outline" onIonChange={handleChange} className="input-data">
                                {petrolResponse.datas.map((item, index) => (
                                    <IonSelectOption key={index} value={item}>{item}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonCol>
                      )} */}
                      {petrolResponse && ((!isAndroid && !isMobile) ? (
                        <>
                          <IonCol size="12" sizeLg="6" sizeMd="6" sizeSm="12" sizeXl="6" sizeXs="12">
                                <h2 style={{textAlign: "center", marginTop: "revert", fontWeight:"bold"}}>Please Select Month and year to claim for petrol and proceed further</h2>
                          </IonCol>
                          <IonCol size="12" sizeLg="6" sizeMd="6" sizeSm="12" sizeXl="6" sizeXs="12">
                            <IonSelect label="Select Month and Year" labelPlacement="floating" fill="outline" onIonChange={handleChange} className="input-data">
                                {petrolResponse.datas.map((item, index) => (
                                    <IonSelectOption key={index} value={item}>{item}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonCol>
                        </>
                      ) :(
                        <IonCol size="12">
                            <IonSelect label="Select Month and Year" labelPlacement="floating" fill="outline" onIonChange={handleChange} className="input-data">
                                {petrolResponse.datas.map((item, index) => (
                                    <IonSelectOption key={index} value={item}>{item}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonCol>
                      ))}
                      </IonRow>
                {/* </div>
                
                <br />
                <br /> */}
                {/* <div className="rcorners animated-box" id="month-year">
                    <IonRow>
                      {petrolResponse && (
                        <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                            <IonSelect label="Select Month and Year" labelPlacement="floating" fill="outline" onIonChange={handleChange} className="input-data">
                                {petrolResponse.datas.map((item, index) => (
                                    <IonSelectOption key={index} value={item}>{item}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonCol>
                      )}
                      <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                          <IonInput label="Debit Acc. No. for the head" labelPlacement="floating" fill="outline" 
                              placeholder="Debit Acc. No. for the head.."  className="input-data input-center readonly" 
                              value={petrolResponse?.dbac ?? '0'} readonly>
                            </IonInput>
                      </IonCol>
                      <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                          <IonInput label="Total Debit for the head" labelPlacement="floating" fill="outline" 
                              placeholder="Total Debit for the head.."  className="input-data input-center readonly" 
                              value={petrolResponse?.debitamount} readonly>
                            </IonInput>
                      </IonCol>
                    </IonRow>
                </div>
                <br />
                <br /> */}
                
                {/* <div className="rcorners animated-box"> */}
                    <MultiInputRow numInputs={4}
                        // placeholders={['Enter Petrol Rate Here...', 'Enter Max. eligible Litres for Reimbursement Here...', 
                        //     'Enter Max. eligible Amount for Reimbursement Here...']}
                        labels={['Type of Availment', 'Max. eligible Litres for Reimbursement', 'Max. eligible Amount for Reimbursement',
                           'Petrol Rate']}
                        names={['availment', 'litrereimbursement', 'amountreimbursement', 'petrol']} 
                        classnames={['input-data readonly', 'input-data readonly', 'input-data readonly', 'input-data readonly']}
                        ids={['availment', 'litrereimbursement', 'amountreimbursement', 'petrol']} 
                        values={[selectedPetrolDetails?.availment, selectedPetrolDetails?.finallitreval, 
                          selectedPetrolDetails?.finalpetrolallow, selectedPetrolDetails?.petrol]} 
                        readonlys = {[true, true, true, true]}
                        // disables={[true, true, true, true]}
                    />
                    {/* selectedPetrolDetails?.petrol */}
                    {/* <MultiInputRow numInputs={4}
                        placeholders={['Enter no. of days absent/Leave Here...', 'Enter No. of litre claim Here...', 
                          'Enter amount to be claimed Here...', 'Remarks...']}
                        types = {['number', 'number', 'decimal']}
                        labels={['No. of days absent/Leave', 'No. of litre to be claimed', 'Amount to be claimed', 'Remarks']}
                        names={['leave', 'litre', 'amount', 'remarks']}
                        classnames={['input-data readonly', 'input-data', 'input-data', 'input-data']}
                        ids={['leave', 'litre', 'amount', 'remarks']}
                        values={[selectedPetrolDetails?.leave]}
                        disables={[true, ltrdisable, disable, disable]}
                        maxlengths={[null, null, null, 20]}
                      /> */}
                       <MultiInputRow numInputs={3}
                        placeholders={['Enter No. of litre claim Here...', 
                          'Enter amount to be claimed Here...', 'Remarks...']}
                        types = {['number', 'decimal']}
                        labels={['No. of litre to be claimed', 'Amount to be claimed', 'Remarks']}
                        names={['litre', 'amount', 'remarks']}
                        classnames={['input-data', 'input-data', 'input-data']}
                        ids={['litre', 'amount', 'remarks']}
                        disables={[ltrdisable, disable, disable]}
                        maxlengths={[null, null, 20]}
                      />
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
                        <IonLabel>I here by Declare that my salary Account is <b>{petrolResponse?.accountno}</b> and
                            salary paying branch is <b>{petrolResponse?.payeebranch} ({petrolResponse?.payeebic})</b>. I request you
                            to credit the Petrol Allowance to the salary account 
                            and through salary paying branch as mentioned.</IonLabel>
                    </IonItem>
                    <IonItem className= "animated-box">
                          <div className="checkbox-data">
                              <IonCheckbox color="primary" id="check2" />
                          </div>
                          <IonLabel>This is my full and final Petrol allowance claim against the above said month and
                            I will further not claim any Petrol allowance in future.</IonLabel> 
                    </IonItem>
                </div>
                <br/>
                <IonRow>
                    <IonCol size="12" sizeLg="12" sizeMd="12" sizeSm="12" sizeXl="12" sizeXs="12">
                        <div className="ion-text-center search-btn-container" >
                            <SubmitButton name="Submit" cancelbutton={true} disables={btndisable} issubmit={true} />
                        </div>
                    </IonCol>
                </IonRow>
                </form>
                </IonCardContent>
            </IonCard>
            <SelectedSidebar sidebarname='petrolapply' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
          </IonContent>
        </IonPage>
        <IdleTimeout timeout={IDLE_TIMEOUT} />
        {showToast && <Toasts messages={responseErrorMessage} showToasts={showToast} colours="danger" durations={2000} icons={icon} />}
    </>
  );
};

export default Petrol;