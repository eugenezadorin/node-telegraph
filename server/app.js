const app = require('./bootstrap');
const crypto = require('crypto');
const config = require('./config');
const Post = require('./post');
const mime = require('mime/lite');
const mmmagic = require('mmmagic');
const sharp = require('sharp');

const libmagic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);

app.use(function(req, res, next){
    var userId = req.signedCookies[ config.userCookieName ];
    if (!userId) {
        userId = crypto.randomBytes( config.userCookieLen / 2 ).toString('hex');
        res.cookie(config.userCookieName, userId, { 
            signed: true,
            expires: new Date(Date.now() + config.userCookieLifetime)
        });
    }
    req.userId = userId;
    next();
});

app.get('/', function (req, res) {
    res.render('index', {title: 'New post'});
});

app.get('/:slug', function(req, res){
    Post.findBySlug(req.params.slug, function(error, post){
        if (post) {
            res.render('post', {
                post: post, 
                canEdit: post.editable(req.userId),
                title: post.title
            });
        } else {
            res.sendStatus(404);
        }
    });
});

app.get('/:slug/edit', function(req, res){
    Post.findBySlug(req.params.slug, function(error, post){
        if (post) {
            if (post.editable(req.userId)) {
                res.render('post_edit', {post: post, title: post.title});
            } else {
                res.redirect(post.url());
            }
        } else {
            res.sendStatus(404);
        }
    });
});

app.post('/save', function(req, res){
    /** @todo check incoming fields */

    if (req.body.code) 
    {
        Post.findByCode(req.body.code, function(error, post){
            if (error) {
                res.sendStatus(400);
            } else if (!post.editable(req.userId)) {
                res.sendStatus(403);
            } else {
                post.setTitle(req.body.title);
                post.author = req.body.author;
                post.story = req.body.story;

                post.update(function(error, updatedPost){
                    if (error) {
                        res.sendStatus(400);
                    } else {
                        res.json({
                            code: updatedPost.code,
                            slug: updatedPost.slug,
                            url: updatedPost.url()
                        });
                    }
                });
            }
        });
    }
    else
    {
        const post = new Post({
            title: req.body.title,
            author: req.body.author,
            story: req.body.story,
            userId: req.userId
        });
        post.add(function(error, newPost){
            if (error) {
                res.sendStatus(400);
            } else {
                res.json({
                    code: newPost.code,
                    slug: newPost.slug,
                    url: newPost.url()
                });
            }
        });
    }
});

app.post('/upload', function(req, res){
    if (!req.files) {
        return res.sendStatus(400);
    }

    const file = req.files.file;
    if (!file || !file.data) {
        return res.sendStatus(400);
    }

    libmagic.detect(file.data, function(error, realMimetype){
        if (error) {
            return res.sendStatus(400);
        } else {
            if (realMimetype.indexOf('image/') != 0) {
                return res.sendStatus(400);
            }

            const ext = mime.getExtension(realMimetype);
            if (!ext) {
                return res.sendStatus(400);
            }

            const fileName = crypto.pseudoRandomBytes( config.fileNameLen / 2 ).toString('hex') + '.' + ext;

            const serverPath = './server/upload/' + fileName;
            const publicPath = '/file/' + fileName;

            sharp(file.data)
                .resize(config.fileMaxWidth, null)
                .withoutEnlargement()
                .toFile(serverPath, function(error, info){
                    if (error) {
                        return res.sendStatus(500);
                    } else {
                        info.path = publicPath;
                        return res.json({
                            path: publicPath,
                            width: info.width,
                            height: info.height,
                            size: info.size
                        });
                    }
                });
        }
    });
});

module.exports = app;