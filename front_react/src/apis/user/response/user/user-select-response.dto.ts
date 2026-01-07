export default interface UserSelectResponseDto {
    userId: number;
    email: string;
    name: string;
    tel: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;
    role: "USER";
    status: "ACTIVE";
}
//내 정보 조회