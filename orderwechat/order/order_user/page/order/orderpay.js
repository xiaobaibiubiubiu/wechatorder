// pages/order/detail/detail.js
var request = require('../../utils/requestServer.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    taxRate: app.globalData.taxRate,
    order:{
      o_num: '',
      sub_time: '',
      wait_num: '',
      total_money: 0,
      pay_time:'',
      detail: [],
      coin:'',
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('当前税率：'+app.globalData.taxRate)
    console.log(this.data.taxRate)
    console.log(options);
    var that = this;
    that.setData({
      coin: options.coin,
      taxRate: options.taxRate
    })
    console.log(this.data.taxRate)
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
    var url = '/Wxorder/getOrderDetail?o_id=' + options.o_id;
    request.sendRequest(url, 'GET', {}, {})
    .then(function(res){
      console.log(res);
      console.log(res.data[0].o_num);
      console.log(res.data[0].detail);
      that.setData({
        order: {
          status: res.data[0].order_status,
          o_num: res.data[0].o_num,
          sub_time: res.data[0].sub_time,
          wait_num: res.data[0].wait_num,
          total_money: res.data[0].total_money,
          detail: res.data[0].detail,
          pay_time: res.data[0].pay_time,
        }
      })
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})