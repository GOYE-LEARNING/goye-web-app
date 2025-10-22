'use client'

import { useState } from "react"

export default function DashboardRadio() {
    const [checkBox, setCheckBox] = useState<boolean>(false)
    return (
        <>
        <div className={`relative h-[20px] w-[36px] ${checkBox ? 'bg-[#E3E3E8]' : 'bg-[#30A46F]'} rounded-full p-[2px]`} onClick={(() => setCheckBox(!checkBox))}>
            <input type="checkbox" className="hidden"/>
            <div className={`w-[16px] h-[16px] transform ${!checkBox ? 'translate-x-[100%]' : 'translate-x-[0]'} transition-all duration-100 bg-[#ffffff] rounded-full drop-shadow-sm`}></div>
        </div>
        </>
    )
}