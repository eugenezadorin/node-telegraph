module.exports = {
    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    randString: function(len, alphabet) {
        len = parseInt(len);
        len = (len < 0) ? 0 : len;

        alphabet = (alphabet && alphabet.length && alphabet.length > 0) ? alphabet : '0123456789abcdef';

        const alphabetLen = alphabet.length;
        var result = '';

        for (var i = 0; i < len; i++) {
            result += alphabet[ this.rand(0, alphabetLen) ];
        }

        return result;
    }
};
