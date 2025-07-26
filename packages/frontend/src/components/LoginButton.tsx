'use client';

import { GoogleLogin } from '@react-oauth/google';

interface LoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
}

export default function LoginButton({ onSuccess, onError }: LoginButtonProps) {
  return (
    <GoogleLogin
      onSuccess={(response) => {
        if (response.credential) {
          onSuccess(response.credential);
        }
      }}
      onError={() => {
        console.error('Login failed');
        onError?.();
      }}
      text="signin_with"
      shape="pill"
      size="large"
    />
  );
}