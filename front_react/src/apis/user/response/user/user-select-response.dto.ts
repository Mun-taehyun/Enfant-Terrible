export default interface UserSelectResponseDto {
    userId: number;
    email: string;
    name: string;
    tel: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;
    role: "USER"| null;
    status : 'ACTIVE' | 'SUSPENDED' | 'DELETED' | null;
}
//내 정보 조회