const mongoose = require("mongoose");

let profile_imgs_name_list = [
  "Garfield",
  "Tinkerbell",
  "Annie",
  "Loki",
  "Cleo",
  "Angel",
  "Bob",
  "Mia",
  "Coco",
  "Gracie",
  "Bear",
  "Bella",
  "Abby",
  "Harley",
  "Cali",
  "Leo",
  "Luna",
  "Jack",
  "Felix",
  "Kiki",
];
let profile_imgs_collections_list = [
  "notionists-neutral",
  "adventurer-neutral",
  "fun-emoji",
];

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      lowercase: true,
      required: true,
      minlength: [3, "fullname must be 3 letters long"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    contactNumber: {
      type: Number,
      default:null
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      minlength: [3, "Username must be 3 letters long"],
      unique: true,
    },
    currentPosition: {
      company: {
        type: String,
        default: null
      },
      position: {
        type: String,
        default: null
      },
    },
    experiences: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "experiences",
      default: [],
    },
    skills: {
      type: [String],
      required: true,
      default: [],
    },
    bio: {
      type: String,
      maxlength: [200, "Bio should not be more than 200"],
      default: "",
    },
    image: {
      type: String,
      default: () => {
        return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[
          Math.floor(Math.random() * profile_imgs_collections_list.length)
        ]
          }/svg?seed=${profile_imgs_name_list[
          Math.floor(Math.random() * profile_imgs_name_list.length)
          ]
          }`;
      },
    },
    banner: {
      type: String,
      default:"https://e1.pxfuel.com/desktop-wallpaper/981/878/desktop-wallpaper-flex-banner-backgrounds-design-banner-backgrounds.jpg"
    },
    active: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    gender: {
      type: String,
    },
    role: {
      type: String,
      enum: ["adimn", "user", "instructor"],
      default: "user",
    },
    social_links: {
      youtube: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
      linkedIn: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    account_Info: {
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalReads: {
        type: Number,
        default: 0,
      },
    },
    address: {
      streetAddress: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
      zipCode: {
        type: Number,
        default: null,
      },
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },
    posts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "posts",
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "joinedAt",
    },
  }
);

module.exports = mongoose.model("users", userSchema);
