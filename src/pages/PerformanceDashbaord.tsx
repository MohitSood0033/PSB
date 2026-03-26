import {
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonSelect,
    IonSelectOption,
    IonRow,
    IonCol,
    IonGrid,
    IonModal
} from '@ionic/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import greenBg from '../assets/svg/bg.svg';
import axios from 'axios';
import '../css/PerformanceDashbaord.css';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value">
                    Score: <span className="score-value">{payload[0]?.value?.toFixed?.(1) || '--'}</span>
                </p>
                {payload[0]?.payload?.rawScore !== undefined && (
                    <p className="tooltip-detail">
                        Raw Score: {payload[0].payload.rawScore}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

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

const PerformanceDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
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

    const [topBranches, setTopBranches] = useState<any[]>([]);
    const [bottomBranches, setBottomBranches] = useState<any[]>([]);
    const listData = useMemo(() => (activeTab === 'top' ? topBranches : bottomBranches), [activeTab, topBranches, bottomBranches]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [insightDetails, setInsightDetails] = useState<any[]>([]);
    const [kraScoreData, setKraScoreData] = useState<any>(null);
    const score = kraScoreData?.SCORE ? parseFloat(kraScoreData.SCORE) : 0;
    const maxScore = kraScoreData?.MAX_SCORE ? parseFloat(kraScoreData.MAX_SCORE) : 0;
    const percentage = maxScore > 0 ? Math.max(0, Math.min((score / maxScore) * 100, 100)) : 0;
    const [kraData, setKraData] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzQyNDM3NDQsImlzcyI6InBzYi1hcGkiLCJleHAiOjE3NzY0MDM3NDQsInN1YiI6InBzYiBhcGkgQXV0aGVudGljYXRpb24iLCJ1c2VyX2lkIjoiUzI5MjIyIn0.jUkvtJ60UjUABeASnnthxaVvPWhRWSL1sMYUHjtR9CQ";
    const isMounted = useRef(true);

    const getMonthNameFromNumber = (monthNumber: string) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const index = parseInt(monthNumber) - 1;
        return monthNames[index] || monthNumber;
    };

    const transformGraphData = (data: any[]) => {
        if (!data || data.length === 0) return [];

        return data
            .sort((a, b) => {
                const dateA = new Date(a.YEAR, a.MONTH - 1);
                const dateB = new Date(b.YEAR, b.MONTH - 1);
                return dateA.getTime() - dateB.getTime();
            })
            .map(item => ({
                month: `${getMonthNameFromNumber(item.MONTH)} ${item.YEAR.slice(-2)}`,
                score: parseFloat(item.SCORE) || 0,
                fullMonth: item.MONTH,
                year: item.YEAR,
                rawScore: item.SCORE
            }));
    };

    const filteredMonths = useMemo(() => {
        const today = new Date();
        const prevMonth = today.getMonth();

        if (Number(selectedYear) === today.getFullYear()) {
            return months.filter(m => Number(m.value) <= prevMonth);
        }

        return months;
    }, [selectedYear]);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const postData = {
                user_type: 'RH',
                month: selectedMonth,
                year: selectedYear,
                sol_id: "8031",
            };

            const response = await axios.post(
                "api/dashboard-performance-overview",
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

            if (response.status === 200 && isMounted.current) {
                const data = response.data.data;
                console.log('data', data);

                const graphData = data?.GRAPH_DETAILS || [];

                const transformedData = transformGraphData(graphData);
                setChartData(transformedData);

                const insightData = data?.INSIGHT_DETAILS || [];
                setInsightDetails(insightData);

                const kraScoreDetails = data?.KRA_SCORE_DETAILS || {};
                setKraScoreData(kraScoreDetails);

                const kraDetails = data?.MY_KRAS_DATA || [];
                setKraData(kraDetails);

                setTopBranches(data?.TOP_OFFICES || []);
                setBottomBranches(data?.BOTTOM_OFFICES || []);
            }
        } catch (error: any) {
            console.error("Performance Dashboard Error:", error);
        } finally {
            if (isMounted.current) {
                setLoading(false)
            };
        }
    };

    useEffect(() => {
        isMounted.current = true;

        const today = new Date();
        const currentMonth = today.getMonth() + 1;

        if (
            Number(selectedYear) === today.getFullYear() &&
            Number(selectedMonth) > currentMonth
        ) {
            setSelectedMonth(currentMonth.toString());
            return;
        }

        fetchPerformanceData();
        return () => {
            isMounted.current = false;
        };
    }, [selectedMonth, selectedYear]);

    return (
        <>
            <Menu currentMenu='performance-overview' />
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header />
                <IonContent fullscreen className={loading ? 'loading' : ''}>
                    <div className="psb-page-width performance-dashboard-page">
                        <img src={greenBg} className="bg-icon" alt="bg icon" />

                        <IonCard className="kra-score-card">
                            <IonCardContent className="kra-score-card-content">

                                <div className="date-selector">
                                    <IonGrid className='date-selector-grid'>
                                        <div className='kra-header'>
                                            <h1>KRA Score</h1>
                                        </div>
                                        <IonRow className="align-center-row">
                                            <IonCol size="8">
                                                <IonRow className="ion-justify-content-between">
                                                    <IonCol size='6'>
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
                                                    <IonCol size='6'>
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

                                                <IonRow className="dropdown-row">
                                                    <div className="kra-stats">
                                                        <div className="kra-stat-item">
                                                            <h2>You are in {kraScoreData?.COHORT_STAND || '--'} of your Cohort</h2>
                                                            <p>Cohort : {kraScoreData?.COHORT_DESCRIPTION || '--'}</p>
                                                            <p>Rank in Cohort: {kraScoreData?.RANKS || '--'}</p>
                                                        </div>
                                                    </div>
                                                </IonRow>
                                            </IonCol>
                                            <IonCol size="4" className="circle-col">
                                                <div className="kra-score-circle">
                                                    <div
                                                        className="progress-circle-large"
                                                        style={{ '--value': percentage } as React.CSSProperties}
                                                    >
                                                        <div className="inner-circle-large">
                                                            <span className="score-number">
                                                                {maxScore > 0 ? `${score.toFixed(1)}/${maxScore}` : '--'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>

                                    <div className="kra-scores-section">
                                        <IonGrid className="kra-scores-grid">
                                            <IonRow className="ion-justify-content-start">
                                                {kraData.map((item, index) => {
                                                    return (
                                                        <IonCol
                                                            key={index}
                                                            size="6"
                                                            size-lg="4"
                                                            className={`kra-score-col ${index < kraData.length - (kraData.length % 2 === 0 ? 2 : 1)
                                                                ? 'has-bottom-border' : ''}`}>
                                                            <IonCard className="kra-score-item-card">
                                                                <IonCardContent className='kra-score-item-card-content'>
                                                                    <div className="kra-score-header">
                                                                        <h3>{item.CATEGORY}</h3>
                                                                        <span className="score-value">{item.SCORE}/<span className="score-max-value">{item.MAX_SCORE}</span></span>
                                                                    </div>

                                                                    {(item.ACTUAL !== undefined && item.ACTUAL !== null) ||
                                                                        (item.TARGET !== undefined && item.TARGET !== null) ? (
                                                                        <div className="kra-details">
                                                                            {item.ACTUAL !== undefined && item.ACTUAL !== null && (
                                                                                <div className="detail-item">
                                                                                    <span className="label">Actual : </span>
                                                                                    <span className="value">
                                                                                        {typeof item.ACTUAL === 'number'
                                                                                            ? item.ACTUAL.toLocaleString()
                                                                                            : item.ACTUAL}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {item.TARGET !== undefined && item.TARGET !== null && (
                                                                                <div className="detail-item">
                                                                                    <span className="label">Target : </span>
                                                                                    <span className="value">
                                                                                        {typeof item.TARGET === 'number'
                                                                                            ? item.TARGET.toLocaleString()
                                                                                            : item.TARGET}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : null}
                                                                </IonCardContent>
                                                            </IonCard>
                                                        </IonCol>
                                                    );
                                                })}
                                                {kraData.length === 0 && <p>No KRA data available</p>}
                                            </IonRow>
                                        </IonGrid>
                                    </div>
                                </div>
                            </IonCardContent>
                        </IonCard>
                        <IonCard className="insights-card">
                            <IonCardContent className='insights-card-content'>
                                <h3>Insights</h3>
                                <div className="insights-content">
                                    <ul className="insights-list">
                                        {(insightDetails || []).slice(0, 2).map((item, index) => (
                                            <li key={index}>{item.INSIGHT_TEXT}</li>
                                        ))}
                                    </ul>
                                    {(insightDetails?.length || 0) > 2 && (
                                        <span
                                            className="see-more-btn"
                                            onClick={() => setShowModal(true)}
                                        >
                                            See More
                                        </span>
                                    )}
                                    {insightDetails?.length === 0 && <p>No insights available</p>}
                                </div>
                            </IonCardContent>
                        </IonCard>
                        <IonModal
                            isOpen={showModal}
                            onDidDismiss={() => setShowModal(false)}
                            breakpoints={[0, 0.5, 0.9]}
                            initialBreakpoint={0.5}
                            handleBehavior="cycle"
                            className="custom-sheet-modal"
                        >
                            <div className="bottom-sheet">
                                <div className="sheet-handle" />
                                <h3 className="sheet-title">Insights</h3>
                                <div className="sheet-content">
                                    <ul className="insights-list">
                                        {(insightDetails || []).map((item, index) => (
                                            <li key={index}>{item.INSIGHT_TEXT}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </IonModal>
                        <IonCard className="performance-chart-card">
                            <IonCardContent className='performance-card-content'>
                                <div className="chart-header">
                                    <h3>Zonal Performance History</h3>
                                </div>
                                {loading ? (
                                    <div className="chart-skeleton">
                                        <div className="skeleton-bar" />
                                        <div className="skeleton-bar" />
                                        <div className="skeleton-bar" />
                                        <div className="skeleton-bar" />
                                        <div className="skeleton-bar" />
                                    </div>
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            barCategoryGap={20}
                                            barGap={4}
                                        >
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#4ADE80" />
                                                    <stop offset="100%" stopColor="#22C55E" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#E5E7EB"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: '#6B7280',
                                                    fontSize: 10,
                                                    angle: -30,
                                                    textAnchor: 'end'
                                                }}
                                                dy={10}
                                                dx={-8}
                                                height={60}
                                                interval={0}
                                            />
                                            <YAxis
                                                domain={['auto', 'auto']}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 10 }}
                                                dx={-5}
                                                label={{
                                                    value: 'KRA Score',
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    style: {
                                                        fill: '#374151',
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        textAnchor: 'middle'
                                                    }
                                                }}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                                cursor={{ fill: 'rgba(34, 197, 94, 0.08)' }}
                                            />
                                            <Bar
                                                dataKey="score"
                                                fill="url(#barGradient)"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={50}
                                                background={{ fill: '#EDEBEB' }}
                                                animationDuration={1000}
                                                animationEasing="ease-out"
                                                animationBegin={200}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="no-data-message">
                                        <p>No performance data available for the selected period</p>
                                    </div>
                                )}
                            </IonCardContent>
                        </IonCard>
                    </div>
                    <div className="branch-rankings-main">
                        <IonCard className='branch-rankings'>
                            <div className="ranking-tabs">
                                <button
                                    className={activeTab === 'top' ? 'active' : ''}
                                    onClick={() => setActiveTab('top')}
                                >
                                    Top Branches
                                </button>
                                <button
                                    className={activeTab === 'bottom' ? 'active' : ''}
                                    onClick={() => setActiveTab('bottom')}
                                >
                                    Bottom Branches
                                </button>
                            </div>
                            <div className="table-wrapper">
                                <IonGrid>
                                    <IonRow className="table-header">
                                        <IonCol>Rank</IonCol>
                                        <IonCol>Branch Name</IonCol>
                                        <IonCol>Cohort</IonCol>
                                        <IonCol>Score</IonCol>
                                    </IonRow>
                                    {listData.length > 0 ? (
                                        listData.map((item, index) => (
                                            <IonRow className="table-row" key={index}>
                                                <IonCol>{item.RNK}</IonCol>
                                                <IonCol>{item.BRNAME}</IonCol>
                                                <IonCol>{item.COHORT_NAME}</IonCol>
                                                <IonCol>{item.SCORE}</IonCol>
                                            </IonRow>
                                        ))
                                    ) : (
                                        <IonRow>
                                            <IonCol size="12" className="no-data">
                                                <p>No {activeTab === 'top' ? 'top' : 'bottom'} data available</p>
                                            </IonCol>
                                        </IonRow>
                                    )}
                                </IonGrid>
                            </div>
                        </IonCard>
                    </div>
                </IonContent>
            </IonPage>
        </>
    );
};

export default PerformanceDashboard;
