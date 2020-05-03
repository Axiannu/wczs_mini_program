// pages/information/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    key: "",
    list: []
  },

  clearClick: function (e) {
    wx.showModal({
      title: "温馨提示",
      content: "确定清空搜素历史吗？",
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

  bindKeyInput: function (e) {
    this.setData({
      key: e.detail.value
    })
  },

  histroyClick: function(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      key: this.data.list[index]
    })
  },

  openResult: function (e) {
    if (this.data.key === "" || this.data.key === undefined) {
      wx.showToast({
        icon: 'none',
        title: '请输入关键词',
      })
      return
    }
    wx.navigateTo({
      url: '/pages/information/result/result?key=' + this.data.key,
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
        $url: "user_ls_Query",
        other: {
        }
      },
      success: res => {
        console.log(res)
        var data = res.result.users_ll_history;
        that.setData({
          list: data
        })
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