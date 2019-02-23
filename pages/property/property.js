// pages/property/property.js
const app = getApp();
Page({

  data: {
    input:'',  //输入内容
    datas:[],  //查询到的数组
    showLoading:false,  //加载动画
  },

  onLoad: function (options) {

  },
  //输入框信息
  bindInput(e){
    this.setData({
      input: e.detail.value,
    });
    if (!this.data.input) {
      this.setData({
        datas:[],
      });
    }
  },
  //输入框失去焦点事件
  bindBlur(){
    this.setData({
      showLoading:true
    });
    wx.request({
      method: 'POST',
      url:`${app.globalData.api}Users/userFees`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data:{
        userKey:this.data.input
      },
      success:res=>{
        console.log(res);
        this.setData({
          showLoading:false,
          datas:res.data.data.root
        });
      },
      fail:res=>{
        console.log(res);
      }
    });
  },
});