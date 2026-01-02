// apis/core/errorHandler.ts

/*
  errorHandler.ts
  --------------------
  API 통신 중 발생하는 에러를
  공통 포맷으로 정리하기 위한 유틸 함수
*/

import axios from 'axios';

export function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error('API Error:', error.response?.data);
  } else {
    console.error('Unknown Error:', error);
  }

  throw error;
}