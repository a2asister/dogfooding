const Controller = require('egg').Controller;

class CourseController extends Controller {
  async index() {
    const { ctx } = this;
    const { categoryId } = ctx.query;
    
    let where = {};
    if (categoryId) {
      const courses = await ctx.model.Course.findAll({
        include: [{
          model: ctx.model.Category,
          as: 'categories',
          where: { id: categoryId },
          through: { attributes: [] },
        }],
      });
      ctx.body = courses;
      return;
    }

    const courses = await ctx.model.Course.findAll({
      include: [{
        model: ctx.model.Category,
        as: 'categories',
        through: { attributes: [] },
      }],
    });
    ctx.body = courses;
  }

  async show() {
    const { ctx } = this;
    const { id } = ctx.params;
    const course = await ctx.model.Course.findByPk(id, {
      include: [{
        model: ctx.model.Category,
        as: 'categories',
        through: { attributes: [] },
      }],
    });
    ctx.body = course;
  }
}

module.exports = CourseController;
