import InputBox from '@/components/user/CustomComponent/InputBox';
import { useState} from 'react';
import './style.css';
import { useAuth } from '@/hooks/user/auth/use-sign.hook';







export const UserUpdate = () => {

    //상태: 보는 페이지 
    const [view , setView] = useState<"my-page"| "password-update">("my-page"); 


    //이벤트핸들러: 유저정보 수정페이지 
    const onUserUpdatePage = () => {
        setView("my-page");
    }

    //이벤트핸들러: 유저정보 수정페이지 
    const onUserPasswordPage = () => {
        setView("password-update");
    }


    //내부 컴포넌트 page
    const UserUpdatePage = () => {
        const {
            formData, myInfoError, errors, refForms, myInfo,
            onAddressButtonClickHandler, onInputChange, 
            onKeyDown,
            onUserUpdateEventHandler
            // 수정핸들러          
        } = useAuth();

        if(!myInfo || myInfoError instanceof Error) return <div> 유저 정보를 불러오지 못하였습니다... </div>;
        return(
            <div className="profile-container">
                <div className="profile-title">마이페이지</div>
                <div className={`tab-pane ${view === "my-page" ? 'active' : 'hidden'}`}>
                    <InputBox ref={refForms.email} label="이메일 주소" type="text" name="email" 
                                value={myInfo.email} readOnly={true} placeholder="" 
                                error={false} message={""} onChange={onInputChange} 
                    />
                    <div className="helper-text">* 이메일은 변경할 수 없습니다.</div>
                </div>


            <div className={`tab-pane ${view === "my-page" ? 'active' : 'hidden'}`}>
                <InputBox ref={refForms.name} label="이름" type="text" name="name" value={formData.name} placeholder="이름 입력" 
                            error={errors.name.state} message={errors.name.message} onChange={onInputChange}
                            onkeyDown={(event) => onKeyDown(event, "tel")} />
                <InputBox ref={refForms.tel} label="전화번호" type="text" name="tel" value={formData.tel} placeholder="전화번호 입력" 
                            error={errors.tel.state} message={errors.tel.message} onChange={onInputChange}
                            onkeyDown={(event) => onKeyDown(event, "addressBase")}/>
                
                <div className="address-group">
                    <InputBox ref={refForms.zipCode} label="우편번호" type="text" name="zipCode"  placeholder="우편번호"
                                value={formData.zipCode} error={errors.zipCode.state} message={errors.zipCode.message} 
                                onChange={onInputChange} />
                    <InputBox ref={refForms.addressBase} label="기본 주소" type="text" name="addressBase" placeholder="기본 주소"
                                value={formData.addressBase} error={errors.addressBase.state} message={errors.addressBase.message} onChange={onInputChange} 
                                onButtonClick={onAddressButtonClickHandler} onkeyDown={(event) => onKeyDown(event,'addressDetail')}/>
                    <InputBox ref={refForms.addressDetail} label="상세 주소" type="text" name="addressDetail" placeholder="상세 주소 입력" 
                                value={formData.addressDetail ? formData.addressDetail : " "} error={false} onChange={onInputChange} 
                                onkeyDown={(event) => onKeyDown(event, undefined, onUserUpdateEventHandler)}/>
                </div>
                <button className="submit-btn" onClick={onUserUpdateEventHandler}>정보 수정 완료</button>
            </div>
        </div>
        );                

    }

    const PasswordUpdatePage = () => {
        const {
            formData, errors, refForms,
            onInputChange, onKeyDown,
            onPasswordUpdateClick
            // 수정핸들러          
        } = useAuth();


        return(
            <div className="profile-container">
                <div className="profile-title">비밀번호 수정</div>


            <div className={`tab-pane ${view === 'password-update' ? 'active' : 'hidden'}`}>
                <InputBox ref={refForms.password} label="현재 비밀번호" type="password" name="password" 
                            value={formData.password} placeholder="현재 비밀번호 입력" 
                            error={errors.password.state} message={errors.password.message} 
                            onChange={onInputChange} onkeyDown={(event) => onKeyDown(event, "newPassword")}/>
                <InputBox ref={refForms.newPassword} label="새 비밀번호" type="password" name="newPassword" 
                            value={formData.newPassword} placeholder="새 비밀번호 입력" 
                            error={errors.newPassword.state} message={errors.newPassword.message} 
                            onChange={onInputChange} onkeyDown={(event) => onKeyDown(event, undefined , onPasswordUpdateClick)}/>
                <button className="submit-btn" onClick={onPasswordUpdateClick}>비밀번호 업데이트</button>
            </div>
        </div>
        );                

    }


    // if(isInfoLoading) return <div> 유저정보를 불러오는 중 입니다... </div>;
    return (
        <div className="pet-edit-page">
            <div className="pet-edit-card">

                <div className="pet-edit-header">
                    <div className="pet-edit-title">회원정보 수정</div>
                    <div className="pet-edit-subtitle">
                    보호자님의 정보를 안전하게 관리하세요
                    </div>
                </div>

                <div className="pet-edit-tab">
                    <div className={`pet-edit-tab-item ${view === 'my-page' ? 'active' : ''}`} onClick={onUserUpdatePage}>
                        기본 정보
                    </div>
                    <div className={`pet-edit-tab-item ${view === 'password-update' ? 'active' : ''}`}onClick={onUserPasswordPage}>
                        비밀번호 변경
                    </div>
                </div>

                <div className="pet-edit-content">
                    {view === 'my-page'
                    ? <UserUpdatePage />
                    : <PasswordUpdatePage />}
                </div>

            </div>
        </div>
    );
};
