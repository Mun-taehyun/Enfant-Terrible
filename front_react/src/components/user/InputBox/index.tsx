import type {ChangeEvent, KeyboardEvent } from 'react';
import {forwardRef} from 'react';
import './style.css';

// 인터페이스 속성
interface Props {
    label: string;
    type: 'text' | 'password'; //유니온타입 => text or password 둘중 하나. 
    placeholder: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    //setValue: Dispatch<SetStateAction<string>>;
    //Dispatch<T> = T 상태변환 (함수의 기능을 하는 타입)
    //SetStateAction<T> = 값 , 함수의 변수 그 자체를 타입으로 지정.. 
    error: boolean;

    icon?: 'eye-light-off-icon' | 'eye-light-on-icon' | 'expend-right-light-icon'; // optional (선택적 속성) 있어도되고 없어도 되는 변수
    onButtonClick?: () => void; //함수 타입.. (인자) 없고 반환 x

    message?: string;

    onkeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    //KeyboardEvent<T> = 키보드입력(키다운,업,프레스) 감지용 이벤트타입
} 
// label = 아이디인지 비밀번호인지 등등...... 
// type = 아이디 입력란 , 비밀번호 입력란 구분용.. 
// error = 비밀번호 입력시 문제가 생겼다면 css 다른 이펙트 연출용 변수
// placeholder = 인풋박스에 있는 안내문? 같이 미리 떠있는 문구
// value = 인풋박스에 들어있는 입력값을 인식하는 용도



// 컴포넌트
const InputBox = forwardRef<HTMLInputElement, Props> ((props: Props, ref) => {
    //ref를 쓰는 이유 => 값을 받고 내부적으로 변화하는 값이 있어야 하는데 상태를 변화시키는것이 아님.. 

    //속성: "렌더링에 필요한 변수들을 받아오기"
    const {label, type, placeholder, value , error, icon , message } = props;
    const {onChange, onButtonClick, onkeyDown } = props;

    //이벤트 핸들러: input 키 이벤트 처리 함수
    const onKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if(!onkeyDown) return;
        onkeyDown(event);
    }


    //렌더링 
    return (
        <div className='inputbox'>
            <div className='inputbox-label'>{label}</div>
            <div className={error ? 'inputbox-container-error' : 'inputbox-container'}>
                <input ref={ref} type={type} className='input' placeholder={placeholder} value={value} onChange = {onChange} onKeyDown={onKeyDownHandler}/>
                {onButtonClick !== undefined && ( //버튼이 존재한다면 해당 태그 출력  
                    <div className='icon-button' onClick={onButtonClick}>
                        {icon !== undefined &&  //icon이 존재한다면 해당 태그 출력
                                                (<div className={`icon ${icon}`}></div>)}
                    </div>
                )}
            </div>
            {message !== undefined && <div className='inputbox-message'>{message}</div> }
            
        </div>
    )
});


export default InputBox;
// 회원가입 창에서 비밀번호 비밀번호기입란 비밀번호 메시지칸 ..... 


//설계방식 뼈대(피그마 기반의 틀 작성 후 => 상태처리 , 이벤트 처리, 조건문 처리로 나아간다.)