// zacimac/scrapboard ~ I like the name because it has 'crap' in it.

const config = require('../config');

require('ejs');
const path = require('path');
const http = require('http');
const crypto = require("crypto");
const express = require('express');
const socket = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const discordOauth2 = require('discord-oauth2');
const { WebhookClient, MessageEmbed } = require('discord.js');

const webhook = new WebhookClient({ id: config.webhook.id, token: config.webhook.token }); 
mongoose.connect(config.dbUri, { useNewUrlParser: true });
const app = express();
const server = http.createServer(app);
const io = socket(server, {
  maxHttpBufferSize: 2000000, // 2 MB
});
const oauth = new discordOauth2(config.discord);
const session = cookieSession(config.cookieSession);

const modelGeneral = require('./models/General');
const Users = require('./models/Users');
const Submissions = require('./models/Submissions');

// # web stuff
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);

server.listen(config.port, () => {
  console.info(`Listening on http://localhost:${config.port}/`);
});

// Socket
io.on('connection', (socket) => {
  let cookieString = socket.request.headers.cookie;
  let req = {connection: {encrypted: false}, headers: {cookie: cookieString}}
  let res = {getHeader: () =>{}, setHeader: () => {}};

  socket.on("submitItem", (data, callback) => {
    session(req, res, async () => {
      if (!req.session?.auth) return callback({ success: false, message: "Authentication error" });

      const userDocument = await Users.findOne({ token: req.session.auth });
      if (!userDocument) return callback({ success: false, message: "Authentication error" });

      // Use oauth verification of ID...
      oauth.getUser(userDocument.discordAccess)
        .then(async (user) => {
          try {
            // Check if a pending submission from this user exists
            const submissionDocument = await Submissions.find({ user: userDocument, status: "pending" });
            if (submissionDocument.length >= 5) return callback({ success: false, message: "You have reached the maximum of 5 pending submissions..." });

            // Create a new submission
            const submission = new Submissions({
              user: userDocument,
              status: "pending",
              unix: Math.round((new Date()).getTime() / 1000),
              name: user.username,
              uri: data.uri,
              angle: data.angle,
              scaleX: data.scaleX,
              scaleY: data.scaleY,
              top: data.top,
              left: data.left,
            });

            // Save the submission
            await submission.save();

            // get submissions
            const allSubmissions = await Submissions.find({}, "status unix uri name");

            webhook.send({
              content: `**New submission** | By ${user.username}`,
            })
            .then(() => {
              console.log("Webhook sent");
            })
            .catch(console.error);

            callback({ success: true });

            const adminSubmissions = await Submissions.find({}).populate("user");
            io.emit('adminSubmissionUpdate', {
              submissions: adminSubmissions,
            });

            io.emit('submissionUpdate', {
              submissions: allSubmissions.map(submissionItem => {
                return {
                  status: submissionItem.status,
                  image: submissionItem.uri,
                  by: submissionItem.name,
                  date: submissionItem.unix,
                }
              }).reverse().slice(0, 10),
            });
          } catch (processErr) {
            console.error(processErr);
            callback({ success: false, message: "Internal error when trying to save submission..." });
          }
        })
        .catch(oauthErr => {
          console.error(oauthErr);
          callback({ success: false, message: "Authentication error" });
        });
    });
  });

  socket.on("adminNewBanner", (data, callback) => {
    session(req, res, async () => {
      if (!req.session?.auth) return callback({ success: false, message: "Authentication error." });

      const userDocument = await Users.findOne({ token: req.session.auth });
      if (!userDocument) return callback({ success: false, message: "Authentication error." });

      // Use oauth verification of ID...
      oauth.getUser(userDocument.discordAccess)
        .then(async (user) => {
          try {
            if (!config.admins.includes(user.id)) return callback({ success: false, message: "You are not an admin." });
            
            const modelGeneralDocument = await modelGeneral.findOne({});
            if (!modelGeneralDocument) return callback({ success: false, message: "Internal error." });

            const submissionDocument = await Submissions.findById(data.submissionID);
            if (!submissionDocument) return callback({ success: false, message: "Submission not found." });

            submissionDocument.status = "approved";
            modelGeneralDocument.bannerURI = data.newBannerURI;

            await submissionDocument.save();
            await modelGeneralDocument.save();

            // get submissions
            const allSubmissions = await Submissions.find({}, "status unix uri name");

            io.emit('submissionUpdate', {
              submissions: allSubmissions.map(submissionItem => {
                return {
                  status: submissionItem.status,
                  image: submissionItem.uri,
                  by: submissionItem.name,
                  date: submissionItem.unix,
                }
              }).reverse().slice(0, 10),
            });
            const adminSubmissions = await Submissions.find({}).populate("user");
            io.emit('adminSubmissionUpdate', {
              submissions: adminSubmissions,
            });
            io.emit('canvasChange', { uri: data.newBannerURI });
            callback({ success: true });
          } catch (processErr) {
            console.error(processErr);
            callback({ success: false, message: "Processing error." });
          }
        })
        .catch(oauthErr => {
          console.error(oauthErr);
          callback({ success: false, message: "Authentication error" });
        });
    });
  });

  socket.on("adminDeny", (data, callback) => {
    session(req, res, async () => {
      if (!req.session?.auth) return callback({ success: false, message: "Authentication error." });

      const userDocument = await Users.findOne({ token: req.session.auth });
      if (!userDocument) return callback({ success: false, message: "Authentication error." });

      // Use oauth verification of ID...
      oauth.getUser(userDocument.discordAccess)
        .then(async (user) => {
          try {
            if (!config.admins.includes(user.id)) return callback({ success: false, message: "You are not an admin." });

            const submissionDocument = await Submissions.findById(data.submissionID);
            if (!submissionDocument) return callback({ success: false, message: "Submission not found." });

            submissionDocument.status = "denied";

            await submissionDocument.save();

            // get submissions
            const allSubmissions = await Submissions.find({}, "status unix uri name");

            io.emit('submissionUpdate', {
              submissions: allSubmissions.map(submissionItem => {
                return {
                  status: submissionItem.status,
                  image: submissionItem.uri,
                  by: submissionItem.name,
                  date: submissionItem.unix,
                }
              }).reverse().slice(0, 10),
            });
            const adminSubmissions = await Submissions.find({}).populate("user");
            io.emit('adminSubmissionUpdate', {
              submissions: adminSubmissions,
            });
            callback({ success: true });
          } catch (processErr) {
            console.error(processErr);
            callback({ success: false, message: "Processing error." });
          }
        })
        .catch(oauthErr => {
          console.error(oauthErr);
          callback({ success: false, message: "Authentication error" });
        });
    });
  });
});

// Main Express
app.use(async (req, res, next) => {
  if (!req.session.auth) return next();

  const userDocument = await Users.findOne({ token: req.session.auth });
  if (!userDocument) return next();

  oauth.getUser(userDocument.discordAccess)
    .then(user => {
      req.userAuth = userDocument;
      req.user = user;
      next();
    })
    .catch(err => {
      console.error(err);
      next();
    });
});

app.get('/', async (req, res) => {
  const generalData = await modelGeneral.findOne({});
  const allSubmissions = await Submissions.find({}, "status unix uri name");
  res.render('main', {
    user: req.user ? {
      tag: `${req.user.username}#${req.user.discriminator}`,
      avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=32`,
    } : null,
    banner: generalData?.bannerURI || "",
    submissions: allSubmissions.map(submissionItem => {
      return {
        status: submissionItem.status,
        image: submissionItem.uri,
        by: submissionItem.name,
        date: submissionItem.unix,
      }
    }).reverse().slice(0, 10),
  });
});

app.get('/login', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&redirect_uri=${config.discord.redirectUri}&response_type=code&scope=identify`);
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get('/oauth', (req, res) => {
  if (req.query && !req.query.error) {
    oauth.tokenRequest({
      ...config.discord,
      code: req.query.code,
      scope: 'identify',
      grantType: 'authorization_code'
    })
    .then((tokens) => {
      oauth.getUser(tokens.access_token)
      .then(async (userData) => {
        let document;

        const userDocument = await Users.findOne({
          discordID: userData.id,
        });
        if (userDocument) {
          document = userDocument;
        } else {
          document = new Users({
            discordID: userData.id,
            discordAccess: tokens.access_token,
            discordRefresh: tokens.refresh_token,
          });
        }

        document.token = crypto.randomBytes(48).toString("hex");
        await document.save();

        req.session.auth = document.token;
        res.redirect("/")
      })
      .catch((errorGR) => {
        console.log(errorGR);
        res.render('error', {
          title: "Authentication error",
          body: "Something happened when trying to authenticate with Discord. Please try again later or tweet me (@zacimac)"
        });
      });
    })
    .catch((errorTR) => {
      console.error(errorTR);
      res.render('error', {
        title: "Authentication error",
        body: "Something happened when trying to authenticate with Discord. Please try again later or tweet me (@zacimac)"
      });
    })
  } else {
    res.render('error', {
      title: "Authentication error",
      body: "Something happened when trying to authenticate with Discord. Please try again later or tweet me (@zacimac)"
    });
  }
});

// # ADMIN

app.get("/admin", async (req, res) => {
  if (!req.user) return res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });

  if (!config.admins.includes(req.user.id))return res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });

  const generalData = await modelGeneral.findOne({});
  const allSubmissions = await Submissions.find({}).populate("user");
  res.render('admin', {
    user: req.user ? {
      tag: `${req.user.username}#${req.user.discriminator}`,
      avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=32`,
    } : null,
    banner: generalData?.bannerURI || "",
    submissions: allSubmissions,
  });
});

// TODO: REMOVE ONCE DONE, THIS IS FOR TESTING
app.get('/init', async (req, res) => {
  if (!req.user) return res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });

  if (!config.admins.includes(req.user.id))return res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });

  await modelGeneral.deleteMany({});
  await modelGeneral.create({
    bannerURI: "1",
  });
});

app.get('/test', async (req, res) => {
  if (!req.user) return res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });

  if (!config.admins.includes(req.user.id))return res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });

  const adminSubmissions = await Submissions.find({}).populate("user");
  io.emit('adminSubmissionUpdate', {
    submissions: adminSubmissions,
  });

  res.send("yes");
});

// # 404
app.get('*', function(req, res){
  res.render('error', {
    title: "Page not found",
    body: "Not sure how you got here..."
  });
});