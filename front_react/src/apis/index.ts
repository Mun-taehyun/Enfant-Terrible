import axios from "axios";

const API_DOMAIN = "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL: API_DOMAIN,
  timeout: 10000,
//baseURL , timeout 
//baseURL : 
//timeout : 밀리초를 기준 (10000 = 10초)로 하며 10초가 지나면 서버요청 실패 => error.response
});



// 요청 인터셉터 (accessToken 자동)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData면 Content-Type 제거
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// 응답 인터셉터 (응답 데이터 , 코드에 맞는 자동 응답처리코드)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("네트워크 오류"));
    } // Promise.reject은 응답이 실패 했을 때 사용 되는 함수

    const status = error.response.status;
    let message: string;

    switch (status) {
      case 400: message = "잘못된 요청입니다."; break;
      case 401: message = "로그인이 필요합니다."; break;
      case 403: message = "권한이 없습니다."; break;
      case 404: message = "요청하신 리소스를 찾을 수 없습니다."; break;
      case 405: message = "허용되지 않은 요청 방식입니다."; break;
      case 409: message = "데이터 충돌이 발생했습니다."; break;
      case 422: message = "데이터 형식이 올바르지 않습니다."; break;
      case 429: message = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."; break;
      case 500: message = "서버 내부 오류가 발생했습니다."; break;
      case 502: message = "게이트웨이 오류가 발생했습니다."; break;
      case 503: message = "서비스가 일시적으로 중단되었습니다."; break;
      case 504: message = "서버 응답 시간이 초과되었습니다."; break;
      default: message = `알 수 없는 오류가 발생했습니다. [${status}]`; break;
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;