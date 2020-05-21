// page/food/editfood.js
var app = getApp();
var request = require('../../utils/requestServer');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentFood: {},
    foodType:{},
    index:0,
    typeId:-1,
    editFood:{},
    shopId:1
  },
  onLoad: function (options) {
    console.log(options);
    this.setData({
      typeId: options.typeId,
      currentFood: app.globalData.currentFood,
      g_id: options.g_id,
      foodType: app.globalData.crFoodType,
      index: options.typeId-1
    });

    console.log(this.data.foodType);
  },
  onShow: function () {
  },
  //编辑菜品
  submitEditFood:function(e){
    console.log(e.detail.value);
    var that=this;
    that.setData({
      editFood: e.detail.value
    });
    var typeIndex = that.data.editFood.foodtype;
    that.data.editFood.foodtype = that.data.foodType[typeIndex].gt_id;
    console.log(that.data.editFood);
    //updateGoods
    var data = {
      editFood: that.data.editFood,
      shopId: that.data.shopId
    }
    console.log(data);
    var url = "/Wxgoodsupdate/updateGoods";
    if (this.data.temp_path) {
      wx.uploadFile({
        url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Wxgoodsupdate/updateGoods',
        filePath: this.data.temp_path,
        name: 'pic_url',
        formData: {
          'g_id': this.data.g_id,
          'g_name': e.detail.value.name,
          's_id': this.data.shopId,
          'price': e.detail.value.sales,
          'introduce': e.detail.value.intro,
          'g_type': this.data.foodType[e.detail.value.foodtype].gt_id,
          'accessories': 0,
          'taste': ['1', '2', '3'],
          'flag': 1,
        },
        success: function (res) {
          console.log(res.data);
          wx.showToast({
            title: '修改菜品成功',
            icon: 'success',
            duration: 2000,
            mask: false,
            success: function () {
              setTimeout(function () {
                wx.navigateTo({
                  url: "../food/index",
                })
              }, 1000) //延迟时间 
            }
          });
        }
      })
    } else {
      wx.request({
        url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Wxgoodsupdate/updateGoods',
        method: 'POST',
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
          'g_id': this.data.g_id,
          'g_name': e.detail.value.name,
          's_id': this.data.shopId,
          'price': e.detail.value.sales,
          'introduce': e.detail.value.intro,
          'g_type': this.data.foodType[e.detail.value.foodtype].gt_id,
          'accessories': 0,
          'taste': ['1', '2', '3'],
        },
        success: function (res) {
          console.log(res.data);
          wx.showToast({
            title: '修改菜品成功了',
            icon: 'success',
            duration: 2000,
            mask: false,
            success: function () {
              setTimeout(function () {
                wx.navigateTo({
                  url: "../food/index",
                })
              }, 1000) //延迟时间 
            }
          });
        }
      });
    }
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  upimg: function () {
    var self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        self.setData({
          temp_path: tempFilePaths[0],
          imgview: false,
          is_up: 1
        })
      },
    })
  },
})