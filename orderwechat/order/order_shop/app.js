var server = require('./utils/server');
var request = require('./utils/requestServer.js');
App({
	onLaunch: function () {
		console.log('App Launch');
		var that = this;
    //path :"page/order/order";
    // that.getAds();//获取所有广告
    that.getUserInfo();
    that.getTradeAreaInfo();//获取商圈
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
					
				},
				fail: function () {
					//登录态过期
					that.login();
				}
			})
		}
	},
	onShow: function () {
		console.log('App Show');
    // var rd_openid = wx.getStorageSync('open_id');
    // console.log(rd_openid);
    // wx.request({
    //   url: 'http://localhost/wechatorder/index.php/Apiwx/Wxmanager/judgeLogin?open_id=' + rd_openid,
    //   success: function (res) {
    //     console.log(res);
    //     if(res.data!=0){
    //       wx.setStorageSync('s_id', res.data);
    //     }else{
          
    //       wx.navigateTo({
    //         url: 'page/order/bindu',
    //       })
    //     }
    //   },
    //   fail: function () {
    //     console.log('error');
    //   }
    // })			
	},
	onHide: function () {
		console.log('App Hide')
	},
	globalData: {
		hasLogin: false,
    banners:[],
    shops:[],
    open_id:'',
    currentFood: {},
    crFoodType: {},
	},
	rd_session: null,
	login: function() {
		var that = this;
		wx.login({
			success: function (res) {
				console.log('wx.login', res.code);
        wx.request({
          url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Wxorder/doLogin?flag=0&code='+ res.code,
          success:function(res){
              that.globalData.open_id=res.data.openid;
              that.rd_session = res.data.session_key; 
              wx.setStorageSync('rd_session', that.rd_session);
              wx.setStorageSync('open_id', that.globalData.open_id);
              that.globalData.hasLogin = true; 
               wx.request({
                 url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Wxmanager/judgeLogin?open_id=' + res.data.openid,
            success: function (res) {
              console.log(res);
              if (res.data != 0) {
                wx.setStorageSync('s_id', res.data['s_id']);
                wx.setStorageSync('s_coin', res.data['coin']);
                wx.setStorageSync('s_tax_rate', res.data['tax_rate']);
                wx.setStorageSync('s_groupid', res.data['groupid']);
              } 
               },
                fail: function () {
                  console.log('error');
                }
    })
          },
          fail:function(){
              console.log('error');
          }
        })			
        //that.getUserInfo();
        
			}
		});
	},
	getUserInfo: function() {
		var that = this;
		wx.getUserInfo({
			success: function(res) {
				console.log('getUserInfo', res);
				that.globalData.userInfo = res.userInfo;
	},
    });
  },
  //获取所有商圈
  getTradeAreaInfo: function () {
    var that = this;
    var url = "/Wxgoodsupdate/getTradeAreaInfo";
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.globalData.tradeArea = res.data;
      }, function (error) {
        console.log(error);
      });
  },
  globalData:{
    buyCar:[]
  },

})
