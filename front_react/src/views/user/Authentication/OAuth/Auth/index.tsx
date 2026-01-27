import InputBox from "@/components/user/CustomComponent/InputBox";
import { useAuth } from "@/hooks/user/auth/use-sign.hook";

export default function OAuthAddPage() {

    const OAuth = () => {

        //함수 : 추가 데이터 요청 
        const {
            refForms, formData, errors,
            onInputChange, onKeyDown, onAddressButtonClickHandler,
            onOAuthAddHandler
        } = useAuth();

        //렌더링 : 소셜 추가정보 기입란
        return(  
            <div className='auth-card'>
                <div className='auth-card-box'>
                    <div className='auth-card-top'>
                        <div className='auth-card-title-box'>
                            <div className='auth-card-title'>{'소셜로그인 추가 정보'}</div>
                        </div>
                        <>           
                        <InputBox ref={refForms.tel} label='핸드폰 번호*' type='text' placeholder='핸드폰 번호를 입력해주세요.' 
                                    name='tel' value={formData.tel} onChange={onInputChange} 
                                    error={errors.tel.state} message={errors.tel.message} 
                                    onkeyDown={(event) => onKeyDown(event, 'addressBase')} />
                        <InputBox ref={refForms.zipCode} label='우편 번호*' type='text' placeholder='우편 번호를 입력해주세요.' 
                                    name='zipCode' value={formData.zipCode} onChange={onInputChange} 
                                    error={errors.zipCode.state} message={errors.zipCode.message}/>
                        <InputBox ref={refForms.addressBase} label='주소*' type='text' placeholder='우편번호 찾기' 
                                    name='addressBase' value={formData.addressBase} onChange={onInputChange} 
                                    error={errors.addressBase.state} message={errors.addressBase.message} 
                                    icon='expend-right-light-icon' onButtonClick={onAddressButtonClickHandler} 
                                    onkeyDown={(event) => onKeyDown(event, 'addressDetail', onAddressButtonClickHandler)}/>
                        <InputBox ref={refForms.addressDetail} label='상세 주소*' type='text' placeholder='상세 주소를 입력해주세요.' 
                                    name='addressDetail' value={formData.addressDetail} onChange={onInputChange} 
                                    error={false} onkeyDown={(event) => onKeyDown(event, undefined , onOAuthAddHandler)}/>
                        </>
                    </div>
                    <div className='auth-card-bottom'>
                        {errors.tel.state || errors.zipCode.state || errors.addressBase.state && //에러가 true일 때 만 뜨도록.. 
                        <div className='auth-sign-in-error-box'>
                            <div className='auth-sign-in-error-message'>
                                {'필수입력 정보가 알맞지 않습니다. \n입력하신 내용을 다시 확인해주세요.'}
                            </div>
                        </div>
                        }
                        <div className='black-large-full-button' onClick={onOAuthAddHandler}>{'회원가입'}</div>
                    </div>
                </div>
            </div>
        );
    }

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
                <OAuth />
            </div>
        </div>
    )
}