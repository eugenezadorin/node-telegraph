import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');

class CustomVideoBlot extends BlockEmbed
{
    static create(value) {
        const wrapper = super.create();    
        wrapper.contentEditable = false;
        wrapper.innerHTML = `<iframe src="${value.src}" frameborder="0" allowfullscreen></iframe>`;
        return wrapper;
    }

    static value(node) {
        const frame = node.querySelector('iframe');

        return {
            src: frame.getAttribute('src'),
        };
    }
}

CustomVideoBlot.blotName = 'custom_video';
CustomVideoBlot.tagName = 'div';
CustomVideoBlot.className = 'post-form__video';

export default CustomVideoBlot;