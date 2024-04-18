const { nanoid } = require("nanoid");
const Post = require("../Models/Post");
const User = require("../Models/User");
const Friend = require("../Models/FriendRequest");
const { uploadImage } = require("../utils/imageUploader");

exports.getUserProfile = async (req, res) => {
  try {
    let { username } = req.body;
    const user = await User.findOne({ username: username })
      .select("-password -posts -updatedAt -googleAuth")
      .limit(maxLimit)
      .exec();

    return res.status(200).json({
      success: true,
      data: user,
      message: `User Fetched Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User Fetching Failed`,
    });
  }
};

exports.getCurrentUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    console.log(id);
    const user = await User.findById(id);
    user.password = null;
    return res.status(200).json({
      success: true,
      data: user,
      message: `User Fetched Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User Fetching Failed`,
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    let { username, bio, social_links } = req.body;
    let bioLimit = 200;

    if (username.length < 3) {
      return res
        .status(403)
        .json({ error: "Username should be at least 3 letters long" });
    }
    if (bio.length > bioLimit) {
      return res.status(403).json({
        error: `Bio should not be more than ${bioLimit} letters long`,
      });
    }
    let socialLinksArray = Object.keys(social_links);
    try {
      for (let i = 0; i < socialLinksArray.length; i++) {
        if (social_links[socialLinksArray[i]]) {
          let hostname = new URL(social_links[socialLinksArray[i]]).hostname;
          if (
            !hostname.includes(`${socialLinksArray[i]}.com`) &&
            socialLinksArray[i] !== "wesite"
          ) {
            return res.status(403).json({
              error: `${socialLinksArray[i]} list is invalid. Provide Correct Link.`,
            });
          }
        }
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error with social links you provided." });
    }

    let UpdatedObj = {
      username,
      bio,
      social_links,
    };
    const user = await User.findOneAndUpdate({ _id: req.user.id }, UpdatedObj, {
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: user,
      message: `User Profile Updated Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User Profile Updation Failed`,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    let { query, skip, limit } = req.query;
    const { id } = req.user;
    const fliteredUsers = await User.find({ username: new RegExp(query, "i") , _id: { $ne: id }})
      .select("username image fullName email currentPosition -_id").skip(skip || 0)
      .limit(limit || 10)
      .exec();

    return res.status(200).json({
      success: true,
      data: fliteredUsers,
      message: `Searched User Fetched Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Searching Failed`,
    });
  }
};


exports.updateBanner = async (req, res) => {
  try {
    const image = req.file;
    let { id } = req.user;
    console.log(image);

    if (image) {
      uploadImage(image.buffer).then(async (result) => {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { banner: result.Location },
          {
            new: true,
          }
        );
        if (updatedUser) {
          return res.status(200).json({
            success: true,
            imageUrl: result.Location,
            message: `Banner Updated Successfully.`,
          });
        } else {
          return res.status(403).json({
            success: false,
            message: `User not found.`,
          });
        }
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
      message: `Banner Uptation Failed`,
    });
  }
};


exports.updateUserLogo = async (req, res) => {
  try {
    const image = req.file;
    let { id } = req.user;
    console.log(image);

    if (image) {
      uploadImage(image.buffer).then(async (result) => {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { image: result.Location },
          {
            new: true,
          }
        );
        if (updatedUser) {
          return res.status(200).json({
            success: true,
            imageUrl: result.Location,
            message: `User Image Updated Successfully.`,
          });
        } else {
          return res.status(403).json({
            success: false,
            message: `User not found.`,
          });
        }
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
      message: `User Image Uptation Failed`,
    });
  }
};

exports.getUsersList = async (req, res) => {
  try {
    let { id } = req.user;
    let maxLimit = 5;
    const allUsers = await User.find({ _id: { $ne: id }})
      .select("username image fullName email currentPosition _id")
      .limit(maxLimit)
      .exec();

    return res.status(200).json({
      success: true,
      data: allUsers,
      message: `Users Fetched Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Users Fetching Failed`,
    });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    let { id } = req.user;
    let { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const docA = await Friend.findOneAndUpdate(
      { requester: id, recipient: userId },
      { $set: { status: 1 } },
      { upsert: true, new: true }
    )
    const docB = await Friend.findOneAndUpdate(
      { recipient: id, requester: userId },
      { $set: { status: 2 } },
      { upsert: true, new: true }
    )
    const updateUserA = await User.findOneAndUpdate(
      { _id: id },
      { $push: { friends: docA._id } }
    )
    const updateUserB = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { friends: docB._id } }
    )

    if (!updateUserA || !updateUserB) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: "User not found."
      })
    }
    else {
      res.status(200).json({
        success: true,
        data: removed,
        message: "Friend request sent."
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Friend request not sent.`,
    });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    let { id } = req.user;
    let { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    Friend.findOneAndUpdate(
      { requester: id, recipient: userId },
      { $set: { status: 3 } }
    )
    Friend.findOneAndUpdate(
      { recipient: id, requester: userId },
      { $set: { status: 3 } }
    )

    res.status(200).json({
      success: true,
      data: removed,
      message: "User added to friend list."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User not added to friend list Failed`,
    });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    let { id } = req.user;
    let { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    Friend.findOneAndDelete(
      { requester: id, recipient: userId }
    )
    Friend.findOneAndDelete(
      { recipient: id, requester: userId }
    )

    res.status(200).json({
      success: true,
      data: removed,
      message: "User removed from friend list."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User removed from friend list Failed`,
    });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    let { id } = req.user;
    let { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const docA = await Friend.findOneAndRemove(
      { requester: id, recipient: userId }
    )
    const docB = await Friend.findOneAndRemove(
      { recipient: id, requester: userId }
    )
    const updateUserA = await User.findOneAndUpdate(
      { _id: id },
      { $pull: { friends: docA._id } }
    )
    const updateUserB = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { friends: docB._id } }
    )

    if (!updateUserA || !updateUserB) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: "User not found."
      })
    }
    else {
      res.status(200).json({
        success: true,
        data: removed,
        message: "Friend request rejected."
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Friend request rejection Failed`,
    });
  }
};

exports.getFriends = async (req, res) => {
  try {
    let { id } = req.user;
    let user = await User.aggregate([
      {
        "$lookup": {
          "from": Friend.collection.name,
          "let": { "friends": "$friends" },
          "pipeline": [
            {
              "$match": {
                "recipient": mongoose.Types.ObjectId(id),
                "$expr": { "$in": ["$_id", "$$friends"] }
              }
            },
            { "$project": { "status": 1 } }
          ],
          "as": "friends"
        }
      },
      {
        "$addFields": {
          "friendsStatus": {
            "$ifNull": [{ "$min": "$friends.status" }, 0]
          }
        }
      }
    ])
    res.status(200).json({
      success: true,
      data: user,
      message: "User friend list fetched."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User friend list fetching Failed`,
    });
  }
}