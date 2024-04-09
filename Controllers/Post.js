const { nanoid } = require("nanoid");
const Post = require("../Models/Post");
const User = require("../Models/User");
const Notification = require("../Models/Notification");
const Comment = require("../Models/Comment");
const { uploadImage } = require("../utils/imageUploader");
const { unlink } = require("../Routes/User");
const tags = require("../utils/data");
const mongoose = require("mongoose")

exports.createPost = async (req, res) => {
  try {
    const { des, postImages, topic, draft, id } = req.body;
    if (!des) {
      return res.status(403).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!topic) {
      return res.status(403).json({
        success: false,
        message: "Topic is required",
      });
    }

    function generateRandomWord() {
      let word = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const length = 6;

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        word += characters.charAt(randomIndex);
      }

      return word;
    }
    let postId = id || generateRandomWord() + nanoid();
    console.log("Post Id", postId);

    let formattedTags = tags?.map((tag) => tag.toLowerCase());
    let user = req.user;

    console.log("here User :", user);

    if (id) {
      try {
        let post = await Post.findByIdAndUpdate(
          id,
          {
            des,
            postImages,
            title: topic,
            author: user.id,
            post_Id: postId,
            draft: Boolean(draft),
          },
          { new: true }
        );
        return res.status(200).json({
          success: true,
          data: post,
          message: `Post Updated Successfully`,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: `Post Updation Failed`,
        });
      }
    } else {
      let post = await Post.create({
        des,
        postImages,
        title: topic,
        author: user.id,
        post_Id: postId,
        draft: Boolean(draft),
      });

      let response = await User.findByIdAndUpdate(
        user.id,
        {
          $inc: { "account_Info.totalPosts": draft ? 0 : 1 },
          $push: { posts: post._id },
        },
        {
          new: true, // return updated doc
        }
      )
        .select("post_Id des postImages activity title publishedAt -_id")
        .populate("posts")
        .exec();

      return res.status(200).json({
        success: true,
        post: post,
        message: "Post Created Successfully",
      });
    }
  } catch (error) {
    console.log(error);
    //Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Post Creation Failed Try Again`,
    });
  }
};

exports.trendingPosts = async (req, res) => {
  try {
    const { skip, limit } = req.query;
    let findQuery = { draft: false };
    const trendingposts = await Post.find(findQuery)
      .populate("author", "username currentPosition image fullName _id")
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .skip(skip || 0)
      .select("post_Id des postImages activity comments title publishedAt _id")
      .populate("comments")
      .limit(limit || 10)
      .exec();

    return res.status(200).json({
      success: true,
      data: trendingposts,
      message: `Trending posts Fetched Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Trending posts Fetching Failed`,
    });
  }
};

exports.latestPosts = async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const latestposts = await Post.find({ draft: false })
      .populate("author", "username currentPosition image fullName _id")
      .sort({ publishedAt: -1 })
      .skip(skip || 0)
      .select("post_Id des postImages activity title publishedAt _id")
      .limit(limit || 10)
      .exec();

    return res.status(200).json({
      success: true,
      data: latestposts,
      message: "Latests Posts Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Latests Posts Fetching Failed",
    });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    let { title, skip, author, limit } = req.query;
    let findQuery;
    if (title) {
      findQuery = { title };
    } else if (author) {
      findQuery = { author };
    }
    let maxLimit = limit || 10;

    const fliteredposts = await Post.find(findQuery)
      .populate("author", "username currentPosition image fullName _id")
      .sort({ publishedAt: -1 })
      .select("post_Id des postImages activity title publishedAt _id")
      .skip(skip || 0)
      .limit(maxLimit)
      .exec();

    return res.status(200).json({
      success: true,
      data: fliteredposts,
      message: `${title} posts Fetched Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Posts Fetching Failed`,
    });
  }
};

exports.latestPostsCount = async (req, res) => {
  try {
    let postscount = Post.countDocuments({ draft: false });
    return res.status(200).json({
      success: true,
      count: postscount,
      message: "Posts Count Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Posts count Fetching Failed",
    });
  }
};

exports.searchPostsCount = async (req, res) => {
  try {
    let { topic, query, author } = req.body;
    let findQuery;
    if (topic) {
      findQuery = { topic, draft: false };
    } else if (query) {
      findQuery = { title: new RegExp(query, "i"), draft: false };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    let postscount = Post.countDocuments(findQuery);
    return res.status(200).json({
      success: true,
      count: postscount,
      message: "Posts Count Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Posts count Fetching Failed",
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    let { post_Id } = req.body;

    const post = await Post.findOneAndUpdate(
      { post_Id },
      { $inc: { "activity.total_reads": 1 } }
    )
      .populate("author", "username image fullName -_id")
      .select("post_Id des postImages activity title publishedAt comments -_id")
      .exec();

    if (post) {
      try {
        User.findOneAndUpdate(
          { username: post.author.username },
          { $inc: { "account_info.total_reads": 1 } }
        );
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Failed to update total reads in user data",
        });
      }
    }
    return res.status(200).json({
      success: true,
      count: post,
      message: "Post Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Post Fetching Failed",
    });
  }
};

exports.likePost = async (req, res) => {
  try {
    let { id } = req.user;
    let { post_Id, isLikedByUser } = req.body;
    let incVal = isLikedByUser ? -1 : 1;
    const post = await Post.findByIdAndUpdate(
      post_Id,
      { $inc: { "activity.total_likes": incVal } },
      { new: true }
    );
    console.log(post);
    if (!isLikedByUser) {
      try {
        let like = new Notification({
          type: "like",
          post: post._id,
          notification_for: post.author,
          user: id,
        });
        console.log(like);
        like.save();
        return res.status(200).json({
          success: true,
          message: "liked",
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: false,
        });
      }
    } else {
      try {
        Notification.findOneAndDelete({
          user: id,
          type: "like",
          post: post._id,
        }).then((response) => {
          console.log(response);
          return res.status(200).json({
            success: true,
            message: "Unliked",
          });
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Something Went Wrong.",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong.",
    });
  }
};

exports.deletePost = async (req, res) => {
  let { id } = req.user;
  let { _id } = req.query;

  await Post.findByIdAndDelete(_id)
    .then(async (post) => {
      console.log(post);
      await Notification.deleteMany({ post: post._id }).then((response) =>
        console.log("Notifications Deleted")
      );
      await Comment.deleteMany({ post_Id: post._id }).then((response) =>
        console.log("Comments Deleted")
      );
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { posts: post._id }, $inc: { "account_info.total_posts": -1 } }
      ).then((response) => console.log("Post Deleted"));
    })
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "Post Deleted Successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something Went Wrong while deleting post.",
      });
    });
};

exports.isLikedByUser = async (req, res) => {
  try {
    let { id } = req.user;
    let { _id } = req.query;
    let notification = await Notification.exists({
      user: id,
      type: "like",
      post: _id,
    });
    return res.status(200).json({
      success: true,
      message: notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong.",
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    let { id } = req.user;
    let { _id, comment, replying_to, post_author } = req.body;

    if (!comment.length) {
      return res.status(403).json({
        success: false,
        message: "Write Something to leave a comment.",
      });
    }

    const userComment = new Comment({
      post_Id: _id,
      post_author,
      comment,
      commented_by: id,
    });

    if (replying_to) {
      userComment.parent = replying_to;
      userComment.isReply = true;
    }

    userComment.save().then(async (file) => {
      let { comment, commentedAt, children } = file;
      let postComment = await Post.findByIdAndUpdate(
        _id,
        {
          $push: { comments: file._id },
          $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1,
          },
        },
        { new: true }
      );

      let notification = new Notification({
        type: replying_to ? "reply" : "comment",
        post: _id,
        notification_for: post_author,
        user: id,
        comment: file._id,
      });

      if (replying_to) {
        notification.replied_on_comment = replying_to;

        await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: file._id } }
        ).then((reply) => {
          notification.notification_for = reply.commented_by;
        });
      }

      notification.save().then((noti) => console.log(noti));
      return res.status(200).json({
        success: true,
        message: "User Commented Successfully",
        data: { _id, comment, commentedAt, children },
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong.",
    });
  }
};

exports.getPostComments = async (req, res) => {
  try {
    let { post_Id, skip } = req.query;
    let maxLimit = 5;
    console.log(post_Id);
    let comments = await Comment.find({ post_Id, isReply: false })
      .populate("commented_by", "username fullname currentPosition image")
      .skip(skip || 0)
      .limit(maxLimit)
      .sort({ commentedAt: -1 })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Comments fetched Successfully",
      data: comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in Fetching comments.",
    });
  }
};

exports.getuserWrittenPosts = async (req, res) => {
  let user_id = req.user.id;
  let { page, draft, query, deletedDocCount } = req.body;
  let maxLimit = 5;
  let skipDoc = (page - 1) * maxLimit;
  if (deletedDocCount) skipDoc -= deletedDocCount;
  await Post.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDoc)
    .limit(maxLimit)
    .sort({ createdAt: -1 })
    .select("banner publishedAt post_Id activity des title draft -_id")
    .then((posts) => {
      return res.status(200).json({
        success: true,
        message: "Posts fetched Successfully",
        data: posts,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error in Fetching user posts.",
      });
    })
    .exec();
};

exports.getUserPostsCount = async (req, res) => {
  try {
    let user_id = req.user.id;
    let { draft, query } = req.body;
    let counts = Post.countDocuments({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    });
    return res.status(200).json({
      success: true,
      message: "Posts count fetched Successfully",
      data: counts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in Fetching Posts count.",
    });
  }
};

exports.getRelies = async (req, res) => {
  try {
    let { _id, skip } = req.query;
    let maxLimit = 5;

    console.log(_id);

    let replies = await Comment.findById(_id)
      .populate({
        path: "children",
        options: {
          limit: maxLimit,
          skip: skip || 0,
          sort: { commentedAt: -1 },
        },
        populate: {
          path: "commented_by",
          select: "username fullname currentPosition image",
        },
        select: "-post_Id -updatedAt",
      })
      .select("children")
      .exec();
    console.log(replies);
    return res.status(200).json({
      success: true,
      message: "Replies fetched Successfully",
      data: replies.children,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in Fetching replies.",
    });
  }
};

const deleteCommentHelper = async (_id) => {
  await Comment.findByIdAndDelete(_id).then(async (comment) => {
    if (comment.parent) {
      await Comment.findByIdAndUpdate(
        comment.parent,
        { $pull: { children: _id } }
      )
        .then((data) => console.log("comment Deleted"))
        .catch((err) => console.log(err));
    }
    await Notification.findOneAndDelete({ comment: _id })
      .then((noti) => console.log("Comment Notification Deleted"))
      .catch((err) => console.log("Deletion Failed"));
    await Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } })
      .then((noti) => console.log("Reply Notification Deleted"))
      .catch((err) => console.log("Deletion Failed"));
    console.log(comment);
    await Post.findByIdAndUpdate(
      comment.post_Id,
      {
        $pull: { comments: _id },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.isReply ? 0 : -1,
        },
      }
    )
      .then((post) => {
        console.log(post);
        if (comment.children.length) {
          comment.children.map((replies) => deleteCommentHelper(replies));
        }
      })
      .catch((err) => console.log(err));
  });
};

exports.deleteComment = async (req, res) => {
  try {
    let { id } = req.user;
    let { _id } = req.query;

    let comment = await Comment.findById(_id);
    const objectId = new mongoose.Types.ObjectId(id);
    if (comment.commented_by.toString() === objectId.toString() || objectId.toString() === comment.post_author.toString()) {
      deleteCommentHelper(_id);
      return res.status(200).json({
        success: true,
        message: `${comment.isReply ? "Reply" : "Comment"} Deleted Successfully`,
        type: comment.isReply ? "Reply" : "Comment"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting Comments.",
    });
  }
};

exports.notifications = async (req, res) => {
  try {
    let user_id = req.user.id;
    let { page, filter, deletedDocCount } = req.body;
    let maxLimit = 8;
    let findQuery = { notification_for: user_id, user: { $ne: user_id } };
    let skipDoc = (page - 1) * maxLimit;
    // if (filter !== "all") findQuery.type = filter;
    if (deletedDocCount) skipDoc -= deletedDocCount;

    let notificationData = await Notification.find(findQuery)
      .skip(skipDoc)
      .limit(maxLimit)
      .populate("post", "post_Id")
      .populate("user", "fullname username image")
      .populate("comment", "comment")
      .populate("replied_on_comment", "comment")
      .populate("reply", "comment")
      .sort({ createdAt: -1 })
      .select("createdAt type seen reply")
      .exec();

    if (notificationData) {
      await Notification.updateMany(findQuery, { seen: true })
        .skip(skipDoc)
        .limit(maxLimit)
        .then(() => console.log("Notification Seen"));
    }
    return res.status(200).json({
      success: true,
      message: "Notifications fetched Successfully",
      data: notificationData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in Fetching Notifications.",
    });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    let user_id = req.user.id;
    let { filter } = req.body;
    let findQuery = { notification_for: user_id, user: { $ne: user_id } };
    // if (filter !== "all") findQuery.type = filter;
    let counts = await Notification.countDocuments(findQuery);
    return res.status(200).json({
      success: true,
      message: "Notifications count fetched Successfully",
      data: counts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in Fetching Notifications count.",
    });
  }
};

exports.uploadPostImage = async (req, res) => {
  try {
    const image = req.file;
    console.log(image);
    if (image) {
      uploadImage(image.buffer).then(async (result) => {
        return res.status(200).json({
          success: true,
          imageUrl: result.Location,
          message: `Image Uploaded Successfully.`,
        });
      });
    } else {
      return res.status(403).json({
        success: false,
        message: `File not found.`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Image Not Uploaded.`,
    });
  }
};

exports.getTags = async (req, res) => {
  try {
    let data = tags;
    return res.status(200).json({
      success: true,
      data,
      message: "Tags Feched",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Error While getting tags.`,
    });
  }
};
