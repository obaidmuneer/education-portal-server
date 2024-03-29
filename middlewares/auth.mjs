import jwt from "jsonwebtoken"
import portalUsersModel from "../models/portalUsersModel.mjs"

const auth = async (req, res, next) => {
    if (!req?.cookies?.token) {
        res.status(401).send({
            message: 'include http-only credentials with every request'
        })
        return
    }
    try {
        const token = req.cookies.token
        // console.log(token);
        const verifiedToken = jwt.verify(token, process.env.SECRET_KEY)
        // console.log(verifiedToken);
        const nowDate = new Date().getTime() / 1000;
        if (verifiedToken.exp < nowDate) {
            res.status(401).send({
                message: 'token expired'
            })
            return
        }
        const user = await portalUsersModel.findOne({ _id: verifiedToken.id }, {}, {
            select: 'firstName lastName email bookmark'
        })
        // console.log(user);
        req.token = token
        req.user = user
        next()

    } catch (error) {
        // console.log(error)
        res.status(500).send({ message: 'Something went wrong' })
    }
}

export default auth