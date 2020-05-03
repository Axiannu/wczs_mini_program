// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()

// 调用云数据库引用
const db = cloud.database({
  throwOnNotFound: false
})
//选定数据库集合
const pl = db.collection('commentary_information')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('进入评论中间件')
    ctx.data = {}
    //ctx.data.openId = event.userInfo.openId
    await next()
    console.log('退出评论中间件')
  })

  //评论记录写入测试
  app.router('user_pl_Add', async (ctx, next) => {
    console.log('进入-->数据库[commentary_information]写入')
    const _ = db.command
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      _openid : user_openid,  //用户openid唯一标识
      headImage : event.other.headImage,  //用户头像
      name : event.other.name,  //用户昵称
      time : new Date(),  //创建时间
      content: event.other.content,  //评论内容
      isStar: false,  //是否被点赞
      starNum : 0,  //点赞数量，初始化为 0 
      is_delete : 0,  //是否被删除,初始化为 0
      article_id: event.other.article_id,   //被评论的文章或帖子ID
      
      /*
      _openid: user_openid,
      add_heart: 0,
      //article_id: "文章ID号01",
      //c_text: "这是一条评论01",
      is_delete: 0,
      time: new Date(),
      article_id: event.article_id,
      c_text: event.c_text,
      */
      /*
      _openid: user_openid,
      add_heart: event.add_heart,
      article_id: event.article_id,
      c_text: event.c_text,
      is_delete: event.is_delete,
      */
      
    


    }

    await pl.add({
      data: ctx.data
    }).then(res => {
      ctx.data = res
      console.log('[评论]记录成功：', ctx.data._id)
      
    })
    console.log('结束-->数据库[commentary_information]写入')
    ctx.body = {
      data: ctx.data,
    }

  })

  //文章总评论数据查询
  app.router('user_pl_Query', async (ctx, next) => {
    console.log('进入-->数据库[commentary_information]查询')
    ctx.data = {
      
      //article_id: "文章ID号01",
      
      article_id: event.other.article_id,
      is_delete: 0
    }
    const MAX_LIMIT = 100
    const countResult = await pl.count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 100)
    console.log("需连续查询：", batchTimes, " 次")
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = pl.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        article_id: ctx.data.article_id, 
        is_delete: ctx.data.is_delete
      }).get()
      tasks.push(promise)
      console.log("第",i+1,"次查询完毕")

    }
    await next()
    const data01 = await Promise.all(tasks)
    const data02 = data01.reduce((acc, cur) => {

      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
    ctx.body = {
      data: data02.data,
      errMsg: data02.errMsg,
      length: data02.data.length
    }
    console.log('查询结果数量共为：', ctx.body.data.length, "条。")
    console.log('结束-->数据库[commentary_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: 0

    }
  })


  //评论标示为已删除状态
  app.router('user_pl_Del', async (ctx, next) => {
    console.log('进入-->数据库[commentary_information]更新状态')
    ctx.data = {
      //_id: "79a2c43f5e81acc70028c3d7279b0cea",
      _id: event.other._id,
    }
    try {
      await pl.where({
        _id: ctx.data._id
      }).update({
        data: {
          is_delete: 1
        }
      }).then(res => {
        ctx.data = res
        console.log('评论删除成功,返回[stats]码为：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[commentary_information]更新')
    ctx.body = {
      data: ctx.data,
    }
  })

  //评论进行点赞
  app.router('pl_add_heart', async (ctx, next) => {
    console.log('进入-->数据库[commentary_information]更新点赞状态')
    const _ = db.command
    ctx.data = {
      //_id: "79a2c43f5e81acc70028c3d7279b0cea",
      _id: event.other._id,
      isStar: event.other.isStar
    }
    try {
      await pl.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum: _.inc(1),
          isStar: ctx.data.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('评论点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[commentary_information]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar: event.other.isStar,
    }
  })

  //评论取消点赞
  app.router('pl_del_heart', async (ctx, next) => {
    console.log('进入-->数据库[commentary_information]更新点赞状态')
    const _ = db.command
    ctx.data = {
      //_id: "79a2c43f5e81acc70028c3d7279b0cea",
      _id: event.other._id,
      isStar: event.other.isStar
    }
    try {
      await pl.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum: _.inc(-1),
          isStar: ctx.data.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('评论取消点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[commentary_information]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar: event.other.isStar,
    }
  })

  return app.serve()
}
