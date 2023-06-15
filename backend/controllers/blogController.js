const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blog");
const { BACKEND_SERVER_PATH } = require("../config/index");
const BlogDetailsDTO = require("../dto/blogDetails");
const BlogDTO = require("../dto/blog");
const idPattern = /^[0-9a-fA-F]{24}$/;
const blogController = {
  // 1. creating blog and storing into database
  async create(req, res, next) {
    // 1. validate body
    const createSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().regex(idPattern).required(),
      content: Joi.string().required(),
      photo: Joi.string().required(),
    });

    const { error } = createSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, author, content, photo } = req.body;

    // 2. handle photo storage
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );

    const imagePath = `${Date.now()}-${author}.png`;
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }
    // 3. add to db and return response
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        author,
        content,
        photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });
      await newBlog.save();
    } catch (error) {
      return next(error);
    }
    const blogDTO = new BlogDTO(newBlog);
    return res.status(201).json({ blog: blogDTO });
  },

  //2. getting all blogs
  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});

      const blogsDTO = [];

      for (let i = 0; i < blogs.length; i++) {
        const dto = new BlogDTO(blogs[i]);
        blogsDTO.push(dto);
      }
      return res.status(200).json({ blogs: blogsDTO });
    } catch (error) {
      return next(error);
    }
  },

  //3. get single blog base on id
  async getById(req, res, next) {
    const getByIDSchema = Joi.object({
      id: Joi.string().regex(idPattern).required(),
    });

    const { error } = getByIDSchema.validate(req.params);

    if (error) {
      return next(error);
    }

    let blog;
    const { id } = req.params;
    try {
      blog = await Blog.findById({ _id: id }).populate("author");
    } catch (error) {
      return next(error);
    }

    const blogDto = new BlogDetailsDTO(blog);
    res.status(200).json({ blog: blogDto });
  },

  //4. Updating perticular blog
  async update(req, res, next) {
    const updateBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(idPattern).required(),
      blogId: Joi.string().regex(idPattern).required(),
      photo: Joi.string(),
    });

    const { error } = updateBlogSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, content, author, blogId, photo } = req.body;
    let blog;
    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }

    if (photo) {
      let previousPhoto = blog.photoPath;

      previousPhoto = previousPhoto.split("/").at(-1);

      fs.unlinkSync(`storage/${previousPhoto}`);

      const buffer = Buffer.from(
        photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );

      const imagePath = `${Date.now()}-${author}.png`;
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }

      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
        }
      );
    } else {
      await Blog.updateOne({ _id: blogId }, { title, content });
    }

    return res.status(200).json({ message: "updated" });
  },
  // 5. deleting perticular blog
  async delete(req, res, next) {
    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(idPattern).required(),
    });

    const { error } = deleteBlogSchema.validate(req.params);

    const { id } = req.params;

    try {
      await Blog.deleteOne({ _id: id });
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({ message: "deleted" });
  },
};

module.exports = blogController;
