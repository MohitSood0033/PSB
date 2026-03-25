import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonImg, IonLoading, IonPage, IonRow, IonSelect, IonSelectOption } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import SelectedSidebar from '../components/SelectedSidebar';
import CryptoJS from 'crypto-js';
import axios, { AxiosResponse } from 'axios';
import * as Config from '../config/config';
import * as Constant from '../constant/Constant'; 
import { useHistory } from 'react-router';
import { Storage } from '@ionic/storage';
import { Icon } from '@react-pdf-viewer/core';
import { PetrolRelatedResponse } from '../interfaces/petrolResponse';
import '../css/ViewData.css';
import DataTable, { Alignment } from 'react-data-table-component';
import { DataItem } from '../interfaces/petrolResponse';
import Withdraw from '../components/Withdraw';
import { setDate } from 'date-fns';

const ViewPetrol: React.FC = () => {

    const [showToast, setShowToast] = useState<boolean>(false);  
    const [loading, setLoading] = useState<boolean>(false);
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [petrolResponse, setPetrolResponse] = useState<PetrolRelatedResponse>(null);
    const [petrolDataResponse, setPetroldataResponse] = useState<DataItem[]>([]);

    const history = useHistory();
    const storage = new Storage();
    storage.create();

    const key = CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY);
    const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);

    useEffect(() => {

        const fetchPetrolRelatedData = async () => {
            const userDetails = await storage.get(Constant.USER_DETAILS);
            try {
                setLoading(true);
                const postData = {
                    user_token: userDetails.userToken,
                    device_id: userDetails.deviceId
                }
            
                const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
                const hash = generateSignature(postData, key);
    
                const response = await axios.post(
                    `${Config.API_URL}petrol-related-details`,
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
                    setLoading(false);
                    const responseBody = response.data;
                    let responseData = decryptData(responseBody.data, key, iv );
                    const resHash = generateSignature(JSON.parse(responseData), key);
                    if(resHash == responseBody.hash){
                        responseData = JSON.parse(responseData);
                        setPetrolResponse(responseData);
                        setPetroldataResponse(responseData.datas);
                        setLoading(false);
                    } else {
                        setShowToast(true);
                        setLoading(false);
                        if (responseData?.data?.message != '' && responseData?.data?.message != 'undefine') {
                            setResponseErrorMessage(response.data.message);
                        } else {
                            setResponseErrorMessage(Constant.HASH_MISMATCH);
                        }
                    }
                } 
                else {
                    setShowToast(true);
                    setLoading(false);
                    setResponseErrorMessage(response.data.message);
                }
            } catch (error) {
                setShowToast(true);
                setLoading(false);
                setResponseErrorMessage(error.response.data.error_description);
            }
        }
        fetchPetrolRelatedData();
    }, []);

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

    const columns = [
        {
            name: "S. No.",
            selector: row => row.index,
        },
        {
            name: "Month-Year",
            selector: row => `${row.month} - ${row.year}`,
        },
        {
            name: "Status",
            selector: row => row.status ? row.status : '--',
            sortable: true
        },
        {
            name: "Eligible Amount",
            selector: row => row.eligibleamount ? row.eligibleamount : '--' ,
            sortable: true
        },
        {
            name: "Applied Amount",
            selector: row => row.appliedamount ? row.appliedamount : '--' ,
            sortable: true
        },
        {
            name: "Sanctioned Amount",
            selector: row => row.sanctionedamount ? row.sanctionedamount : '--'
        },
        {
            name: "Auth Remarks",
            selector: row => row.authremark ? row.authremark : '--'
            
        },
        {
            name: 'Actions',
            cell: (row) => (
                row.status == 'Submitted' ?
                    (<IonButton onClick={() => handleButtonClick(row)}>Withdraw</IonButton>) :
                    (<IonButton disabled>Withdraw</IonButton>)
            )
        }
    ];

    const [selectedId, setSelectedId] = useState<string>(null);
    const [type, setType] = useState<string>(null);
    const [dates, setDates] = useState<string>(null);
    const [open, setOpen] = React.useState(false);

    const handleButtonClick = (row) => {
        setSelectedId(row.appno);
        setDates("  ("+row.month+" - "+row.year+") ");
        setType("petrol");
        setOpen(true);
    };

    const handlefilter = (event) => {
        var searchText = event.target.value;
        var newData = (searchText.length > 0 && searchText != null) ? (petrolResponse.datas.filter(row =>
            columns.some(col => 
                String(row['valuedate']).toLowerCase().includes(searchText.toLowerCase())
                || String(row['eligibleamount']).toLowerCase().includes(searchText.toLowerCase())
                || String(row['status']).toLowerCase().includes(searchText.toLowerCase())
            )
          ) ) : (petrolResponse.datas);
          
        setPetroldataResponse(newData);
    };

    const tableCustomStyles = {
        headRow: {
          style: {
            backgroundColor: '#47596D',
            color: 'white'
          },
        },
        tbody: {
            style: {
              backgroundColor: '#758391',
            },
        },
      };

    return (
        <>
            <IonLoading isOpen={loading} spinner="lines-sharp" animated={true} message="Please wait..." />
            <Menu currentMenu='view petrol'/>
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header />
                <IonContent fullscreen className="ion-padding">
                    <IonCard className="psb-page-card filter-section box">
                    <IonCardHeader>
                        <IonCardTitle className='topic'>Petrol Claim Records</IonCardTitle>
                    </IonCardHeader>
                    {!open &&
                        (<div style={{width: '90%', margin: 'auto', textAlign: 'center'}}>
                            <div className='text-end' onChange={handlefilter}>
                                <input type="text" />
                            </div>
                        
                            {(petrolDataResponse &&  petrolDataResponse.length > 0) ?
                                (
                                    <div>
                                        <DataTable 
                                            columns={columns} 
                                            data = {petrolDataResponse}
                                            fixedHeader
                                            pagination
                                            highlightOnHover
                                            customStyles={tableCustomStyles}
                                        ></DataTable>
                                    </div>
                                ) 
                                : 
                                (   
                                    <div>
                                        <DataTable 
                                            columns={columns}
                                            data = {[]}
                                            fixedHeader
                                            pagination
                                        ></DataTable>
                                    </div>
                                )
                            }
                        </div>)
                    }
                    <br/>
                    {open && (<div>
                        <Withdraw isOpen={open} names='Withdraw' selectedId={selectedId} type={type} 
                            dates={dates} apiname='petrol/withdraw' backurl={'/viewpetrol'} />
                    </div>)}
                    </IonCard>
                    <SelectedSidebar sidebarname='viewpetrol' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
                </IonContent>
            </IonPage>
        </>
    );
};

export default ViewPetrol;


