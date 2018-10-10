# repro-screenshot-chrome-crash

[ Update: this repo is not needed anymore because I found the flag that removed this crash:  `--disable-dev-shm-usage`.
  See https://bugs.chromium.org/p/chromium/issues/detail?id=736452 for an explanation ]

Reproduce a bug in Chrome that crashes the browser when taking a screenshot

## To reproduce

1. Run `npm install`
1. Run `npm run build` to create the docker image `repro-screenshot-chrome-crash`
1. Run `npm start`. It:
   1. Deletes previous chrome docker container
   1. run the chrome docker image
   1. runs the repro puppeteer code at `index.js`
   1. If the repro code fails, show the docker log

## Fine tune the parameters

* The default program takes a full page screenshot. This crashes the browser.
* You can fine tune the following constants in `index.js`:
  * `FULL_PAGE`: if `true`, takes a full page screenshot, otherwise will take lots of section screenshots which
    the program should stitch together afterwards (this stitching is not shown)
  * `SECTION_HEIGHT`: if `FULL_PAGE` is false, this will define the size of the section to take a screenshot of
  * `BROWSER_WIDTH`: the width of the browser.
  * `BROWSER_HEIGHT`: what it says. Irrelevant to the discussion.
  * `PAGE_HEIGHT`: the height of the page (in pixels) being shown. I was too lazy to calculate it... :-)
  * `SLEEP_BETWEEN_SECTION_SCREENSHOTS`: the time to sleep between each section screenshot. It seems that
    section screenshots _sometimes_ succeeds when doing section screenshots`

Changing the above sometimes works and makes everything succeed, and sometimes it doesn't.

## Some interesting scenarios

(Note that these are flaky results. They usually reproduce, but not all the time.)

This crashes the browser:

```js
  const BROWSER_WIDTH = 2500
  const BROWSER_HEIGHT = 700
  const PAGE_HEIGHT = 9891
  const SLEEP_BETWEEN_SECTION_SCREENSHOTS = 0
  const SECTION_HEIGHT = 1000
  const FULL_PAGE = false
```

If you just change one parameter:

```js
  const SLEEP_BETWEEN_SECTION_SCREENSHOTS = 0
```

It will succeed. Also reverting `SLEEP_BETWEEN_SECTION_SCREENSHOTS` to 0, and changing `SECTION_HEIGHT`:

```js
  const SLEEP_BETWEEN_SECTION_SCREENSHOTS = 0
  const SECTION_HEIGHT = 300
```
