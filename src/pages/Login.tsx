import React, { useState,useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonIcon, IonRow, IonCol,IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonImg, IonFab, IonFabButton, IonLoading } from '@ionic/react';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBirthdayCake } from '@fortawesome/free-solid-svg-icons'
import LoginForm from '../components/LoginForm';
import ImageSlider from '../components/ImageSlider';
import ThoughtsModule from '../components/ThoughtsModule';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoginPageResponse } from '../interfaces/LoginPageResponse';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config/config';
import { useHistory } from 'react-router-dom';
import { Storage } from '@ionic/storage';

interface CustomAxiosResponse<T> extends AxiosResponse {
  json: () => Promise<T>;
}

const Login: React.FC = () => {;
  
  const [userDetails, setUserDetails] = useState<any>(null);
  const history = useHistory();
  
  const [panelVisible, setPanelVisible] = useState(false);
  const [loginPageResponse, setLoginPageResponse] = useState<LoginPageResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const togglePanel = () => {
    setPanelVisible(!panelVisible);
  };

  const closePanel = () => {
    setPanelVisible(false);
  };  

  useEffect(() => {
    const storage = new Storage();
    storage.create();
    storage.get('user_details').then((userDetails) => {
      setLoading(true);
      if (userDetails != null) {
        history.replace('/home');
      }
      else{
        fetchPageData();
      }
    });
    const fetchPageData = async () => {
      try {
        const response: AxiosResponse<LoginPageResponse> = await axios.get(API_URL+'login');

        const responseData = response.data;
        if(responseData.status_code == "200"){
          setLoginPageResponse(responseData);
        }
        else{
          console.error('Error fetching data:'+responseData);
        }
      } 
      catch (error) {
        console.error('Error fetching data:', error);
      } 
      finally {
        setLoading(false);
      }
    };

   
  }, []);

  return (
    <IonPage className="psb-login-page">
      <IonToolbar>
        <IonImg
          src="/assets/logo.jpg"
          alt="Punjab and Sind Bank"
        ></IonImg>
      </IonToolbar>
      <IonContent fullscreen className="login-page">
        <IonLoading isOpen={loading} message="Fetching Datas..." />
        { loginPageResponse && (
          <>
            <ThoughtsModule thoughts={loginPageResponse.data.thoughts}/>
            <IonFab>
              <IonFabButton className="animated" onClick={togglePanel}>
                <FontAwesomeIcon icon={faBirthdayCake}></FontAwesomeIcon>
              </IonFabButton>
            </IonFab>
            <IonGrid>
                <IonRow>
                  <IonCol size="12" size-sm="12" size-md="6" size-lg="12">
                    <ImageSlider slide={loginPageResponse.data.slider}/>
                    <LoginForm/>
                  </IonCol>
                </IonRow>            
            </IonGrid>
            <div className={`panel ${panelVisible ? 'open' : ''}`}>
              {/* <BdayModule onToggle={togglePanel}/> */}
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Login;
