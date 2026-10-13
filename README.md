# img-slideshow

ページ内のサムネイルの先にある大きい画像を集めて、全画面でスライドショーにするブックマークレット。

## 起動用ブックマーク

次の1行をブックマークの URL に登録する（名前は `ss` など）。本体 `ss2.js` を GitHub から直接読み込むので、本体を更新すると数分で反映される。

```
javascript:(function(){fetch('https://raw.githubusercontent.com/honda1986/img-slideshow/main/ss2.js',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){var s=document.createElement('script');s.textContent=t;document.body.appendChild(s)}).catch(function(){alert('スライドショーを読み込めませんでした')})})()
```
