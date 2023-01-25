import express from "express";
import Joi from 'joi'
import bucket from "../firebase/index.mjs";
import upload from "../middlewares/multerConfig.mjs";
import docModel from '../models/docModel.mjs'
import fs from 'fs'
import auth from "../middlewares/auth.mjs";

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
        text: Joi.string().min(3).required(),
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

router.post('/code', async (req, res) => {
    const schema = Joi.object({
        codeTitle: Joi.string().min(3).required(),
        codeBlock: Joi.string().min(3).required(),
        codeLang: Joi.string().required(),
        contentType: Joi.string().required(),
        classId: Joi.string().required(),
    })
    try {
        const { codeTitle, codeBlock, codeLang, contentType, classId } = await schema.validateAsync(req.body);
        const doc = await docModel.create({ codeTitle, codeBlock, codeLang, contentType, classId })
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

router.post('/file', upload.any(), async (req, res) => {
    const schema = Joi.object({
        // file: Joi.binary().required(),
        title: Joi.string().required(),
        contentType: Joi.string().required(),
        classId: Joi.string().required(),
    })
    // console.log(req.body, req.files[0]);
    try {
        const { title, contentType, classId } = await schema.validateAsync(req.body);
        bucket.upload(
            req.files[0].path,
            {
                destination: `sysborgClone/${req.files[0].filename}`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
            },
            function (err, file, apiResponse) {
                if (!err) {
                    file.getSignedUrl({
                        action: 'read',
                        expires: '03-09-2999'
                    }).then(async (urlData, err) => {
                        if (!err) {
                            // console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 
                            try {
                                fs.unlinkSync(req.files[0].path)
                                //file removed
                            } catch (err) {
                                console.error(err)
                            }
                            const doc = await docModel.create({ file: urlData[0], title, contentType, classId })
                            res.status(200).send({
                                messege: 'doc added successfully',
                                doc
                            })
                        }
                    })
                } else {
                    console.log("err: ", err)
                    res.status(500).send();
                }
            });
    }
    catch (err) {
        console.log(err);
        res.status(400).send({
            messege: err.messege
        })
    }

})

router.get('/:classId', async (req, res) => {
    const page = req.query.page || 0
    try {
        const docs = await docModel.find({ classId: req.params.classId, isDeleted: false }, {}, {
            sort: { '_id': -1 },
            limit: 40,
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

router.put('/add-bookmark', auth, async (req, res) => {
    // console.log(req.body);
    const schema = Joi.object({
        id: Joi.string().required(),
    })
    try {
        const { id } = await schema.validateAsync(req.body);
        const docs = await docModel.findOne({ _id: id, isDeleted: false })
        const index = await req.user.bookmark.indexOf(docs._id)
        if (index === -1) {
            req.user.bookmark.push(docs._id.toString())
            await req.user.save()
        }
        // console.log(req.user);
        res.status(200).send({
            messege: 'Bookmarked Successfully',
            bookmark: req.user.bookmark
        })

    }
    catch (err) {
        console.log(err);
        res.status(400).send({
            messege: err.messege
        })
    }
})

router.delete('/remove-bookmark/:id', auth, async (req, res) => {
    // console.log(req.body);
    const schema = Joi.object({
        id: Joi.string().required(),
    })
    try {
        const { id } = await schema.validateAsync(req.params);
        // console.log(req.user.bookmark.indexOf(id))
        // const index = req.user.bookmark.indexOf(id)
        // if (index > -1) {
        //     req.user.bookmark.splice(index, 1)
        //     await req.user.save()
        // }
        req.user.bookmark = req.user.bookmark.filter(eachBookmark => eachBookmark.toString() !== id)
        await req.user.save()
        res.status(200).send({
            messege: 'Bookmarked Removed Successfully',
            bookmark: req.user.bookmark
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
        const { id } = await schema.validateAsync({ id: req.params.id });
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