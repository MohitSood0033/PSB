import {
    IonPage,
    IonContent,
    IonToolbar,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardContent,
    IonCol,
    IonGrid,
    IonRow,
    IonSelect,
    IonSelectOption,
} from '@ionic/react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import '../css/PerformanceDashboardMD.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">Score Range: {label}</p>
                <p className="tooltip-value">
                    Officers: <span className="score-value">{payload[0].value}</span>
                </p>
                <p className="tooltip-detail">
                    Percentage: {payload[0].payload.percentage}%
                </p>
            </div>
        );
    }
    return null;
};

const PerformanceDashboardMD: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
    const [selectedTab, setSelectedTab] = useState<'zone' | 'summary'>('zone');
    const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
    const [zoneGraphData, setZoneGraphData] = useState<any[]>([]);
    const [top, setTop] = useState<any[]>([]);
    const [bottom, setBottom] = useState<any[]>([]);
    const listData = useMemo(() => (activeTab === 'top' ? top : bottom), [activeTab, top, bottom]);
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzQyNDM3NDQsImlzcyI6InBzYi1hcGkiLCJleHAiOjE3NzY0MDM3NDQsInN1YiI6InBzYiBhcGkgQXV0aGVudGljYXRpb24iLCJ1c2VyX2lkIjoiUzI5MjIyIn0.jUkvtJ60UjUABeASnnthxaVvPWhRWSL1sMYUHjtR9CQ";
    const isMounted = useRef(true);

    const filteredMonths = useMemo(() => {
        const today = new Date();
        const prevMonth = today.getMonth();

        if (Number(selectedYear) === today.getFullYear()) {
            return months.filter(m => Number(m.value) <= prevMonth);
        }

        return months;
    }, [selectedYear]);

    const transformChartData = (apiData: any[], filterType?: string) => {
        // Safe check for apiData
        if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return [];

        let filteredData = apiData;
        if (filterType) {
            filteredData = apiData.filter(item => item && item.FILTER === filterType);
        }

        const rangeMap = new Map();

        filteredData.forEach(item => {
            if (!item || !item.NAME) return;
            const range = item.NAME;
            const count = parseInt(item.Y) || 0;

            if (rangeMap.has(range)) {
                rangeMap.set(range, rangeMap.get(range) + count);
            } else {
                rangeMap.set(range, count);
            }
        });

        const ranges = Array.from(rangeMap.keys());
        const totalCount = Array.from(rangeMap.values()).reduce((sum, count) => sum + count, 0);

        ranges.sort((a, b) => {
            const aMin = parseInt(a.split('-')[0]);
            const bMin = parseInt(b.split('-')[0]);
            return aMin - bMin;
        });

        return ranges.map(range => ({
            range: range,
            count: rangeMap.get(range),
            percentage: totalCount > 0 ? Math.round((rangeMap.get(range) / totalCount) * 100) : 0
        }));
    };

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const postData = {
                emp_id: 'S41414',
                month: selectedMonth,
                year: selectedYear,
                sol_id: "9922",
            };

            const response = await axios.post(
                "api/pdmd-zone",
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

                // Safely get ZONE_GRAPH array
                const zoneGraph = data?.ZONE_GRAPH || [];

                if (selectedTab === 'zone') {
                    // For Zone: filter by 'RO'
                    const transformedData = transformChartData(zoneGraph, 'RH');
                    setZoneGraphData(transformedData);
                    setTop(data?.BEST_ZONE || []);
                    setBottom(data?.BOTTOM_ZONE || []);
                } else {
                    // For Branch Summary: filter by 'BH'
                    const transformedData = transformChartData(zoneGraph, 'BH');
                    setZoneGraphData(transformedData);
                    setTop(data?.BEST_BRANCH || []);
                    setBottom(data?.BOTTOM_BRANCH || []);
                }
            }
        } catch (error: any) {
            console.error("Performance Dashboard Error:", error);
            setZoneGraphData([]);
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
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
    }, [selectedMonth, selectedYear, selectedTab]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderDashboardSection = ({
        chartTitle,
        topButtonText,
        bottomButtonText,
        nameHeader,
    }: {
        chartTitle: string;
        topButtonText: string;
        bottomButtonText: string;
        nameHeader: string;
    }) => (
        <IonContent fullscreen>
            <div className="psb-page-width performance-dashboard-md-page">
                <IonCard className="distribution-chart-card">
                    <IonCardContent>
                        <IonGrid className='distribution-date-selector-grid'>
                            <IonRow className="distribution-align-center-row">
                                <IonCol>
                                    <IonRow className="distribution-filter-row">
                                        <IonCol size='6'>
                                            <IonSelect
                                                className="distribution-custom-dropdown"
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
                                                className="distribution-custom-dropdown"
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
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        <div className="distribution-chart-header">
                            <h3>{chartTitle}</h3>
                            <p>(No. of Officers by Achievement %)</p>
                        </div>

                        <div className="distribution-chart-wrapper">
                            {loading ? (
                                <div className="chart-loading">Loading chart data...</div>
                            ) : zoneGraphData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={zoneGraphData}
                                        layout="vertical"
                                        margin={{ top: 16, right: 72, left: 52, bottom: 28 }}
                                        barCategoryGap={8}
                                        barGap={4}
                                    >
                                        <defs>
                                            <linearGradient id="horizontalBarGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#2ee687" />
                                                <stop offset="100%" stopColor="#007C3D" />
                                            </linearGradient>
                                        </defs>

                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#3A3A3A', fontSize: 12 }}
                                            label={{
                                                value: 'Achievements',
                                                position: 'bottom',
                                                offset: 10,
                                                style: {
                                                    fill: '#3A3A3A',
                                                    opacity: "50%",
                                                    fontSize: 12,
                                                }
                                            }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="range"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={(props: any) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <text
                                                        x={x - 5}
                                                        y={y}
                                                        dy={4}
                                                        textAnchor="end"
                                                        fill="#3A3A3A"
                                                        fontSize={windowWidth < 400 ? 10 : 12}
                                                    >
                                                        {payload.value}
                                                    </text>
                                                );
                                            }}
                                            width={windowWidth < 400 ? 65 : 70}
                                            interval={0}
                                            tickMargin={5}
                                            label={{
                                                value: 'No. of Officers',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: {
                                                    fill: '#3A3A3A',
                                                    opacity: "50%",
                                                    fontSize: windowWidth < 400 ? 10 : 12,
                                                    textAnchor: 'middle'
                                                },
                                                offset: -18
                                            }}
                                        />

                                        <Tooltip content={<CustomTooltip />} />

                                        <Bar
                                            dataKey="count"
                                            fill="url(#horizontalBarGradient)"
                                            radius={[0, 6, 6, 0]}
                                            maxBarSize={40}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                            background={(props: any) => {
                                                const { x, y, width, height } = props;
                                                return (
                                                    <rect
                                                        x={x}
                                                        y={y}
                                                        width={width}
                                                        height={height}
                                                        fill="#EDEBEB"
                                                        rx={6}
                                                        ry={6}
                                                    />
                                                );
                                            }}
                                            animationBegin={200}
                                            label={(props: any) => {
                                                const { x, y, background, value, index, height } = props;
                                                const percentage = zoneGraphData[index]?.percentage || 0;
                                                const labelText = `${value} (${percentage}%)`;
                                                const bgWidth = background?.width || 0;

                                                const getFontSize = () => {
                                                    if (windowWidth < 360) return 8;
                                                    if (windowWidth < 480) return 9;
                                                    if (windowWidth < 768) return 10;
                                                    return 11;
                                                };

                                                return (
                                                    <text
                                                        x={x + bgWidth + 8}
                                                        y={y + height / 2}
                                                        fill="#3A3A3A"
                                                        fontWeight={'600'}
                                                        fontSize={getFontSize()}
                                                        textAnchor="start"
                                                        dominantBaseline="middle"
                                                    >
                                                        {labelText}
                                                    </text>
                                                );
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="no-data-message">
                                    <p>No performance data available for the selected period</p>
                                </div>
                            )}
                        </div>
                    </IonCardContent>
                </IonCard>

                <div className="zone-rankings-main">
                    <div className="zone-ranking-tabs">
                        <button
                            className={activeTab === 'top' ? 'active' : ''}
                            onClick={() => setActiveTab('top')}
                        >
                            {topButtonText}
                        </button>

                        <button
                            className={activeTab === 'bottom' ? 'active' : ''}
                            onClick={() => setActiveTab('bottom')}
                        >
                            {bottomButtonText}
                        </button>
                    </div>

                    <div className="zone-table-wrapper">
                        <div className="zone-table-header-custom">
                            <div className="zone-col-rank">Rank</div>
                            <div className="zone-col-name">{nameHeader}</div>
                            <div className="zone-col-score">Score</div>
                        </div>

                        <div className="zone-cards-list">
                            {listData && listData.length > 0 ? (
                                listData.map((item, index) => (
                                    <div
                                        className={`zone-rank-card ${activeTab === 'top' ? 'top-active-card' : ''}`}
                                        key={index}
                                    >
                                        <div className="zone-col-rank zone-rank-badge-wrap">
                                            <div
                                                className={`zone-rank-badge ${activeTab === 'top' ? 'top-badge' : ''}`}
                                            >
                                                <span>{item?.RNK || index + 1}</span>
                                            </div>
                                        </div>

                                        <div className="zone-col-name">
                                            <div className="zone-name-text">
                                                {item?.BRNAME || '--'}
                                            </div>
                                            {nameHeader !== 'Zone Name' && item?.REGNM && (
                                                <div className="zone-sub-text">
                                                    {item?.REGNM || '--'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="zone-col-score zone-score-text">
                                            {item?.SCORE || '--'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-message">
                                    <p>No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </IonContent>
    );

    return (
        <>
            <Menu currentMenu='performance-md' />
            <IonPage className="psb-pages platform-specific-page" id="main-content">
                <Header />
                <IonToolbar>
                    <IonSegment
                        value={selectedTab}
                        onIonChange={(e) => setSelectedTab(e.detail.value as 'zone' | 'summary')}
                    >
                        <IonSegmentButton value="zone">
                            <IonLabel>Zone</IonLabel>
                        </IonSegmentButton>

                        <IonSegmentButton value="summary">
                            <IonLabel>Branch Summary</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
                {selectedTab === 'zone'
                    ? renderDashboardSection({
                        chartTitle: 'Zonal Head Performance Scores',
                        topButtonText: 'Top Zones',
                        bottomButtonText: 'Bottom Zones',
                        nameHeader: 'Zone Name',
                    })
                    : renderDashboardSection({
                        chartTitle: 'Branch Head Performance Scores',
                        topButtonText: 'Top Branches',
                        bottomButtonText: 'Bottom Branches',
                        nameHeader: 'Branch Name',
                    })}
            </IonPage>
        </>
    );
};

export default PerformanceDashboardMD;