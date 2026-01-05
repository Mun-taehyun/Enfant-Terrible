export default interface User {
    usedId : number;
    email : string;
    role : 'User' | 'Admin';
}