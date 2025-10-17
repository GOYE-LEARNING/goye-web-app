import './styles/globals.css'
import React from 'react'
import '@fontsource/inter'
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html>
      <body className='bg-secondaryColors-0 font-inter scrollbar'>{children}</body>
    </html>
  )
}