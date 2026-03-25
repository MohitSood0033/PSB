// utils/CommonFunctions.ts
import * as Constant from './Constant'; 
import CryptoJS from 'crypto-js';

export class ofunctions {

    static redirectHomePage(history: any, loading: boolean): void {
        setTimeout(() => {
            sessionStorage.setItem('navigation', 'true');
            history.replace(Constant.HOME_REDIRECT);
            loading = false;
          }, 3000);
    }

    static refreshPage(history: any, loading: boolean): void {
          setTimeout(() => {
            sessionStorage.setItem('navigation', 'true');
            window.location.reload();
            loading = false;
          }, 2000);
    }

    static redirectToPage(history: any, loading: boolean, pageName: string): void {
      setTimeout(() => {
          sessionStorage.setItem('navigation', 'true');
          history.replace(pageName);
          loading = false;
        }, 3000);
    }

    static generateSignature(data: any): any {
      const hash = CryptoJS.HmacSHA256(JSON.stringify(data), CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY)).toString(CryptoJS.enc.Base64);
      return hash;
    };

    static encryptData(data: any): string {
      const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);
      return  CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY), { iv }  ).toString();
    };

    static decryptData(encryptedData: string): any {
      const iv = CryptoJS.enc.Utf8.parse(Constant.CRYPTOIV);
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(Constant.CRYPTOKEY), { iv });
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      return decryptedText;
    };

      
  }
  