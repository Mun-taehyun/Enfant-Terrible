import InputBox from '@/components/user/CustomComponent/InputBox';
import { useState} from 'react';
import './style.css';
import { useAuth } from '@/hooks/user/auth/use-sign.hook';

type TabType = 'BASIC' | 'PASSWORD' | 'UPDATE';






export const UserUpdate = () => {
    //함수 : 인증 관리 
    const {
        myInfo,myInfoError, isInfoLoading, errors, refForms,
        onAddressButtonClickHandler, onInputChange, 
        onKeyDown,
        onUserUpdateEventHandler,onPasswordUpdateClick
        // 수정핸들러           / 비밀번호재설정        /수정 주입용 데이터 (탭기능)
    } = useAuth();






    // 1. 탭 상태 관리
    const [currentTab, setCurrentTab] = useState<TabType>('BASIC');

    // if(isInfoLoading) return <div> 유저정보를 불러오는 중 입니다... </div>;
    if(!myInfo || myInfoError instanceof Error) return <div> 유저 정보를 불러오지 못하였습니다... </div>;
    return (
        <div className="profile-container">
            <div className="profile-title">마이페이지</div>
            <div className="tab-menu">
                <button className={currentTab === 'BASIC' ? 'active' : ''} onClick={() =>{ setCurrentTab('BASIC');}}>기본 정보</button>
                <button className={currentTab === 'PASSWORD' ? 'active' : ''} onClick={()=>{setCurrentTab('PASSWORD');}}>비밀번호 변경</button>
                <button className={currentTab === 'UPDATE' ? 'active' : ''} onClick={() =>{setCurrentTab('UPDATE');}}>회원정보 수정</button>
            </div>
            <div className={`tab-pane ${currentTab === 'BASIC' ? 'active' : 'hidden'}`}>
                <InputBox ref={refForms.email} label="이메일 주소" type="text" name="email" 
                            value={myInfo.email} readOnly={true} placeholder="" 
                            error={false} message={""} onChange={onInputChange} 
                />
                <div className="helper-text">* 이메일은 변경할 수 없습니다.</div>
            </div>


            <div className={`tab-pane ${currentTab === 'PASSWORD' ? 'active' : 'hidden'}`}>
                <InputBox ref={refForms.password} label="현재 비밀번호" type="password" name="password" 
                            value={""} placeholder="현재 비밀번호 입력" 
                            error={errors.password.state} message={errors.password.message} 
                            onChange={onInputChange} onkeyDown={(event) => onKeyDown(event, "newPassword")}/>
                <InputBox ref={refForms.newPassword} label="새 비밀번호" type="password" name="newPassword" 
                            value={""} placeholder="새 비밀번호 입력" 
                            error={errors.newPassword.state} message={errors.newPassword.message} 
                            onChange={onInputChange} onkeyDown={(event) => onKeyDown(event, undefined , onPasswordUpdateClick)}/>
                <button className="submit-btn" onClick={onPasswordUpdateClick}>비밀번호 업데이트</button>
            </div>


            <div className={`tab-pane ${currentTab === 'UPDATE' ? 'active' : 'hidden'}`}>
                <InputBox ref={refForms.name} label="이름" type="text" name="name" value={myInfo.name} placeholder="이름 입력" 
                            error={errors.name.state} message={errors.name.message} onChange={onInputChange}
                            onkeyDown={(event) => onKeyDown(event, "tel")} />
                <InputBox ref={refForms.tel} label="전화번호" type="text" name="tel" value={myInfo.tel} placeholder="전화번호 입력" 
                            error={errors.tel.state} message={errors.tel.message} onChange={onInputChange}
                            onkeyDown={(event) => onKeyDown(event, "addressBase")}/>
                
                <div className="address-group">
                    <InputBox ref={refForms.zipCode} label="우편번호" type="text" name="zipCode"  placeholder="우편번호"
                                value={myInfo.zipCode} error={errors.zipCode.state} message={errors.zipCode.message} 
                                onChange={onInputChange} />
                    <InputBox ref={refForms.addressBase} label="기본 주소" type="text" name="addressBase" placeholder="기본 주소"
                                value={myInfo.addressBase} error={errors.addressBase.state} message={errors.addressBase.message} onChange={onInputChange} 
                                onButtonClick={onAddressButtonClickHandler} onkeyDown={(event) => onKeyDown(event,'addressDetail')}/>
                    <InputBox ref={refForms.addressDetail} label="상세 주소" type="text" name="addressDetail" placeholder="상세 주소 입력" 
                                value={myInfo.addressDetail ? myInfo.addressDetail : " "} error={false} onChange={onInputChange} 
                                onkeyDown={(event) => onKeyDown(event, undefined, onUserUpdateEventHandler)}/>
                </div>
                <button className="submit-btn" onClick={onUserUpdateEventHandler}>정보 수정 완료</button>
            </div>
        </div>
    );
};
