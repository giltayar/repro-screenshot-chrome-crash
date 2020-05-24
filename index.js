'use strict'
const {promisify} = require('util')
const fs = require('fs')
const http = require('http');
const serverHandler = require('serve-handler');
const puppeteer = require('puppeteer-core')
const fetch = require('node-fetch')
const retry = require('p-retry')

async function main() {
  const clipRegions = [
    { x: 0, y: 0, width: 1366, height: 768 },
    { x: 1366, y: 0, width: 12, height: 768 },
    { x: 0, y: 768, width: 1366, height: 768 },
    { x: 1366, y: 768, width: 12, height: 768 },
    { x: 0, y: 1536, width: 1366, height: 768 },
    { x: 1366, y: 1536, width: 12, height: 768 },
    { x: 0, y: 2304, width: 1366, height: 768 },
    { x: 1366, y: 2304, width: 12, height: 768 },
    { x: 0, y: 3072, width: 1366, height: 768 },
    { x: 1366, y: 3072, width: 12, height: 768 },
    { x: 0, y: 3840, width: 1366, height: 768 },
    { x: 1366, y: 3840, width: 12, height: 768 },
    { x: 0, y: 4608, width: 1366, height: 768 },
    { x: 1366, y: 4608, width: 12, height: 768 },
    { x: 0, y: 5376, width: 1366, height: 768 },
    { x: 1366, y: 5376, width: 12, height: 768 },
    { x: 0, y: 6144, width: 1366, height: 659 },
    { x: 1366, y: 6144, width: 12, height: 659 }
  ]
  const BROWSER_WIDTH = 1366
  const BROWSER_HEIGHT = 768
  const SLEEP_BETWEEN_SECTION_SCREENSHOTS = 0

  await runServer(__dirname + '/page-that-crashes')

  console.log('connecting...')
  // const browser = await puppeteer.launch({headless: true})
  const browser = await puppeteer.connect({browserWSEndpoint: await retry(() => getBrowserWSEndpointId())})

  const page = await browser.newPage()
  await page.setViewport({width: BROWSER_WIDTH, height: BROWSER_HEIGHT})

  console.log('navigating to page...')
  await page.goto('http://host.docker.internal:3000/page-that-crashes.html')

    let i = 0
    for (const clipRegion of clipRegions) {
      page.evaluate(({x, y}) => document.querySelector('html').style.transform = `translate(-${x}px, -${y}px)`, clipRegion)

      console.log(`taking screenshot #${i + 1}...`, clipRegion)
      const buffer = await page.screenshot({
        path: `screenshots/screenshot-${i + 1}.png`,
        clip: clipRegion
      })
      console.log('took screenshot')

      await fs.promises.writeFile(`${__dirname}/screenshots/screenshot-${i + 1}.png`, buffer)

      if (SLEEP_BETWEEN_SECTION_SCREENSHOTS) await promisify(setTimeout)(SLEEP_BETWEEN_SECTION_SCREENSHOTS)
      ++i
    }
  console.log('succeeded!')
}

process.on('unhandledRejection', err => {console.error(err); process.exit(1)})
main().catch(err => {console.error(err); process.exit(1)}).then(_ => process.exit(0))

async function getBrowserWSEndpointId() {
  //@ts-ignore
  const response = await fetch('http://0.0.0.0:9222/json/version')

  const jsonResponse = await response.json()

  return jsonResponse.webSocketDebuggerUrl
}

async function runServer(dir) {
  const server = http.createServer((request, response) => {
    return serverHandler(request, response, {public: dir});
  })

  await new Promise(r => server.listen(3000, r));
}
