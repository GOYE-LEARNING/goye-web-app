"use client"
interface Props {
    openUserDetails: (userId?: string) => void
}
export default function AdminGetRoles ({openUserDetails} : Props) {
    return (
        <div className="dashboard_content_mainbox">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => openUserDetails()}>
                <div className="flex gap-3 items-center">
                    <div className="h-[44px] w-[44px] rounded-full bg-slate-300"></div>
                    <div className="flex flex-col items-start">
                        <h1 className="font-bold text-[14px] text-[#41415A]">Brian Jim</h1>
                        <p>brianjimm@gmail.com</p>
                    </div>
                </div>
                <span className="bg-[#30A46F] text-white  px-[9px] py-[1px] text-[0.8rem] capitalize rounded-[3px]">student</span>
            </div>
            <div className="dashboard_hr mt-5"></div>
        </div>
    )
}