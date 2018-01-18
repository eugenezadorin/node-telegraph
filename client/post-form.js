import Quill from 'quill';
import axios from 'axios';
import debounce from 'debounce';
import utils from './utils';
import icons from './icons';

(function(component) {
    if (!component) return;

    const CustomImageBlot = require('./custom_image_blot');

    const autosaveDelay = 500;
    
    const headingField = component.querySelector('.post-form__heading');
    const authorField = component.querySelector('.post-form__author');
    const storyField = component.querySelector('.post-form__story');
    const submitBtn = component.querySelector('.post-form__publish');
    const toolbar = component.querySelector('.post-form__toolbar');
    const toolbarMedia = component.querySelector('.post-form__toolbar-media');
    const toolbarMediaImageBtn = toolbarMedia.querySelector('.post-form__toolbar-media-image');
    const fileInput = component.querySelector('.post-form__file');
    const postCode = component.dataset.postCode;

    const autosaveTitleKey = postCode ? 'title_' + postCode : 'latest_title';
    const autosaveAuthorKey = postCode ? 'author_' + postCode : 'latest_author';
    const autosaveStoryKey = postCode ? 'story_' + postCode : 'latest_story';

    Quill.register(CustomImageBlot, true);

    var qIcons = Quill.import('ui/icons');
    qIcons['header'][2] = icons.h2;
    qIcons['header'][3] = icons.h3;

    toolbarMedia.querySelector('.post-form__toolbar-media-image').innerHTML = icons.camera;
    toolbarMedia.querySelector('.post-form__toolbar-media-video').innerHTML = icons.play;

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
        } catch (err) { console.log(err); }

        editor.on('text-change', debounce(function(){
            window.localStorage.setItem(autosaveKey, JSON.stringify(editor.getContents()));
        }, autosaveDelay));

        if (options && options.modules && options.modules.toolbar && options.modules.toolbar.container) {
            const _toolbar = options.modules.toolbar.container;

            editor.on('text-change', function(){
                setTimeout(function(){
                    toggleToolbarMedia(editor, toolbarMedia);
                }, 0);
            });

            editor.on('selection-change', function(range) {
                toggleToolbarMedia(editor, toolbarMedia);

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

    function toggleToolbarMedia(editor, toolbar) {
        try {
            const range = editor.getSelection();
            if (range && range.length == 0) {
                const selectionBounds = editor.getBounds(range);
                const line = editor.getLine(range.index);
                if (line[0].domNode.innerText.trim().length === 0) {
                    const editorBounds = editor.container.getBoundingClientRect();
                    var toolbarTop = window.pageYOffset + editorBounds.top + selectionBounds.top;
                    toolbar.style.top = toolbarTop + 'px';
                    toolbar.classList.add('visible');
                } else {
                    toolbar.classList.remove('visible');
                }
            } else {
                toolbar.classList.remove('visible');
            }
        } catch (err) {
            toolbar.classList.remove('visible');
        }
    }

    const headingEditor = initEditor(headingField, {
        placeholder: 'Title',
        theme: 'snow',
        modules: {
            toolbar: false,
            keyboard: inlineEditorKeyboardBehavior
        }
    }, autosaveTitleKey);

    const authorEditor = initEditor(authorField, {
        placeholder: 'Your name',
        theme: 'snow',
        modules: {
            toolbar: false,
            keyboard: inlineEditorKeyboardBehavior
        }
    }, autosaveAuthorKey);

    const storyEditor = initEditor(storyField, {
        placeholder: 'Your story',
        theme: 'snow',
        modules: {
            toolbar: { 
                container: toolbar 
            }
        }
    }, autosaveStoryKey);


    toolbarMediaImageBtn.addEventListener('click', function(event){
        event.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', function(){
        if (fileInput.files.length === 1) {
            var data = new FormData();
            data.append('file', fileInput.files[0]);
            axios.post('/upload', data)
                .then(function(response) {
                    fileInput.value = null;
                    try {
                        const src = response.data.path;
                        const range = storyEditor.getSelection(true);
                        storyEditor.insertEmbed(range.index, 'custom_image', {src: src, caption: ''}, Quill.sources.USER);
                    } catch (err) { 
                        console.log(err);
                    }
                })
                .catch(function(error){
                    console.log(error);
                    fileInput.value = null;
                });
        } else {
            fileInput.value = null;
        }
    });


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


    function extractTextareas(editorNode) {
        var virtualBlock = editorNode.cloneNode(true);
        var textareas = virtualBlock.querySelectorAll('textarea');
        var content, parent, area;

        for (var i = 0; i < textareas.length; i++) {
            area = textareas[i];
            content = document.createTextNode(area.value);
            parent = area.parentNode;

            parent.replaceChild(content, area);
        }

        return virtualBlock;
    }

    submitBtn.addEventListener('click', function(event){
        event.preventDefault();
        if (!validateForm()) {
            return false;
        }

        var storyEditorClone = extractTextareas(storyEditor.root);

        var data = {
            title: utils.getInlineText(headingEditor),
            author: utils.getInlineText(authorEditor),
            story: storyEditorClone.innerHTML,
            delta: storyEditor.getContents()
        };
        if (postCode) {
            data.code = postCode;
        }
        axios.post('/save', data)
            .then(function(response) {
                window.localStorage.removeItem(autosaveTitleKey);
                window.localStorage.removeItem(autosaveAuthorKey);
                window.localStorage.removeItem(autosaveStoryKey);

                window.location.href = response.data.url;
            })
            .catch(function(error){
                console.log(error);
            });
    });

})(document.getElementById('post-form'));