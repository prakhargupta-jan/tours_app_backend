const { Router } = require("express");
const { signup, signin, setRole, protect, forgotPassword, resetPassword } = require("../controllers/authenticationController");

const userRouter = Router();

userRouter.route('/forgot-password').post(forgotPassword);
userRouter.route('/reset-password/:resetToken').patch(resetPassword)
userRouter.route('/signup').post(signup)
userRouter.route('/signup-guide').post(setRole('guide'), signup)
userRouter.route('/login').post(signin)

userRouter.all('*', (req, res) => {
    res.status(500).json( {
        'status' : 'fail',
        'error' : 'This route is still under developement'
    })
})

module.exports = userRouter;