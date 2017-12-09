module.exports = {
    isEditorEmpty: function(editor) {
        return editor.getText().trim().length === 0;
    },

    getInlineText: function(editor) {
        var text = editor.getText().trim().split('\n').join(' ');
        return this.stripSpaces(text);
    },

    stripSpaces: function(text) {
        text = text.split(' ').reduce(function(acc, value){
            value = value.trim();
            if (value.length && value.length > 0) {
                acc.push(value);
            }
            return acc;
        }, []);
        return text.join(' ');
    }
};
