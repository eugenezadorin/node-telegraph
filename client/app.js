require('./bootstrap.js');
const Quill = require('quill');

new Quill(document.querySelector('#post-form .post-form__heading'), {
    placeholder: 'Title',
    theme: 'snow',
    modules: {
        toolbar: false
    }
});

new Quill(document.querySelector('#post-form .post-form__author'), {
    placeholder: 'Your name',
    theme: 'snow',
    modules: {
        toolbar: false
    }
});

new Quill(document.querySelector('#post-form .post-form__story'), {
    placeholder: 'Your story',
    theme: 'snow',
    modules: {
        toolbar: false
    }
});