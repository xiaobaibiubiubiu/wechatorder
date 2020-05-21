var app = getApp();
var server = require('../../utils/server');
var request = require('../../utils/requestServer.js');
Page({
	data: {
		filterId: 1,
		// address: '定位中…',
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../imgs/stars/emptystar.png',
    selectedSrc: '../../imgs/stars/fullstar.png',
    halfSrc: '../../imgs/stars/halfstar.png',
    key: 0,//评分
    banners:[],
    shops:[],
    coin: '',
    orderCount:0//在这个店里的点餐个数
	},
  onLoad: function (options) {
    var that=this;
    // that.setData({
    //   banners: app.globalData.banners,
    //   //shops: app.globalData.shops
    // });
    that.getShop();
    that.getAds();
    //console.log(that.data.banners);
    // console.log(that.data.shops);
  },
  jumpToShop: function (e) {
    console.log(e.currentTarget.dataset.id);
    console.log(this.data.coin);
    var shopId = e.currentTarget.dataset.id;
    var coin = this.data.coin;
    wx.navigateTo({
      url: '/page/shop/shop?id=' + shopId + '&coin=' + coin+'&taxRate='+this.options.tax_rate,
    })
  },
  getShop: function () {
    var self = this;
    //console.log(self);
    //console.log(self.options.uid);
    wx.request({
      url: 'http://www.wechatorder.com/wechatorder/index.php/Apiwx/Wxorder/getStoreInfo?uid=' + self.options.uid,
      success: function (res) {
        var shoparr=[];
        for (var attr in res.data) {
          shoparr.push(res.data[attr]);
        }
        console.log(res.data);
        console.log(app.globalData);
        console.log(self.options);
        
        if(self.options.coin && self.options.tax_rate){
          var Coin = JSON.parse(decodeURIComponent(JSON.stringify(self.options.coin)));
          if(Coin == '￥'){
          self.setData({
            shops: shoparr,
            coin: '￥',//修改
            taxRate: self.options.tax_rate,//修改
          })
          }
          else{
            self.setData({
              shops: shoparr,
              coin: Coin,//修改
              taxRate: self.options.tax_rate,//修改
            })
          }
        }else{
        self.setData({
          shops: shoparr,
          coin: app.globalData.group_coin[self.options.uid]['coin'],//修改
          taxRate: app.globalData.group_coin[self.options.uid]['tax_rate'],//修改
        })
        }
        self.checkOrderCount();
        console.log('getShop中：');
        console.log(self.data.coin);
        console.log(self.data.shops);
        console.log(self.data.shops[0].orderCount);
      }
    })
  },
  checkOrderCount:function(){
    console.log('进入红点检查');
    console.log(app.globalData.buyCar);
    if(app.globalData.buyCar.length!=0){
      for (var i = 0; i < app.globalData.buyCar.length;i++){
        for(var attr in this.data.shops){
          if (app.globalData.buyCar[i].shop_id==this.data.shops[attr].s_id){
            this.data.shops[attr].orderCount = app.globalData.buyCar[i].count;
            break;
          }
        }
      }
    }else if (app.globalData.buyCar.length==0){
      console.log('购物车没有东西');
      for (var attr in this.data.shops) {
        this.data.shops[attr].orderCount = 0;
      }
    }
    this.setData({
      shops: this.data.shops
    });
  },
  getAds: function () {
    var self = this;
    console.log(self.banners);
    request.sendRequest('/Wxorder/getAd', 'GET', {}, {})
      .then(function (response) {
        console.log(response.data);
        for (var attr in response.data) {
          self.data.banners.push(response.data[attr]);
        }
        self.setData({
          banners: self.data.banners
        })
      }, function (error) {
        console.log(error);
      });
  },
	onShow: function () {
    this.checkOrderCount();  
  },
	onScroll: function (e) {
		if (e.detail.scrollTop > 100 && !this.data.scrollDown) {
			this.setData({
				scrollDown: true
			});
		} else if (e.detail.scrollTop < 100 && this.data.scrollDown) {
			this.setData({
				scrollDown: false
			});
		}
	},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  onReachBottom:function(){
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000
    })
  },
	tapSearch: function () {
		wx.navigateTo({url: 'search'});
	},
	toNearby: function () {
		var self = this;
		self.setData({
			scrollIntoView: 'nearby'
		});
		self.setData({
			scrollIntoView: null
		});
	},
	tapFilter: function (e) {
    console.log(this.data.shops);
    console.log(e.target.dataset.id);
		switch (e.target.dataset.id) {
			case '1':
        this.data.shops.sort(function (a, b) {
          return a.s_id > b.s_id;
				});
				break;
			case '2':
        this.data.shops.sort(function(a,b){
          return a.sales < b.sales;
        });
				break;
			case '3':
				this.data.shops.sort(function (a, b) {
					return a.score > b.score;
				});
				break;
		}
		this.setData({
			filterId: e.target.dataset.id,
			shops: this.data.shops/*********/
		});
	},
	tapBanner: function (e) {
		var name = this.data.banners[e.target.dataset.id].name;
		wx.showModal({
			title: '提示',
			content: '您点击了“' + name + '”活动链接，活动页面暂未完成！',
			showCancel: false
		});
	},
  //点击右边,半颗星
  selectLeft: function (e) {
    var key = e.currentTarget.dataset.key
    if (this.data.key == 0.5 && e.currentTarget.dataset.key == 0.5) {
      //只有一颗星的时候,再次点击,变为0颗
      key = 0;
    }
    console.log("得" + key + "分")
    this.setData({
      key: key
    })

  },
  //点击左边,整颗星
  selectRight: function (e) {
    var key = e.currentTarget.dataset.key
    console.log("得" + key + "分")
    this.setData({
      key: key
    })
  },
  goBackToPage:function(){
    wx.switchTab({
      url: '/page/superindex/index',
    })
  }
});

