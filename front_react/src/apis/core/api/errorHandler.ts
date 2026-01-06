import axios from 'axios';

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

interface ServerErrorResponse {
  code?: string;
  message?: string;
}

export function handleApiError(error: unknown): never {
  if (axios.isAxiosError<ServerErrorResponse>(error)) {
    const apiError: ApiError = {
      code:
        error.response?.data?.code ?? 'API_ERROR',
      message:
        error.response?.data?.message ??
        '서버 통신 중 오류가 발생했습니다.',
      status: error.response?.status,
    };

    throw apiError;
  }

  throw {
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다.',
  } as ApiError;
}
