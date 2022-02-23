import React, { Component } from "react"
import ConnectButton from '../UIElements/ConnectButton';
import { Button , Alert } from "react-bootstrap";
import Web3 from "web3";
import {NFTContractAddress, TokenContractAddress, ERC721OrderFeatureAddress, marketOwner} from "../const/const.js";
import {NFTabi} from "../../artifacts/V4NFT.sol/V4NFT"
import {tokenABI} from "../../artifacts/V4Token.sol/V4Token"
import {ERC721OrderFeatureABI} from "../../artifacts/ERC721OrdersFeature.sol/ERC721OrdersFeature"

class Dashboard extends Component {
  state = {
    account : null,
    mintNFTId : null,
    toAddress : null,
    tranTokenValue : null,
    buyNFTId : null,
    buyTokenValue : null,
    sellNFTId : null,
    buyOrderMaker : null,
    buyOrderAmount : null,
    buyOrderExpiry: null,
  }

  componentDidMount() {
    console.log(NFTContractAddress);
    window.ethereum.request({ method: 'eth_requestAccounts'}).then((accounts) => {
      this.setState({account:accounts[0]});
    });
  }

  connect = async () => {
    console.log('connect',window.ethereum.isConnected())
    try {
      // Get network provider and web3 instance.
      // const web3 = await getWeb3();
  
      // // Use web3 to get the user's accounts.
      // const accounts = await web3.eth.getAccounts();
      // console.log('connect', accounts)
  
  
      // // Set web3, accounts, and contract to the state, and then proceed with an
      // // example of interacting with the contract's methods.
      // this.setState({ web3, accounts});
      
      // window.ethereum.on();
      window.ethereum.request({ method: 'eth_requestAccounts'}).then((accounts) => {
        this.setState({account:accounts[0]});
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  mintNFT = async () => {
    // console.log(this.state.mintNFTId, this.state.toAddress,this.state.tranTokenValue,this.state.buyNFTId,this.state.buyTokenValue,this.state.sellNFTId);
    var web3 = new Web3(window.ethereum);
    const instance = new web3.eth.Contract(NFTabi, NFTContractAddress);
    console.log(instance,this.state.account, this.state.mintNFTId);
    const res = await instance.methods.safeMint(this.state.account, this.state.mintNFTId).send({
      from: this.state.account
    });
    console.log(res)
  }

  TransToken = async() => {
    var web3 = new Web3(window.ethereum);
    const instance = new web3.eth.Contract(tokenABI, TokenContractAddress);
    console.log(instance,this.state.account, this.state.tranTokenValue);
    const res = await instance.methods.transfer(this.state.toAddress, this.state.tranTokenValue).send({
      from: this.state.account
    });
    console.log(res)   
  }
  
  makeBuyOffer = async() => {
    var web3 = new Web3(window.ethereum);

    const instance = new web3.eth.Contract(ERC721OrderFeatureABI, ERC721OrderFeatureAddress);
    console.log(instance);

    const instance1 = new web3.eth.Contract(NFTabi, NFTContractAddress);
    console.log(instance1);
    const take = await instance1.methods.ownerOf(this.state.buyNFTId).call();

    const instance2 = new web3.eth.Contract(tokenABI, TokenContractAddress);
    console.log(instance2);

    var totalFee = 10;

    const order = {
      direction : 1,
      maker : this.state.account,
      taker : take,
      expiry : 2222222222,
      nonce : 11,
      erc20Token : TokenContractAddress,
      erc20TokenAmount : this.state.buyTokenValue / 100 * 105,
      fees : [{
        recipient: marketOwner,
        amount: this.state.buyTokenValue / 105 * 10,
        feeData: "0x",
      }],
      erc721Token : NFTContractAddress,
      erc721TokenId : this.state.buyNFTId,
      erc721TokenProperties : []
    }

    console.log(order);

    await instance2.methods.approve(ERC721OrderFeatureAddress, this.state.buyTokenValue / 100 * 105).send({
      from : this.state.account
    });

    await instance.methods.preSignERC721Order(order).send({
      from : this.state.account
    });
  }

  confirmSell = async () => {
    var web3 = new Web3(window.ethereum);

    const instance = new web3.eth.Contract(ERC721OrderFeatureABI, ERC721OrderFeatureAddress);
    console.log(instance);
    const instance1 = new web3.eth.Contract(NFTabi, NFTContractAddress);
    console.log(instance1);

    const order = {
      direction : 1,
      maker : '0x1F4dE329818D2800cc32162D352DeD932DD34438',
      taker : this.state.account,
      expiry : 2222222222,
      nonce : 11,
      erc20Token : TokenContractAddress,
      erc20TokenAmount : this.state.buyTokenValue / 100 * 105,
      fees : [{
        recipient: marketOwner,
        amount: this.state.buyTokenValue / 105 * 10,
        feeData: "0x",
      }],
      erc721Token : NFTContractAddress,
      erc721TokenId : this.state.sellNFTId,
      erc721TokenProperties : []
    }

    console.log(order);
    const signature = {
      signatureType: 4,
      v: 0,
      r: '0x0000000000000000000000000000000000000000000000000000006d6168616d',
      s: '0x0000000000000000000000000000000000000000000000000000006d6168616d'
    };

    console.log(this.state.sellNFTId);
    const res = await instance.methods.validateERC721OrderSignature(order,signature).call();
    console.log(res);
    await instance1.methods.approve(ERC721OrderFeatureAddress, order.erc721TokenId).send({
      from : this.state.account
    });
    await instance.methods.sellERC721(order, signature, order.erc721TokenId, false, "0x").send({
      from : this.state.account
    });

  }

  setMintNFTId = (mintNFTId) => {console.log(mintNFTId); this.setState({mintNFTId});}

  setToAddress = (toAddress) => {this.setState({toAddress});}

  setTransTokenValue = (tranTokenValue) => {this.setState({tranTokenValue});}

  setBuyNFTId = (buyNFTId) => {this.setState({buyNFTId});}

  setBuyTokenValue = (buyTokenValue) => {this.setState({buyTokenValue});}

  setSellNFTId = (sellNFTId) => {this.setState({sellNFTId});}

  setBuyOrderMaker = (buyOrderMaker) => {this.setState({buyOrderMaker});}

  setBuyOrderAmount = (buyOrderAmount) => {this.setState({buyOrderAmount});}

  render() {
    return (
      <div>
        <div style={{diaply:'flex', marginTop:'50px',marginLeft : '50px'}}>
          <ConnectButton connect={this.connect} account={this.state.account} />
        </div>
        <div style={{diaply:'flex',marginTop:'50px'}}>
          <Alert variant="primary" >
            <p>
              You can set NFT ID and Mint your own NFT here.
              You can find the smart contract <Alert.Link href="https://ropsten.etherscan.io/address/0x94d1CE401E13289BB3215aDec4545e8Dc01f7ca7#code">here</Alert.Link>.
            </p>
          </Alert>
          <input type="number" placeholder="NFT ID"  style={{marginLeft:'50px'}} onChange={(e) => this.setMintNFTId(e.target.value)}/>
          <Button  style={{marginLeft:'50px'}} onClick = {this.mintNFT} >Mint</Button>
        </div>
        <div style={{diaply:'flex',marginTop:'10px'}}>
          <Alert variant="primary" >
            <p>
              You can transfer V4Tokens here.
              You can find the smart contract  <Alert.Link href="https://ropsten.etherscan.io/address/0xB1b5eA1D5946dF58Db50e136C1823BF2ECCFfA05#code">here</Alert.Link>.
            </p>
          </Alert>
          <input placeholder="To address"  style={{marginLeft:'50px'}} onChange={(e) => this.setToAddress(e.target.value)} />
          <input type="number" placeholder="Value"  style={{marginLeft:'50px'}} onChange={(e) => this.setTransTokenValue(e.target.value)}  />
          <Button  style={{marginLeft:'50px'}} onClick = {this.TransToken}>Trans</Button>
        </div>
        <div style={{diaply:'flex',marginTop:'10px'}}>
          <Alert variant="primary" >
            <p>
              You can make Buy offer of NFT here.
              Please type the NFT Id you want to buy and the amount of tokens that you can pay for that NFT.
            </p>
          </Alert>
          <input placeholder="NFT ID"  style={{marginLeft:'50px'}} onChange={(e) => this.setBuyNFTId(e.target.value)} />
          <input placeholder="amount of token"  style={{marginLeft:'50px'}} onChange={(e) => this.setBuyTokenValue(e.target.value)} />
          <Button  style={{marginLeft:'50px'}} onClick = {this.makeBuyOffer} >make buy offer</Button>
        </div>
        <div style={{diaply:'flex',marginTop:'10px'}}>
          <Alert variant="primary" >
            <p>
              You can Sell your NFT here.
              If there's a buy offer for your NFT ID's NFT, then you can sell it.
            </p>
          </Alert>
          <input placeholder="Maker"  style={{marginLeft:'50px'}} onChange={(e) => this.setBuyOrderMaker(e.target.value)} />
          <input placeholder="NFT ID"  style={{marginLeft:'50px'}} onChange={(e) => this.setSellNFTId(e.target.value)} />
          <input placeholder="Amount of token" type = "number" style={{marginLeft:'50px'}} onChange={(e) => this.setBuyOrderAmount(e.target.value)} />
          <Button  style={{marginLeft:'50px'}} onClick = {this.confirmSell}>Sell</Button>
        </div>
      </div>
    );
  }
}

export default Dashboard;