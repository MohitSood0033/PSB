import React from 'react';
import {IonItem,  IonText} from '@ionic/react';
import './ThougthsModule.css'; 
import { ThoughtsData } from '../interfaces/LoginPageResponse';

interface ThoughtsProp{
    thoughts: ThoughtsData
}

const ThoughtsModule: React.FC<ThoughtsProp> = ({thoughts}) => {
    
    return (
        <IonItem lines='none' className="psb-thoughts">
            <IonText><strong>आज का सुविचार: </strong> {thoughts.hi} <strong> - {thoughts.thinker_hi}</strong></IonText>
        </IonItem>
      );
}

export default  ThoughtsModule;