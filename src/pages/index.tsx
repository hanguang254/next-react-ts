import React, { Component, use} from 'react'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import  {Provider,Contract,Web3Provider}from "zksync-web3";
import * as ethers from "ethers";
import { useContractWrite } from 'wagmi';
import TranABI from '../abi/TransferABI.json';

import { Input ,Button,notification} from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import type { NotificationPlacement } from 'antd/es/notification/interface';

import { useState,useEffect } from 'react';
import axios from 'axios';

const { TextArea } = Input;


declare global {
  interface Window {
    ethereum?:any;
  }

}



export default function Index() {
  
  const [value, setValue] = useState<any>(''); //金额
  const [addresslist,setaddesslist]= useState([]); //地址数组
  const [amountlist,setamountlist]= useState<any>([]); //金额数组


  const [addressinput,setaddressinput]= useState(true); //地址输入框是否为空
  const [amountinput,setamountinput]= useState<boolean>(true);//金额是否为空


  const [transferhash,settransferhash] =useState<any>();//交易hash
  const [transtatus,setTranstatus] = useState<any>(undefined); // 交易状态
  //金额输入框
  const handleChange = (event:any): void => {
    setamountinput(true);
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    setValue(numericValue);
    
  };

  //地址输入框为数组
  const handleaddressChange = (event:any): void => {
    setaddressinput(true);
    const inputValue = event.target.value;
    const addresses = inputValue.split('\n').map((address:any) => address.trim());
    setaddesslist(addresses);
  }

  function isEthAddressValid() {
    // 检查地址与金额是否为空
    if (addresslist.length === 0) {
      setaddressinput(false);
    }
    if(value.length === 0){
      setamountinput(false);
    }
    // 使用正则表达式匹配是否由恰好 40 个十六进制字符组成
    const regex = /^0x[0-9a-fA-F]{40}$/;
    for(let i =0;i<addresslist.length;i++){
      if (!regex.test(addresslist[i])) {
          console.log('地址错误');
      }
    }

    //金额数组
    const valueBignumber = ethers.utils.parseUnits(value);
    // 清空金额数组
    amountlist.splice(0,amountlist.length);
    for(let i =0;i<addresslist.length;i++){
      amountlist.push(valueBignumber.toString());
    }
    
    console.log(addresslist,"金额",value,"金额数组",amountlist);
  }


  
  // 检测屏幕宽度
  const [mobilewidth, setmobilewidth] = useState<boolean>(false); // 是否为移动端
  useEffect(() => {
    const handleResize = () => {
      setmobilewidth(window.innerWidth < 844);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },[])

  //合约地址
  const contract = '0x898b822DbB29f9851798e35B6c088282011a6AeC';
  // 处理合约地址两端显示
  const viweaddress = (contract:string)=>{
      if(mobilewidth){
        return contract.slice(0,4)+'...'+contract.slice(-4);
      }else{
        return contract;
      }
  }

  //完成提示框
  useEffect(() => {
    if(transferhash !== undefined){
      const fetchData = async () => {
        const status = await getTransaction(transferhash);
        setTranstatus(status.result.status);
      };
      
      setTimeout(fetchData, 2000)
    }
  }, [transferhash]);

  useEffect(() => {
    if (transtatus === 'pending') {
      notification.open({
        message: '交易通知',
        description: '交易已提交，等待确认',
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    } else if (transtatus === 'included') {
      notification.open({
        message: '交易通知',
        description: '交易已确认',
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    } else if (transtatus === 'failed') {
      notification.open({
        message: '交易通知',
        description: '交易失败，请检查余额是否充足',
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    }
    setTranstatus(undefined);
  }, [transtatus]);
  

  
  //获取交易信息
  async function getTransaction(hash:any){
    const url:string = `https://testnet.era.zksync.dev/zks_getTransactionDetails`;
    console.log(url);
    const headers :any = {
      "content-type": "application/json",
    }
    const data = {
      "jsonrpc": "2.0",
      "id": 1, 
      "method": "zks_getTransactionDetails",
        "params": [ `${hash}` ]
    }

    const res =await axios.post(url,data,{headers})
    console.log(res);
    return  res.data;
  }
  

  //转账函数 zksync-web3
  
  async function Transfer(){
    
    const web3provider = new Web3Provider(window.ethereum)
    const wallet = web3provider.getSigner();

    const Trancontract = new Contract(contract, TranABI, wallet);
    // console.log(Trancontract)
    const gas = {gasLimit: 3000000, gasPrice: ethers.utils.parseUnits('0.25', 'gwei')};
    const tx =await  Trancontract.transfer(addresslist,amountlist,gas);
    settransferhash(tx.hash)
    return tx.hash;
  
  }

  //转账点击事件
  const handleTransferClick =async () => {
    try{
      isEthAddressValid();
      if(addressinput&&amountinput){
        const hash:any =await Transfer();
        console.log(hash); 
      }else{
        console.log("地址或金额错误");
      }
    }catch(e){
      console.log(e);
    }

  } 
  return (
    <Container maxWidth='md' sx={{height:"100%"}}>
      <Box sx={{
        height:"100%",
        display: "flex", // 使用弹性盒子布局
        flexDirection: "column", // 设置主轴为垂直方向
        alignItems: "center", // 垂直居中对齐
        border: "3px solid",
        borderRadius: "20px",
        marginTop:"80px",
        padding:"50px"
      }} className='transfer-body'>
        <h2 style={{fontSize:'20px'}}>zkSync Era批量转账ETH</h2>
        {mobilewidth ? 
        (<Box sx={{color:"#834bff",fontWeight:"bold"}}>收款合约地址:
          <a href='https://explorer.zksync.io/address/0xe0AC8D30Fedf0D982e026921BC97f96220F8b0D5#contract'
            target='_bank'
            style={{textDecoration:"none",color:"#834bff",fontWeight:"bold"}}
          >
            {viweaddress(contract)}</a>
        </Box>):
        (<Box sx={{color:"#834bff",fontWeight:"bold"}}>收款合约地址:
          <a href='https://explorer.zksync.io/address/0xe0AC8D30Fedf0D982e026921BC97f96220F8b0D5#contract'
            target='_bank'
            style={{textDecoration:"none",color:"#834bff",fontWeight:"bold"}}
          >
            {viweaddress(contract)}</a>
        </Box>)}
        <TextArea placeholder='收款地址,一行一个地址' 
          rows={10} 
          className='transfer-address'
          onChange={handleaddressChange}
          value={addresslist.join('\n')}
        />
        {!addressinput && <Box style={{ color: 'red',fontSize:"10px" }}>地址不能为空</Box>} {/* 当地址无效时显示错误提示 */}
        <Box sx={{width:"100%",display:"flex",justifyContent:"flex-start",alignItems:"center"}}>转账数量：
          <Input 
            placeholder="转账数量" 
            className='transfer-math' 
            value={value}
            onChange={handleChange}
            style={{
            width:"80px" ,margin:"10px"}}  />
            {!amountinput && <Box style={{ color: 'red',fontSize:"10px" }}>金额不能为空</Box>} {/* 当为空时显示错误提示 */}
        </Box>
        <Button type="primary" 
          size="large"
          onClick={handleTransferClick}
        >确认转账</Button>
      </Box>
    </Container>
  )
}