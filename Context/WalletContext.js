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

    //GET OWNER
    const getAllOwners = async()=>{
        try {
            const contract = await connectWithContract();
            const ownerAddress = await contract.getOwners();
            console.log(ownerAddress);
            setOwnersAddress(ownerAddress);

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
    const submit = async () => {
        try {
            const 
            const contract = await connectWithContract();
            const submitData = await contract.submitTransaction();
            
            submitData.wait();
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <WalletSignatureContext.Provider value={{getAllOwners, transactionData, title}}>
            {children}
        </WalletSignatureContext.Provider>
    );
};