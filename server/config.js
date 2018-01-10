module.exports = {

    appPort: 3000,
    
    /** Maximal length of trimmed and trasliterated title */
    postSlugLen: 100,

    postCodeLen: 8,

    userCookieName: 'user',

    /** Length of unique user id */
    userCookieLen: 128,

    /** User cookie expires in one year */
    userCookieLifetime:  3600 * 24 * 365 * 1000
};
