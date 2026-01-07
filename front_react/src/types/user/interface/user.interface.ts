export default interface User {
    usedId : number;
    email : string;
    name : string;
    tel : string;
    zipCode : string;
    addressBase : string;
    addressDetail : string | null;
    role : 'User';
    status : 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}