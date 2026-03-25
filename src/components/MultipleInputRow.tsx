import { IonCol, IonInput, IonItem, IonRow, IonText } from '@ionic/react';
import React, { useState } from 'react';
import MultiInputRowCss from '../css/MultipleInputRow.css';

interface InputProps {
    numInputs: number;
    placeholders?: string[];
    names?: string[];
    labels?: string[];
    maxlengths?: number[];
    values?: string[];
    classnames?: string[];
    ids?: string[];
    readonlys?: boolean[];
    disables?: boolean[];
    isError?: boolean[];
    requireds?: boolean[];
    maxs?: number[];
    // onChanges?: (event: any) => void[];
    onChanges?: (newValue: string) => void[];
    types?: any[];
    steps?: number[];
}

const MultiInputRow: React.FC<InputProps> = ({ numInputs, placeholders, names, labels, maxlengths, values, classnames, ids,
    readonlys, disables, isError, requireds, types, steps, maxs, onChanges, ...props}) => {
    // const [inputValues, setInputValues] = useState<string[]>(
    // Array(numInputs).fill('')

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChanges(event.target.value);
      };
    const [size, setSize] = useState<string>();

    // According to total number of input
    useState(() => {
        switch (numInputs) {
            case 1: 
                setSize('12');
                break;
            case 2: 
                setSize('6');
                break;
            case 3: 
                setSize('4');
                break;
            case 4: 
                setSize('3');
                break;
            case 6:
                setSize('2');
                break;
            default:
                setSize('12');
        }
    })

    return (
        <IonRow>
            {Array.from({ length: numInputs }, (_, index) => (
                <IonCol key={index} size="12" sizeLg={size} sizeMd={size} sizeSm="12" sizeXl={size} sizeXs="12">
                    <div className={`input-group ${isError ? 'error' : ''}`}>
                        {types?.[index] ? (
                                <IonInput
                                    type={types && types[index].toString()}
                                    label={labels && labels[index]}
                                    name= {names && names[index]}
                                    labelPlacement="floating" 
                                    fill="outline"
                                    placeholder={placeholders && placeholders[index]} 
                                    maxlength={maxlengths && maxlengths[index]} 
                                    className={classnames && classnames[index]}
                                    id={ids && ids[index]}
                                    value={values && values[index]}
                                    readonly = {readonlys && readonlys[index]}
                                    disabled = {disables && disables[index]}
                                    required = {requireds && requireds[index]}
                                    max = {maxs && maxs[index]}
                                    // pattern= "[^?']+"
                                    >
                                    </IonInput>
                        ) : values?.[index] ? (
                                <IonInput
                                    type={types && types[index].toString()}
                                    label={labels && labels[index]}
                                    name= {names && names[index]}
                                    labelPlacement="floating" 
                                    fill="outline"
                                    placeholder={placeholders && placeholders[index]} 
                                    maxlength={maxlengths && maxlengths[index]} 
                                    className={classnames && classnames[index]}
                                    id={ids && ids[index]}
                                    value={values && values[index]}
                                    readonly = {readonlys && readonlys[index]}
                                    disabled = {disables && disables[index]}
                                    required = {requireds && requireds[index]}
                                    max = {maxs && maxs[index]}
                                    // pattern= "[^?']+"
                                    onChange={onChanges && onChanges[index]}
                                    {...props}></IonInput>
                            ) : (
                                <IonInput
                                label={labels && labels[index]}
                                name= {names && names[index]}
                                labelPlacement="floating" 
                                fill="outline"
                                placeholder={placeholders && placeholders[index]} 
                                maxlength={maxlengths && maxlengths[index]} 
                                className={classnames && classnames[index]}
                                readonly = {readonlys && readonlys[index]}
                                disabled = {disables && disables[index]}
                                required = {requireds && requireds[index]}
                                onChange={onChanges && onChanges[index]}
                                max = {maxs && maxs[index]}
                                // pattern= "[^\?']+"
                                {...props}>
                            </IonInput>
                            )
                        } 

                        {/* 
                        {values?.[index] ? (
                                <IonInput
                                    type={types && types[index].toString()}
                                    label={labels && labels[index]}
                                    name= {names && names[index]}
                                    labelPlacement="floating" 
                                    fill="outline"
                                    placeholder={placeholders && placeholders[index]} 
                                    maxlength={maxlengths && maxlengths[index]} 
                                    className={classnames && classnames[index]}
                                    id={ids && ids[index]}
                                    value={values && values[index]}
                                    readonly = {readonlys && readonlys[index]}
                                    disabled = {disables && disables[index]}
                                    required = {requireds && requireds[index]}
                                    onChange={onChanges && onChanges[index]}
                                    {...props}>
                                </IonInput>
                            ) : (
                                <IonInput
                                label={labels && labels[index]}
                                name= {names && names[index]}
                                labelPlacement="floating" 
                                fill="outline"
                                placeholder={placeholders && placeholders[index]} 
                                maxlength={maxlengths && maxlengths[index]} 
                                className={classnames && classnames[index]}
                                readonly = {readonlys && readonlys[index]}
                                disabled = {disables && disables[index]}
                                required = {requireds && requireds[index]}
                                onChange={onChanges && onChanges[index]}
                                {...props}>
                                {/* // onChange={() => { onChanges?.(); }}> 
                            </IonInput>
                            )
                        } */}


                        
                        {/* <IonInput 
                            label={labels && labels[index]}
                            name= {names && names[index]}
                            labelPlacement="floating" 
                            fill="outline"
                            placeholder={placeholders && placeholders[index]} 
                            maxlength={maxlengths && maxlengths[index]} 
                            className={classnames && classnames[index]}
                            // value={values && values[index]}
                            readonly = {readonlys && readonlys[index]}
                            disabled = {disables && disables[index]}
                            required = {requireds && requireds[index]}
                            {values?.[index] ? (
                                { value = values?.[index] }
                              ) : ('')}
                        ></IonInput> */}
                    </div>
                    {isError && <IonText className="input-error">{`${labels[index]} is required.`}</IonText>}
                </IonCol>
            ))}
        </IonRow>
    );
};

export default MultiInputRow;