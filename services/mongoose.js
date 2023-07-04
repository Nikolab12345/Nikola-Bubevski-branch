// Import required libraries
const Web3 = require('web3');
const config = require('../config');
const dbUrl = config.dbUrlMongoDB;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true }, // To avoid deprecated options
  (err) => {
    if (err) console.log('Error', err);
    else console.log('Mongodb connected');
  }
);

// Define a schema for storing wallet addresses
const walletSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  }
});

// Create a model for the wallet schema
const Wallet = mongoose.model('Wallet', walletSchema);
const app = express();
app.use(bodyParser.json());

// Define the endpoint for the signing process using MetaMask
app.post('/sign', async (req, res) => {
  try {
    const { transaction, walletAddress, text } = req.body;
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] !== walletAddress) {
      throw new Error('Invalid wallet address');
    }
    const signedTransaction = await web3.eth.personal.sign(transaction, accounts[0]);
    const wallet = new Wallet({ address: walletAddress });
    await wallet.save();
    res.send({ signedTransaction });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = mongoose;