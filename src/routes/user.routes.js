import { Router } from "express";
import { loginUser, registerUser, logoutUser, reGenerateAccessToken, updateUserCoverImage, updateUserAvatar, changeCurrentPassword, getCurrentUser, updateAccountBodyDetails, getChannelDetails, getWatchHistory } from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJWT, changeCurrentPassword); //checked
router.route("/get-current-user").get(verifyJWT, getCurrentUser); //checked
router.route("/update-profile").patch(verifyJWT, updateAccountBodyDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/get-channel-details/:userName").get(verifyJWT, getChannelDetails);
router.route("/get-watch-history").get(verifyJWT, getWatchHistory)

export default router;