import { forwardRef } from "react";
import './style.css';

interface Props {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    unit: string;
}
//label 태그의 이름 
//value 숫자값 표기 
//onChange 숫자값 바뀜 표기 
//min 최솟값 max 최댓값 unit 단위 


export const SideStepper = forwardRef<HTMLDivElement, Props>((props, ref) => {

    //속성 : 숫자값 선택
    const { label, value, onChange, min , max, unit} = props;

    //이벤트핸들러 : value가 최솟값이 될 때까지 감소 
    const handleDecrement = () => {if (value > min) onChange(value - 1); return;};

    //이벤트핸들러 : value가 최댓값이 될 때까지 증가 
    const handleIncrement = () => {if (value < max) onChange(value + 1); return; };

    //렌더링 : 숫자 선택란 
    return (
        <div className="common-form-group" ref={ref}>
            <div className="common-form-label">{label}</div>
            <div className="common-stepper-container">
                <div className={`stepper-button ${value <= min ? 'disabled' : ''}`} onClick={handleDecrement}> &lt; </div>
                <div className="stepper-value-display">
                    <span className="stepper-number">{value}</span>
                    <span className="stepper-unit">{unit}</span>
                </div>
                <div className={`stepper-button ${value >= max ? 'disabled' : ''}`} onClick={handleIncrement}>&gt;</div>
            </div>
        </div>
    );
});