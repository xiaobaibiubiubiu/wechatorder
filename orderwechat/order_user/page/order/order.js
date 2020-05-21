var request = require('../../utils/requestServer.js');
var app = getApp();
// pages/order/order.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabIndex: 0,
    status: 0,
    order: [],
    open_id: wx.getStorageSync('open_id'),
    hasorder:true,
    pageindex: 1, //第几次加载
    callbackcount: 10,      //返回数据的个数  
    Loading: true, //"上拉加载"的变量，默认true，隐藏  
    LoadingComplete: true,  //“没有数据”的变量，默认true，隐藏  
    isFromSearch: true, // 用于判断searchSongList数组是不是空数组，默认true，空的数组 
    tabIndex: 0,//默认停留在'待付款'
    intervalTime: 3000,
    cancel: true,//取消订单弹框，默认隐藏
    drawer: true,//取消订单弹框背景，默认隐藏
    coin:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(app.globalData.group_coin);
    console.log('order OnLoad');
    var that = this;
    var open_id = wx.getStorageSync('open_id');
    that.setData({
      open_id:open_id
    });
    if (that.data.tabIndex == -1) {
      that.setData({
        tabIndex: 0
      });
    }
    that.setData({
      open_id: open_id
    });
    if (that.data.tabIndex == 0) {
      that.getOrderSub();
      that.changeOrder();
    }
    console.log(that.data);
  },
  onShow: function () {
    console.log('展示order');
    if (this.data.tabIndex == -1) {
      this.setData({
        tabIndex: 0
      });
    }
    if (this.data.tabIndex == 0) {
      this.getOrderSub();
      this.changeOrder();
    }
  },
  onHide: function () {
    //替换为
    this.clearTimeInterval(this.data.interval);
    // this.setData({
    //   tabIndex: -1
    // });
    console.log('全部轮询停止后Tab:' + this.data.tabIndex);
  },
  changeTab: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index
    that.setData({
      tabIndex: index,
    })
    if (index == 1) {
      that.getOrderPay();//待取餐
      that.changeOrder();
    } else if (index == 2) {
      that.getOrderDone("click");//已完成
      that.changeOrder();
    } else {
      that.getOrderSub();//待付款
      that.changeOrder();
    }
  },
  //   功能：轮询内容
  //应用场景：1.切换tab时改变轮询内容 2.停留在某一页面
  changeOrder: function () {
    var that = this;
    var interval;
    if (that.data.tabIndex == 0) {
      that.clearTimeInterval();
      that.getOrderSub();
      interval = setInterval(function () {
        that.stopTimeInterval(0);
        that.getOrderSub();
      }, that.data.intervalTime);
      that.setData({
        interval: interval
      });
    }
    if (that.data.tabIndex == 1) {
      that.clearTimeInterval();
      that.getOrderPay();

      interval = setInterval(function () {
        that.stopTimeInterval(1);
        that.getOrderPay();
      }, that.data.intervalTime);
      that.setData({
        interval: interval
      });
    }
    if (that.data.tabIndex == 2) {
      that.clearTimeInterval();
      //that.getOrderDone();
    }
  },
  //清除计时器
  clearTimeInterval: function () {
    var interval = this.data.interval;
    clearInterval(interval);
  },
  stopTimeInterval: function (tab) {
    var that = this;
    if (that.data.tabIndex != tab && that.data.tabIndex != -1) {
      //clearInterval(interval);
      //替换为
      that.clearTimeInterval();
      that.changeOrderWithRefresh();
      return;
    }
  },
  cancelorder: function (e) {
    console.log("cancelorder");
    console.log(getApp().globalData.buyCar);
    console.log(e.currentTarget.dataset.oid);
    console.log(e.currentTarget.dataset.sid);
    var that = this;
    that.setData({
      drawer: false,
      cancel: false,
      orderId: e.currentTarget.dataset.oid,
      shopId: e.currentTarget.dataset.sid,
    }), wx.showModal({
      title: '提示',
      content: '是否取消订单',
      success: function (res) {
        if (res.confirm) {
        that.subcancel();}
        else if (res.cancel){}
      },
    
    })
  },
  //进入新轮询的初始化
  changeOrderWithRefresh: function () {
    var that = this;
    //去掉不会有闪现空白
    // that.setData({
    //   order:[]
    // });
    console.log('当前tab:' + that.data.tabIndex);
    if (that.data.tabIndex == 0) {
      that.getOrderSub();
    }
    if (that.data.tabIndex == 1) {
      that.getOrderPay();
    }
    if (that.data.tabIndex == 2) {
      that.getOrderDone();
    }
  },
  //添加货币字段
  addCoin: function (r) {
    var that=this;
    for (var i in r) {
      //console.log(res.data[i])
      //console.log(r[i]['uid']);
      var coin = "order[" + i + "].coin";
      that.setData({
        [coin]: app.globalData.group_coin[r[i]['uid']]['coin'],
      })
      var taxRate = "order[" + i + "].taxRate";
      that.setData({
        [taxRate]: app.globalData.group_coin[r[i]['uid']]['tax_rate'],
      })
    }
  },
  //待付款
  getOrderSub: function () {
    console.log('轮询 待付款');
    var that = this;
    var url = '/Wxorder/getOrderSub?openid=' + that.data.open_id;
    request.sendRequest(url,'GET',{},{})
    .then(function(res){
      console.log(that.data.open_id);
      console.log(res);
      if (res.data == 1) {
        wx.showModal({
          title: '失败！',
          content: 'open_id获取失败',
        })
      }
      else if (res.data.length == 0) {
        that.setData({
          order: res.data,
          hasorder: false
        })
      }
      else if (res.data.length != 0) {
        that.setData({
          order: res.data,
          hasorder: true
        })
        that.addCoin(that.data.order)
      }
    });
  },
  //待取餐
  getOrderPay: function () {
    console.log('轮询 待取餐');
    var that = this;
    var url = '/Wxorder/getOrderPay?openid=' + that.data.open_id;
    request.sendRequest(url,'GET',{},{})
    .then(function(res){
      console.log(res.data);
      if (res.data == 1) {
        wx.showModal({
          title: '失败！',
          content: 'open_id获取失败',
        })
      }
      else if (res.data.length == 0) {
        that.setData({
          hasorder: false,
          order: res.data
        })
        console.log(that.data.order);
      }
      else if (res.data.length != 0) {
        console.log(res);
        that.setData({
          order: res.data,
          hasorder: true
        })
        console.log(that.data.order);
        that.addCoin(that.data.order);
      }
    })
  },
  getOrderDone: function (condition) {
    var that = this;
    if(condition=="click"){
      that.setData({
        order:[],
        pageindex:1,
      })
    }
    var order = that.data.order;
    //console.log(that.data.coin);
    var url = '/Wxorder/getOrderDone?openid=' + that.data.open_id + '&pageindex=' + that.data.pageindex + '&callbackcount=' + that.data.callbackcount;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res){
        console.log(res.data);
        console.log(res.data.length);
        console.log(that.data.pageindex);
        if (res.data == 1) {
          wx.showModal({
            title: '失败！',
            content: 'open_id获取失败',
          })
        }
        else if (res.data.length == 0 && that.data.pageindex == 1) {
          that.setData({
            orderdone: [],
            LoadingComplete: false,
          })
        }
        else if (res.data.length == 0) {
          console.log("000");
          that.setData({
            Loading: true,
            LoadingComplete: false,
            isFromSearch: true,
          })
        }
        else if (res.data.length != 0) {
          console.log("111");
          for (var attr in res.data) {
            order.push(res.data[attr]);
          }
          that.addCoin(order);
          console.log(order)
          that.setData({
            orderdone: order,
            Loading: true,
            isFromSearch: false,
          })
          console.log(that.data.Loading);
        }
      });
  },
  onReachBottom:function(){
    this.ScrollLower();
  },
  ScrollLower: function () {
    console.log("scrolltolower");
    let that = this;    
    if (that.data.Loading && that.data.LoadingComplete) {
      that.setData({
        Loading: false,
        pageindex: that.data.pageindex + 1,  //每次触发上拉事件，把searchPageNum+1  
        isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
      });
      console.log(that.data.pageindex);
      console.log(that.data.Loading);
      setTimeout(function () {
        that.getOrderDone();
      }, 1500)
    }
  },
  // cancelorder: function (e) {
  //   console.log("cancelorder");
  //   console.log(getApp().globalData.buyCar);
  //   console.log(e.currentTarget.dataset.oid);
  //   console.log(e.currentTarget.dataset.sid);
  //   var that = this;
  //   that.setData({
  //     drawer: false,
  //     cancel: false,
  //     orderId: e.currentTarget.dataset.oid,
  //     shopId: e.currentTarget.dataset.sid,
  //   }), wx.showModal({
  //     title: '提示',
  //     content: res.data,
      
  //     success: function (res) {
  //   that.subcancel();
  //     }
  //   })
  // },
  cancel: function () {
    console.log("cancel");
    var that = this;
    that.setData({
      drawer: true,
      cancel: true,
      orderId: 0,
      shopId: 0,
    })
  },
  subcancel: function () {
    console.log("subcancel");
    var that = this;
    var orderId = that.data.orderId;
    var shopId = that.data.shopId;
    console.log(orderId);
    console.log(shopId);
    wx.showToast({
      title: '取消订单成功',
      icon: 'success',
      duration: 1300
    })
    that.cancelPay(orderId);
    that.clearRedCount(shopId);
    that.getOrderSub();
    that.setData({
      drawer: true,
      cancel: true,
    })

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
  returnTop: function () {
    console.log("top");
    this.setData({
      topNum: this.data.topNum = 0,
    })
  },
})