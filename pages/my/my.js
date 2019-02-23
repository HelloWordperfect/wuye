// pages/my/my.js
const app = getApp();
let userId;
Page({

  data: {
    allScore: 0, //我的积分
    showLoading: true,
    datasNumber: [], //数量接口
    phoneNo:'',  //平台电话
    userCode:'', //家庭编号
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
    wx.request({
      method: 'GET',
      url: `${app.globalData.api}index/loadConfigs`,
      success: res => {
        console.log(res);
        this.setData({
          phoneNo: res.data.data.phoneNo,
        });
      },
      fail: res => {
        console.log(res);
      }
    });
  },
  onShow() {
    //获取积分信息
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Users/getUserInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        userId: userId
      },
      success: res => {
        console.log(res);
        wx.stopPullDownRefresh();
        this.setData({
          userScore: res.data.data.userScore,
          datasNumber: res.data.data.orderNum,
          allScore:res.data.data.allScore,
          userCode:res.data.data.userCode,
          showLoading: false
        });
      },
      fail: res => {
        this.setData({
          showLoading: false
        });
        console.log(res);
      }
    });
  },
  //点击查看积分明细
  bindIntegral() {
    wx.navigateTo({
      url: '../integral/integral'
    });
  },
  //点击拨打电话
  bindPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNo
    });
  },
  //查看所有订单
  bintapOrder() {
    wx.navigateTo({
      url: '../orderList/orderList'
    });
  },
  //分享
  onShareAppMessage: function(res) {
    return {
      title: app.globalData.applet,
      path: 'pages/start/start'
    };
  },
  //下拉刷新
  onPullDownRefresh() {
    this.onShow();
  }
});