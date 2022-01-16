import { Button, Form, Modal, Input, Card, Row, Col, InputNumber, Select, Typography } from "antd";
import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Address, AddressInput } from "../components";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import axios from "axios";
import fs from "fs";

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
const { Option } = Select;
const livePeerAPIKey = "d1dd765f-a697-430b-9f99-7a12e92abc17";


export default function Hints({ yourLocalBalance, mainnetProvider, price, address }) {
  async function createStream(name) {
    const options = {
      method: 'POST',
      url: 'https://livepeer.com/api/stream',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${livePeerAPIKey}`,
      },
      data: {
        name,
        profiles: [
          {
            name: '720p',
            bitrate: 2000000,
            fps: 30,
            width: 1280,
            height: 720,
          },
          {
            name: '480p',
            bitrate: 1000000,
            fps: 30,
            width: 854,
            height: 480,
          },
          {
            name: '360p',
            bitrate: 500000,
            fps: 30,
            width: 640,
            height: 360,
          },
        ],
      },
    };
  
    const apiResponse = await axios.request(options);
    return apiResponse;
  };
  const covalentClient = axios.create({
    auth: {
      username: covalentAPIKey,
      password: ''
    }
  });
  async function getNFTMetadata(values) {
    try {
       const result = await covalentClient.get(`https://api.covalenthq.com/v1/1/tokens/${values.user.contractAddress}/nft_metadata/${values.user.tokenID}/`);
       let nftData = (result.data.data.items[0]);
       console.log(nftData);
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
 

  async function compoundFunction(values) {
    await getNFTMetadata(values);
    onFinish(values);
  }
  
  async function onFinish(values) {
    console.log(`${values.chain}`.toLocaleLowerCase());
  }


  return (

    <div style={{padding: 16, width: "80%", margin: "auto", marginTop: 32 }}>
    <Card style={{ marginTop: 32 }}>
      <Form {...layout} name="nest-messages" onFinish={compoundFunction} validateMessages={validateMessages}>
        <Form.Item
          name={["user", "contractAddress"]}
          label="Contract Address"
          rules={[
          {
              required: true
          }
          ]}
        >
          <AddressInput style={{color: "green"}} placeholder = "Please enter NFT's contract address" />
        </Form.Item>
        <Form.Item
          name={["user", "tokenID"]}
          label="Token ID"
          rules={[
          {
              type: "number",
              required: true
          }
          ]}
        >
          <InputNumber />
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
    </Card>
    <br />
    <br />
    <a href = "https://app.pinata.cloud/pinmanager" target="_blank">
      <Button type="primary"> Upload NFT Details to IPFS </Button>
    </a>
    <br />
    <br />
    <a href = "https://testnet.bridge.hmny.io/erc1155" target="_blank">
      <Button type="primary"> Bridge your NFT </Button>
    </a>
  </div>    
  );
}
