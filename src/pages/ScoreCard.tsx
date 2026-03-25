import {
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonSelect,
    IonSelectOption,
    IonRow,
    IonCol
} from '@ionic/react';
import '../css/ScoreCard.css';
import { useState, useEffect, useMemo } from 'react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import chair from '../assets/svg/chair.svg';
import greenBg from '../assets/svg/bg.svg';
import axios from 'axios';

const months = [
    { label: 'Jan', value: '1' },
    { label: 'Feb', value: '2' },
    { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' },
    { label: 'May', value: '5' },
    { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' },
    { label: 'Aug', value: '8' },
    { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
];

const ScoreCard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [responseErrorMessage, setResponseErrorMessage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'strength' | 'concern'>('strength');
    const currentDate = new Date();

    const getPreviousMonth = () => {
        const today = new Date();
        const prev = new Date(today.getFullYear(), today.getMonth() - 1);
        return {
            month: (prev.getMonth() + 1).toString(),
            year: prev.getFullYear().toString()
        };
    };

    const prevDate = getPreviousMonth();

    const [selectedYear, setSelectedYear] = useState(prevDate.year);
    const [selectedMonth, setSelectedMonth] = useState(prevDate.month);
    const currentYear = currentDate.getFullYear();

    const years = [
        currentYear.toString(),
        (currentYear - 1).toString()
    ];
    const [empDetails, setEmpDetails] = useState<any>(null);
    const [currentRoleData, setCurrentRoleData] = useState<any>(null);
    const [performanceDetails, setPerformanceDetails] = useState<any>(null);
    const [strengthData, setStrengthData] = useState<any[]>([]);
    const [concernData, setConcernData] = useState<any[]>([]);
    const listData = activeTab === 'strength' ? strengthData : concernData;
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzQyNDM3NDQsImlzcyI6InBzYi1hcGkiLCJleHAiOjE3NzY0MDM3NDQsInN1YiI6InBzYiBhcGkgQXV0aGVudGljYXRpb24iLCJ1c2VyX2lkIjoiUzI5MjIyIn0.jUkvtJ60UjUABeASnnthxaVvPWhRWSL1sMYUHjtR9CQ";

    const filteredMonths = useMemo(() => {
        const today = new Date();
        const prevMonth = today.getMonth(); // IMPORTANT (no +1)

        if (Number(selectedYear) === today.getFullYear()) {
            return months.filter(m => Number(m.value) <= prevMonth);
        }

        return months;
    }, [selectedYear]);

    const getMonthComparison = (month: string, year: string) => {
        const monthIndex = Number(month) - 1;
        const date = new Date(Number(year), monthIndex);

        const currentMonth = date
            .toLocaleString('default', { month: 'short' })
            .toUpperCase();

        const currentYear = date.getFullYear().toString().slice(-2);

        const prevDate = new Date(date);
        prevDate.setMonth(prevDate.getMonth() - 1);

        const prevMonth = prevDate
            .toLocaleString('default', { month: 'short' })
            .toUpperCase();

        const prevYear = prevDate.getFullYear().toString().slice(-2);

        return `${prevMonth}’${prevYear} VS ${currentMonth}’${currentYear}`;
    };

    const comparisonText = useMemo(() => {
        return getMonthComparison(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const fetchScoreCard = async () => {
        try {
            setLoading(true);
            const postData = {
                user_id: 'S29222',
                month: selectedMonth,
                year: selectedYear
            };

            const response = await axios.post(
                "/api/score-card-details",
                postData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Token": `Bearer ${token}`,
                        "device-type": "android",
                        "app-version": "1.0",
                        "device-udid": "650951c120c2548"
                    },
                    auth: {
                        username: "admin",
                        password: "1234"
                    }
                }
            );

            if (response.status === 200) {
                const data = response.data.data;

                console.log("ScoreCard API:", data);
                const emp = data.emp_details?.[0];
                const current_role = data.current_role_details?.[0];
                const performance_details = data.performance_details?.[0];
                const firstThree = data?.kra_score_list?.slice(0, 3) || [];
                const lastThree = data?.kra_score_list?.slice(-3) || [];
                console.log(firstThree, lastThree);

                if (emp) {
                    setEmpDetails({
                        emp_name: emp.EMP_NAME,
                        scale: emp.SCALE
                    });
                }
                if (current_role) {
                    setCurrentRoleData({
                        br_name: current_role.BRNAME,
                        main_role: current_role.MAIN_ROLE,
                        role_start_date: current_role.ROLE_START_DATE,
                        role_end_date: current_role.ROLE_END_DATE,
                    })
                }
                if (performance_details) {
                    const score = Number(performance_details.SELECTED_MONTH_YTD_SCORE);
                    const maxScore = Number(performance_details.SELECTED_MONTH_YTD_MAX_SCORE);
                    console.log(score, maxScore);

                    const percentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : 0;
                    setPerformanceDetails({
                        cohort_percentile: performance_details.COHORT_PERCENTILE,
                        curr_vs_prev_mnth: performance_details.CURRENT_VS_PREVIOUS_MONTH_PERC,
                        selected_mnth_ytd_max_score: performance_details.SELECTED_MONTH_YTD_MAX_SCORE,
                        selected_mnth_ytd_score: performance_details.SELECTED_MONTH_YTD_SCORE,
                        percentage: percentage
                    })
                }
                setStrengthData(firstThree)
                setConcernData(lastThree)
            } else if (response.status === 401) {
                setResponseErrorMessage("Session expired. Please login again.");
            }

        } catch (error: any) {
            console.error("ScoreCard Error:", error);

            if (error.response?.status === 401) {
                setResponseErrorMessage("Session expired. Please login again.");
            } else {
                setResponseErrorMessage(error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (error) {
            return dateString;
        }
    };

    useEffect(() => {
        const today = new Date();
        const prevMonth = today.getMonth();

        if (
            Number(selectedYear) === today.getFullYear() &&
            Number(selectedMonth) > prevMonth
        ) {
            setSelectedMonth(prevMonth.toString());
            return;
        }

        fetchScoreCard();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        const currentMonth = new Date().getMonth() + 1;

        if (
            Number(selectedYear) === currentYear &&
            Number(selectedMonth) > currentMonth
        ) {
            setSelectedMonth(currentMonth.toString());
        }
    }, [selectedYear]);

    return (
        <>
            <Menu currentMenu='scorecard' />
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header />
                <IonContent fullscreen>
                    <div className="psb-page-width scorecard-page">
                        <div className="user-block">
                            <h2>{empDetails?.emp_name || '---'}</h2>
                            <p>Welcome</p>
                            <span>Have a great day ahead.</span>
                        </div>
                        <img src={greenBg} className="bg-icon" alt="bg icon" />
                        <IonCard className="role-card">
                            <IonCardContent className="role-card-content">
                                <div className="role-container">
                                    <div className="icon-box">
                                        <img src={chair} className="icon" alt="role icon" />
                                    </div>
                                    <div className="middle">
                                        <h3>{currentRoleData?.main_role || '---'}</h3>
                                        <p>
                                            {currentRoleData?.br_name || '---'} -(
                                            {currentRoleData?.role_start_date ? formatDate(currentRoleData.role_start_date) : '---'} -
                                            {!currentRoleData?.role_end_date
                                                ? ' Present'
                                                : currentRoleData?.role_end_date ? formatDate(currentRoleData.role_end_date) : '---'
                                            })
                                        </p>
                                    </div>
                                    <div className="scale-box">
                                        <span>Scale</span>
                                        <h2>{empDetails?.scale || '---'}</h2>
                                    </div>
                                </div>
                            </IonCardContent>
                        </IonCard>

                        <IonCard className="performance-card">
                            <IonCardContent className="performance-card-content">
                                <div className="perf-top">
                                    <div className="left">
                                        <h3>Your Performance</h3>
                                        <IonRow className="dropdown-row">
                                            <IonCol>
                                                <IonSelect
                                                    className="custom-dropdown"
                                                    labelPlacement="floating"
                                                    label='Year'
                                                    fill="outline"
                                                    interface="action-sheet"
                                                    interfaceOptions={{ header: "Select Year" }}
                                                    value={selectedYear}
                                                    onIonChange={(e) => setSelectedYear(e.detail.value)}
                                                >
                                                    {years.map((year) => (
                                                        <IonSelectOption key={year} value={year}>
                                                            {year}
                                                        </IonSelectOption>
                                                    ))}
                                                </IonSelect>
                                            </IonCol>
                                            <IonCol>
                                                <IonSelect
                                                    className="custom-dropdown"
                                                    labelPlacement="floating"
                                                    label='Month'
                                                    fill="outline"
                                                    interface="action-sheet"
                                                    interfaceOptions={{ header: "Select Month" }}
                                                    value={selectedMonth}
                                                    onIonChange={(e) => setSelectedMonth(e.detail.value)}
                                                >
                                                    {filteredMonths.map((month) => (
                                                        <IonSelectOption key={month.value} value={month.value}>
                                                            {month.label}
                                                        </IonSelectOption>
                                                    ))}
                                                </IonSelect>
                                            </IonCol>
                                        </IonRow>

                                    </div>
                                    <div className="right">
                                        <div
                                            className="progress-circle"
                                            style={{ '--value': Number(performanceDetails?.percentage || 0) } as React.CSSProperties}
                                        >
                                            <div className="inner-circle"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="perf-bottom">
                                    <div className="stats">
                                        <div className="stat-item">
                                            <h2>{performanceDetails?.cohort_percentile ? `${performanceDetails.cohort_percentile}%` : '--%'}</h2>
                                            <p>Cohort Percentile</p>
                                        </div>
                                        <div className="stat-item">
                                            <h2
                                                className={
                                                    performanceDetails?.curr_vs_prev_mnth && Number(performanceDetails.curr_vs_prev_mnth) < 0
                                                        ? "negative"
                                                        : "positive"
                                                }>
                                                {performanceDetails?.curr_vs_prev_mnth ? `${performanceDetails.curr_vs_prev_mnth}%` : '--%'}
                                            </h2>
                                            <p>{comparisonText || '---'}</p>
                                        </div>
                                    </div>
                                    <div className="score">
                                        <h1>{performanceDetails?.percentage ? `${performanceDetails.percentage}%` : '--%'}</h1>
                                        <p>
                                            {performanceDetails?.selected_mnth_ytd_score && performanceDetails?.selected_mnth_ytd_max_score
                                                ? `${performanceDetails.selected_mnth_ytd_score} / ${performanceDetails.selected_mnth_ytd_max_score}`
                                                : performanceDetails?.selected_mnth_ytd_score
                                                    ? `${performanceDetails.selected_mnth_ytd_score}`
                                                    : '--'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </div>
                    <div className="psb-page-width scorecard-segment-sec">
                        <IonCard className="segment-main">
                            <div className="segment">
                                <button
                                    className={activeTab === 'strength' ? 'active' : ''}
                                    onClick={() => setActiveTab('strength')}
                                >
                                    Area of Strength
                                </button>
                                <button
                                    className={activeTab === 'concern' ? 'active' : ''}
                                    onClick={() => setActiveTab('concern')}
                                >
                                    Area of Concern
                                </button>
                            </div>

                            <div className='list-header'>
                                <p>{activeTab === 'strength' ? 'Area of Strength' : 'Area of Concern'}</p>
                                <p>Achievement</p>
                            </div>

                            <div className="list">
                                {listData.length > 0 ? (
                                    listData.map((item, index) => (
                                        <div className="item" key={index}>
                                            <div className="dot"></div>
                                            <div className="item-content">
                                                <p>{item.KRA_NAME || '---'}</p>
                                                <span className={activeTab === 'strength' ? 'strength-span' : 'concern-span'}>
                                                    {item.ACHIEVEMENT ? `${item.ACHIEVEMENT}%` : '--%'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="item no-data">
                                        <p>No {activeTab === 'strength' ? 'strength' : 'concern'} data available</p>
                                    </div>
                                )}
                            </div>
                        </IonCard>
                    </div>
                </IonContent>
            </IonPage>
        </>
    );
};

export default ScoreCard;