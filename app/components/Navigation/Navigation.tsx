'use client'
import React from 'react'
import Logo from './Logo'
import NavigationButton from './NavigationButton'
import { usePathname, useRouter } from 'next/navigation'

const Navigation = () => {
    const router = useRouter();
    const pathname = usePathname();
  return (
    <div className='flex p-4 justify-between'>
        <Logo />
        <div className='flex gap-4 '>
            <NavigationButton label="Home" onClick={() => router.push('/')} active={pathname === "/"} />
            <NavigationButton label="Dashboard" onClick={() => router.push('/dashboard')} active={pathname === "/dashboard"} />
        </div>  
    </div>
  )
}

export default Navigation