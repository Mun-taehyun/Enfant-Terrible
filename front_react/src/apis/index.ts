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

    return Promise.reject(new Error(error.response?.data?.message ?? "요청 처리 중 오류가 발생했습니다."));
      //데이터가 깨졌다면 "요청 처리 중 오류 발생"
  }
);

export default apiClient;