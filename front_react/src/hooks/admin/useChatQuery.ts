// src/hooks/queries/admin/useChatQuery.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatRooms, getChatMessages, sendChatMessage } from '@/apis/admin/adminChat.api';

export const useChatQuery = {
  // 1. 채팅방 리스트 조회
  useGetRooms: () => {
    return useQuery({
      queryKey: ['admin', 'chats', 'rooms'],
      // 함수를 실행하지 않고 참조만 전달하거나, 화살표 함수 형태로 작성
      queryFn: () => getChatRooms(), 
    });
  },

  // 2. 메시지 내역 조회
  useGetMessages: (roomId: string) => {
    return useQuery({
      queryKey: ['admin', 'chats', 'messages', roomId],
      queryFn: () => getChatMessages(roomId),
      enabled: !!roomId,
    });
  },

  // 3. 메시지 전송
  useSendMessage: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: sendChatMessage,
      // variables의 타입을 명시해야 roomId 속성에 접근 가능함
      onSuccess: (_, variables: { roomId: string; message: string }) => {
        queryClient.invalidateQueries({
          queryKey: ['admin', 'chats', 'messages', variables.roomId]
        });
      },
    });
  }
};