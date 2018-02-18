import Quill from 'quill';

const Block = Quill.import('blots/block');

class ParagraphEmbedBlot extends Block
{
    static create(value) {
        const node = super.create();
        node.className = 'post-form__paragraph-embed empty';
        node.dataset.placeholder = value.caption;
        return node;
    }

    static value(node) {
        return {
            caption: node.dataset.placeholder
        };
    }

    update(mutations, context) {
        super.update(mutations, context);
        this.togglePlaceholder();
    }

    deleteAt(index, length) {
        super.deleteAt(index, length);
        this.togglePlaceholder();
    }

    insertAt(index, embed, value) {
        super.insertAt(index, embed, value);
        this.togglePlaceholder();
    }

    togglePlaceholder() {
        try {
            if (this.domNode.textContent.length > 0) {
                this.domNode.classList.remove('empty');
            } else {
                this.domNode.classList.add('empty');
            }
        } catch (err) { /**/ }
    }
}

ParagraphEmbedBlot.blotName = 'paragraph_embed';
ParagraphEmbedBlot.className = 'post-form__paragraph-embed';

export default ParagraphEmbedBlot;