var express = require('express');
var router = express.Router();

const calc = require('calc-easy')

const Common = require('../controllers/common')

const { Client } = require('@notionhq/client')
require('dotenv').config()

const NOTION_KEY = process.env.NOTION_KEY
const NOTION_DB_ID = process.env.NOTION_DB_ID
const NOTION_CURR_USER_ID = process.env.NOTION_CURR_USER_ID

const notion = new Client({ auth: NOTION_KEY })

const cors = require('cors')

async function getAllComments() {
  
  console.log(NOTION_DB_ID)

  const result = await notion.databases.query({ database_id: NOTION_DB_ID })
  
  console.log(result)

  const comments = new Map()

  // 原始评论数据
  result?.results?.forEach((page) => {
    comments.set(page.id, transformPageObject(page));
  })

  // 组装回复，将关系 id 替换为实际评论
  let commentsPopulated = [...comments.values()].reduce((acc, curr) => {
    if (!curr.replyTo) {
      curr.replies = curr.replies.map((reply) => comments.get(reply.id))
      acc.push(curr)
    }
    return acc
  }, [])

  return commentsPopulated
}

async function addComment({ content, replyTo = "" }) {
  let no = (await notion.databases.query({ database_id: NOTION_DB_ID })).results.length + 1
  let { avatar_url, name } = await notion.users.retrieve({
    user_id: NOTION_CURR_USER_ID,
  })

  const page = await notion.request({
    method: "POST",
    path: "pages",
    body: {
      parent: { database_id: NOTION_DB_ID },
      properties: {
        no: {
          title: [
            {
              text: {
                content: no.toString(),
              },
            },
          ],
        },
        user: {
          rich_text: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        avatar: {
          url: avatar_url,
        },
        content: {
          rich_text: [
            {
              text: {
                content,
              },
            },
          ],
        },

        // 如果有 replyTo 参数传递进来的，添加到请求 body 中
        // 利用扩展运算符解构
        ...(replyTo && {
          replyTo: {
            relation: [
              {
                id: replyTo,
              },
            ],
          },
        }),
      },
    },
  })

  return transformPageObject(page)
}

function getRelativeTimeDesc(time) {
  const currentInMs = new Date().getTime()
  const timeInMs = new Date(time).getTime()

  const minuteInMs = calc('60 * 1000')
  const hourInMs = calc('60 * M', {
    variable: {
      M: minuteInMs
    }
  })
  const dayInMs = calc('24 * H', {
    variable: {
      H: hourInMs
    }
  })
  const monthInMs = calc('30 * D', {
    variable: {
      D: dayInMs
    }
  })
  const yearInMs = calc('365 * D', {
    variable: {
      D: dayInMs
    }
  })

  const relativeTime = calc('C - T', {
    variable: {
      C: currentInMs,
      T: timeInMs
    }
  })

  if (relativeTime < minuteInMs) {
    return `${Math.ceil(calc('R / 1000', {variable: {R: relativeTime}}))} 秒前`
  } else if (relativeTime < hourInMs) {
    return `${Math.ceil(calc('R / M', {variable: {R: relativeTime, M: minuteInMs}}))} 分钟前`
  } else if (relativeTime < dayInMs) {
    return `${Math.ceil(calc('R / H', {variable: {R: relativeTime, H: hourInMs}}))} 小时前`
  } else if (relativeTime < monthInMs) {
    return `${Math.ceil(calc('R / D', {variable: {R: relativeTime, D: dayInMs}}))} 天前`
  } else if (relativeTime < yearInMs) {
    return `${Math.ceil(calc('R / M', {variable: {R: relativeTime, M: monthInMs}}))} 月前`
  } else {
    return `${Math.ceil(calc('R / Y', {variable: {R: relativeTime, Y: yearInMs}}))} 年前`
  }
}

function transformPageObject(page) {
  return {
    id: page.id,
    user: page.properties.user.rich_text[0].text.content,
    time: getRelativeTimeDesc(page.properties.time.created_time),
    content: page.properties.content.rich_text[0].text.content,
    avatar: page.properties.avatar.url,
    replies: page.properties.replies.relation,
    replyTo: page.properties.replyTo?.relation[0]?.id,
  }
}

router.get('/comments', cors(), async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")

  try {
    const comments = await getAllComments()
    res.json(comments)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

router.post('/comments', cors(), async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")

  try {
    const newPage = await addComment(req.body)
    res.sendStatus(201).json(newPage)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

module.exports = router;
