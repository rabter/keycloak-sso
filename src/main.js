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

   // 토큰 확인
   console.log('accessToken:', keycloak.token);
   console.log('refreshToken:', keycloak.refreshToken);

   const app = createApp(App);

   // 토큰을 글로벌 등록 (optional)
   app.config.globalProperties.$keycloak = keycloak;

   // Router 사용
   app.use(router);

   app.mount('#app');
 }).catch(error => {
   console.error('Keycloak 초기화 실패:', error);
 });