const Controller = require("egg").Controller;

class CategoryController extends Controller {
  async list() {
    const { ctx } = this;

    const categories = await ctx.model.Category.findAll({
      include: [
        {
          model: ctx.model.Course,
          as: "courses",
          through: { attributes: [] },
          attributes: ["id"],
        },
      ],
    });

    ctx.body = {
      code: 0,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        courseCount: cat.courses ? cat.courses.length : 0,
      })),
    };
  }
}

module.exports = CategoryController;
