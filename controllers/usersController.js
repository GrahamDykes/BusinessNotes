const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})



// @desc Create new user
// @route POST /users
// @access Private

const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body
    // Confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: "All fields are required" })
    }
    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate Username' })
    }

    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10) //salt rounds

    const userObject = { username, 'password': hashedPwd, roles }

    //Create and store new user
    const user = await User.create(userObject)
    if (user) {   //created
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data recieved' })
    }
})




// @desc Update user
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    //confirm data
// if(!id){
//     return res.json({message:"id"})
// }
// if(!user){
//     return res.json({message:"user"})
// }
// if(!Array.isArray(roles) ){
//     return res.json({message:"is array"})
// }
// if(!roles.length){
//     return res.json({message:"roles length"})
// }
// if( typeof active !== 'boolean'){
//     return res.json({message:"typeof"})
// }

    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }           








    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    //Check fir duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    //Allow updates to original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate Username' })
    }

    user.uername = username
    user.roles = roles.Array
    user.active = active

    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10) //salt rounds
    }

    const updatedUser = await user.save()
    res.json({ message: `${updatedUser.username} updated` })
})





// @desc Delete user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }
                    
    const notes = await Note.findOne({ user: id }).lean().exec()
    if (notes?.length) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User Not Found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} has been deleted`

    res.json(reply)
})



module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}