new Medium({
    element: document.querySelector('#post-form .post-form__heading-content'),
    placeholder: 'Title',
    mode: Medium.partialMode
});

new Medium({
    element: document.querySelector('#post-form .post-form__author-content'),
    placeholder: 'Your name',
    mode: Medium.inlineMode
});

new Medium({
    element: document.querySelector('#post-form .post-form__story-content'),
    placeholder: 'Your story'
});