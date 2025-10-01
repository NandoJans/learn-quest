# QuestionOption API

## Overview
This document describes the QuestionOption API endpoint that allows fetching question options for a specific lesson section separately from the main lesson section data.

## Endpoint

### GET /api/question_option/index

Fetches all question options for a specific lesson section.

#### Query Parameters

- `lessonSectionId` (required): The ID of the lesson section
- `orderBy` (optional): Sort field, defaults to 'position'. Options: 'position', 'id'
- `order` (optional): Sort direction, defaults to 'ASC'. Options: 'ASC', 'DESC'

#### Example Request

```
GET /api/question_option/index?lessonSectionId=123
```

#### Example Response

```json
[
  {
    "id": 1,
    "lessonSectionId": 123,
    "optionText": "Paris",
    "position": 0
  },
  {
    "id": 2,
    "lessonSectionId": 123,
    "optionText": "London",
    "position": 1
  },
  {
    "id": 3,
    "lessonSectionId": 123,
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
this.questionOptionService.fetchQuestionOptions(lessonSectionId).subscribe(options => {
  console.log('Question options:', options);
});
```

### Example Implementation

See `lesson-registration.component.ts` for a complete example of how to fetch question options separately when loading lesson sections.

## Notes

- The LessonSection DTO still includes questionOptions for backward compatibility
- Clients can choose to use either the embedded options or fetch them separately using this endpoint
- The endpoint requires authentication (ROLE_ADMIN, ROLE_TEACHER, or ROLE_STUDENT)
