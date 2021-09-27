const main = require("./main")

// テスト
async function test() {
    await main.doLive("999999", "名前", false)
}

test()
