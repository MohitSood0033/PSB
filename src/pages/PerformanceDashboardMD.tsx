import {
    IonPage,
    IonContent,
    IonToolbar,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardContent,
} from '@ionic/react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import '../css/PerformanceDashboardMD.css';
import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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

const distributionData = [
    { range: '71-80', count: 1, percentage: 3 },
    { range: '61-70', count: 1, percentage: 3 },
    { range: '51-60', count: 7, percentage: 24 },
    { range: '41-50', count: 11, percentage: 38 },
    { range: '31-40', count: 7, percentage: 24 },
    { range: '21-30', count: 2, percentage: 7 },
];

const PerformanceDashboardMD: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'zone' | 'summary'>('zone');
    const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
    const [topZones, setTopZones] = useState<any[]>([]);
    const [bottomZones, setBottomZones] = useState<any[]>([]);
    const listData = useMemo(() => (activeTab === 'top' ? topZones : bottomZones), [activeTab, topZones, bottomZones]);

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
                {selectedTab === 'zone' ?
                    <IonContent fullscreen>
                        <div className="psb-page-width performance-dashboard-md-page">
                            <IonCard className="distribution-chart-card">
                                <IonCardContent>
                                    <div className="distribution-chart-header">
                                        <h3>Zonal Head Performance Scores</h3>
                                        <p>(No. of Officers by Achievement %)</p>
                                    </div>
                                    <div className="distribution-chart-wrapper">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={distributionData}
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
                                                    tick={{ fill: '#3A3A3A', fontSize: 12 }}
                                                    width={60}
                                                    label={{
                                                        value: 'No. of Officers',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            fill: '#3A3A3A',
                                                            opacity: "50%",
                                                            fontSize: 12,
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
                                                        const percentage = distributionData[index]?.percentage || 0;
                                                        const labelText = `${value} (${percentage}%)`;
                                                        const bgWidth = background?.width || 0;

                                                        return (
                                                            <text
                                                                x={x + bgWidth + 8}
                                                                y={y + height / 2}
                                                                fill="#3A3A3A"
                                                                fontWeight={'600'}
                                                                fontSize={12}
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
                                    </div>
                                </IonCardContent>
                            </IonCard>
                            <div className="zone-rankings-main">
                                <div className="zone-ranking-tabs">
                                    <button
                                        className={activeTab === 'top' ? 'active' : ''}
                                        onClick={() => setActiveTab('top')}
                                    >
                                        Top Zones
                                    </button>
                                    <button
                                        className={activeTab === 'bottom' ? 'active' : ''}
                                        onClick={() => setActiveTab('bottom')}
                                    >
                                        Bottom Zones
                                    </button>
                                </div>
                                <div className="zone-table-wrapper">
                                    <div className="zone-table-header-custom">
                                        <div className="zone-col-rank">Rank</div>
                                        <div className="zone-col-name">Zone Name</div>
                                        <div className="zone-col-score">Score</div>
                                    </div>

                                    <div className="zone-cards-list">
                                        {(listData?.length ? listData : [
                                            { zone_name: 'PATIALA ZO', score: 49.4, parent_zone: "HOSHIARPUR ZO" },
                                            { zone_name: 'MUMBAI ZO', score: 42.2, parent_zone: "ROPAR ZO" },
                                            { zone_name: 'KOLKATA ZO', score: 41.3, parent_zone: "HOSHIARPUR ZO" },
                                            { zone_name: 'VIJAYAWADA ZO', score: 40.7, parent_zone: "ROPAR ZO" },
                                            { zone_name: 'CHENNAI ZO', score: 38.4, parent_zone: "HOSHIARPUR ZO" },
                                        ]).map((item, index) => (
                                            <div className={`zone-rank-card ${activeTab === 'top' ? 'top-active-card' : ''}`}
                                                key={index}>
                                                <div className="zone-col-rank zone-rank-badge-wrap">
                                                    <div
                                                        className={`zone-rank-badge ${activeTab === 'top' ? 'top-badge' : ''
                                                            }`}
                                                    >
                                                        <span>{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="zone-col-name">
                                                    <div className="zone-name-text">
                                                        {item?.zone_name || item?.ZONE_NAME || '--'}
                                                    </div>

                                                    <div className="zone-sub-text">
                                                        {item?.parent_zone || item?.PARENT_ZONE || 'HOSHIARPUR ZO'}
                                                    </div>
                                                </div>
                                                <div className="zone-col-score zone-score-text">
                                                    {item?.score ?? item?.SCORE ?? '--'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </IonContent>
                    :
                    <IonContent fullscreen>
                        <div className="psb-page-width performance-dashboard-md-page">
                            <IonCard className="distribution-chart-card">
                                <IonCardContent>
                                    <div className="distribution-chart-header">
                                        <h3>Branch Head Performance Scores</h3>
                                        <p>(No. of Officers by Achievement %)</p>
                                    </div>
                                    <div className="distribution-chart-wrapper">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={distributionData}
                                                layout="vertical"
                                                margin={{ top: 16, right: 72, left: 52, bottom: 28 }}
                                                barCategoryGap={8}
                                                barGap={4}
                                            >
                                                <defs>
                                                    <linearGradient id="horizontalBarGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#0D9D53" />
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
                                                    tick={{ fill: '#3A3A3A', fontSize: 12 }}
                                                    width={60}
                                                    label={{
                                                        value: 'No. of Officers',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            fill: '#3A3A3A',
                                                            opacity: "50%",
                                                            fontSize: 12,
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
                                                        const percentage = distributionData[index]?.percentage || 0;
                                                        const labelText = `${value} (${percentage}%)`;
                                                        const bgWidth = background?.width || 0;

                                                        return (
                                                            <text
                                                                x={x + bgWidth + 8}
                                                                y={y + height / 2}
                                                                fill="#3A3A3A"
                                                                fontWeight={'600'}
                                                                fontSize={12}
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
                                    </div>
                                </IonCardContent>
                            </IonCard>
                            <div className="zone-rankings-main">
                                <div className="zone-ranking-tabs">
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
                                <div className="zone-table-wrapper">
                                    <div className="zone-table-header-custom">
                                        <div className="zone-col-rank">Rank</div>
                                        <div className="zone-col-name">Branch Name</div>
                                        <div className="zone-col-score">Score</div>
                                    </div>

                                    <div className="zone-cards-list">
                                        {(listData?.length ? listData : [
                                            { zone_name: 'PATIALA ZO', score: 49.4, parent_zone: "HOSHIARPUR ZO" },
                                            { zone_name: 'MUMBAI ZO', score: 42.2, parent_zone: "ROPAR ZO" },
                                            { zone_name: 'KOLKATA ZO', score: 41.3, parent_zone: "HOSHIARPUR ZO" },
                                            { zone_name: 'VIJAYAWADA ZO', score: 40.7, parent_zone: "ROPAR ZO" },
                                            { zone_name: 'CHENNAI ZO', score: 38.4, parent_zone: "HOSHIARPUR ZO" },
                                        ]).map((item, index) => (
                                            <div className={`zone-rank-card ${activeTab === 'top' ? 'top-active-card' : ''}`}
                                                key={index}>
                                                <div className="zone-col-rank zone-rank-badge-wrap">
                                                    <div
                                                        className={`zone-rank-badge ${activeTab === 'top' ? 'top-badge' : ''
                                                            }`}
                                                    >
                                                        <span>{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="zone-col-name">
                                                    <div className="zone-name-text">
                                                        {item?.zone_name || item?.ZONE_NAME || '--'}
                                                    </div>

                                                    <div className="zone-sub-text">
                                                        {item?.parent_zone || item?.PARENT_ZONE || 'HOSHIARPUR ZO'}
                                                    </div>
                                                </div>
                                                <div className="zone-col-score zone-score-text">
                                                    {item?.score ?? item?.SCORE ?? '--'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </IonContent>
                }
            </IonPage>
        </>
    );
};

export default PerformanceDashboardMD;