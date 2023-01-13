import React, {useState,useEffect, useContext} from 'react'
import { WalletSignatureContext } from '../Context/WalletContext'

const index = () => {

  const {title} = useContext(WalletSignatureContext);
  return <div>{title}</div>;
};

export default index