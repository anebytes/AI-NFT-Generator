import { useState } from "react";
import Head from "next/head";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import axios from "axios";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { File, NFTStorage } from "nft.storage";
import { useContract, useProvider } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Spinner } from "~~/components/Spinner";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [url, setURL] = useState(null);

  const [message, setMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const provider = useProvider();
  // const account = getAccount();
  let contractAddress: any;
  let contractABI: any;

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("YourContract");
  if (deployedContractData) {
    ({ address: contractAddress, abi: contractABI } = deployedContractData);
  }

  const nftContract = useContract({
    address: contractAddress,
    abi: contractABI,
    signerOrProvider: provider,
  });

  const submitHandler = async e => {
    e.preventDefault();

    if (name === "" || description === "") {
      window.alert("Please provide a name and description");
      return;
    }

    setIsWaiting(true);

    const imageData = await createImage();

    const url = await uploadImage(imageData);

    await mintImage(url);

    setIsWaiting(false);
    setMessage("");
  };

  const createImage = async () => {
    setMessage("Generating Image...");

    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`;

    try {
      console.log("generating image");

      const response = await axios({
        url: URL,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          inputs: description,
          options: { wait_for_model: true },
        }),
        responseType: "arraybuffer",
      });
      const type = response.headers["content-type"];
      const data = response.data;

      const base64data = Buffer.from(data).toString("base64");
      const img = `data:${type};base64,` + base64data;
      setImage(img);

      return data;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const uploadImage = async imageData => {
    setMessage("Uploading Image...");

    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
    });

    try {
      console.log("uploading image");

      const { ipnft } = await nftstorage.store({
        image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
        name: name,
        description: description,
      });

      // Save the URL
      const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;
      setURL(url);

      return url;
    } catch (error) {
      console.log(error);
    }
  };

  const mintImage = async tokenURI => {
    try {
      setMessage("Minting NFT...");
      console.log("minting image");

      const config = await prepareWriteContract({
        address: nftContract?.address,
        abi: contractABI,
        functionName: "mint",
        args: [tokenURI],
        overrides: {
          value: ethers.utils.parseUnits("0.1", "ether"),
        },
      });
      const transaction = await writeContract(config);

      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>AI NFTs</title>
        <meta name="description" content="AI NfTs with 🏗 scaffold-eth-2" />
      </Head>

      <div className="flex items-center md:flex-row flex-col mt-10 pt-10 gap-8 justify-center px-10">
        <form className="flex flex-col gap-3" onSubmit={submitHandler}>
          <input
            className="input"
            type="text"
            placeholder="enter nft name"
            onChange={e => {
              setName(e.target.value);
            }}
          />
          <input
            className="input"
            type="text"
            placeholder="enter nft description"
            onChange={e => {
              setDescription(e.target.value);
            }}
          />
          <input
            className={`btn btn-primary rounded-full capitalize font-normal font-white  flex items-center gap-1 hover:gap-2 transition-all tracking-widest`}
            type="submit"
            value="Create & Mint"
          />
          {!isWaiting && url && (
            <button
              className={`btn btn-primary rounded-full capitalize font-normal font-white  flex items-center gap-1 hover:gap-2 transition-all tracking-widest`}
            >
              <a href={url} target="_blank" rel="noreferrer"></a>
              View&nbsp; Metadata
              <ArrowTopRightOnSquareIcon className="h-1/3" />
            </button>
          )}
        </form>

        <div className="border-2 rounded-lg overflow-hidden flex justify-center items-center md:w-400 md:h-400 w-80 h-80">
          {!isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="flex flex-row items-center">
              <Spinner />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
