const Controller = require('egg').Controller;

class CategoryController extends Controller {
  async index() {
    const { ctx } = this;
    const categories = await ctx.model.Category.findAll({
      include: [{
        model: ctx.model.Course,
        as: 'courses',
        through: { attributes: [] },
      }],
    });
    ctx.body = categories;
  }
}

module.exports = CategoryController;
