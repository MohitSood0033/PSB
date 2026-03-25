// Menu.tsx
import React, { useEffect, useState } from 'react';
import { Storage } from '@ionic/storage';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonItem, IonLabel, IonCol, IonIcon, IonRow, IonText } from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import SideBar from './SideBar';

interface MenuProps{
    currentMenu:string
}

const Menu: React.FC<MenuProps> = ({
    currentMenu
}) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const storage = new Storage();
  storage.create();
  

  useEffect(() => {
      
      storage.get('user_details').then((userDetails) => {
      
      if (userDetails != null) {
          setUserDetails(userDetails);
      }
      });
    }, []);
  return (
    <IonMenu contentId="main-content" className="ion-hide-md-up">
        <IonHeader>
          <IonToolbar>
            <IonRow>
              <IonCol>
                <IonImg
                  src="assets/kutumb_logo.png"
                  alt="PSB Kutumb"
                ></IonImg>
                <IonTitle>PSB <strong>KUTUMB</strong></IonTitle>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonItem lines="none" className="user-info-wrapper">
                  <IonRow>
                    <IonCol size="2">
                      <IonIcon icon={personCircle}></IonIcon>
                    </IonCol>
                    <IonCol size="10">
                      <IonItem lines="none" className="details-section">
                        <IonText className="name"><span>{userDetails?.gender === 'Male' ? 'Mr.':'Mrs.'}</span> {userDetails?.name}</IonText> 
                      </IonItem>
                      <IonItem lines="none" className="details-section">     
                        <IonText className="other-info">{userDetails?.pfCode} | {userDetails?.designation}</IonText>
                      </IonItem>
                      <IonItem lines="none" className="details-section">
                        <IonText className="other-info">{userDetails?.branch}</IonText>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  
                </IonItem>
              </IonCol>
            </IonRow>
            
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <SideBar currentMenu={currentMenu}/>
        </IonContent>
      </IonMenu>
  );
};

export default Menu;
