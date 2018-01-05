module.exports = {
    
    /** Maximal length of trimmed and trasliterated title */
    postSlugLen: 100,

    postCodeLen: 8,

    userCookieName: 'user',

    /** Length of unique user id */
    userCookieLen: 128,

    /** User cookie expires in one year */
    userCookieLifetime:  3600 * 24 * 365 * 1000,

    fileMaxSize: 12 * 1024 * 1024,

    /** Maximal count of files in request. No multiple uploads allowed. */
    fileMaxUploads: 1,

    /** Length of random name for saved files */
    fileNameLen: 32,
};
