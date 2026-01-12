import {useState,useEffect} from 'react';
import './style.css';
import InputBox from '@/components/user/CustomComponent/InputBox';
import { useAuth } from '@/hooks/user/auth/use-sign.hook';
import { SNS_SIGN_IN_URL } from '@/apis/user';

// 컴포넌트 : 인증화면 
export default function Authentication() {


    // 상태 : 화면 (로그인 화면 or 회원가입 화면 외엔 안 받음)
    const [view, setView] = useState<'sign-in' | 'sign-up' |'password-search'>('sign-in');

    //========================= 로그인 카드 내부 컴포넌트 =================================
    const SignInCard = () => {


    // ========================= 로그인 이벤트 핸들러 ===============================

        //함수 : 인증 함수 처리 
        const {
            formData, formChange, errors, refForms, 
            // 데이터 값/데이터변화값/오류처리값/DOM참조 값
            onInputChange, togglePasswordType, resetForm,
            //기입이벤트 /비번,텍스트 타입 이벤트처리 / view이동 시 초기화 
            onKeyDown, onSignInButtonClickHandler,
            //키다운이벤트처리 /로그인 이벤트처리 
        } = useAuth();


        //이벤트핸들러 : 회원가입 링크 클릭 이벤트 처리
        const onSignUpLinkClickHandler = () => {
            resetForm();
            setView('sign-up');
        }

        //이벤트핸들러 : 비밀번호 찾기 링크 클릭 이벤트 처리
        const onPasswordSearchLinkClickHandler = () => {
            resetForm();
            setView('password-search');
        }

        //이벤트핸들러 : 소셜 로그인 버튼 이벤트 처리 
        const onSnsSignInButtonClickHandler = (type: 'naver' | 'google') => {
            window.location.href = SNS_SIGN_IN_URL(type);
        }

    // ======================= 로그인 카드 렌더링 =========================
        return (// 컴포넌트 태그를 넣을 때 안에 변수 요소들이 있다면 설정을 해줘야 오류가 안난다.
                // ref를 넣게 된 것 => InputBox라는 커스텀컴포넌트에 forwardRef가 적용이 되어있음.  
            <div className='auth-card'>
                <div className='auth-card-box'>
                    <div className='auth-card-top'>
                        <div className='auth-card-title-box'>
                            <div className='auth-card-title'>{'로그인'}</div>
                            <div className='auth-card-sns-sign-button-box'>
                                <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')}>{'네이버로그인'}</div>
                                <div className='google-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('google')}>{'구글로그인'}</div>
                            </div>
                        </div>
                        <InputBox ref={refForms.email} label='이메일주소' type='text' placeholder='이메일 주소를 입력해주세요.' 
                                  error={errors.email.state} name='email' value={formData.email} onChange={onInputChange} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.email)}/>
                        <InputBox ref={refForms.password} label='패스워드' type={formChange.passwordType} placeholder='비밀번호를 입력해주세요.' 
                                  error={errors.password.state} name='password' value={formData.password} onChange={onInputChange} 
                                  icon={formChange.passwordIcon} onButtonClick={() => togglePasswordType('pw')} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.password, onSignInButtonClickHandler )}/>
                    </div>
                    <div className='auth-card-bottom'>
                        {errors.email.state || errors.password.state && //에러가 true일 때 만 뜨도록.. 
                        <div className='auth-sign-in-error-box'>
                            <div className='auth-sign-in-error-message'>
                                {'이메일 주소 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해주세요.'}
                            </div>
                        </div>
                        }
                        <div className='black-large-full-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
                        <div className='auth-description-box'>
                            <div className='auth-description'>{'신규 사용자이신가요?'}<span className='auth-description-link' onClick={onSignUpLinkClickHandler}>{'회원가입'}</span></div>
                            <div className='auth-description'>{'비밀번호를 잊으셨나요?'}<span className='auth-description-link' onClick={onPasswordSearchLinkClickHandler}>{'비밀번호 찾기'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        );// 상단 (입력란) , 하단 (버튼 등..)  //span태그를 섞어서 박스 내부에서 각자다른 태그의 역할수행
    };
    // ========================= 회원가입 카드 내부 컴포넌트 ================================
    const SignUpCard = () => {

    //함수 : 인증 함수 처리 
    const {
        page, formData, formChange, errors, refForms, // 페이지변화/데이터 값/데이터변화값/오류처리값/DOM참조 값
        onInputChange, togglePasswordType, onMailButtonClick, onMailVerifyClick, resetForm,
        //기입이벤트 /비번,텍스트 타입 이벤트처리 / 메일 인증 / 메일 검증 / view이동 시 초기화 
        onNextStepClick, onSignUpClick, 
        //다음으로 이벤트처리 / 회원가입 이벤트 처리 
        onKeyDown,
        //키다운이벤트처리
        onAddressButtonClickHandler
    } = useAuth();

    // ========================= 회원가입 카드 이벤트핸들러 ==============================

        //이벤트핸들러 : 로그인 링크 클릭 이벤트 처리 
        const onSignInLinkClickHandler = () => {
            resetForm(); 
            setView('sign-in');
            //폼에 있는 데이터 모든걸 초기화 후 로그인.. 
        }

    // ======================== 회원가입 이펙트 =========================================
    // 이펙트 : 페이지가 변경될 때마다 실행
        useEffect(() => {
            if(page === 2) { //넘어가도 되는 지 아닌지(전화번호 입력칸 로딩여부..)
                if(!refForms.tel.current) return;
                refForms.tel.current.focus();
            }
        }, [page, refForms.tel])

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
                            <InputBox ref={refForms.email} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' 
                                      name='email' value={formData.email} onChange={onInputChange} 
                                      error={errors.email.state} message={errors.email.message} 
                                      onkeyDown={(event) => onKeyDown(event, refForms.verification, onMailButtonClick)}/>
                            <button className='email-mail-button-click' onClick={onMailButtonClick}> {'이메일 인증'} </button>
                        </div>
                        {formChange.verificationActive && //이메일 인증번호는 true일때만 노출 
                        <div className='auth-email-box'>
                            <InputBox ref={refForms.verification} label='이메일 인증번호*' type='text' placeholder='이메일 인증번호를 입력해주세요.' 
                                      name='varification' value={formData.verification} onChange={onInputChange} 
                                      error={errors.verification.state} message={errors.verification.message} 
                                      onkeyDown={(event) => onKeyDown(event, refForms.password, onMailVerifyClick)}/>                          
                            <button className='email-mail-button-click' onClick={onMailVerifyClick}> {'인증번호 확인'} </button>
                        </div>
                        }                       
                        <InputBox ref={refForms.password} label='비밀번호*' type={formChange.passwordType} placeholder='비밀번호를 입력해주세요.' 
                                  name='password' value={formData.password} onChange={onInputChange} 
                                  error={errors.password.state} message={errors.password.message} 
                                  icon={formChange.passwordIcon} onButtonClick={() => togglePasswordType('pw')} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.password)}/>
                        <InputBox ref={refForms.passwordCheck} label='비밀번호 확인*' type={formChange.passwordCheckType} placeholder='비밀번호를 다시 입력해주세요.' 
                                  name='passwordCheck' value={formData.passwordCheck} onChange={onInputChange} 
                                  error={errors.passwordCheck.state} message={errors.passwordCheck.message} 
                                  icon={formChange.passwordCheckIcon} onButtonClick={() => togglePasswordType('check')} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.name)}/>
                        <InputBox ref={refForms.name} label='이름*' type='text' placeholder='실명을 입력해주세요.' 
                                  name='name' value={formData.name} onChange={onInputChange} 
                                  error={errors.name.state} message={errors.name.message} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.tel, onNextStepClick)}/>
                        </>
                        )}
                        {page === 2 && ( //핸드폰번호 , 우편번호 , 주소 , 상세주소  
                        <>

                        <InputBox ref={refForms.tel} label='핸드폰 번호*' type='text' placeholder='핸드폰 번호를 입력해주세요.' 
                                  name='tel' value={formData.tel} onChange={onInputChange} 
                                  error={errors.tel.state} message={errors.tel.message} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.addressBase)} />
                        <InputBox ref={refForms.zipCode} label='우편 번호*' type='text' placeholder='우편 번호를 입력해주세요.' 
                                  name='zipCode' value={formData.zipCode} onChange={onInputChange} 
                                  error={errors.zipCode.state} message={errors.zipCode.message}/>
                        <InputBox ref={refForms.addressBase} label='주소*' type='text' placeholder='우편번호 찾기' 
                                  name='addressBase' value={formData.addressBase} onChange={onInputChange} 
                                  error={errors.addressBase.state} message={errors.addressBase.message} 
                                  icon='expend-right-light-icon' onButtonClick={onAddressButtonClickHandler} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.addressDetail, onAddressButtonClickHandler)}/>
                        <InputBox ref={refForms.addressDetail} label='상세 주소*' type='text' placeholder='상세 주소를 입력해주세요.' 
                                  name='addressDetail' value={formData.addressDetail} onChange={onInputChange} 
                                  error={false} onkeyDown={(event) => onKeyDown(event, undefined , onSignUpClick)}/>
                        </>
                        )}
                    </div>
                    <div className='auth-card-bottom'>
                        {page === 1 &&( //버튼 1개
                        <div className='black-large-full-button' onClick={onNextStepClick}>{'다음 단계'}</div>
                        )}
                        {page === 2 &&( //글씨 + 클릭이벤트  , 클릭이벤트 구조 
                        <>
                        <div className='black-large-full-button' onClick={onSignUpClick}>{'회원가입'}</div>
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
        //함수 : 인증 함수 처리 
        const {
            page, formData, formChange, errors, refForms, // 페이지변화/데이터 값/데이터변화값/오류처리값/DOM참조 값
            onInputChange, togglePasswordType,
            //기입이벤트 /비번,텍스트 타입 이벤트처리 / view이동 시 초기화 
            onKeyDown,
            //키다운이벤트처리 
            onPasswordMailClick, onPasswordVerifyClick, onNextPasswordReset,
            onPasswordUpdateClick 
        } = useAuth();

        // 이펙트 : 페이지가 변경될 때마다 실행
        useEffect(() => {
            if(page === 2) { //넘어가도 되는 지 아닌지(전화번호 입력칸 로딩여부..)
                if(!refForms.password.current) return;
                refForms.password.current.focus();
            }
        }, [page, refForms.password])

        //렌더 : 비밀번호 찾기
        return(
            <div className='auth-card'>
                <div className='auth-card-box'>
                    <div className='auth-card-top'>
                        <div className='auth-card-title-box'>
                            <div className='auth-card-title'>{'비밀번호 찾기'}</div>
                            <div className='auth-card-page'>{`${page}/2`}</div>
                        </div>
                        {page === 1 && ( //이메일 검증을 위한 자리 
                        <>
                        <div className='auth-email-box'>
                            <InputBox ref={refForms.email} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' 
                                      name='email' value={formData.email} onChange={onInputChange} 
                                      error={errors.email.state} message={errors.email.message}
                                      onkeyDown={(event) => onKeyDown(event,refForms.email,onPasswordMailClick)}/> 
                            <button className='email-mail-button-click' onClick={onPasswordMailClick}>{'인증메일전송'}</button>
                        </div>
                        {formChange.verificationActive && //이메일 인증번호는 true일때만 노출 
                        <div className='auth-email-box'>
                            <InputBox ref={refForms.verification} label='이메일 인증번호*' type='text' placeholder='이메일 인증번호를 입력해주세요.' 
                                      name='verification' value={formData.verification} onChange={onInputChange} 
                                      error={errors.verification.state} message={errors.varification.message} 
                                      onkeyDown={(event) => onKeyDown(event, refForms.verification, onPasswordVerifyClick)}/>                          
                            <button className='email-mail-button-click' onClick={onPasswordVerifyClick}>{'인증'}</button>
                        </div>
                        }
                        </>
                        )}
                        {page === 2 && ( //새로운 비밀번호를 위한 자리 
                        <>
                        <InputBox ref={refForms.email} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' 
                                  name='email' value={formData.email} onChange={onInputChange} 
                                  error={errors.email.state} message={errors.email.message} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.email)} readOnly={true}/>
                        <InputBox ref={refForms.password} label='새로운 비밀번호*' type={formChange.passwordType} placeholder='새로운 비밀번호를 입력해주세요.' 
                                  name='password' value={formData.password} onChange={onInputChange} 
                                  error={errors.password.state} message={errors.password.message} 
                                  icon={formChange.passwordIcon} onButtonClick={() => togglePasswordType('pw')} 
                                  onkeyDown={(event) => onKeyDown(event, refForms.password,onPasswordUpdateClick)}/>
                        </>
                        )}                                          
                    </div>
                    <div className='auth-card-bottom'>
                        {!formChange.verificationActive || !formChange.codeVerify && //메일인증 또는 코드검증이 false일 때 만 뜨도록.. 
                        <div className='auth-sign-in-error-box'>
                            <div className='auth-sign-in-error-message'>
                                {'이메일 주소를 잘못 입력했거나 이메일 인증번호 검증에 실패했습니다.\n입력하신 내용을 다시 확인해주세요.'}
                            </div>
                        </div>
                        }
                        {page === 1 && // 이메일 / 이메일 인증번호 검증 결과 => 넘어갈 자격 검증 
                        <div className='black-large-full-button' onClick={onNextPasswordReset}>{'다음으로'}</div>
                        }
                        {page === 2 && // 이메일 / 새로운비밀번호 유효성 검증 결과 체크 후 수정완료 
                        <div className='black-large-full-button' onClick={onPasswordUpdateClick}>{'비밀번호 변경'}</div>
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