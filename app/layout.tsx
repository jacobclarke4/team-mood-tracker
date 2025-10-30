import Navigation from './components/Navigation/Navigation';
import './globals.css';
import { ReactNode } from "react";

export const metadata = {
  title: 'Mood',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className='bg-dark-grey'>
        <Navigation />
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  )
}
