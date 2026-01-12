import InputBox from '@/components/user/CustomComponent/InputBox';
import { useState, ChangeEvent } from 'react';
import './style.css';
import { useAuth } from '@/hooks/user/auth/use-sign.hook';

type TabType = 'BASIC' | 'PASSWORD' | 'UPDATE';

const UserUpdate = () => {
    //함수 : 인증 관리 
    const {
        formData, errors, refForms,
        onAddressButtonClickHandler, onInputChange, 
    } = useAuth();


    // 1. 탭 상태 관리
    const [currentTab, setCurrentTab] = useState<TabType>('BASIC');

    // 2. 입력 데이터 상태 관리
    const [userInfo, setUserInfo] = useState({
        email: 'user@example.com', // 고정값 (readOnly)
        password: '',
        newPassword: '',
        name: '홍길동',
        tel: '010-1234-5678',
        zipCode: '12345',
        addressBase: '서울시 강남구...',
        addressDetail: '101호'
    });


    return (
        <div className="profile-container">
            <h2 className="profile-title">마이페이지</h2>
            <div className="tab-menu">
                <button className={currentTab === 'BASIC' ? 'active' : ''} onClick={() => setCurrentTab('BASIC')}>기본 정보</button>
                <button className={currentTab === 'PASSWORD' ? 'active' : ''} onClick={() => setCurrentTab('PASSWORD')}>비밀번호 변경</button>
                <button className={currentTab === 'UPDATE' ? 'active' : ''} onClick={() => setCurrentTab('UPDATE')}>회원정보 수정</button>
            </div>
            <div className="tab-content">   
                {currentTab === 'BASIC' && (
                    <div className="tab-pane">
                        <InputBox ref={} label="이메일 주소" type="text" name="email" 
                                  value={userInfo.email} readOnly={true} placeholder="" 
                                  error={false} message={""} onChange={onInputChange()} 
                        />
                        <div className="helper-text">* 이메일은 변경할 수 없습니다.</div>
                    </div>
                )}

                {currentTab === 'PASSWORD' && (
                    <div className="tab-pane">
                        <InputBox label="현재 비밀번호" type="password" name="password" value={formData.password} placeholder="현재 비밀번호 입력" error={errors.password.state} message={errors.password.message} onChange={onInputChange()} onkeyDown={(event) => onKeyDown(event, refs)}/>
                        <InputBox label="새 비밀번호" type="password" name="newPassword" value={formData.newPassword} placeholder="새 비밀번호 입력" error={errors.newPassword.state} message={errors.newPassword.message} onChange={onInputChange()} />
                        <button className="submit-btn">비밀번호 업데이트</button>
                    </div>
                )}

                {currentTab === 'UPDATE' && (
                    <div className="tab-pane">
                        <InputBox label="이름" type="text" name="name" value={userInfo.name} placeholder="이름 입력" error={false} onChange={onInputChange()} />
                        <InputBox label="전화번호" type="text" name="tel" value={userInfo.tel} placeholder="전화번호 입력" error={false} onChange={onInputChange()} />
                        
                        <div className="address-group">
                            <InputBox label="우편번호" type="text" name="zipCode" value={userInfo.zipCode} placeholder="우편번호" error={false} onChange={onInputChange()} 
                                icon="expend-right-light-icon" onButtonClick={() => alert('주소 검색')} />
                            <InputBox label="기본 주소" type="text" name="addressBase" value={userInfo.addressBase} placeholder="기본 주소" error={false} onChange={onInputChange()} onButtonClick={onAddressButtonClickHandler()}/>
                            <InputBox label="상세 주소" type="text" name="addressDetail" value={userInfo.addressDetail} placeholder="상세 주소 입력" error={false} onChange={onInputChange()} />
                        </div>
                        <button className="submit-btn">정보 수정 완료</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserUpdate;