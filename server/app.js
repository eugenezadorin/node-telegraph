const app = require('./bootstrap');
const db = require('nedb');
const translit = require('cyrillic-to-translit-js');
const utils = require('./utils');
const crypto = require('crypto');

const slugLen = 100;
const codeLen = 8;
const userCookieName = 'user';
const userCookieLen = 64;
const userCookieLifetime = 3600 * 24 * 365 * 1000; // 1 year

const storage = new db({
    filename: './server/db/posts',
    timestampData: true,
    autoload: true
});

app.use(function(req, res, next){
    var cookie = req.signedCookies[userCookieName];
    if (!cookie) {
        const userId = crypto.randomBytes(userCookieLen).toString('hex');
        res.cookie(userCookieName, userId, { 
            signed: true,
            expires: new Date(Date.now() + userCookieLifetime)
        });
    }
    next();
});

app.get('/', function (req, res) {
    res.render('index', {title: 'New post'});
});

app.get('/:code/:slug', function(req, res){
    storage.findOne({code: req.params.code, slug: req.params.slug}, function(error, post){
        if (post) {
            const date = new Date(post.createdAt);
            const localDate = date.toLocaleString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            });
            
            res.render('post', {
                title: post.title,
                author: post.author,
                story: post.story,
                date: localDate,
                date_iso: date.toISOString()
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/save', function(req, res){
    const post = {
        title: req.body.title,
        author: req.body.author,
        story: req.body.story,
        slug: translit().transform(req.body.title, '-').substring(0, slugLen),
        code: utils.randString(codeLen)
    };
    storage.insert(post, function(error, newPost){
        if (error) {
            res.sendStatus(400);
        } else {
            res.json({
                code: newPost.code,
                slug: newPost.slug,
                url: '/' + newPost.code + '/' + newPost.slug
            });
        }
    });
});

module.exports = app;