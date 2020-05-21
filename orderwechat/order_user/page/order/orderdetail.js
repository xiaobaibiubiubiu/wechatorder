// pages/order/balance/balance.js
var app = getApp();
var request = require('../../utils/requestServer.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cart: {
      count: 0,
      total: 0,
      list: [],
      shop_id:0
    },
    pack_charge:0,
    pay: false,
    remarks: '',//用户备注
    noReturn: 0,//未反馈
    order: {
      foodCode: '',
      orderId: 0,
      orderPayTime: '',
      orderNum: ''
    },
    showcart: false,
    windowhidden: true,
    showexit: false,
    loadingHidden: true,
    storename: '',
    foodcode: '',
    intervalTime: 2000,
    coin:'',
  },
  //检查shopId错误
  checkShopIdError: function (options) {
    console.log('进入检查shopId错误');
    let that = this;
    if(options==''){
      console.log('从缓存中读：'+wx.getStorageSync('cart.shop_id'));
      if (wx.getStorageSync('cart.shop_id') == 'undefined' || wx.getStorageSync('cart.shop_id') == '' || wx.getStorageSync('cart.shop_id') == 0 ){
        //此时shopId出错了
        console.log('参数中没有传过来');
      }else{
        that.setData({
          'cart.shop_id': wx.getStorageSync('cart.shop_id')
        });
        that.setData({
          'cart.shop_id': that.data.cart.shop_id
        });
      }
    }else{
      console.log('从参数中读：' + options.shop_id);
      if (options.shop_id == 'undefined' || options.shop_id == '' || options.shop_id == 0) {
        //此时shopId出错了
        //如果缓存中没有出错，则赋值给它
        if (wx.getStorageSync('cart.shop_id')!=''){
          options.shop_id = wx.getStorageSync('cart.shop_id')
        }
      }
      that.setData({
        'cart.shop_id': options.shop_id
      });
      that.setData({
        'cart.shop_id': that.data.cart.shop_id
      });
      console.log(that.data.cart.shop_id);
    }
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('当前税率：'+app.globalData.taxRate)
    console.log('从参数中取：'+options.pack_charge);
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
    
    this.setData({
      cart: {
        open_id: wx.getStorageSync('open_id'),
        count: wx.getStorageSync('cart.count'),
        total: wx.getStorageSync('cart.total'),
        // shop_id:options.shop_id,
        list: wx.getStorageSync('cart.list'),
      },
      
      //taxRate:app.globalData.taxRate,
      taxRate: options.taxRate,
      pack_charge:options.pack_charge,
      storename: wx.getStorageSync('storename'),
      coin: options.coin,
    })
    this.setData({
      finalTotal: this.data.cart.total * (1 + options.taxRate/100) 
    });
    console.log(this.data.finalTotal);
  
    var listlength = this.data.cart.list.length;
    for(var i=0;i<listlength;i++){
      var pack = 'cart.list[' + i + '].is_pack';
      this.setData({
        [pack]:0,
      })
    }
    console.log(this.data.cart.list);

    this.checkShopIdError(options);
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //初始：false
    //在此页面时false
    //离开此页面时true
    app.globalData.odUnload = false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    // this.setData({
    //   cart: {
    //     open_id: wx.getStorageSync('open_id'),
    //     count: wx.getStorageSync('cart.count'),
    //     total: wx.getStorageSync('cart.total'),
    //     //shop_id: wx.getStorageSync('cart.shop_id'),
    //     //shop_id: options.shop_id,
    //     list: wx.getStorageSync('cart.list'),
    //   },
    //   storename: wx.getStorageSync('storename')
    // })
    this.checkShopIdError('');
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
    app.globalData.odUnload = true;
    console.log(app.globalData.odUnload);
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
  //获取备注
  getRemarks: function (e) {
    var data = e.detail.value;
    this.setData({
      remarks: data
    })
  },
  gopay: function (e) {
    //保存订单到数据库，获取取餐码
    //跳转之前需要进行轮询
    var that = this;
    var form_id = e.detail.formId;
    //var fcget =setInterval(this.getFoodCode(), 50);
    console.log(that.data.cart.shop_id);
    if (typeof (that.data.cart.shop_id) == 'undefined' || typeof (that.data.cart.shop_id) == 'null' || typeof (that.data.cart.shop_id) == 0) {
      console.log('此处有错');
      //提示用户
      wx.showModal({
        title: '下单失败',
        content: '请重新下单',
        showCancel: false,
        success: function (res) {
          console.log('取消成功');
        }
      })
    } else {
      that.data.order.foodCode = this.getFoodCode(form_id);
    }

  },
  getFoodCode: function (data) {
    var form_id = data;
    var that = this;
    console.log(that.data.cart.shop_id);
    console.log(JSON.parse(JSON.stringify(that.data.cart)));
    // console.log(JSON.parse(JSON.stringify(this.data.cart.list)));
    var list_string = JSON.stringify(that.data.cart.list);
    var data = {
      remarks: that.data.remarks,
      goods_count: that.data.cart.count,
      total: that.data.finalTotal,
      list: list_string,
      shop_id: that.data.cart.shop_id,
      open_id: that.data.cart.open_id,
      form_id: form_id,
    };
    var header = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    //请求取餐码
    request.sendRequest('/Wxorder/submitOrder', 'POST', data, header)
      .then(function (response) {
        console.log(response.data);
        //获取到取餐码
        console.log('要清空购物车的档口ID：' + that.data.cart.shop_id);
        that.clearRedCount(that.data.cart.shop_id);//在全局购物车中清除数据
        that.data.order.foodCode = response.data.food_code;
        that.data.order.orderId = response.data.order_id;
        that.setData({
          showexit: true,
          showcart: true,
          windowhidden: false,
          loadingHidden: false,
          foodcode: response.data.food_code,
          waitCount:response.data.wait_count
        });
        //发起轮询
        var ask;
        var deadLine = 0;
        ask = setInterval(function () {
          if (that.data.noReturn == 1 || that.data.noReturn == 3 || deadLine == 150) {//当该订单被确认或者轮询时间结束
            clearInterval(ask);//则停止轮询
            ask = undefined;
            if (that.data.noReturn == 1) {
              // that.clearRedCount(that.data.cart.shop_id);//在全局购物车中清除数据
              that.setData({
                showexit: false,
                showcart: false,
                windowhidden: true,
                loadingHidden: true,
                foodcode: ''
              });
              if (app.globalData.odUnload==false) {
                wx.navigateBack({
                  delta: 1
                })
                app.globalData.clearCart = true;
              }
              wx.showModal({
                title: '请等待取餐',
                content: '档口:' + that.data.storename + '  |  取餐码:' + that.data.order.foodCode,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    app.globalData.clearCart = true;
                  }
                }
              })
            } else if (that.data.noReturn == 3) {
              that.clearRedCount();
            } else {
              console.log('已超过即使期限');
              //提示
              //发起取消订单
              console.log('向后台发送撤销的订单号' + that.data.order.orderId);
              that.cancelPay(that.data.order.orderId);
              wx.showModal({
                title: '等待付款已超时',
                content: '请重新下单',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    //回到选好之后的页面
                    that.setData({
                      showexit: false,
                      showcart: false,
                      windowhidden: true,
                      loadingHidden: true,
                      foodcode: ''
                    });
                  }
                }
              })
              //取消订单发送
              return;
            }
          }
          deadLine += 1;//循环一次2秒 60秒为30次 5*60/2=150次
          console.log('轮询次数：' + deadLine);
          that.waitConfirmPay();
        }, that.data.intervalTime);

      }, function (error) {
        console.log(error);
      });
  },
  waitConfirmPay: function () {
    var that = this;
    var url = '/Wxorder/confirmPay?orderId=' + that.data.order.orderId;
    //no return 
    //接收回馈
    request.sendRequest(url, 'GET', {}, {})
      .then(function (response) {
        console.log(response);
        //收到反馈
        //返回标志位
        if (response.data.order_status == 1) {
          that.data.noReturn = 1;
          that.data.order.orderPayTime = response.data.pay_time;
          that.data.order.orderNum = response.data.o_num;
          console.log(that.data.order);
        }
        else if(response.data.order_status==3){
          that.data.noReturn = 3;
        }
      }, function (error) {
        console.log(error);
      });
  },
  //撤销订单
  cancelPay: function (id) {
    var that = this;
    var orderId = id;
    var url = '/Wxorder/cancelPay?orderId=' + orderId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (response) {
        console.log(response.data);
      }, function (error) {
        console.log(error);
      });
  },
  clearRedCount: function (shopId) {
    //传进来一个s_id,定点清除
    console.log('定点清除');
    for (var i = 0; i < app.globalData.buyCar.length; i++) {
      if (app.globalData.buyCar[i].shop_id == shopId) {
        app.globalData.buyCar.splice(i, 1);
        break;
      }
    }
    console.log(app.globalData.buyCar);
  },
  //点“+”增加打包份数
  bindPlus: function (e) {
    this.bindplus(e.target.dataset.id);
  },

  bindplus: function (id) {
    //id是该菜品的id
    var len = this.data.cart.list.length;
    var good = {
      goodId: -1,
      count: 0,
      pack_num: 0
    };
    //加打包的份数
    for (var i = 0; i < len; i++) {
      if (this.data.cart.list[i].goodId == id) {
        good.count = this.data.cart.list[i].count;
        console.log(good.count);
        good.pack_num = this.data.cart.list[i].pack_num;
        if (good.pack_num < good.count) {
          this.data.cart.list[i].pack_num += 1;
        }

        this.setData({
          pack_num: this.data.cart.list[i].pack_num,
          //minusStatus: minusStatus
        });
        this.countTotal();
        return;
      }
    }
  },
  //点“-”减少打包份数
  bindMinus: function (e) {
    this.bindminus(e.target.dataset.id);
  },

  bindminus: function (id) {
    var len = this.data.cart.list.length;
    var good = {
      goodId: -1,
      count: 0,
      pack_num: 0
    };
    for (var i = 0; i < this.data.cart.list.length; i++) {
      if (this.data.cart.list[i].goodId == id) {
        if (this.data.cart.list[i].pack_num == 0) {
          this.data.cart.list.pack_num = 0;

        } else {
          this.data.cart.list[i].pack_num -= 1;
        }

        this.setData({
          pack_num: this.data.cart.list[i].pack_num,
          //minusStatus: minusStatus
        });
        this.countTotal();
      }
    }
  },
  countTotal: function () {
    var count = 0,
      total = 0;
    for (var i = 0; i < this.data.cart.list.length; i++) {
      var good = this.data.cart.list[i];//所选商品
      var pack_charge = parseFloat(this.data.pack_charge);
      var pack_num = pack_num;
      var listpack="cart.list["+i+"].is_pack";
      console.log(pack_charge);
      console.log(good);
      // console.log(good.typeId);//菜品类型
      // console.log(good.goodId);//菜品
      // console.log(good.count);//菜品数量
      console.log(good.goodPrice);
      // console.log(parseFloat(good.goodPrice));
      count += good.count;
      pack_num += good.pack_num;
      total += Number((good.count * good.goodPrice + good.pack_num * pack_charge).toFixed(2));
      console.log(total);
      if(good.pack_num>0){
        this.setData({
          [listpack]:1
        })
      }
    }
    this.data.cart.count = count;
    this.data.cart.total = total;
    this.setData({
      cart: this.data.cart,
      finalTotal: this.data.cart.total
    });
  },

})