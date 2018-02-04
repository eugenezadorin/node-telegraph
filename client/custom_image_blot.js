import Quill from 'quill';
import oneLineTrim from 'common-tags/lib/oneLineTrim';

let BlockEmbed = Quill.import('blots/block/embed');

class CustomImageBlot extends BlockEmbed
{
    static create(value) {
        let wrapper = super.create();
    
        wrapper.className = 'post-form__picture';
        wrapper.contentEditable = false;

        wrapper.innerHTML = oneLineTrim`
            <img src="${value.src}" width="${value.width}" height="${value.height}" alt="" itemprop="image">
            <figcaption class="post-form__caption">
                <textarea placeholder="Optional caption" rows="1"></textarea>
            </figcaption>
        `;

        function autosize(obj) {
            obj.style.height = 'auto';
            obj.style.height = (2 + obj.scrollHeight) + 'px';
        }

        let textarea = wrapper.querySelector('textarea');
        let image = wrapper.querySelector('img');

        textarea.value = value.caption;
        textarea.addEventListener('input', () => autosize(textarea));
        image.addEventListener('load', () => autosize(textarea));

        return wrapper;
    }

    static value(node) {
        var img = node.querySelector('img');
        var textarea = node.querySelector('textarea');

        return {
            src: img.getAttribute('src'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            caption: textarea.value
        };
    }
}

CustomImageBlot.blotName = 'custom_image';
CustomImageBlot.tagName = 'figure';

export default CustomImageBlot;