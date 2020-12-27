// 参考：https://greasyfork.org/ja/scripts/392352-pixiv-show-resolution/code
const bookmarkURL = '/bookmark_detail.php?illust_id=';
const addBookmarks = 'bookmark-tip';
const added = 'addbookmarks';
// ほとんどのページで'.rp5asc-16'で対応できるけど一応ページ毎に分けておく
const selector = [
  {url: 'pixiv.net/($|cate_r18|manga)', sel: 'a.rp5asc-16'},
  {url: 'pixiv.net/artworks', sel: 'a.rp5asc-16'},
  {url: 'pixiv.net/tags', sel: 'a.rp5asc-16'},
  {url: 'pixiv.net/users', sel: 'a.rp5asc-16'},
  {url: 'pixiv.net/ranking', sel: '.ranking-image-item>a'},
  {url: 'pixiv.net/bookmark_new_illust', sel: 'figure>div>a'},
  {url: 'pixiv.net/discovery', sel: 'figure>div>a'}
];

let showBookmarks = async () => {
  let match = selector.find(s => location.href.match(s.url));
  let list = [];
  if (match){
    let sel = match.sel.split(',').map(n => n.trim() + '[href*="/artworks/"]:not(.'+added+')').join(',');
    list = document.querySelectorAll(sel);
  }
  if(list.length<=0)return;

  // 要素追加時にまた呼び出されてしまうから、先にチェックだけ付けておく
  list.forEach(el => {
    el.classList.add(added);
  });

  // 参考先ではID集めてまとめてリクエストできるページがあったっぽいけど、
  // ブクマ数はまとめてできるページとか分からないから1つずつリクエストする。
  // タイトル、ページ数、サイズ、タグ、illustid、userid、ユーザ名等
  // awaitは非同期関数内じゃないと怒られる。foreachは非同期じゃないらしい
  for await (let el of list){
    let id = el.href.replace(/.*(\/artworks\/|illust_id=)(\d+)(\D.*)?/, '$2');
    let bookmarks = await fetch(bookmarkURL+id,{
      credentials:'same-origin'
    }).then(function(response){
      return response.text();
    }).then(function(data){
      let dom = new DOMParser().parseFromString(data,'text/html');
      let message = dom.getElementsByClassName('bookmark-count')[0].innerText;
      return message;
    });
    let ele = '<p class='+addBookmarks+'>'+bookmarks+'</p>';
    el.insertAdjacentHTML('beforeend',ele);
  }
};

let init = async () => {
  new MutationObserver(()=>{
    showBookmarks();
  }).observe(document.body,{childList: true, subtree: true});

  const css = '<style type="text/css">.'+addBookmarks+'{'
    + 'position: absolute; left: 0px; bottom: 0px; z-index: 1; '
    + 'display: flex; flex: 0 0 auto; '
    + 'height: 20px; min-width: 20px; padding: 0px 6px; '
    + 'border-radius: 10px; line-height: 10px; box-sizing: border-box; '
    + 'color: rgb(255,255,255); background: rgba(0,0,0,0.32); '
    + 'font-size: 16px; font-weight: bold; align-items: center; '
    + '}</style>';
  document.head.insertAdjacentHTML('beforeend', css);
};
init();
