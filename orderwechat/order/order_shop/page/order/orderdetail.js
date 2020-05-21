// pages/order/balance/balance.js
var request = require('../../utils/requestServer.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cart: {
      count: 0,
      total: 0,
      list: []
    },
    pay:false,
    remarks:'',//用户备注
    noReturn:0,//未反馈
    order:{
      foodCode:'',
      orderId: 0,
      orderPayTime:'',
      orderNum:''
    },
    showcart: false,
    windowhidden: true,
    showexit: false,
    loadingHidden: true,
    foodcode:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
    this.setData({
      cart:{
        open_id:wx.getStorageSync('open_id'),
        count: wx.getStorageSync('cart.count'),
        total: wx.getStorageSync('cart.total'),
        shop_id: wx.getStorageSync('cart.shop_id'),
        list: wx.getStorageSync('cart.list'),
      },
    })
  },
  //获取备注
  getRemarks: function (e) {
    var data = e.detail.value;
    this.setData({
      remarks: data
    })
  },
  gopay:function(){
    //保存订单到数据库，获取取餐码
    //跳转之前需要进行轮询
    var self = this;
    //var fcget =setInterval(this.getFoodCode(), 50);
    self.data.order.foodCode=this.getFoodCode();
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
  
  },
  getFoodCode:function(){
    var that=this;
    console.log(JSON.parse(JSON.stringify(this.data.cart.list)));
    var list_string = JSON.stringify(this.data.cart.list);
    var data={
      remarks: this.data.remarks,
        goods_count: this.data.cart.count,
          total: this.data.cart.total,
            list: list_string,
              shop_id: this.data.cart.shop_id,
                open_id:this.data.cart.open_id,
    };
    console.log(data);
    var header={
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    request.sendRrquest('/Wxorder/submitOrder', 'POST', data, header)
      .then(function (response) {
        //获取到取餐码
        that.data.order.foodCode = response.data.food_code;
        that.data.order.orderId = response.data.order_id;
        that.setData({
          showexit: true,
          showcart: true,
          windowhidden: false,
          loadingHidden: false,
          foodcode: response.data.food_code
        });
        //发起轮询
        var ask;
          ask=setInterval(function(){
            if (that.data.noReturn == 1) {
              clearInterval(ask);
              ask = undefined;
              wx.redirectTo({
                // url: '../order/number?foodcode=' + that.data.order.foodCode
                url: '../order/number?foodCode=' + that.data.order.foodCode + '&orderPayTime=' + that.data.order.orderPayTime + '&orderNum=' + that.data.order.orderNum
              });
            }
            that.waitConfirmPay();
          },2000);
          
        }, function (error) {
        console.log(error);
      });  
  },
  waitConfirmPay:function(){
    var that = this;
    var url = '/Wxorder/confirmPay?orderId='+that.data.order.orderId;
    //no return 
    //接收回馈
    request.sendRrquest(url, 'GET', {}, {})
      .then(function (response) {
        //console.log(response.data.order_status);
        //收到反馈
        //返回标志位
        if(response.data.order_status==1){
          that.data.noReturn = 1;
          that.data.order.orderPayTime = response.data.pay_time;
          that.data.order.orderNum = response.data.o_num;
          console.log(that.data.order);
        }
        else{
        }
      }, function (error) {
        console.log(error);
      });  
  },
  //撤销订单
  cancelOrder: function (id) { 
    var that = this;
    var orderId=id;
    var url = '/Wxorder/confirmPay?orderId='+orderId;
    request.sendRrquest(url, 'GET', {}, {})
      .then(function (response) {
        console.log(response.data);
      }, function (error) {
        console.log(error);
      });  
  }
})