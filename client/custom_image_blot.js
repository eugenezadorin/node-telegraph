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
    var wrapper = document.createElement('DIV');
    wrapper.className = 'post-form__picture';

    var image = document.createElement('IMG');
    image.setAttribute('alt', value.alt);
    image.setAttribute('src', value.src);

    var caption = document.createElement('DIV');
    caption.className = 'post-form__caption';
    caption.textContent = 'Optional caption';

    wrapper.appendChild(image);
    wrapper.appendChild(caption);

    return wrapper;
};

CustomImageBlot.value = function(node) {
    var img = node.querySelector('img');

    return {
        alt: img.getAttribute('alt'),
        src: img.getAttribute('src')
    };
};

CustomImageBlot.blotName = 'custom_image';
CustomImageBlot.tagName = 'DIV';

module.exports = CustomImageBlot;