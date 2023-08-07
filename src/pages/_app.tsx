
import React, { Component, useEffect, useState } from 'react'
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.min.css';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { zkSync, zkSyncTestnet} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import Layout from './layout';
import Navbar from "../components/navbar";
import AppNavbar from "../components/App/AppNavbar";

//css
import '../style/navbar.css'
import '../style/Appnavbar.css'

const { chains, publicClient } = configureChains(
    [ zkSyncTestnet],
    [
      // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
      publicProvider()
    ]
  );
  
  const { connectors } = getDefaultWallets({
    appName: 'star prize pool',
    projectId: '6a54ec01d5ab72d9ca6bf21a9228df06',
    chains
  });
  
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })

interface MyappProps {
    Component: React.FunctionComponent<any>,
    pageProps: any
}

export default function Myapp({ Component, pageProps }: MyappProps) {
  
  const walletName = 'Wallet';
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 844);
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // 初始化检查一次
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>  
      <Head>
          <link rel="icon" type="image/x-icon" href="/StarPrizePool.png" /> 
      </Head>
      <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider 
          chains={chains} theme={darkTheme({
              accentColor:'linear-gradient(270deg, rgb(51, 212, 250) 0%, rgb(23, 243, 221) 100%)',
              accentColorForeground:'black'
          })}
          initialChain={zkSyncTestnet}>
            {isSmallScreen ? <AppNavbar walletName={walletName} /> :<Navbar /> }
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </RainbowKitProvider>
      </WagmiConfig>
        
    </>
    
  )
}
