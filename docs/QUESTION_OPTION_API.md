# QuestionOption API

## Overview
This document describes how to fetch question options using the generic entity API endpoint.

## Endpoint

### GET /api/question_option/index

Fetches question options using the generic entity index route with flexible filtering.

#### Query Parameters

You can filter by any property of the QuestionOption entity:

- `lessonSection` - Filter by lesson section ID
- `lesson` - Filter by lesson ID (allows fetching all question options for a lesson at once)
- Any other entity property

#### Example Requests

**Fetch question options by lesson section:**
```
GET /api/question_option/index?lessonSection=123
```

**Fetch all question options for a lesson:**
```
GET /api/question_option/index?lesson=456
```

#### Example Response

```json
[
  {
    "id": 1,
    "lessonSectionId": 123,
    "lessonId": 456,
    "optionText": "Paris",
    "position": 0
  },
  {
    "id": 2,
    "lessonSectionId": 123,
    "lessonId": 456,
    "optionText": "London",
    "position": 1
  },
  {
    "id": 3,
    "lessonSectionId": 123,
    "lessonId": 456,
    "optionText": "Berlin",
    "position": 2
  }
]
```

## Frontend Usage

### Using the QuestionOptionService

```typescript
import { QuestionOptionService } from './services/entity/question-option.service';

constructor(private questionOptionService: QuestionOptionService) {}

// Fetch question options for a specific lesson section
this.questionOptionService.fetchQuestionOptionsByLessonSection(lessonSectionId).subscribe(options => {
  console.log('Question options for section:', options);
});

// Fetch all question options for a lesson
this.questionOptionService.fetchQuestionOptionsByLesson(lessonId).subscribe(options => {
  console.log('All question options for lesson:', options);
});
```

### Example Implementation

See `lesson-registration.component.ts` for a complete example of how to fetch question options separately when loading lesson sections.

## Notes

- Uses the generic entity/index route for consistent API patterns
- The QuestionOption entity includes both `lessonSection` and `lesson` properties
- Allows fetching all question options for a lesson at once for improved performance
- The LessonSection DTO still includes questionOptions for backward compatibility
- Clients can choose to use either the embedded options or fetch them separately using this endpoint
