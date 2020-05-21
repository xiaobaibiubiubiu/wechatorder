// pages/order/order.js
var request = require('../../utils/requestServer');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIndex: 0,
    //order:[],
    open_id: wx.getStorageSync('open_id'),
    s_id: wx.getStorageSync('s_id'),
    oorder: [],
    odetail: [],
    detail: [],
    topNum: 0,
    is_pack: false,
    hasorder: true, //有无订单，默认true 隐藏
    pageindex: 1, //第几次加载
    callbackcount: 10, //返回数据的个数  
    Loading: false, //"上拉加载"的变量，默认true，隐藏  
    LoadingComplete: true, //“没有数据”的变量，默认true，隐藏  
    isFromSearch: true, // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
    interval: '',
    intervalTime: 3000,//暂设3秒
    showView: true
  },
  onChangeShowState: function () {
    var that = this;
    that.setData({
      showView:(!that.data.showView)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    showView:(options.showView == "true" ? true : false);

  },
 
 
  onShow: function () {
    console.log('OrderonShow');
    var that = this;
    var s_id = wx.getStorageSync('s_id');
    var open_id = wx.getStorageSync('open_id');
    console.log(s_id);
    if (that.data.tabIndex == -1) {
      that.setData({
        tabIndex: 0
      });
    }
    if (s_id == 0) {
      wx.redirectTo({
        url: '../order/bindu',
      })
    } else {
      var url = '/Wxmanager/judgeBind?s_id=' + s_id + '&open_id=' + open_id;
      request.sendRequest(url, 'GET', {}, {})
        .then(function (res) {
          console.log(res.data);
          //不仅获取状态code
          //还有货币
          //以及税率
          // wx.setStorageSync('s_coin', res.data.coin);
          // wx.setStorageSync('s_tax_rate', res.data.tax_rate);
          if (res.data == 1) {
            if (that.data.tabIndex == 0) {
              that.getorderSub();
              that.changeOrder();
            }
          } else {
            wx.redirectTo({
              url: '../order/bindu',
            })
          }
        }, function (error) {
          console.log('出错了~');
        });
    }
  },
  searchorderid: function () {
    wx.navigateTo({ url: 'searchorderid' });
  },
  onHide: function () {
    //替换为
    this.clearTimeInterval(this.data.interval);
    this.setData({
      tabIndex: -1
    });
    console.log('全部轮询停止后Tab:' + this.data.tabIndex);
  },
  // 待付款
  getorderSub: function () {
    
    var that = this;
   
    console.log(that.data.open_id);
    var s_id = wx.getStorageSync('s_id');
    console.log(s_id);
    var url = '/Wxmanager/getStoreSub?s_id=' + s_id;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        if (res.data == 1) { } else if (res.data.length == 0) {
          that.setData({
            order: [],
            hasorder: false,
          })
        } else if (res.data.length != 0) {
          for (var attr in res.data) {
            var oorder = [];
            oorder.push(res.data[attr]);
            for (var attr1 in oorder[attr]) {
              var odetail = [],
                odetail = oorder[attr];
              var detail = [];
              detail.push(odetail[attr1]);
            }
          };
          that.setData({
            order: res.data,
            hasorder: true,
            coin: wx.getStorageSync('s_coin'),
          
          })
          console.log(that.data);
        }
      });
  },
  // 待取餐
  getorderPay: function () {
    var that = this;
    var s_id = wx.getStorageSync('s_id');
    var url = '/Wxmanager/getStorePay?s_id=' + s_id;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        if (res.data == 1) { } else if (res.data.length == 0) {
          that.setData({
            order: [],
            hasorder: true,
          })
        } else if (res.data.length != 0) {
          for (var attr in res.data) {
            var oorder = [];
            oorder.push(res.data[attr]);
            for (var attr1 in oorder[attr]) {
              var odetail = [],
                odetail = oorder[attr];
              var detail = [];
              detail.push(odetail[attr1]);
            }
          };
          that.setData({
            order: res.data,
            hasorder: true,
            coin: wx.getStorageSync('s_coin'),
           
          })
          console.log(that.data.order[0].detail);
        }
      });
  },
  //已完成
  getorderDone: function (condition) {
    console.log("orderdone");
    var that = this;
    if (condition == "click") {
      that.setData({
        oorder: [],
        detail: [],
        pageindex: 1,
      })
    }
    var s_id = wx.getStorageSync('s_id');
    var pageindex = that.data.pageindex;
    var callbackcount = that.data.callbackcount;
    var oorder = that.data.oorder;
    var odetail = that.data.odetail;
    var detail = that.data.detail;
    console.log(oorder);
    console.log(detail);
    var url = '/Wxmanager/getStoreDone?s_id=' + s_id + '&pageindex=' + pageindex + '&callbackcount=' + callbackcount;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        console.log(res.data.length);
        if (res.data == 1) { } else if (res.data.length == 0 && that.data.pageindex == 1) {
          that.setData({
            order: [],
            LoadingComplete: false,
            Loading: true,
            isFromSearch: true
          })
        } else if (res.data.length == 0 && that.data.page != 1) {
          that.setData({
            order: oorder,
            Loading: true,
            LoadingComplete: false,
            isFromSearch: true
          })
        } else if (res.data.length != 0) {
          for (var attr in res.data) {
            // var oorder = [];
            //console.log(attr);
            oorder.push(res.data[attr]);
            for (var attr1 in oorder[attr]) {
              // var odetail = [];
              // console.log(attr1);
              odetail = oorder[attr];
              // var detail = [];
              detail.push(odetail[attr1]);
            }
          };
          that.setData({
            // order: res.data,
            // order:that.data.oorder,
            order: oorder,
            Loading: true,
            isFromSearch: false,
            coin: wx.getStorageSync('s_coin'),
          })
        }
      });
  },
  onReachBottom: function () {
    this.ScrollLower();
  },
  ScrollLower: function () {
    console.log("scrolltolower");
    let that = this;
    if (that.data.Loading && that.data.LoadingComplete && that.data.tabIndex == 2) {
      that.setData({
        Loading: false,
        pageindex: that.data.pageindex + 1, //每次触发上拉事件，把searchPageNum+1  
        isFromSearch: false //触发到上拉事件，把isFromSearch设为为false  
      });
      console.log(that.data.pageindex);
      console.log(that.data.Loading);
      setTimeout(function () {
        that.getorderDone();
      }, 1500)

    }
  },
  changeTab: function (e) {
    var that = this;
    
    var index = e.currentTarget.dataset.index
    that.setData({
      tabIndex: index,
    })
    if (index == 1) {
      that.getorderPay();
      that.changeOrder();
    } else if (index == 2) {
      that.getorderDone("click");
      that.changeOrder();
    } else if (index == 0) {
      that.getorderSub();
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
      that.getorderSub();
      interval = setInterval(function () {
        that.stopTimeInterval(0);
        that.getorderSub();
      }, that.data.intervalTime);
      that.setData({
        interval: interval
      });
    }
    
    if (that.data.tabIndex == 2) {
      that.clearTimeInterval();
      //that.getorderDone();
      // interval = setInterval(function () {
      //   that.stopTimeInterval(2);
      //   that.getorderDone();
      // }, that.data.intervalTime);
      // that.setData({
      //   interval: interval
      // });
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
  //进入新轮询的初始化
  changeOrderWithRefresh: function () {
    var that = this;
    //去掉不会有闪现空白
    // that.setData({
    //   order:[]
    // });
    console.log('当前tab:' + that.data.tabIndex);
    if (that.data.tabIndex == 0) {
      that.getorderSub();
    }
    
    if (that.data.tabIndex == 2) {
      that.getorderDone();
    }
  },
  submoney: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认用户付款？',
      success: function (res) {
        if (res.confirm) {
          var access_token = '';
          //var form_id = e.detail.formId;
          var o_id = e.detail.target.dataset.o_id;
          //console.log(o_id);
          //console.log(e);
          //console.log(form_id);
          var url = '/Wxmanager/storeConfirmPay?o_id=' + o_id;
          request.sendRequest(url, 'GET', {}, {})
            .then(function (res) {
              wx.showToast({
                title: '确认收款成功',
                icon: 'success',
                duration: 1300
              });
              that.getorderSub();
            }, function (error) {
              //  console.log('失败啦，兄弟');
              that.getorderSub();
            });
        } else if (res.cancel) {
          //console.log('商户误点')
        }
      }
    })
  },
  suborder: function (e) {
    var that = this;
    var o_id = e.detail.target.dataset.o_id;
    console.log(o_id);
    var url = '/Wxmanager/storeConfirmDone?o_id=' + o_id;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        wx.showToast({
          title: '已通知用户取餐',
          icon: 'success',
          duration: 1300
        })
        that.getorderPay();

      })
  },
  returnTop: function () {
    console.log("top");
    this.setData({
      topNum: this.data.topNum = 0,
    })
  }

})