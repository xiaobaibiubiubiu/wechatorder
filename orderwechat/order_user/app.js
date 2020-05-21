var server = require('./utils/server');
var request = require('./utils/requestServer.js');
App({
	onLaunch: function () {
		console.log('App Launch');
		var that = this;
    that.getAds();//获取所有广告
    //that.getUserInfo();
		var rd_session = wx.getStorageSync('rd_session');
    var rd_openid = wx.getStorageSync('open_id');
		console.log('rd_session', rd_session);
    console.log('rd_openid',rd_openid);
		if (!rd_session) {
			that.login();
		} else {
			wx.checkSession({
				success: function () {
					// 登录态未过期
					console.log('登录态未过期')
					that.rd_session = rd_session;
					that.getUserInfo();
				},
				fail: function () {
					//登录态过期
					that.login();
				}
			})
		}
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	},
	globalData: {
		hasLogin: false,
    banners:[],
    shops:[],
    open_id:'',
    buyCar:[],//全局购物车，单店购物车内容从这里取
    odUnload:false,//orderDetail页面是否卸载 
    clearCart:false,//清除购物车 为true时在shop的show函数中清除
	},
	login: function() {
		var that = this;
		wx.login({
			success: function (res) {
				console.log('wx.login', res.code);
        wx.request({
          url: 'https://bjshuyiyuan.top/wechatorder/index.php/Apiwx/Wxorder/doLogin?code='+ res.code+'&flag=1',
          success:function(res){
              that.globalData.open_id=res.data.openid;
              that.rd_session = res.data.session_key; 
              wx.setStorageSync('rd_session', that.rd_session);
              wx.setStorageSync('open_id', that.globalData.open_id);
              that.globalData.hasLogin = true;            
          },
          fail:function(){
              console.log('error');
          }
        })			
				that.getUserInfo();
			}
		});
	},
	getUserInfo: function() {
		var that = this;
		wx.getUserInfo({
			success: function(res) {
				console.log('getUserInfo', res)
				that.globalData.userInfo = res.userInfo;
	},
    });
  },
  getAds: function () {
    var self = this;
    request.sendRequest('/Wxorder/getAd', 'GET', {}, {})
      .then(function (response) {
        for (var attr in response.data) {
          self.globalData.banners.push(response.data[attr]);
        }
        console.log(self.globalData.banners);
      }, function (error) {
        console.log(error);
      });
  }
})
