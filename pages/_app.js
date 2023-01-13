import '@/styles/globals.css'

import { WalletSignatureProvider } from '../Context/WalletContext';

const MyApp = ({ Component, pageProps }) (
    <WalletSignatureProvider>  
      <Component {...pageProps} />;
    </WalletSignatureProvider>
) ;

export default MyApp;

