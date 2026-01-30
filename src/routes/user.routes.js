import { Router } from "express";
import { loginUser, registerUser, logoutUser, reGenerateAccessToken, updateUserCoverImage, updateUserAvatar, changeCurrentPassword, getCurrentUser, updateAccountBodyDetails, getChannelDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();
// auth routes
router.route("/register").post(upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]), registerUser);// checked
router.route("/login").post(loginUser);// checked

//logout
router.route("/logout").post(verifyJWT, logoutUser);// checked

// all other routes
router.route("/regenerate-token").post(reGenerateAccessToken); //checked
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/get-current-user").post(verifyJWT, getCurrentUser);
router.route("/update-profile").post(verifyJWT, updateAccountBodyDetails);
router.route("/update-avatar").post(verifyJWT, updateUserAvatar);
router.route("/update-cover-image").post(verifyJWT, updateUserCoverImage);
router.route("/get-channel-details").post(verifyJWT, getChannelDetails);

export default router;