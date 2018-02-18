import Quill from 'quill';
import Delta from 'quill-delta';
import axios from 'axios';
import debounce from 'debounce';
import urlValidator from 'valid-url';
import utils from './utils';
import icons from './icons';
import CustomImageBlot from './blots/custom_image';
import ParagraphEmbedBlot from './blots/paragraph_embed';
import CustomVideoBlot from './blots/custom_video';
import Keyboard from './keyboard';

(function(component) {
    if (!component) return;

    const autosaveDelay = 500;
    
    const headingField = component.querySelector('.post-form__heading');
    const authorField = component.querySelector('.post-form__author');
    const storyField = component.querySelector('.post-form__story');
    const submitBtn = component.querySelector('.post-form__publish');
    const toolbar = component.querySelector('.post-form__toolbar');
    const toolbarMedia = component.querySelector('.post-form__toolbar-media');
    const toolbarMediaImageBtn = toolbarMedia.querySelector('.post-form__toolbar-media-image');
    const toolbarMediaEmbedBtn = toolbarMedia.querySelector('.post-form__toolbar-media-video');
    const fileInput = component.querySelector('.post-form__file');
    const postCode = component.dataset.postCode;

    const autosaveTitleKey = postCode ? 'title_' + postCode : 'latest_title';
    const autosaveAuthorKey = postCode ? 'author_' + postCode : 'latest_author';
    const autosaveStoryKey = postCode ? 'story_' + postCode : 'latest_story';

    Quill.register(CustomImageBlot, true);
    Quill.register(ParagraphEmbedBlot, true);
    Quill.register(CustomVideoBlot, true);

    let qIcons = Quill.import('ui/icons');
    qIcons['header'][2] = icons.h2;
    qIcons['header'][3] = icons.h3;

    toolbarMedia.querySelector('.post-form__toolbar-media-image').innerHTML = icons.camera;
    toolbarMedia.querySelector('.post-form__toolbar-media-video').innerHTML = icons.play;

    let embedInsertInProgress = false;

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

        if (options && options.initToolbars) {
            editor.on('text-change', function(){
                setTimeout(function(){
                    toggleToolbarMedia(editor, toolbarMedia);
                    toggleToolbar(editor, toolbar);
                }, 0);
            });

            editor.on('selection-change', function(range, oldRange) {
                if (embedInsertInProgress) {
                    if (range) {
                        const [line] = editor.getLine(range.index);
                        if ( !(line instanceof ParagraphEmbedBlot) ) {
                            editor.setSelection(oldRange.index, 0);
                        }
                    } else {
                        editor.setSelection(oldRange.index, 0);
                        editor.focus();
                    }
                }
                toggleToolbarMedia(editor, toolbarMedia);
                toggleToolbar(editor, toolbar);
            });
        }

        return editor;
    };

    function toggleToolbarMedia(editor, tb) {
        try {
            const range = editor.getSelection();
            if (range && range.length == 0) {
                const selectionBounds = editor.getBounds(range);
                const line = editor.getLine(range.index);
                if (line[0].domNode.innerText.trim().length === 0) {
                    tb.style.top = selectionBounds.top + 'px';
                    tb.classList.add('visible');
                } else {
                    tb.classList.remove('visible');
                }
            } else {
                tb.classList.remove('visible');
            }
        } catch (err) {
            tb.classList.remove('visible');
        }
    }

    function toggleToolbar(editor, tb) {
        try {
            const range = editor.getSelection();
            if (range) {
                if (range.length == 0) {
                    tb.classList.remove('visible');
                } else {
                    const editorBounds = editor.root.getBoundingClientRect();
                    const selectionBounds = editor.getBounds(range);
                    const toolbarBounds = tb.getBoundingClientRect();
                    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

                    let toolbarLeft = selectionBounds.left;
                    toolbarLeft += ((selectionBounds.right - selectionBounds.left) / 2);
                    toolbarLeft -= (toolbarBounds.width / 2);

                    const leftBorder = editorBounds.left + toolbarLeft;
                    const rightBorder = editorBounds.left + toolbarLeft + toolbarBounds.width;

                    if (leftBorder <= 0) {
                        toolbarLeft = 10 - editorBounds.left;
                    } else if (rightBorder >= windowWidth) {
                        toolbarLeft -= rightBorder - windowWidth + 10;
                    }

                    let toolbarTop = selectionBounds.top - toolbarBounds.height - 6;

                    tb.style.top = toolbarTop + 'px';
                    tb.style.left = toolbarLeft + 'px';
                    tb.classList.add('visible');
                }
            } else {
                tb.classList.remove('visible');
            }
        } catch (err) {
            tb.classList.remove('visible');
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
        scrollingContainer: document.documentElement,
        initToolbars: true,
        modules: {
            toolbar: { 
                container: toolbar 
            },
            keyboard: {
                bindings: {
                    enter: {
                        key: Keyboard.keys.ENTER,
                        handler: function(range, context) {
                            if (embedInsertInProgress) {
                                const link = context.prefix.trim() + context.suffix.trim();
                                if (link.length > 0) 
                                {
                                    const leftBorder = range.index - context.offset;
                                    const rmLength = context.prefix.length + context.suffix.length + 1;
                                    embedInsertInProgress = false;

                                    if (urlValidator.isWebUri(link)) {
                                        this.quill.updateContents(new Delta().retain(leftBorder).delete(rmLength));
                                        this.quill.insertEmbed(leftBorder, 'custom_video', {src: link}, Quill.sources.USER);
                                        this.quill.setSelection(leftBorder + 1, 0);
                                        this.quill.focus();
                                    } else {
                                        this.quill.insertText(leftBorder, context.prefix + context.suffix);
                                    }
                                }

                                return false;
                            }
                            return true;
                        }
                    },
                    space: {
                        key: Keyboard.keys.SPACE,
                        handler: function() {
                            return embedInsertInProgress ? false : true;
                        }
                    },
                    escape: {
                        key: Keyboard.keys.ESCAPE,
                        handler: function(range, context) {
                            if (embedInsertInProgress) {
                                const leftBorder = range.index - context.offset;
                                const rmLength = context.prefix.length + context.suffix.length + 1;
                                this.quill.updateContents(new Delta().retain(leftBorder).delete(rmLength));
                                this.quill.insertText(leftBorder, context.prefix + context.suffix);
                                embedInsertInProgress = false;
                            }
                            return true;
                        }
                    },
                    backspace: {
                        key: Keyboard.keys.BACKSPACE,
                        handler: function(range, context) {
                            if(embedInsertInProgress && context.offset === 0) {
                                if (context.empty) {
                                    this.quill.updateContents(new Delta().retain(range.index).delete(1));
                                    this.quill.insertText(range.index, '\n');
                                    embedInsertInProgress = false;
                                } else {
                                    return false;
                                }
                            }
                            return true;
                        }
                    },
                    delete: {
                        key: Keyboard.keys.DELETE,
                        handler: function(range, context) {
                            if (embedInsertInProgress) {
                                if (context.empty) {
                                    embedInsertInProgress = false;
                                } else if (context.suffix.length == 0) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                }
            }
        }
    }, autosaveStoryKey);

    storyField.appendChild(toolbarMedia);
    storyField.appendChild(toolbar);

    toolbarMediaImageBtn.addEventListener('click', function(event){
        event.preventDefault();
        fileInput.click();
    });

    toolbarMediaEmbedBtn.addEventListener('click', function(event){
        event.preventDefault();
        if (!embedInsertInProgress) {
            const range = storyEditor.getSelection(true);
            storyEditor.insertEmbed(range.index, 'paragraph_embed', {caption: 'Paste your link here and press enter'}, Quill.sources.USER);
            embedInsertInProgress = true;
        }
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
                        const width = response.data.width;
                        const height = response.data.height;
                        const caption = '';
                        const range = storyEditor.getSelection(true);
                        storyEditor.insertEmbed(range.index, 'custom_image', {src, width, height, caption}, Quill.sources.USER);
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