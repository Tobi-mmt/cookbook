import React from 'react'
import Head from 'next/head'

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Tobi's Kochbuch</title>
        <link rel='icon' href='/favicon.ico' />
        <link rel='icon' type='image/png' href='/favicon-16x16.png' sizes='16x16' />
        <link rel='icon' type='image/png' href='/favicon-32x32.png' sizes='32x32' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/site.webmanifest' />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
