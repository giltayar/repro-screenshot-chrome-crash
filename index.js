'use strict'
const puppeteer = require('puppeteer')
const fetch = require('node-fetch')

async function main() {
  // const browser = await puppeteer.launch({headless: true})
  console.log('connecting')
  const browser = await puppeteer.connect({browserWSEndpoint: await getBrowserWSEndpointId()})

  const page = await browser.newPage()
  await page.setViewport({width: 2500, height: 700})
  console.log('navigating to page')
  await page.goto('https://www.amazon.com/All-new-Echo-Dot-3rd-Gen/dp/B0792R1RSN/ref=redir_mobile_desktop')

  console.log('taking screenshot...')
  const sectionHeight = 5000
  for (let i = 0; i < 2; ++i) {
    await page.screenshot({
      path: `screenshot-${i + 1}.png`,
      clip: {
        x: 0,
        y: sectionHeight * i, width: 1018,
        height: i === 0 ? sectionHeight : 9891 - sectionHeight
      }
    })
  }
  console.log('took screenshot')
}

main().then(_ => process.exit(0)).catch(console.error)

async function getBrowserWSEndpointId() {
  const response = await fetch('http://0.0.0.0:9222/json/version')

  const jsonResponse = await response.json()

  return jsonResponse.webSocketDebuggerUrl
}