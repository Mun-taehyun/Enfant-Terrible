// src/apis/admin/adminchat.api.ts
import axios from 'axios';

// 타입 임포트 (기존 유지)
import type ChatListRequest from './request/chat/ChatListRequest';
import type ChatDetailResponse from './response/chat/ChatDetailResponse';
import type ChatListResponse from './response/chat/ChatListResponse';

const adminAxios = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 1. 채팅 목록 조회 (getChatRooms로 이름 변경 또는 추가)
 */
export const getChatRooms = async (
  params?: ChatListRequest
): Promise<ChatListResponse[]> => {
  const res = await adminAxios.get('/chats', { params });
  return res.data;
};

/**
 * 2. 채팅 상세 조회 (getChatMessages로 이름 변경 또는 추가)
 * useChatQuery에서는 roomId(string)를 인자로 사용하므로 타입을 맞춥니다.
 */
export const getChatMessages = async (
  roomId: string 
): Promise<ChatDetailResponse> => {
  const res = await adminAxios.get(`/chats/${roomId}`);
  return res.data;
};

/**
 * 3. 메시지 전송 (sendChatMessage 추가)
 * useChatQuery에서 요구하는 형식으로 작성합니다.
 */
export const sendChatMessage = async (
  data: { roomId: string; message: string }
): Promise<void> => {
  // 백엔드 엔드포인트에 맞춰 수정하세요 (예: /chats/send 또는 /chats/${data.roomId}/message)
  await adminAxios.post('/chats/send', data);
};

// 기존에 사용하던 이름이 있다면 유지 (선택사항)
export const getChatList = getChatRooms;
export const getChatDetail = getChatMessages;