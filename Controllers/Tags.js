const Tag = require("../Models/Tag");

exports.getAllTags = async (req, res) => {
    const { skip, limit } = req.query;
    try {
        const allTags = await Tag.find()
            .skip(skip || 0)
            .limit(limit || 10)
            .exec();

        return res.status(200).json({
            success: true,
            data: allTags,
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
