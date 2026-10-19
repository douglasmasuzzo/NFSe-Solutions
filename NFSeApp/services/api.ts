import axios from 'axios';

// IMPORTANTE: nunca usar "localhost" aqui — num dispositivo físico ou no
// emulador, "localhost" aponta para o próprio aparelho, não para a máquina
// que está rodando `php artisan serve`. Configure EXPO_PUBLIC_API_URL no
// arquivo .env com o IP da sua máquina na rede local (veja .env.example).
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.10:8000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

export default api;
