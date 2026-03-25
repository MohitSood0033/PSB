import React, { useEffect, useState } from 'react';
import { IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonPage, IonFab, IonFabButton, IonIcon, IonLabel, IonModal, IonButton, IonSelectOption, IonItem, IonList, IonSelect, IonLoading } from '@ionic/react';
import './Leave.css';
import axios from 'axios';
import Menu from '../components/Menu';
import Header from '../components/Header';
import { Storage } from '@ionic/storage';
import SideBar from '../components/SideBar';
import { API_URL, IDLE_TIMEOUT } from '../config/config';
import { useHistory } from 'react-router-dom';
import { ellipsisVerticalSharp, closeCircleOutline, eye } from 'ionicons/icons';
import IdleTimeout from '../components/IdleTimeout';
import CryptoJS from 'crypto-js';
import SelectedSidebar from '../components/SelectedSidebar';

const Leave: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [leaveBalances, setLeaveBalances] = useState<any | null>(null); 
    const [leaveRecords, setLeaveRecords] = useState<any[]>([]); 
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [showModal, setShowModal] = useState(false);
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);  
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const key = CryptoJS.enc.Utf8.parse('1111111111111111');
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456');            

    const history = useHistory();
    const storage = new Storage();
    storage.create();
    const toggleSideBar = () => {
        setSideBarVisible(!sideBarVisible);
    };
    const openModal = (record: any) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRecord(null);
    };

    const handleAuthorized = async() => {
        await storage.clear(); 
        history.replace('/');
        setShowToast(true);
        setLoading(false);
        setResponseErrorMessage('You are not authorized. Please log in again.');
        
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
  

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
      
        for (let year = 2021; year <= currentYear; year++) {
            years.push(
                <IonSelectOption 
                    key={year.toString()} 
                    value={year.toString()}>
                    {year.toString()}
                </IonSelectOption>
            );
        }
      
        return years;
    };

    const handleYearChange = (event: CustomEvent) => {
        const selectedYearValue = event.detail.value;

        if (selectedYearValue != null) {
            setSelectedYear(selectedYearValue);
            fetchData(selectedYearValue); 
        }
    };

    const fetchData = async (year : any) => {
        try {
            setLoading(true);
            const userDetails = await storage.get('user_details');

            const postData = {
                user_token: userDetails.userToken,
                device_id: userDetails.deviceId,
                year: year
              }
              
              const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
              const hash = generateSignature(postData, key);
        
            if (userDetails != null) {
                setUserDetails(userDetails);      
                const response = await axios.post(
                    `${API_URL}leaves`,
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
                    const resHash      = generateSignature(JSON.parse(responseData), key);
                    responseData = JSON.parse(responseData);
                    if(resHash == responseBody.hash){
                        if(!responseData.error){
                            setLeaveBalances(responseData.leaveallrecords);
                            setLeaveRecords(responseData.records);
                        }
                        else {
                            setShowToast(true);
                            setLoading(false);
                            setResponseErrorMessage(responseData.message);
                        }
                    }
                    else{
                        setShowToast(true);
                        setLoading(false);
                        setResponseErrorMessage('Hash Mismatch');
                    }
                    
                }                 
                else if(response.status === 401){
                    handleAuthorized();
                }
                else {
                    setShowToast(true);
                    setLoading(false);
                    setResponseErrorMessage(response.data.message);
                }

            }
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
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {      
        fetchData(selectedYear);
    }, []);
      
  return (
    <>
        <Menu currentMenu='leave'/>
        <IonPage className="psb-pages platform-specific-page" id="main-content">
            <Header/>
            <IonContent fullscreen className="ion-padding">
                <div style={{marginLeft: "15%"}}>
                <IonGrid>
                    <IonRow>
                        {leaveBalances &&
                        Object.entries(leaveBalances).map(([leaveType, balance]) => (
                            <IonCol size="3" key={leaveType}>
                                <IonCard className={`psb-leave-count ${leaveType.replace(' ', '_').toLowerCase()}`}>
                                    <IonCardHeader>
                                        <IonCardTitle className="ion-text-center">{leaveType}</IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent className="ion-text-center">
                                    {typeof balance === 'number' ? balance : 'Invalid Balance'}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonCard className="psb-leaves-records">
                                <IonCardHeader>
                                    <IonCardTitle>Leave Records</IonCardTitle>
                                    <IonList className="leave-filter">
                                        <IonItem lines="none">
                                            <IonSelect placeholder="Select Year" onIonChange={handleYearChange}>
                                                <div slot="label">Select Year</div>
                                                {generateYearOptions()}
                                            </IonSelect>
                                        </IonItem>
                                    </IonList>
                                </IonCardHeader>
                                <IonCardContent>
                                <table className="ion-table" width="100%" cellPadding="0pt" cellSpacing="0pt">
                                    <thead>
                                        <tr>
                                        <th className="ion-hide-sm-down">S.No.</th>
                                        <th>Leave Type</th>
                                        <th>Leave From</th>
                                        <th>Leave To</th>
                                        <th>Debit/Credit Days</th>
                                        <th className="ion-hide-sm-down">Remarks</th>
                                        <th className="ion-hide-sm-down">Verified By</th>
                                        <th>Status</th>
                                        <th></th>
                                        </tr>
                                    </thead>
                                    
                                    {leaveRecords.length > 0 ? (
                                        <tbody>
                                            {leaveRecords.map((record: any, index: number) => (
                                            <tr key={index}>
                                                <td className="ion-hide-sm-down">{index+1}</td>
                                                <td>{record.leave_type}</td>
                                                <td>{record.leave_from}</td>
                                                <td>{record.leave_to}</td>
                                                <td><span className={record.crdays > 0 ? 'cr' : 'dr'}>{record.crdays > 0 ? record.crdays+' Cr.' : record.drdays+' Dr.'}</span></td>
                                                <td className="ion-hide-sm-down">{record.remarks}</td>
                                                <td className="ion-hide-sm-down">{record.verfied_by}</td>
                                                <td><span className={`${record.status.toLowerCase()}`}>{record.status}</span></td>
                                                <td>
                                                    <IonIcon className="ion-hide-sm-down" icon={eye} onClick={() => openModal(record)} />
                                                    <IonIcon className="ion-hide-sm-up" icon={ellipsisVerticalSharp} onClick={() => openModal(record)} />
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    )
                                    :
                                    (
                                        <tbody>
                                            <tr>
                                                <td colSpan={8}> No record found.</td>
                                            </tr>
                                        </tbody>
                                    )}
                                </table>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonModal className="psb-leave-details" isOpen={showModal} onDidDismiss={closeModal}>
                    <IonContent>
                        <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Leave Details</IonCardTitle>
                            <IonIcon
                                icon={closeCircleOutline}
                                onClick={closeModal}
                                size='large'
                                style={{ position: 'absolute', top: '0', right: '0', padding: '8px', cursor: 'pointer' }}
                            />
                        </IonCardHeader>
                        <IonCardContent>
                            <table width="100%">
                                <tbody>
                                    <tr>
                                        <td><strong>Leave Type</strong></td><td>{selectedRecord?.leave_type}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Leave From</strong></td><td>{selectedRecord?.leave_from}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Leave To</strong></td><td>{selectedRecord?.leave_to}</td>
                                    </tr>
                                    <tr>
                                        <td><strong> Credit/Debit Days</strong></td><td><span className={selectedRecord?.crdays > 0 ? 'cr' : 'dr'}>{selectedRecord?.crdays > 0 ? selectedRecord?.crdays+' Cr.' : selectedRecord?.drdays+' Dr.'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Remarks</strong></td><td>{selectedRecord?.remarks}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Verified By</strong></td><td>{selectedRecord?.verfied_by}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status</strong></td><td><span className={`${selectedRecord?.status.toLowerCase()}`}>{selectedRecord?.status}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </IonCardContent>
                        </IonCard>
                       
                    </IonContent>
                </IonModal>
                {/* <div className={`ion-hide-sm-down sidebar ${sideBarVisible ? 'open' : ''}`}>
                    <SideBar currentMenu='leave'/> 
                    <IonFab className="menu-icon">
                    <IonFabButton className="animated" onClick={toggleSideBar}>
                        <IonIcon icon={ellipsisVerticalSharp} />
                    </IonFabButton>
                    </IonFab>      
                </div> */}
                <SelectedSidebar sidebarname='leave' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
                </div>
            </IonContent>
        </IonPage>
        {loading && (
            <IonLoading
                isOpen={loading}
                message={'Please wait ... \nWe are fetching your leave records'}
            />
        )}
        <IdleTimeout timeout={IDLE_TIMEOUT} />
    </>
  );
};

export default Leave;
function toast(arg0: { message: string; duration: number; position: string; color: string; }) {
    throw new Error('Function not implemented.');
}

