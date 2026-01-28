import './style.css';
import { forwardRef } from "react";

interface Props {
    label: string;
    species: string;
    value: string;
    onSelect: (breed: string) => void;
    breedData: Record<string, string[]>;
}

export const SelectBox = forwardRef<HTMLDivElement, Props>((props : Props, ref) => {

    //속성: 종에 따른 품종선택
    const { label, species, value, onSelect, breedData } = props;

    //빈배열로 받거나 , 품종데이터를 받아온다. 
    const breeds = breedData[species] || [];

    return (
        <div className="common-form-group" ref={ref}>
            <div className="common-form-label">{label}</div>   
            <div className="chip-wrapper">
                {!species ? 
                (<div className="chip-placeholder"> 먼저 아이의 종류를 선택해 주세요. </div>) : // not 종 / 종 
                (breeds.map((breed) => (<button type="button" className={`chip-item ${value === breed ? 'active' : ''}`} 
                                                onClick={() => onSelect(breed)}> {breed} </button>))
                //breeds 리스트나 직접 입력 후 기입 
                )}
            </div>
        </div>
    );
});