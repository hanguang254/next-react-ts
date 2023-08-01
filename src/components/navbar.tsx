import React from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function navbar() {
  return (
    <Box >
        <Box className='navbar' sx={{
            display: 'flex',
            alignItems: 'center',
            height:'60px'
        }}>
            <Link href='/'>
                <Box className='navbarlogo'>
                    <Avatar alt="Remy Sharp" 
                    src="/StarPrizePool.png" 
                    variant='square'
                    sx={{
                        borderRadius:'10px',
                    }}
                    />
                </Box>
            </Link>
            
            <Box className='link-router'>
                <Box>
                    <Link href="/">批量转账</Link>
                    <Link href="/pagetwo">02</Link>
                    <Link href='/pagethree'>03</Link>
                </Box>  
            </Box>
            <Box className='wallet' >
                <ConnectButton />
            </Box>   
        </Box> 
    </Box>
  )
}
