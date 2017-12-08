(function(component) {
    if (!component) return;

    const Quill = require('quill');
    const axios = require('axios');    

    const headingField = component.querySelector('.post-form__heading');
    const authorField = component.querySelector('.post-form__author');
    const storyField = component.querySelector('.post-form__story');
    const submitBtn = component.querySelector('.post-form__publish');

    const headingEditor = new Quill(headingField, {
        placeholder: 'Title',
        theme: 'snow',
        modules: {
            toolbar: false
        }
    });

    const authorEditor = new Quill(authorField, {
        placeholder: 'Your name',
        theme: 'snow',
        modules: {
            toolbar: false
        }
    });

    const storyEditor = new Quill(storyField, {
        placeholder: 'Your story',
        theme: 'snow',
        modules: {
            toolbar: false
        }
    });

    submitBtn.addEventListener('click', function(event){
        event.preventDefault();
        const data = {
            title: headingEditor.getText().trim(),
            author: authorEditor.getText().trim(),
            story: storyEditor.root.innerHTML
        };
        axios.post('/save', data)
            .then(function(response) {
                window.location.href = response.data.url;
            })
            .catch(function(error){
                console.log(error);
            });
    });

})(document.getElementById('post-form'));