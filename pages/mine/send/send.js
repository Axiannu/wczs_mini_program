// pages/mine/send/send.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  delete: function (e) {
    wx.showModal({
      title: "温馨提示",
      content: "确定删除此条发布吗？",
      confirmColor: "#1796e6",
      cancelColor: 'cancelColor',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.init({
      env: 'wczs-server-b8jyq'
    });
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'user_yun',
      // 传递给云函数的参数
      data: {
        $url: "user_wz_Query",
        other: {
        }
      },
      success: res => {
        console.log(res)
        // var data = res.result.data;
        // for (let key in data) {
        //   var date = new Date(data[key].time)
        //   data[key].time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
        // }
        // that.setData({
        //   list: data
        // })
      },
      fail: err => {
        console.log(err)
      },
      complete: () => {
        console.log("res")
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})