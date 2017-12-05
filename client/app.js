require('./bootstrap.js');
const Quill = require('quill');

new Quill(document.querySelector('#post-form .post-form__heading-content'), {
    placeholder: 'Title',
    theme: 'snow',
    modules: {
        toolbar: false
    }
});

new Quill(document.querySelector('#post-form .post-form__author-content'), {
    placeholder: 'Your name',
    theme: 'snow',
    modules: {
        toolbar: false
    }
});

new Quill(document.querySelector('#post-form .post-form__story-content'), {
    placeholder: 'Your story',
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', {size: ['large', 'normal', 'small']}], 
            ['link', 'image', 'video'], 
            ['code-block', 'blockquote']
        ]
    }
});