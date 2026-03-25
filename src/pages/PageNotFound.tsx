import React, { useState } from 'react';
import { IonPage, IonContent, IonLoading, IonCard, IonImg } from '@ionic/react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import SelectedSidebar from '../components/SelectedSidebar';

const PageNotFound: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [sideBarVisible, setSideBarVisible] = useState(false);

    const toggleSideBar = () => {
        setSideBarVisible(!sideBarVisible);
    };

    return (
        <center>
            <h1>404. Page Not Found</h1>
            <h2>You don't have permission to access this page.</h2>
        </center>
     );
};

export default PageNotFound;