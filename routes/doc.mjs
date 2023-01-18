import express from "express";
import Joi from 'joi'
import docModel from '../models/docModel.mjs'

const router = express.Router()

router.get('/', async (req, res) => {
    const page = req.query.page || 0
    try {
        const docs = await docModel.find({}, {}, {
            sort: { '_id': -1 },
            limit: 20,
            skip: page
        })
        res.status(200).send({
            messege: 'docs fetched successfully',
            docs
        })
    } catch (err) {
        res.status(500).send({
            messege: 'failed to fetch docs'
        })
    }
})

router.post('/', async (req, res) => {
    const schema = Joi.object({
        text: Joi.string().min(3),
        contentType: Joi.string().required(),
        classId: Joi.string().required(),
    })
    try {
        const { text, contentType, classId } = await schema.validateAsync(req.body);
        const doc = await docModel.create({ text, contentType, classId })
        res.status(200).send({
            messege: 'doc added successfully',
            doc
        })
    }
    catch (err) {
        console.log(err);
        res.status(400).send({
            messege: err.messege
        })
    }

})

router.put('/:id', async (req, res) => {
    const schema = Joi.object({
        text: Joi.string().min(3).required(),
        id: Joi.string().required()
    })
    try {
        const { text, id } = await schema.validateAsync({ text: req.body.text, id: req.params.id });
        const doc = await docModel.findByIdAndUpdate(id, { text }, { new: true })
        // The default is to return the original, unaltered document. 
        //If you want the new, updated document to be returned you have to pass an additional argument: 
        //an object with the new property set to true.
        res.status(200).send({
            messege: 'doc updated successfully',
            doc
        })
    }
    catch (err) {
        res.status(400).send({
            messege: err.messege
        })
    }
})

router.delete('/:id', async (req, res) => {
    const schema = Joi.object({
        id: Joi.string().required()
    })
    try {
        const { text, id } = await schema.validateAsync({ id: req.params.id });
        const doc = await docModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
        res.status(200).send({
            messege: 'doc deleted successfully',
            doc
        })
    }
    catch (err) {
        res.status(400).send({
            messege: err.messege
        })
    }
})

router.delete('/', async (req, res) => {
    const schema = Joi.object({
        classId: Joi.string().required(),
        contentType: Joi.string().required(),
    })
    try {
        const { classId, contentType } = await schema.validateAsync({
            classId: req.body.classId,
            contentTypes: req.body.contentType
        });
        const docs = await docModel.updateMany({ classId, contentType }, { isDeleted: true }, { new: true })
        // sysborgModel.deleteMany()
        res.status(200).send({
            messege: 'doc deleted successfully',
            docs
        })
    }
    catch (err) {
        res.status(400).send({
            messege: err.messege
        })
    }
})

export default router