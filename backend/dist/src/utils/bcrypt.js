"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.encodePassword = void 0;
const bcrypt = require("bcrypt");
function encodePassword(rawPass) {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(rawPass, salt);
}
exports.encodePassword = encodePassword;
function comparePassword(rawPass, hash) {
    return bcrypt.compareSync(rawPass, hash);
}
exports.comparePassword = comparePassword;
//# sourceMappingURL=bcrypt.js.map