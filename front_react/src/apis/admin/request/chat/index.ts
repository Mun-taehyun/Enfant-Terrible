// request
export type { default as ChatListRequest } from './ChatListRequest';
export type { default as ChatDetailRequest } from './ChatDetailRequest';
export type { default as ChangeChatStatusRequest } from './ChangeChatStatusRequest';

/* “파일 하나엔 타입 하나만 두고 싶어서 default로 만들었고,
여러 개를 한 번에 쓰기 좋게 index.ts에서 다시 묶어서 사용 ”*/