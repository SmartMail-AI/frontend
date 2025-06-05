import { useEffect } from 'react';
import { saveToken } from './utils/storage';

export default function LoginResultPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if(token) {
      saveToken(token);
    }
    window.location.href = '/';
  }, []);

  return null;
}
