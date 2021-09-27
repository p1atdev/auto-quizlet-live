# auto-quizlet-live

自動で Quizlet の**live**を実行します。
他のゲームには対応してません。

# 必要なもの

-   npm
-   node

# 使い方

まずは

```zsh
npm install
```

してください。

次に、`test.example.js`を好きな値に書き換えて実行します

```js:test.js
const main = require("./main")

// テスト
async function test() {
    await main.doLive("999999", "名前", false)
}

test()

```

```zsh
node test.example.js
```

全て自動で参加、選択などが行われます
