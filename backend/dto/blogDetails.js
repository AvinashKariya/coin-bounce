class BlogDetailsDTO {
  constructor(blog) {
    this._id = blog._id;
    this.title = blog.title;
    this.content = blog.content;
    this.photoPath = blog.photoPath;
    this.authorId = blog.author._id;
    this.authorName = blog.author.name;
    this.authorEmail = blog.author.email;
    this.authorUsername = blog.author.username;
  }
}
module.exports = BlogDetailsDTO;
