const bcrypt = require("bcrypt");

module.exports = {
    async compare(raw, hashed) {
        return await bcrypt.compare(raw, hashed);
    }
}