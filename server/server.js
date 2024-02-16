const express = require('express')

const bodyparser = require('body-parser')
const cors = require('cors')
const neo4j = require('neo4j-driver')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')


const app = express()
app.use(bodyparser.json())
app.use(cors({
  origin: ['http://localhost:8000', 'https://localhost:3000'],
  credentials: true,
}))

const port = 3000
const host = 'localhost'

const viewpath = __dirname + '/views/'
app.use(express.static(viewpath))

// const privateKey = fs.readFileSync(path.join(__dirname, './cert/private-key.pem'), 'utf8')
// const certificate = fs.readFileSync(path.join(__dirname, './cert/certificate.pem'), 'utf8')
// const credentials = { key: privateKey, cert: certificate }
// const https = require('https')
// const server = https.createServer(credentials, app)
const http = require('http')
const server = http.createServer(app)

const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "tswproject"))


// AUTHORIZATION AND SESSION

const express_session = require('express-session')
const session = express_session({
  resave: false,
  saveUninitialized: false,
  secret: 'secret'
})
app.use(session)

const passport = require("passport")
const passportLocal = require("passport-local")
app.use(passport.initialize())
app.use(passport.session())


function ValidateUser(username, password, done) {
  const neosession = driver.session()
  neosession.run(`match (u:User {name: $username}) return u`, {username})
    .then((result) => {
      const record = result.records[0]

      if (record) {
        const user = {
          userid: record.get('u').identity.low,
          name: record.get('u').properties.name
        }

        if (bcrypt.compareSync(password, record.get('u').properties.password)) { // correct password
          return done(null, user)
        } else { // incorrect password
          console.log(`Validation failed: Incorrect password for user '${username}'`)
          return done(null, null)
        }
      } else {
        console.log(`Validation failed: User '${username}' does not exist`)
        return done(null, null)
      }
    })
    .catch((e) => {
      console.error(e)
      done(e)
    })
    .finally(() => {
      neosession.close()
    })
}

passport.use(new passportLocal.Strategy(ValidateUser))

passport.serializeUser((user, done) => done(null, user.userid))

passport.deserializeUser((userid, done) => {
  const neosession = driver.session()
  neosession.run('match (u:User) where id(u) = $userid return u', {userid})
    .then((result) => {
      const record = result.records[0]
      if (record) {
        const user = {
          userid: record.get('u').identity.low,
          name: record.get('u').properties.name
        }
        done(null, user)
      } else {
        done(null, null)
      }
    })
    .catch((e) => {
      console.error(e)
      done(e)
    })
    .finally(() => {
      neosession.close()
    })
})

function LoggedInOnly(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).send("Unauthorized")
}

function Personal(req, res, next) {
  if (req.isAuthenticated()) {
    const id = req.params.id
    if (req.user.userid === parseInt(id)) {
      return next()
    } else {
      return res.status(401).send("Unauthorized") // ids dont match (different user)
    }
  } else {
    return res.status(401).send("Unauthorized") // not logged in
  }
}

// Login route
app.post('/api/login', passport.authenticate('local'), (req, res) => {
  console.log(`User '${req.user.name}' has logged in`)
  res.json(req.user)
})

// Logout route
app.get('/api/logout', (req, res) => {
  console.log(`User '${req.user.name}' has logged out`)
  req.logout((e) => {
    if (e) {
      console.error(e)
      return res.status(500).send("Failed to log out")
    }
    res.send("Logged out")
  })
})


// SOCKET

const socketIO = require('socket.io')
const io = socketIO(server, {
  cors: {
    origin: [`http://localhost:8000`, `https://localhost:3000`],
    methods: ["GET", "POST"],
    credentials: true
  }
})

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(session));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("Unauthorized to connect to socket.io"));
  }
});

async function UpdateSocketID(userid, socketid) {
  const neosession = driver.session()
  try {
    await neosession.run(
      "match (n:User) where ID(n) = $userid set n.socketid = $socketid",
      { userid: parseInt(userid), socketid: socketid }
    )
  } catch (e) {
    console.error(e)
  } finally {
    neosession.close()
  }
}

io.on('connection', (socket) => {
  const userid = socket.request.session.passport.user

  UpdateSocketID(userid, socket.id)
    .catch((e) => {
      console.error(e)
    })

})



// FUNCTIONS

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const dayths = {"1":"st", "2":"nd", "3":"rd"}

function DateTimeToString(datetime) {
  const day = datetime.day.low.toString()
  const dayth = (dayths[day.slice(-1)]) || "th"
  const month = datetime.month.low
  const year = datetime.year.low
  const hour = datetime.hour.low.toString().padStart(2, '0')
  const minute = datetime.minute.low.toString().padStart(2, '0')
  return `${day + dayth} ${months[month - 1]} ${year} ${hour}:${minute}`
}



// MAPPINGS

// CREATE NEW USER
app.post('/api/register', async (req, res) => {
  try {
    const user = req.body
    const neosession = driver.session()
    try { // check if username is taken
      const result = await neosession.run(
        'match (u:User {name: $username}) return u',
        {username: user.username}
      )
      if (result.records[0]) { // user found
        return res.status(400).send('Username is taken.')
      }
    } catch (e) {
      console.error(e)
      res.status(500).send("Failed to check username availability")
    } finally {
      neosession.close()
    }

    const neosession2 = driver.session()
    try { // create user
      await neosession2.run(
        'create (u:User {name: $username, password: $password})',
        {username: user.username, password: user.password}
      )
      console.log(`New user ${user.username} created`)
      res.send("User created")
    } catch (e) {
      console.error(e)
      res.status(500).send("Failed to create user")
    } finally {
      neosession2.close()
    }

  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to create user")
  }
})


// GET USER DATA
app.get('/api/userdata', LoggedInOnly, async (req, res) => {
  const neosession = driver.session()
  const userid = req.user.userid
  try {
    const result = await neosession.run(
      'match (u:User where ID(u) = $userid) return u',
      { userid: parseInt(userid) }
    )

    const record = result.records[0]
    if (!record) {
      res.status(404).send('User not found')
    } else {
      const user = record.get('u').properties
      delete user.password
      user.userid = record.get('u').identity.low
      res.json(user)
    }
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to fetch user data")
  } finally {
    neosession.close()
  }
})

// GET FOLLOWING (users that userid follows)
app.get('/api/following', LoggedInOnly, async (req, res) => {
  const neosession = driver.session()
  const userid = req.user.userid
  try {
    const result = await neosession.run(
      'match (n:User where ID(n) = $userid)-[:FOLLOWS]->(u:User) return u',
      {userid: parseInt(userid)}
    )
    if (result.records.length == 0) {
      res.json([])
    } else {
      const following = result.records.map(r => {
        return {
          userid: r.get('u').identity.low,
          username: r.get('u').properties.name,
          pfp: r.get('u').properties.pfp
        }
      })
      res.json(following)
    }

  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to fetch user's following")
  } finally {
    neosession.close()
  }
})


// POSTS

// NEW POST
app.post('/api/newpost', LoggedInOnly, async (req, res) => {
  const post = req.body
  const neosession = driver.session()
  try {
    const result1 = await neosession.run(
      'match (u:User where ID(u)=$userid) create (u)-[:POSTED]->(p:Post {content: $content, date:datetime()}) return ID(p) as postid, u.name as username, p.date as postdate',
      { userid: post.userid, content: post.content }
    )
    const postid = parseInt(result1.records[0].get('postid'))
    const username = result1.records[0].get('username')
    const postdate = new Date(result1.records[0].get('postdate'))
    const time = `${postdate.getHours()}:${postdate.getMinutes()}`

    const result2 = await neosession.run(
      'match (u:User where ID(u)=$userid)<-[:FOLLOWS]-(n:User) return collect(n.socketid) as followers',
      { userid: post.userid }
    )
    const followers = result2.records[0].get('followers')
    followers.forEach((sockedtid) => {
      io.to(sockedtid).emit('post', { postid, userid: post.userid, username, time})
    })

    res.send("Post created")
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to create post")
  } finally {
    neosession.close()
  }
})

// DELETE POST
app.delete('/api/deletepost/:id', LoggedInOnly, async (req, res) => {
  const neosession = driver.session()
  const postid = req.params.id
  try {
    await neosession.run(
      "match (p:Post) where ID(p) = $postid set p.content = '[DELETED]' with p where not(p) < -[: REPLIED_TO] - () detach delete p",
      { postid: parseInt(postid) }
    )
    res.send("Post deleted")

  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to delete post")
  } finally {
    neosession.close()
  }
})

// NEW REPLY (to an existing post)
app.post('/api/newreply', LoggedInOnly, async (req, res) => {
  const reply = req.body
  const neosession = driver.session()

  try {
    await neosession.run(
      'match (u:User where ID(u)=$userid) create (u)-[:POSTED]->(p1:Post {content: $content, date:datetime()}) with u,p1 match (p2:Post where ID(p2) = $previd) create (p1)-[:REPLIED_TO]->(p2)',
      { userid: parseInt(reply.userid), content: reply.content, previd: parseInt(reply.previd) }
    )
    res.send("Reply created")
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to create reply")
  } finally {
    neosession.close()
  }
})

// GET POST REPLIES (for post page)
app.get('/api/replies/:id', LoggedInOnly, async (req, res) => {
  const neosession = driver.session()
  const postid = req.params.id
  try {
    const result = await neosession.run(
      'match (p:Post where ID(p)=$postid) with p optional match (p2)-[:REPLIED_TO]->(p:Post) return COALESCE(ID(p2), []) as replies order by p2.date desc',
      {postid:parseInt(postid)}
    )

    if (result.records <= 1) {
      res.json([])
    } else {
      const posts = result.records.map(record => record.get("replies")).flat().map(id => parseInt(id))
      res.json(posts)
    }

  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to get post replies")
  } finally {
    neosession.close()
  }
})


// GET HOMEPOSTS (list of IDS for individual user home page)
app.get('/api/homeposts/:id/:limit/:skip', Personal, async (req, res) => {
  const neosession = driver.session()
  const userid = req.params.id
  const limit = req.params.limit
  const skip = req.params.skip
  try {
    const result = await neosession.run(
      'match (u:User where ID(u) = $userid) optional match (u)-[:FOLLOWS]->(u2:User) with collect(ID(u2)) as followed, u optional match (p:Post)<-[:POSTED]-(u2:User) where ID(u2) in followed or u2 = u return ID(p) as posts order by p.date desc skip $skip limit $limit',
      { userid: parseInt(userid), skip: neo4j.int(skip), limit: neo4j.int(limit) }
    )

    if (!result.records[0] || !result.records[0].get('posts')) {
      res.json([])
    } else {
      const posts = result.records.map(record => record.get("posts")).flat().map(id => parseInt(id))
      res.json(posts)
    }

  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to fetch home posts")
  } finally {
    neosession.close()
  }
})


// GET POST
app.get('/api/post/:id', LoggedInOnly, async (req, res) => {
    const postid = req.params.id
    const neosession = driver.session()
    try {
      const result = await neosession.run(
        'match (p:Post where ID(p)=$postid)<-[:POSTED]-(u:User) with p,u optional match (p)-[:REPLIED_TO]->(p2:Post)<-[:POSTED]-(u2:User) return p,u,p2,u2',
        {postid: parseInt(postid)}
      )

      const record = result.records[0]
      if (!record) {
        res.status(404).send("Post not found")
      } else {
        const Post = {
          postid: record.get('p').identity.low, 
          content: record.get('p').properties.content,
          date: DateTimeToString(record.get('p') .properties.date),
          userid: record.get('u').identity.low, 
          username: record.get('u').properties.name, 
          pfp: record.get('u').properties.pfp
        }
        const PrevPost = record.get('p2') ? {
          postid: record.get('p2').identity.low, 
          content: record.get('p2').properties.content, 
          date: DateTimeToString(record.get('p2').properties.date),
          userid: record.get('u2').identity.low, 
          username: record.get('u2').properties.name, 
          pfp: record.get('u2').properties.pfp
        } : null
        res.json({ Post, PrevPost })
      }
    } catch (e) {
      console.error(e)
      res.status(500).send("Failed to fetch post data")
    } finally {
      neosession.close()
    }
})


// SEARCHING

// SEARCH RESULTS (post ids)
app.get('/api/search/:query', LoggedInOnly, async (req, res) => {
  const neosession = driver.session()
  const query = req.params.query
  try {
    const result = await neosession.run(
      'match (u:User)-[:POSTED]->(p:Post) where toLower(u.name) contains toLower($query) or toLower(p.content) contains toLower($query) return ID(p) as posts order by p.date desc',
      {query}
    )

    if (!result) {
      res.json([])
    } else {
      const PostIds = result.records.map(record => record.get("posts")).flat().map(id => parseInt(id))
      res.json(PostIds)
    }

  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to fetch search results")
  } finally {
    neosession.close()
  }
})


// PROFILES

// GET USER PROFILE
app.get('/api/user/:id', LoggedInOnly, async (req, res) => {
    const userid = req.params.id
    const neosession = driver.session()
    try {
      const result = await neosession.run(
        `
        match (n:User where ID(n) = $userid)
        optional match ()-[f1:FOLLOWS]->(n)
        optional match ()<-[f2:FOLLOWS]-(n)
        optional match (n)-[:POSTED]->(p:Post)
        return n as user, count(distinct f1) as followers, count(distinct f2) as following, collect(distinct ID(p)) as posts
        `, {userid: parseInt(userid)})

      const record = result.records[0]
      if (!record) {
        res.status(404).send('User not found')
      } else {
        const user = record.get('user').properties
        delete user.password
        user.followingcount = record.get('following') ? record.get('following').low : 0
        user.followerscount = record.get('followers') ? record.get('followers').low : 0
        user.posts = record.get('posts').map(post => post.low)
        res.json(user)
      }
    } catch (e) {
      console.error(e)
      res.status(500).send("Failed to fetch profile date")
    } finally {
      neosession.close()
    }
})

// UPDATE BIO
app.patch('/api/updatebio/:id', Personal, async (req, res) => {
  const data = req.body
  const neosession = driver.session()
  try {
    await neosession.run(
      'match (u:User where ID(u)=$userid) set u.bio=$content',
      {userid: parseInt(data.userid), content: data.content || ""}
    )
    res.send("Bio updated")
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to update bio")
  } finally {
    neosession.close()
  }
})

// UPDATE PFP
app.patch('/api/updatepfp/:id', Personal, async (req, res) => {
  const data = req.body
  const neosession = driver.session()

  try {
    await neosession.run(
      'match (u:User where ID(u)=$userid) set u.pfp=$pfp',
      {userid: data.userid, pfp: data.pfp || ""}
    )
    res.send("Profile picture updated")
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to update profile picture")
  } finally {
    neosession.close()
  }
})

// FOLLOW USER
app.post('/api/follow', LoggedInOnly, async (req, res) => {
  const data = req.body
  const neosession = driver.session()
  try {
    await neosession.run(
      'match (n where ID(n)=$userid), (m where ID(m)=$profileid) create (n)-[:FOLLOWS]->(m)',
      {userid: parseInt(data.userid), profileid: parseInt(data.profileid)}
    )
    res.send("User followed")
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to follow user")
  } finally {
    neosession.close()
  }
})

// UNFOLLOW USER
app.put('/api/unfollow', LoggedInOnly, async (req, res) => {
  const data = req.body
  const neosession = driver.session()
  try {
    await neosession.run(
      'match (n where ID(n)=$userid)-[r:FOLLOWS]->(m where ID(m)=$profileid) delete r',
      {userid: parseInt(data.userid), profileid: parseInt(data.profileid)}
    )
    res.send("User unfollowed")
  } catch (e) {
    console.error(e)
    res.status(500).send("Failed to unfollow user")
  } finally {
    neosession.close()
  }
})



// DEPLOYMENT
app.get('*', (req, res) => {
  res.sendFile(viewpath)
})

// FINAL

process.on('exit', () => {
  driver.close()
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
