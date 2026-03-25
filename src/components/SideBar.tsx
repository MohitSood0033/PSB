import React, { useEffect, useRef } from 'react';
import { IonItem, IonLabel, IonIcon, IonList, IonRouterLink, IonAccordion, IonListHeader, IonAccordionGroup } from '@ionic/react';
import './SideBar.css';
import { wallet, home, caretForward, powerOutline, addCircle, receipt, leaf, eyeOutline, calendar, pintOutline, colorFillOutline, colorFill, send, water, sendOutline, waterOutline, briefcase, pencil, easelOutline, book } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { Storage } from '@ionic/storage';
import { CursorType } from '@syncfusion/ej2-react-pdfviewer';

interface SideBarProps {
  currentMenu: string
}

const SideBar: React.FC<SideBarProps> = ({
  currentMenu
}) => {
  const [userDetails, setUserDetails] = React.useState<any>(null);
  const accordionGroupRef = useRef<HTMLIonAccordionGroupElement>(null);
  const history = useHistory();
  const storage = new Storage();
  storage.create();

  const handleLogout = async () => {
    await storage.clear();
    await sessionStorage.clear();
    history.replace('/');
  };

  // Clear storage once tab is closed
  // window.onbeforeunload = function() {
  //   storage.clear();
  // }

  // window.onbeforeunload = function() {
  //   if (sessionStorage.getItem('navigation') === 'true') {
  //     // page is all ok no logout is reuired
  //     console.log('Page is logged out');
  //     sessionStorage.setItem('navigation', '');
  //   } else {
  //     storage.clear();
  //   }
  // }

  const getItemClass = (menuData: any): string => {
    for (const item of menuData) {
      if (currentMenu === item.menu_link) {
        return "sidebar-item active";
      } else if (item.sub_menu) {
        const subMenuClass = getItemClass(item.sub_menu);
        if (subMenuClass.includes("active")) {
          return "sidebar-item active";
        }
      }
    }
    return "sidebar-item";
  };
  

  const renderMenuItems = (menuData: any, num : number) => {
    if (menuData != undefined) {
      return (
        <>
          <IonAccordionGroup  ref={accordionGroupRef}>
            {menuData.map((item: any) => (
              item.sub_menu  && (item.sub_menu).length > 0 ? (
                <IonAccordion
                  key={item.menu_item}
                  value={item.menu_link}
                >
                  <IonItem slot="header" lines='none' className={getItemClass(item.sub_menu)} style={{cursor: "pointer"}}>
                    <IonIcon slot="start" icon={getIonIcon(item.menu_icon)} />
                    <IonLabel>{item.menu_item}</IonLabel>
                  </IonItem>
                  
                  <div className="accordion-content" slot="content">
                    {renderMenuItems(item.sub_menu, 1)}
                  </div>
                </IonAccordion>
              ) : (
                <IonItem
                  lines='none'
                  key={item.menu_item}
                  className={currentMenu === item.menu_link ? "sidebar-item active" : "sidebar-item"}
                >
                  <IonIcon slot="start" icon={getIonIcon(item.menu_icon)} />
                  {item.menu_link ? (
                    <IonRouterLink onClick={() => goToPage(item.menu_link)}>
                      <IonLabel>{item.menu_item}</IonLabel>
                    </IonRouterLink>
                  ) : (
                    <IonLabel>{item.menu_item}</IonLabel>
                  )}
                </IonItem>
              )
            ))
            }
          
            {
              num == 0 &&
              <>
                <IonItem 
                  className={currentMenu === 'attendance' ? "sidebar-item ion-hide-md-up active" : "sidebar-item ion-hide-md-up"}
                  onClick={() => goToPage('attendance')}>
                  <IonIcon icon={calendar}></IonIcon>
                  <IonLabel>Attendance</IonLabel>
                </IonItem>
                <IonItem 
                  className="sidebar-item ion-hide-md-up"
                  onClick={handleLogout}>
                  <IonIcon icon={powerOutline}></IonIcon>
                  <IonLabel>Logout</IonLabel>
                </IonItem>
              </>
            }
          </IonAccordionGroup>
          
          {/* {
            <IonAccordionGroup  ref={accordionGroupRef}>
              <IonAccordion>
                <IonItem  onClick={() => goToPage('entertainment')}>
                  <IonIcon icon={easelOutline}></IonIcon>
                  <IonLabel>Entertainment</IonLabel>
                </IonItem>
              </IonAccordion>
            </IonAccordionGroup>
          } */}

        </>
      );
    }
  };

  const goToPage = (link : any) => {
    history.replace('/'+link);
  }

  React.useEffect(() => {
    storage.get('user_details').then((userDetails) => {
      if (userDetails != null) {
        setUserDetails(userDetails);
      }
    });

    // If sessionstorage is not present then logout
    if (sessionStorage.getItem('user_details') === null) {
        storage.clear();
    }
  }, []);

  const getIonIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return home;
      case 'salary':
        return wallet;
      case 'payslip':
        return receipt;
      case 'leave':
        return leaf;
      case 'eyeOutline':
        return eyeOutline;
      default:
        return caretForward; 
    }
  };

  return (
    <IonItem className="sidebar-content">
      {renderMenuItems(userDetails?.menus, 0)}
    </IonItem>
  );
}

export default SideBar;