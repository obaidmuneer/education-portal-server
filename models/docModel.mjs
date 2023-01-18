import { Schema, model } from 'mongoose'

const docSchema = new Schema({
    text: { type: String },
    classId: { type: String, required: true },
    contentType: { type: Object, required: true },
    file: { type: Object },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, defaul: Date.now }
})
export default model('doc', docSchema)

