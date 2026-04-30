import React from 'react';
import type { AppProps } from 'next/app';
import 'antd/dist/antd.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}