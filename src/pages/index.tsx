import React, { Component} from 'react'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { Input ,Button} from 'antd';
import { useState } from 'react';
const { TextArea } = Input;


export default function Index() {
  
  const [value, setValue] = useState<string>('');

  const handleChange = (event:any): void => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/\D/g, '');
    setValue(numericValue);
  };

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
        <h2 style={{fontSize:'50px'}}>批量转账</h2>
        <TextArea placeholder='收款地址' rows={10} className='transfer-address' />
        <Box sx={{width:"100%"}}>转账数量：
          <Input 
            placeholder="转账数量" 
            className='transfer-math' 
            value={value}
            onChange={handleChange}
            style={{
            width:"80px" ,margin:"10px"}}  />
        </Box>
        <Button type="primary" size="large">确认转账</Button>
      </Box>
    </Container>
  )
}