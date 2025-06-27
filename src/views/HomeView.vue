<script setup>
import { inject } from 'vue'
import { useSecureAxios } from '@/api/axios';

const keycloak = inject('keycloak') // main.js에서 globalProperty로 주입한 인스턴스
console.log('Keycloak 인스턴스:', keycloak);

const logout = () => {
  console.log('logout button click!');
  keycloak?.logout({
    redirectUri: window.location.origin // 로그아웃 후 돌아올 주소
  })
}

const callBackendApi = async () => {
  const axios = useSecureAxios(keycloak)

  try {
    const res = await axios.get('/billings')
    console.log('백엔드 응답: ', res.data)
  } catch (err) {
    console.error('백엔드 호출 실패:', err)
  }
}

</script>

<template>
  <div>
    <h1>Hello SPERO</h1>
    <h2>Keycloak 테스트</h2>
    <button @click="callBackendApi">✅ 백엔드 API 호출</button>
    <button @click="logout">🚪 로그아웃</button>
  </div>
</template>
