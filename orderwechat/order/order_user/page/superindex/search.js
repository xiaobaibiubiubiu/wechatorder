var app = getApp();
var server = require('../../utils/server');
Page({
	data: {
		filterId: 1,
		searchWords: '',
		placeholder: '请输入商圈名/美食名搜索相关内容',
		// shops: app.globalData.shops
    shops:[]
	},
	onLoad: function () {
		var self = this;
		// wx.getLocation({
		// 	type: 'gcj02',
		// 	success: function (res) {
		// 		var latitude = res.latitude;
		// 		var longitude = res.longitude;
		// 		server.getJSON('/waimai/api/location.php', {
		// 			latitude: latitude,
		// 			longitude: longitude
		// 		}, function (res) {
		// 			//console.log(res)
		// 			if (res.data.status != -1) {
		// 				self.setData({
		// 					address: res.data.result.address_component.street_number
		// 				});
		// 			} else {
		// 				self.setData({
		// 					address: '定位失败'
		// 				});
		// 			}
		// 		});
		// 	}
		// })
	},
	onShow: function () {
		this.setData({
			showResult: false
		});
	},
	inputSearch: function (e) {
		this.setData({
			searchWords: e.detail.value
		});
	},
	doSearch: function(e) {
		this.setData({
			showResult: true
		});
    
    if (this.data.searchWords == ''&&this.data.placeholder != ''){
      this.data.searchWords=this.data.placeholder;
    }
    this.getSearchResult(this.data.searchWords);
    console.log(this.data.shops);
	},
	tapFilter: function (e) {
		switch (e.target.dataset.id) {
			case '1':
				this.data.shops.sort(function (a, b) {
					return a.id > b.id;
				});
				break;
			case '2':
				this.data.shops.sort(function (a, b) {
					return a.sales < b.sales;
				});
				break;
			case '3':
				this.data.shops.sort(function (a, b) {
					return a.distance > b.distance;
				});
				break;
		}
		this.setData({
			filterId: e.target.dataset.id,
			shops: this.data.shops
		});
	},
  getSearchResult:function(info){
    var that=this;
    //console.log('查询店名:'+info);
    wx.request({
      url: 'http://www.wechatorder.com/wechatorder/index.php/Apiwx/Wxorder/searchGroup?searchWords='+info,
      success: function (res) {
        //给shop赋值？
        that.setData({
          shops:res.data,
        })
        //that.data.shops = res.data;
        //console.log('that.data.shops:');
        console.log(that.data.shops);
      }
    });
  }
});

