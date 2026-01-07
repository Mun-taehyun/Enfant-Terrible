import {useState,useRef,useEffect} from 'react';
import type {KeyboardEvent,ChangeEvent} from 'react';
import './style.css';
import InputBox from '@/components/user/InputBox';
import {useNavigate} from 'react-router-dom';
import type {Address} from 'react-daum-postcode';
import {useDaumPostcodePopup} from 'react-daum-postcode';
import type { EmailCertificationRequestDto, EmailCodeRequestDto, SignInRequestDto } from '@/apis/user/request/auth';
import { emailCertificationRequest } from '@/apis/user';
import type { SignUpRequestDto } from '@/apis/user/request/user';

// 컴포넌트 : 인증화면 
export default function Authentication() {

    // 상태 : 화면 (로그인 화면 or 회원가입 화면 외엔 안 받음)
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');
    
    // 함수 : 네비게이트 
    const navigate = useNavigate();


    //========================= 로그인 카드 내부 컴포넌트 =================================
    const SignInCard = () => {

    // ========================== 로그인 참조 상태 ================================
        //참조상태 : 이메일
    const emailRef = useRef<HTMLInputElement | null>(null);
        //참조상태 : 비밀번호
    const passwordRef = useRef<HTMLInputElement | null>(null);

    // ========================== 로그인 상태 =====================================
        //상태 : 이메일
        const [email, setEmail] = useState<string>('');
        //상태 : 비밀번호
        const [password, setPassword] = useState<string>('');
        //상태 : 비밀번호 타입 상태
        const [passwordType, setPasswordType] = useState<'text'| 'password'>('password');
        //상태 : 비밀번호 아이콘 상태
        const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon'); 
        //상태 : 에러 상태
        const [error, setError] = useState<boolean>(false);
    
    // ========================= 로그인 함수 =================================
        //함수 : 로그인 응답 처리
/*        const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) => {
            if(!responseBody) {
                alert('서버 연결에 문제가 생겼습니다.');
                return;
            }
            const {code} = responseBody;
            if(code === 'DBE') alert('DB 오류입니다.')
            if(code === 'VF' || code === 'SF') setError(true);
            //유효성검사 실패 , 로그인 실패 (아이디 비번을 잘못침)
            if(code !== 'SU') return;
            //성공이 아니면 로그인 x 


            const { token, expirationTime} = responseBody as SignInResponseDto;
            //as 타입단언 (any타입을 SignInResponse라고 확정)
            const now = new Date().getTime(); //현재 시간을 받아온다 (token만료시간을 사용하기 위해)
            const expires = new Date(now + expirationTime * 1000);

            setCookie('accessToken', token , {expires, path: MAIN_PATH()});
            navigate(MAIN_PATH());
        } */



    // ========================= 로그인 이벤트 핸들러 ===============================
        //이벤트핸들러 : 이메일 변경 이벤트 처리
        const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            setError(false);
            const {value} = event.target;
            setEmail(value);
        }

        //이벤트핸들러 : 비밀번호 변경 이벤트 처리
        const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            setError(false);
            const {value} = event.target;
            setPassword(value);
        }


        //이벤트핸들러 : 로그인 버튼 클릭 이벤트 처리
        const onSignInButtonClickHandler = () => {
            const requestBody: SignInRequestDto = {email , password };
            // signInRequest(requestBody).then(signInResponse);

        } 

        //이벤트핸들러 : 회원가입 링크 클릭 이벤트 처리
        const onSignUpLinkClickHandler = () => {
            setView('sign-up');
        }

        //이벤트핸들러 : 비밀번호 버튼 클릭 이벤트 처리
        const onPasswordButtonClickHandler = () => {
            if (passwordType === 'text') {
                setPasswordType('password');
                setPasswordButtonIcon('eye-light-on-icon');
                //버튼 클릭 시 비밀번호를 감추는 이벤트.. 
            }
            else {
                setPasswordType('text');
                setPasswordButtonIcon('eye-light-on-icon')
            }
        }

        //이벤트핸들러 : 이메일 인풋 키 다운 이벤트 처리
        const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== 'Enter') return; //이메일 입력 시 엔터가 아닐 때
            if (!passwordRef.current) return;//
            passwordRef.current.focus(); //비밀번호에 포커스를 준다..  
        }

        //이벤트핸들러 : 비밀번호 인풋 키 다운 이벤트 처리
        const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== 'Enter') return; //이메일 입력 시 엔터가 아닐 때
            onSignInButtonClickHandler(); //엔터 시 로그인버튼실행.. 
        }



    // ======================= 로그인 카드 렌더링 =========================
        return (// 컴포넌트 태그를 넣을 때 안에 변수 요소들이 있다면 설정을 해줘야 오류가 안난다.
                // ref를 넣게 된 것 => InputBox라는 커스텀컴포넌트에 forwardRef가 적용이 되어있음.  
            <div className='auth-card'>
                <div className='auth-card-box'>
                    <div className='auth-card-top'>
                        <div className='auth-card-title-box'>
                            <div className='auth-card-title'>{'로그인'}</div>
                        </div>
                        <InputBox ref={emailRef} label='이메일주소' type='text' placeholder='이메일 주소를 입력해주세요.' error={error} value={email} onChange={onEmailChangeHandler} onkeyDown={onEmailKeyDownHandler}/>
                        <InputBox ref={passwordRef} label='패스워드' type={passwordType} placeholder='비밀번호를 입력해주세요.' error={error} value={password} onChange={onPasswordChangeHandler} icon={passwordButtonIcon} onButtonClick={onPasswordButtonClickHandler} onkeyDown={onPasswordKeyDownHandler}/>
                    </div>
                    <div className='auth-card-bottom'>
                        {error && //에러가 true일 때 만 뜨도록.. 
                        <div className='auth-sign-in-error-box'>
                            <div className='auth-sign-in-error-message'>
                                {'이메일 주소 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해주세요.'}
                            </div>
                        </div>
                        }
                        <div className='black-large-full-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
                        <div className='auth-description-box'>
                            <div className='auth-description'>{'신규 사용자이신가요?'}<span className='auth-description-link' onClick={onSignUpLinkClickHandler}>{'회원가입'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );// 상단 (입력란) , 하단 (버튼 등..)  //span태그를 섞어서 박스 내부에서 각자다른 태그의 역할수행
    };
    // ========================= 회원가입 카드 내부 컴포넌트 ================================
    const SignUpCard = () => {

    // ======================== 회원가입 카드 참조 ===================================
        //참조 : 이메일
        const emailRef = useRef<HTMLInputElement | null>(null);
        //참조 : 비밀번호
        const passwordRef = useRef<HTMLInputElement | null>(null);
        //참조 : 비밀번호확인
        const passwordCheckRef = useRef<HTMLInputElement | null>(null);
        //참조 : 이름
        const nameRef = useRef<HTMLInputElement | null>(null);
        //참조 : 이메일 인증 번호 
        const verificationRef = useRef<HTMLInputElement | null>(null);
        //참조 : 핸드폰 번호
        const telRef = useRef<HTMLInputElement | null>(null);
        //참조 : 우편 번호 
        const zipCodeRef = useRef<HTMLInputElement | null>(null);
        //참조 : 주소
        const addressBaseRef = useRef<HTMLInputElement | null>(null);
        //참조 : 상세주소
        const addressDetailRef = useRef<HTMLInputElement | null>(null);



    // ========================= 회원가입 카드 상태 ======================================
        //상태 : 페이지 번호 
        const [page, setPage] = useState<1|2>(1);

        //상태 : 이메일 
        const [email , setEmail] = useState<string>('');
        //상태 : 비밀번호 
        const [password, setPassword] = useState<string>('');
        //상태 : 비밀번호 확인 
        const [passwordCheck, setPasswordCheck] = useState<string>('');
        //상태 : 이름 
        const [name, setName] = useState<string>('');
        //상태 : 이메일 인증 번호  
        const [verification , setVerification] = useState<string>('');
        //상태 : 핸드폰 번호
        const [tel, setTel] = useState<string>('');
        //상태 : 우편번호 
        const [zipCode,setZipCode] = useState<string>('');
        //상태 : 주소
        const [addressBase, setAddressBase] = useState<string>('');
        //상태 : 상세 주소
        const [addressDetail, setAddressDetail] = useState<string>('');



        //상태 : 비밀번호 타입
        const [passwordType,setPasswordType] = useState<'text' | 'password'>('password');
        //상태 : 비밀번호 확인 타입
        const [passwordCheckType,setPasswordCheckType] = useState<'text' | 'password'>('password');


        //상태 : 이메일 에러 상태
        const [isEmailError , setEmailError] = useState<boolean>(false);
        //상태 : 비밀번호 에러 상태
        const [isPasswordError , setPasswordError] = useState<boolean>(false);
        //상태 : 비밀번호 확인 에러 상태
        const [isPasswordCheckError , setPasswordCheckError] = useState<boolean>(false);
        //상태 : 이름 에러 상태
        const [isNameError , setNameError] = useState<boolean>(false);
        //상태 : 이메일 인증번호 에러 상태
        const [isVerificationError , setVerificationError] = useState<boolean>(false);
        //상태 : 핸드폰 번호 에러 상태
        const [isTelError , setTelError] = useState<boolean>(false);
        //상태 : 우편 번호 에러 상태
        const [isZipCodeError , setZipCodeError] = useState<boolean>(false);
        //상태 : 주소 에러 상태
        const [isAddressBaseError , setAddressBaseError] = useState<boolean>(false);

        //상태 : 이메일 에러 메세지 상태
        const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
        //상태 : 비밀번호 에러 메세지 상태
        const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
        //상태 : 비밀번호 확인 에러 메세지 상태
        const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] = useState<string>('');
        //상태 : 이름 에러 메세지 상태
        const [nameErrorMessage, setNameErrorMessage] = useState<string>('');
        //상태 : 이메일 인증번호 에러 메세지 상태 
        const [verificationErrorMessage, setVerificationErrorMessage] = useState<string>('');
        //상태 : 핸드폰 번호 에러 메세지 상태
        const [telErrorMessage, setTelErrorMessage] = useState<string>('');
        //상태 : 우편 번호 에러 메세지 상태 
        const [zipCodeErrorMessage, setZipCodeErrorMessage] = useState<string>('');
        //상태 : 주소 에러 메세지 상태
        const [addressBaseErrorMessage, setAddressBaseErrorMessage] = useState<string>('');

        //상태 : 비밀번호 아이콘 상태
        const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon'); 
        //상태 : 비밀번호 확인 아이콘 상태
        const [passwordCheckButtonIcon, setPasswordCheckButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon'); 

        
        //상태 : 이메일 인증번호 활성화 상태 <메일인증완료 상태>
        const [verificationActive, setVerificationActive] = useState<boolean>(false);

        //상태 : 이메일 인증번호 검증 상태 
        const [codeVerify, setCodeVerify] = useState<boolean>(false);


    // ======================== 회원가입 카드 함수 ===================================
        //함수 : 다음주소 검색 팝업오픈
        const open = useDaumPostcodePopup();


        //함수 : 회원가입 응답 처리
/*        const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
            if(!responseBody) {
                //응답에 값이 없을 경우.. => JSON으로 변환이 안되었다.. 
                alert('네트워크 이상입니다');
                return;
            }
            const {code} = responseBody;
            if(code === 'DE') { //이메일이 중복되었을 경우의 코드 
                setEmailError(true);
                setEmailErrorMessage('중복되는 이메일 주소입니다');
            }
            if(code === 'DN') { //닉네임이 중복되었을 경우의 코드
                setNicknameError(true);
                setNicknameErrorMessage('중복되는 닉네임입니다');
            }
            if(code === 'DT') { //휴대폰 번호가 중복되었을 경우의 코드
                setTelNumberError(true);
                setTelNumberErrorMessage('중복되는 핸드폰 번호입니다')
            }
            if(code === 'VF') alert('모든 값을 입력하세요'); 
            //유효성검사 실패..(백엔드에서 처리된 응답페이지결과)
            if(code === 'DBE') alert('DB오류입니다');

            if(code !== 'SU') return;

            setView('sign-in');
        } */
    // ========================= 회원가입 카드 이벤트핸들러 ==============================
        //이벤트핸들러 : 이메일 변경 이벤트 처리
        const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setEmail(value);
            setEmailError(false);
            setEmailErrorMessage('');
        }
        //이벤트핸들러 : 비밀번호 변경 이벤트 처리
        const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setPassword(value);
            setPasswordError(false);
            setPasswordErrorMessage('');
        }
        //이벤트핸들러 : 비밀번호 확인 변경 이벤트 처리
        const onPasswordCheckChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setPasswordCheck(value);
            setPasswordCheckError(false);
            setPasswordCheckErrorMessage('');
        }
        //이벤트핸들러 : 이름 변경 이벤트 처리
        const onNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setName(value);
            setNameError(false);
            setNameErrorMessage('');
        }
        //이벤트핸들러 : 이메일인증번호 변경 이벤트 처리
        const onVerificationChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setVerification(value);
            setVerificationError(true);
            setVerificationErrorMessage('인증번호 검증을 받아야 합니다.');
        }
        //이벤트핸들러 : 핸드폰 번호 변경 이벤트 처리
        const onTelChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setTel(value);
            setTelError(false);
            setTelErrorMessage('');
        }
        //이벤트핸들러 : 우편번호 변경 이벤트 처리
        const onZipCodeChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setZipCode(value);
            setZipCodeError(false);
            setZipCodeErrorMessage('');
        }
        //이벤트핸들러 : 주소 변경 이벤트 처리
        const onAddressBaseChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setAddressBase(value);
            setAddressBaseError(false);
            setAddressBaseErrorMessage('');
        }
        //이벤트핸들러 : 상세 주소 변경 이벤트 처리
        const onAddressDetailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setAddressDetail(value);
        }


        //이벤트핸들러: 비밀번호 버튼 클릭 이벤트 처리
        const onPasswordButtonClickHandler = () => {
            if (passwordButtonIcon === 'eye-light-off-icon') {
                setPasswordButtonIcon('eye-light-on-icon');
                setPasswordType('text');
            }
            else {
                setPasswordButtonIcon('eye-light-off-icon');
                setPasswordType('password');
            }
        }// off일 경우 text    on일경우 password 로 감추도록.. 
        //이벤트핸들러: 비밀번호 확인 버튼 클릭 이벤트 처리
        const onPasswordCheckButtonClickHandler = () => {
            if (passwordCheckButtonIcon === 'eye-light-off-icon') {
                setPasswordCheckButtonIcon('eye-light-on-icon');
                setPasswordCheckType('text');
            }
            else {
                setPasswordCheckButtonIcon('eye-light-off-icon');
                setPasswordCheckType('password');
            }
        }// off일 경우 text    on일경우 password 로 감추도록.. 

        //이벤트핸들러 : 우편번호/주소 버튼 클릭 이벤트 처리
        const onAddressButtonClickHandler = () => {
            open({onComplete});
        }//npm i react-daum-postcode 를 하게되면 =>  인베디드 형태 , 팝업 형태를 고를 수 있음 ..

        //이벤트핸들러 : 다음 단계 버튼 클릭 이벤트 처리 
        //유효성검사 Back , Front 둘다 검증해야한다.
        const onNextButtonClickHandler = () => {
            // const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
            // const isEmailPattern = emailPattern.test(email); //정규표현식 검증 => boolean값 도출.. 
            // // ^정규표현식 시작.. 
            // //[a-zA-Z0-9]* <= @ 앞부분으로 활용 => *로 0회이상 반복 빈문자열도 받음. 
            // // ([-.]?[a-zA-Z0-9])* => -. 0~1개 + [a-zA-Z0-9] => 0회이상 반복.. 
            // // \.[a-zA-Z]{2,4} => .이후에 a-zA-Z 2~4개까지 수용 
            // if(!isEmailPattern) {
            //     setEmailError(true);
            //     setEmailErrorMessage('이메일 주소 포멧이 맞지 않다.');
            // }//이메일 형식이 맞지 않는다면 Error출력.. 
            // const verificationPattern = /^[0-9]{6}$/; 
            // const isVerificationPattern = verificationPattern.test(verification);
            // //검증 상태가 맞다면 
            // if(!isVerificationPattern) {
            //     setVerificationError(true);
            //     setVerificationErrorMessage('인증번호는 숫자로 6자 이상 또는 확인을 눌러주세요')
            // }
            // const codeCheck = code === 
            // if()
            
            const isCheckedPassword = password.trim().length >= 8;
            if(!isCheckedPassword) {
                setPasswordError(true);
                setPasswordErrorMessage('비밀번호는 8자 이상 입력해라');
            }
            const isEqualPassword = password === passwordCheck;
            if(!isEqualPassword) {
                setPasswordCheckError(true);
                setPasswordCheckErrorMessage('비밀번호가 일치하지 않는다');
            }
            const isNamePattern = name.trim().length >= 2;
            if(!isNamePattern) {
                setNameError(true);
                setNameErrorMessage('실명이름으로 입력해주세요')
            }

            if(verificationActive || codeVerify || !isCheckedPassword || !isEqualPassword || !isNamePattern ) return; 
            // 이메일 메일 수신여부 , 이메일 인증코드 검증 여부 , 비번8자 ,비번확인, 이름 불일치 =>넘어갈 수 없다. 
            setPage(2);
        }//1페이지 기준 .. 

        

        //이벤트핸들러 : 회원가입 버튼 클릭 이벤트 처리 
        //중첩 검사 하는 이유는 다음 페이지에서 정보를 없애버렸을 경우를 대비.. 
        const onSignUpButtonClickHandler = () => {
            // const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
            // const isEmailPattern = emailPattern.test(email); //정규표현식 검증 => boolean값 도출.. 
            // // ^정규표현식 시작.. 
            // //[a-zA-Z0-9]* <= @ 앞부분으로 활용 => *로 0회이상 반복 빈문자열도 받음. 
            // // ([-.]?[a-zA-Z0-9])* => -. 0~1개 + [a-zA-Z0-9] => 0회이상 반복.. 
            // // \.[a-zA-Z]{2,4} => .이후에 a-zA-Z 2~4개까지 수용 
            // if(!isEmailPattern) {
            //     setEmailError(true);
            //     setEmailErrorMessage('이메일 주소 포멧이 맞지 않다.');
            // }//이메일 형식이 맞지 않는다면 Error출력.. 

            // const verificationPattern = /^[0-9]{6}$/; 
            // const isVerificationPattern = verificationPattern.test(verification);
            // const isVerificationActive = verificationActive === true;
            // if(!isVerificationPattern) {
            //     setVerificationError(true);
            //     setVerificationErrorMessage('인증번호는 6자 이상 입력하세요')
            // }
            // else if(){
            //     setVerificationError(true);
            // }
            const isCheckedPassword = password.trim().length >= 8;
            if(!isCheckedPassword) {
                setPasswordError(true);
                setPasswordErrorMessage('비밀번호는 8자 이상 입력해라');
            }
            const isEqualPassword = password === passwordCheck;
            if(!isEqualPassword) {
                setPasswordCheckError(true);
                setPasswordCheckErrorMessage('비밀번호가 일치하지 않는다');
            }
            const isNamePattern = name.trim().length >= 2;
            if(!isNamePattern) {
                setNameError(true);
                setNameErrorMessage('실명이름으로 입력해주세요')
            }
            if(verificationActive || codeVerify  || !isCheckedPassword || !isEqualPassword || !isNamePattern ) {
                // 이메일 메일 수신여부 , 이메일 인증코드 검증 여부 , 비번8자 ,비번확인 불일치 =>넘어갈 수 없다. 
                setPage(1);
                return;
            } // 상태처리가 날라갔을 경우 (리렌더링 시 이탈했다거나 등등의 경우를 대비해서 설계)

            const telPattern = /^[0-9]{11,13}$/; // 0~9까지 숫자가 11~13개가 존재하는 지 .. 
            const isTelPattern = telPattern.test(tel); //정규표현식 검증.. 
            if (!isTelPattern) {
                setTelError(true);
                setTelErrorMessage('숫자만 입력해라');
            }
            const hasZipCode = zipCode.trim().length !== 0;
            if (!hasZipCode) {
                setZipCodeError(true);
                setZipCodeErrorMessage('우편번호를 선택해주세요')
            }
            const hasAddress = addressBase.trim().length !== 0;
            if (!hasAddress) {
                setAddressBaseError(true);
                setAddressBaseErrorMessage('주소를 선택해주세요');
            }

            if( !isTelPattern || !hasAddress || !hasZipCode) return; 
            // 폰 ,우편번호, 주소가 입력되지 않았다면  회원가입이 될 수 없도록 return.. 

            // 회원가입 완료 전 서버에 송신 .... 
            const requestBody: SignUpRequestDto = {
                email, password, name, tel, zipCode , addressBase , addressDetail
            };

            // signUpRequest(requestBody).then(signUpResponse); 

            setVerificationActive(false) //다음 회원가입 때 문제가 생김
            setCodeVerify(false); //검증상태 다시 초기화 (다음 회원가입때 문제가 생김)
        }

        //이벤트핸들러 : 로그인 링크 클릭 이벤트 처리 
        const onSignInLinkClickHandler = () => {
            setView('sign-in');
        }


        //이벤트핸들러 : 이메일 키 다운 이벤트 처리
        const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            onMailButtonClickEventHandler(); //엔터 시 인증 번호 활성화 
            if(!verificationActive) return;
            if(!passwordRef.current) return;
            passwordRef.current.focus(); // Enter 비밀번호 창 로딩이 되었을 경우 => 비밀번호란 입력줄 생성
        }

        //이벤트핸들러 : 이메일 인증번호 키 다운 이벤트 처리
        const onVerificationKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(!verificationActive) return;
            if(event.key !== 'Enter') return;
            onMailVerityEventHandler()
            if(!codeVerify) return;
            if(!passwordRef.current) return;
            passwordRef.current.focus(); // Enter 비밀번호 창 로딩이 되었을 경우 => 비밀번호란 입력줄 생성
        }

        //이벤트핸들러 : 비밀번호 키 다운 이벤트 처리
        const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            if(!passwordCheckRef.current) return;
            passwordCheckRef.current.focus(); // Enter 비밀번호 창 로딩이 되었을 경우 => 비밀번호란 입력줄 생성
        }
        //이벤트핸들러 : 비밀번호 확인 키 다운 이벤트 처리
        const onPasswordCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            if(!nameRef.current) return;
            nameRef.current.focus(); 
        }
        //이벤트핸들러 : 이름 키 다운 이벤트 처리
        const onNameKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            // if(!telRef.current) return;
            // telRef.current.focus();
            onNextButtonClickHandler(); // 엔터치면 다음페이지로 넘어가도록..
        }

        //이벤트핸들러 :  핸드폰 번호 키 다운 이벤트 처리
        const onTelKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            if(!addressBaseRef.current) return;
            addressBaseRef.current.focus();
        }
            // => 우편번호는 어차피 주소 키에서 같이 바꾸면 된다. 
        //이벤트핸들러 :  주소 키 다운 이벤트 처리
        const onAddressKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            if(!addressDetailRef.current) return;
            addressDetailRef.current.focus();
        }
        //이벤트핸들러 :  상세 주소 키 다운 이벤트 처리
        const onAddressDetailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            onSignUpButtonClickHandler(); //회원가입버튼클릭...
        }



        //이벤트핸들러 : 다음주소 검색 완료 이벤트 처리 => 우편번호 , 주소 한번에 입력
        const onComplete = (data: Address) => {
            const {zonecode,address} = data;
            setZipCode(zonecode);
            setAddressBase(address);
            setZipCodeError(false);
            setAddressBaseError(false);
            setZipCodeErrorMessage('');
            setAddressBaseErrorMessage('');
            if (!addressDetailRef.current) return;
            addressDetailRef.current.focus();
        }
        //이벤트핸들러 : 이메일 인증번호 요청 이벤트 처리 
        const onMailButtonClickEventHandler = () => {
            if (!email) return;
            const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
            const isEmailPattern = emailPattern.test(email); //정규표현식 검증 => boolean값 도출.. 
            // ^정규표현식 시작.. 
            //[a-zA-Z0-9]* <= @ 앞부분으로 활용 => *로 0회이상 반복 빈문자열도 받음. 
            // ([-.]?[a-zA-Z0-9])* => -. 0~1개 + [a-zA-Z0-9] => 0회이상 반복.. 
            // \.[a-zA-Z]{2,4} => .이후에 a-zA-Z 2~4개까지 수용 
            if(!isEmailPattern) {
                setEmailError(true);
                setEmailErrorMessage('이메일 주소 포멧이 맞지 않다.');
                return;
            }//이메일 형식이 맞지 않는다면 Error출력.. 

            const requestBody: EmailCertificationRequestDto = {email};
            // emailCertificationRequest(requestBody).then(emailCertificationResponse);

            //쿼리 => 인증번호 요청에 대한 건 이후 


            setVerificationActive(true);
        }
        //이벤트핸들러 : 이메일 인증번호 검증 시 이벤트 처리
        const onMailVerityEventHandler = () => {
            if(!verificationActive || !email) return; 
            //활성화값 false , email 값이 없다면 return;
            const code = verification;
            const requestBody: EmailCodeRequestDto = {email , code};
            //인증 값 useMutation에 기입.. 


            setCodeVerify(true); //검증 완료 상태 
        }

    // ======================== 회원가입 이펙트 =========================================
    // 이펙트 : 페이지가 변경될 때마다 실행
        useEffect(() => {
            if(page === 2) { //넘어가도 되는 지 아닌지(전화번호 입력칸 로딩여부..)
                if(!telRef.current) return;
                telRef.current.focus();
            }
        }, [page])

    // ========================= 회원가입 카드 렌더링 ====================================
        return (
            <div className='auth-card'>
                <div className='auth-card-box'>
                    <div className='auth-card-top'>
                        <div className='auth-card-title-box'>
                            <div className='auth-card-title'>{'회원가입'}</div>
                            <div className='auth-card-page'>{`${page}/2`}</div>
                        </div>
                        {page === 1 && ( // 이메일, 이메일 인증번호 , 비번 , 비번확인 , 이름(실명)
                        <>
                        <div className='auth-email-box'>
                            <InputBox ref={emailRef} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' value={email} onChange={onEmailChangeHandler} error={isEmailError} message={emailErrorMessage} onkeyDown={onEmailKeyDownHandler}/>
                            <button className='email-mail-button-click' onClick={onMailButtonClickEventHandler}/>
                        </div>
                        {verificationActive && //이메일 인증번호는 true일때만 노출 
                        <div className='auth-email-box'>
                            <InputBox ref={verificationRef} label='이메일 인증번호*' type='text' placeholder='이메일 인증번호를 입력해주세요.' value={verification} onChange={onVerificationChangeHandler} error={isVerificationError} message={verificationErrorMessage} onkeyDown={onVerificationKeyDownHandler}/>                          
                            <button className='email-mail-button-click' onClick={onMailVerityEventHandler}/>
                        </div>
                        }                       
                        <InputBox ref={passwordRef} label='비밀번호*' type={passwordType} placeholder='비밀번호를 입력해주세요.' value={password} onChange={onPasswordChangeHandler} error={isPasswordError} message={passwordErrorMessage} icon={passwordButtonIcon} onButtonClick={onPasswordButtonClickHandler} onkeyDown={onPasswordKeyDownHandler}/>
                        <InputBox ref={passwordCheckRef} label='비밀번호 확인*' type={passwordCheckType} placeholder='비밀번호를 다시 입력해주세요.' value={passwordCheck} onChange={onPasswordCheckChangeHandler} error={isPasswordCheckError} message={passwordCheckErrorMessage} icon={passwordCheckButtonIcon} onButtonClick={onPasswordCheckButtonClickHandler} onkeyDown={onPasswordCheckKeyDownHandler}/>
                        <InputBox ref={nameRef} label='이름*' type='text' placeholder='실명을 입력해주세요.' value={name} onChange={onNameChangeHandler} error={isNameError} message={nameErrorMessage} onkeyDown={onNameKeyDownHandler}/>
                        </>
                        )}
                        {page === 2 && ( //핸드폰번호 , 주소 , 상세주소  
                        <>

                        <InputBox ref={telRef} label='핸드폰 번호*' type='text' placeholder='핸드폰 번호를 입력해주세요.' value={tel} onChange={onTelChangeHandler} error={isTelError} message={telErrorMessage} onkeyDown={onTelKeyDownHandler} />
                        <InputBox ref={zipCodeRef} label='우편 번호*' type='text' placeholder='우편 번호를 입력해주세요.' value={zipCode} onChange={onZipCodeChangeHandler} error={isZipCodeError} message={zipCodeErrorMessage}/>
                        <InputBox ref={addressBaseRef} label='주소*' type='text' placeholder='우편번호 찾기' value={addressBase} onChange={onAddressBaseChangeHandler} error={isAddressBaseError} message={addressBaseErrorMessage} icon='expend-right-light-icon' onButtonClick={onAddressButtonClickHandler} onkeyDown={onAddressKeyDownHandler}/>
                        <InputBox ref={addressDetailRef} label='상세 주소*' type='text' placeholder='상세 주소를 입력해주세요.' value={addressDetail} onChange={onAddressDetailChangeHandler} error={false} onkeyDown={onAddressDetailKeyDownHandler}/>
                        </>
                        )}
                    </div>
                    <div className='auth-card-bottom'>
                        {page === 1 &&( //버튼 1개
                        <div className='black-large-full-button' onClick={onNextButtonClickHandler}>{'다음 단계'}</div>
                        )}
                        {page === 2 &&( //글씨 + 클릭이벤트  , 클릭이벤트 구조 
                        <>
                        <div className='black-large-full-button' onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
                        </>
                        )}
                        <div className='auth-description-box'>
                            <div className='auth-description'>{'이미 계정이 있으신가요? '}<span className='auth-description-link' onClick={onSignInLinkClickHandler}>{'로그인'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

// ===================================== 회원가입 내부 컴포넌트 끝 =========================================

    //렌더링 : 인증화면
    return (
        <div id='auth-wrapper'>
            <div className='auth-container'>
                <div className='auth-jumbotron-box'>
                    <div className='auth-jumbotron-content'>
                        <div className='auth-logo-icon'></div>
                        <div className='auth-jumbotron-text-box'>
                            <div className='auth-jumbotron-text'>{'앙팡테리블 마켓'}</div>
                            <div className='auth-jumbotron-text'>{'에 오신 것을 환영합니다.'}</div>
                        </div>
                    </div>
                </div>
                {view === 'sign-in' && <SignInCard />}
                {view === 'sign-up' && <SignUpCard />}
            </div>
        </div>
    )
}
// 배경(왼쪽 페이지 설명란 , (로그인창,회원가입창) ) 