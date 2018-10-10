'use strict'
const {promisify} = require('util')
const puppeteer = require('puppeteer-core')
const fetch = require('node-fetch')
const retry = require('p-retry')

async function main() {
  const BROWSER_WIDTH = 2500
  const BROWSER_HEIGHT = 700
  const PAGE_HEIGHT = 9891
  const SECTION_HEIGHT = 1000
  const SLEEP_BETWEEN_SECTION_SCREENSHOTS = 0

  console.log('connecting...')
  // const browser = await puppeteer.launch({headless: true})
  const browser = await puppeteer.connect({browserWSEndpoint: await retry(() => getBrowserWSEndpointId())})

  const page = await browser.newPage()
  await page.setViewport({width: BROWSER_WIDTH, height: BROWSER_HEIGHT})

  console.log('navigating to page...')
  await page.goto('https://www.amazon.com/All-new-Echo-Dot-3rd-Gen/dp/B0792R1RSN/ref=redir_mobile_desktop')

  const numberOfSections = Math.ceil(PAGE_HEIGHT / SECTION_HEIGHT)
  for (let i = 0; i < numberOfSections; ++i) {
    const clip = {
      x: 0,
      y: SECTION_HEIGHT * i,
      width: BROWSER_WIDTH,
      height: i < numberOfSections - 1 ? SECTION_HEIGHT : PAGE_HEIGHT - SECTION_HEIGHT * i
    }
    console.log(`taking screenshot #${i + 1}...`, clip)

    await page.screenshot({
      path: `screenshots/screenshot-${i + 1}.png`,
      clip
    })

    console.log('took screenshot')
    if (SLEEP_BETWEEN_SECTION_SCREENSHOTS) await promisify(setTimeout)(SLEEP_BETWEEN_SECTION_SCREENSHOTS)
  }
  console.log('succeeded!')
}

process.on('unhandledRejection', err => {console.error(err); process.exit(1)})

main().catch(err => {console.error(err); process.exit(1)}).then(_ => process.exit(0))

async function getBrowserWSEndpointId() {
  const response = await fetch('http://0.0.0.0:9222/json/version')

  const jsonResponse = await response.json()

  return jsonResponse.webSocketDebuggerUrl
}