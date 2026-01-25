'use client';

import { PrivyProvider } from '@privy-io/react-auth';

// Export the PrivyProvider component with configuration
export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
      config={{
        appearance: {
          theme: 'dark' as const,
          accentColor: '#6366f1',
          loginMessage: 'Sign in to Star Factor',
          showWalletLoginFirst: false,
        },
        loginMethods: ['email', 'google'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
