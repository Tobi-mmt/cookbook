import React from 'react'
import Head from 'next/head'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

const MyApp = ({ Component, pageProps }) => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      integrations: [
        new Integrations.BrowserTracing()
      ]
    })
  }

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
