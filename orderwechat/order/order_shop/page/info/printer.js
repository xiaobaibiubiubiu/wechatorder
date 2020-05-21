
var app = getApp();
var request = require('../../utils/requestServer');
Page({
  data: {
    shopId: -1,
    owner: {},
    userInfo: '',
    focus: false,
    waitEdit: true,
    mesEdit: true,
    iconEdit: false,//只上传图标
    hasIconChange: false,
    index: 0,

    isShow: false,    //运用三目运算法，对最右侧图片进行控制
    show: "password"
  },
  onLoad: function (data) {
    console.log(data);
    var shopId = wx.getStorageSync('s_id');
    console.log(shopId);
    this.setData({
      shopId: shopId,
    });
    this.getOwnerInfo(this.data.shopId);
    this.setData({
      nowtab: data.toTab,
    });
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value,
    })
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  toEditPrinter: function () {
    console.log('进入修改函数');
    this.setData({
      waitEdit: false,
      iconEdit: false,
      focus: true,
      mesEdit: false
    });
  },
  //获取商家信息
  getOwnerInfo: function (e) {
    console.log('shop_id:' + e);
    var that = this;
    var url = '/Wxmanager/getOwnerInfo?s_id=' + e;
    request.sendRequest(url, 'GET', e, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          owner: res.data,
        });
      }, function (error) {
        console.log(error);
      });
  },
  //提交修改后信息
  //提交表单（包括头像）
  formSubmit: function (e) {
    console.log(e);
    this.setData({
      waitEdit: true,
      focus: false,
      mesEdit: false
    });
    this.data.owner.printername = e.detail.value.printername;
    this.data.owner.printerpsd = e.detail.value.printerpsd;
    var that = this;
    var shopId = wx.getStorageSync('s_id');
    var printername = this.data.owner.printername;
    var printerpsd = this.data.owner.printerpsd;
    var url = '/Wxmanager/bindPrinterTest?s_id=' + shopId + '&printername=' + printername + '&printerpsd=' + printerpsd;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          attention: res.data,
        });
        wx.showModal({
          title: '提示',
          content: res.data,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/page/mine/mine',
              })

            }
          }
        })
      }, function (error) {
        console.log(error);
      });
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  testExistPrinter: function (e) {
    // console.log(e);
    this.setData({
      waitEdit: true,
      focus: false,
      mesEdit: true
    });

    var that = this;
    var shopId = wx.getStorageSync('s_id');
    var url = '/Wxmanager/testExistPrinter?s_id=' + shopId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          attention1: res.data,
        }); wx.showModal({
          title: '提示',
          content: res.data,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/page/mine/mine',
              })

            }
          }
        })
      }, function (error) {
        console.log(error);
      });
  },

  clearprinter: function (e) {
    this.setData({
      waitEdit: true,
      focus: false,
      mesEdit: false
    });
    var that = this;
    var shopId = wx.getStorageSync('s_id');
    var url = '/Wxmanager/deleteExistPrinter?s_id=' + shopId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          attention: res.data,
          //printername:null,
          //printerpsd:null
        });
        wx.showModal({
          title: '提示',
          content: res.data,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/page/mine/mine',
              })

            }
          }
        })
      }, function (error) {
        console.log(error);
      });
  },
  ///显示密码或者隐藏密码的图片控住函数
  showPassword: function () {
    if (this.data.isShow) {   //如果this.data.isShow为true,则表示为密码小黑点
      this.setData({
        isShow: false,
        show: "password"
      })
    } else {
      this.setData({
        isShow: true,
        show: "text"
      })
    }
  },


})
