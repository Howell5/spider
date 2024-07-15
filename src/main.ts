import { HttpCrawler, log, LogLevel } from 'crawlee'

// Crawlers come with various utilities, e.g. for logging.
// Here we use debug level of logging to improve the debugging experience.
// This functionality is optional!
log.setLevel(LogLevel.DEBUG)

// Create an instance of the HttpCrawler class - a crawler
// that automatically loads the URLs and saves their HTML.
const crawler = new HttpCrawler({
  // The crawler downloads and processes the web pages in parallel, with a concurrency
  // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
  // Here we define some hard limits for the concurrency.
  minConcurrency: 10,
  maxConcurrency: 50,

  // On error, retry each page at most once.
  maxRequestRetries: 1,

  // Increase the timeout for processing of each page.
  requestHandlerTimeoutSecs: 30,

  // Limit to 10 requests per one crawl
  maxRequestsPerCrawl: 10,

  // This function will be called for each URL to crawl.
  // It accepts a single parameter, which is an object with options as:
  // https://crawlee.dev/api/http-crawler/interface/HttpCrawlerOptions#requestHandler
  // We use for demonstration only 2 of them:
  // - request: an instance of the Request class with information such as the URL that is being crawled and HTTP method
  // - body: the HTML code of the current page
  async requestHandler({ pushData, request, body }) {
    log.debug(`Processing ${request.url}...`)

    // 确保响应是 JSON 格式
    const responseBody = body.toString()
    let items = []
    try {
      const jsonData = JSON.parse(responseBody, null, 2)
      items = jsonData?.data.items
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return
    }

    // Store the results to the dataset. In local configuration,
    // the data will be stored as JSON files in ./storage/datasets/default
    await pushData({
      url: request.url, // URL of the page
      body: items, // HTML code of the page
    })
  },

  // This function is called if the page processing failed more than maxRequestRetries + 1 times.
  failedRequestHandler({ request }) {
    log.debug(`Request ${request.url} failed twice.`)
  },
})

crawler.addRequests([
  {
    method: 'POST',
    url: 'https://edith.xiaohongshu.com/api/sns/web/v1/search/notes',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language':
        'en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6,ja;q=0.5',
      'content-type': 'application/json;charset=UTF-8',
      cookie:
        'abRequestId=81c3860c-7a48-5f1e-b1a5-bae599fb0e43; a1=18a977b84246pi9rbn8i0gkpwup2lfyiimvgft9za30000749340; webId=3ac4a9eb9d2d6d6bfb4df00981a63f1f; gid=yY0jWWDYjJ3jyY0jWWDY469jJ4KU3jFDIY38hu0kTUE7Ukq8J1iv3i888W4jq488dDD4i2W2; xsecappid=xhs-pc-web; webBuild=4.25.1; acw_tc=33ac9eeb6a41fe94359af19a1063455b18590ffd8b0eae3bafeb6dd48c876327; websectiga=7750c37de43b7be9de8ed9ff8ea0e576519e8cd2157322eb972ecb429a7735d4; web_session=0400698d1fecc3170971bd0fa6344b79d6ce39; sec_poison_id=173265eb-7d57-4dd4-97c0-6d09dad8b247; unread={%22ub%22:%2266904cd300000000250004f7%22%2C%22ue%22:%226690ef70000000002501750d%22%2C%22uc%22:52}',
      origin: 'https://www.xiaohongshu.com',
      priority: 'u=1, i',
      referer: 'https://www.xiaohongshu.com/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/126.0.0.0',
      'x-b3-traceid': 'bdfa6f6c6055e5a6',
      'x-s':
        'XYW_eyJzaWduU3ZuIjoiNTIiLCJzaWduVHlwZSI6IngxIiwiYXBwSWQiOiJ4aHMtcGMtd2ViIiwic2lnblZlcnNpb24iOiIxIiwicGF5bG9hZCI6IjRiZGUxZWEwYWQ2ZDMxNDQ5YmRjMjk4YmI4ZTY5NTVkY2RiNzE5OGNlMDA3MWUzZThjN2RjZmEyOTc4MWEwZTAxYjc0YjMyOTgyMzU5MmNkMzIxZTRjZWMzZGIyOGMwNGQwNTc1MDMwNTY2NTA0MjE4ODgxNDNkOWFkNGRkYmQ5ODg4MTQzZDlhZDRkZGJkOWI1NmNjM2EzN2M2YTdhYWRlOTM2NTBhZGMzMzlkZTY0MGQwNzFlMjA5ZjczODE2MWQ3OWY1N2ZiZDY3ODU4N2QxNjc3NWJlZWQ0NjIyMDdiMjIzMTA3N2M2ZWM1ZmQ1MDBmYmI4MzY2OWVlYzI1NmI3ZTRhZWY2MDFjMzg0YmIyZDhjMjY2NWU4ZTM1NDQzZGFlYTJlZTQ1YmJkNzM3NjVlMWU2OTM0MjE5MTI0YjIxNmMyMWViNGZjZWE5ZDkzNTgxNWZiY2UzYWJkOGQ3NGUzYmU2YWM1MmNhNGY5MDAwNzA0YWQzM2RkZTVhMDBiOSJ9',
      'x-s-common':
        '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',
      'x-t': '1720764794091',
    },
    payload:
      '{"keyword":"千岛卡牌","page":1,"page_size":20,"search_id":"2dhhj1eqw02xqb8bxwaf6@2dhhj3dou3v32w1u7y1zm","sort":"time_descending","note_type":0,"ext_flags":[],"image_formats":["jpg","webp","avif"]}',
  },
])

// Run the crawler and wait for it to finish.
// It will crawl a list of URLs from an external file, load each URL using a plain HTTP request, and save HTML
await crawler.run()

log.debug('Crawler finished.')
