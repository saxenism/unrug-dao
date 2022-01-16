import { Button, Form, Modal, Input, Card, Row, Col, InputNumber, Select, Typography } from "antd";
import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Address, AddressInput } from "../components";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import axios from "axios";

const {Option} = Select;
const {Meta} = Card;
const {Paragraph} = Typography;

const covalentAPIKey = "ckey_b6aa47493b8648339e1913eea4a";
const nftPortAPIKey = "4a448f5d-98ab-42a7-bb26-a7f40f57e501";
const chainOptions = ['Ethereum', 'Polygon', 'Tezos'];

const layout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  },
  initialValues: {
      size: "large",
  },
};

const validateMessages = {
  required: "${label} is required!",
  types: {
    email: "${label} is not a valid email!",
    number: "${label} is not a valid number!"
  },
  number: {
    range: "${label} must be between ${min} and ${max}"
  }
};

function Home() {
  const [nftDetailsArray, setNftDetailsArray] = useState([]);
  const covalentClient = axios.create({
    auth: {
      username: covalentAPIKey,
      password: ''
    }
  });

  async function getNFTMetadata() {
    try {
       const result = await covalentClient.get(`https://api.covalenthq.com/v1/1/tokens/0xaa74955674127e98e6ce30f65b676f18c5176f7b/nft_metadata/126/`);
       console.log(result);
    }catch (error) {
      if (error.response) {
        console.log('api response error', error.response);
        if (error.response.data) {
          return error.response.data.error_message;
        }
        return error.response;
      } else if (error.request) {
        console.log('api request error', error.request);
        return error.request;
      } else {
        console.log('unexpected api error', error.message);
        return error.message;
      }
    }
  }
 
  async function fetchNFTs(values) {
    const nftChain = (values.chain).toLowerCase();
    const options = {
      method: 'GET',
      url: `https://api.nftport.xyz/v0/accounts/${values.user.walletAddress}`,
      params: {
        chain: `${nftChain}`,
        include: 'metadata',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: nftPortAPIKey
      }
    }

    const userNFTs = await axios.request(options);
    if(userNFTs) {
      setNftDetailsArray([]);
      let userNFTInfoArr = [];
      let userNFTQuantity = userNFTs.data.nfts.length;
      for(let i = 0; i < userNFTQuantity; i++) {
        let nftAddress = userNFTs.data.nfts[i].contract_address;
        let nftTokenID = userNFTs.data.nfts[i].token_id;
        let nftName = userNFTs.data.nfts[i].name;
        let nftCreatorAddress = userNFTs.data.nfts[i].creator_address;
        let nftImage = userNFTs.data.nfts[i].cached_file_url;
        let nftDescription = userNFTs.data.nfts[i].description;
        let nftMedia;
        if(nftImage) {
          nftMedia = nftImage;
        } else {
          if(userNFTs.data.nfts[i].metadata.animation_url) {
            nftMedia = userNFTs.data.nfts[i].metadata.animation_url;
          } else {
            nftMedia = "https://mediacloud.kiplinger.com/image/private/s--X-WVjvBW--/f_auto,t_content-image-full-desktop@1/v1620225658/Investing/nft-2021.jpg";
          }
        }
        
  
        let nftObject = {
          "nftAddress": nftAddress,
          "nftTokenID": nftTokenID,
          "nftName": nftName,
          "nftCreatorAddress": nftCreatorAddress,
          "nftMedia": nftMedia, 
          "nftDescription": nftDescription,
        }
        console.log(nftObject);
        userNFTInfoArr.push(nftObject);
      }
      console.log(nftDetailsArray);
      setNftDetailsArray([...userNFTInfoArr]);
    } else {
      console.log(userNFTs.error);
    }
  }
  
  async function compoundFunction(values) {
    await fetchNFTs(values);
    onFinish(values);
  }
  
  async function onFinish(values) {
    //console.log(values.user.walletAddress);
    console.log(`${values.chain}`.toLocaleLowerCase());
  }
 
  return (
    <div style={{padding: 16, width: "80%", margin: "auto", marginTop: 32 }}>
      <Card style={{ marginTop: 32 }}>
        <Form {...layout} name="nest-messages" onFinish={compoundFunction} validateMessages={validateMessages}>
          <Form.Item
            name={["user", "walletAddress"]}
            label="Wallet Address"
            rules={[
            {
                required: true
            }
            ]}
          >
            <AddressInput style={{color: "green"}} placeholder = "Please enter your wallet address" />
          </Form.Item>
          <Form.Item
            name="chain"
            label="Select NFT Chain"
            rules={[
            {
                required: true,
                message: `Please select your NFT's chain!`,
            },
            ]}
          >
            <Select style={{color: "green"}} placeholder="Please select your NFT Chain!">
                {chainOptions.map(n => <Option value = {n}> {n} </Option>)}
            </Select>
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <br/>
        <br/>
        <h1>Your NFT Gallery</h1>
            <div style={{padding: "30px"}}>
              <Row gutter={16}>
                {
                  nftDetailsArray.map(nftInfo =>
                    <Col span={8}>
                      <Card title={<Paragraph copyable>{nftInfo.nftName}</Paragraph>}
                        hoverable = {true}
                        bordered = {true}
                        cover = {<img alt={nftInfo.nftName} src={nftInfo.nftMedia} />}
                        size = "large"
                      >
                      <Meta title ="NFT Address: " description = {(nftInfo.nftAddress)}/>
                      <br />
                      <Meta title ="NFT Token ID: " description = {nftInfo.nftTokenID}/>
                      <br />
                      <Meta title ="Description: " description = {(nftInfo.nftDescription)}/>
                      </Card>
                    </Col>  
                  )
                }
              </Row>
            </div>
      </Card>
    </div>
  );
}

export default Home;
