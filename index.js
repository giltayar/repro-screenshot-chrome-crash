'use strict'
const {promisify} = require('util')
const fs = require('fs')
const puppeteer = require('puppeteer-core')
const fetch = require('node-fetch')
const retry = require('p-retry')

async function main() {
  const BROWSER_WIDTH = 1024
  const BROWSER_HEIGHT = 768
  const PAGE_HEIGHT = 12000
  const SLEEP_BETWEEN_SECTION_SCREENSHOTS = 0
  const FULL_PAGE = false

  console.log('connecting...')
  // const browser = await puppeteer.launch({headless: true})
  const browser = await puppeteer.connect({browserWSEndpoint: await retry(() => getBrowserWSEndpointId())})

  const page = await browser.newPage()
  await page.setViewport({width: BROWSER_WIDTH, height: BROWSER_HEIGHT})

  console.log('navigating to page...')
  await page.goto('https://render-wus.applitools.com/renderid/e5e3d542-7685-49ca-8f10-b4e4ba47ca63?rg_auth-token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0SnlGZmMwaFRVX2pzZTVCNlFTX2lnfn4iLCJpYXQiOjE1OTAwNDU4NjQsImV4cCI6MTU5MDA2NzQ2NCwiaXNzIjoiZXllc2FwaS5hcHBsaXRvb2xzLmNvbSxleWVzcHVibGljd3VzaTAuYmxvYi5jb3JlLndpbmRvd3MubmV0IiwidmdzZXJ2aWNldXJsIjoiaHR0cHM6Ly9yZW5kZXItd3VzLmFwcGxpdG9vbHMuY29tIn0.km2w_NENpBpCXSnE_jAKxEyz5PHXMho25pusbxHpGOVlf3hqyYxgq_uJSjBcoDXT7AapHtbGF8sP3djRl1x0M-9x_-50RtXsq1uWoySw68-kfhY7EHfTS6mRPIj5NudTUOHmHg2Rl81fwQB4DoyJc98f1QaPCeFLzeNZCAUcKaI&rg_urlmode=rewrite&rg_namespace-override=0seSQU0-RUqm2KPpJB-kvw~~')

  if (FULL_PAGE) {
    console.log('taking full page screenshot...')
    await page.screenshot({path: 'screenshots/screenshot.png', fullPage: true})
    console.log('succeeded!')
    return
  }

  const numberOfSections = Math.ceil(PAGE_HEIGHT / BROWSER_HEIGHT)

  for (let i = 0; i < numberOfSections; ++i) {
    page.evaluate((i, h) => document.querySelector('html').style.transform = `translate(0px, ${-h * i}px)`, i, BROWSER_HEIGHT)
    const clip = {
      x: 0,
      y: 0,
      width: BROWSER_WIDTH,
      height: BROWSER_HEIGHT
    }
    console.log(`taking screenshot #${i + 1}...`, clip)

    const buffer = await page.screenshot({
      path: `screenshots/screenshot-${i + 1}.png`,
      clip
    })

    await fs.promises.writeFile(`${__dirname}/screenshots/screenshot-${i + 1}.png`, buffer)

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