import { IonButton, IonCard, IonCardHeader, IonCardTitle, IonCol, IonContent, IonInput, IonLoading, IonPage, IonRow } from "@ionic/react";
import React, { useEffect, useState } from "react";
import SubmitButton from "./SubmitButton";
import * as Constant from '../constant/Constant';
import CryptoJS from 'crypto-js';
import * as Config from '../config/config';
import axios from "axios";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import Toasts from '../components/Toast';
import { Storage } from "@ionic/storage";
import { useHistory } from "react-router";
import { ofunctions } from "../constant/ofunctions";

interface withdrawProps {
    selectedId?: string;
    type?: string;
    isOpen: boolean;
    names: string;
    apiname?: string;
    dates?: string;
    backurl?: string;
}

const Withdraw: React.FC<withdrawProps> = ({selectedId, type, isOpen, names, apiname, dates, backurl}) => {

    const [loading, setLoading] = useState<boolean>(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState(null);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [icon, setIcon] = useState<string>(null);
    const [userDetails, setUserDetails] = useState<any>(null);
    const history = useHistory();

    const storage = new Storage();
    storage.create();

    const key = CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY);
    const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);

    useEffect(() => {
        // const userDetails = storage.get(Constant.USER_DETAILS);
        storage.get('user_details').then((userDetails) => {
            if (userDetails != null) {
                setUserDetails(userDetails);
            }
        });
    });

    const handleBackClick = (event) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000); 
        sessionStorage.setItem('navigation', 'true');
        history.push(Constant.HOME_REDIRECT);
        // historys.push("/viewpetrol");

    };
    
    const saveData = async () => {
        if (apiname == '' || apiname == null) {
            return;
        }
        
        try {
            setLoading(true);
            // const remarksInput = e.currentTarget.elements.namedItem('remarks') as HTMLInputElement;
            // const remarksValue = remarksInput?.value.trim();

            // if (remarksValue == '') {
            //     setResponseErrorMessage("Remarks is mandatory!!");
            //     setShowToast(true);
            //     setIcon(alertCircleOutline);
            //     return;
            // }
            const postData = {
                user_token: userDetails.userToken,
                device_id: userDetails.deviceId,
                "id": selectedId
            }
        
            const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
            const hash = generateSignature(postData, key);
            var apinames = `${Config.API_URL}`+`${apiname}`;

            sessionStorage.setItem('navigation', 'true');
            const response = await axios.post(
                apinames,
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
                const responseBody = response.data.message;
                setShowToast(true);
                setResponseErrorMessage(responseBody);
                setIcon(checkmarkCircleOutline);
                
                ofunctions.redirectHomePage(history, loading);

                // let responseData = decryptData(responseBody.data, key, iv );
                // const resHash = generateSignature(JSON.parse(responseData), key);
                // if(resHash == responseBody.hash){
                //     setShowToast(true);
                //     responseData = JSON.parse(responseData);
                //     setResponseErrorMessage(responseData?.message);
                //     setLoading(false);
                //     sessionStorage.setItem('navigation', 'true');
                // } else {
                //     setShowToast(true);
                //     setLoading(false);
                //     if (responseData?.data?.message != '' && responseData?.data?.message != 'undefine') {
                //         setResponseErrorMessage(response.data.message);
                //     } else {
                //         setResponseErrorMessage(Constant.HASH_MISMATCH);
                //     }
                // }
            } else {
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

    const generateSignature = (data, secretKey) => {
        const hash = CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString(CryptoJS.enc.Base64);
        return hash;
    };

    const decryptData = (encryptedData, key, iv) => {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, { iv });
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return decryptedText;
    };

    // const valueforheading = "Do you want to proceed ? ";

    return (
        <div>
            {isOpen && 
            (<div>
                <div>
                    <h1 style={{textAlign: "center"}}>{names}{dates}</h1>
                </div>
                <div style={{margin: "auto", display: "flex", justifyContent: "center"}}>
                    {/* <form onSubmit={saveData}> */}
                        {/* <IonRow>
                            <IonCol size="12">
                                <IonInput className="input-data input-center readonly" 
                                    name = "remarks"  value={valueforheading}>
                                </IonInput>
                            </IonCol>
                        </IonRow> */}
                        <div style={{margin: "auto", display: "flex", justifyContent: "center"}}>
                            {/* <SubmitButton name={names} cancelbutton={true} issubmit={true} /> */}
                            <IonButton shape="round" type="submit" mode="ios"
                                onClick={saveData}>Withdraw</IonButton>
                                <IonButton shape="round" type="button" mode="ios" color="danger" 
                                    style={{align:"left"}} onClick={handleBackClick}>Cancel</IonButton>
                        </div>
                        {showToast && <Toasts messages={responseErrorMessage} showToasts={showToast} colours="danger"
                        durations={2000} icons={icon} />}
                    {/* </form>      */}
                </div>
            </div>)}
        </div>
    );

}

export default Withdraw;