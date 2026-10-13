# img-slideshow

ページ内のサムネイルの先にある大きい画像を集めて、全画面でスライドショーにするブックマークレット。

## 起動用ブックマーク

次の1行をブックマークの URL に登録する（名前は `ss` など）。本体 `ss2.js` を GitHub から直接読み込むので、本体を更新すると数分で反映される。

```
javascript:(function(){fetch('https://raw.githubusercontent.com/honda1986/img-slideshow/main/ss2.js',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){var s=document.createElement('script');s.textContent=t;document.body.appendChild(s)}).catch(function(){alert('スライドショーを読み込めませんでした')})})()
```

## Android アプリ

`android/` に入っている。main に push すると GitHub Actions が APK を作り、Releases に載せる。

- 最新版のダウンロード: https://github.com/honda1986/img-slideshow/releases/latest/download/imgslideshow.apk
- `android/signing/personal.jks` は自分のスマホに入れる用の鍵。Google Play に出すときは公開しない別の鍵を使う。
