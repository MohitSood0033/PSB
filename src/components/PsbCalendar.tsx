import React, { useEffect, useState } from 'react';
import { IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton, IonButtons, IonCol, IonRow } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './PsbCalendar.css';
import { Storage } from '@ionic/storage';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config/config';
import CryptoJS from 'crypto-js';
import { useHistory } from 'react-router-dom';

const getCurrentYear = () => {
    return new Date().getFullYear().toString();
};

const getCurrentMonth = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const adjustedMonth = month + 1;
    return adjustedMonth.toString();
};

const getNextMonth = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const adjustedMonth = month + 2;
    return adjustedMonth.toString();
};

const getPrevMonth = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const adjustedMonth = month;
    return adjustedMonth.toString();
};
const tempArr: { [key: string]: string } = {
    'Su': 'Sunday',
    'Mo': 'Monday',
    'Tu': 'Tuesday',
    'We': 'Wednesday',
    'Th': 'Thursday',
    'Fr': 'Friday',
    'Sa': 'Saturday',
};
const tempLegend: { [key: string]: string } = {
    'leave': 'Leave (PL/CL/UCL/SL)',
    'p': 'Present',
    'a': 'Absent',
    'od': 'On Duty',
    'po': 'Present By Others',
    'h': 'Holiday/Weekly Off',
    'current': 'Todays Date'
};
const PsbCalendar: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear());
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
    const [nextMonth, setNextMonth] = useState<any>(getNextMonth());
    const [prevMonth, setPrevMonth] = useState<any>(getPrevMonth());
    const [dayElements, setDayElements] = useState<any>(null);
    const [dayArr, setDayArr] = useState<any>(tempArr);
    const [calendarLegends, setCalendarLegends] = useState<any>(tempLegend);
    const [calendarData, setCalendarData] = useState<any>(null);    
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState<boolean>(false);  
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [userDetails, setUserDetails] = useState<any>(null);
    const key = CryptoJS.enc.Utf8.parse('1234567890123456');
    const iv = CryptoJS.enc.Utf8.parse('9876543210');
  
    const history = useHistory();
    const storage = new Storage();
    storage.create();
  
    const handleAuthorized = () => {
      storage.clear(); 
      history.replace('/');
      setShowToast(true);
      setLoading(false);
      setResponseErrorMessage('You are not authorized. Please log in again.');
      
    };

    const currentMonth = getCurrentMonth();

    const setModuleTitle = (dateStr: string) => {
        const [day, month, year] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long' })}, ${date.getFullYear()}`;
        return formattedDate;
    };
    

    const getFirstDay = (dateStr: string) => {
        const [year, month] = dateStr.split('-').map(Number);
        const firstDayOfMonth = new Date(year, month - 1, 1); 
        const day = firstDayOfMonth.toLocaleDateString('en-US', { weekday: 'long' });
        return day;
    };
    

    const getLastDate = (dateStr: string) => {
        const [year, month] = dateStr.split('-').map(Number);
        const lastDayOfMonth = new Date(year, month, 0);
        const lastDate = lastDayOfMonth.getDate();
        return lastDate;
    };
    

    const getCurrentDay = () => {
        const selectedDate = new Date();
        const currentDay = selectedDate.getDate();
        return currentDay;
    }

    const goToPrevMonth = () => {
        setSelectedMonth(prevMonth);
        setPrevMonth(prevMonth - 1);
        setNextMonth(nextMonth - 1);
        fetchCalendar();
    }

    const goToNextMonth = () => {
        const nextMonthValue = parseInt(nextMonth) + 1;
        setSelectedMonth(nextMonth);
        setPrevMonth(nextMonth - 1);
        setNextMonth(nextMonthValue);
        fetchCalendar();
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

    const fetchCalendar = () => {
        if (!dayArr) return;
        const lastDay = getLastDate(`01-${selectedMonth}-${selectedYear}`);
        const firstDay = getFirstDay(`01-${selectedMonth}-${selectedYear}`);
        const calElements = [];
    
        let checked = false;
        for (let i = 1; i <= lastDay; i++) {
            if (!checked && firstDay !== Object.values(dayArr)[i - 1]) {
                calElements.push(
                    <li key={`blank-${i}`} className='item blank'>#</li>
                );
                
            } else {
                if(!checked){
                    i =1;
                }
                checked = true;
                calElements.push(
                    <li key={i} className={`${i === getCurrentDay() && currentMonth == selectedMonth ? 'current item' : 'item'} ${calendarData && calendarData[i] && calendarData[i].toLowerCase()}`} title={`${calendarData && calendarData[i]}`}>
                        {i}
                    </li>
                );
            }
        }
        setDayElements(calElements);
    }
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const userDetails = await storage.get('user_details');
    
            const postData = {
                user_token: userDetails.userToken,
                device_id: userDetails.deviceId,
                year : selectedYear,
                month:selectedMonth
              }
              
              const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
              const hash = generateSignature(postData, key);
        
            if (userDetails != null) {
                setUserDetails(userDetails);      
                const response = await axios.post(
                    `${API_URL}calendar`,
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
                        const records = responseData.lastfiverecord;
                        if(!responseData.error){
                            let tempData = [];
                            records.map((item, index) => {
                                tempData[parseInt(item.FORDATE)] = item.ATNDTYP != null ? item.ATNDTYP : '';
                            });

                            setCalendarData(tempData);
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
        } 
        catch (error) {
            setShowToast(true);
            setLoading(false);
            setResponseErrorMessage(error);
        }
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

    }, [selectedMonth, selectedYear]);
    
    useEffect(() => {
        
        fetchCalendar();

    }, [selectedMonth, calendarData]);

    return (
        <>
            <IonCard className="psb-calendar">
                <IonCardHeader>
                    <IonCardTitle mode="ios" className="ion-text-center">
                        <IonRow>
                            <IonCol size='2' className="ion-text-center">
                                {
                                    prevMonth > 0 &&
                                    <IonButtons>
                                        <IonButton onClick={goToPrevMonth}>
                                            <IonIcon slot="icon-only" icon={chevronBack} size="small" />
                                        </IonButton>
                                    </IonButtons>
                                }
                            </IonCol>
                            <IonCol size='8'  className="ion-text-center">
                                {setModuleTitle(`01-${selectedMonth}-${selectedYear}`)}
                            </IonCol>
                            <IonCol size='2' className="ion-text-center">
                                {
                                    nextMonth <= 12 &&
                                    <IonButtons>
                                        <IonButton onClick={goToNextMonth}>
                                            <IonIcon slot="icon-only" icon={chevronForward} size="small" />
                                        </IonButton>
                                    </IonButtons>
                                }
                            </IonCol>
                        </IonRow>
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonItem lines='none' className='header-section'>
                        <ul className='calender-days'>
                            {
                                dayArr &&
                                Object.entries(dayArr).map(([abbrev, dayName]) => (
                                    <li key={abbrev} className='item'>{abbrev}</li>
                                ))
                            }
                        </ul>
                    </IonItem>
                    <IonItem lines='none' className='body-section'>
                        <ul className='calender-dates'>
                            {dayElements}
                        </ul>
                    </IonItem>
                    <IonItem lines='none' className='legends-section'>
                    <ul className='legends'>
                        {calendarLegends &&
                            Object.entries(calendarLegends).map(([key, name]) => (
                                <li key={key} className={`item ${typeof key === 'string' ? key.toLowerCase() : ''}`}>
                                    {typeof name === 'string' ? name : ''}
                                </li>
                            ))
                        }
                    </ul>
                    </IonItem>
                </IonCardContent>
            </IonCard>
        </>
    );
}

export default PsbCalendar;
