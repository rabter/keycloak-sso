import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Keycloak from 'keycloak-js'

//const app = createApp(App)

//app.use(router)

//app.mount('#app')

const keycloak = new Keycloak({
  url: 'https://keycloak.com:30443',
  realm: 'PAAS',
  clientId: 'spero',
})

keycloak.init({ 
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false
 }).then(authenticated => {
  if (authenticated) {
    console.log('로그인 성공(spero)');
    const app = createApp(App)
    app.config.globalProperties.$keycloak = keycloak
    app.use(router)
    app.mount('#app')
  } else {
    console.log('로그인 실패(spero) 후 keycloak.login() 호출')
    keycloak.login({
      redirectUri: window.location.href
    })
  }
})