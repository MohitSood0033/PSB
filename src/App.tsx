import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Storage } from '@ionic/storage';
import { StatusBar, Style } from '@capacitor/status-bar';
import DevelopmentPage from './pages/PageUnderDevelopment';
import { API_URL, SECRET_KEY } from './config/config';
import CryptoJS from 'crypto-js';
import * as Constant from './constant/Constant';
import PageUnderDevelopment from './pages/PageUnderDevelopment';
import ScoreCard from './pages/ScoreCard';
import PerformanceDashboard from './pages/PerformanceDashbaord';

setupIonicReact();

const App: React.FC = () => {

  const [userDetail, setUserDetail] = useState<any>(null);
  const key = CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY);
  const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);

  // const history = useHistory();
  const storage = new Storage();
  storage.create();
  useEffect(() => {
    const setStatusBar = async () => {
      const userDetail1 = await storage.get(Constant.USER_DETAILS);
      setUserDetail(userDetail1);
      await StatusBar.setBackgroundColor({ color: '#007c3d' });
      await StatusBar.setStyle({ style: Style.Light });
    };

    setStatusBar();
  }, []);


  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>

          <Route exact path="/home">
            <Home />
          </Route>

          <Route exact path="/scorecard">
            <ScoreCard />
          </Route>

          <Route exact path="/performance-overview">
            <PerformanceDashboard />
          </Route>

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
