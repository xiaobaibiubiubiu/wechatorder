var app = getApp();
var server = require('../../utils/server');
var request = require('../../utils/requestServer');
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    exitif:true,
    showexit:false,
    exitbind:false,
    bindexit:true,
    nowtab:"菜品概览"
  },
  onLoad: function () {
    console.log('mine onload')
    console.log(app.globalData.userInfo);
    var s_id = wx.getStorageSync('s_id');
    console.log(s_id);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        },
        fail:function(){
          this.setData({
            userInfo:{},
            hasUserInfo:false
          })
        }
      })
    }
    wx.request({
      url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Wxmanager/getPrintExist?s_id=' + s_id,
      success:  (res) =>{
        console.log(res);
        if (res.data == 1) {
          this.setData({
            hasPrinter: true
          })
        } else {
          this.setData({
            hasPrinter: false
          })
        }
      }
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  exitbind:function(){
    this.setData({
     showexit:true,
     bindexit:false,      
    })
  },
  bindexit:function(){
    var openid = wx.getStorageSync('open_id');
    var sid = wx.getStorageSync('s_id');
    console.log(openid);
    console.log(sid);
    this.setData({
      showexit: false,
      bindexit: true,
    });
    var url = '/Wxmanager/unbindingshop?open_id=' + openid + '&s_id=' + sid;
    request.sendRequest(url,'GET',{},{})
    .then(function(res){
      console.log(res);
      if (res.data == "success") {
        wx.showToast({
          title: '解除绑定成功',
          icon: 'success',
          duration: 2000,
          mask: false,
          success: function () {
            setTimeout(function () {
              wx.removeStorageSync('s_id');
              //wx.clearStorage();
              wx.navigateTo({
                url: "../order/bindu",
              })
            }, 1000) //延迟时间 
          }
        });
      } else if (res.data == "wrong") {
        wx.showToast({
          title: '不是本人操作',
          icon: 'none',
          duration: 2000,
          mask: false,
          success: function () {
            setTimeout(function () {

            }, 1000) //延迟时间 
          }
        });
      } else if (res.data == "error") {
        wx.showToast({
          title: '没有绑定用户',
          icon: 'none',
          duration: 2000,
          mask: false,
          success: function () {
            setTimeout(function () {
              wx.navigateTo({
                url: "../order/bindu",
              })
            }, 1000) //延迟时间 
          }
        });
      }
    });
  },
  bindcanexit:function(){
    this.setData({
      showexit:false,
      bindexit:true,
    })
  },
  foodScan:function(el){
    
    wx.navigateTo({
      url: '../food/index?toTab'+el.target.dataset.totab
    })
  },
  foodAdd: function (el) {
    wx.navigateTo({
      url: '../food/index?toTab='+el.target.dataset.totab
    })
  },
  infoManage: function (el) {
  wx.navigateTo({
    url: '../info/index?toTab=' + el.target.dataset.totab
    })
  },
  saleManage: function (el) {
    wx.navigateTo({
      url: '../sales/sales'
    })
  },
  printer: function (el) {
    wx.navigateTo({
      url: '../info/printer?toTab=' + el.target.dataset.totab
    })
  },
  Password:function(el) {
    wx.navigateTo({
      url: '../mine/password',
    })
  }

}); 