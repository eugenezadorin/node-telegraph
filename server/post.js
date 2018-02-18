const crypto = require('crypto');
const slugify = require('transliteration').slugify;
const db = require('nedb');
const htmlparser = require('htmlparser2');
const sanitizeHtml = require('sanitize-html');
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
        this.title = params.title || '';
        this.createdAt = params.createdAt ? new Date(params.createdAt) : null;
        this.updatedAt = params.updatedAt ? new Date(params.updatedAt) : null;
    }

    static get defaults() {
        return {
            dateLocaleOptions: {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            },
            allowedTags: [
                'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 
                'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                'pre', 'img', 'figure', 'figcaption', 'iframe', 'amp-img', 'amp-iframe'
            ],
            allowedAttributes: {
                '*': [
                    'href', 'class', 'contenteditable', 'alt', 'src', 'placeholder', 'target', 
                    'spellcheck', 'itemprop', 'width', 'height', 'allowfullscreen', 'frameborder'
                ]
            },
            allowedAmpAttributes: {
                '*': ['href', 'class', 'alt', 'src', 'placeholder', 'target', 'width', 'height', 'layout', 'allowfullscreen', 'frameborder', 'sandbox']
            }
        };
    }

    set title(value) {
        this._title = value;
        this.slug = slugify(this._title).substring(0, config.postSlugLen) + '-' + this.code;
    }

    get title() {
        return this._title;
    }

    set story(value) {
        this._story = value;
        this.storyAmp = sanitizeHtml(value, {
            allowedTags: Post.defaults.allowedTags,
            allowedAttributes: Post.defaults.allowedAmpAttributes,
            transformTags: {
                'img': function(tagName, attribs) {
                    return {
                        tagName: 'amp-img',
                        attribs: {
                            src: attribs.src,
                            width: attribs.width,
                            height: attribs.height,
                            layout: 'responsive',
                        }
                    };
                },
                'iframe': function(tagName, attribs) {
                    return {
                        tagName: 'amp-iframe',
                        attribs: {
                            src: attribs.src,
                            allowfullscreen: '',
                            frameborder: '0',
                            width: '16',
                            height: '9',
                            layout: 'responsive',
                            sandbox: 'allow-scripts allow-same-origin allow-popups',
                        },
                        text: '%amp_iframe_placeholder%'
                    };
                }
            }
        });

        this.storyAmp = this.storyAmp.replace(
            /%amp_iframe_placeholder%/g,
            '<amp-img layout="fill" src="%amp_iframe_placeholder_src%" placeholder></amp-img>'
        );

        const handler = new htmlparser.DomHandler((error, dom) => {
            if (error) return;

            const domUtils = htmlparser.DomUtils;

            const description = domUtils.findOne(el => {
                return el.type && el.type == 'tag' && el.name && el.name == 'p';
            }, dom);

            this.description = description ? domUtils.getText(description) : null;

            const image = domUtils.findOne(el => {
                return el.type && el.type == 'tag' && el.name && el.name == 'img';
            }, dom);
            
            this.image = (image && image.attribs && image.attribs.src) ? image.attribs.src : null;
        });

        const parser = new htmlparser.Parser(handler);
        parser.write(value);
        parser.end();
    }

    get story() {
        return this._story;
    }

    get url() {
        return '/' + this.slug;
    }

    get editUrl() {
        return '/' + this.slug + '/edit';
    }

    get ampUrl() {
        return '/' + this.slug + '/amp';
    }

    get createdAtLocale() {
        if (this.createdAt && this.createdAt.toLocaleString) {
            return this.createdAt.toLocaleString('en-US', Post.defaults.dateLocaleOptions);
        } else {
            return null;
        }
    }

    get updatedAtLocale() {
        if (this.updatedAt && this.updatedAt.toLocaleString) {
            return this.updatedAt.toLocaleString('en-US', Post.defaults.dateLocaleOptions);
        } else {
            return null;
        }
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
            description: this.description,
            image: this.image,
            delta: this.delta,
            userId: this.userId,
            slug: this.slug,
            code: this.code
        };
        storage.insert(post, error => {
            if (error) {
                callback(error);
            } else {
                callback(null, this);
            }
        });
    }

    update(callback) {
        const findPost = {_id: this._id};
        const replacePost = {
            title: this.title,
            author: this.author,
            story: this.story,
            description: this.description,
            image: this.image,
            delta: this.delta,
            userId: this.userId,
            slug: this.slug,
            code: this.code
        };
        storage.update(findPost, replacePost, {}, (error, numReplaced) => {
            if (error) {
                callback(error);
            } else if (numReplaced === 0) {
                callback('No records replaced');
            } else {
                callback(null, this);
            }
        });
    }
}

module.exports = Post;