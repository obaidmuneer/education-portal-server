import { Schema, model } from 'mongoose'

const portalUsersSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now }
})

export default model('portalUsers', portalUsersSchema)
