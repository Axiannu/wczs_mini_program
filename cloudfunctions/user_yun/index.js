// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()

// 调用云数据库引用
const db = cloud.database({
  throwOnNotFound: false
})
//选定数据库集合
const yh = db.collection('Users_information')

// 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
//const wxContext = cloud.getWXContext()


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const user_openid = wxContext.OPENID
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('进入用户页中间件')
    ctx.data = {}
    user_data = []
    //ctx.data.openId = event.userInfo.openId
    await next()
    console.log('退出用户页中间件')
  })

  //进行用户个人信息创建判断
  app.router('user_Add', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]写入')
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      _openid: user_openid,

      gr_admire_id: [],
      gr_release_id: [],
      ll_history_id: [],
      ss_history_id: [],
      /*
      gr_admire_id: ["记录赞赏者ID进行消息提醒",],
      gr_release_id: ["个人发表文章的ID记录",],
      ll_history_id: ["这是记录个人浏览历史文章的ID记录",],
      ss_history_id: ["这是记录个人浏览历史文章的ID记录",],
      */
    }
    
    const ishave = await yh.where({
      _openid: user_openid
    }).get().then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      //ctx.data = res.data.length
      //console.log('数据查询结果：', res.data.length)
      return res.data.length
    })
    if (ishave == 0){
      await yh.add({
        data: ctx.data
      }).then(res => {
        ctx.data = res._id
        console.log('[用户数据]新增成功，记录_id：', ctx.data)
        console.log('[用户数据]openid：', user_openid)
      })
      console.log('结束-->数据库[Users_information]写入')
      ctx.body = {
        data: ctx.data,
      }
    } else {
      //pass
      ctx.data = user_openid + '该用户已存在'
      console.log([user_openid],"用户已存在")
      console.log('结束-->数据库[Users_information]写入')
      ctx.body = {
        data: ctx.data,
      }
    }
  })



  //用户所属帖子查询
  app.router('user_wz_Query', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    const $ = db.command.aggregate
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02"
      _openid: user_openid,
    }
    await yh.aggregate()
      .lookup({
        from: 'home_tiezi',
        let: {
          user_openid: '$_openid',
          gr_release_id: '$gr_release_id',
        },
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$_openid', '$$user_openid']),
            $.in(['$_id', '$$gr_release_id'])
          ])))
          .project({
            _id: 1,
            _openid: 1,
            text: 1,
            createTime: 1
          })
          .done(),
        as: 'user_release_ctx',
      })
      .end().then(res => {
      
      const filterList = res.list.filter(val => val._openid == ctx.data._openid);
      user_datas = filterList
      //user_datas01 = res.data[0].gr_release_id.length
      //user_datas02 = res.data[0].gr_release_id
        console.log('数据查询成功,该用户所属文章数量有：', user_datas[0].user_release_ctx.length,"条。")
      
    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: user_datas[0].user_release_ctx,
      //开启文章ID返回
      //Users_articles: user_datas02
      
      
    }
  })

  //浏览历史记录写入测试
  app.router('user_ls_Add', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]写入')
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID

    ctx.data = {
      //_openid: "crc02",
      //_id: "2b4144565e802c87001806395ddd3eb4",
      //ll_history_id: "这是新的一条历史记录哟！04",
      
      _openid: user_openid,
      ll_history_id: event.other.ll_history_id,//文章的ID
    }

    await yh.where({
      _openid: ctx.data._openid
    }).update({
      data: {
        ll_history_id: _.unshift([ctx.data.ll_history_id])
      }
    }).then(res => {
      console.log('[浏览历史]记录成功，文章ID：', res)
      ctx.data = res
    })
    console.log('结束-->数据库[Users_information]写入')
    ctx.body = {
      data: ctx.data,
    }
    
  })

  //用户浏览历史查询
  app.router('user_ls_Query', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    ctx.data = {
      //_openid: "crc02",
      _openid: user_openid,
    }
    await yh.where({
      _openid: ctx.data._openid
    }).get().then(res => {
      user_datas = res.data
      user_datas01 = res.data[0].ll_history_id.length
      user_datas02 = res.data[0].ll_history_id
      console.log('浏览历史查询成功，共有：', user_datas01,'条。')

    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      //data: user_datas,
      //开启浏览历史结果返回
      users_ll_history: user_datas02
    }
  })

  //用户浏览历史删除
  app.router('user_ls_Del', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02",
      //ll_history_id: "aa",

      _openid: user_openid,
      ll_history_id: event.other.ll_history_id,
    }
    await yh.where({
      _openid: ctx.data._openid
    }).update({
      data: {
        ll_history_id: _.pull(ctx.data.ll_history_id)
      },
    }).then(res => {
      user_datas = res
      //user_datas01 = res.data[0].ll_history_id.length
      //user_datas02 = res.data[0].ll_history_id
      //console.log(res.stats.updated)
      if (res.stats.updated == 1){
        console.log('浏览历史删除成功')
      } 
      else{
        console.log('该条记录不存在！')
      }
      

    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: user_datas,
    }
  })

  //自身创建文章写入
  app.router('user_tz_Add', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]写入')
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02",
      //_id: "2b4144565e802c87001806395ddd3eb4",
      //gr_release_id: "这是新的一条文章创建记录[02]",

      _openid: user_openid,
      gr_release_id: event.other.gr_release_id,

    }

    await yh.where({
      _openid: ctx.data._openid
    }).update({
      data: {
        gr_release_id: _.unshift([ctx.data.gr_release_id])
      }
    }).then(res => {
      console.log('[文章创建]记录成功，文章ID：', ctx.data.gr_release_id)
      ctx.data = res
    })
    console.log('结束-->数据库[Users_information]写入')
    ctx.body = {
      data: ctx.data,
    }

  })

  //浏览ss记录写入测试搜索
  app.router('user_ss_Add', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]写入')
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02",
      //_id: "2b4144565e802c87001806395ddd3eb4",
      //ss_history_id: "cc",

      _openid: user_openid,
      ss_history_id: event.other.ss_history_id,
    }

    await yh.where({
      _openid: ctx.data._openid
    }).update({
      data: {
        ss_history_id: _.unshift([ctx.data.ss_history_id])
      }
    }).then(res => {
      console.log('[搜索历史]记录成功，搜索关键字：', ctx.data.ss_history_id)
      ctx.data = res
    })
    console.log('结束-->数据库[Users_information]写入')
    ctx.body = {
      data: ctx.data,
    }

  })

  //用户ss历史查询
  app.router('user_ss_Query', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02",

      _openid: user_openid,
    }
    await yh.where({
      _openid: ctx.data._openid
    }).get().then(res => {
      user_datas = res.data
      user_datas01 = res.data[0].ss_history_id.length
      user_datas02 = res.data[0].ss_history_id
      console.log('浏览历史查询成功，共有：', user_datas01, '条。')

    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: user_datas,
      //开启浏览历史结果返回
      Users_ss_history: user_datas02
    }
  })


  //用户搜索历史删除
  app.router('user_ss_Del', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02",

      _openid: user_openid,
    }
    await yh.where({
      _openid: ctx.data._openid
    }).update({
      data: {
        ss_history_id: []
      },
    }).then(res => {
      user_datas = res
      //user_datas01 = res.data[0].ss_history_id.length
      //user_datas02 = res.data[0].ss_history_id
      if (res.stats.updated == 1) {
        console.log('搜索历史删除成功')
      }
      else {
        console.log('该用户暂无搜索记录集！')
      }

    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: user_datas,
    }
  })

  












  

  //用户点赞信息记录
  app.router('user_admire_add', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]写入')
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID

    ctx.data = {
      //user_openid为收到点赞的作者的openid
      //user_openid: "crc02",
      //content_id是指向从哪里来的点赞记录
      //content_id: 'AA',
      //_openid是记录谁人点的赞赏
      //_openid: "这是点赞者",
      time: new Date(),
      tyep: ["帖子","文章","评论"],

      user_openid: event.other.who_openid,  //被点赞的文章作者ID
      content_id: event.other.content_id,   //被点赞的文章ID
      _openid: user_openid,   //点赞者openID
    }

    await yh.where({
      //谁人的文章被点赞了
      _openid: ctx.data.who_openid
    }).update({
      data: {
        gr_admire_id: _.unshift([[ctx.data._openid, "点赞了你的" + ctx.data.tyep[0],ctx.data.time]])
      }
    }).then(res => {
      console.log('[点赞反馈]记录成功，点赞者：', ctx.data._openid)
      ctx.data = res
    })
    console.log('结束-->数据库[Users_information]写入')
    ctx.body = {
      data: ctx.data,
    }

  })

  //用户个人信息查询
  app.router('user_xx_Query', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      //_openid: "crc02",
      _openid: user_openid,
    }
    await yh.where({
      _openid: ctx.data._openid
    }).get().then(res => {
      user_datas = res.data
      user_datas01 = res.data[0].gr_admire_id.length
      user_datas02 = res.data[0].gr_admire_id
      console.log('点赞信息查询成功，共有：', user_datas01, '条。')

    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      //data: user_datas,
      //开启浏览历史结果返回
      users_xx: user_datas02
    }
  })



  return app.serve()
}
