import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonLoading, IonPage } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import SelectedSidebar from '../components/SelectedSidebar';
import IdleTimeout from '../components/IdleTimeout';
import { IDLE_TIMEOUT } from '../config/config';
import Toasts from '../components/Toast';
import { Storage } from '@ionic/storage';
import EmpHeader from '../components/EmpHeader';

const Entertainment: React.FC = () => {

    const [userDetails, setUserDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [color, setColor] = useState<string>("danger");
    const [icon, setIcon] = useState<string>();

    const storage = new Storage();
    storage.create();

    useEffect(() => {
        storage.get('user_details').then((userDetail) => {
            if (userDetail != null) {
                setUserDetails(userDetail);
            }
        });

    }, []);

    const toggleSideBar = () => {
        setSideBarVisible(!sideBarVisible);
    };

    return (
        <>
            <IonLoading isOpen={loading} spinner="lines-sharp" animated={true} message="Please wait..." />
            <Menu currentMenu='Briefcase'/>
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header />
                <IonContent fullscreen className="ion-padding">
                <IonCard className="psb-page-card filter-section box">
                    <IonCardHeader>
                    <IonCardTitle>Apply For Entertainment Allowance Claim</IonCardTitle>
                    </IonCardHeader>
                    <br />
                    <IonCardContent style={{fontSize: "10px"}}>
                    {/* <form onSubmit={handleSubmit} encType='multipart/form-data'> */}
                        <div className="rcorners animated-box">
                            <EmpHeader empdetails={userDetails} />
                        </div>
                    {/* </form> */}
                    </IonCardContent>
                    </IonCard>
                </IonContent>
                <SelectedSidebar sidebarname='entertainment' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar}/>
            </IonPage>
            <IdleTimeout timeout={IDLE_TIMEOUT} />
            {showToast && <Toasts messages={responseErrorMessage} showToasts={showToast} colours={color} durations={2000} icons={icon} />}
        </>
    );

}

export default Entertainment;