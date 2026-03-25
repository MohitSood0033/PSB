import React, { useState } from 'react';
import { IonIcon, IonInput, IonText, IonDatetime } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import './FloatingInput.css';

interface FloatingInputProps {
  label: string;
  name: string;
  icon: any;
  isPassword?: boolean;
  endIcon?: any;
  isError: boolean;
  isEndIcon?: boolean;
  showCalendar?: boolean;
  onCalendarClick?: () => void;
  onInputFocus?: (value: string) => void;
  onKeyUp?: React.KeyboardEventHandler<HTMLIonInputElement>;
  maxlength?: number;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  name,
  icon,
  isPassword = false,
  endIcon,
  isError = false,
  isEndIcon = false,
  showCalendar = false,
  onCalendarClick,
  onInputFocus,
  onKeyUp,
  maxlength,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (e: CustomEvent) => {
    const newValue = (e.target as HTMLInputElement).value;

    if (onInputFocus) {
      onInputFocus(newValue);
    }
  };

  const handleKeyUp = (e: any) => {
    if (onKeyUp) { 
      onKeyUp(e);
    }
  };

  const inputType = isPassword && !isEndIcon ? (showPassword ? 'text' : 'password') : 'text';
  const readOnly = isEndIcon ? true : false;

  return (
    <div className={`input-group ${isError ? 'error' : ''}`}>
      <IonInput
        mode="md"
        label={label}
        name={name}
        labelPlacement="floating"
        fill="outline"       
        placeholder={`Enter ${label}`}
        className="psb-input"
        readonly={readOnly}
        onIonFocus={handleFocus}
        type={inputType} 
        onKeyUp={handleKeyUp as any}
        maxlength={maxlength}
      >
        <IonIcon slot="start" icon={icon as any} aria-hidden="true"></IonIcon>
        {isPassword && (
          <IonIcon
            slot="end"
            icon={showPassword ? eyeOff : eye}
            aria-hidden="true"
            onClick={togglePasswordVisibility}
            style={{ cursor: 'pointer' }}
          />
        )}

        {isEndIcon && (
          <IonIcon
            className="end-icon"
            slot="end"
            icon={endIcon}
            aria-hidden="true"
            style={{ cursor: 'pointer' }}
            onClick={onCalendarClick}
          />
        )}
        {showCalendar && <IonDatetime></IonDatetime>}
      </IonInput>

      {isError && <IonText className="input-error">{`${label} is required.`}</IonText>}
    </div>
  );
};

export default FloatingInput;
