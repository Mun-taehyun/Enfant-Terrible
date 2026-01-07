import axios from 'axios';

// type imports (DTO)
import type ChangeChatStatusRequest
  from './request/chat/ChangeChatStatusRequest';

import type ChatListRequest
  from './request/chat/ChatListRequest';

import type ChatDetailResponse
  from './response/chat/ChatDetailResponse';

import type ChatListResponse
  from './response/chat/ChatListResponse';

const adminAxios = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 채팅 목록 조회
 */
export const getChatList = async (
  params?: ChatListRequest
): Promise<ChatListResponse[]> => {
  const res = await adminAxios.get('/chats', { params });
  return res.data;
};

/**
 * 채팅 상세 조회
 */
export const getChatDetail = async (
  chatId: number
): Promise<ChatDetailResponse> => {
  const res = await adminAxios.get(`/chats/${chatId}`);
  return res.data;
};

/**
 * 채팅 상태 변경
 */
export const changeChatStatus = async (
  chatId: number,
  data: ChangeChatStatusRequest
): Promise<void> => {
  await adminAxios.patch(`/chats/${chatId}/status`, data);
};
