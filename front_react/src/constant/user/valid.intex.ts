
//이메일 유효성 검사 
export const emailPattern = /^[a-zA-Z0-9]{1,20}@([-.]?[a-zA-Z0-9]){1,8}\.[a-zA-Z]{2,4}$/;

//인증번호 유효성 검사 
export const verificationPattern = /^[0-9]{6}$/;

//비밀번호 유효성 검사 
export const passwordPattern = /^[0-9]{8,16}$/;

//전화번호 유효성 검사 
export const telPattern = /^[0-9]{11,13}$/;

// 바꾸기 쉽게 모아둠 