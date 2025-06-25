import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'https://keycloak.com:30443',
  realm: 'PAAS',
  clientId: 'spero',
})

keycloak.init({ 
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false
 }).then(async authenticated => {
   if (!authenticated) {
     console.warn('로그인 실패(spero), 재시도');
     return keycloak.login({ redirectUri: window.location.href });
   }
   
   console.log('로그인 성공(spero)');

   const profile = await keycloak.loadUserProfile();
   console.log('사용자 정보:', profile);

   // 세션 감시 시작
   startSessionValidationScheduler(keycloak);

   // 토큰 확인
   console.log('accessToken:', keycloak.token);
   console.log('refreshToken:', keycloak.refreshToken);

   // 토큰 갱신 주기 시작
   startTokenRefreshScheduler(keycloak);

   const app = createApp(App);

   // 토큰을 글로벌 등록 (optional)
   app.config.globalProperties.$keycloak = keycloak;

   // Router 사용
   app.use(router);

   app.mount('#app');
 }).catch(error => {
   console.error('Keycloak 초기화 실패:', error);
 });

 const startTokenRefreshScheduler = (keycloakInstance) => {
    setInterval(async () => {
        try {
            const refreshed = await keycloakInstance.updateToken(30); // 30초 전에 토큰 갱신
            if (refreshed) {
                console.log('토큰 갱신 성공');
            } else {
                console.log('토큰 아직 유효');
            }
        } catch (error) {
            console.error('토큰 갱신 실패, 재로그인 유도:', error);
            keycloakInstance.login();
        }
    }, 10 * 1000); // 10초 간격으로 검사
 }

 export const startSessionValidationScheduler = (keycloakInstance) => {
    setInterval(async () => {
      try {
        await keycloakInstance.loadUserProfile();
        console.log('세션 유효함');
      } catch (e) {
        console.warn('세션 만료 또는 무효함 -> 재로그인 시도');
        keycloakInstance.login(); // 또는 keycloakInstance.logout()
      }
    }, 60 * 1000);
 };