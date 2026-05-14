"use client"
import React from "react";
export default function UnauthorizedPageLayout({children} : {children: React.ReactNode}) {
    return (
        <div>
            {children}
        </div>
    )
}