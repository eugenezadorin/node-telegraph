(function(component) {
    if (!component) return;

    const Quill = require('quill');
    const axios = require('axios'); 
    const debounce = require('debounce');
    const utils = require('./utils'); 

    const autosaveDelay = 500;
    
    const headingField = component.querySelector('.post-form__heading');
    const authorField = component.querySelector('.post-form__author');
    const storyField = component.querySelector('.post-form__story');
    const submitBtn = component.querySelector('.post-form__publish');
    const toolbar = component.querySelector('.post-form__toolbar');
    const postCode = component.dataset.postCode;

    var icons = Quill.import('ui/icons');
    icons['header'] = '<span class="post-form__toolbar-heading-icon">H<span class="post-form__toolbar-heading-icon-index"></span>';

    const inlineEditorKeyboardBehavior = {
        bindings: {
            tab: {
                handler: function() {
                    return true;
                }
            }
        }
    };

    const initEditor = function (element, options, autosaveKey) {
        const editor = new Quill(element, options);
        
        try {
            const savedContents = window.localStorage.getItem(autosaveKey);
            if (savedContents) {
                editor.setContents(JSON.parse(savedContents));
            }
        } catch (err) { /**/ }

        editor.on('text-change', debounce(function(){
            window.localStorage.setItem(autosaveKey, JSON.stringify(editor.getContents()));
        }, autosaveDelay));

        if (options && options.modules && options.modules.toolbar && options.modules.toolbar.container) {
            const _toolbar = options.modules.toolbar.container;

            editor.on('selection-change', function(range) {
                if (range) {
                    if (range.length == 0) {
                        _toolbar.style.visibility = 'hidden';
                        _toolbar.style.left = '0';
                        _toolbar.style.top = '0';
                    } else {
                        const selectionBounds = editor.getBounds(range);
                        const editorBounds = element.getBoundingClientRect();
                        const toolbarBounds = _toolbar.getBoundingClientRect();

                        var toolbarLeft = window.pageYOffset + editorBounds.left + selectionBounds.left;
                        toolbarLeft += ((selectionBounds.right - selectionBounds.left) / 2);
                        toolbarLeft -= (toolbarBounds.width / 2);

                        var toolbarTop = window.pageYOffset + editorBounds.top + selectionBounds.top - toolbarBounds.height - 5;

                        _toolbar.style.top = toolbarTop + 'px';
                        _toolbar.style.left = toolbarLeft + 'px';
                        _toolbar.style.visibility = 'visible';
                    }
                } else {
                    _toolbar.style.visibility = 'hidden';
                    _toolbar.style.left = '0';
                    _toolbar.style.top = '0';
                }
            });
        }

        return editor;
    };

    const headingEditor = initEditor(headingField, {
        placeholder: 'Title',
        theme: 'snow',
        modules: {
            toolbar: false,
            keyboard: inlineEditorKeyboardBehavior
        }
    }, 'latest_title');

    const authorEditor = initEditor(authorField, {
        placeholder: 'Your name',
        theme: 'snow',
        modules: {
            toolbar: false,
            keyboard: inlineEditorKeyboardBehavior
        }
    }, 'latest_author');

    const storyEditor = initEditor(storyField, {
        placeholder: 'Your story',
        theme: 'snow',
        modules: {
            toolbar: { 
                container: toolbar 
            }
        }
    }, 'latest_story');


    const validateForm = function() {
        var errors = false;
        if (utils.isEditorEmpty(headingEditor)) {
            errors = true;
            headingField.classList.add('error');
        } else {
            headingField.classList.remove('error');
        }

        if (utils.isEditorEmpty(authorEditor)) {
            errors = true;
            authorField.classList.add('error');
        } else {
            authorField.classList.remove('error');
        }

        if (utils.isEditorEmpty(storyEditor)) {
            errors = true;
            storyField.classList.add('error');
        } else {
            storyField.classList.remove('error');
        }

        return !errors;
    };

    submitBtn.addEventListener('click', function(event){
        event.preventDefault();
        if (!validateForm()) {
            return false;
        }

        var data = {
            title: utils.getInlineText(headingEditor),
            author: utils.getInlineText(authorEditor),
            story: storyEditor.root.innerHTML
        };
        if (postCode) {
            data.code = postCode;
        }
        axios.post('/save', data)
            .then(function(response) {
                window.localStorage.removeItem('latest_title');
                window.localStorage.removeItem('latest_author');
                window.localStorage.removeItem('latest_story');

                window.location.href = response.data.url;
            })
            .catch(function(error){
                console.log(error);
            });
    });

})(document.getElementById('post-form'));