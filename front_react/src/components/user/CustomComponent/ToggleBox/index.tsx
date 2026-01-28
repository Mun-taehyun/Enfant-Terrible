import { forwardRef } from "react";
import './style.css';


interface Props {
    label: string;
    options: (string | { label: string; value: string | number | boolean})[];
    value: string | number | boolean | null;
    onSelect: (value: string | number | boolean) => void;
    isSmall: boolean;
}
//label 토클 선택 시 대표되는 이름 
//options 남,여 / 중성화 yes no 여부 등등..... 


//컴포넌트 : 토글 선택 폼
export const ToggleSelect = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {

    const {label , options, value, onSelect , isSmall} = props;


    return(
        <div className="common-form-group" ref={ref}>
            {label && <div className="common-form-label">{label}</div>}
            <div className="common-toggle-container">
                {options.map((option: string | { label: string; value: string | number | boolean}) => {
                    //option 개수 (배열 개수 , 객체 개수 에 따른 토글이 등장한다)
                    const targetValue = typeof option === 'object' ? option.value : option;
                    const targetLabel = typeof option === 'object' ? option.label : option;
                    //각자 label , value 에 따른 타입 검증 => 그냥 써도 되는 지 아닌 지 .. 값 대입 
                    // targetValue은 해당 value에 맞게 선택 버튼식.. 
                    // targetLabel은 해당 label버튼이 보이는 식.. 

                    const isSelected = value !== null && value !== undefined && value === targetValue;
                    //선택된 value값으로 선택된 것과 값이 같으면 선택되었다는 모양이 생긴다. 
                    return (
                        <div key={String(targetValue)}
                            className={`common-toggle-item ${isSelected ? 'active' : ''} ${isSmall ? 'small' : ''}`}
                            onClick={() => onSelect(targetValue)}   
                        >
                        {targetLabel}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});