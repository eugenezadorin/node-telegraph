const Quill = require('quill');

function extend(target, base) {
    for (var prop in base) {
        target[prop] = base[prop];
    }
}

var BlockEmbed = Quill.import('blots/block/embed');
function CustomImageBlot() {
    Object.getPrototypeOf(BlockEmbed).apply(this, arguments);
}
CustomImageBlot.prototype = Object.create(BlockEmbed && BlockEmbed.prototype);
CustomImageBlot.prototype.constructor = CustomImageBlot;
extend(CustomImageBlot, BlockEmbed);

CustomImageBlot.create = function(value) {
    var wrapper = document.createElement('FIGURE');
    wrapper.className = 'post-form__picture';
    wrapper.contentEditable = false;

    var image = document.createElement('IMG');
    image.setAttribute('alt', '');
    image.setAttribute('src', value.src);
    image.setAttribute('itemprop', 'image');

    var caption = document.createElement('FIGCAPTION');
    caption.className = 'post-form__caption';

    var textarea = document.createElement('TEXTAREA');
    textarea.setAttribute('placeholder', 'Optional caption');
    textarea.setAttribute('rows', '1');
    textarea.value = value.caption;

    var autosize = function(obj) {
        obj.style.height = 'auto';
        obj.style.height = (2 + obj.scrollHeight) + 'px';
    };

    textarea.oninput = function() { 
        autosize(this); 
    };
    textarea.onload = function() {
        autosize(this);
    };

    caption.appendChild(textarea);

    wrapper.appendChild(image);
    wrapper.appendChild(caption);

    return wrapper;
};

CustomImageBlot.value = function(node) {
    var img = node.querySelector('img');
    var textarea = node.querySelector('textarea');

    return {
        src: img.getAttribute('src'),
        caption: textarea.value
    };
};

CustomImageBlot.blotName = 'custom_image';
CustomImageBlot.tagName = 'DIV';

module.exports = CustomImageBlot;