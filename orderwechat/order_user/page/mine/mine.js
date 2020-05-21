var app = getApp();
var server = require('../../utils/server');
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    exitif:true,
    showexit:false,
    shareHidden:true,//未触发分享前是隐藏的
    qrCodeUrl:'',//二维码图片url
  },
  onLoad: function () {
    this.canvasPrint();
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log(this.data.canIUse);
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
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  exituser:function(){
    this.setData({
      exitif:false,
      showexit:true
    })
  },
  subexit:function(){
  // wx.removeStorageSync('hasUserInfo'),
    this.setData({
      // userInfo: {},
      hasUserInfo: false,
      exitif:true,
      showexit:false
    }),
      wx.clearStorage()
  },
  canexit:function(){
    this.setData({
      exitif:true,
      showexit:false
    })
  },
  shareApp:function(){
    var that=this;
    console.log('分享小程序');
    console.log(this.data.shareHidden);
    this.setData({
      shareHidden:false,
    }); 
    console.log(this.data.shareHidden);
    wx.showLoading({
      title: '努力生成中...'
    })
    //画布生成照片
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 545,
      height: 771,
      destWidth: 545,
      destHeight: 771,
      canvasId: 'shareImg',
      success: function (res) {
        wx.hideLoading();
        console.log(res.tempFilePath);
        /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
        that.setData({
          prurl: res.tempFilePath,
          hidden: false
        })
        
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  //保存到相册
  saveToPhone:function(){
    var that = this
    //生产环境时 记得这里要加入获取相册授权的代码
    wx.saveImageToPhotosAlbum({
      filePath: that.data.prurl,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#72B9C3',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.setData({
                hidden: true,
                shareHidden:true
              })
            }
          }
        })
      }
    })
  },
  //取消分享
  closeShare:function(){
    this.setData({
      shareHidden:true
    });
  },
  //绘制画布
  canvasPrint:function(){
    var that=this;
    let promise1 = new Promise(function (resolve, reject) {
      //如何获取网络上的图
      
      /* 获得要在画布上绘制的图片 */
      wx.getImageInfo({
        src: '../../imgs/share/qrcode2.png',
        success: function (res) {
          console.log(res);
          resolve(res);
        }
      })
    });
    let promise2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: '../../imgs/share/qrbg.png',
        success: function (res) {
          console.log(res)
          resolve(res);
        }
      })
    });

    /* 图片获取成功才执行后续代码 */
    Promise.all(
      [promise1, promise2]
    ).then(res => {
      console.log(res)

      /* 创建 canvas 画布 */
      const ctx = wx.createCanvasContext('shareImg')
      console.log(ctx);
      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      ctx.drawImage('../../' + res[1].path, 0, 0, 545, 771)//背景图
      ctx.drawImage('../../' + res[0].path, 160, 280, 220, 220)//二维码
      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('center')                        //  位置
      ctx.setFillStyle('#000')                       //  颜色
      ctx.setFontSize(35)                               //  字号
      ctx.fillText('长按二维码', 545 / 2, 170)         //  内容  不会自己换行 需手动换行
      ctx.fillText('校园美食汇，遇见千种美食', 545 / 2, 240)         //  内容

      /* 绘制 */
      ctx.stroke()
      ctx.draw()
    });
  },
});