import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';

const Logo = () => {
    const router = useRouter();
  return (
    <div onClick={() => router.push('/')} className='relative cursor-pointer'  style={{ minHeight: '60px', minWidth: '150px' }}>
        <Image
            src="/Logo/moodLogo.svg"
            alt="Mood"
            fill
            style={{ objectFit: 'contain' }}
        />
    </div>
  )
}

export default Logo