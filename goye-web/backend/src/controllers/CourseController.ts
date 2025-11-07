import {
  Route,
  Controller,
  Tags,
  Get,
  Post,
  Path,
  Body,
  Put,
  Security,
  Request,
  Delete,
} from "tsoa";
import prisma from "../db.js";
import { Course, CourseResponse, Module } from "../interface/interfaces.js";
import { UpdateCourseWithRelationsDTO } from "../dto/course.dto.js";
@Route("course")
@Tags("Course Control APIs")
export class CourseController extends Controller {
  //create Course
  @Security("bearerAuth")
  @Post("/create-course")
  public async CreateCourse(
    @Body() body: Omit<Course, "id">
  ): Promise<CourseResponse> {
    const course = await prisma.course.create({ data: { ...(body as any) } });
    this.setStatus(201);
    return {
      message: "Course created successfully",
      data: course,
    };
  }

  @Get("/get-courses")
  public async GetCourse(@Request() req: any): Promise<any> {
    const course = await prisma.course.findMany();
    this.setStatus(200);
    return {
      message: "Course Fetched Successfully",
      course,
    };
  }

  @Get("/get-courses/{id}")
  public async GetCourseById(@Path() id: string) {
    const getCourseById = await prisma.course.findUnique({
      where: { id: id },
    });

    this.setStatus(200);
    return {
      message: "Course fetched succfully",
      data: getCourseById?.course_title,
    };
  }

  @Security("bearerAuth")
  @Put("update-course/{id}")
  public async UpdateCourse(
    @Path() id: string,
    @Body() data: UpdateCourseWithRelationsDTO
  ): Promise<any> {
    const updateCourse = await prisma.course.update({
      where: { id },
      data: {
        // Simple course fields
        course_title: data.course_title,
        course_short_description: data.course_short_description,
        course_description: data.course_description,
        course_level: data.course_level,
        course_image: data.course_image,

        // ✅ UPDATE MODULES
        module: {
          upsert:
            data.modules?.map((m) => ({
              where: { id: m.id || "" },
              update: {
                module_title: m.module_title,
                module_description: m.module_description,
                module_duration: m.module_duration,

                // ✅ UPDATE LESSONS inside MODULE
                lesson: {
                  upsert:
                    m.lessons?.map((l) => ({
                      where: { id: l.id || "" },
                      update: {
                        lesson_title: l.lesson_title,
                        lesson_video: l.lesson_video,
                      },
                      create: {
                        lesson_title: l.lesson_title!,
                        lesson_video: l.lesson_video!,
                      },
                    })) || [],
                },
              },
              create: {
                module_title: m.module_title!,
                module_description: m.module_description!,
                module_duration: m.module_duration!,
              },
            })) || [],
        },

        // ✅ UPDATE MATERIALS
        material: {
          upsert:
            data.materials?.map((mat) => ({
              where: { id: mat.id || "" },
              update: { ...mat },
              create: { ...mat },
            })) || ([] as any),
        },

        // ✅ UPDATE OBJECTIVES
        objectives: {
          upsert:
            data.objectives?.map((obj) => ({
              where: { id: obj.id || "" },
              update: {
                ...obj,
              },
              create: { ...obj },
            })) || ([] as any),
        },

        // ✅ UPDATE QUIZ & QUESTIONS
        quiz: {
          upsert:
            data.quiz?.map((q) => ({
              where: { id: q.id || "" },
              update: {
                quiz_title: q.quiz_title,
                quiz_description: q.quiz_description,
                quiz_duration: q.quiz_duration,
                quiz_score: q.quiz_score,

                quiz: {
                  upsert:
                    q.questions?.map((ques) => ({
                      where: { id: ques.id || "" },
                      update: { question_name: ques.question_name },
                      create: { question_name: ques.question_name! },
                    })) as any,
                },
              },
              create: {
                quiz_title: q.quiz_title!,
                quiz_description: q.quiz_description!,
                quiz_duration: q.quiz_duration!,
                quiz_score: q.quiz_score!,
              },
            })) as any,
        },
      },
    });

    return {
      message: "Course and relations updated successfully ✅",
      course: updateCourse,
    };
  }

  @Security("bearerAuth")
  @Delete("delete-course/{id}")
  public async DeleteCourse(@Path() id: string) {
    const deleteCourse = await prisma.course.delete({
      where: { id },
    });

    this.setStatus(200);
    return {
      message: `Course deleted successfully, course deleted: ${deleteCourse}`,
    };
  }

  @Post("/create-module")
  public async CreateModule(
    @Body() body: Omit<Module, "id">,
    @Request() data: Course
  ): Promise<any> {
    const createModule = await prisma.course.update({
      where: {
        id: data.id,
      },
      data: {
        module: { ...(body as any) },
      },
    });

    this.setStatus(200);
    return {
      message: "Module created successfully.",
      data: createModule.course_title,
    };
  }

  @Get("/get-modules")
  public async GetModules(@Request() req: any): Promise<any> {
    const module = await prisma.module.findMany();
    this.setStatus(200);
    return {
      message: "Modules fetched successfully",
      data: module,
    };
  }

  @Get("/get-module/{courseId}/{moduleId}")
  public async GetModuleById(
    @Path() moduleId: string,
    @Path() courseId: string
  ): Promise<any> {
    const getModuleById = await prisma.module.findUnique({
      where: { id: moduleId, courseId: courseId },
    });

    this.setStatus(200);
    return {
      message: "Get module by Id",
      data: getModuleById,
    };
  }

  @Put("/update-module/{id}")
  public async UpdateModule(
    @Path() id: string,
    @Body() course: Course
  ): Promise<any> {
    const updateModule = await prisma.course.update({
      where: { id: id },
      data: {
        module: {
          upsert: course.module?.map((m) => ({
            where: { id: m.id || null },
            update: {
              ...m,
            },
            create: {
              ...m,
            },
          })) as any,
        },
      },
    });

    this.setStatus(200);
    return {
      message: "Module updated succfully",
      data: updateModule.course_title,
    };
  }

  @Delete("/delete-module/{id}")
  public async DeleteModule(@Path() id: string) {
    const deleteModule = await prisma.module.delete({
      where: {
        id,
      },
    });

    this.setStatus(200);
    return {
      message: "Module deleted Successfully",
      data: `Deleted Module ${deleteModule.id}`,
    };
  }

 @Post("/create-quiz")
public async CreateQuiz(
  @Body() body: {
    title: string;
    description?: string;
    courseId: string;
    duration?: number;
    passingScore?: number;
    maxAttempts?: number;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
      points?: number;
      order: number;
    }>;
  }
): Promise<any> {
  try {
    const newQuiz = await prisma.quiz.create({
      data: {
        title: body.title,
        description: body.description,
        courseId: body.courseId,
        duration: body.duration,
        passingScore: body.passingScore || 70,
        maxAttempts: body.maxAttempts || 3,
        questions: {
          create: body.questions.map(question => ({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            points: question.points || 1,
            order: question.order,
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            points: true
            // Don't include correctAnswer for security
          }
        },
        course: {
          select: {
            id: true,
            course_title: true
          }
        }
      }
    });

    this.setStatus(201);
    return {
      message: "Quiz created successfully",
      data: newQuiz
    };
  } catch (error: any) {
    this.setStatus(500);
    return {
      message: "Failed to create quiz",
      error: error.message
    };
  }
}

@Put("/update-quiz/{quizId}")
public async UpdateQuiz(
  @Path() quizId: string,
  @Body() body: {
    title?: string;
    description?: string;
    duration?: number;
    passingScore?: number;
    maxAttempts?: number;
    questions?: Array<{
      id?: string; // For existing questions
      question: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
      points?: number;
      order: number;
    }>;
  }
): Promise<any> {
  try {
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        passingScore: body.passingScore,
        maxAttempts: body.maxAttempts,
        questions: body.questions ? {
          // Delete questions not in the update list
          deleteMany: {
            id: {
              notIn: body.questions.map(q => q.id).filter(Boolean) as string[]
            }
          },
          // Upsert questions
          upsert: body.questions.map(question => ({
            where: { id: question.id || "" },
            update: {
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              points: question.points || 1,
              order: question.order,
            },
            create: {
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              points: question.points || 1,
              order: question.order,
            }
          }))
        } : undefined
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            points: true
          }
        }
      }
    });

    this.setStatus(200);
    return {
      message: "Quiz updated successfully",
      data: updatedQuiz
    };
  } catch (error: any) {
    this.setStatus(500);
    return {
      message: "Failed to update quiz",
      error: error.message
    };
  }
}

@Get("/get-quizes")
public async GetQuizzes(): Promise<any> {
  const getQuizzes = await prisma.quiz.findMany({
    include: {
      course: {
        select: {
          id: true,
          course_title: true
        }
      },
      questions: {
        select: {
          id: true,
          question: true,
          order: true,
          points: true
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: {
          questions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  this.setStatus(200);
  return {
    message: "All quizzes fetched successfully.",
    data: getQuizzes,
  };
}

@Get("/get-quiz/{courseId}/{quizId}")
public async GetQuizById(
  @Path() courseId: string,
  @Path() quizId: string
): Promise<any> {
  const quiz = await prisma.quiz.findFirst({
    where: { 
      id: quizId,
      courseId: courseId 
    },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          question: true,
          options: true,
          explanation: true,
          points: true,
          order: true
          // EXCLUDE correctAnswer for security
        }
      },
      course: {
        select: {
          id: true,
          course_title: true,
          course_description: true
        }
      }
    }
  });

  if (!quiz) {
    this.setStatus(404);
    return { message: "Quiz not found in this course" };
  }

  this.setStatus(200);
  return {
    message: "Quiz fetched successfully",
    data: quiz
  };
}

// Get all quizzes for a specific course
@Get("/get-course-quizzes/{courseId}")
public async GetCourseQuizzes(@Path() courseId: string): Promise<any> {
  const quizzes = await prisma.quiz.findMany({
    where: { courseId: courseId },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          order: true,
          points: true
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: {
          questions: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  this.setStatus(200);
  return {
    message: "Course quizzes fetched successfully",
    data: quizzes,
    count: quizzes.length
  };
}

@Delete("/delete-quiz/{id}")
public async DeleteQuiz(@Path() id: string): Promise<any> {
  try {
    const deleteQuiz = await prisma.quiz.delete({
      where: { id },
    });

    this.setStatus(200);
    return {
      message: "Quiz deleted successfully",
      data: { deletedQuizId: deleteQuiz.id },
    };
  } catch (error: any) {
    if (error.code === 'P2025') {
      this.setStatus(404);
      return { message: "Quiz not found" };
    }
    this.setStatus(500);
    return {
      message: "Failed to delete quiz",
      error: error.message
    };
  }
}
}
