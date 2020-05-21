var app = getApp();
var num;
var request = require('../../utils/requestServer.js');
Page({
  data: {
    share: 1,
    flag: false,
    mark: true,
    list:[],
    currentCity: ''
  },
 
  onLoad: function (options) {
    console.log('提示你');
    console.log(options);
    this.getLocation();
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 1000
    });
    
    
  },
  toggle: function (e) {
    var mark = this.data.mark;
    if (mark) {
      this.setData({
        flag: true,
        mark: false
      })

    } else {
      this.setData({
        flag: false,
        mark: true
      })
    }
  },
  gotoGroup: function (event) {
    //group
    var groupId = event.currentTarget.dataset.id.slice(5);
    var taxRate = event.currentTarget.dataset.taxrate;
    console.log(taxRate);
    if (groupId != '') {
      app.globalData.groupId = groupId;
      app.globalData.taxRate = taxRate;
      var url = '/Wxorder/get_shop_count?groupId=' + app.globalData.groupId;
      request.sendRequest(url, 'GET', {}, {}).then(function (res) {
        if (res.data.shop_count_status == 1) {
          wx.navigateTo({
            url: '/page/shop/shop?id=' + res.data.s_id + '&coin=' + app.globalData.group_coin[app.globalData.groupId]['coin'],
          })
        }
        else {
          wx.navigateTo({
            url: '../index/index?uid=' + app.globalData.groupId,
          })
        }

      }, function (error) {
        console.log(error);
      });


    }
  },



  search: function () {
    wx.navigateTo({ url: 'search' });
  },
  onShareAppMessage: function () {
    var cityname = this.data.cityname;
    var id = this.data.cityId;
    return {
      title: "美味靓点",
      desc: cityname + "美食推荐",
      path: '/pages/index/index?id=' + id + '&name=' + cityname + ''
    }
  },

  getLocation: function () {
    var page = this
    console.log('来获取地理位置了')
    wx.getLocation({
      type: 'wgs84',   //<span class="comment" style="margin:0px;padding:0px;border:none;">默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标</span><span style="margin:0px;padding:0px;border:none;"> </span>  
      success: function (res) {
        console.log('获取定位后经纬度')
        console.log(res);
        // success    
        var longitude = res.longitude
        var latitude = res.latitude
        page.loadCity(longitude, latitude);
        page.getGroups(longitude, latitude,'')
      },
      fail:function(){
        let open_id=wx.getStorageSync('open_id');
        console.log('申请定位失败情况下open_id:'+open_id);
        page.getGroups('','',open_id)
      }
    })
  },
  loadCity: function (longitude, latitude) {
    var page = this
    wx.request({
      url: 'https://api.map.baidu.com/geocoder/v2/?ak=wIcQb8qunl8AkiZaLCfpVhveMyDjaRDG&location=' + latitude + ',' + longitude + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        // success    
        console.log(res);
        var city = res.data.result.addressComponent.city;
        var district = res.data.result.addressComponent.district;
        var name=city+district;
        page.setData({ 
          currentCity: name 
          });
      },
      fail: function () {
        page.setData({ currentCity: "获取定位失败" });
        let open_id = wx.getStorageSync('open_id');
        console.log('城市展示失败情况下open_id:' + open_id);
        page.getGroups('', '', open_id)
      },
    })
  },
  getGroups: function (longitude, latitude,openid){
    var that=this;
    var shareurl = 'https://bjshuyiyuan.top/wechatorder/index.php/Apiwx/Wxorder/getGroup?longitude=' + longitude + "&latitude=" + latitude+'&open_id='+openid;
    wx.request({
      url: shareurl,
      success: function (res) {
        console.log(res);
        wx.hideToast();
        that.setData({
          list: res.data,
        });
        console.log(that.data.list);
        var group_array = [];
        for (var i in res.data) {
          group_array[res.data[i]['uid']] = res.data[i];
        }
        app.globalData.group_coin = group_array;
        //app.globalData.group_coin = res.data;
      }
    });
  },
})