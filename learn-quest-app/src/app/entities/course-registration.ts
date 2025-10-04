import {Entity} from './entity';
import {Course} from './course';

export class CourseRegistration extends Entity {
  courseId: number = 0;
  userId: number = 0;
  course: Course = new Course();
}
