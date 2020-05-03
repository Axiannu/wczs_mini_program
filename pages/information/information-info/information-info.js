// pages/information/information-info/information-info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    isCommentShow: false,
    isSendShow: false,
    star: {
      state: false,
      path: '/images/icon_little_star_normal.png',
    },
    starImages: [{
      state: false,
      path: '/images/icon_little_star_normal.png',
    }, {
      state: false,
      path: '/images/icon_little_star_normal.png'
    }, {
      state: false,
      path: '/images/icon_little_star_normal.png'
    }],
    commentValue: "",
    commentList: []
  },
  toast: function(e){
    wx.showToast({
      title: '新功能即将到来',
      icon: 'loading',
    })
    setTimeout(function(){
      wx.hideToast()
    },2000)
    
  },

  star: function (e) {
    var that = this
    let index = e.currentTarget.dataset.index;
    var url = ""
    if (that.data.commentList[index].isStar) {
      url = "pl_del_heart"
    } else {
      url = "pl_add_heart"
    }
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'pl_yun',
      // 传递给云函数的参数
      data: {
        $url: url,
        other: {
          _id: that.data.commentList[index]._id,
          isStar: !that.data.commentList[index].isStar
        }
      },
      success: res => {
        console.log(res)
        that.getList()
      },
      fail: err => {
        console.log(err)
      },
      complete: () => {
        console.log("res")
      }
    })
  },

  bindCommentInput: function (e) {
    this.setData({
      commentValue: e.detail.value
    })
  },

  articleStar: function (e) {
    var paths = '', status = !this.data.star.state, starNumbers = this.data.detail.starNum
    if (this.data.star.state) {
      starNumbers--;
      paths = '/images/icon_little_star_normal.png'
    } else {
      starNumbers++;
      paths = '/images/icon_little_star_select.png'
    }
    this.data.detail.starNum = starNumbers
    this.setData({
      detail: this.data.detail,
      star: {
        state: status,
        path: paths
      }
    })
  },

  openSend: function (e) {
    var that = this;
    that.setData({
      isSendShow: !that.data.isSendShow
    })
  },
  closeSend: function (e) {
    var that = this;
    that.setData({
      isSendShow: false
    })
  },
  send: function (e) {
    var that = this;
    that.setData({
      isSendShow: false
    })
    wx.getUserInfo({
      success: res => {
        wx.cloud.callFunction({
          // 要调用的云函数名称
          name: 'pl_yun',
          // 传递给云函数的参数
          data: {
            $url: "user_pl_Add",
            other: {
              headImage : res.userInfo.avatarUrl, //用户头像
              name : res.userInfo.nickName, //用户昵称
              article_id: this.data.detail._id,  //评论的文章ID号
              content: this.data.commentValue,  //评论内容
              time: new Date(),  //客户端评论时间
            }
          },
          success: res => {
            console.log(res)
            var data = res.result.data;
            that.setData({
              list: data,
              commentValue: ""
            })
            this.getList()
          },
          fail: err => {
            console.log(err)
          },
          complete: () => {
            console.log("res")
          }
        })
      },
      fail: res => {
        wx.showModal({
          title: '提示',
          content: '请先登录',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      },
    })
  },
  closeComment: function (e) {
    var that = this;
    that.setData({
      isCommentShow: false
    })
  },
  openComment: function (e) {
    var that = this;
    that.setData({
      isCommentShow: !that.data.isCommentShow
    })
  },
  catchtap: function (e) { },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var info = JSON.parse(options.info);
    this.setData({
      detail: info
    })
    wx.cloud.init({
      env: 'wczs-server-b8jyq'
    });
    this.getList()
  },

  getList: function () {
    var that = this;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'pl_yun',
      // 传递给云函数的参数
      data: {
        $url: "user_pl_Query",
        other: {
          article_id: this.data.detail._id,  //评论的文章ID号
        }
      },
      success: res => {
        console.log(res)
        var data = res.result.data;
        for (let key in data) {
          var date = new Date(data[key].time)
          data[key].date = (date.getMonth() + 1) + "月" + date.getDate() + "日"
          if ((date.getMinutes() + "").length <= 1) {
            data[key].time = date.getHours() + ":0" + date.getMinutes()
          } else {
            data[key].time = date.getHours() + ":" + date.getMinutes()
          }
          if (data[key].isStar) {
            data[key].path = '/images/icon_little_star_select.png'
          } else {
            data[key].path = '/images/icon_little_star_normal.png'
          }
        }
        that.setData({
          commentList: data
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