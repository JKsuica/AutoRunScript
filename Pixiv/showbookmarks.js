var loaded = function(){
  // 検索等のページからイラストのIDを全て取得して非同期でブクマ数を取得する
  // 参考：https://teratail.com/questions/229710
  const bookmarkURL = '/bookmark_detail.php?illust_id=';
  const artworksURL = '//www.pixiv.net/artworks/';
  // TODO: ロードにも時差があるのか、sel範囲広げたら後ろの方が読み込めなくなった
  // ex.ユーザーページの"ピックアップ"と"イラスト・マンガ"欄
  // →先に枠だけ取得してイラスト数を把握しておいた方が良いかも
  // →ロードの時差(ページ移動やランキング等での追加ロード)に対応すれば解決するかも
  const selector = [
    {url:'/tags/.*/artworks',sel:'ul.l7cibp-1 a.rp5asc-16'},
    {url:'/artworks/[0-9]+$',sel:''},
    {url:'/users/[0-9]+$',sel:'.sc-1xvpjbu-0 a.rp5asc-16'},
    {url:'/users/[0-9]+/artworks$',sel:''}, // ユーザーページで"もっと見る"を押した時のページ
    {url:'/ranking.php',sel:'.ranking-items .ranking-image-item>a'},
    {url:'pixiv.net/$',sel:''} // トップページ。一番色々あるから大変だと思う
  ];
  var match = selector.find(s => location.href.match(s.url));
  console.log(match);
    // dom作成に時差があるので何回か確認する。とりあえず0.1s毎。んで5回
  var i = 0;
  var intervalTime = 100;
  var intervalFunc = function(){
    if(i++>5) clearInterval(id);

    var lists = $(match.sel);
    if($(lists[lists.length-1]).attr('href') == undefined) return;
    // TODO: 読み込めてるかどうかのチェックが"1個取り出してみる"ってどうなのよ
    clearInterval(id);

    lists.each(function(index,element){
      var imageURL = $(element).attr('href');
      // 広告入らないようにSelector指定してるけど、もし入ったらcontinueで飛ばす
      if (imageURL == undefined) return true;
      $.ajax({
        url: bookmarkURL+imageURL.split('/')[2],
        type: 'GET',
        dataType: 'html',
        async: true,
        success: function(data){
          // TODO: ハート絵文字の<i>タグ消したいけど、とりあえず動いてるから後回し
          var bookmarks = $(data).find('.bookmark-count').text();
          //console.log(imageURL+':'+bookmarks);


          // 取得したブクマ数を画像の上に出す
          var ele = $('<div class="bookmark-tip">').text(bookmarks);
          $(element).append(ele);
        }
      });
    });
  };
  var id = setInterval(intervalFunc, intervalTime);
};


// jqueryを追加。ajax使いたかった
var script = document.createElement('script');
script.setAttribute('src', '//code.jquery.com/jquery-3.4.1.min.js');
script.setAttribute('type', 'text/javascript');
script.addEventListener('load', loaded);
document.getElementsByTagName('head')[0].appendChild(script);
console.log('ScriptAutoRunner executed.');

// pixivのページ遷移難しいわ
// ページ変わっても差分しか変わらん
// そういうサーバーフレームなんだろう
// ページ遷移毎にJS発火させる方法を探さなければならない

// gitも視野に入れないとコード長くてめんどくさい
