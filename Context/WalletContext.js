import React, { useState, useEffect, useContext } from 'react'
import Web3Modal from 'web3modal';
import { ethers, Signer } from 'ethers';
import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client';

const projectId = " your project Id here..";
const projectSecretKey = "project key";
const auth = ` Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString("base64")}`;

const subdomain = "Your sub domain here";

const client = ipfsHttpClient({
    host: "infura-ipfs.io",
    part: 5001,
    protocol: "https",
    headers: {
        authorization: auth,
    },
});

//INTERNAL IMPORT
import { walletAddress, walletABI } from './constants';
import { checkIfWalletConnect, connectWallet, uploadIPFS} from '../Utils/importantFunction.js'

//FETCH CONTRACT FUNCTION
const fetchContract = (signerOrProvider) => new ethers.Contract(walletAddress, walletABI, signerOrProvider);

//Connecting with contract
const connectWithContract = async () => {
    try {
        const web3modal = new Web3modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        return contract;
    } catch (error) {
        console.log(error);
    }
}

export const WalletSignatureContext = React.createContext();

export const WalletSignatureProvider = ({children})=> {

    const title = "Multi Signature Wallet";

    //STATE VARIABLE
    const [ownersAddress, setOwnersAddress] = useState([]);
    const [ownerCount, setOwnerCount] = useState("");
    const [allTransaction, setAllTransaction] = useState([]);
    const [currentAccount, setCurrentAccount] = useState("")

    //GET OWNER
    const getAllOwners = async()=>{
        try {
            const contract = await connectWithContract();
            const ownerAddress = await contract.getOwners();
            console.log(ownerAddress);
            setOwnersAddress(ownerAddress);
            // GET CURRENT ACCOUNT 
            const acc = await checkIfWalletConnect()
            console.log(acc);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllOwners();
    },[]);

    //GET TRANSACTION DATA
    const transactionData = async () => {
        try {
            const contract = await connectWithContract();
            const transaction = contract.getTransaction();
            const formateTransaction = transaction.map((trans) => ({
                addressFrom: trans.to,
                transAmount: trans.value,
                data: trans.data,
                executed: trans.executed,
                numConfirmations: trans.numConfirmations,
            }));
            setAllTransaction(formateTransaction);
        } catch (error) {
            console.log(error);
        }
    }

    //SUBMIT TRANSACTION
    const submit = async ( address, amount, data) => {
        try {
            const address = "0xjieijwf31k0k20232krif31kdkeidj10kf5788";
            const amount = ethers.utils.parseEther(5) ;
            const data = "0x";

            const contract = await connectWithContract();
            const submitData = await contract.submitTransaction(currentAccount, amount, data,{gasLimit: "0x5208",});
            
            submitData.wait();
            console.log(submitData)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=> {
        submit();
    }, [])

    return(
        <WalletSignatureContext.Provider value={{getAllOwners, transactionData, title}}>
            {children}
        </WalletSignatureContext.Provider>
    );
};