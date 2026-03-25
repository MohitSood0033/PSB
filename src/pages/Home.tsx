import { IonCard, IonCardContent, IonCol, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonPage, IonRow, IonText, IonTitle, IonToolbar, isPlatform } from '@ionic/react';
import './Home.css';
import { useEffect, useState } from 'react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import AttendanceChart from '../components/AttendanceChart';
import { Doughnut, Pie } from 'react-chartjs-2';
import { ellipsisVerticalSharp } from 'ionicons/icons';
import SideBar from '../components/SideBar';
import IdleTimeout from '../components/IdleTimeout';
import CryptoJS from 'crypto-js';
import { Storage } from '@ionic/storage';
import { API_URL, IDLE_TIMEOUT } from '../config/config';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import PsbCalendar from '../components/PsbCalendar';
import SelectedSidebar from '../components/SelectedSidebar';
import { CRYPTOIV, CRYPTOKEY } from '../constant/Constant';


const Home: React.FC = () => {
  ;
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
  const key = CRYPTOKEY;
  const iv = CRYPTOIV;
  const [sideBarVisible, setSideBarVisible] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState<any>(0);
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);
  const [leaveRecords, setLeaveRecords] = useState<any>(null);
  const [scaleRecords, setScaleRecords] = useState<any>(null);
  const [totalBranch, setTotalBranches] = useState<any>(0);

  const isMobile = window.innerWidth <= 768;
  const history = useHistory();
  const storage = new Storage();
  storage.create();

  const toggleSideBar = () => {
    setSideBarVisible(!sideBarVisible);
  };

  const closeSideBar = () => {
    setSideBarVisible(false);
  };

  const handleAuthorized = async () => {
    await storage.clear();
    history.replace('/');
    setShowToast(true);
    setLoading(false);
    setResponseErrorMessage('You are not authorized. Please log in again.');

  };

  const generateSignature = (data, secretKey) => {
    const hash = CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString(CryptoJS.enc.Base64);
    return hash;
  };

  const decryptData = (encryptedData, key, iv) => {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, { iv });
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userDetails = await storage.get('user_details');

      const postData = {
        user_token: userDetails.userToken,
        device_id: userDetails.deviceId
      }

      const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }).toString();
      const hash = generateSignature(postData, key);

      if (userDetails != null) {
        setUserDetails(userDetails);
        const response = await axios.post(
          `${API_URL}home`,
          {
            data: eData,
            hash: hash
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status === 200) {
          setLoading(false);
          const responseBody = response.data;
          let responseData = decryptData(responseBody.data, key, iv);
          const resHash = generateSignature(JSON.parse(responseData), key);
          responseData = JSON.parse(responseData);
          if (resHash == responseBody.hash) {
            if (!responseData.error) {
              setTotalEmployees(responseData.totalempcount);
              setAttendanceRecord(responseData.attendancerecord);
              setTotalBranches(responseData.totalbranchcount);
              if (responseData.leaverecords != null) {
                const leaveData = {
                  labels: Object.keys(responseData.leaverecords),
                  datasets: [
                    {
                      data: Object.values(responseData.leaverecords),
                      backgroundColor: ['#06d6a0', '#ef476f', '#ffd166', '#FF5733'],
                      hoverBackgroundColor: ['#a7ebd9', '#ee7f8f', '#e3c88a', '#FF9F33'],
                    },
                  ],
                };

                setLeaveRecords(leaveData);

              }
              if (responseData.scalerecords != null) {
                const scaleWiseData = {
                  labels: Object.keys(responseData.scalerecords),
                  datasets: [
                    {
                      data: Object.values(responseData.scalerecords),
                      backgroundColor: ['#f28482', '#f77f00', '#003049', '#ffd60a', '#a7c957', '#d81159', '#84a59d'],
                      hoverBackgroundColor: ['#f28482', '#f77f00', '#003049', '#ffd60a', '#a7c957', '#d81159', '#84a59d'],
                    },
                  ],
                };

                setScaleRecords(scaleWiseData);

              }

            }
            else {
              setShowToast(true);
              setLoading(false);
              setResponseErrorMessage(responseData.message);
            }
          }
          else {
            setShowToast(true);
            setLoading(false);
            setResponseErrorMessage('Hash Mismatch');
          }

        }
        else if (response.status === 401) {
          handleAuthorized();
          return;
        }
        else {
          setShowToast(true);
          setLoading(false);
          setResponseErrorMessage(response.data.error_description);
        }

      }
    }
    catch (error) {
      if (error.response && error.response.status === 401) {
        handleAuthorized();

      }
      else {
        setShowToast(true);
        setLoading(false);
        setResponseErrorMessage(error.message);
      }
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const leaveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      title: {
        display: true,
        text: 'Leave Balance',
        font: {
          size: isMobile ? 15 : 20,
        },
      },
      legend: {
        display: true,
        position: 'bottom' as const, // Cast the position to a constant string
      },
    },
  };

  const scaleWiseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '0%',
    plugins: {
      title: {
        display: true,
        text: 'Scale Wise Employees',
        font: {
          size: isMobile ? 15 : 20,
        },
      },
      legend: {
        display: true,
        position: 'bottom' as const, // Cast the position to a constant string
      },
    },
  };

  return (
    <>
      <Menu currentMenu='home' />
      <IonPage className="psb-pages platform-specific-page" id="main-content">
        <Header />
        <IonContent fullscreen className="ion-padding">
          {/* <div style={{marginLeft: "15%"}}> */}
          <div className="psb-page-width">
            <IonRow className="counter-content ion-hide-md-down">
              <IonCol size='4' sizeLg='4' sizeMd='4'>
                <IonCard className='count-card'>
                  <IonCardContent>
                    <IonItem lines='none' className="dashboard-item emp-item">
                      <IonText className="title">Total Employees</IonText>
                      <IonText className="count">{totalEmployees}</IonText>
                    </IonItem>
                    <IonItem lines='none' className="dashboard-item branch-item">
                      <IonText className="title">Total Branches</IonText>
                      <IonText className="count">{totalBranch}</IonText>
                    </IonItem>
                    <IonItem lines='none' className="dashboard-item present-item">
                      <IonText className="title">Total Presents</IonText>
                      <IonText className="sub-title">(in {userDetails?.branch})</IonText>
                      <IonText className="count">{attendanceRecord?.totalpresent}</IonText>
                    </IonItem>
                    <IonItem lines='none' className="dashboard-item leave-item">
                      <IonText className="title">Total On Leave</IonText>
                      <IonText className="sub-title">(in {userDetails?.branch})</IonText>
                      <IonText className="count">{attendanceRecord?.totalleave}</IonText>
                    </IonItem>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size='5' sizeLg='5' sizeMd='5'>
                <PsbCalendar />
              </IonCol>
            </IonRow>
            <IonRow className="graph-content">
              <IonCol size="6" sizeLg='6' sizeMd='6' sizeSm='12' sizeXl='6' sizeXs='12'>
                <IonCard>
                  <IonItem lines='none'>
                    <AttendanceChart />
                  </IonItem>
                </IonCard>
              </IonCol>
              <IonCol size="3" sizeLg='3' sizeMd='3' sizeSm='12' sizeXl='3' sizeXs='12'>
                <IonCard>
                  <IonItem lines='none'>
                    {
                      leaveRecords &&
                      <Doughnut data={leaveRecords} options={leaveOptions} />
                    }
                  </IonItem>

                </IonCard>
              </IonCol>
              <IonCol size="3" sizeLg='3' sizeMd='3' sizeSm='12' sizeXl='3' sizeXs='12'>
                <IonCard>
                  <IonItem lines='none'>
                    {
                      scaleRecords &&
                      <Pie data={scaleRecords} options={scaleWiseOptions} />
                    }
                  </IonItem>
                </IonCard>
              </IonCol>
            </IonRow>
          </div>
        </IonContent>
        <SelectedSidebar sidebarname='leave' sideBarVisible={sideBarVisible} toggleSideBar={toggleSideBar} />
        {/* <div className={`ion-hide-sm-down sidebar ${sideBarVisible ? 'open' : ''}`}>
            <SideBar currentMenu='home'/> 
            <IonFab className="menu-icon">
              <IonFabButton className="animated" onClick={toggleSideBar}>
                <IonIcon icon={ellipsisVerticalSharp} />
              </IonFabButton>
            </IonFab>      
          </div> */}
      </IonPage>
      <IdleTimeout timeout={IDLE_TIMEOUT} />
    </>
  );
};

export default Home;
