// 参考：https://greasyfork.org/ja/scripts/392352-pixiv-show-resolution/code
const bookmarkURL = '/bookmark_detail.php?illust_id=';
const addBookmarks = 'bookmark-tip';
const added = 'added';
const selector = [
  {url:'/ranking.php', sel:'.ranking-image-item>a'}
];

let showBookmarks = async () => {
  let match = selector.find(s => location.href.match(s.url));
  let sel = [];
  if (match){
    let selec = match.sel.split(',').map(n => n.trim() + '[href*="/artworks/"]:not(.'+added+')').join(',');
    sel = document.querySelectorAll(selec);
  }
  if(sel.length<=0)return;

  // 要素追加時にまた呼び出されてしまうから、先にチェックだけ付けておく
  sel.forEach(el => {
    el.classList.add(added);
  });

  // 参考先ではID集めてまとめてリクエストできるページがあったっぽいけど、
  // ブクマ数はまとめてできるページとか分からないから1つずつリクエストする。
  // タイトル、ページ数、サイズ、タグ、illustid、userid、ユーザ名等
  // awaitは非同期関数内じゃないと怒られる。foreachは非同期じゃないらしい
  for await (let el of sel){
    let id = el.href.replace(/.*(\/artworks\/|illust_id=)(\d+)(\D.*)?/, '$2');
    let bookmarks = await fetch(bookmarkURL+id,{
      credentials:'same-origin'
    }).then(function(response){
      return response.text();
    }).then(function(data){
      let doc = new DOMParser().parseFromString(data,'text/html');
      let message = doc.getElementsByClassName('bookmark-count')[0].innerText;
      return message;
    });
    let ele = '<p class='+addBookmarks+'>'+bookmarks+'</p>';
    el.insertAdjacentHTML('beforeend',ele);
  }
};

let init = async () => {
  let observer = new MutationObserver(()=>{
    showBookmarks();
  });
  observer.observe(document.body,{childList: true, subtree: true});
  // ここでcss作成したい
};
init();
