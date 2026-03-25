import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Storage } from '@ionic/storage';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../config/config';
import CryptoJS from 'crypto-js';
import { useHistory } from 'react-router-dom';

const AttendanceChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartLabels, setChartLabels] = useState<any>(null);
  const [presentValues, setPresentValues] = useState<any>(null);
  const [absentValues, setAbsentValues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<boolean>(false);  
  const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const key = CryptoJS.enc.Utf8.parse('1234567899876543120');
  const iv = CryptoJS.enc.Utf8.parse('0123456789987654');

  const history = useHistory();
  const storage = new Storage();
  storage.create();

  const handleAuthorized = () => {
    storage.clear(); 
    history.push('/');
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
          
          const eData = CryptoJS.AES.encrypt(JSON.stringify(postData), key, { iv }  ).toString();
          const hash = generateSignature(postData, key);
    
        if (userDetails != null) {
            setUserDetails(userDetails);      
            const response = await axios.post(
                `${API_URL}attendance`,
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
                let responseData = decryptData(responseBody.data, key, iv );
                const resHash      = generateSignature(JSON.parse(responseData), key);
                responseData = JSON.parse(responseData);
                if(resHash == responseBody.hash){
                  const records = responseData.lastfiverecord;
                  const tempLabels = [];
                  const tempPresentValues = [];
                  const tempAbsentValues = [];
                  records.map((item, index) => {
                    tempLabels.push(item.MONTH_YEAR);
                    tempPresentValues.push(item.PRESENT_COUNT);
                    tempAbsentValues.push(item.ABSENT_LEAVE_COUNT);
                  });

                  setChartLabels(tempLabels);
                  setPresentValues(tempPresentValues);
                  setAbsentValues(tempAbsentValues);

                }
                else{
                    setShowToast(true);
                    setLoading(false);
                    setResponseErrorMessage('Hash Mismatch');
                }
                
            } 
            else {
                setShowToast(true);
                setLoading(false);
                setResponseErrorMessage(response.data.message);
            }

        }
    } 
    catch (error) {
        setShowToast(true);
        setLoading(false);
        setResponseErrorMessage(error);
    }
    finally{
        setLoading(false);
    }
};

const createChart = () => {
  if (chartRef.current) {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      const isMobile = window.innerWidth <= 768;
      const barThickness = isMobile ? 30 : 50;

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Present',
              data: presentValues,
              backgroundColor: '#219ebc',
              borderColor: '#219ebc',
              borderWidth: 1,
            },
            {
              label: 'Leave',
              data: absentValues,
              backgroundColor: '#ffc107',
              borderColor: '#ffc107',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false,
              },
            },
            y: {
              stacked: true,
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Last Five Months Attendance',
              position: 'top',
              font: {
                size: isMobile ? 15 : 20,
              },
            },
            legend: {
              display: true,
              position: 'bottom',
            },
          },
          layout: {
            padding: {
              top: isMobile ? 15 : 20,
            },
          },
          indexAxis: 'x',
          barThickness: barThickness,
          categorySpacing: 0,
        } as any,
      });
    }
  }
};
  useEffect(() => {    

    fetchData();

    window.addEventListener('resize', createChart);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      window.removeEventListener('resize', createChart);
    };
  }, []);
  useEffect(() => {
    if (chartLabels && presentValues && absentValues) {
      createChart();
    }
  }, [chartLabels, presentValues, absentValues]);

  return <canvas ref={chartRef}></canvas>;
};

export default AttendanceChart;
