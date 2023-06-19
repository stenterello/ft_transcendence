import * as bcrypt from 'bcrypt';


export function encodePassword(rawPass: string) {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(rawPass, salt);
}

export function comparePassword(rawPass: string, hash: string) {
    return bcrypt.compareSync(rawPass, hash);
}
