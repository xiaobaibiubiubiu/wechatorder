// 本服务用于封装请求
// 返回的是一个promisepromise
var server = "https://bjshuyiyuan.top/wechatorder/index.php/Apiwx";
//var server = "http://59.110.162.23/wechatorder/index.php/Apiwx";
var sendRequest = function (url, method, data, header) {
  console.log(server + url);
  console.log(header);
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: server + url,
      data: data,
      method: method,
      header: header,
      success: resolve,
      fail: reject
    })
  });
  return promise;
};

module.exports.sendRequest = sendRequest;