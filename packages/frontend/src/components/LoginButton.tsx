'use client';

import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

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