import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonSectionService } from '../../../services/entity/lesson-section.service';
import { LessonSectionAnswerService } from '../../../services/entity/lesson-section-answer.service';
import { LessonService } from '../../../services/entity/lesson.service';
import { LessonSection } from '../../../entities/lesson-section';
import { Lesson } from '../../../entities/lesson';
import { PrimaryButtonComponent } from '../../../components/buttons/primary-button/primary-button.component';

interface SectionState {
  section: LessonSection;
  userAnswer: string;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  showExplanation: boolean;
  correctAnswer?: string;
  explanation?: string;
}

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PrimaryButtonComponent],
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.css']
})
export class LessonDetailComponent implements OnInit {
  lessonId!: number;
  lesson?: Lesson;
  sectionStates: SectionState[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private lessonService: LessonService,
    private sectionService: LessonSectionService,
    private answerService: LessonSectionAnswerService
  ) {}

  ngOnInit(): void {
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.loadLesson();
  }

  private loadLesson(): void {
    // Load lesson data
    this.lessonService.loadLessons({ id: this.lessonId });
    const lessons = this.lessonService.getLessons({ id: this.lessonId });
    if (lessons.length > 0) {
      this.lesson = lessons[0];
    }

    // Load sections
    this.sectionService.loadSections({ lessonId: this.lessonId }, true);
    const sections = this.sectionService.getSections({ lessonId: this.lessonId });
    
    // Sort by position
    sections.sort((a, b) => a.position - b.position);
    
    // Initialize section states
    this.sectionStates = sections.map(section => ({
      section,
      userAnswer: '',
      isSubmitted: false,
      isCorrect: null,
      showExplanation: false
    }));

    // Load existing answers for questions
    this.loadExistingAnswers();
    
    this.loading = false;
  }

  private loadExistingAnswers(): void {
    this.sectionStates.forEach((state, index) => {
      if (state.section.type === 'question') {
        this.answerService.getUserAnswer(state.section.id!).subscribe({
          next: (answer) => {
            if (answer) {
              this.sectionStates[index].userAnswer = answer.answer;
              this.sectionStates[index].isSubmitted = true;
              this.sectionStates[index].isCorrect = answer.isCorrect;
            }
          }
        });
      }
    });
  }

  submitAnswer(index: number): void {
    const state = this.sectionStates[index];
    const section = state.section;
    
    let answerToSubmit = state.userAnswer;
    
    // For checkbox, convert array to JSON string
    if (section.questionInputType === 'checkbox') {
      // userAnswer might already be a string, so handle both cases
      if (typeof state.userAnswer === 'string') {
        answerToSubmit = state.userAnswer;
      }
    }

    this.answerService.submitAnswer(section.id!, answerToSubmit).subscribe({
      next: (response) => {
        this.sectionStates[index].isSubmitted = true;
        this.sectionStates[index].isCorrect = response.isCorrect;
        this.sectionStates[index].explanation = response.explanation;
        this.sectionStates[index].correctAnswer = response.correctAnswer;
        
        // Show explanation automatically if incorrect
        if (!response.isCorrect) {
          this.sectionStates[index].showExplanation = true;
        }
      },
      error: (err) => {
        console.error('Error submitting answer:', err);
        alert('Error submitting answer. Please try again.');
      }
    });
  }

  toggleExplanation(index: number): void {
    this.sectionStates[index].showExplanation = !this.sectionStates[index].showExplanation;
  }

  onCheckboxChange(index: number, answer: string, checked: boolean): void {
    const state = this.sectionStates[index];
    const currentAnswers = state.userAnswer ? JSON.parse(state.userAnswer) : [];
    
    if (checked && !currentAnswers.includes(answer)) {
      currentAnswers.push(answer);
    } else if (!checked) {
      const idx = currentAnswers.indexOf(answer);
      if (idx !== -1) {
        currentAnswers.splice(idx, 1);
      }
    }
    
    this.sectionStates[index].userAnswer = JSON.stringify(currentAnswers);
  }

  isCheckboxChecked(index: number, answer: string): boolean {
    const state = this.sectionStates[index];
    if (!state.userAnswer) return false;
    
    try {
      const currentAnswers = JSON.parse(state.userAnswer);
      return Array.isArray(currentAnswers) && currentAnswers.includes(answer);
    } catch {
      return false;
    }
  }

  goBack(): void {
    this.router.navigate(['/user/courses']);
  }
}
