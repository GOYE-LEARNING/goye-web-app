'use client'

import SubHeader from "./dashboard_subheader"
interface Props {
    backFunction: () => void
}
export default function DashboardChangeLanguage({backFunction} : Props) {
    const backFunc = () => {
        backFunction()
    }
    return (
        <>
        <div>
            <SubHeader header="Language" backFunction={backFunc}/>
        </div>
        </>
    )
}