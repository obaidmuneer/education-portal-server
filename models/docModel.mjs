import { Schema, model } from 'mongoose'

const docSchema = new Schema({
    text: { type: String },
    classId: { type: String, required: true },
    contentType: { type: Object, required: true },
    file: { type: Object },
    fileName: { type: String },
    title: { type: String },
    codeBlock: { type: String },
    codeTitle: { type: String },
    codeLang: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})
export default model('doc', docSchema)

