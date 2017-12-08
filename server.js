const express = require('express');
const bodyParser = require('body-parser');
const db = require('nedb');
const translit = require('cyrillic-to-translit-js');

const app = express();
const port = 3000;

const slugLen = 100;

const storage = new db({
    filename: './server/db/posts',
    timestampData: true,
    autoload: true
});

app.use(bodyParser.json());

app.use('/static', express.static('public'));

app.set('view engine', 'pug');

app.set('views', './server/views');

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/:id/:slug', function(req, res){
    storage.findOne({_id: req.params.id}, function(error, post){
        if (post) {
            res.render('post', {
                title: post.title,
                author: post.author,
                story: post.story,
                date: post.createdAt
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
        slug: translit().transform(req.body.title, '-').substring(0, slugLen)
    };
    storage.insert(post, function(error, newPost){
        if (error) {
            res.sendStatus(400);
        } else {
            res.json({
                id: newPost._id,
                slug: newPost.slug,
                url: '/' + newPost._id + '/' + newPost.slug
            });
        }
    });
});

app.listen(port, () => {
    console.log('Running on http://localhost:' + port + '/');
});
