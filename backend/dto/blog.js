class BlogDTO {
  constructor(blog) {
    this._id = blog._id;
    this.title = blog.title;
    this.author = blog.author;
    this.content = blog.content;
    this.photoPath = blog.photoPath;
  }
}

module.exports = BlogDTO;
