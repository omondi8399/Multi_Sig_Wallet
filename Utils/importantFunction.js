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



export const checkIfWalletConnect = async () => {
    try {
        if (!window.ethereum) return console.log("Install Wallet");

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        const userAccount = accounts[0];
        return userAccount;
    } catch (error) {
        console.log(error);
    }
};

export const connectWallet = async () => {
    try {
        if (!window.ethereum) return console.log("Install Wallet");

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        const userAccount = account[0];
        return userAccount;
    } catch (error) {
        console.log(error);
    }
};

export const uploadToIPFS = async (data) => {
    try {
        const addData = await client.add({content: data});
        const url = `${subdomain}/ipfs/${addData.path}`;
        return url;

    } catch (error) {
        console.log(error);
    }
}