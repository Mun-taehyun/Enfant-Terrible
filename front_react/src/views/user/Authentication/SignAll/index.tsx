import {useState,useRef,useEffect} from 'react';
import type {KeyboardEvent,ChangeEvent} from 'react';
import './style.css';
import InputBox from '@/components/user/InputBox';
import {useNavigate} from 'react-router-dom';
import type {Address} from 'react-daum-postcode';
import {useDaumPostcodePopup} from 'react-daum-postcode';
import type { EmailCertificationRequestDto, EmailCodeRequestDto, ResetPasswordChangeRequestDto, SignInRequestDto } from '@/apis/user/request/auth';
import type { SignUpRequestDto } from '@/apis/user/request/user';
import { authQueries, userQueries } from '@/querys/user/queryhooks';
import { AUTH_PATH, MAIN_PATH } from '@/constant/user';
import type { SignInResponseDto } from '@/apis/user/response/auth';

// 컴포넌트 : 인증화면 
export default function Authentication() {

    // 상태 : 화면 (로그인 화면 or 회원가입 화면 외엔 안 받음)
    const [view, setView] = useState<'sign-in' | 'sign-up' |'password-search'>('sign-in');
    
    // 함수 : 네비게이트 
    const navigate = useNavigate();


    //========================= 로그인 카드 내부 컴포넌트 =================================
    const SignInCard = () => {

    // ========================== 로그인 서버 상태 ================================
        //서버상태 : 로그인 요청 / 응답 (mutateasync) 를 쓰게 되면 상태만 선언해도된다.
        const signInStatus = authQueries.useSignin();

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
        const onSignInButtonClickHandler = async () => {
            //async를 써야만 await를 쓸 수 있으므로 ..
            const requestBody: SignInRequestDto = {email , password };

            const responseBody = await signInStatus.mutateAsync(requestBody)
            if(!signInStatus) return alert('로그인 요청에 실패하셨습니다.');
            
            //요청 성공 시 ... => 토큰 발급 후 localStorage에 저장... (key , value)
            const {accessToken} = responseBody as SignInResponseDto
            localStorage.setItem('accessToken' , accessToken); //로컬스토리지 저장...
            navigate(MAIN_PATH()); //로그인 성공 시 이동...
        } 

        //이벤트핸들러 : 회원가입 링크 클릭 이벤트 처리
        const onSignUpLinkClickHandler = () => {
            setView('sign-up');
        }

        //이벤트핸들러 : 비밀번호 찾기 링크 클릭 이벤트 처리
        const onPasswordSearchLinkClickHandler = () => {
            setView('password-search');
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
                            <div className='auth-description'>{'비밀번호를 잊으셨나요?'}<span className='auth-description-link' onClick={onPasswordSearchLinkClickHandler}>{'회원가입'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );// 상단 (입력란) , 하단 (버튼 등..)  //span태그를 섞어서 박스 내부에서 각자다른 태그의 역할수행
    };
    // ========================= 회원가입 카드 내부 컴포넌트 ================================
    const SignUpCard = () => {

    // ======================== 회원가입 카드 서버 상태 =======================

        //서버상태 : 이메일 인증번호 요청 
        const {mutate : emailCertification} = authQueries.useEmailCertification();
        const emailCertificationStatus = authQueries.useEmailCertification();

        //서버상태 : 인증번호 검증 요청 
        const {mutate : emailCode} = authQueries.useEmailCodeVerify();
        const emailCodeStatus = authQueries.useEmailCodeVerify();

        //서버상태 : 회원가입 
        const {mutate : signUp } = userQueries.useSignUp(); //요청함수 사용
        const signUpStatus = userQueries.useSignUp(); //요청상태


    // ======================== 회원가입 카드 참조 ===================================
        //참조 : 이메일
        const emailRef = useRef<HTMLInputElement | null>(null);
        //참조 : 이메일 인증 번호 
        const verificationRef = useRef<HTMLInputElement | null>(null);
        //참조 : 비밀번호
        const passwordRef = useRef<HTMLInputElement | null>(null);
        //참조 : 비밀번호확인
        const passwordCheckRef = useRef<HTMLInputElement | null>(null);
        //참조 : 이름
        const nameRef = useRef<HTMLInputElement | null>(null);
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
        //상태 : 이메일 인증 번호  
        const [verification , setVerification] = useState<string>('');
        //상태 : 비밀번호 
        const [password, setPassword] = useState<string>('');
        //상태 : 비밀번호 확인 
        const [passwordCheck, setPasswordCheck] = useState<string>('');
        //상태 : 이름 
        const [name, setName] = useState<string>('');
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
        //상태 : 이메일 인증번호 에러 상태
        const [isVerificationError , setVerificationError] = useState<boolean>(false);
        //상태 : 비밀번호 에러 상태
        const [isPasswordError , setPasswordError] = useState<boolean>(false);
        //상태 : 비밀번호 확인 에러 상태
        const [isPasswordCheckError , setPasswordCheckError] = useState<boolean>(false);
        //상태 : 이름 에러 상태
        const [isNameError , setNameError] = useState<boolean>(false);

        //상태 : 핸드폰 번호 에러 상태
        const [isTelError , setTelError] = useState<boolean>(false);
        //상태 : 우편 번호 에러 상태
        const [isZipCodeError , setZipCodeError] = useState<boolean>(false);
        //상태 : 주소 에러 상태
        const [isAddressBaseError , setAddressBaseError] = useState<boolean>(false);

        //상태 : 이메일 에러 메세지 상태
        const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
        //상태 : 이메일 인증번호 에러 메세지 상태 
        const [verificationErrorMessage, setVerificationErrorMessage] = useState<string>('');
        //상태 : 비밀번호 에러 메세지 상태
        const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
        //상태 : 비밀번호 확인 에러 메세지 상태
        const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] = useState<string>('');
        //상태 : 이름 에러 메세지 상태
        const [nameErrorMessage, setNameErrorMessage] = useState<string>('');
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


    // ========================= 회원가입 카드 이벤트핸들러 ==============================
        //이벤트핸들러 : 이메일 변경 이벤트 처리
        const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setEmail(value);
            setEmailError(false);
            setEmailErrorMessage('');
        }
        //이벤트핸들러 : 이메일인증번호 변경 이벤트 처리
        const onVerificationChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setVerification(value);
            setVerificationError(true);
            setVerificationErrorMessage('인증번호 검증을 받아야 합니다.');
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

            signUp(requestBody) // 요청을 보낸다 . 
            if (!signUpStatus.data) return alert('회원가입에 실패하셨습니다.');
            if (!signUpStatus.isSuccess) return alert('회원가입 요청에 실패하셨습니다.');
            setView('sign-in');  //로그인 화면으로 이동 
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
            const emailPattern = /^[a-zA-Z0-9]{1,20}@([-.]?[a-zA-Z0-9]){1,8}\.[a-zA-Z]{2,4}$/;
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
            emailCertification(requestBody);
            if(!emailCertificationStatus.isSuccess) return alert('메일 전송이 실패하셨습니다.'); 
            setVerificationActive(true); //메일 전송이 되었으므로 인증번호 창이 오픈됨 
        }
        //이벤트핸들러 : 이메일 인증번호 검증 시 이벤트 처리
        const onMailVerityEventHandler = () => {
            if(!verificationActive || !email) return; 
            //활성화값 false , email 값이 없다면 return;
            const code = verification;
            const requestBody: EmailCodeRequestDto = {email , code};
            //인증 값 useMutation에 기입.. 
            emailCode(requestBody);
            if(!emailCodeStatus.isSuccess) return alert('인증번호 요청에 실패하셨습니다.')
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
    // ========================= 비밀번호 찾기 내부 컴포넌트 ================================
    const PasswordSearchCard = () => {
 
        //서버상태 : 이메일 인증번호 요청 
        const {mutate : passwordCertification} = authQueries.useResetPasswordEmail();
        const passwordCertificationStatus = authQueries.useResetPasswordEmail();

        //서버상태 : 인증번호 검증 요청 
        const {mutate : passwordCode} = authQueries.useResetPasswordCode();
        const passwordCodeStatus = authQueries.useResetPasswordCode();

        //서버상태 : 비밀번호 변경 요청 
        const {mutate : rePassword } = authQueries.useResetPasswordChange(); //요청함수 사용
        const rePasswordStatus = authQueries.useResetPasswordChange(); //요청상태

        //참조 : 이메일
        const emailPasswordRef = useRef<HTMLInputElement | null>(null);
        //참조 : 이메일 인증 번호 
        const verificationPasswordRef = useRef<HTMLInputElement | null>(null);
        //참조 : 새로운 비밀번호
        const newPasswordRef = useRef<HTMLInputElement | null>(null);

        //상태 : 페이지 번호 
        const [pageSearch, setPageSearch] = useState<1|2>(1);

        //상태 : 이메일
        const [email , setEmail] = useState<string>('');
        //상태 : 이메일 인증 번호  
        const [verification , setVerification] = useState<string>('');

        //상태 : 이메일 에러 상태
        const [isEmailError , setEmailError] = useState<boolean>(false);
        //상태 : 이메일 인증번호 에러 상태
        const [isVerificationError , setVerificationError] = useState<boolean>(false);

        //상태 : 이메일 에러 메세지 상태
        const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
        //상태 : 이메일 인증번호 에러 메세지 상태 
        const [verificationErrorMessage, setVerificationErrorMessage] = useState<string>('');

        //상태 : 이메일 인증번호 활성화 상태 <메일인증완료 상태>
        const [verificationActive, setVerificationActive] = useState<boolean>(false);

        //상태 : 이메일 인증번호 검증 상태 
        const [codeVerify, setCodeVerify] = useState<boolean>(false);

        //상태 : 새로운 비밀번호 
        const [newPassword, setNewPassword] = useState<string>('');
        //상태 : 비밀번호 에러 상태
        const [isNewPasswordError , setNewPasswordError] = useState<boolean>(false);
        //상태 : 비밀번호 에러 메세지 상태
        const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState<string>('');
        //상태 : 비밀번호 아이콘 상태
        const [newPasswordButtonIcon, setNewPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon'); 
        //상태 : 비밀번호 타입
        const [newPasswordType,setNewPasswordType] = useState<'text' | 'password'>('password');

        //이벤트핸들러 : 이메일 변경 이벤트 처리
        const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setEmail(value);
            setEmailError(false);
            setEmailErrorMessage('');
        }

        //이벤트핸들러 : 이메일인증번호 변경 이벤트 처리
        const onVerificationChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setVerification(value);
            setVerificationError(true);
            setVerificationErrorMessage('6자리 입력 후 인증을 받아야 합니다.');
        }


        //이벤트핸들러 : 이메일 키 다운 이벤트 처리
        const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            if(pageSearch === 2) { // 두번째 페이지 일 경우엔 새로운 비밀번호를 활성화 해야한다. 
                if(!newPasswordRef.current) return;
            }
            onPasswordButtonClickEventHandler(); //엔터 시 인증 번호 활성화 
            if(!verificationActive) return;
            if(!verificationPasswordRef.current) return;
            verificationPasswordRef.current.focus(); // Enter 비밀번호 창 로딩이 되었을 경우 => 비밀번호란 입력줄 생성
        }

        //이벤트핸들러 : 이메일 인증번호 키 다운 이벤트 처리
        const onVerificationKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(!verificationActive) return;
            if(event.key !== 'Enter') return;
            onPasswordVerityEventHandler(); //엔터 시 인증번호 활성화
            if(!codeVerify) return;
            onPasswordVerifyButtonClickHandler() //코드 검증까지 되었다면 비밀번호 변경 페이지로 이동..
        }


        //이벤트핸들러 : 비밀번호 변경 이벤트 처리
        const onNewPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const {value} = event.target;
            setNewPassword(value);
            setNewPasswordError(false);
            setNewPasswordErrorMessage('');
        }

        //이벤트핸들러 : 새로운 비밀번호 키 다운 이벤트 처리 ==> 기존 비밀번호의 소유자인지 알아야한다. 
        const onNewPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if(event.key !== 'Enter') return;
            if(!newPasswordRef.current) return;
            newPasswordRef.current.focus(); // Enter 비밀번호 창 로딩이 되었을 경우 => 비밀번호란 입력줄 생성
        }

        //이벤트핸들러: 비밀번호 버튼 클릭 이벤트 처리
        const onNewPasswordButtonClickHandler = () => {
            if (newPasswordButtonIcon === 'eye-light-off-icon') {
                setNewPasswordButtonIcon('eye-light-on-icon');
                setNewPasswordType('text');
            }
            else {
                setNewPasswordButtonIcon('eye-light-off-icon');
                setNewPasswordType('password');
            }
        }


        //이벤트핸들러 : 이메일 인증번호 요청 이벤트 처리 
        const onPasswordButtonClickEventHandler = () => {
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
            passwordCertification(requestBody);
            if(!passwordCertificationStatus.isSuccess) return alert('메일 전송 요청에 실패했습니다.');
            setVerificationActive(true);
        }

        //이벤트핸들러 : 이메일 인증번호 검증 시 이벤트 처리
        const onPasswordVerityEventHandler = () => {
            if(!verificationActive || !email) return; 
            //활성화값 false , email 값이 없다면 return;
            const code = verification;
            const requestBody: EmailCodeRequestDto = {email , code};
            //인증 값 useMutation에 기입.. 
            passwordCode(requestBody);
            if(!passwordCodeStatus.isSuccess) return alert('인증번호 검증 요청에 실패했습니다.')
            setCodeVerify(true); //검증 완료 상태 
        }

        //이벤트핸들러 : 인증완료 시 비밀번호 찾기 page 이동 이벤트 처리 
        const onPasswordVerifyButtonClickHandler = () => {
            if(!verificationActive) {
                setEmailError(true)
                setEmailErrorMessage('이메일로 메일을 보내지 않았습니다.')
            }
            else if(!codeVerify) {
                setVerificationError(true)
                setVerificationErrorMessage('이메일 인증 검증이 되지 않았습니다.')
            }
            if(!emailPasswordRef.current) return;

            setEmail('') //이메일 칸 초기화 => 또 이어서 작성되어있을 수 있다. 
            setPageSearch(2) //비밀번호 변경 요청.. 
            setVerificationActive(false)
            setCodeVerify(false) //초기화 해야 이중처리가 안된다. 
        }

        //이벤트핸들러 : 사용자의 이메일 기입 , 비밀번호 검증 후 새로운 비밀번호를 이용한다. 
        const onPasswordUpdateButtonClickHandler = () => {
            if(!email || !newPassword) return;


            const isCheckedPassword = newPassword.trim().length >= 8;
            if(!isCheckedPassword) {
                setNewPasswordError(true);
                setNewPasswordErrorMessage('비밀번호는 8자 이상 입력해라');
            }
            const requestBody : ResetPasswordChangeRequestDto = {email, newPassword};
            // requestBody => mutate로 전송하면 요청이 된다. 

            rePassword(requestBody);
            if(!rePasswordStatus.isSuccess) return alert('비밀번호 변경 요청에 실패했습니다.')
            navigate(AUTH_PATH());
            //비밀번호 찾기를 완료하면 로그인페이지로 이동한다.
        }


        //렌더 : 비밀번호 찾기
        return(
            <div className='auth-card'>
                <div className='auth-card-box'>
                    <div className='auth-card-top'>
                        <div className='auth-card-title-box'>
                            <div className='auth-card-title'>{'비밀번호 찾기'}</div>
                            <div className='auth-card-page'>{`${pageSearch}/2`}</div>
                        </div>
                        {pageSearch === 1 && ( //이메일 검증을 위한 자리 
                        <>
                        <div className='auth-email-box'>
                            <InputBox ref={emailPasswordRef} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' value={email} onChange={onEmailChangeHandler} error={isEmailError} message={emailErrorMessage} onkeyDown={onEmailKeyDownHandler}/>
                            <button className='email-mail-button-click' onClick={onPasswordButtonClickEventHandler}>{'인증메일전송'}</button>
                        </div>
                        {verificationActive && //이메일 인증번호는 true일때만 노출 
                        <div className='auth-email-box'>
                            <InputBox ref={verificationPasswordRef} label='이메일 인증번호*' type='text' placeholder='이메일 인증번호를 입력해주세요.' value={verification} onChange={onVerificationChangeHandler} error={isVerificationError} message={verificationErrorMessage} onkeyDown={onVerificationKeyDownHandler}/>                          
                            <button className='email-mail-button-click' onClick={onPasswordVerityEventHandler}>{'인증'}</button>
                        </div>
                        }
                        </>
                        )}
                        {pageSearch === 2 && ( //새로운 비밀번호를 위한 자리 
                        <>
                        <InputBox ref={emailPasswordRef} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' value={email} onChange={onEmailChangeHandler} error={isEmailError} message={emailErrorMessage} onkeyDown={onEmailKeyDownHandler}/>
                        <InputBox ref={newPasswordRef} label='새로운 비밀번호*' type={newPasswordType} placeholder='새로운 비밀번호를 입력해주세요.' value={newPassword} onChange={onNewPasswordChangeHandler} error={isNewPasswordError} message={newPasswordErrorMessage} icon={newPasswordButtonIcon} onButtonClick={onNewPasswordButtonClickHandler} onkeyDown={onNewPasswordKeyDownHandler}/>
                        </>
                        )}                                          
                    </div>
                    <div className='auth-card-bottom'>
                        {!verificationActive || !codeVerify && //메일인증 또는 코드검증이 false일 때 만 뜨도록.. 
                        <div className='auth-sign-in-error-box'>
                            <div className='auth-sign-in-error-message'>
                                {'이메일 주소를 잘못 입력했거나 이메일 인증번호 검증에 실패했습니다.\n입력하신 내용을 다시 확인해주세요.'}
                            </div>
                        </div>
                        }
                        {pageSearch === 1 && // 이메일 / 이메일 인증번호 검증 결과 => 넘어갈 자격 검증 
                        <div className='black-large-full-button' onClick={onPasswordVerifyButtonClickHandler}>{'인증완료'}</div>
                        }
                        {pageSearch === 2 && // 이메일 / 새로운비밀번호 유효성 검증 결과 체크 후 수정완료 
                        <div className='black-large-full-button' onClick={onPasswordUpdateButtonClickHandler}>{'비밀번호 변경'}</div>
                        }
                    </div>
                </div>
            </div>
        );
    };

    //렌더링 : 인증화면
    return (
        <div id='auth-wrapper'>
            <div className='auth-container'>
                <div className='auth-jumbotron-box'>
                    <div className='auth-jumbotron-content'>
                        <div className='auth-logo-icon'>{'앙팡테리블'}</div>
                        <div className='auth-jumbotron-text-box'>
                            <div className='auth-jumbotron-text'>{'앙팡테리블 마켓'}</div>
                            <div className='auth-jumbotron-text'>{'에 오신 것을 환영합니다.'}</div>
                        </div>
                    </div>
                </div>
                {view === 'sign-in' && <SignInCard />}
                {view === 'sign-up' && <SignUpCard />}
                {view === 'password-search' && <PasswordSearchCard />}
            </div>
        </div>
    )
}
// 배경(왼쪽 페이지 설명란 , (로그인창,회원가입창,비밀번호 변경 창) ) 