const express = require("express");
const router = express.Router();

const {
  createPost,
  latestPosts,
  trendingPosts,
  searchPosts,
  latestPostsCount,
  searchPostsCount,
  likePost,
  isLikedByUser,
  uploadPostImage,
  getTags,
  addComment,
  getPostComments,
  getRelies,
  notifications,
  getNotificationCount,
  deletePost,
  deleteComment,
} = require("../Controllers/Post");
const { auth } = require("../middlewares/auth");
const { uploadFile } = require("../utils/imageUploader");
const { getAllTags } = require("../Controllers/Tags");

router.post("/create-post", auth, createPost);
router.post("/like-post", auth, likePost);
router.get("/isliked-by-user", auth, isLikedByUser);
router.get("/latest-posts", latestPosts);
router.get("/trending-posts", trendingPosts);
router.get("/tags", getAllTags);
router.post("/comment", auth, addComment);
router.get("/search-posts", auth, searchPosts);
router.get("/delete-post", auth, deletePost);
router.get("/delete-comment", auth, deleteComment);
router.get("/latest-posts-count", latestPostsCount);
router.get("/get-post-comments", auth, getPostComments);
router.get("/get-notifications", auth, notifications);
router.get("/get-notifications-count", auth, getNotificationCount);
router.get("/get-replies", auth, getRelies);
router.get("/search-posts-count", searchPostsCount);
router.post(
  "/upload-post-image",
  auth,
  uploadFile.single("image"),
  uploadPostImage
);

module.exports = router;
