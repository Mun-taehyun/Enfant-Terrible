export default interface UserSelectResponseDto {
    userId: number;
    email: string;
    name: string;
    tel: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;
    role: string;
    status : 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}
//내 정보 조회