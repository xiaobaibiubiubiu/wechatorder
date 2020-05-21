
var app = getApp();
var request = require('../../utils/requestServer');
Page({
  data: {
    shopId:-1,
    owner:{}, 
    userInfo:'',
    focus: false,
    region: ['北京市', '北京市', '朝阳区'],
    tradeAreaInfo:[],
    waitEdit:true,
    iconEdit:false,//只上传图标
    hasIconChange:false,
    index:0,
    tempFilePaths:''//存放图片路径
  },
  onLoad: function (data) {
    console.log(data);
    var shopId=wx.getStorageSync('s_id');
    var coin = wx.getStorageSync('s_coin');
    console.log(shopId);
    this.setData({
      shopId:shopId,
      coin:coin,
    });
    this.getOwnerInfo(this.data.shopId);
    this.setData({
      nowtab: data.toTab,
      tradeAreaInfo:app.globalData.tradeArea
    });
    console.log(this.data.tradeAreaInfo);
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
  toEditInfo:function(){
    console.log('进入修改函数');
    this.setData({
      waitEdit:false,
      iconEdit:false,
      focus:true
    });
  },
  bindGroupChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  //获取商家信息
  getOwnerInfo:function(e){
    console.log('shop_id:'+e);
    var that=this;
    var url ='/Wxmanager/getOwnerInfo?s_id='+e;
    request.sendRequest(url,'GET',e,{})
    .then(function(res){
      console.log(res.data);
      that.setData({
        owner:res.data,
        tempFilePaths: res.data.pic_url
      });
      // that.data.tempFilePaths.push(res.data.pic_url);
      console.log(that.data.tempFilePaths);
      for(var i=0;i<app.globalData.tradeArea.length;i++){
        if (app.globalData.tradeArea[i].uid==res.data.groupid){
          that.setData({
            index:i
          });
        }
      }
    },function(error){
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
    });
    this.data.owner.s_storename = e.detail.value.sname;
    this.data.owner.groupname=app.globalData.tradeArea[e.detail.value.tradeArea].groupname;
    this.data.owner.pack_charge = e.detail.value.pack_charge;
    this.data.owner.pic_url = this.data.owner.pic_url.slice(16);
    this.data.owner.groupid = app.globalData.tradeArea[e.detail.value.tradeArea].uid;
    this.data.owner.printername=e.detail.value.printername;
    this.data.owner.printerpsd=e.detail.value.printerpsd;
    //this.submitInfo(this.data.owner);
    if (this.data.hasIconChange) {//有图标改变
      console.log('hihihi:'+this.data.tempFilePaths);
      wx.uploadFile({
        url: 'https://bjshuyiyuan.top/wechatorder/index.php/Apiwx/Wxgoodsupdate/updateOwnerInfo',
        header: { "Content-Type": "multipart/form-data"},
        filePath: this.data.tempFilePaths,
        name: 'pic_url',
        formData: {
          "s_id": this.data.owner.s_id,
          "s_name": this.data.owner.s_name,
          "s_storename": this.data.owner.s_storename,
          "pack_charge": this.data.owner.pack_charge,
          "pic_url": this.data.owner.pic_url,
          "groupid": this.data.owner.groupid,
          "printername":this.data.owner.printername,
          "printerpsd":this.data.owner.printerpsd
        },
        success: function (res) {
          console.log(res.data);
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000,
            mask: false
          });
        }
      })
    } else {//没有上传图片
      //单纯上传其他信息
      var o_info={
        "s_id": this.data.owner.s_id,
        "s_name": this.data.owner.s_name,
        "s_storename": this.data.owner.s_storename,
        "pack_charge": this.data.owner.pack_charge,
        "pic_url": this.data.owner.pic_url,
        "groupid": this.data.owner.groupid,
        "printername": this.data.owner.printername,
        "printerpsd": this.data.owner.printerpsd
      };
      var url = '/Wxgoodsupdate/updateOwnerInfo';
      console.log(JSON.stringify(o_info));
      var json = {
        'ownerInfo': JSON.stringify(o_info)
      }
      var header = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      var that=this;
      request.sendRequest(url, 'POST', json,header)
      .then(function(res){
        console.log(res.data);
        if(res.data=='success'){
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000,
            mask: false
          });
          that.setData({
            waitEdit: true,
            iconEdit: false,//只上传图标
            hasIconChange: false,
          });
        }
      },function(error){
        console.log(error);
      });
    }
  },
  
  //上传新店铺图
  upimg: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        if(that.data.waitEdit){
          that.setData({
            iconEdit: true,
          })
        }
        that.setData({
         tempFilePaths: tempFilePaths[0],
         hasIconChange:true
        })
        console.log(that.data.tempFilePaths);
      },
    })
  },
  //仅提交新店铺图
  updateIcon: function () { 
    var that = this;
    var url = '/Wxgoodsupdate/updataShopIcon';
    if (hasIconChange) {
      console.log(this.data.tempFilePaths);
      wx.uploadFile({
        url: 'https://bjshuyiyuan.top/wechatorder/index.php/Apiwx/Wxgoodsupdate/updateShopIcon',
        filePath: this.data.tempFilePaths,
        name: 'pic_url',
        header: { "Content-Type": "multipart/form-data" },
        formData: {
          'shopId':that.data.shopId
        },
        success: function (res) {
          console.log(res.data);
          if(that.data.waitEdit==true){
            that.setData({
              iconEdit: false
            });
          }
          wx.showToast({
            title: '店标修改成功',
            icon: 'success',
            duration: 2000,
            mask: false
          });
        }
      })
    } else {
      console.log(this.data.hasIconChange);
      wx.showToast({
        title: '请添加图片',
        icon: 'none',
        duration: 2000,
        mask: false,
      });
    }  
  },
})
