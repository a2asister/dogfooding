const Controller = require("egg").Controller;

class CourseController extends Controller {
  async list() {
    const { ctx } = this;
    const { category } = ctx.query;

    let where = {};

    let courses;
    if (category) {
      const Category = ctx.model.Category;
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) {
        courses = await cat.getCourses({
          include: [
            {
              model: ctx.model.Category,
              as: "categories",
              through: { attributes: [] },
            },
          ],
        });
      } else {
        courses = [];
      }
    } else {
      courses = await ctx.model.Course.findAll({
        include: [
          {
            model: ctx.model.Category,
            as: "categories",
            through: { attributes: [] },
          },
        ],
      });
    }

    ctx.body = {
      code: 0,
      data: courses.map((course) => ({
        id: course.id,
        title: course.title,
        cover: course.cover,
        description: course.description,
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
        categories: course.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })),
      })),
    };
  }

  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;

    const course = await ctx.model.Course.findByPk(id, {
      include: [
        {
          model: ctx.model.Category,
          as: "categories",
          through: { attributes: [] },
        },
      ],
    });

    if (!course) {
      ctx.status = 404;
      ctx.body = { code: 1, message: "Course not found" };
      return;
    }

    ctx.body = {
      code: 0,
      data: {
        id: course.id,
        title: course.title,
        cover: course.cover,
        description: course.description,
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
        categories: course.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })),
      },
    };
  }
}

module.exports = CourseController;
