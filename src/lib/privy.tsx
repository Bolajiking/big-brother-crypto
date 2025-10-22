'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

// Export the PrivyProvider component with configuration
export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
      config={{
        appearance: {
          theme: 'light' as const,
          accentColor: '#676FFF',
          loginMessage: 'BigBrotherCrypto',
          showWalletLoginFirst: true,
          walletChainType:"solana-only"
        },
        externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
        loginMethods: ['wallet', 'email'],
        embeddedWallets: {
          // createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
