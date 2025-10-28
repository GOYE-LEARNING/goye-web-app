'use client'

import { CiSearch } from "react-icons/ci"
interface Props {
    placeholder: string
}
export default function DashboardSearch({placeholder} : Props) {
    return (
        <>
        <div className="h-[40px] border-b border-[#D2D5DA] flex items-center gap-3 w-full my-5">
            <CiSearch size={25}/>
            <input type="text" placeholder={placeholder} className="w-full bg-transparent border-none outline-none"/>
        </div>
        </>
    )
}