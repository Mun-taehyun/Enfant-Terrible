
//이메일 유효성 검사 
export const emailPattern = /^[a-zA-Z0-9]{1,20}@([-.]?[a-zA-Z0-9]){1,8}\.[a-zA-Z]{2,4}$/;

//인증번호 유효성 검사 
export const verificationPattern = /^[0-9]{6}$/;

//비밀번호 유효성 검사 "특수문자 ,영어 , 숫자 최소 1개 이상에 8~20글자"
export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

//전화번호 유효성 검사 
export const telPattern = /^01([0|1[6-9])-?([0-9]{3,4})-?([0-9]{4})$/;

// 바꾸기 쉽게 모아둠 


