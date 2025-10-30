'use client'
import React from 'react'

interface NavigationButtonProps {
  label: string;
  onClick: () => void;
  active: boolean;
}
const NavigationButton = ({ label, onClick, active }: NavigationButtonProps) => {

  return (

        <button onClick={onClick} className={`relative flex-1 m-[0] cursor-pointer text-white pl-4 pr-4 `}>
        {label}
        {active && <div className='bg-purple rounded' style={{height: '3px', width: '100%', position: 'absolute', left: 0, bottom: 0}}></div>}
        </button>
  )
}

export default NavigationButton