# img-slideshow

ページ内のサムネイルの先にある大きい画像を集めて、全画面でスライドショーにするブックマークレット。

## 起動用ブックマーク

次の1行をブックマークの URL に登録する（名前は `ss` など）。

```
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/honda1986/img-slideshow@main/ss2.js';s.onerror=function(){alert('スライドショーを読み込めませんでした')};document.body.appendChild(s)})()
```

本体は `ss2.js`。jsDelivr 経由で読み込まれる。
