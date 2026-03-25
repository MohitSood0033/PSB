import React, {useState, useEffect} from 'react';
import {IonItem, IonDatetime, IonLabel,IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItemGroup, IonItemDivider, IonAvatar, IonText, IonButton, IonButtons, IonList, IonLoading, IonToast} from '@ionic/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBirthdayCake } from '@fortawesome/free-solid-svg-icons'
import './ColleagueBday.css'; 
import { BirthDayResponse } from '../interfaces/BirthDayResponse';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config/config';
import CryptoJS from 'crypto-js';

const ColleagueBday: React.FC = ({}) => {
    const key = CryptoJS.enc.Utf8.parse('1111111111111111');
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456');

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
    const [birthDayResponse, setbirthDayResponse] = useState<BirthDayResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState<boolean>(false);  
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    
    const generateSignature = (data, secretKey) => {
        const hash = CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString(CryptoJS.enc.Base64);
        return hash;
    };
  
    const decryptData = (encryptedData, key, iv) => {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, { iv });
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      return decryptedText;
    };

    const formatDate = (date: Date): string => {
        if (isNaN(date.getTime())) {
          return ''; 
        }
    
        const day = date.getDate();
        const suffix = (day: number) => {
          if (day === 1 || day === 21 || day === 31) return 'st';
          if (day === 2 || day === 22) return 'nd';
          if (day === 3 || day === 23) return 'rd';
          return 'th';
        };
        const monthOptions = { month: 'long' as const };
        const monthName = new Intl.DateTimeFormat('en-US', monthOptions).format(date);
        return `${day}${suffix(day)} ${monthName}`;
    };

    const convertDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short', 
            day: '2-digit',
        };
    
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-GB', { month: 'short' }).slice(0,3);
        const year = date.getFullYear();
    
        return `${day}-${month}-${year}`;
    };

    const fetchBirthdays = async (selectedDate: string) => {

        try {
            const postData = {
              date: selectedDate
            }
            
            const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
            const hash = generateSignature(postData, key);
    
            const response = await axios.post(
              `${API_URL}birthdays`,
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
              const responseData = decryptData(responseBody.data, key, iv );
              const resHash      = generateSignature(JSON.parse(responseData), key);

              if(1==1 || resHash == responseBody.hash){
                if(!responseData.error){
                    setbirthDayResponse(JSON.parse(responseData));
                    
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
            else {
              setShowToast(true);
              setLoading(false);
              setResponseErrorMessage(response.data.message);
              
            }
        } 
        catch (error) {
            setShowToast(true);
            setLoading(false);
            setResponseErrorMessage(error);
        }
        finally {
            setLoading(false);
        }
    };
    
    const parsedDate = new Date(selectedDate);
    const currentDate = formatDate(parsedDate);

    useEffect(() => {
        fetchBirthdays(convertDate(selectedDate));
      }, []);

    

    return (
        <>
            <IonCard className="colleague-bday-section">
                <IonCardHeader>                   
                    <IonCardTitle mode="ios" className="ion-text-center">
                        Happy Birthdays
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonItemGroup className='item-group'>
                        <IonList>
                            <IonLoading isOpen={loading} message="Fetching Birthdays..." />
                            <>
                                {birthDayResponse && birthDayResponse.records.map((record, index) => {
                                    const isEvenIndex = index % 2 === 0;
                                    return (
                                        <IonItem className="bday-content" style={{ '--min-height': '30px' }} key={index}>
                                            <IonAvatar>
                                                {isEvenIndex ? (
                                                    <img alt="User" src="./assets/avatar4.svg" />
                                                ) : (
                                                    <img alt="User" src="./assets/avatar3.svg" />
                                                )}
                                            </IonAvatar>
                                            <IonLabel className="emp-info-section">
                                                <IonItem lines='none'>
                                                  <IonText className="name">{record.name}</IonText>
                                                  <IonText className="pf_code"><p>{record.designation}</p><p>{record.branch_Name} ({record.bic})</p> </IonText>
                                                </IonItem>
                                            </IonLabel>
                                        </IonItem>
                                    );
                                })}
                            </>
                        </IonList>
                    </IonItemGroup>
                
                </IonCardContent>
            </IonCard>
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
}

export default ColleagueBday;