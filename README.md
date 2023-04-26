# AI NFT Generator

![ai](https://user-images.githubusercontent.com/122118470/234561357-c5a557d3-a8a7-41fa-8047-f9ab2851f218.jpg)


## Tools & REQUIREMENTS

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [NFT.Storage](https://nft.storage/) (Connection to IPFS)
- [Hugging Face](https://huggingface.co/) (AI Models)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/)

## Setting Up
### 1. Clone Repository & install dependencies

```
git clone https://github.com/yandmch/AI-NFT-Generator.git
cd ai-nft-generator
yarn install
```


### 2. Run a local network in the first terminal:

```
yarn chain
```

### 3. On a second terminal, deploy the nft contract:

```
yarn deploy
```

### 4. Setup .env file:
Navigate to `packages/nextjs/`
Before running any scripts, create a .env.development file with the following values (see .env.example):

- **REACT_APP_HUGGING_FACE_API_KEY=""**
- **REACT_APP_NFT_STORAGE_API_KEY=""**

Create an account on [Hugging Face](https://huggingface.co/), visit your profile settings, and create a read access token. 

Create an account on [NFT.Storage](https://nft.storage/), and create a new API key.



### 5. On a third terminal, start your NextJS app:

```
yarn start
```


### 6. Verify your smart contract

You can verify your smart contract on Etherscan by running:

```
yarn verify --network network_name
```

