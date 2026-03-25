import React, { useState, useEffect } from 'react';
import {
    IonInput,
    IonIcon,
    IonDatetime,
    IonModal,
    IonRow,
    IonCol,
} from '@ionic/react';
import { calendar } from 'ionicons/icons';
import { format, parseISO, differenceInDays } from 'date-fns';
import './FloatingInput.css';

interface DateRangeInputProps {
    fromLabel: string;
    toLabel: string;
    isNum?:boolean;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({ fromLabel, toLabel, isNum }) => {
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
        from: '',
        to: '',
    });
    const [showNum, setShowNum] = useState(isNum);
    const [showModal, setShowModal] = useState(false);
    const [selectedInput, setSelectedInput] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [defaultDate, setDefaultDate] = useState<string>(new Date().toISOString()); 
    const [daysDifference, setDaysDifference] = useState<number | null>(null);

    const handleInputChange = (inputType: string) => {
        setSelectedInput(inputType);
        setSelectedDate(inputType === 'from' ? dateRange.from : dateRange.to);
        setShowModal(true);
    };

    const handleDateSelection = (e: CustomEvent) => {
        const selectedDate = e.detail.value || defaultDate;
        setShowModal(false);

        if (selectedInput === 'from') {
            setDateRange({ ...dateRange, from: selectedDate });
        } 
        else {
            setDateRange({ ...dateRange, to: selectedDate });
        }
    };

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            const daysDiff = differenceInDays(parseISO(dateRange.to), parseISO(dateRange.from));
            setDaysDifference(daysDiff);
        }
    }, [dateRange]);
  
    const currentYear = new Date().getFullYear();
    const minDate = new Date(currentYear, 0, 1).toISOString();
    const maxDate = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString(); 
  
    const leaveFromDate =  dateRange.from ? format(parseISO(dateRange.from), 'dd/MM/yyyy') : '';
    const leaveToDate =  dateRange.to ? format(parseISO(dateRange.to), 'dd/MM/yyyy') : '';

    const colNum = showNum ? "4" : "6";

    return (
        <>
        <IonRow className="psb-date-range">
            <IonCol size="12" sizeLg={colNum} sizeMd={colNum} sizeSm="12" sizeXl={colNum} sizeXs="12">
                <IonInput
                    mode='md'
                    label={fromLabel}
                    labelPlacement="floating"
                    fill="outline"
                    placeholder={'Enter ' + fromLabel}
                    className="psb-input"
                    readonly={true}
                    value={leaveFromDate}
                    onClick={() => handleInputChange('from')}
                >
                    <IonIcon
                        mode='md'
                        className="end-icon"
                        slot="end"
                        icon={calendar}
                        aria-hidden="true"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleInputChange('from')}
                    />
                </IonInput>
            </IonCol>
            <IonCol size="12" sizeLg={colNum} sizeMd={colNum} sizeSm="12" sizeXl={colNum} sizeXs="12">
                <IonInput
                    mode='md'
                    label={toLabel}
                    labelPlacement="floating"
                    fill="outline"
                    placeholder={'Enter ' + toLabel}
                    className="psb-input"
                    readonly={true}
                    value={leaveToDate}
                    onClick={() => handleInputChange('to')}
                >
                    <IonIcon
                    className="end-icon"
                    slot="end"
                    icon={calendar}
                    aria-hidden="true"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleInputChange('to')}
                    />
                </IonInput>
            </IonCol>
            {showNum &&
                <IonCol size="12" sizeLg="4" sizeMd="4" sizeSm="12" sizeXl="4" sizeXs="12">
                    <IonInput
                        mode='md'
                        label='No. of Days'
                        labelPlacement="stacked"
                        fill="outline"
                        placeholder='No. of Days'
                        className="psb-input"
                        readonly={true}
                        value={daysDifference}
                    >
                    </IonInput>
                </IonCol>
            }
        </IonRow>

        <IonModal className="date-range-modal" isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
            <IonDatetime 
                color="rose"
                value={selectedDate || defaultDate}
                onIonChange={handleDateSelection}
                presentation="date"
                min={minDate}
                max={maxDate}
            />
        </IonModal>
        </>
    );
};

export default DateRangeInput;
