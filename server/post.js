const crypto = require('crypto');
const slugify = require('transliteration').slugify;
const db = require('nedb');
const config = require('./config');
const storage = new db({
    filename: './server/db/posts',
    timestampData: true,
    autoload: true
});

class Post 
{
    constructor(params) {
        this._id = params._id || '';
        this.author = params.author || '';
        this.story = params.story || '';
        this.delta = params.delta || {};
        this.userId = params.userId || '';
        this.code = params.code || crypto.randomBytes(config.postCodeLen / 2).toString('hex');

        this.setTitle(params.title || '');

        var date;
        if (params.createdAt) {
            date = new Date(params.createdAt);
            this.createdAt = date;
            this.createdAtLocale = date.toLocaleString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            });
        } else {
            this.createdAt = null;
            this.createdAtLocale = null;
        }

        if (params.updatedAt) {
            date = new Date(params.updatedAt);
            this.updatedAt = date;
            this.updatedAtLocale = date.toLocaleString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            });
        } else {
            this.updatedAt = null;
            this.updatedAtLocale = null;
        }
    }

    setTitle(title) {
        this.title = title;
        this.slug = slugify(this.title).substring(0, config.postSlugLen) + '-' + this.code;
    }

    url() {
        return '/' + this.slug;
    }

    editUrl() {
        return '/' + this.slug + '/edit';
    }

    editable(userId) {
        return this.userId === userId;
    }

    static findBySlug(slug, callback) {
        storage.findOne({slug: slug}, function(error, dbPost){
            if (error) {
                callback(error);
            } else if (dbPost) {
                callback(null, new Post(dbPost));
            } else {
                callback('Post not found');
            }
        });
    }

    static findByCode(code, callback) {
        storage.findOne({code: code}, function(error, dbPost){
            if (error) {
                callback(error);
            } else if (dbPost) {
                callback(null, new Post(dbPost));
            } else {
                callback('Post not found');
            }
        });
    }

    add(callback) {
        const post = {
            title: this.title,
            author: this.author,
            story: this.story,
            delta: this.delta,
            userId: this.userId,
            slug: this.slug,
            code: this.code
        };
        storage.insert(post, function(error){
            if (error) {
                callback(error);
            } else {
                callback(null, this);
            }
        }.bind(this));
    }

    update(callback) {
        const findPost = {_id: this._id};
        const replacePost = {
            title: this.title,
            author: this.author,
            story: this.story,
            delta: this.delta,
            userId: this.userId,
            slug: this.slug,
            code: this.code
        };
        storage.update(findPost, replacePost, {}, function(error, numReplaced){
            if (error) {
                callback(error);
            } else if (numReplaced === 0) {
                callback('No records replaced');
            } else {
                callback(null, this);
            }
        }.bind(this));
    }
}

module.exports = Post;