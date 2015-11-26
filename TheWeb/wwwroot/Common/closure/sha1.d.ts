declare module crypt {

    /**
     * SHA-1 cryptographic hash constructor.
     *
     * The properties declared here are discussed in the above algorithm document.
     * @constructor
     * @extends {goog.crypt.Hash}
     * @final
     * @struct
     */
    class Sha1 extends crypt.Hash {
        constructor();
    }
}
