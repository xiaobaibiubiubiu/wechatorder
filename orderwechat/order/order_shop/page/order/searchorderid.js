//searchorderid.js
var app = getApp();
var server = require('../../utils/server');
var request = require('../../utils/requestServer');
Page({
  data: {
    searchid: '',
    placeholder: '请输入订单号搜索相关内容',
    order: [],
    interval: '',
    intervalTime: 3000 
  },
  onLoad: function () {
  },
  onShow: function () {
    this.setData({
      showResult: false
    });
  },
  //输入框输入订单号后赋值
  inputSearch_id: function (e) {
    this.setData({
      searchid: e.detail.value
    });
  },
  //点击搜索按钮后获取订单信息
  doSearch_id: function (e) {
    this.setData({
      showResult: true
    });
    if (this.data.searchid == '' && this.data.placeholder != '') {
      this.data.searchid = this.data.placeholder;
    }
    this.getSearch_id(this.data.searchid);
    console.log(this.data.order);
  },
  getSearch_id: function (info) {
    var that = this;
    //console.log('查询订单号:'+info);
    var s_id = wx.getStorageSync('s_id');
    wx.request({
      url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Wxmanager/searchorderid?searchid=' + info+ '&s_id='+s_id,
      success: function (res) {
        //给order赋值？
        that.setData({
          order: res.data,
        })
        console.log(that.data.order);
      }
    });
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
              that.doSearch_id();
            }, function (error) {
              //  console.log('失败啦，兄弟');
              //that.getorderSub();
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
        that.doSearch_id();

      })
  }
})