var request = require('../../utils/requestServer');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    error: true,
    binderror: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  bindu: function(e) {
    console.log(e);
    var that = this;
    var rd_openid = wx.getStorageSync('open_id');
    console.log(rd_openid);
    var username = e.detail.value.username;
    var password = e.detail.value.password;
    console.log(username);
    console.log(password);
    console.log('https://bjshuyiyuan.top/wechatorder/index.php/Apiwx/Wxmanager/bindshop?open_id=' + rd_openid + '&user_name=' + username + '&password=' + password);
    var url = '/Wxmanager/bindshop?open_id=' + rd_openid + '&user_name=' + username + '&password=' + password;
    request.sendRequest(url, 'GET', {}, {})
      .then(function(res) {
        console.log(res);
        if (res.data != 0 && res.data != 'errorbind' && res.data != 'psderror') {
          //wx.setStorageSync('s_id', res.data);
          //不仅获取s_id
          //还有货币
          //以及税率
          wx.setStorageSync('s_id', res.data.s_id);
          wx.setStorageSync('s_coin', res.data.coin);
          wx.setStorageSync('s_tax_rate', res.data.tax_rate);
          wx.showToast({
            title: '绑定成功！',
            icon: 'success',
            duration: 1300
          });
          wx.switchTab({
            url: '../order/order',
          })
        } else if (res.data == 'errorbind') {
          that.setData({
            binderror: false,
            error: true
          })
        } else if (res.data == 'psderror') {
          that.setData({
            error: false,
            binderror: true
          })
        }
      }, function(error) {
        console.log(res.data);
        that.setData({
          error: false
        })
      });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})