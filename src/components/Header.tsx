// Header.tsx
import React, { useEffect, useState } from 'react';
import { Storage } from '@ionic/storage';
import { IonHeader, IonToolbar, IonTitle, IonImg, IonItem, IonLabel, IonIcon, IonAccordion, IonAccordionGroup, IonAvatar, IonButtons, IonList, IonMenuButton } from '@ionic/react';
import { globe, laptop, person, powerOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config/config';

const Header: React.FC = () => {
  
  const key = CryptoJS.enc.Utf8.parse('1234567890123456');
  const iv = CryptoJS.enc.Utf8.parse('9876543210987654');
  const [userDetails, setUserDetails] = useState<any>(null);
  const history = useHistory();
  const storage = new Storage();
  storage.create();

  const handleLogout = async () => {
    await logoutUser();
    await storage.clear();
    await sessionStorage.clear();
    history.replace('/');
  };
  
  // For logout user when log out or refreshed
  window.onbeforeunload = function() {
    if (sessionStorage.getItem('navigation') === 'true') {
      // page is all ok no logout is reuired
      sessionStorage.setItem('navigation', '');
    } else {
      handleLogout();
      if (storage) {
        storage.clear();
      }
      
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
  const logoutUser = async () => {
    try {
      const postData = {
          user_token: userDetails?.userToken,
          device_id: userDetails?.deviceId
      }

      const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
      const hash = generateSignature(postData, key);

      const response = await axios.post(
        `${API_URL}logout`,
        {
          data: eData,
          hash: hash,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
          // ,
          // withCredentials: true
        }
      );
      
    } 
    catch (error) {
      console.log(error);
    } 
  };

  useEffect(() => {
    
    storage.get('user_details').then((userDetails) => {
      if (userDetails != null) {
        setUserDetails(userDetails);
      }
      else{
        handleLogout();
      }
    });
  }, []);
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start" className="ion-hide-md-up">
          <IonMenuButton></IonMenuButton>
        </IonButtons>
        <IonImg
          src="assets/kutumb_logo.png"
          alt="PSB Kutumb"
        ></IonImg>
        <IonTitle>PSB <strong>KUTUMB</strong></IonTitle>        
      </IonToolbar>
      <IonItem className="user-details  ion-hide-sm-down">
        <IonAccordionGroup>
            <IonAccordion value="first">
              <IonItem slot="header">
                <IonAvatar>
                  <img alt="User" src="./assets/avatar.svg" />
                </IonAvatar>
                <IonLabel>{userDetails?.name}</IonLabel>
              </IonItem>
              <div className="accordion-content" slot="content">
                <IonList>
                  <IonItem>
                      <IonIcon slot="start" icon={person}></IonIcon>
                      <IonLabel>PF Code : {userDetails?.pfCode}</IonLabel>
                  </IonItem>
                  <IonItem>
                      <IonIcon slot="start" icon={laptop}></IonIcon>
                      <IonLabel>{userDetails?.designation}</IonLabel>
                  </IonItem>
                  <IonItem>
                      <IonIcon slot="start" icon={globe}></IonIcon>
                      <IonLabel>{userDetails?.branch}</IonLabel>
                  </IonItem>
                  <IonItem onClick={handleLogout} className="logout-link">
                      <IonIcon slot="start" icon={powerOutline}></IonIcon>
                      <IonLabel>Logout</IonLabel>
                  </IonItem>
                </IonList>
              </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonItem>
    </IonHeader>
  );
};

export default Header;
