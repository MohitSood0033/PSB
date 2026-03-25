import React, { useState } from 'react';
import { IonPage, IonContent, IonLoading, IonCard, IonImg } from '@ionic/react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import SelectedSidebar from '../components/SelectedSidebar';

const PageUnderDevelopment: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [sideBarVisible, setSideBarVisible] = useState(false);

    const toggleSideBar = () => {
        setSideBarVisible(!sideBarVisible);
    };

    return (
        <>
            <IonLoading isOpen={loading} spinner="lines-sharp" animated={true} message="Please wait..." />
            <Menu currentMenu='view petrol'/>
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header/>
                <IonContent fullscreen className="ion-padding">
                    <IonCard className="psb-page-card filter-section box">
                    <IonImg src="/assets/construction.jpg" alt="Punjab and Sind Bank" style={{height: "300px", width: "300px", margin: "auto"}} ></IonImg>
                        <h1 style={{ textAlign: 'center' }}>This Page is Under Development !!</h1>
                        <p style={{ textAlign: 'center' }}>
                        We're currently working on this page.
                        It will be available soon!
                        </p>
                    </IonCard>
                    <SelectedSidebar sidebarname='viewpetrol' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
                </IonContent>
            </IonPage>
        </>
     );
};

export default PageUnderDevelopment;