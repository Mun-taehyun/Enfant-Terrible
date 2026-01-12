//회원가입 / 로그인 / 비밀번호 찾기 / 소셜회원가입  훅 
import { AUTH_PATH, MAIN_PATH } from "@/constant/user/route.index";
import { authQueries, userQueries } from "@/querys/user/queryhooks";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { Address, useDaumPostcodePopup} from "react-daum-postcode";
import { useNavigate } from "react-router-dom";

//초기화 객체: 입력값 
const input ={email: '', verification: '', password: '', passwordCheck: '',
              name: '', tel: '', zipCode: '', addressBase: '', addressDetail: ''} //=> 이동 시 다 비워야 좋다. 

export const useAuth = () => {

    //함수: Daum 우편번호 , 주소 
    const openDaum = useDaumPostcodePopup();

    //이벤트핸들러 : 우편번호/주소 버튼 클릭 이벤트 처리
    const onAddressButtonClickHandler = () => {
        openDaum({onComplete: onAddressComplete});
    }//npm i react-daum-postcode 를 하게되면 =>  인베디드 형태 , 팝업 형태를 고를 수 있음 ..

    //이벤트핸들러: 우편번호, 주소 검색
    const onAddressComplete = (data: Address) => {
        setFormData(prev => ({ ...prev, zipCode: data.zonecode, addressBase: data.address }));
        //FormData 순회 => zipCode , address data선택.. 
        setErrors(prev => ({ ...prev, zipCode: { state: false, message: '' }, addressBase: { state: false, message: '' } }));
        if(!refForms.addressDetail.current) return;
        refForms.addressDetail.current.focus();
        //null일 수 있으므로 필터.. 
    };

    //서버상태: 메일인증
    const { mutate: emailCertification } = authQueries.useEmailCertification();

    //서버상태: 인증번호 검증
    const { mutate: emailCode} = authQueries.useEmailCodeVerify();

    //서버상태: 회원가입 
    const { mutate: signUp} = userQueries.useSignUp();

    //서버상태 : 로그인 요청 / 응답
    const { mutate: signIn} = authQueries.useSignin();

    //서버상태 : 비밀번호 찾기 메일 요청
    const { mutate: sendPasswordMail } = authQueries.useResetPasswordEmail();

    //서버상태 : 인증번호 검증 요청
    const { mutate: verifyPasswordCode } = authQueries.useResetPasswordCode();

    //서버상태 : 새로운 비밀번호로 수정
    const { mutate: changePassword } = authQueries.useResetPasswordChange();

    //서버상태 : 소셜 로그인 추가 정보 기입
    const { mutate: addInfo } = userQueries.useOauthAddInformation();

    //상태: 페이지 상태 
    const [page, setPage] = useState<1 | 2>(1);

    //상태: 입력 데이터 
    const [formData, setFormData] = useState(input);

    //상태: 폼 상태의 변화 (비밀번호 감추기 , 아이콘 변경 , 메일발송 , 인증번호 검증.)
    const [formChange, setFormChange] = useState({
        passwordType: 'password' as 'text' | 'password',
        passwordCheckType: 'password' as 'text' | 'password',
        //비밀번호 , 비밀번호 확인 체크 기본값은 password... 
        passwordIcon: 'eye-light-off-icon' as 'eye-light-off-icon' | 'eye-light-on-icon',
        passwordCheckIcon: 'eye-light-off-icon' as 'eye-light-off-icon' | 'eye-light-on-icon',
        //Icon으로 text , password 교체 여부 => 내 비밀번호를 감추고 싶다 , 보고싶다 이럴때 쓰인다. 
        verificationActive: false,
        codeVerify: false,
        //메일 인증 , 인증번호 검증 여부 => 기본값 false.. 
    });

    const [errors, setErrors] = useState<Record<string, { state: boolean; message: string }>>({
        email: { state: false, message: '' },
        verification: { state: false, message: '' },
        password: { state: false, message: '' },
        passwordCheck: { state: false, message: '' },
        name: { state: false, message: '' },
        tel: { state: false, message: '' },
        zipCode: { state: false, message: '' },
        addressBase: { state: false, message: '' },
        //Record<key , value>으로  key - value 짝 데이터를 관리하기 용이 한 객체다. 
        //상태 , 메세지로 => error , message 에 각각 오류 여부 , 남긴다.. 
    });

    //참조 : 입력 폼 접근
    const refForms = {
        email: useRef<HTMLInputElement>(null),
        verification: useRef<HTMLInputElement>(null),
        password: useRef<HTMLInputElement>(null),
        passwordCheck: useRef<HTMLInputElement>(null),
        name: useRef<HTMLInputElement>(null),
        tel: useRef<HTMLInputElement>(null),
        zipCode: useRef<HTMLInputElement>(null),
        addressBase: useRef<HTMLInputElement>(null),
        addressDetail: useRef<HTMLInputElement>(null),
    };

    
    //함수 : 상태 초기화 "각각 가입방식에 따라 공유되지 않기위해"
    const resetForm = () => {
        setFormData(input); //전체 값 초기화 ... 
        setErrors({}); // 에러 상태 초기화 ... 
        setFormChange(prev => ({ ...prev, verificationActive: false, codeVerify: false }));
        //FormChange에 있는 여러 매개변수 중 뒤에있는 메일발송 , 인증코드 검증 상태 초기화 
    };

    //함수: 네비게이트 
    const navigate = useNavigate();

    //이벤트핸들러 : 모든 InputBox 데이터 바뀜 이벤트 처리 
    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; //input 태그의 name , value 입력값을 인식 
        setFormData(prev => ({ ...prev, [name]: value }));
        //Form 데이터의 name값 => email , password 등..... 을 value값에 대응.. 

        setErrors(prev => ({ ...prev, [name]: { state: false, message: '' } }));
        //Error 코드도 name에 맞는 상태 위치 ... 대응.. 

        if (name === 'verification') { //인증번호 검증일 경우 => 오류..
            setErrors(prev => ({ ...prev, verification: { state: true, message: '인증번호 검증을 받아야 합니다.' } }));
        }
    };

    //이벤트핸들러: 비밀번호 타입 토글 이벤트 처리 
    const togglePasswordType = (target: 'pw' | 'check') => {
        const isPw = target === 'pw';
        //비밀번호 = true , 비밀번호 확인 = false 
        setFormChange(prev => {
            const currentType = isPw ? prev.passwordType : prev.passwordCheckType;
            //각자 타입 재할당  true === password   , false === passwordCheck
            
            return {
                ...prev,
                [isPw ? 'passwordType' : 'passwordCheckType']: currentType === 'password' ? 'text' : 'password',
                // [key]: value 이렇게 지정이 되었는데 .  [password]가 passsword 였으면 클릭 시 => text  
                [isPw ? 'passwordIcon' : 'passwordCheckIcon']: currentType === 'password' ? 'eye-light-on-icon' : 'eye-light-off-icon'
                // [key]: value 이렇게 지정이 되었는데 .  [password]가 passsword 였으면 클릭 시 => 눈이 떠지는 이모티콘 
            };
        });
        //setFormChange(prev => {})
    };

    //이벤트핸들러: 이메일 인증 이벤트 처리
    const onMailButtonClick = () => {
        if (!formData.email) return; //email 데이터가 빈값 , 존재 x => return;
        const emailPattern = /^[a-zA-Z0-9]{1,20}@([-.]?[a-zA-Z0-9]){1,8}\.[a-zA-Z]{2,4}$/; //유효성검사.. 
        if (!emailPattern.test(formData.email)) {//유효성 검사 실패 시 error , error출력 
            setErrors(p => ({ ...p, email: { state: true, message: '이메일 주소 포멧이 맞지 않다.' } }));
            return;
        }

        //이메일 인증 요청.. mutation 함수 사용
        emailCertification(
            { email: formData.email }, 
            { 
                onSuccess: () => setFormChange(p => ({ ...p, verificationActive: true })),
                onError: (error: Error) => {alert(error.message);}
            }
            // 백엔드 message 그대로
        ); 
        //useMutation의 파라미터에 mutation 데이터 mutate(데이터 , 옵션?) 매개변수 1~2개 수용
        // onSuccess 활용  => 메일인증 성공 시 인증번호가 뜨는 verificationActive = true...  
    };

    //이벤트핸들러: 인증번호 검증
    const onMailVerifyClick = () => {
        if (!formChange.verificationActive || !formData.email) return;
        //메일 인증 상태가 아니거나. 이메일이 존재하지 않는다면 => return
        emailCode(
            { email: formData.email, code: formData.verification }, 
            {
                onSuccess: () => {
                    setFormChange(p => ({ ...p, codeVerify: true }));
                    setErrors(p => ({ ...p, verification: { state: false, message: '' } }));
                },
                onError: (error: Error) => {alert(error.message)}
            } //성공 시 검증 완료 , 유효성 / 오류 시 백엔드 알림 
        );
    };

    //이벤트핸들러 : 공통 키다운 이벤트 처리 
    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, nextRef?: React.RefObject<HTMLInputElement|null>, enterEvent?: () => void) => {
        if (event.key !== 'Enter') return;
        if (enterEvent) enterEvent(); // enterEvent 함수가 존재한다면 실행
        if (nextRef?.current) nextRef.current.focus(); //엔터 시 다음 Ref타입을 인식하기... 
    };
    //키다운 이벤트... 함수가 존재/존재X / 다음 Ref Dom참조할 게 존재/존재X 차이.. 

    //이벤트핸들러: 다음 단계 버튼
    const onNextStepClick = () => {
        const isCheckedPassword = formData.password.trim().length >= 8;
        const isEqualPassword = formData.password === formData.passwordCheck;
        const isNamePattern = formData.name.trim().length >= 2;

        if (!isCheckedPassword) setErrors(p => ({ ...p, password: { state: true, message: '비밀번호는 8자 이상 입력해라' } }));
        if (!isEqualPassword) setErrors(p => ({ ...p, passwordCheck: { state: true, message: '비밀번호가 일치하지 않는다' } }));
        if (!isNamePattern) setErrors(p => ({ ...p, name: { state: true, message: '실명이름으로 입력해주세요' } }));

        if (formChange.verificationActive && formChange.codeVerify && isCheckedPassword && isEqualPassword && isNamePattern) {
            setPage(2);
        }
    };

    //이벤트핸들러: 회원가입 버튼 이벤트 처리 
    const onSignUpClick = () => {
        const telPattern = /^[0-9]{11,13}$/;
        const isTelValid = telPattern.test(formData.tel);
        const hasZip = formData.zipCode.trim().length !== 0;
        const hasAddr = formData.addressBase.trim().length !== 0;

        if (!isTelValid) setErrors(p => ({ ...p, tel: { state: true, message: '숫자만 입력해라' } }));
        if (!hasZip) setErrors(p => ({ ...p, zipCode: { state: true, message: '우편번호를 선택해주세요' } }));
        if (!hasAddr) setErrors(p => ({ ...p, addressBase: { state: true, message: '주소를 선택해주세요' } }));

        if (isTelValid && hasZip && hasAddr) {
            signUp(
                {
                    email : formData.email, password: formData.password, 
                    name : formData.name , tel :  formData.tel,
                    zipCode : formData.zipCode, addressBase : formData.addressBase, 
                    addressDetail : formData.addressDetail
                },
                {
                    onSuccess: () => {navigate(AUTH_PATH());},
                    onError: (error:Error) => {alert(error.message)}
                }
            );
        }
    };

    // 이벤트핸들러 : 로그인 버튼 클릭 이벤트 처리
    const onSignInButtonClickHandler = async () => {
        // 1. 입력 검증 (불필요한 네트워크 요청 방지)
        const { email, password } = formData;
        if (!email || !password) {
            setErrors(p => ({ ...p, email: {state: true, message: '이메일을 입력해주세요.'}})); // 에러 메시지 노출
            setErrors(p => ({ ...p, password: {state: true, message: '비밀번호를 입력해주세요.'}})); // 에러 메시지 노출
            return;
        }

        signIn(
            { email, password }, 
            {
            onSuccess: (data) => {
                localStorage.setItem('accessToken', data.accessToken);
                navigate(MAIN_PATH());
            },
            onError: (error : Error) => {
                // 이미 useSignin 훅에서 AxiosError로 타입을 잡아뒀다면 
                // 여기서 자동완성도 잘 됩니다.
                alert(error.message || '로그인이 실패되었습니다.');
                setErrors(p => ({...p, email: {state: true, message: '이메일을 정확히 입력해주세요.'}}));
            }
            }
        )
    };

    //이벤트핸들러 : 메일 찾기 이벤트 처리 
    const onPasswordMailClick = () => {
        if (!formData.email) return;
        const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
        if (!emailPattern.test(formData.email)) {
            setErrors(p => ({ ...p, email: { state: true, message: '이메일 주소 포맷이 맞지 않습니다.' } }));
            return;
        }
        sendPasswordMail({ email: formData.email }, {//email만 보냄. 
            onSuccess: () => {
                setFormChange(p => ({ ...p, verificationActive: true }));
            },
            onError: (error: Error) => alert(error.message || '메일 발송 실패')
        });
    };

    //이벤트핸들러 : 비밀번호 찾기 인증번호 검증 
    const onPasswordVerifyClick = () => {
        if (!formData.verification) return;
        
        verifyPasswordCode({ email: formData.email, code: formData.verification }, {
            onSuccess: () => {
                setFormChange(p => ({ ...p, codeVerify: true }));
                setErrors(p => ({ ...p, verification: { state: false, message: '' } }));
            },
            onError: (error: Error) => {
                alert(error.message)
                setErrors(p => ({ ...p, verification: { state: true, message: '인증번호가 일치하지 않습니다.' } }));
            }
        });
    };

    //이벤트핸들러 : 메일/검증 후 2페이지로 이동.. 
    const onNextPasswordReset = () => {
        if (!formChange.verificationActive) {
            return setErrors(p => ({ ...p, email: { state: true, message: '인증 메일을 발송해주세요.' } }));
        }
        if (!formChange.codeVerify) {
            return setErrors(p => ({ ...p, verification: { state: true, message: '인증번호 검증이 필요합니다.' } }));
        }

        // 인증 성공 시 이메일만 남기고 나머지는 초기화하며 2페이지로 이동
        const savedEmail = formData.email;
        resetForm();
        setFormData(prev => ({ ...prev, email: savedEmail })); 
        setPage(2); // pageSearch 대신 기존 page 상태 활용
    };

    //이벤트핸들러 : 최종 비밀번호 변경 
    const onPasswordUpdateClick = () => {
        if(formData.password.length < 8) {
            return setErrors(p => ({...p, password: {state: true, message: '비밀번호는 8자 이상이어야 합니다.'}}))
        }

        changePassword(//최종 newPassword 기입..  email은 기존에 쓰던게 올라감. 
            {email: formData.email, newPassword: formData.password},
            {
            onSuccess: () => {
                navigate(AUTH_PATH());
            },
            onError: (error: Error) => alert(error.message || '변경 실패')
            }
        );
    }

    //이벤트핸들러 : 소셜 회원가입 정보 기입 요청 이벤트 처리 
    const onOAuthAddHandler = () => {
        const { tel, zipCode, addressBase, addressDetail } = formData;
        
        //필수정보 입력 검증
        if (!tel || !zipCode || !addressBase) {
            setErrors(p => ({...p, tel: {state: true, message: '전화번호를 정확히 기입해주세요'}}));
            setErrors(p => ({...p, zipCode:{state: true, message: '우편번호를 기입해주세요'}}));
            setErrors(p => ({...p, addressBase:{state: true, message: '주소를 기입해주세요'}}));
            return;
        }

        //서버상태 불러오기 {넣을 데이터} , {성공 , 실패 결괏값} 도출 
        addInfo(
            { tel, zipCode, addressBase, addressDetail }, 
            {
                onSuccess: () => {
                    navigate(MAIN_PATH(), { replace: true });
                    //이미 토큰을 받았으므로 처리 끝.                 
                },
                onError: (error: Error) => {
                    alert(error.message);
                }
            }
        );
    };


    return {
        page, formData, formChange, errors, refForms, // 페이지변화/데이터 값/데이터변화값/오류처리값/DOM참조 값
        onInputChange, togglePasswordType, onMailButtonClick, onMailVerifyClick, resetForm,
        //기입이벤트 /비번,텍스트 타입 이벤트처리 / 메일 인증 / 메일 검증 / view이동 시 초기화 
        onNextStepClick, onSignUpClick, 
        //다음으로 이벤트처리 / 회원가입 이벤트 처리 
        onKeyDown, setPage, onSignInButtonClickHandler,
        //키다운이벤트처리 / 페이지 이동 처리 / 로그인 이벤트 처리 
        onPasswordMailClick, onPasswordVerifyClick, onNextPasswordReset,
        //비번찾기메일전송 / 비번찾기인증번호검증 / 비번찾기검증 후 비번변경으로 이동 
        onPasswordUpdateClick,  onOAuthAddHandler , onAddressButtonClickHandler
        //새로운비밀번호 수정  //소셜회원가입정보기입란
       


    };
};