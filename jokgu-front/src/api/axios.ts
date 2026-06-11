import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 모든 요청에 토큰 추가
instance.interceptors.request.use(config => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

instance.interceptors.response.use(
    response => response,
    error => {
      const message = error.response?.data?.message || "오류가 발생했습니다";
      if (error.response?.status === 401) {
        sessionStorage.clear();
        window.location.href = '/login';
    }
      return Promise.reject(new Error(message));
    }
  )


export default instance;