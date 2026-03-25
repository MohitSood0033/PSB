import React, { useEffect, useState } from 'react';
import { IonContent, IonGrid, IonRow, IonCol, IonPage, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import './Attendance.css';
import Menu from '../components/Menu';
import Header from '../components/Header';
import { Storage } from '@ionic/storage';
import SideBar from '../components/SideBar';
import { IDLE_TIMEOUT } from '../config/config';
import { useHistory } from 'react-router-dom';
import { ellipsisVerticalSharp, closeCircleOutline, eye } from 'ionicons/icons';
import IdleTimeout from '../components/IdleTimeout';
import PsbCalendar from '../components/PsbCalendar';

const Attendance: React.FC = () => {
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [userDetails, setUserDetails] = useState<any>(null);
    
    const history = useHistory();
    const storage = new Storage();
    storage.create();
    const toggleSideBar = () => {
        setSideBarVisible(!sideBarVisible);
    };
    
  return (
    <>
        <Menu currentMenu='attendance'/>
        <IonPage className="psb-pages platform-specific-page" id="main-content">
            <Header/>
            <IonContent fullscreen className="ion-padding psb-attendance">
                <IonGrid>
                    <PsbCalendar/>
                </IonGrid>
                <div className={`ion-hide-sm-down sidebar ${sideBarVisible ? 'open' : ''}`}>
                    <SideBar currentMenu='attendance'/> 
                    <IonFab className="menu-icon">
                    <IonFabButton className="animated" onClick={toggleSideBar}>
                        <IonIcon icon={ellipsisVerticalSharp} />
                    </IonFabButton>
                    </IonFab>      
                </div>
            </IonContent>
        </IonPage>
        <IdleTimeout timeout={IDLE_TIMEOUT} />
    </>
  );
};

export default Attendance;

