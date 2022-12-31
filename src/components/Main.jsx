import React, { useContext } from "react";

import { FundContext } from "../context/FundContext";

import "../assets/main.css";
import profilepic from "../assets/profilepic.jpg";

const Main = () => {
  const {
    currentAccount,
    connectWallet,
    handleChange,
    sendFund,
    formData,
    isLoading,
    withdraw,
    isOwner,
    isEnoughFund,
  } = useContext(FundContext);

  const { amount } = formData;

  const handleSubmit = (e) => {
    e.preventDefault();
    //if no amount, dont do anything
    if (!amount) return;
    //else, send

    sendFund();
  };

  return (
    <div className="wrapper">
      {!currentAccount && (
        <button id="connectWalletBtn" onClick={connectWallet}>
          connect wallet
        </button>
      )}

      <div className="about">
        <div id="profileImage">
          <img src={profilepic} alt="" />
        </div>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nulla optio
          deserunt eius impedit, maxime exercitationem ipsam provident dolor
          omnis dicta!
        </p>
      </div>
      <div className="fundWrapper">
        <input
          name="amount"
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => handleChange(e)}
        />

        <button id="fundBtn" onClick={handleSubmit}>
          Fund
        </button>
      </div>
      {!isEnoughFund && <p className="alert">Not enough funding!</p>}
      {!isOwner && (
        <button id="withdrawBtn" onClick={withdraw}>
          withdraw
        </button>
      )}
    </div>
  );
};

export default Main;
