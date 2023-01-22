import multer from 'multer'

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        const uniqeSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqeSuffix + '-' + file.originalname)
    }
})

// const fileFilter = (req, file, cb) => {
//     if (!file.mimetype.match(/pdf|txt$i/)) {
//         cb(new Error('Bad file type', false))
//     }
//     cb(null, true)
// }

const upload = multer({
    storage: storage,
    // limits: { fileSize: 1024 * 1024 * 3 },
    // fileFilter: fileFilter,
})

export default upload
