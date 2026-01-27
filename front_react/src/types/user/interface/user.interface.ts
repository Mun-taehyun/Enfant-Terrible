export default interface User {
    userId : number;
    email : string;
    name : string;
    tel : string;
    zipCode : string;
    addressBase : string;
    addressDetail : string | null;
    role : 'USER';
    status : 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}