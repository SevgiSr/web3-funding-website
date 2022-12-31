import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const FundContext = React.createContext();

//can access window object on fronend
//metamask injects ethereum object into window object in the search engine
const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const fundContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return fundContract;
};

export const FundProvider = ({ children }) => {
  const [formData, setFormData] = useState({ amount: "" });
  const [isLoading, setIsLoading] = useState(false);
  //currentAccount is only for dissappearing "connect" button if you're already connected
  //metamask already knows which account is calling functions once ure connected
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isEnoughFund, setIsEnoughFund] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // make "connect" button dissappear if connected account exists
  //      -with use effect it'll fill currentAccount at the every beginning of lifetime of the component
  const checkIfWalletIsConnect = async () => {
    if (!ethereum) return alert("Please install MetaMask.");
    try {
      //request connected accounts
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //when you click "connect" button
  const connectWallet = async () => {
    if (!ethereum) return alert("Please install MetaMask.");
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      console.log("connected!");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendFund = async () => {
    if (!ethereum) return alert("please install metamask");
    const { amount } = formData;
    const fundContract = createEthereumContract();
    const provider = new ethers.providers.Web3Provider(ethereum);
    try {
      // I DONT need to pass "from" parameter. when you connect account to website, metamask will handle this
      const transactionResponse = await fundContract.fund({
        value: ethers.utils.parseEther(amount),
      });
      // you can do transactionResponse.wait(1), but this is better
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
      setIsEnoughFund(false);
    }
  };

  const withdraw = async () => {
    console.log("withdrawing");
    if (!ethereum) return alert("please install metamask");
    const fundContract = createEthereumContract();
    const provider = new ethers.providers.Web3Provider(ethereum);

    try {
      const transactionResponse = await fundContract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  };

  /////////////BLOCK CONFIRMATION/////////////////////
  const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
      try {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
          console.log(
            `Completed with ${transactionReceipt.confirmations} confirmations. `
          );
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  return (
    <FundContext.Provider
      value={{
        currentAccount,
        isLoading,
        connectWallet,
        sendFund,
        withdraw,
        handleChange,
        formData,
        isOwner,
        isEnoughFund,
      }}
    >
      {children}
    </FundContext.Provider>
  );
};
