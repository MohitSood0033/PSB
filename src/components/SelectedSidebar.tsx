import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import SideBar from "./SideBar";
import { menu } from "ionicons/icons";

interface sidebars {
    sidebarname: string;
    sideBarVisible: boolean;
    toggleSideBar: any;

}
const SelectedSidebar: React.FC<sidebars> = ({sidebarname, sideBarVisible, toggleSideBar}) => {
    return (
        <>
        <div className={`ion-hide-sm-down sidebar ${sideBarVisible ? 'open' : 'open'}`}>
            <SideBar currentMenu={sidebarname}/> 
            <IonFab className="menu-icon">
            {/* <IonFabButton className="animated" onClick={toggleSideBar}>
                <IonIcon icon={menu} />
            </IonFabButton> */}
            </IonFab>      
        </div>
        </>
    );
};

export default SelectedSidebar;