import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonImg, IonLoading, IonPage, IonRow, IonSelect, IonSelectOption, isPlatform } from '@ionic/react';
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
import { BriefcaseRelatedResponse } from '../interfaces/briefcaseResponse';
import styles from '../css/ViewData.css';
import DataTable, * as datatable from 'react-data-table-component';
import { DataItem } from '../interfaces/briefcaseResponse';
import Withdraw from '../components/Withdraw';
import '../css/Briefcase.css';

const ViewBriefcase: React.FC = () => {

    const [showToast, setShowToast] = useState<boolean>(false);  
    const [loading, setLoading] = useState<boolean>(false);
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [briefcaseResponse, setBriefcaseResponse] = useState<BriefcaseRelatedResponse>(null);
    const [filteredData, setFilteredData] = useState<[DataItem]>();
    const [userDetails, setUserDetails] = useState<any>(null);

    var columns = [
        {
            name: "S. No.",
            selector: row => row.index,
            sortable: true
        },
        {
            name: "Bill Date",
            selector: row => row.valuedate ? row.valuedate : '--',
            sortable: true
        },
        {
            name: "Entry Date",
            selector: row => row.submissiondate ? row.submissiondate : '--',
            // sortable: true
        },
        {
            name: "Remarks",
            selector: row => row.remarks ? row.remarks : '--',
            sortable: true
        },
        {
            name: "Eligible Amount",
            selector: row => row.eligibleamount ? row.eligibleamount : '--',
        },
        {
            name: "Claim Amount",
            selector: row => row.appliedamount ? row.appliedamount : '--',
            sortable: true
        },
        {
            name: "Sanc. Amount",
            selector: row => row.sanctionedamount ? row.sanctionedamount : '--',
        },
        {
            name: "Auth Remark",
            selector: row => row.authremark ? row.authremark : '--',
            sortable: true
        },
        {
            name: "Status",
            selector: row => row.status ? row.status : '--',
            sortable: true
        },
        {
            name: "Uploaded File",
            cell: (row) => (
                // <a onClick={() => fetchPdf(row)} style={{color:'blue', fontStyle:'bold', cursor:'pointer'}}>
                //     <u>{(row.isinternet == 'Y') ? 'Click here to download' : '--'}</u>
                // </a>
                <>
                    {(row.isinternet == 'Y') && <a onClick={() => fetchPdf(row)} style={{color:'blue', fontStyle:'bold', cursor:'pointer'}}>
                        <u>Click here to download</u>
                    </a>}
                    {(row.isinternet != 'Y') && (<p className='red-text'>Download available in HRMS Intranet</p>)}
                </>
            )
        },
        {
            name: 'Actions',
            cell: (row) => (
                row.status == 'Submitted' ?
                    (<IonButton onClick={() => handleButtonClick(row)}>Withdraw</IonButton>) :
                    (<IonButton disabled>Withdraw</IonButton>)
            )
        },
    ];

    const [selectedId, setSelectedId] = useState<string>(null);
    const [type, setType] = useState<string>(null);
    const [dates, setDates] = useState<string>(null);
    const [open, setOpen] = React.useState(false);

    const handleButtonClick = (row) => {
        setSelectedId(row.appno);
        setDates("  ("+row.valuedate+") ");
        setOpen(true);
    };

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
                    user_token: userDetails?.userToken,
                    device_id: userDetails?.deviceId
                }
            
                const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
                const hash = generateSignature(postData, key);
    
                const response = await axios.post(
                    `${Config.API_URL}briefcase-related-details`,
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
                    // console.log(responseData);
                    if(resHash == responseBody.hash){
                        responseData = JSON.parse(responseData);
                        setBriefcaseResponse(responseData);
                        setBriefResponse(responseData.datas);
                        setLoading(false);
                    } else {
                        setShowToast(true);
                        setLoading(false);
                        setResponseErrorMessage(Constant.HASH_MISMATCH);
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

    const fetchPdf = async (row) => {
        // storage.get('user_details').then((userDetails) => {
        //     if (userDetails != null) {
        //         setUserDetails(userDetails);
        //     }
        // });
        const userDetails = await storage.get(Constant.USER_DETAILS);
        setLoading(true);
        try {
            const postData = {
                fileurl: `BRIEFCASE/${userDetails.pfCode}/${row.filename}`,
                filename: row.filename
            }
            console.log(postData);
    
            const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
            const hash = generateSignature(postData, key);
    
            const response: AxiosResponse<Blob> = await axios.post(
                `${Config.API_URL}download`,
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
  
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create a link element and trigger the download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'downloaded_file.pdf'; // Specify the file name
            link.click();

            // Clean up the URL object
            URL.revokeObjectURL(link.href);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            return;
        }
    };

    // fetchPdf();

    // const fetchUserDetails = async () => {
    //     await storage.get('user_details').then((userDetails) => {
    //             if (userDetails != null) {
    //                 setUserDetails(userDetails);
    //             }
    //         });
    // };

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

    const [briefResponse, setBriefResponse] = useState<DataItem[]>([]);
    // const [data, setData] = useState<any>([]);
    // setData("No records found !!");
    const handlefilter = (event) => {
        var searchText = event.target.value;
        var newData = (searchText.length > 0 && searchText != null) ? (briefcaseResponse.datas.filter(row =>
            columns.some(col => 
                String(row['remarks']).toLowerCase().includes(searchText.toLowerCase())
                || String(row['eligibleamount']).toLowerCase().includes(searchText.toLowerCase())
                || String(row['status']).toLowerCase().includes(searchText.toLowerCase())
            )
          ) ) : (briefcaseResponse.datas);
          
        setBriefResponse(newData);
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
                            <IonCardTitle className='topic'>Breifcase Claim Records</IonCardTitle>
                        </IonCardHeader>
                    {!open &&
                        (<div style={{width: '90%', margin: 'auto', textAlign: 'center'}}>
                            <div className='text-end' onChange={handlefilter}>
                                <input type="text" />
                            </div>
                        
                            {(briefResponse &&  briefResponse.length > 0) ?
                                (
                                    <div>
                                        <DataTable 
                                            columns={columns} 
                                            data = {briefResponse}
                                            fixedHeader
                                            pagination
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
                    <div>
                        <Withdraw isOpen={open} names='Withdraw' selectedId={selectedId} type={type} 
                            dates={dates} apiname='briefcase/withdraw' backurl={'/viewbriefcase'}/>
                    </div>
                    </IonCard>
                    <SelectedSidebar sidebarname='viewbriefcase' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
                </IonContent>
            </IonPage>
        </>
    );
}

export default ViewBriefcase;


