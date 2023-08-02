import React, { Component, use} from 'react'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { Input ,Button} from 'antd';
import { useState,useEffect } from 'react';
const { TextArea } = Input;


export default function Index() {
  
  const [value, setValue] = useState<string>('');
  const [addresslist,setaddesslist]= useState([]); //地址数组
  const [address,setaddess]= useState<boolean>(true);//地址是否合法

  const [addressinput,setaddressinput]= useState(true); //地址输入框是否为空
  const [amount,setamount]= useState<boolean>(true);//金额是否合法

  const handleChange = (event:any): void => {
    setamount(true);
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    setValue(numericValue);
  };

  const handleaddressChange = (event:any): void => {
    setaddressinput(true);
    const inputValue = event.target.value;
    const addresses = inputValue.split('\n').map((address:any) => address.trim());
    setaddesslist(addresses);
  }

  function isEthAddressValid() {
    if (addresslist.length === 0) {
      setaddressinput(false);
    }
    if(value.length === 0){
      setamount(false);
    }
    // 使用正则表达式匹配是否由恰好 40 个十六进制字符组成
    const regex = /^0x[0-9a-fA-F]{40}$/;
    for(let i =0;i<addresslist.length;i++){
      if (!regex.test(addresslist[i])) {
        console.log('地址不合法');
        setaddess(false);
      }
    }
    // 地址全部合法
    setaddess(true);
    transferamount();
  }

  function transferamount(){
    //转账金额的数组
    const amountlist = [];
    for(let i =0;i<addresslist.length;i++){
      amountlist.push(value);
    }
    console.log(amountlist);
    return amountlist;
  }
  //转账点击事件
  const handleTransferClick = () => {
      isEthAddressValid();
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
  const contract = '0xe0AC8D30Fedf0D982e026921BC97f96220F8b0D5';
  const viweaddress = (contract:string)=>{
      if(mobilewidth){
        return contract.slice(0,4)+'...'+contract.slice(-4);
      }else{
        return contract;
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
        <h2 style={{fontSize:'25px'}}>zkSync Era批量转账</h2>
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
            {!amount && <Box style={{ color: 'red',fontSize:"10px" }}>金额不能为空</Box>} {/* 当为空时显示错误提示 */}
        </Box>
        <Button type="primary" 
          size="large"
          onClick={handleTransferClick}
        >确认转账</Button>
      </Box>
    </Container>
  )
}