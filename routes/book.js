/* パッケージ読み込み */
var express = require('express');
const request = require('request');
var router = express.Router();
var connection = require('./mysql_connection');
connection.query("select * from STATISTICS", function(err, rows) {
  console.log(rows);
});

/* グローバル変数 */
const BookData = JSON.stringify(require("../bookdata.json"));

/* 関数 */
function doRequest(option) {
  return new Promise(function(resolve, reject) {
    request(option, function(error, res, body) {
      if(!error && res.statusCode == 200) {
        //let data = body.replace(/\\n?/g, "");
        resolve(JSON.parse(body));
      } else {
        reject(body);
      }
    });
  });
}


/* urlの受け口を実装する */
/* root(/) is /shiwori/book/. */

/* 本の情報を取得する */
router.get('/', async function(req, res, next) {
  const isbn = req.query.isbn;
  const option = {
    method: "GET",
    url: "https://www.googleapis.com/books/v1/volumes",
    qs: {
      q: "isbn:" + isbn,
      Country: "JP"
    }
  }
  var googlebook = await doRequest(option);
  var googlebook = googlebook.items[0]
  var book = JSON.parse(BookData);
  book.author = googlebook.volumeInfo.authors.join(",");
  book.title = googlebook.volumeInfo.title;
  book.imgUrl = googlebook.volumeInfo.imageLinks.thumbnail;
  book.pageData.total = googlebook.volumeInfo.pageCount;
  res.json(book);
});

module.exports = router;