import React, { Component} from 'react'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import  {Provider,Contract,Web3Provider}from "zksync-web3";
import * as ethers from "ethers";
import { useContractWrite } from 'wagmi';
import TranABI from '../abi/TransferABI.json';

import { Input ,Button,notification} from 'antd';
import { SmileOutlined,CloseSquareOutlined } from '@ant-design/icons';
import type { NotificationPlacement } from 'antd/es/notification/interface';

import { useState,useEffect ,useRef} from 'react';
import axios from 'axios';
import { get } from 'http';

const { TextArea } = Input;


declare global {
  interface Window {
    ethereum?:any;
  }

}



export default function Index() {
  
  const [value, setValue] = useState<any>(''); //转账金额
  const [addresslist,setaddesslist]= useState([]); //地址数组
  const [amountlist,setamountlist]= useState<any>([]); //金额数组
  const [depositvalue,setdepositvalue] = useState<any>(''); //存款数组


  const [addressinput,setaddressinput]= useState(true); //地址输入框是否为空
  const [amountinput,setamountinput]= useState<boolean>(true);//金额是否为空
  const [depositinput,setdepositinput]= useState<boolean>(true);//存款是否为空


  const [transferhash,settransferhash] =useState<any>();//交易hash
  const [transtatus,setTranstatus] = useState<any>(undefined); // 交易状态

  const [loading, setLoading] = useState<boolean>(false); //按钮加载状态
  const [addressfalse, setaddressfalse] = useState<boolean>(false); //地址错误提示

  
  //合约地址
  const contract = '0x2097636D692f6392dFFec40568adab0f604a35eb';

  function getWallet(){
    const web3provider = new Web3Provider(window.ethereum)
    const wallet = web3provider.getSigner();
    return wallet;
  }
  //钱包对象
  function getContract(wallet:any){
    const Trancontract = new Contract(contract,TranABI, wallet);
    return Trancontract;
  }

  //转账输入框
  const handleChange = (event:any): void => {
    setamountinput(true);
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    setValue(numericValue);
    
  };
  //deposit输入框
  const handledepositChange = (event:any): void => {
    setdepositinput(true);
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    setdepositvalue(numericValue);
  }

  //地址输入框为数组
  const handleaddressChange = (event:any): void => {
    setaddressinput(true);
    const inputValue = event.target.value;
    const addresses = inputValue.split('\n').map((address:any) => address.trim());
    setaddesslist(addresses);
  }
  //错误清空所有输入框
  useEffect(() => {
    if(addressfalse){
      if(document.getElementById('transfer-address')as HTMLInputElement){
          const a = document.getElementById('transfer-address')as HTMLInputElement;
          const b = document.getElementById('transfer-amount')as HTMLInputElement;
          a.value = '';
          b.value = '';
          setValue('');
          setaddesslist([]);
          setaddressfalse(false);
      }
    }
    
  },[addressfalse])

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
          setaddressfalse(true);
          notification.open({
            message: '地址错误',
            description: '请输入正确的以太坊地址',
            icon: <CloseSquareOutlined style={{ color: '#108ee9' }}/>,
          })
          
      }
    }

    //金额数组
    const valueBignumber= ethers.utils.parseEther(value);
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
      
      setTimeout(fetchData,1000);
    }
  }, [transferhash]);

  useEffect(() => {
    const url = `https://goerli.explorer.zksync.io/tx/${transferhash}`;
    if (transtatus === 'pending') {
      notification.open({
        message: '交易通知',
        description: <a href={url} target='_bank' style={{textDecoration:'none'}}>
                      交易已提交，等待确认</a>,
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    } else if (transtatus === 'included') {
      notification.open({
        message: '交易通知',
        description: <a href={url} target='_bank' style={{textDecoration:'none'}}>
                      交易已确认,点击查看详情！</a>,
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    } else if (transtatus === 'failed') {
      notification.open({
        message: '交易通知',
        description: '交易失败，请检测授权额度余额是否充足',
        icon: <CloseSquareOutlined style={{ color: '#108ee9' }}/>,
      });
    }
    setTranstatus(undefined);
    setValue('');
    setaddesslist([]);
  }, [transtatus,transferhash]);
  

  
  //获取交易信息
  async function getTransaction(hash:any){
    const url:string = `https://testnet.era.zksync.dev/zks_getTransactionDetails`;
    // console.log(url);
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
    console.log(res.data);
    return  res.data;
  }
  
  //deposit
  async function deposit(){
      const wallet = getWallet();
      const Trancontract = getContract(wallet);
      const gas ={
        gasLimit: 1000000, 
        gasPrice: ethers.utils.parseUnits('0.25', 'gwei'),
        value
      };
      gas.value = ethers.utils.parseUnits(depositvalue);
      const deposit =await Trancontract.deposit(gas);
      return deposit.hash;
     
  }
  const [depositLoading, setdepositLoading] = useState<boolean>(false); // deposit按钮加载状态
  //deposit输入框是否为空
  function isDepositValid(){
    if(depositvalue.length === 0){
      setdepositinput(false);
    }
  }
  
  //deposit点击事件
  const handleDepositClick =async () => {
    
    try{
        isDepositValid();
        if(depositinput){
          setdepositLoading(true);
          const hash:any =await deposit();
          const url = `https://goerli.explorer.zksync.io/tx/${hash}`;
          console.log(hash); 
          notification.open({
            message: '存款通知',
            description: <a href={url} target='_bank' style={{textDecoration:'none'}}>
                      存款成功,点击查看详情！</a>,
            icon: <SmileOutlined style={{ color: '#108ee9' }} />,
          });
          setdepositLoading(false);
        }else{
          notification.open({
            message: '存款通知',
            description: "存款金额不能为空",
            icon: <SmileOutlined style={{ color: '#108ee9' }} />,
          });
        }
    }catch(err:any){
      console.log(err);
      setdepositLoading(false);
      notification.open({
        message: '存款通知',
        description: `请输入存款金额${err.message}`,
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    }
  }

  //转账函数 zksync-web3
  async function Transfer(){

      const wallet = getWallet();
      const Trancontract = getContract(wallet);
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
        //按钮点击加载状态
        setLoading(true);

        const hash:any =await Transfer();
        console.log(hash); 

        setLoading(false);
      }else{
        notification.open({
          message: '转账通知',
          description: "转账金额与地址不能为空",
          icon: <SmileOutlined style={{ color: '#108ee9' }} />,
        });
      }
    }catch(e:any){
      setLoading(false);
      notification.open({
        message: '转账通知',
        description: `请输入转账金额${e.message}`,
        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      });
    }

  } 

  const zksyncblock =`https://goerli.explorer.zksync.io/address/${contract}`;
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
          <a href={zksyncblock}
            target='_bank'
            style={{textDecoration:"none",color:"#834bff",fontWeight:"bold"}}
          >
            {viweaddress(contract)}</a>
        </Box>):
        (<Box sx={{color:"#834bff",fontWeight:"bold"}}>收款合约地址:
          <a href={zksyncblock}
            target='_bank'
            style={{textDecoration:"none",color:"#834bff",fontWeight:"bold"}}
          >
            {viweaddress(contract)}</a>
        </Box>)}
        <TextArea placeholder='收款地址,一行一个地址' 
          rows={10} 
          id='transfer-address'
          onChange={handleaddressChange}
          value={addresslist.join('\n')}
          allowClear={true}
        />
        {!addressinput && <Box style={{ color: 'red',fontSize:"10px" }}>地址不能为空</Box>} {/* 当地址无效时显示错误提示 */}
        <Box sx={{width:"100%",display:"flex",justifyContent:'center',alignItems:"center"}}>
          <Box>
            存款:
            <Input 
              placeholder="存款数量" 
              id='deposit-amount' 
              value={depositvalue}
              onChange={handledepositChange}
              style={{
              width:"80px" ,margin:"10px"}}  />
          </Box>
          <Box>
            转账:
            <Input 
            placeholder="转账数量" 
            id='transfer-amount' 
            value={value}
            onChange={handleChange}
            style={{
            width:"80px" ,margin:"10px"}}  />
            
          </Box>
          <Box>
            {!amountinput && <Box style={{ color: 'red',fontSize:"10px" }}>转账金额不能为空</Box>} {/* 当为空时显示错误提示 */}
          </Box>
        </Box>
        <Box sx={{
          width:"100%",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
        }}>
          <Button type="primary" 
            size="large"
            onClick={handleDepositClick}
            loading={depositLoading}
            style={{marginRight:"30px"}}
          >存款</Button>
          <Button type="primary" 
            size="large"
            style={{marginLeft:"30px"}}
            loading={loading}
            onClick={handleTransferClick}
          >确认转账</Button>
        </Box>
        
      </Box>
    </Container>
  )
}