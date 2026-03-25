import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonCol,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonRow,
  IonText,
  IonLoading,
  IonToast
} from '@ionic/react';
import { Storage } from '@ionic/storage';
import { person, lockClosed, logoIonic, refreshCircleOutline } from 'ionicons/icons';
import FloatingInput from './FloatingInput';
import { Device } from '@capacitor/device';
import './LoginForm.css';
import axios from 'axios';
import { API_URL, SECRET_KEY } from '../config/config';
import CryptoJS from 'crypto-js';
import { createHash } from 'crypto';
import Toasts from '../components/Toast';

const LoginForm: React.FC = () => {
  

  const [captchaImage, setCaptchaImage] = useState('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [formError, setFormError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);  
  const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
  const key = CryptoJS.enc.Utf8.parse('1234567890123456');
  const iv = CryptoJS.enc.Utf8.parse('9876543210123456');
  const history = useHistory();

  const storage = new Storage();
  storage.create();

  const [formErrors, setFormErrors] = useState({
    pfCodeError: false,
    passwordError: false,
    captchaError: false,
  });

  const generateUniqueId = () => {
    return 'WEB_' + Date.now();
  };

  const [deviceId1, setDeviceId1] = useState<string>('');

  const getMobileDeviceInfo = async () => {
    try{
      const info = await Device.getInfo();
      const platform = info.platform.toUpperCase();
      
      return platform +'_' + Date.now();
    }
    catch(erro){
      return 'MOB_' + Date.now();
    }
  };

  const initializeDeviceId = async () => {
    // string deviceids = '';
    if ((window as any).Capacitor) {
      const deviceIds = await getMobileDeviceInfo();
      
      await setDeviceId(deviceIds.toString());
      if (deviceId === '' || deviceId === null) {
        setDeviceId1(deviceIds.toString());
      }

      console.log(deviceId1);
      storage.set('deviceId', deviceIds);
      
      fetchCaptcha(deviceIds);
      
    } else {
      const generatedUniqueId = generateUniqueId();
      setDeviceId(generatedUniqueId.toString());
      console.log(deviceId);
      storage.set('deviceId', generatedUniqueId);
      fetchCaptcha(generatedUniqueId.toString());
    }
    // fetchCaptcha(deviceId);
  };

  useEffect(() => {
    // const generateUniqueId = () => {
    //   return 'WEB_' + Date.now();
    // };
    // 
    // const getMobileDeviceInfo = async () => {
    //   try{
    //     const info = await Device.getInfo();
    //     const platform = info.platform.toUpperCase();
        
    //     return platform +'_' + Date.now();
    //   }
    //   catch(erro){
    //     return 'MOB_' + Date.now();
    //   }
    // };

    // const initializeDeviceId = async () => {
    //   if ((window as any).Capacitor) {
    //     const deviceId = await getMobileDeviceInfo();
        
    //     setDeviceId(deviceId);
    //     storage.set('deviceId', deviceId);
    //   } else {
    //     const generatedUniqueId = generateUniqueId();
    //     setDeviceId(generatedUniqueId);
    //     storage.set('deviceId', generatedUniqueId);
    //   }
    //   fetchCaptcha(deviceId);
    // };

    storage.get('deviceId').then((deviceId) => {
      if(deviceId != null){
        setDeviceId(deviceId);
        fetchCaptcha(deviceId);
      }
      else{        
        initializeDeviceId();
      }
    });

  }, []);

  const handlePfCodeKeyUp: React.KeyboardEventHandler<HTMLInputElement | HTMLIonInputElement> = (e) => {
    const pfCodeValue = e.currentTarget.value.toString().toUpperCase().trim();
    const pfCodeRegex = /^[A-Za-z]\d{0,5}$/;

    if (!pfCodeRegex.test(pfCodeValue)) {
        e.currentTarget.value = pfCodeValue.slice(0, -1);
    }
    setFormErrors((prevErrors) => ({ ...prevErrors, pfCodeError: !pfCodeRegex.test(pfCodeValue) }));
  };

  const refreshCaptcha = () => {
    fetchCaptcha(deviceId);
  };

  const handleInputFocus = (fieldName: string) => {
    setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: false }));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    let formError = false;
    const fieldsToValidate = ['pfcode', 'password', 'captcha'];
  
    fieldsToValidate.forEach((fieldName) => {
      const input = e.currentTarget.elements.namedItem(fieldName) as HTMLInputElement;
      if (input) {
        const inputValue = input.value.trim();
  
        if (!inputValue) {
          formError = true;
          setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: true }));
        } else {
          setFormErrors((prevErrors) => ({ ...prevErrors, [`${fieldName}Error`]: false }));
        }
      }
    });
  
    if (!formError) {
      setLoading(true);
      const pfCodeInput = e.currentTarget.elements.namedItem('pfcode') as HTMLInputElement;
      const pfCodeValue = pfCodeInput?.value.toUpperCase().trim();
      const passwordInput = e.currentTarget.elements.namedItem('password') as HTMLInputElement;
      const passwordValue = passwordInput?.value.trim();
      const captchaInput = e.currentTarget.elements.namedItem('captcha') as HTMLInputElement;
      const captchaValue = captchaInput?.value.trim();
      
      try {
        const postData = {
          pf_code: pfCodeValue,
          device_id: deviceId,
          password: passwordValue,
          captcha:captchaValue
        }
        
        const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
        const hash = generateSignature(postData, key);

        const response = await axios.post(
          `${API_URL}user_login`,
          {
            data: eData,
            hash:hash
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
            // ,
            // withCredentials: true
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
            if(!responseData.error){
              storage.set('user_details', responseData.userDetails);
              sessionStorage.setItem('user_details', responseData.userDetails.pfCode.toString());
              history.replace('/home');
            }
            else {
              setShowToast(true);
              setLoading(false);
              setFormError(true);
              await postSettingError(e);
              setResponseErrorMessage(responseData.message);
            }
          }
          else{
            setShowToast(true);
            setLoading(false);
            setFormError(true);
            await postSettingError(e);
            setResponseErrorMessage('Hash Mismatch');
          }
          
        } else {
          setShowToast(true);
          setLoading(false);
          setFormError(true);
          await postSettingError(e);
          setResponseErrorMessage(response.data.message);
        }
      } 
      catch (error) {
        setShowToast(true);
        setLoading(false);
        setFormError(true);
        await postSettingError(e);
        // setResponseErrorMessage(error);
        const errormsg = (error?.response?.data?.error_description != undefined) ? error?.response?.data?.error_description : 'Please try again, Username/Password is wrong !!';
        setResponseErrorMessage(errormsg);
      }
    }
  };

  const postSettingError = async (e: React.FormEvent<HTMLFormElement>) => {
    
    if (e && e.target) {
      const form = e.target as HTMLFormElement;
      
      const fieldsToValidate = ['pfcode', 'password', 'captcha'];
      fieldsToValidate.forEach((fieldName) => {
        const input = form.elements?.namedItem(fieldName) as HTMLInputElement;
        // console.log(`Input (${fieldName}):`, input);
  
        if (input) {
          input.value = '';
        }
      });
  
      fetchCaptcha(deviceId);
    }
  };
  
  
  

  const fetchCaptcha = async (deviceId) => {

    try {

      if (deviceId === '' || deviceId === null) {
        initializeDeviceId();
        return;
      }

      const response = await axios.get(API_URL+'captcha', {
        params: {
            device_id: deviceId, 
        },
        responseType: 'arraybuffer',
      });

      const base64Image = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const dataUrl = `${base64Image}`;
      setCaptchaImage(dataUrl);
    } 
    catch (error) {
        setResponseErrorMessage(error.message);
        setShowToast(true);
    } 
  };


  return (
    <>
      <IonLoading isOpen={loading} message="Submitting..." />
      <form className="login-form" onSubmit={handleSubmit}>
        <IonCard className="login-from-section">
          <IonCardHeader>
            <IonImg src="assets/kutumb_logo.png" alt="PSB KUTUMB"></IonImg>
            <IonCardTitle mode="ios" className="login-form-title ion-text-center" style={{ color: '#ffc107' }}>
              Login
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="ion-padding">
            <div className="form-help-text">Use Active Directory Credentials for login</div>
            {['PFCode', 'Password'].map((label, index) => (
              <FloatingInput
                key={index}
                label={label}
                name={(label.toLowerCase()).replace(/\s/g, '')}
                icon={index === 0 ? person : lockClosed}
                isPassword={index === 1}
                isError={formErrors[`${label.toLowerCase()}Error`]}
                onInputFocus={() => handleInputFocus(label.toLowerCase())}
                onKeyUp={index === 0 ? handlePfCodeKeyUp : undefined}
                maxlength={(label === 'PFCode') ? 6: null}
              />
            ))}
            <IonItem lines="none" className="capthca-wrapper">
              <IonRow>
                <IonCol size="10" size-sm="10" size-md="10" size-lg="10">
                  <IonImg src={`data:image/png;base64,${captchaImage}`} alt="Captcha"></IonImg>
                </IonCol>
                <IonCol size="2" size-sm="2" size-md="2" size-lg="2">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <IonIcon
                      className="captcha-refresh"
                      icon={refreshCircleOutline}
                      onClick={refreshCaptcha}
                      style={{ cursor: 'pointer' }}
                    ></IonIcon>
                  </div>
                </IonCol>
              </IonRow>
            </IonItem>
            <FloatingInput
              label="Captcha"
              name="captcha"
              icon={logoIonic}
              isError={formErrors.captchaError}
              onInputFocus={() => handleInputFocus('captcha')}
              maxlength={6}
            />
            <div className="ion-text-center login-btn-container">
              <IonButton shape="round" color="danger" type="submit" mode="ios">
                Login
              </IonButton>
            </div>
            {formError && <IonText className="input-error">{`${responseErrorMessage}`}</IonText>}
          </IonCardContent>
        </IonCard>
      </form>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={responseErrorMessage}
        duration={2000}
        position="middle"
        color="danger"
        buttons={[
          {
            text: 'X',
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

export default LoginForm;

