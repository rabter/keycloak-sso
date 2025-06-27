import axios from 'axios'
import { inject } from 'vue'

export function useSecureAxios(keycloak) {
    console.log('Keycloak 인스턴스[useSecureAxios]:', keycloak);
    const instance = axios.create({
        baseURL: 'https://localhost:8443/api',
        timeout: 5000
    })

    instance.interceptors.request.use(async (config) => {
        try {
            await keycloak.updateToken(5) // 5초 이내 만료 예정이면 갱신
        }  catch (e) {
            console.warn('토큰 갱신 실패 -> 강제 로그아웃')
            keycloak.logout()
            return Promise.reject(e)
        }

        config.headers.Authorization = `Bearer ${keycloak.token}`
        return config
    })

    return instance
}