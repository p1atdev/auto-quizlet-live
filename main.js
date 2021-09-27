var process = require("process")
// const dotenv = require("dotenv")
const puppeteer = require("puppeteer")
// const puppeteer = require("puppeteer-extra")

// ログインする
async function login(username, password, page) {
    // まずは移動
    await page.goto("https://quizlet.com/")

    await page.click(
        'button[class="AssemblyButtonBase AssemblyTextButton AssemblyTextButton--inverted AssemblyButtonBase--small"]'
    )

    // 諸情報入力
    await page.type("#username", username)
    await page.type("#password", password)

    // submitする
    await page.click('button[type="submit"]')
}

// グラビティをする
async function doLive(key, userName, headless = true, swapMode = false) {
    console.log("start doLive")

    // const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker")
    // puppeteer.use(
    //     AdblockerPlugin({
    //         blockTrackers: true,
    //     })
    // )

    const browser = await puppeteer.launch({
        headless: headless,
        args: [
            // "--no-sandbox",
            // "--disable-setuid-sandbox",
            // "--disable-gpu",
            // "--disable-dev-shm-usage",
            // "--no-first-run",
            // "--no-zygote",
            // "--single-process",
        ],
    })
    const page = await browser.newPage()

    try {
        // 移動
        await page.goto("https://quizlet.com/live")

        // まずは番号を入れる
        console.log("番号、ユーザーネームを入力中....")
        await page.keyboard.sendCharacter(key)
        await page.click('button[class="UIButton UIButton--hero"]')
        await page.waitForSelector('div[class="UIDiv EnterPlayerName-input"]')
        await page.keyboard.sendCharacter(userName)
        await page.click('button[class="UIButton UIButton--hero"]')

        console.log("単語の画面へ移動した")
        console.log("単語を取得します")

        await page.waitForSelector('span[class="UIText UIText--bodyThree"]')
        const numberOfCards = parseInt(
            (
                await page.$eval('span[class="UIText UIText--bodyThree"]', (option) => {
                    return option.textContent
                })
            ).split("/")[1]
        )

        // 単語セット
        var wordList = {}

        // カードの数だけ繰り返す
        for (const i of [...Array(numberOfCards).keys()]) {
            // await page.waitForSelector('div[aria-hidden="false"]')
            const word = await page.$$eval('div[aria-hidden="false"]', (list) => {
                return list.map((data) => data.textContent)
            })

            await page.click('div[class="CardsItemInner-cell"]')

            const question = await page.$$eval('div[aria-hidden="false"]', (list) => {
                return list.map((data) => data.textContent)
            })

            console.log(`${word}: ${question}`)
            if (!swapMode) {
                wordList[question] = word
            } else {
                wordList[word] = question
            }

            await page.waitForTimeout(400)

            await page.click('div[class="CardsList-navControl nextButton"]')
        }

        // 単語取得完了
        console.log("単語取得完了、ゲーム開始まで待機します")

        // ゲーム開始まで待機
        await page.waitForSelector('div[class="QuestionView"]', { timeout: 999999999 })

        console.log("ゲーム開始")

        var gaming = true

        // 問題文の答えがあるかどうかを探す
        while (gaming) {
            try {
                await page.waitForSelector('div[class="UIDiv StudentEndView-winnerHeader"]', { timeout: 500 })
                // 終わったのでやめる
                gaming = false
            } catch {}

            try {
                const question = await page.$eval(
                    'div[class="FormattedText notranslate StudentPrompt-text lang-en"]',
                    (option) => {
                        return option.textContent
                    }
                )
                const targetChoise = wordList[question]
                try {
                    await page.waitForSelector(`div[aria-label="${targetChoise}"]`, { timeout: 1000 })
                    await page.click(`div[aria-label="${targetChoise}"]`)
                    await page.waitForTimeout(3000)
                } catch {
                    // 選択肢がない
                    continue
                }
            } catch {
                // 問題文がないということなので終了
                gaming = false
            }
        }

        console.log("〜終了〜")

        // スクショを保存するぜ
        await page.waitForTimeout(10000)
        const date = new Date().toLocaleString("sv").replace(/\D/g, "")
        await page.screenshot({ path: `screenshots/${date}.png` })

        // とりま終わったらしばらく待つ
        await page.waitForTimeout(999999999)

        console.log("成功")
    } catch (err) {
        // エラーが起きた際の処理
        console.log(`エラー: ${err}`)
        errorMessage = err
    } finally {
        await browser.close()

        console.log("終了")

        // return [progress, errorMessage]
    }
}

// 外部用
module.exports.doLive = async (key, userName, headless = true) => {
    await doLive(key, userName, headless)
}
