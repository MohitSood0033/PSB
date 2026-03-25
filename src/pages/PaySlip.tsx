import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonImg, IonSelect, IonSelectOption,IonButton,IonSpinner,
  IonRow, IonCol, IonItem, IonAccordion, IonAccordionGroup, IonAvatar, IonLabel, IonList, IonIcon, IonFab, IonFabButton, IonCard, IonCardContent, IonMenu, IonButtons, IonMenuButton, IonText, IonCardHeader, IonCardTitle, IonToast, IonLoading } from '@ionic/react';
import { person, laptop, globe, powerOutline, ellipsisVerticalSharp, downloadSharp, personCircle } from 'ionicons/icons';
import './PaySlip.css';
import { Storage } from '@ionic/storage';
import SideBar from '../components/SideBar';
import PdfViewer from '../components/PDFViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import Menu from '../components/Menu';
import Header from '../components/Header';
import axios, { AxiosResponse } from 'axios';
import { API_URL, IDLE_TIMEOUT } from '../config/config';
import { useHistory } from 'react-router-dom';
import IdleTimeout from '../components/IdleTimeout';
import CryptoJS from 'crypto-js';
import SelectedSidebar from '../components/SelectedSidebar';

const PaySlip: React.FC = () => {;
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [payslip, setPayslip] = useState<string>('');
  const [error, setError] = useState<string | null>(null);  
  const [showPdf, setShowPdf] = useState(false);
  const [sideBarVisible, setSideBarVisible] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);  
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);  
  const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
  const history = useHistory();
  const key = CryptoJS.enc.Utf8.parse('1111111111111111');
  const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
  const storage = new Storage();
  storage.create();

  useEffect(() => {
    
    storage.get('user_details').then((userDetails) => {
      if (userDetails != null) {
        setUserDetails(userDetails);
      }
    });
  }, []);

  const validateForm = (): boolean => {
    if (!selectedYear || !selectedMonth) {
      setError('Please select both year and month');
      return false;
    }

    setError(null);
    return true;
  };

  const generateSignature = (data, secretKey) => {
      const hash = CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString(CryptoJS.enc.Base64);
      return hash;
  };

  const decryptData = (encryptedData, key, iv) => {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, { iv });
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  };
  const handleSubmit = () => {

    if(!validateForm()) {
      return;
    }

    const fetchPdf = async () => {
      setLoading(true);
      try {
        const postData = {
            user_token: userDetails?.userToken,
            device_id: userDetails?.deviceId,
            year: selectedYear,
            month:selectedMonth
        }

        const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
        const hash = generateSignature(postData, key);

        const response: AxiosResponse<Blob> = await axios.post(
          `${API_URL}payslip`,
          {
            data: eData,
            hash: hash,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            responseType:'arraybuffer'
          }
        );

        if (response.status === 401) {
          handleAuthorized();
          return;
        }

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
      
        setPayslip(pdfUrl);
        setShowPdf(true);
      } 
      catch (error) {
        if (error.response && error.response.status === 401) {
          handleAuthorized();
          
        }
        else{
          setShowToast(true);
          setLoading(false);
          setResponseErrorMessage(error.message);
        }
      } 
      finally {
        setLoading(false);
      }
    };

    fetchPdf();

  };

  const handleAuthorized = async() => {
    await storage.clear(); 
    history.replace('/');
    setShowToast(true);
    setLoading(false);
    setResponseErrorMessage('You are not authorized. Please log in again.');
    
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
  
    for (let year = 2021; year <= currentYear; year++) {
      years.push(
        <IonSelectOption key={year.toString()} value={year.toString()}>
          {year.toString()}
        </IonSelectOption>
      );
    }
  
    return years;
  };
  

  const generateMonthOptions = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are zero-based
    const months = [];
  
    for (let month = 1; month <= 12; month++) {
      const isCurrentYear = parseInt(selectedYear) === currentYear;
      const isAfterJune = parseInt(selectedYear) === 2021 && month >= 7;
  
      if (isCurrentYear && month <= currentMonth || isAfterJune || (parseInt(selectedYear) > 2021 && parseInt(selectedYear) < currentYear)) {
        months.push(
          <IonSelectOption key={month.toString()} value={month.toString()}>
            {new Date(`${selectedYear}-${month.toString().padStart(2, '0')}-01`).toLocaleString('default', { month: 'long' })}
          </IonSelectOption>
        );
      }
    }
  
    return months;
  };
  

  const handleYearChange = (event: CustomEvent) => {
    setSelectedYear(event.detail.value);
  };

  const handleMonthChange = (event: CustomEvent) => {
    setSelectedMonth(event.detail.value);
  };
  
  const toggleSideBar = () => {
    setSideBarVisible(!sideBarVisible);
  };

  // const closeSideBar = () => {
  //   setSideBarVisible(false);
  // };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = payslip;
    link.download = 'Payslip_'+(userDetails?.pfCode)+'_'+getMonthAbbr(selectedMonth)+'_'+selectedYear+'.pdf';
    link.click();
  };

  function getMonthAbbr(monthNumber) {
    const date = new Date(`2022-${monthNumber}-01`);
    const monthAbbreviation = date.toLocaleString('default', { month: 'short' });
    return monthAbbreviation;
  }
  return (
    <>
      <IonLoading isOpen={loading} message="Submitting..." />
      <Menu currentMenu='payslip'/>
      <IonPage className="psb-pages platform-specific-page" id="main-content">
        <Header/>
        <IonContent fullscreen className="ion-padding">
          <IonCard className="psb-page-card filter-section">
            <IonCardHeader>
              <IonCardTitle>Pay Slip</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonRow>
                <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                  <IonList>
                    <IonItem lines="none">
                      <IonSelect placeholder="Select Year" onIonChange={handleYearChange}>
                        <div slot="label">Select Year</div>
                        {generateYearOptions()}
                      </IonSelect>
                    </IonItem>
                  </IonList>
                </IonCol>
                <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                  <IonList>
                    <IonItem lines="none">
                      <IonSelect placeholder="Select Month" onIonChange={handleMonthChange}>
                        <div slot="label">Select Month</div>
                        {generateMonthOptions()}
                      </IonSelect>
                    </IonItem>
                  </IonList>
                </IonCol>
                <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                  <div className="ion-text-center search-btn-container">
                      <IonButton shape="round" type="submit" mode="ios" onClick={handleSubmit}>Go</IonButton>
                  </div>
                </IonCol>
              </IonRow>
              {error && <IonText color="danger">{error}</IonText>}
            </IonCardContent>
          </IonCard>
          {showPdf && (
            <div className="pdf-container">
              <IonItem>
                <IonButton onClick={handleDownload} fill="clear" shape="round">
                  <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
                </IonButton>
              </IonItem>              
              <PdfViewer pdfFileUrl={payslip} />
            </div>
          )}
          {/* <div className={`ion-hide-sm-down sidebar ${sideBarVisible ? 'open' : ''}`}> */}
            {/* <SideBar currentMenu='payslip'/> 
            <IonFab className="menu-icon">
              <IonFabButton className="animated" onClick={toggleSideBar}>
                <IonIcon icon={ellipsisVerticalSharp} />
              </IonFabButton>
            </IonFab>       */}
          {/* </div> */}
          <SelectedSidebar sidebarname='payslip' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
        </IonContent>
      </IonPage>
      <IdleTimeout timeout={IDLE_TIMEOUT} />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={responseErrorMessage}
        duration={2000}
        position="middle"
        color="danger"
        buttons={[
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              setShowToast(false);
            },
          },
        ]}
      />
    </>
  );
};

export default PaySlip;

