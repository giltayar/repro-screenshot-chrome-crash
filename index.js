'use strict'
const {promisify} = require('util')
const puppeteer = require('puppeteer-core')
const fetch = require('node-fetch')

async function main() {
  console.log('connecting...')
  // const browser = await puppeteer.launch({headless: true})
  const browser = await puppeteer.connect({browserWSEndpoint: await getBrowserWSEndpointId()})
  const browserWidth = 2500
  const browserHeight = 700
  const pageHeight = 9891
  const sectionHeight = 500
  const sleepBetweenSectionScreenshots = 1000

  const page = await browser.newPage()
  await page.setViewport({width: browserWidth, height: browserHeight})

  console.log('navigating to page...')
  await page.goto('https://www.amazon.com/All-new-Echo-Dot-3rd-Gen/dp/B0792R1RSN/ref=redir_mobile_desktop')

  for (let i = 0; i < Math.ceil(pageHeight / sectionHeight); ++i) {
    console.log(`taking screenshot #${i + 1}...`)
    await page.screenshot({
      path: `screenshots/screenshot-${i + 1}.png`,
      clip: {
        x: 0,
        y: sectionHeight * i,
        width: browserWidth,
        height: i === 0 ? sectionHeight : pageHeight - sectionHeight
      }
    })
    console.log('took screenshot')
    if (sleepBetweenSectionScreenshots) await promisify(setTimeout)(sleepBetweenSectionScreenshots)
  }
}

main().catch(console.error).then(_ => process.exit(0))

async function getBrowserWSEndpointId() {
  const response = await fetch('http://0.0.0.0:9222/json/version')

  const jsonResponse = await response.json()

  return jsonResponse.webSocketDebuggerUrl
}