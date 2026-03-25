import { IonButton, IonToast } from '@ionic/react';
import { useEffect, useState } from 'react';
import { alertCircleOutline } from 'ionicons/icons';

interface ToastProps{
    messages : string;
    colours?: string;
    showToasts: boolean;
    durations?: number;
    icons?: string;
}

const Toast: React.FC<ToastProps> = ({messages, colours, showToasts, durations, icons}) => {

    const [showToast1, setShowToast1] = useState<boolean>(showToasts);
    // Added useEffect to handle changes in showToasts prop
    useEffect(() => {
        setShowToast1(showToasts);
    }, [showToasts]);

    return (
        <>
            <IonToast
                isOpen={showToasts}
                onDidDismiss={() => setShowToast1(false)}
                message={(messages != '') ? messages : 'Please try again !!'}
                duration={durations}
                position="middle"
                color={colours}
                icon={icons}
                buttons={[
                {
                    text: 'X',
                    role: 'cancel',
                    handler: () => {
                        setShowToast1(false);
                    },
                },
                ]}
            />
        </>
    );
};

export default Toast;
