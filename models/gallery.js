const mongoose = require('mongoose');
 
const imageSchema = new mongoose.Schema({
    url:String,
    img:
    {
        data: Buffer,
        contentType: String
    }
}); 
module.exports = new mongoose.model('Gallery', imageSchema);