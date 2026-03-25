import { IonButton, IonLoading, RefresherEventDetail } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import * as Constant from '../constant/Constant'; 

interface buttonsProps {
    name?: string;
    onSubmit?: () => void;
    cancelbutton?: boolean;
    function?: string;
    disables?: boolean;
    issubmit: boolean;
}
const SubmitButton: React.FC<buttonsProps> = ({name, onSubmit, cancelbutton, disables, issubmit}) => {
    
    const historys = useHistory();
    const [loading, setLoading] = useState<boolean>(false);
    
    const handleBackClick = (event) => {
        setLoading(true);
        setTimeout(() => {
            // window.location.reload();
            // Any calls to load data go here basically for refreshment
            // event.detail.complete();
            setLoading(false);
        }, 1000); 
        sessionStorage.setItem('navigation', 'true');
        historys.push(Constant.HOME_REDIRECT);
        // historys.push("/viewpetrol");

    };

    return (
        <>  
            <IonLoading isOpen={loading} spinner="lines-sharp" animated={true} message="Please wait..." />
            {issubmit &&
                <IonButton shape="round" type="submit" mode="ios" disabled={disables}
                onClick={() => { onSubmit?.(); }}>{name}</IonButton>
            }

            {!issubmit &&
                <IonButton shape="round" type="button" mode="ios" disabled={disables}
                onClick={() => { onSubmit?.(); }}>{name}</IonButton>
            }    
            
            {cancelbutton && (
                <IonButton shape="round" type="button" mode="ios" color="danger" 
                    style={{align:"left"}} onClick={handleBackClick}>Cancel</IonButton>
            )}
        </>
    );
}

export default SubmitButton;