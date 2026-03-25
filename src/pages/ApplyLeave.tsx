import React, { useState } from 'react';
import { IonInput, IonToggle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonImg, IonSelect, IonSelectOption,IonDatetime, IonButton,IonSpinner,
  IonRow, IonCol, IonItem, IonAccordion, IonAccordionGroup, IonAvatar, IonLabel, IonList, IonIcon, IonFab, IonFabButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonTextarea } from '@ionic/react';
import { person, laptop, globe, powerOutline, ellipsisVerticalSharp, time, calendar } from 'ionicons/icons';
import './ApplyLeave.css';
import SideBar from '../components/SideBar';
import FloatingInput from '../components/FloatingInput';
import DateRangeInput from '../components/DateRangeInput';
import Menu from '../components/Menu';
import Header from '../components/Header';
import IdleTimeout from '../components/IdleTimeout';
import { IDLE_TIMEOUT } from '../config/config';

const ApplyLeave: React.FC = () => {;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());

  const handleDateChange = (e: CustomEvent<any>) => {
    setSelectedDate(e.detail.value);
  };

  const [sideBarVisible, setSideBarVisible] = useState(false);

  const toggleSideBar = () => {
    setSideBarVisible(!sideBarVisible);
  };

  const closeSideBar = () => {
    setSideBarVisible(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const [isChecked, setIsChecked] = useState(true);

  const handleToggleChange = () => {
    setIsChecked(!isChecked);
  };
 

  return (
    <>
      <Menu currentMenu='applyleave'/>
      <IonPage className="psb-pages platform-specific-page" id="main-content">
        <Header/>
        <IonContent fullscreen className="ion-padding">          
          <IonCard className="psb-page-card">
            <IonCardHeader>
              <IonCardTitle>Apply Leave</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonRow>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonList className="psb-form-list">
                      <IonItem lines="none">
                        <IonSelect placeholder="Select Leave Type">
                          <div slot="label">Select Leave Type</div>
                          <IonSelectOption value="2024">2024</IonSelectOption>
                          <IonSelectOption value="2023">2023</IonSelectOption>
                          <IonSelectOption value="2022">2022</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonList>
                  </IonCol>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonList className="psb-form-list">
                      <IonItem lines="none">
                        <IonSelect placeholder="Select Reason for Leave">
                          <div slot="label">Select Reason for Leave</div>
                          <IonSelectOption value="01">January</IonSelectOption>
                          <IonSelectOption value="02">February</IonSelectOption>
                          <IonSelectOption value="03">March</IonSelectOption>
                          <IonSelectOption value="04">April</IonSelectOption>
                          <IonSelectOption value="05">May</IonSelectOption>
                          <IonSelectOption value="06">June</IonSelectOption>
                          <IonSelectOption value="07">July</IonSelectOption>
                          <IonSelectOption value="08">August</IonSelectOption>
                          <IonSelectOption value="09">September</IonSelectOption>
                          <IonSelectOption value="10">October</IonSelectOption>
                          <IonSelectOption value="11">November</IonSelectOption>
                          <IonSelectOption value="12">December</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonList>
                  </IonCol>
                </IonRow>                
                <DateRangeInput fromLabel="Leave From Date" toLabel="Leave To Date" isNum={true}/>                
                <IonRow>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonInput
                        mode="md"
                        label="Leaving Station"
                        labelPlacement="stacked"
                        fill="outline"
                        className="psb-input psb-toggle-input"
                        readonly={true}
                    />
                    <IonToggle
                      color="success"
                      checked={isChecked}
                      onIonChange={handleToggleChange}
                      className="psb-toggle"
                    />
                    <IonLabel className="psb-toggle-label">{isChecked ? 'Yes' : 'No'}</IonLabel>
                  </IonCol>
                  {isChecked &&
                    <IonCol className="outer-col" size="12" sizeLg="8" sizeMd="8" sizeSm="12" sizeXl="8" sizeXs="12">
                      <DateRangeInput fromLabel="Leaving Station From Date" toLabel="Leaving Station To Date"/>
                    </IonCol>
                  }
                </IonRow>
                <IonTextarea
                  mode='md'
                  label="Remarks"
                  labelPlacement="stacked"
                  fill="outline"
                  className="psb-input"
                  spellCheck={true}
                  autoGrow={true}
                />
                <IonRow>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonList className="psb-form-list">
                      <IonItem lines="none">
                        <IonSelect placeholder="Select Handling over charge to">
                          <div slot="label">Select Handling over charge to</div>
                          <IonSelectOption value="2024">2024</IonSelectOption>
                          <IonSelectOption value="2023">2023</IonSelectOption>
                          <IonSelectOption value="2022">2022</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonList>
                  </IonCol>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonInput
                      mode='md'
                      label="Leave Address Line 1"
                      labelPlacement="stacked"
                      fill="outline"
                      className="psb-input"
                    />
                  </IonCol>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonInput
                      mode='md'
                      label="Leave Address Line 2"
                      labelPlacement="stacked"
                      fill="outline"
                      className="psb-input"
                    />
                  </IonCol>
                </IonRow>              
                <IonRow>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonInput
                      mode='md'
                      label="Alternate Mobile Number"
                      labelPlacement="stacked"
                      fill="outline"
                      className="psb-input"
                    />
                  </IonCol>
                  <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonInput
                        mode='md'
                        label="Select File"
                        labelPlacement="stacked"
                        fill="outline"
                        className="psb-input"
                        readonly={true}
                    />
                    <input type="file" accept=".pdf, .doc, .docx" />
                  </IonCol>
                </IonRow>
                <div className="ion-text-center apply-btn-container">
                    <IonButton shape="round" type="submit" mode="ios">Apply</IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
          
          <div className={`ion-hide-sm-down sidebar ${sideBarVisible ? 'open' : ''}`}>
            <SideBar currentMenu='applyleave'/> 
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

export default ApplyLeave;
